'use client';

import type { HistoriaClinica, Profesional } from '@/generated/prisma';

interface HistoriaClinicaModalProps {
  isOpen: boolean;
  onClose: () => void;
  historia: (HistoriaClinica & {
    profesional: Profesional;
  })[];
}

const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString('es-AR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export function HistoriaClinicaModal({ isOpen, onClose, historia }: HistoriaClinicaModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#4D94C8]/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-3xl shadow-xl transform transition-all border-2 border-[#AFE1EA]">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-[#0AA2C7]">Historia Clínica</h3>
          <button
            onClick={onClose}
            className="text-[#4D94C8] hover:text-[#0AA2C7] transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-6">
          {historia.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No hay registros en la historia clínica</p>
          ) : (
            historia.map((registro, index) => (
              <div key={registro.id} className="bg-[#E4F1F9] rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold text-[#0AA2C7]">
                      Atendido por: Dr. {registro.profesional.nombre} {registro.profesional.apellido}
                    </h4>
                    <p className="text-sm text-gray-500">
                      {formatDate(registro.fecha)}
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div>
                    <h5 className="text-sm font-medium text-[#4D94C8]">Motivo de consulta</h5>
                    <p className="text-gray-700">{registro.motivo}</p>
                  </div>
                  <div>
                    <h5 className="text-sm font-medium text-[#4D94C8]">Detalle</h5>
                    <p className="text-gray-700 whitespace-pre-wrap">{registro.detalle}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-white bg-[#18AEFB] rounded-md hover:bg-[#0AA2C7] focus:outline-none focus:ring-2 focus:ring-[#AFE1EA] transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
