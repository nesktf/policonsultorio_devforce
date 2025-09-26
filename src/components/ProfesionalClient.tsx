'use client';

import { useState, useEffect } from 'react';
import type { Profesional, ObraSocial, ProfesionalObraSocial } from '@/generated/prisma';
import { RegistrarProfesionalModal, type DatosProfesionalFormulario } from '../components/RegistrarProfesionalModal';

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
  especialidades: string[];
}

function buildGETQuery(nombre?: string, especialidad?: string, obraSocialId?: string): string {
  const params = new URLSearchParams();
  
  if (nombre && nombre.trim() !== '') {
    params.append('nombre', nombre.trim());
  }
  
  if (especialidad && especialidad !== 'TODAS') {
    params.append('especialidad', especialidad);
  }
  
  if (obraSocialId && obraSocialId !== '0') {
    params.append('obra_social_id', obraSocialId);
  }

  const queryString = params.toString();
  return `/api/v1/profesionales${queryString ? '?' + queryString : ''}`;
}

export function ProfesionalClient({ 
  profesionalesIniciales, 
  obrasSociales,
  especialidades
}: ProfesionalClientProps) {
  const [profesionales, setProfesionales] = useState(profesionalesIniciales);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Estados para filtros y búsqueda
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedEspecialidad, setSelectedEspecialidad] = useState<string>('TODAS');
  const [selectedObraSocial, setSelectedObraSocial] = useState<string>('0');

  const queryProfesionales = async (nombre?: string, especialidad?: string, obraSocialId?: string) => {
    setLoading(true);
    try {
      const response = await fetch(buildGETQuery(nombre, especialidad, obraSocialId), {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Error al obtener profesionales');
      }

      const data = await response.json();
      setProfesionales(data);
    } catch (error) {
      console.error('Error al buscar profesionales:', error);
      setProfesionales([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    queryProfesionales(term, selectedEspecialidad, selectedObraSocial);
  };

  const handleEspecialidadChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const especialidad = e.target.value;
    setSelectedEspecialidad(especialidad);
    queryProfesionales(searchTerm, especialidad, selectedObraSocial);
  };

  const handleObraSocialChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const obraSocialId = e.target.value;
    setSelectedObraSocial(obraSocialId);
    queryProfesionales(searchTerm, selectedEspecialidad, obraSocialId);
  };

  const manejarCrearProfesional = async (datos: DatosProfesionalFormulario) => {
    try {
      const response = await fetch('/api/v1/profesionales', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(datos),
      });

      if (!response.ok) {
        const errorData = await response.json();
        
        // Crear un error con el mensaje del servidor
        const error = new Error(errorData.error || 'Error al registrar profesional');
        throw error;
      }

      // Recargar la lista después de crear
      await queryProfesionales(searchTerm, selectedEspecialidad, selectedObraSocial);
    } catch (error) {
      console.error('Error al crear profesional:', error);
      throw error; // Re-lanzar el error para que el modal lo maneje
    }
  };

  return (
    <div className="p-6 bg-[#E4F1F9] min-h-screen">
      <div className="flex flex-col gap-6 mb-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-[#0AA2C7]">Listado de Profesionales</h2>
          <button 
            onClick={() => setModalAbierto(true)}
            className="px-4 py-2 text-sm text-white bg-[#18AEFB] rounded-lg hover:bg-[#4D94C8] focus:outline-none focus:ring-2 focus:ring-[#0AA2C7] transition-colors"
          >
            Registrar nuevo profesional
          </button>
        </div>

        {/* Barra de búsqueda y filtros */}
        <div className="flex items-center gap-4">
          {/* Barra de búsqueda por nombre/apellido */}
          <div className="flex-1">
            <div className="relative w-full max-w-xl">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-[#4D94C8]" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Buscar por nombre o apellido"
                value={searchTerm}
                onChange={handleSearch}
                className="w-full pl-10 pr-4 py-2.5 text-sm text-gray-900 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 transition-all duration-200"
              />
            </div>
          </div>

          {/* Filtro por especialidad */}
          <select
            className="px-4 py-2 text-sm text-white bg-blue-500 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={selectedEspecialidad}
            onChange={handleEspecialidadChange}
            disabled={loading}
          >
            <option value="TODAS">Todas las especialidades</option>
            {especialidades.map((especialidad) => (
              <option key={especialidad} value={especialidad}>
                {especialidad}
              </option>
            ))}
          </select>

          {/* Filtro por obra social */}
          <select
            className="px-4 py-2 text-sm text-white bg-blue-500 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={selectedObraSocial}
            onChange={handleObraSocialChange}
            disabled={loading}
          >
            <option value="0">Todas las obras sociales</option>
            {obrasSociales.map((obraSocial) => (
              <option key={obraSocial.id} value={obraSocial.id.toString()}>
                {obraSocial.nombre}
              </option>
            ))}
          </select>
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
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-6 py-8 text-center text-gray-500">
                    Cargando profesionales...
                  </td>
                </tr>
              ) : profesionales.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-8 text-center text-gray-500">
                    No se encontraron profesionales con los criterios seleccionados
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