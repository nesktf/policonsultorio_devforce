// src/components/RegistrarTurnoClient.tsx

"use client";

import { useEffect, useRef, useState } from "react";

interface RegistrarTurnoProps {
  pacientes: { id: number; nombre: string; apellido: string; dni: string }[];
  especialidades: { especialidad: string }[];
  onTurnoRegistrado?: (turno: {
    id: number;
    fechaIso: string;
    paciente: string;
    profesional: string;
    estado: string;
    duracion: number;
  }) => void;
  onCloseModal?: () => void;
}

interface ProfesionalOption {
  id: number;
  nombre: string;
  apellido: string;
}

const DURACIONES_MINUTOS = [15, 30, 45, 60];

export function RegistrarTurnoClient({
  pacientes,
  especialidades,
  onTurnoRegistrado,
  onCloseModal,
}: RegistrarTurnoProps) {
  const [pacienteId, setPacienteId] = useState<string>("");
  const [pacienteBusqueda, setPacienteBusqueda] = useState<string>("");
  const [isPacienteListOpen, setIsPacienteListOpen] = useState(false);
  const [especialidad, setEspecialidad] = useState<string>("");
  const [profesionalId, setProfesionalId] = useState<string>("");
  const [fecha, setFecha] = useState<string>("");
  const [duracion, setDuracion] = useState<string>("30");
  const [horario, setHorario] = useState<string>("");
  const [motivo, setMotivo] = useState<string>("");
  const [detalle, setDetalle] = useState<string>("");
  const [estado, setEstado] = useState<string>("");
  const timezoneOffsetMinutes = new Date().getTimezoneOffset();

  const [profesionales, setProfesionales] = useState<ProfesionalOption[]>([]);
  const [horarios, setHorarios] = useState<string[]>([]);

  const [isLoadingProfesionales, setIsLoadingProfesionales] = useState(false);
  const [isLoadingHorarios, setIsLoadingHorarios] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showSuccessOverlay, setShowSuccessOverlay] = useState(false);

  const noEspecialidades = especialidades.length === 0;
  const pacienteSearchContainerRef = useRef<HTMLDivElement | null>(null);
  const successTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handlePacienteSearchChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.value;
    setPacienteBusqueda(value);
    setIsPacienteListOpen(true);

    if (pacienteId) {
      setPacienteId("");
    }
  };

  const handlePacienteSelect = (
    paciente: RegistrarTurnoProps["pacientes"][number]
  ) => {
    setPacienteId(String(paciente.id));
    setPacienteBusqueda(
      `${paciente.apellido}, ${paciente.nombre} (${paciente.dni})`
    );
    setIsPacienteListOpen(false);
  };

  const handleEspecialidadChange = async (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const nuevaEspecialidad = e.target.value;
    setEspecialidad(nuevaEspecialidad);

    setProfesionalId("");
    setFecha("");
    setHorario("");
    setProfesionales([]);
    setHorarios([]);
    setDuracion("30");

    if (!nuevaEspecialidad) {
      return;
    }

    setSuccessMessage(null);
    setErrorMessage(null);

    setIsLoadingProfesionales(true);
    try {
      const response = await fetch(
        `/api/v1/profesionales?especialidad=${encodeURIComponent(
          nuevaEspecialidad
        )}`,
        { cache: "no-store" }
      );
      if (!response.ok) {
        throw new Error("No se pudieron obtener los profesionales.");
      }
      const data: ProfesionalOption[] = await response.json();
      setProfesionales(data);
    } catch (error) {
      console.error("Error al obtener profesionales:", error);
      setErrorMessage(
        "No se pudieron cargar los profesionales. Intenta nuevamente."
      );
    } finally {
      setIsLoadingProfesionales(false);
    }
  };

  const handleProfesionalChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setProfesionalId(event.target.value);
    setHorario("");
    setHorarios([]);
    setSuccessMessage(null);
    setErrorMessage(null);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    if (!pacienteId) {
      setErrorMessage("Selecciona un paciente válido antes de confirmar.");
      setIsSubmitting(false);
      return;
    }

    if (!motivo.trim() || !detalle.trim()) {
      setErrorMessage("Completa motivo y detalle antes de confirmar.");
      setIsSubmitting(false);
      return;
    }

    try {
      const fechaHoraIso = new Date(`${fecha}T${horario}:00`).toISOString();

      const response = await fetch("/api/v1/turnos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pacienteId: Number(pacienteId),
          profesionalId: Number(profesionalId),
          fecha: fechaHoraIso,
          motivo: motivo.trim(),
          detalle: detalle.trim(),
        }),
      });

      if (!response.ok) {
        const { error } = await response
          .json()
          .catch(() => ({ error: "Error al registrar el turno." }));
        throw new Error(error || "Error al registrar el turno.");
      }

      const turnoCreado: { id: number; fecha: string; estado: string; duracion: number } =
        await response.json();

      const pacienteSeleccionado = pacientes.find(
        (p) => p.id === Number(pacienteId)
      );
      const profesionalSeleccionado = profesionales.find(
        (p) => p.id === Number(profesionalId)
      );

      const pacienteNombre = pacienteSeleccionado
        ? `${pacienteSeleccionado.apellido}, ${pacienteSeleccionado.nombre}`
        : "Paciente";

      const profesionalNombre = profesionalSeleccionado
        ? `${profesionalSeleccionado.apellido}, ${profesionalSeleccionado.nombre}`
        : "Profesional";

      onTurnoRegistrado?.({
        id: turnoCreado.id,
        fechaIso: turnoCreado.fecha,
        paciente: pacienteNombre,
        profesional: profesionalNombre,
        estado: turnoCreado.estado,
        duracion: turnoCreado.duracion,
      });

      setSuccessMessage("Turno registrado con éxito.");
      setHorario("");
      setHorarios((prev) => prev.filter((slot) => slot !== horario));
      setMotivo("");
      setDetalle("");
      setShowSuccessOverlay(true);
      if (successTimeoutRef.current) {
        clearTimeout(successTimeoutRef.current);
      }
      successTimeoutRef.current = setTimeout(() => {
        setShowSuccessOverlay(false);
        onCloseModal?.();
      }, 1500);
    } catch (error) {
      console.error("Error al registrar turno:", error);
      setErrorMessage(
        error instanceof Error ? error.message : "Error al registrar el turno."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        pacienteSearchContainerRef.current &&
        !pacienteSearchContainerRef.current.contains(event.target as Node)
      ) {
        setIsPacienteListOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    return () => {
      if (successTimeoutRef.current) {
        clearTimeout(successTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!profesionalId || !fecha) {
      setHorarios([]);
      return;
    }

    let cancelado = false;

    const fetchHorarios = async () => {
      setIsLoadingHorarios(true);
      setErrorMessage(null);
      setSuccessMessage(null);

      try {
        const response = await fetch(
          `/api/v1/turnos/disponibles?profesionalId=${profesionalId}&fecha=${fecha}&timezoneOffset=${timezoneOffsetMinutes}&durationMinutes=${duracion}`,
          { cache: "no-store" }
        );

        if (!response.ok) {
          const { error } = await response
            .json()
            .catch(() => ({ error: "No se pudieron obtener los horarios." }));
          throw new Error(
            error || "No se pudieron obtener los horarios disponibles."
          );
        }

        const data: { slots: string[] } = await response.json();
        if (!cancelado) {
          setHorarios(data.slots);
          setHorario("");
        }
      } catch (error) {
        console.error("Error al obtener horarios disponibles:", error);
        if (!cancelado) {
          setHorarios([]);
          setErrorMessage(
            error instanceof Error
              ? error.message
              : "No se pudieron obtener los horarios disponibles. Intenta nuevamente."
          );
        }
      } finally {
        if (!cancelado) {
          setIsLoadingHorarios(false);
        }
      }
    };

    fetchHorarios();

    return () => {
      cancelado = true;
    };
  }, [profesionalId, fecha, duracion, timezoneOffsetMinutes]);

  const normalizedQuery = pacienteBusqueda.trim().toLowerCase();
  const filteredPacientes = normalizedQuery
    ? pacientes.filter((paciente) => {
        const searchable =
          `${paciente.apellido} ${paciente.nombre} ${paciente.dni}`.toLowerCase();
        return searchable.includes(normalizedQuery);
      })
    : pacientes;
  const pacientesParaMostrar = normalizedQuery
    ? filteredPacientes
    : pacientes.slice(0, 10);
  const shouldShowEmptyState =
    normalizedQuery && filteredPacientes.length === 0;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-black">
          Registrar un Nuevo Turno
        </h2>
      </div>

      <div className="relative bg-white rounded-xl shadow-lg border-2 border-gray-200 p-8">
        {showSuccessOverlay ? (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#E4F1F9]/80">
            <div className="flex flex-col items-center gap-3 rounded-2xl bg-white px-8 py-6 shadow-lg border border-[#AFE1EA]">
              <svg
                className="h-12 w-12 text-[#0AA2C7] animate-pulse"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-lg font-semibold text-[#0AA2C7]">
                Turno registrado con éxito
              </p>
            </div>
          </div>
        ) : null}
        <form onSubmit={handleSubmit} className="space-y-6">
          {successMessage ? (
            <div className="rounded-md bg-green-100 border border-green-300 text-green-700 px-4 py-2">
              {successMessage}
            </div>
          ) : null}
          {errorMessage ? (
            <div className="rounded-md bg-red-100 border border-red-300 text-red-700 px-4 py-2">
              {errorMessage}
            </div>
          ) : null}

          <div ref={pacienteSearchContainerRef} className="relative">
            <label
              htmlFor="paciente"
              className="block text-sm font-bold text-gray-700 mb-1"
            >
              Paciente
            </label>
            <input
              id="paciente"
              type="text"
              value={pacienteBusqueda}
              onChange={handlePacienteSearchChange}
              onFocus={() => setIsPacienteListOpen(true)}
              placeholder="Buscar por apellido o DNI"
              autoComplete="off"
              className="w-full p-3 border border-gray-300 rounded-lg text-gray-900"
            />
            {isPacienteListOpen ? (
              <div className="absolute z-10 mt-1 w-full max-h-60 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg">
                {shouldShowEmptyState ? (
                  <p className="px-3 py-2 text-sm text-gray-500">
                    No se encontraron pacientes.
                  </p>
                ) : (
                  pacientesParaMostrar.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => handlePacienteSelect(p)}
                    >
                      {p.apellido}, {p.nombre} ({p.dni})
                    </button>
                  ))
                )}
              </div>
            ) : null}
            {!pacienteId && pacienteBusqueda ? (
              <p className="mt-2 text-sm text-red-500">
                Selecciona un paciente de la lista para continuar.
              </p>
            ) : null}
          </div>

          <div>
            <label
              htmlFor="motivo"
              className="block text-sm font-bold text-gray-700 mb-1"
            >
              Motivo del turno
            </label>
            <input
              id="motivo"
              type="text"
              value={motivo}
              onChange={(event) => setMotivo(event.target.value)}
              placeholder="Ej.: Control trimestral"
              className="w-full p-3 border border-gray-300 rounded-lg text-gray-900"
              required
            />
          </div>

          <div>
            <label
              htmlFor="detalle"
              className="block text-sm font-bold text-gray-700 mb-1"
            >
              Detalle para historia clínica
            </label>
            <textarea
              id="detalle"
              value={detalle}
              onChange={(event) => setDetalle(event.target.value)}
              placeholder="Incluir síntomas reportados, indicaciones previas, etc."
              className="w-full p-3 border border-gray-300 rounded-lg text-gray-900"
              rows={4}
              required
            />
          </div>

          {/* Especialidad */}
          <div>
            <label
              htmlFor="especialidad"
              className="block text-sm font-bold text-gray-700 mb-1"
            >
              Especialidad
            </label>
            <select
              id="especialidad"
              value={especialidad}
              onChange={handleEspecialidadChange}
              className="w-full p-3 border border-gray-300 rounded-lg text-gray-900"
              disabled={noEspecialidades}
              required
            >
              <option value="">-- Seleccione una especialidad --</option>
              {especialidades.map((e, index) => (
                <option key={index} value={e.especialidad}>
                  {e.especialidad}
                </option>
              ))}
            </select>
            {!noEspecialidades ? null : (
              <p className="mt-2 text-sm text-gray-500">
                No hay especialidades registradas. Agrega profesionales para
                habilitar esta opción.
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="profesional"
              className="block text-sm font-bold text-gray-700 mb-1"
            >
              Profesional Disponible
            </label>
            <select
              id="profesional"
              value={profesionalId}
              onChange={handleProfesionalChange}
              className="w-full p-3 border border-gray-300 rounded-lg text-gray-900"
              disabled={isLoadingProfesionales || !especialidad}
              required
            >
              <>
                <option value="">-- Seleccione un profesional --</option>
                {isLoadingProfesionales ? (
                  <option>Cargando profesionales...</option>
                ) : (
                  profesionales.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.apellido}, {p.nombre}
                    </option>
                  ))
                )}
              </>
            </select>
            {!especialidad ||
            isLoadingProfesionales ? null : profesionales.length > 0 ? null : (
              <p className="mt-2 text-sm text-gray-500">
                No hay profesionales disponibles para esta especialidad.
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="fecha"
              className="block text-sm font-bold text-gray-700 mb-1"
            >
              Fecha
            </label>
            <input
              id="fecha"
              type="date"
              value={fecha}
              onChange={(e) => {
                setFecha(e.target.value);
                setHorario("");
                setHorarios([]);
                setSuccessMessage(null);
                setErrorMessage(null);
              }}
              className="w-full p-3 border border-gray-300 rounded-lg text-gray-900"
              disabled={!profesionalId}
              required
            />
          </div>

          <div>
            <label
              htmlFor="duracion"
              className="block text-sm font-bold text-gray-700 mb-1"
            >
              Duración (minutos)
            </label>
            <select
              id="duracion"
              value={duracion}
              onChange={(event) => {
                setDuracion(event.target.value);
                setHorario("");
              }}
              className="w-full p-3 border border-gray-300 rounded-lg text-gray-900"
              disabled={!profesionalId || !fecha}
              required
            >
              {DURACIONES_MINUTOS.map((value) => (
                <option key={value} value={value.toString()}>
                  {value} minutos
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="horario"
              className="block text-sm font-bold text-gray-700 mb-1"
            >
              Horario Disponible
            </label>
            <select
              id="horario"
              value={horario}
              onChange={(e) => setHorario(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg text-gray-900"
              disabled={
                !profesionalId ||
                !fecha ||
                isLoadingHorarios ||
                horarios.length === 0
              }
              required
            >
              <option value="">-- Seleccione un horario --</option>
              {isLoadingHorarios ? (
                <option>Cargando horarios...</option>
              ) : horarios.length === 0 && profesionalId && fecha ? (
                <option disabled>No hay horarios disponibles</option>
              ) : (
                horarios.map((slot) => (
                  <option key={slot} value={slot}>
                    {slot}
                  </option>
                ))
              )}
            </select>
          </div>

          <div className="text-right pt-4">
            <button
              type="submit"
              className="px-6 py-3 text-sm font-bold text-white bg-blue-500 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Registrando..." : "Confirmar Turno"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
