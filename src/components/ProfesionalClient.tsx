'use client';

import { useState } from 'react';
import type { Profesional, ObraSocial, ProfesionalObraSocial } from '@/generated/prisma';
import { RegistrarProfesionalModal, type DatosProfesionalFormulario } from '../components/RegistrarProfesionalModal';
import { crearProfesional } from '@/prisma/profesional';

type ProfesionalConRelaciones = Profesional & {
  obras_sociales: (ProfesionalObraSocial & {
    obra_social: ObraSocial;
  })[];
  _count: {
    turnos: number;
    historias: number;
  };
};

interface ProfesionalClientProps {
  profesionalesIniciales: ProfesionalConRelaciones[];
  obrasSociales: ObraSocial[];
}

export function ProfesionalClient({ 
  profesionalesIniciales, 
  obrasSociales 
}: ProfesionalClientProps) {
  const [profesionales, setProfesionales] = useState(profesionalesIniciales);
  const [modalAbierto, setModalAbierto] = useState(false);

  const manejarCrearProfesional = async (datos: DatosProfesionalFormulario) => {
  try {
    const nuevoProfesional = await crearProfesional(datos);
    setProfesionales(prev => [...prev, nuevoProfesional]);
  } catch (error) {
    console.error('Error al crear profesional:', error);
    throw error;
  }
};

  return (
    <div className="p-6 bg-[#E4F1F9] min-h-screen">
      <div className="flex flex-col gap-6 mb-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-[#0AA2C7]">Listado de Profesionales</h2>
          <button 
            onClick={() => setModalAbierto(true)}
            className="px-4 py-2 text-sm text-white bg-blue-500 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          >
            Registrar nuevo profesional
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg border-2 border-[#AFE1EA]">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-sm border-b-2 border-[#AFE1EA] bg-[#E4F1F9]">
              <tr>
                <th scope="col" className="px-6 py-4 font-bold text-[#0AA2C7]">ID</th>
                <th scope="col" className="px-6 py-4 font-bold text-[#0AA2C7]">Nombre Completo</th>
                <th scope="col" className="px-6 py-4 font-bold text-[#0AA2C7]">DNI</th>
                <th scope="col" className="px-6 py-4 font-bold text-[#0AA2C7]">Especialidad</th>
                <th scope="col" className="px-6 py-4 font-bold text-[#0AA2C7]">Teléfono</th>
                <th scope="col" className="px-6 py-4 font-bold text-[#0AA2C7]">Dirección</th>
                <th scope="col" className="px-6 py-4 font-bold text-[#0AA2C7]">Obras Sociales</th>
                <th scope="col" className="px-6 py-4 font-bold text-[#0AA2C7] text-center">Turnos</th>
                <th scope="col" className="px-6 py-4 font-bold text-[#0AA2C7] text-center">Historias</th>
              </tr>
            </thead>
            <tbody>
              {profesionales.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-8 text-center text-gray-500">
                    No hay profesionales registrados
                  </td>
                </tr>
              ) : (
                profesionales.map((profesional) => (
                  <tr key={profesional.id} className="border-b border-gray-200 hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {profesional.id}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">
                        {profesional.nombre} {profesional.apellido}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-900">
                      {profesional.dni}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#AFE1EA] text-[#0AA2C7]">
                        {profesional.especialidad}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-900">
                      {profesional.telefono}
                    </td>
                    <td className="px-6 py-4 text-gray-900">
                      <div className="max-w-xs truncate" title={profesional.direccion}>
                        {profesional.direccion}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {profesional.obras_sociales.length === 0 ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                            Sin obras sociales
                          </span>
                        ) : (
                          profesional.obras_sociales.map((rel, index) => (
                            <span 
                              key={index}
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700"
                            >
                              {rel.obra_social.nombre}
                            </span>
                          ))
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#E4F1F9] text-[#4D94C8]">
                        {profesional._count.turnos}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-50 text-purple-700">
                        {profesional._count.historias}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <RegistrarProfesionalModal
        isOpen={modalAbierto}
        onClose={() => setModalAbierto(false)}
        obrasSociales={obrasSociales}
        onSubmit={manejarCrearProfesional}
      />
    </div>
  );
}
