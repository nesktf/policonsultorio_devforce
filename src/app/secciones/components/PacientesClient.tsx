"use client";

import { useState } from "react";
import type { Paciente, ObraSocial } from "@/generated/prisma";
import { PatientSearch } from "../components/PatientSearch";
import { RegisterPatientModal } from "../components/RegisterPatientModal";
import { HistoriaClinicaModal } from "../components/HistoriaClinicaModal";
import { createPatient } from "../actions/patients";
import { getHistoriaClinica } from "../actions/historia-clinica";

type PacienteWithObraSocial = Paciente & {
  obra_social: ObraSocial | null;
};

export function PacientesClient({
  initialPacientes,
  obrasSociales,
}: {
  initialPacientes: PacienteWithObraSocial[];
  obrasSociales: ObraSocial[];
}) {
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pacientes, setPacientes] = useState(initialPacientes);
  const [selectedHistoria, setSelectedHistoria] = useState<any>(null);
  const [isHistoriaModalOpen, setIsHistoriaModalOpen] = useState(false);

  const onSelectHistoriaClinica = async (pacienteId: number) => {
    try {
      console.log("Obteniendo historia clínica para paciente:", pacienteId);
      const historia = await getHistoriaClinica(pacienteId);
      console.log("Historia clínica obtenida:", historia);
      setSelectedHistoria(historia);
      setIsHistoriaModalOpen(true);
      console.log("Modal abierto");
    } catch (error) {
      console.error("Error al obtener historia clínica:", error);
    }
  };

  const handleClearFilter = () => {
    setSelectedPatientId(null);
  };

  const filteredPacientes = selectedPatientId
    ? initialPacientes.filter((p) => p.id === selectedPatientId)
    : initialPacientes;

  return (
    <div className="p-6 bg-[#E4F1F9]">
      <div className="flex flex-col gap-6 mb-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-[#0AA2C7]">
            Listado de Pacientes
          </h2>
          {selectedPatientId && (
            <button
              onClick={handleClearFilter}
              className="px-4 py-2 text-sm text-white bg-[#18AEFB] rounded-lg hover:bg-[#4D94C8] focus:outline-none focus:ring-2 focus:ring-[#0AA2C7] transition-colors"
            >
              Mostrar todos los pacientes
            </button>
          )}
        </div>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <PatientSearch
              patients={pacientes.map((p) => ({
                id: p.id,
                apellido: p.apellido,
                dni: p.dni,
              }))}
              onSelect={setSelectedPatientId}
            />
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 text-sm text-white bg-blue-500 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Registrar un nuevo paciente
          </button>
        </div>

        <RegisterPatientModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          obrasSociales={obrasSociales}
          onSubmit={async (data) => {
            const newPatient = await createPatient(data);
            setPacientes((prev) => [...prev, newPatient]);
          }}
        />
      </div>

      <div className="bg-white rounded-xl shadow-lg border-2 border-[#AFE1EA]">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-sm border-b-2 border-[#AFE1EA] bg-[#E4F1F9]">
              <tr>
                <th scope="col" className="px-6 py-4 font-bold text-[#0AA2C7]">
                  Nombre
                </th>
                <th scope="col" className="px-6 py-4 font-bold text-[#0AA2C7]">
                  Apellido
                </th>
                <th scope="col" className="px-6 py-4 font-bold text-[#0AA2C7]">
                  DNI
                </th>
                <th scope="col" className="px-6 py-4 font-bold text-[#0AA2C7]">
                  Dirección
                </th>
                <th scope="col" className="px-6 py-4 font-bold text-[#0AA2C7]">
                  Fecha Nac.
                </th>
                <th scope="col" className="px-6 py-4 font-bold text-[#0AA2C7]">
                  Obra Social
                </th>
                <th scope="col" className="px-6 py-4 font-bold text-[#0AA2C7]">
                  N° Obra Social
                </th>
                <th scope="col" className="px-6 py-4 font-bold text-[#0AA2C7]">
                  Teléfono
                </th>
                <th scope="col" className="px-6 py-4 font-bold text-[#0AA2C7]">
                  Historia Clínica
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredPacientes.map((paciente) => (
                <tr
                  key={paciente.id}
                  className="border-b border-gray-200 hover:bg-gray-50/50 transition-colors"
                >
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {paciente.nombre}
                  </td>
                  <td className="px-6 py-4 text-gray-900">
                    {paciente.apellido}
                  </td>
                  <td className="px-6 py-4 text-gray-900">{paciente.dni}</td>
                  <td className="px-6 py-4 text-gray-900">
                    {paciente.direccion}
                  </td>
                  <td className="px-6 py-4 text-gray-900">
                    {new Date(paciente.fecha_nacimiento).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    {paciente.obra_social?.nombre ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700">
                        {paciente.obra_social.nombre}
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                        Sin obra social
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-gray-900">
                    {paciente.num_obra_social || "-"}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {paciente.telefono}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => onSelectHistoriaClinica(paciente.id)}
                      className="p-2 text-[#4D94C8] hover:text-[#0AA2C7] hover:bg-[#E4F1F9] rounded-full transition-colors"
                      title="Ver Historia Clínica"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Historia Clínica */}
      <HistoriaClinicaModal
        isOpen={isHistoriaModalOpen}
        onClose={() => setIsHistoriaModalOpen(false)}
        historia={selectedHistoria || []}
      />
    </div>
  );
}
