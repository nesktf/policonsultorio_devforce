'use client';

import { useState } from 'react';
import type { Paciente } from '@/generated/prisma';

type PatientSearchProps = {
  onSelect: (pacienteId: number | null) => void;
  patients: Array<{
    id: number;
    apellido: string;
    dni: string;
  }>;
};

export function PatientSearch({ onSelect, patients }: PatientSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  const filteredPatients = patients.filter((patient) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      patient.apellido.toLowerCase().includes(searchLower) ||
      patient.dni.includes(searchTerm)
    );
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setShowDropdown(true);
    if (e.target.value === '') {
      onSelect(null);
    }
  };

  const handleSelectPatient = (patientId: number) => {
    const selectedPatient = patients.find(p => p.id === patientId);
    if (selectedPatient) {
      setSearchTerm(`${selectedPatient.apellido} - ${selectedPatient.dni}`);
    }
    onSelect(patientId);
    setShowDropdown(false);
  };

  return (
    <div className="relative w-full max-w-xl">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className="h-5 w-5 text-[#4D94C8]" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
          </svg>
        </div>
        <input
          type="text"
          placeholder="Buscar por apellido o DNI..."
          value={searchTerm}
          onChange={handleInputChange}
          className="w-full pl-10 pr-4 py-2.5 text-sm text-gray-900 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 transition-all duration-200"
        />
      </div>
      
      {showDropdown && searchTerm && (
        <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
          {filteredPatients.length > 0 ? (
            filteredPatients.map((patient) => (
              <button
                key={patient.id}
                onClick={() => handleSelectPatient(patient.id)}
                className="w-full px-4 py-3 text-left hover:bg-gray-50 focus:outline-none focus:bg-indigo-50 transition-colors border-b border-gray-100 last:border-0"
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-900">{patient.apellido}</span>
                  <span className="text-sm text-gray-500">DNI: {patient.dni}</span>
                </div>
              </button>
            ))
          ) : (
            <div className="px-4 py-3 text-sm text-gray-500">No se encontraron resultados</div>
          )}
        </div>
      )}
    </div>
  );
}