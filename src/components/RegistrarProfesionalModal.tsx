"use client";

import { useState } from "react";
import type { ObraSocial } from "@/generated/prisma";

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
  nombreUsuario: string;
  email: string;
  rol: "MESA_ENTRADA" | "PROFESIONAL" | "GERENTE";
  password: string;
}

export function RegistrarProfesionalModal({
  isOpen,
  onClose,
  obrasSociales,
  onSubmit,
}: RegistrarProfesionalModalProps) {
  const [datosFormulario, setDatosFormulario] =
    useState<DatosProfesionalFormulario>({
      nombre: "",
      apellido: "",
      dni: "",
      especialidad: "",
      telefono: "",
      direccion: "",
      obras_sociales_ids: [],
      email: "",
      rol: "PROFESIONAL",
      password: "",
      nombreUsuario: "",
    });

  const [enviando, setEnviando] = useState(false);
  const [mostrarObrasSociales, setMostrarObrasSociales] = useState(false);
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [errores, setErrores] = useState<{ [key: string]: string }>({});
  const [verificandoDni, setVerificandoDni] = useState(false);

  // Función para capitalizar la primera letra
  const capitalizarPrimeraLetra = (texto: string): string => {
    if (!texto) return texto;
    return texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase();
  };

  // Validación para DNI (solo números, máximo 9 caracteres)
  const validarDNI = (dni: string): boolean => {
    const dniRegex = /^\d{1,9}$/;
    return dniRegex.test(dni);
  };

  // Validación para teléfono (+ seguido de números, máximo 14 caracteres)
  const validarTelefono = (telefono: string): boolean => {
    const telefonoRegex = /^\+\d{1,13}$/;
    return telefonoRegex.test(telefono);
  };

  // Validación para campos de solo letras
  const validarSoloLetras = (texto: string): boolean => {
    const letrasRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
    return letrasRegex.test(texto);
  };

  // Validación para dirección (letras, números y espacios)
  const validarDireccion = (direccion: string): boolean => {
    const direccionRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s]+$/;
    return direccionRegex.test(direccion);
  };

  // Función para verificar DNI duplicado
  const verificarDniDuplicado = async (dni: string): Promise<boolean> => {
    if (!dni || dni.length < 7) return false; // Solo verificar DNIs con al menos 7 dígitos

    try {
      setVerificandoDni(true);
      const response = await fetch(
        `/api/v1/profesionales?verificar_dni=${dni}`
      );
      const data = await response.json();
      return data.existe;
    } catch (error) {
      console.error("Error al verificar DNI:", error);
      return false;
    } finally {
      setVerificandoDni(false);
    }
  };

  const manejarCambio = async (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    let valorProcesado = value;
    let nuevoError = "";

    // Aplicar restricciones y validaciones según el campo
    switch (name) {
      case "dni":
        // Solo permitir números y máximo 9 caracteres
        valorProcesado = value.replace(/\D/g, "").slice(0, 9);
        if (valorProcesado && !validarDNI(valorProcesado)) {
          nuevoError = "El DNI debe contener solo números y máximo 9 dígitos";
        }
        break;

      case "telefono":
        // Permitir + al inicio y números, máximo 14 caracteres
        if (value.length === 1 && value !== "+") {
          valorProcesado = "+" + value.replace(/\D/g, "");
        } else if (value.length > 1) {
          valorProcesado = "+" + value.slice(1).replace(/\D/g, "");
        } else if (value === "") {
          valorProcesado = "";
        } else {
          valorProcesado = value;
        }
        valorProcesado = valorProcesado.slice(0, 14);

        if (valorProcesado && !validarTelefono(valorProcesado)) {
          nuevoError =
            "El teléfono debe comenzar con + seguido de números (máximo 14 caracteres)";
        }
        break;

      case "nombre":
      case "apellido":
      case "especialidad":
        // Solo permitir letras y espacios
        valorProcesado = value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, "");
        if (valorProcesado && !validarSoloLetras(valorProcesado)) {
          nuevoError = "Este campo solo puede contener letras";
        }
        break;

      case "direccion":
        // Permitir letras, números y espacios
        valorProcesado = value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s]/g, "");
        if (valorProcesado && !validarDireccion(valorProcesado)) {
          nuevoError =
            "La dirección solo puede contener letras, números y espacios";
        }
        break;

      case "email":
        valorProcesado = value.trim();
        if (valorProcesado && !/\S+@\S+\.\S+/.test(valorProcesado)) {
          nuevoError = "Email inválido";
        }
        break;

      case "nombreUsuario":
        valorProcesado = value.trim();
        if (valorProcesado.length < 3) {
          nuevoError = "El nombre de usuario debe tener al menos 3 caracteres";
        }
        break;

      default:
        valorProcesado = value;
    }

    // Actualizar formulario primero
    setDatosFormulario((prev) => ({
      ...prev,
      [name]: valorProcesado,
    }));

    // Actualizar errores
    setErrores((prev) => ({
      ...prev,
      [name]: nuevoError,
    }));

    // Verificación especial para DNI duplicado
    if (
      name === "dni" &&
      valorProcesado &&
      valorProcesado.length >= 7 &&
      !nuevoError
    ) {
      const dniExiste = await verificarDniDuplicado(valorProcesado);
      if (dniExiste) {
        setErrores((prev) => ({
          ...prev,
          dni: `El DNI ${valorProcesado} ya está registrado`,
        }));
      } else {
        setErrores((prev) => ({
          ...prev,
          dni: "",
        }));
      }
    }
  };

  const manejarToggleObraSocial = (obraSocialId: number) => {
    setDatosFormulario((prev) => ({
      ...prev,
      obras_sociales_ids: prev.obras_sociales_ids.includes(obraSocialId)
        ? prev.obras_sociales_ids.filter((id) => id !== obraSocialId)
        : [...prev.obras_sociales_ids, obraSocialId],
    }));
  };

  const validarFormulario = (): boolean => {
    const nuevosErrores: { [key: string]: string } = {};

    const validarPassword = (password: string): boolean => {
      return password.length >= 3;
    };

    if (!datosFormulario.password.trim()) {
      nuevosErrores.password = "La contraseña es requerida";
    } else if (!validarPassword(datosFormulario.password.trim())) {
      nuevosErrores.password = "La contraseña debe tener al menos 3 caracteres";
    }

    if (!datosFormulario.email.trim()) {
      nuevosErrores.email = "El email es requerido";
    } else if (!/\S+@\S+\.\S+/.test(datosFormulario.email)) {
      nuevosErrores.email = "Email inválido";
    }

    // Validar campos requeridos
    if (!datosFormulario.nombre.trim()) {
      nuevosErrores.nombre = "El nombre es requerido";
    } else if (!validarSoloLetras(datosFormulario.nombre)) {
      nuevosErrores.nombre = "El nombre solo puede contener letras";
    }

    if (!datosFormulario.apellido.trim()) {
      nuevosErrores.apellido = "El apellido es requerido";
    } else if (!validarSoloLetras(datosFormulario.apellido)) {
      nuevosErrores.apellido = "El apellido solo puede contener letras";
    }

    if (!datosFormulario.dni.trim()) {
      nuevosErrores.dni = "El DNI es requerido";
    } else if (!validarDNI(datosFormulario.dni)) {
      nuevosErrores.dni =
        "El DNI debe contener solo números y máximo 9 dígitos";
    } else if (errores.dni && errores.dni.includes("ya está registrado")) {
      nuevosErrores.dni = errores.dni; // Mantener error de DNI duplicado
    }

    if (!datosFormulario.especialidad.trim()) {
      nuevosErrores.especialidad = "La especialidad es requerida";
    } else if (!validarSoloLetras(datosFormulario.especialidad)) {
      nuevosErrores.especialidad = "La especialidad solo puede contener letras";
    }

    if (!datosFormulario.telefono.trim()) {
      nuevosErrores.telefono = "El teléfono es requerido";
    } else if (!validarTelefono(datosFormulario.telefono)) {
      nuevosErrores.telefono =
        "El teléfono debe comenzar con + seguido de números (máximo 14 caracteres)";
    }

    if (!datosFormulario.direccion.trim()) {
      nuevosErrores.direccion = "La dirección es requerida";
    } else if (!validarDireccion(datosFormulario.direccion)) {
      nuevosErrores.direccion =
        "La dirección solo puede contener letras, números y espacios";
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const manejarEnvio = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validarFormulario()) {
      return;
    }

    setEnviando(true);

    try {
      // Capitalizar campos de texto antes de enviar
      const datosCapitalizados: DatosProfesionalFormulario = {
        ...datosFormulario,
        nombre: capitalizarPrimeraLetra(datosFormulario.nombre.trim()),
        apellido: capitalizarPrimeraLetra(datosFormulario.apellido.trim()),
        especialidad: capitalizarPrimeraLetra(
          datosFormulario.especialidad.trim()
        ),
        direccion: capitalizarPrimeraLetra(datosFormulario.direccion.trim()),
        dni: datosFormulario.dni.trim(),
        telefono: datosFormulario.telefono.trim(),
      };

      await onSubmit(datosCapitalizados);

      // Solo resetear el form y mostrar éxito si llegamos aquí sin errores
      setDatosFormulario({
        nombre: "",
        apellido: "",
        dni: "",
        especialidad: "",
        telefono: "",
        direccion: "",
        obras_sociales_ids: [],
        email: "",
        rol: "PROFESIONAL",
        password: "",
        nombreUsuario: "",
      });
      setMostrarObrasSociales(false);
      setErrores({});

      setNotification({
        type: "success",
        message: "Profesional registrado exitosamente",
      });
    } catch (error) {
      console.error("Error al registrar profesional:", error);

      // Determinar el mensaje de error basado en el tipo de error
      let mensajeError =
        "Error al registrar el profesional. Por favor, intente nuevamente.";

      if (error instanceof Error) {
        if (error.message.includes("DNI")) {
          mensajeError =
            "No se pudo registrar el profesional: DNI ya registrado.";
        } else {
          mensajeError = error.message;
        }
      }

      setNotification({
        type: "error",
        message: mensajeError,
      });
    } finally {
      setEnviando(false);
    }
  };

  const obtenerNombresObrasSocialesSeleccionadas = () => {
    return obrasSociales
      .filter((os) => datosFormulario.obras_sociales_ids.includes(os.id))
      .map((os) => os.nombre);
  };

  const cerrarModal = () => {
    // Reset de estados cuando se cierre el modal
    setDatosFormulario({
      nombre: "",
      apellido: "",
      dni: "",
      especialidad: "",
      telefono: "",
      direccion: "",
      obras_sociales_ids: [],
      email: "",
      rol: "PROFESIONAL",
      password: "",
      nombreUsuario: "",
    });
    setMostrarObrasSociales(false);
    setNotification(null);
    setErrores({});
    setVerificandoDni(false);
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
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
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
                  placeholder="Juan"
                  required
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#0AA2C7] focus:border-[#0AA2C7] transition-colors ${
                    errores.nombre
                      ? "border-red-500 text-gray-900"
                      : "border-[#AFE1EA] text-gray-900"
                  }`}
                />
                {errores.nombre && (
                  <p className="text-red-500 text-xs mt-1">{errores.nombre}</p>
                )}
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
                  placeholder="Perez"
                  required
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#0AA2C7] focus:border-[#0AA2C7] transition-colors ${
                    errores.apellido
                      ? "border-red-500 text-gray-900"
                      : "border-gray-300 text-gray-900"
                  }`}
                />
                {errores.apellido && (
                  <p className="text-red-500 text-xs mt-1">
                    {errores.apellido}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  DNI *{" "}
                  <span className="text-xs text-gray-500">
                    (Solo números, sin puntos)
                  </span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="dni"
                    value={datosFormulario.dni}
                    onChange={manejarCambio}
                    maxLength={9}
                    placeholder="11222333"
                    required
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#0AA2C7] focus:border-[#0AA2C7] transition-colors ${
                      errores.dni
                        ? "border-red-500 text-gray-900"
                        : "border-gray-300 text-gray-900"
                    }`}
                  />
                  {verificandoDni && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <svg
                        className="animate-spin h-4 w-4 text-blue-500"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                    </div>
                  )}
                </div>
                {errores.dni && (
                  <p
                    className={`text-xs mt-1 ${
                      errores.dni.includes("ya está registrado")
                        ? "text-red-600 font-medium"
                        : "text-red-500"
                    }`}
                  >
                    {errores.dni}
                  </p>
                )}
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
                  placeholder="Cardiología"
                  required
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#0AA2C7] focus:border-[#0AA2C7] transition-colors ${
                    errores.especialidad
                      ? "border-red-500 text-gray-900"
                      : "border-gray-300 text-gray-900"
                  }`}
                />
                {errores.especialidad && (
                  <p className="text-red-500 text-xs mt-1">
                    {errores.especialidad}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Teléfono *{" "}
                <span className="text-xs text-gray-500">
                  (+ seguido de números, máx 14 caracteres)
                </span>
              </label>
              <input
                type="tel"
                name="telefono"
                value={datosFormulario.telefono}
                onChange={manejarCambio}
                maxLength={14}
                placeholder="+543876112233"
                required
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#0AA2C7] focus:border-[#0AA2C7] transition-colors ${
                  errores.telefono
                    ? "border-red-500 text-gray-900"
                    : "border-gray-300 text-gray-900"
                }`}
              />
              {errores.telefono && (
                <p className="text-red-500 text-xs mt-1">{errores.telefono}</p>
              )}
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
                placeholder="Balcarce 1483"
                required
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#0AA2C7] focus:border-[#0AA2C7] transition-colors ${
                  errores.direccion
                    ? "border-red-500 text-gray-900"
                    : "border-gray-300 text-gray-900"
                }`}
              />
              {errores.direccion && (
                <p className="text-red-500 text-xs mt-1">{errores.direccion}</p>
              )}
            </div>
            {/* Nombre de usuario */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre de Usuario *
              </label>
              <input
                type="text"
                name="nombreUsuario"
                value={datosFormulario.nombreUsuario}
                onChange={manejarCambio}
                placeholder="juanperez"
                required
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#0AA2C7] focus:border-[#0AA2C7] transition-colors ${
                  errores.nombreUsuario
                    ? "border-red-500 text-gray-900"
                    : "border-gray-300 text-gray-900"
                }`}
              />
              {errores.nombreUsuario && (
                <p className="text-red-500 text-xs mt-1">
                  {errores.nombreUsuario}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={datosFormulario.email}
                onChange={manejarCambio}
                placeholder="ejemplo@correo.com"
                required
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#0AA2C7] focus:border-[#0AA2C7] transition-colors ${
                  errores.email
                    ? "border-red-500 text-gray-900"
                    : "border-gray-300 text-gray-900"
                }`}
              />
              {errores.email && (
                <p className="text-red-500 text-xs mt-1">{errores.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contraseña *
              </label>
              <input
                type="password"
                name="password"
                value={datosFormulario.password}
                onChange={manejarCambio}
                placeholder="********"
                required
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#0AA2C7] focus:border-[#0AA2C7] transition-colors ${
                  errores.password
                    ? "border-red-500 text-gray-900"
                    : "border-gray-300 text-gray-900"
                }`}
              />
              {errores.password && (
                <p className="text-red-500 text-xs mt-1">{errores.password}</p>
              )}
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
                      ? "Seleccionar obras sociales..."
                      : `${datosFormulario.obras_sociales_ids.length} seleccionadas`}
                  </span>
                  <svg
                    className={`w-4 h-4 text-gray-700 transition-transform ${
                      mostrarObrasSociales ? "rotate-180" : ""
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {mostrarObrasSociales && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-[#AFE1EA] rounded-lg shadow-lg max-h-32 overflow-y-auto">
                    {obrasSociales
                      .filter((os) => os.estado === "ACTIVA")
                      .map((obraSocial) => (
                        <label
                          key={obraSocial.id}
                          className="flex items-center px-3 py-2 hover:bg-[#E4F1F9] cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={datosFormulario.obras_sociales_ids.includes(
                              obraSocial.id
                            )}
                            onChange={() =>
                              manejarToggleObraSocial(obraSocial.id)
                            }
                            className="mr-2 text-[#0AA2C7] focus:ring-[#0AA2C7] rounded"
                          />
                          <span className="text-sm text-gray-700">
                            {obraSocial.nombre}
                          </span>
                        </label>
                      ))}
                  </div>
                )}

                {datosFormulario.obras_sociales_ids.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {obtenerNombresObrasSocialesSeleccionadas().map(
                      (nombre, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700"
                        >
                          {nombre}
                        </span>
                      )
                    )}
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
                {enviando ? "Registrando..." : "Registrar Profesional"}
              </button>
            </div>
          </form>
        </div>

        {notification && (
          <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-[60]">
            <div className="bg-white rounded-lg p-6 w-full max-w-sm shadow-xl">
              <div className="flex flex-col items-center text-center">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${
                    notification.type === "success"
                      ? "bg-green-100 text-green-500"
                      : "bg-red-100 text-red-500"
                  }`}
                >
                  {notification.type === "success" ? (
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  )}
                </div>
                <h3
                  className={`text-lg font-semibold mb-2 ${
                    notification.type === "success"
                      ? "text-green-700"
                      : "text-red-700"
                  }`}
                >
                  {notification.type === "success" ? "Éxito" : "Error"}
                </h3>
                <p className="text-gray-600 mb-6">{notification.message}</p>
                <button
                  onClick={() => {
                    setNotification(null);
                    if (notification.type === "success") {
                      cerrarModal();
                    }
                  }}
                  className={`px-6 py-2 text-sm text-white rounded-md focus:outline-none focus:ring-2 ${
                    notification.type === "success"
                      ? "bg-green-500 hover:bg-green-600 focus:ring-green-200"
                      : "bg-red-500 hover:bg-red-600 focus:ring-red-200"
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