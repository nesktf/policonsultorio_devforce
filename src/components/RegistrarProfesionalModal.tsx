'use client';

import { useState } from 'react';
import type { ObraSocial } from '@/generated/prisma';

interface RegistrarProfesionalModalProps {
  isOpen: boolean;
  onClose: () => void;
  obrasSociales: ObraSocial[];
  onSubmit: (data: DatosProfesionalFormulario) => Promise<void>;
}

export interface DatosProfesionalFormulario {
  nombre: string;
  apellido: string;
  dni: string;
  especialidad: string;
  telefono: string;
  direccion: string;
  obras_sociales_ids: number[];
}

export function RegistrarProfesionalModal({ 
  isOpen, 
  onClose, 
  obrasSociales,
  onSubmit 
}: RegistrarProfesionalModalProps) {
  const [datosFormulario, setDatosFormulario] = useState<DatosProfesionalFormulario>({
    nombre: '',
    apellido: '',
    dni: '',
    especialidad: '',
    telefono: '',
    direccion: '',
    obras_sociales_ids: []
  });

  const [enviando, setEnviando] = useState(false);
  const [mostrarObrasSociales, setMostrarObrasSociales] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const manejarCambio = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setDatosFormulario(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const manejarToggleObraSocial = (obraSocialId: number) => {
    setDatosFormulario(prev => ({
      ...prev,
      obras_sociales_ids: prev.obras_sociales_ids.includes(obraSocialId)
        ? prev.obras_sociales_ids.filter(id => id !== obraSocialId)
        : [...prev.obras_sociales_ids, obraSocialId]
    }));
  };

  const manejarEnvio = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnviando(true);
    
    try {
      await onSubmit(datosFormulario);
      
      // Solo resetear el form y mostrar éxito si llegamos aquí sin errores
      setDatosFormulario({
        nombre: '',
        apellido: '',
        dni: '',
        especialidad: '',
        telefono: '',
        direccion: '',
        obras_sociales_ids: []
      });
      setMostrarObrasSociales(false);
      
      setNotification({
        type: 'success',
        message: 'Profesional registrado exitosamente'
      });
    } catch (error) {
      console.error('Error al registrar profesional:', error);
      setNotification({
        type: 'error',
        message: 'Error al registrar el profesional. Por favor, intente nuevamente.'
      });
    } finally {
      setEnviando(false);
    }
  };

  const obtenerNombresObrasSocialesSeleccionadas = () => {
    return obrasSociales
      .filter(os => datosFormulario.obras_sociales_ids.includes(os.id))
      .map(os => os.nombre);
  };

  const cerrarModal = () => {
    // Reset de estados cuando se cierre el modal
    setDatosFormulario({
      nombre: '',
      apellido: '',
      dni: '',
      especialidad: '',
      telefono: '',
      direccion: '',
      obras_sociales_ids: []
    });
    setMostrarObrasSociales(false);
    setNotification(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#4D94C8]/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto transform transition-all border-2 border-[#AFE1EA]">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-[#0AA2C7]">
              Registrar Nuevo Profesional
            </h2>
            <button
              onClick={cerrarModal}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={manejarEnvio} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre *
                </label>
                <input
                  type="text"
                  name="nombre"
                  value={datosFormulario.nombre}
                  onChange={manejarCambio}
                  required
                  className="w-full px-3 py-2 border border-[#AFE1EA] text-gray-900 rounded-lg focus:ring-2 focus:ring-[#0AA2C7] focus:border-[#0AA2C7] transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Apellido *
                </label>
                <input
                  type="text"
                  name="apellido"
                  value={datosFormulario.apellido}
                  onChange={manejarCambio}
                  required
                  className="w-full px-3 py-2 border border-gray-300 text-gray-900 rounded-lg focus:ring-2 focus:ring-[#0AA2C7] focus:border-[#0AA2C7] transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  DNI *
                </label>
                <input
                  type="text"
                  name="dni"
                  value={datosFormulario.dni}
                  onChange={manejarCambio}
                  maxLength={9}
                  required
                  className="w-full px-3 py-2 border border-gray-300 text-gray-900 rounded-lg focus:ring-2 focus:ring-[#0AA2C7] focus:border-[#0AA2C7] transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Especialidad *
                </label>
                <input
                  type="text"
                  name="especialidad"
                  value={datosFormulario.especialidad}
                  onChange={manejarCambio}
                  required
                  className="w-full px-3 py-2 border border-gray-300 text-gray-900 rounded-lg focus:ring-2 focus:ring-[#0AA2C7] focus:border-[#0AA2C7] transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Teléfono *
              </label>
              <input
                type="tel"
                name="telefono"
                value={datosFormulario.telefono}
                onChange={manejarCambio}
                maxLength={14}
                placeholder="+549333112233"
                required
                className="w-full px-3 py-2 border border-gray-300 text-gray-900 rounded-lg focus:ring-2 focus:ring-[#0AA2C7] focus:border-[#0AA2C7] transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dirección *
              </label>
              <input
                type="text"
                name="direccion"
                value={datosFormulario.direccion}
                onChange={manejarCambio}
                required
                className="w-full px-3 py-2 border border-gray-300 text-gray-900 rounded-lg focus:ring-2 focus:ring-[#0AA2C7] focus:border-[#0AA2C7] transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Obras Sociales
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setMostrarObrasSociales(!mostrarObrasSociales)}
                  className="w-full px-3 py-2 border border-[#AFE1EA] rounded-lg text-left focus:ring-2 focus:ring-[#0AA2C7] focus:border-[#0AA2C7] transition-colors flex justify-between items-center bg-white"
                >
                  <span className="text-gray-900">
                    {datosFormulario.obras_sociales_ids.length === 0 
                      ? 'Seleccionar obras sociales...' 
                      : `${datosFormulario.obras_sociales_ids.length} seleccionadas`
                    }
                  </span>
                  <svg className={`w-4 h-4 text-gray-700 transition-transform ${mostrarObrasSociales ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {mostrarObrasSociales && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-[#AFE1EA] rounded-lg shadow-lg max-h-32 overflow-y-auto">
                    {obrasSociales.filter(os => os.estado === 'ACTIVA').map((obraSocial) => (
                      <label
                        key={obraSocial.id}
                        className="flex items-center px-3 py-2 hover:bg-[#E4F1F9] cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={datosFormulario.obras_sociales_ids.includes(obraSocial.id)}
                          onChange={() => manejarToggleObraSocial(obraSocial.id)}
                          className="mr-2 text-[#0AA2C7] focus:ring-[#0AA2C7] rounded"
                        />
                        <span className="text-sm text-gray-700">{obraSocial.nombre}</span>
                      </label>
                    ))}
                  </div>
                )}

                {datosFormulario.obras_sociales_ids.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {obtenerNombresObrasSocialesSeleccionadas().map((nombre, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700"
                      >
                        {nombre}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={cerrarModal}
                className="px-4 py-2 text-sm text-[#4D94C8] border border-[#AFE1EA] rounded-md hover:bg-[#E4F1F9] focus:outline-none focus:ring-2 focus:ring-[#0AA2C7] transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={enviando}
                className="px-4 py-2 text-sm text-white bg-[#18AEFB] rounded-md hover:bg-[#0AA2C7] focus:outline-none focus:ring-2 focus:ring-[#AFE1EA] disabled:bg-[#4D94C8] transition-colors"
              >
                {enviando ? 'Registrando...' : 'Registrar Profesional'}
              </button>
            </div>
          </form>
        </div>

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
                      cerrarModal();
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