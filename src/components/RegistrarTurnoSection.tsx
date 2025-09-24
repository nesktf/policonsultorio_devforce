// src/components/RegistrarTurnoSection.tsx

'use client';

import { useEffect, useState } from 'react';
import { RegistrarTurnoClient } from './RegistrarTurnoClient';

interface RegistrarTurnoSectionProps {
  pacientes: { id: number; nombre: string; apellido: string; dni: string }[];
  especialidades: { especialidad: string }[];
  turnosIniciales: { id: number; paciente: string; profesional: string; fechaIso: string }[];
}

export function RegistrarTurnoSection({ pacientes, especialidades, turnosIniciales }: RegistrarTurnoSectionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [turnos, setTurnos] = useState(() =>
    [...turnosIniciales].sort((a, b) => new Date(a.fechaIso).getTime() - new Date(b.fechaIso).getTime())
  );

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  return (
    <div className="p-6 bg-[#E4F1F9] space-y-6">
      <div className="flex flex-col gap-4 mb-2">
        <h2 className="text-2xl font-bold text-[#0AA2C7]">Listado de Turnos</h2>
        <div>
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="px-4 py-2 text-sm text-white bg-[#18AEFB] rounded-lg hover:bg-[#4D94C8] focus:outline-none focus:ring-2 focus:ring-[#0AA2C7] cursor-pointer transition-colors"
          >
            Registrar un nuevo turno
          </button>
        </div>
      </div>

      {!isOpen ? null : (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 p-4">
          <div className="relative w-full max-w-5xl rounded-2xl bg-white shadow-lg">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <h3 className="text-lg font-semibold text-black">Registrar un nuevo turno</h3>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Cerrar formulario"
              >
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>

            <div className="max-h-[80vh] overflow-y-auto px-6 py-4">
              <RegistrarTurnoClient
                pacientes={pacientes}
                especialidades={especialidades}
                onTurnoRegistrado={({ id, fechaIso, paciente, profesional }) => {
                  setTurnos((prev) => {
                    const sinDuplicados = prev.filter((turno) => turno.id !== id);
                    return [
                      ...sinDuplicados,
                      { id, paciente, profesional, fechaIso },
                    ].sort((a, b) => new Date(a.fechaIso).getTime() - new Date(b.fechaIso).getTime());
                  });
                }}
                onCloseModal={() => setIsOpen(false)}
              />
            </div>
          </div>
        </div>
      )}

      <section className="bg-white rounded-xl shadow-lg border-2 border-[#AFE1EA]">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-sm border-b-2 border-[#AFE1EA] bg-[#E4F1F9]">
              <tr>
                <th scope="col" className="px-6 py-4 font-bold text-[#0AA2C7]">ID</th>
                <th scope="col" className="px-6 py-4 font-bold text-[#0AA2C7]">Paciente</th>
                <th scope="col" className="px-6 py-4 font-bold text-[#0AA2C7]">Profesional</th>
                <th scope="col" className="px-6 py-4 font-bold text-[#0AA2C7]">Fecha</th>
                <th scope="col" className="px-6 py-4 font-bold text-[#0AA2C7]">Hora</th>
              </tr>
            </thead>
            <tbody>
              {turnos.length > 0 ? (
                turnos.map((turno) => {
                  const timeZone = 'America/Argentina/Buenos_Aires';
                  const fechaDate = new Date(turno.fechaIso);
                  const fecha = new Intl.DateTimeFormat('es-AR', {
                    timeZone,
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                  }).format(fechaDate);
                  const hora = new Intl.DateTimeFormat('es-AR', {
                    timeZone,
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false,
                  }).format(fechaDate);

                  return (
                    <tr key={turno.id} className="border-b border-gray-200 hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900">{turno.id}</td>
                      <td className="px-6 py-4 text-gray-900">{turno.paciente}</td>
                      <td className="px-6 py-4 text-gray-900">{turno.profesional}</td>
                      <td className="px-6 py-4 text-gray-900">{fecha}</td>
                      <td className="px-6 py-4 text-gray-600">{hora}</td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td className="px-6 py-6 text-center text-sm text-gray-500" colSpan={5}>
                    Aún no hay turnos registrados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
