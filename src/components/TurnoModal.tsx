import { Turno } from "./RegistrarTurnoSection";

interface TurnoModalProps {
  turno: Turno;
  onClose: () => void;
  onChangeEstado: (nuevoEstado: string) => void;
}

const estadosProgreso = [
  "Programado",
  "Confirmado",
  "En Sala de Espera",
  "En Consulta",
  "Completado",
];

const estadosFinales = ["No Asistió", "Cancelado", "Reprogramado"];

export function TurnoModal({
  turno,
  onClose,
  onChangeEstado,
}: TurnoModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl p-6 relative space-y-6">
        {/* Botón de cerrar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-lg"
        >
          ✕
        </button>

        {/* Cabecera */}
        <div className="space-y-1 text-gray-700">
          <h2 className="text-xl font-semibold text-gray-800">
            Detalle del Turno
          </h2>
          <p>
            <span className="font-medium text-gray-800">Paciente:</span>{" "}
            {turno.paciente}
          </p>
          <p>
            <span className="font-medium text-gray-800">Hora:</span>{" "}
            {new Date(turno.fechaIso).toLocaleTimeString("es-AR", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            })}
          </p>
          <p>
            <span className="font-medium text-gray-800">Profesional:</span>{" "}
            {turno.profesional}
          </p>
        </div>

        {/* Progreso del turno */}
        <div>
          <h3 className="text-sm font-medium text-gray-600 mb-2">
            Progreso del Turno
          </h3>
          <div className="space-y-2">
            {estadosProgreso.map((estado) => {
              const activo = turno.estado === estado;
              return (
                <div
                  key={estado}
                  className={`flex justify-between items-center p-3 rounded-lg border transition-colors
                    ${
                      activo
                        ? "bg-green-50 border-green-600 text-green-800"
                        : "bg-gray-50 border-gray-300 text-gray-700"
                    }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">{estado}</span>
                  </div>
                  {!activo && (
                    <button
                      className="text-green-600 font-medium hover:underline"
                      onClick={() => onChangeEstado(estado)}
                    >
                      Marcar
                    </button>
                  )}
                  {activo && (
                    <svg
                      className="h-5 w-5 text-green-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Estados finales */}
        <div>
          <h3 className="text-sm font-medium text-gray-600 mt-4 mb-2">
            Estados Finales Alternativos
          </h3>
          <div className="space-y-2">
            {estadosFinales.map((estado) => (
              <div
                key={estado}
                className="flex justify-between items-center p-3 rounded-lg border bg-gray-50 border-gray-300 text-gray-700"
              >
                <span>{estado}</span>
                <button
                  className="text-red-600 font-medium hover:underline"
                  onClick={() => onChangeEstado(estado)}
                >
                  Marcar
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
