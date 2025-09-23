'use client';

import { useState } from 'react';
import type { Paciente, ObraSocial } from '@/generated/prisma';
import { PatientSearch } from '@/components/PatientSearch';
import { RegisterPatientModal } from '@/components/RegisterPatientModal';
import { createPatient } from '@/app/actions/patients';

type PacienteWithObraSocial = Paciente & {
  obra_social: ObraSocial | null;
};

export function PacientesClient({ 
  initialPacientes, 
  obrasSociales 
}: { 
  initialPacientes: PacienteWithObraSocial[];
  obrasSociales: ObraSocial[];
}) {
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pacientes, setPacientes] = useState(initialPacientes);

  const handleClearFilter = () => {
    setSelectedPatientId(null);
  };

  const filteredPacientes = selectedPatientId
    ? initialPacientes.filter(p => p.id === selectedPatientId)
    : initialPacientes;

  return (
    <div className="p-6">
      <div className="flex flex-col gap-6 mb-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Listado de Pacientes</h2>
          {selectedPatientId && (
            <button
              onClick={handleClearFilter}
              className="px-4 py-2 text-sm text-white bg-blue-500 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Mostrar todos los pacientes
            </button>
          )}
        </div>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <PatientSearch
              patients={pacientes.map(p => ({ id: p.id, apellido: p.apellido, dni: p.dni }))}
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
            setPacientes(prev => [...prev, newPatient]);
          }}
        />
      </div>

      <div className="bg-white rounded-xl shadow-lg border-2 border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-sm border-b-2 border-gray-200 bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-4 font-bold text-gray-900">Nombre</th>
                <th scope="col" className="px-6 py-4 font-bold text-gray-900">Apellido</th>
                <th scope="col" className="px-6 py-4 font-bold text-gray-900">DNI</th>
                <th scope="col" className="px-6 py-4 font-bold text-gray-900">Obra Social</th>
                <th scope="col" className="px-6 py-4 font-bold text-gray-900">Teléfono</th>
              </tr>
            </thead>
            <tbody>
              {filteredPacientes.map((paciente) => (
                <tr key={paciente.id} className="border-b border-gray-200 hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">{paciente.nombre}</td>
                  <td className="px-6 py-4 text-gray-900">{paciente.apellido}</td>
                  <td className="px-6 py-4 text-gray-900">{paciente.dni}</td>
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
                  <td className="px-6 py-4 text-gray-600">{paciente.telefono}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}