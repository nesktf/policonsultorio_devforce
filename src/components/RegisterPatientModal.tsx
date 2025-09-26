'use client';

import { useState } from 'react';
import { ObraSocial } from '@/generated/prisma';

interface RegisterPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (newPatient: any) => void; // Simplificamos el callback
  obrasSociales: ObraSocial[];
}

export function RegisterPatientModal({ isOpen, onClose, onSubmit, obrasSociales }: RegisterPatientModalProps) {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    dni: '',
    telefono: '',
    direccion: '',
    fechaNacimiento: '',
    obraSocialId: '',
    numObraSocial: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Preparar los datos para la API
      const apiData = {
        nombre: formData.nombre,
        apellido: formData.apellido,
        dni: formData.dni,
        telefono: formData.telefono,
        direccion: formData.direccion,
        fecha_nacimiento: formData.fechaNacimiento, // Nota: fecha_nacimiento, no fechaNacimiento
        id_obra_social: formData.obraSocialId ? parseInt(formData.obraSocialId) : null,
        num_obra_social: formData.obraSocialId ? formData.numObraSocial : null,
      };

      // Llamar a la API
      const response = await fetch('/api/v1/pacientes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al registrar paciente');
      }

      const newPatient = await response.json();
      
      // Limpiar formulario
      setFormData({
        nombre: '',
        apellido: '',
        dni: '',
        telefono: '',
        direccion: '',
        fechaNacimiento: '',
        obraSocialId: '',
        numObraSocial: '',
      });

      // Notificar éxito
      setNotification({
        type: 'success',
        message: 'Paciente registrado exitosamente'
      });

      // Actualizar la lista en el componente padre
      onSubmit(newPatient);

    } catch (error: any) {
      console.error('Error al registrar paciente:', error);
      setNotification({
        type: 'error',
        message: error.message || 'Error al registrar el paciente. Por favor, intente nuevamente.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#4D94C8]/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl transform transition-all border-2 border-[#AFE1EA]">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-[#0AA2C7]">Registrar Nuevo Paciente</h3>
          <button
            onClick={onClose}
            className="text-[#4D94C8] hover:text-[#0AA2C7] transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">
              Nombre
            </label>
            <input
              type="text"
              id="nombre"
              required
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              className="mt-1 block w-full rounded-lg border border-[#AFE1EA] px-4 py-2.5 bg-white text-gray-900 placeholder-gray-500 focus:border-[#0AA2C7] focus:ring-2 focus:ring-[#AFE1EA] transition-all duration-200"
            />
          </div>

          <div>
            <label htmlFor="apellido" className="block text-sm font-medium text-gray-700">
              Apellido
            </label>
            <input
              type="text"
              id="apellido"
              required
              value={formData.apellido}
              onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
              className="mt-1 block w-full rounded-lg border border-[#AFE1EA] px-4 py-2.5 bg-white text-gray-900 placeholder-gray-500 focus:border-[#0AA2C7] focus:ring-2 focus:ring-[#AFE1EA] transition-all duration-200"
            />
          </div>

          <div>
            <label htmlFor="dni" className="block text-sm font-medium text-gray-700">
              DNI
            </label>
            <input
              type="text"
              id="dni"
              required
              maxLength={9}
              pattern="[0-9]*"
              title="Solo se permiten números"
              value={formData.dni}
              onChange={(e) => {
                // Solo permitir números
                const value = e.target.value.replace(/\D/g, '');
                setFormData({ ...formData, dni: value });
              }}
              className="mt-1 block w-full rounded-lg border border-[#AFE1EA] px-4 py-2.5 bg-white text-gray-900 placeholder-gray-500 focus:border-[#0AA2C7] focus:ring-2 focus:ring-[#AFE1EA] transition-all duration-200"
            />
          </div>

          <div>
            <label htmlFor="direccion" className="block text-sm font-medium text-gray-700">
              Dirección
            </label>
            <input
              type="text"
              id="direccion"
              required
              value={formData.direccion}
              onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
              className="mt-1 block w-full rounded-lg border border-[#AFE1EA] px-4 py-2.5 bg-white text-gray-900 placeholder-gray-500 focus:border-[#0AA2C7] focus:ring-2 focus:ring-[#AFE1EA] transition-all duration-200"
            />
          </div>

          <div>
            <label htmlFor="fechaNacimiento" className="block text-sm font-medium text-gray-700">
              Fecha de Nacimiento
            </label>
            <input
              type="date"
              id="fechaNacimiento"
              required
              value={formData.fechaNacimiento}
              onChange={(e) => setFormData({ ...formData, fechaNacimiento: e.target.value })}
              className="mt-1 block w-full rounded-lg border border-[#AFE1EA] px-4 py-2.5 bg-white text-gray-900 placeholder-gray-500 focus:border-[#0AA2C7] focus:ring-2 focus:ring-[#AFE1EA] transition-all duration-200"
            />
          </div>

          <div>
            <label htmlFor="obraSocial" className="block text-sm font-medium text-gray-700">
              Obra Social
            </label>
            <select
              id="obraSocial"
              value={formData.obraSocialId}
              onChange={(e) => setFormData({ ...formData, obraSocialId: e.target.value })}
              className="mt-1 block w-full rounded-lg border border-[#AFE1EA] px-4 py-2.5 bg-white text-gray-900 placeholder-gray-500 focus:border-[#0AA2C7] focus:ring-2 focus:ring-[#AFE1EA] transition-all duration-200"
            >
              <option value="">Sin obra social</option>
              {obrasSociales.map((os) => (
                <option key={os.id} value={os.id}>
                  {os.nombre}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="numObraSocial" className="block text-sm font-medium text-gray-700">
              Número de Obra Social
            </label>
            <input
              type="text"
              id="numObraSocial"
              value={formData.numObraSocial}
              disabled={!formData.obraSocialId}
              onChange={(e) => setFormData({ ...formData, numObraSocial: e.target.value })}
              className="mt-1 block w-full rounded-lg border border-[#AFE1EA] px-4 py-2.5 bg-white text-gray-900 placeholder-gray-500 focus:border-[#0AA2C7] focus:ring-2 focus:ring-[#AFE1EA] transition-all duration-200 disabled:bg-gray-100 disabled:text-gray-500"
            />
          </div>

          <div>
            <label htmlFor="telefono" className="block text-sm font-medium text-gray-700">
              Teléfono
            </label>
            <input
              type="tel"
              id="telefono"
              required
              maxLength={14}
              value={formData.telefono}
              onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
              className="mt-1 block w-full rounded-lg border border-[#AFE1EA] px-4 py-2.5 bg-white text-gray-900 placeholder-gray-500 focus:border-[#0AA2C7] focus:ring-2 focus:ring-[#AFE1EA] transition-all duration-200"
              placeholder="+543871234567"
            />
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-[#4D94C8] border border-[#AFE1EA] rounded-md hover:bg-[#E4F1F9] focus:outline-none focus:ring-2 focus:ring-[#0AA2C7] transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm text-white bg-[#18AEFB] rounded-md hover:bg-[#0AA2C7] focus:outline-none focus:ring-2 focus:ring-[#AFE1EA] disabled:bg-[#4D94C8] transition-colors"
            >
              {isSubmitting ? 'Registrando...' : 'Registrar'}
            </button>
          </div>
        </form>

        {notification && (
          <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-[60]">
            <div className="bg-white rounded-lg p-6 w-full max-w-sm shadow-xl">
              <div className="flex flex-col items-center text-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${
                  notification.type === 'success' ? 'bg-green-100 text-green-500' : 'bg-red-100 text-red-500'
                }`}>
                  {notification.type === 'success' ? (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                </div>
                <h3 className={`text-lg font-semibold mb-2 ${
                  notification.type === 'success' ? 'text-green-700' : 'text-red-700'
                }`}>
                  {notification.type === 'success' ? 'Éxito' : 'Error'}
                </h3>
                <p className="text-gray-600 mb-6">{notification.message}</p>
                <button
                  onClick={() => {
                    setNotification(null);
                    if (notification.type === 'success') {
                      onClose();
                    }
                  }}
                  className={`px-6 py-2 text-sm text-white rounded-md focus:outline-none focus:ring-2 ${
                    notification.type === 'success' 
                      ? 'bg-green-500 hover:bg-green-600 focus:ring-green-200'
                      : 'bg-red-500 hover:bg-red-600 focus:ring-red-200'
                  }`}
                >
                  Aceptar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}