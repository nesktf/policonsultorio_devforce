"use client";

import { useEffect, useState } from "react";
import { RegistrarTurnoClient } from "./RegistrarTurnoClient";
import { TurnoModal } from "./TurnoModal";

interface RegistrarTurnoSectionProps {
  pacientes: { id: number; nombre: string; apellido: string; dni: string }[];
  especialidades: { especialidad: string }[];
  turnosIniciales: {
    id: number;
    paciente: string;
    profesional: string;
    fechaIso: string;
    estado: string;
  }[];
}

export interface Turno {
  id: number;
  paciente: string;
  profesional: string;
  fechaIso: string;
  estado: string;
}

export function RegistrarTurnoSection({
  pacientes,
  especialidades,
  turnosIniciales,
}: RegistrarTurnoSectionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [turnos, setTurnos] = useState(() =>
    [...turnosIniciales].sort(
      (a, b) => new Date(a.fechaIso).getTime() - new Date(b.fechaIso).getTime()
    )
  );

  const [selectedTurno, setSelectedTurno] = useState<Turno | null>(null);

  // Ordenamiento
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Turno;
    direction: "asc" | "desc";
  } | null>(null);

  const sortedTurnos = [...turnos].sort((a, b) => {
    if (!sortConfig) return 0;
    const { key, direction } = sortConfig;

    let aValue: any = a[key];
    let bValue: any = b[key];

    if (key === "fechaIso") {
      aValue = new Date(aValue).getTime();
      bValue = new Date(bValue).getTime();
    }

    if (aValue < bValue) return direction === "asc" ? -1 : 1;
    if (aValue > bValue) return direction === "asc" ? 1 : -1;
    return 0;
  });

  const requestSort = (key: keyof Turno) => {
    let direction: "asc" | "desc" = "asc";
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === "asc"
    ) {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  // Bloquear scroll cuando el modal está abierto
  useEffect(() => {
    if (!isOpen && !selectedTurno) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, selectedTurno]);

  // Función para cambiar el estado del turno
  const cambiarEstadoTurno = (nuevoEstado: string) => {
    if (!selectedTurno) return;

    setTurnos((prev) =>
      prev.map((turno) =>
        turno.id === selectedTurno.id
          ? { ...turno, estado: nuevoEstado }
          : turno
      )
    );
  };

  // Función para mostrar badge de estado
  const renderEstadoBadge = (estado: string) => {
    const colorMap: Record<string, string> = {
      programado: "bg-blue-100 text-blue-700",
      "en consulta": "bg-yellow-100 text-yellow-700",
      completado: "bg-green-100 text-green-700",
      cancelado: "bg-red-100 text-red-700",
      "no asistio": "bg-gray-200 text-gray-600",
      "sala de espera": "bg-purple-100 text-purple-700",
    };

    return (
      <span
        className={`px-2 py-1 text-xs font-semibold rounded-full ${
          colorMap[estado] || "bg-gray-100 text-gray-600"
        }`}
      >
        {estado}
      </span>
    );
  };

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

      {/* Modal de Registrar turno */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 p-4">
          <div className="relative w-full max-w-5xl rounded-2xl bg-white shadow-lg">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <h3 className="text-lg font-semibold text-black">
                Registrar un nuevo turno
              </h3>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Cerrar formulario"
              >
                ✕
              </button>
            </div>

            <div className="max-h-[80vh] overflow-y-auto px-6 py-4">
              <RegistrarTurnoClient
                pacientes={pacientes}
                especialidades={especialidades}
                onTurnoRegistrado={({
                  id,
                  fechaIso,
                  paciente,
                  profesional,
                }) => {
                  setTurnos((prev) => {
                    const sinDuplicados = prev.filter(
                      (turno) => turno.id !== id
                    );
                    return [
                      ...sinDuplicados,
                      {
                        id,
                        paciente,
                        profesional,
                        fechaIso,
                        estado: "programado",
                      },
                    ].sort(
                      (a, b) =>
                        new Date(a.fechaIso).getTime() -
                        new Date(b.fechaIso).getTime()
                    );
                  });
                }}
                onCloseModal={() => setIsOpen(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Tabla */}
      <section className="bg-white rounded-xl shadow-lg border-2 border-[#AFE1EA]">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-sm border-b-2 border-[#AFE1EA] bg-[#E4F1F9]">
              <tr>
                {[
                  { key: "id", label: "ID" },
                  { key: "paciente", label: "Paciente" },
                  { key: "profesional", label: "Profesional" },
                  { key: "fechaIso", label: "Fecha" },
                  { key: "estado", label: "Estado", sortable: false },
                ].map(({ key, label, sortable = true }) => (
                  <th
                    key={key}
                    onClick={
                      sortable
                        ? () => requestSort(key as keyof Turno)
                        : undefined
                    }
                    className={`px-6 py-4 font-bold text-[#0AA2C7] ${
                      sortable ? "cursor-pointer select-none" : ""
                    }`}
                  >
                    {label}{" "}
                    {sortable &&
                      sortConfig?.key === key &&
                      (sortConfig.direction === "asc" ? "↑" : "↓")}
                  </th>
                ))}
                <th className="px-6 py-4 font-bold text-[#0AA2C7]">Hora</th>
                <th className="px-6 py-4 font-bold text-[#0AA2C7]">Acción</th>
              </tr>
            </thead>
            <tbody>
              {sortedTurnos.length > 0 ? (
                sortedTurnos.map((turno) => {
                  const timeZone = "America/Argentina/Buenos_Aires";
                  const fechaDate = new Date(turno.fechaIso);
                  const fecha = new Intl.DateTimeFormat("es-AR", {
                    timeZone,
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                  }).format(fechaDate);
                  const hora = new Intl.DateTimeFormat("es-AR", {
                    timeZone,
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                  }).format(fechaDate);

                  return (
                    <tr
                      key={turno.id}
                      className="border-b border-gray-200 hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {turno.id}
                      </td>
                      <td className="px-6 py-4 text-gray-900">
                        {turno.paciente}
                      </td>
                      <td className="px-6 py-4 text-gray-900">
                        {turno.profesional}
                      </td>
                      <td className="px-6 py-4 text-gray-900">{fecha}</td>
                      <td className="px-6 py-4">
                        {renderEstadoBadge(turno.estado)}
                      </td>
                      <td className="px-6 py-4 text-gray-600">{hora}</td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => setSelectedTurno(turno)}
                          className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                        >
                          Ver detalle
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    className="px-6 py-6 text-center text-sm text-gray-500"
                    colSpan={7}
                  >
                    Aún no hay turnos registrados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Modal con detalle del turno */}
      {selectedTurno && (
        <TurnoModal
          turno={selectedTurno}
          onClose={() => setSelectedTurno(null)}
          onChangeEstado={cambiarEstadoTurno}
        />
      )}
    </div>
  );
}
