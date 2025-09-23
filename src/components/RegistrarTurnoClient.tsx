// src/components/RegistrarTurnoClient.tsx

'use client';

import { useState } from 'react';
// CAMBIO AQUÍ: Quitamos 'Especialidad' porque no existe como un tipo separado.
import type { Paciente, Profesional } from '@/generated/prisma';

interface RegistrarTurnoProps {
  pacientes: { id: number; apellido: string; dni: string }[];
  // CAMBIO AQUÍ: La forma de las especialidades ahora es un objeto con un string.
  especialidades: { especialidad: string }[];
}

export function RegistrarTurnoClient({ pacientes, especialidades }: RegistrarTurnoProps) {
  const [pacienteId, setPacienteId] = useState<string>('');
  // CAMBIO AQUÍ: Ahora guardamos el nombre de la especialidad, no un ID.
  const [especialidad, setEspecialidad] = useState<string>('');
  const [profesionalId, setProfesionalId] = useState<string>('');
  const [horario, setHorario] = useState<string>('');

  const [profesionales, setProfesionales] = useState<Profesional[]>([]);
  const [horarios, setHorarios] = useState<string[]>([]);

  const handleEspecialidadChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nuevaEspecialidad = e.target.value;
    setEspecialidad(nuevaEspecialidad);
    
    setProfesionalId('');
    setHorario('');
    setProfesionales([]);
    setHorarios([]);

    if (nuevaEspecialidad) {
      // TODO: Aquí haremos una llamada a una API para buscar los profesionales.
      console.log(`Buscando profesionales para la especialidad: ${nuevaEspecialidad}`);
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    // TODO: Llamar a la función para guardar el turno en la base de datos.
    alert(`Turno registrado para paciente ID: ${pacienteId} con el profesional ID: ${profesionalId} a las ${horario}`);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Registrar un Nuevo Turno</h2>
      </div>

      <div className="bg-white rounded-xl shadow-lg border-2 border-gray-200 p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div>
            <label htmlFor="paciente" className="block text-sm font-bold text-gray-700 mb-1">
              Paciente
            </label>
            <select
              id="paciente"
              value={pacienteId}
              onChange={(e) => setPacienteId(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg"
              required
            >
              <option value="">-- Seleccione un paciente --</option>
              {pacientes.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.apellido} ({p.dni})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="especialidad" className="block text-sm font-bold text-gray-700 mb-1">
              Especialidad
            </label>
            <select
              id="especialidad"
              // CAMBIO AQUÍ: El valor es el nombre de la especialidad
              value={especialidad}
              onChange={handleEspecialidadChange}
              className="w-full p-3 border border-gray-300 rounded-lg"
              disabled={!pacienteId}
              required
            >
              <option value="">-- Seleccione una especialidad --</option>
              {/* CAMBIO AQUÍ: Mapeamos la nueva estructura de especialidades */}
              {especialidades.map((e, index) => (
                <option key={index} value={e.especialidad}>
                  {e.especialidad}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="profesional" className="block text-sm font-bold text-gray-700 mb-1">
              Profesional Disponible
            </label>
            <select
              id="profesional"
              value={profesionalId}
              onChange={(e) => setProfesionalId(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg"
              disabled={!especialidad || profesionales.length === 0}
              required
            >
              <option value="">-- Seleccione un profesional --</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="horario" className="block text-sm font-bold text-gray-700 mb-1">
              Horario Disponible
            </label>
            <select
              id="horario"
              value={horario}
              onChange={(e) => setHorario(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg"
              disabled={!profesionalId || horarios.length === 0}
              required
            >
              <option value="">-- Seleccione un horario --</option>
            </select>
          </div>

          <div className="text-right pt-4">
            <button
              type="submit"
              className="px-6 py-3 text-sm font-bold text-white bg-green-500 rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              Confirmar Turno
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}