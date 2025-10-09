"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { TurnoCard } from "@/components/calendario-mesa/turno-card"
import { TurnoDetailDialog } from "@/components/calendario-mesa/turno-detail-dialog"
import { CancelarTurnoDialog } from "@/components/turnos/cancelar-turno-dialog"
import { useAuth } from "@/context/auth-context"
import { Loader2 } from "lucide-react"

type CancelacionOrigen = "PACIENTE" | "PROFESIONAL"

interface Turno {
  id: string
  hora: string
  paciente: {
    nombre: string
    dni: string
    telefono: string
  }
  profesional: {
    id: string
    nombre: string
    especialidad: string
  }
  estado: "PROGRAMADO" | "EN_SALA_ESPERA" | "ASISTIO" | "NO_ASISTIO" | "CANCELADO"
  motivo: string
  duracion: number
  notas?: string
}

interface TurnoApiResponse {
  id: number
  hora: string
  paciente: {
    nombre: string
    apellido: string
    dni: string
    telefono: string
  }
  profesional: {
    id: number
    nombre: string
    apellido: string
    especialidad: string
  }
  estado: Turno["estado"]
  duracion: number
}

interface CalendarioMesaViewProps {
  selectedDate: Date
  selectedProfesional: string
  selectedEspecialidad: string
}

const generarBloques = () => {
  const bloques = []
  for (let hora = 8; hora < 20; hora++) {
    for (let minuto = 0; minuto < 60; minuto += 15) {
      bloques.push(`${String(hora).padStart(2, '0')}:${String(minuto).padStart(2, '0')}`)
    }
  }
  return bloques
}

const bloquesHorarios = generarBloques()

export function CalendarioMesaView({
  selectedDate,
  selectedProfesional,
  selectedEspecialidad,
}: CalendarioMesaViewProps) {
  const { user } = useAuth()
  const [selectedTurno, setSelectedTurno] = useState<Turno | null>(null)
  const [turnos, setTurnos] = useState<Turno[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [cancelDialog, setCancelDialog] = useState<{ turnoId: string } | null>(null)
  const [isCancelling, setIsCancelling] = useState(false)

  const puedeModificar = user?.rol === "MESA_ENTRADA"

  useEffect(() => {
    async function fetchTurnos() {
      try {
        setLoading(true)
        setError(null)
        
        const dateStr = selectedDate.toISOString().split('T')[0]
        const params = new URLSearchParams({
          from: dateStr,
          to: dateStr,
        })
        
        if (selectedProfesional !== "todos") {
          params.append("profesionalId", selectedProfesional)
        }
        
        if (selectedEspecialidad !== "todas") {
          params.append("especialidad", selectedEspecialidad)
        }
        
        const response = await fetch(`/api/v1/calendario-mesa/turnos?${params}`)
        
        if (!response.ok) {
          throw new Error("Error al cargar los turnos")
        }
        
        const data = (await response.json()) as { turnos: TurnoApiResponse[] }
        
        const turnosFormateados = data.turnos.map((turno) => ({
          id: turno.id.toString(),
          hora: turno.hora,
          paciente: {
            nombre: `${turno.paciente.nombre} ${turno.paciente.apellido}`,
            dni: turno.paciente.dni,
            telefono: turno.paciente.telefono,
          },
          profesional: {
            id: turno.profesional.id.toString(),
            nombre: `${turno.profesional.nombre} ${turno.profesional.apellido}`,
            especialidad: turno.profesional.especialidad,
          },
          estado: turno.estado,
          motivo: "Consulta general",
          duracion: turno.duracion,
          notas: "",
        }))
        
        setTurnos(turnosFormateados)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido")
        setTurnos([])
      } finally {
        setLoading(false)
      }
    }
    
    fetchTurnos()
  }, [selectedDate, selectedProfesional, selectedEspecialidad])

  const handleEstadoChange = async (
    turnoId: string,
    nuevoEstado: Turno["estado"],
    opciones?: { solicitadoPor?: CancelacionOrigen },
  ) => {
    setError(null)
    if (nuevoEstado === "CANCELADO" && (!opciones || !opciones.solicitadoPor)) {
      setCancelDialog({ turnoId })
      return
    }

    const turnoAnterior = turnos.find((t) => t.id === turnoId)

    setTurnos((prev) =>
      prev.map((t) =>
        t.id === turnoId
          ? {
              ...t,
              estado: nuevoEstado,
            }
          : t,
      ),
    )

    try {
      const response = await fetch(`/api/v1/turnos/${turnoId}/estado`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          estado: nuevoEstado,
          solicitadoPor: opciones?.solicitadoPor,
          canceladoPorId: user?.id,
        }),
      })

      if (!response.ok) {
        throw new Error("Error al actualizar el estado del turno")
      }
    } catch (error) {
      console.error("Error al actualizar estado:", error)

      if (turnoAnterior) {
        setTurnos((prev) =>
          prev.map((t) => (t.id === turnoId ? turnoAnterior : t)),
        )
      }
      const errorMessage =
        error instanceof Error
          ? error.message
          : "No se pudo actualizar el estado del turno."
      setError(errorMessage)

      if (nuevoEstado === "CANCELADO") {
        throw error instanceof Error ? error : new Error(errorMessage)
      }
    }
  }

  const handleConfirmCancelacion = async (
    solicitadoPor: CancelacionOrigen,
  ) => {
    if (!cancelDialog) return
    setError(null)
    setIsCancelling(true)
    try {
      await handleEstadoChange(cancelDialog.turnoId, "CANCELADO", {
        solicitadoPor,
      })
      setCancelDialog(null)
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "No se pudo cancelar el turno.",
      )
    } finally {
      setIsCancelling(false)
    }
  }

  const calcularBloques = (duracion: number) => {
    return Math.ceil(duracion / 15)
  }

  const organizarTurnosPorColumnas = () => {
    // Sistema mejorado que evita completamente las superposiciones
    const turnosConBloques = turnos.map(turno => {
      const bloques = calcularBloques(turno.duracion)
      const indiceInicio = bloquesHorarios.indexOf(turno.hora)
      // Calcular altura mínima en bloques (120px = ~2.14 bloques, redondeamos a 3)
      const bloquesMinimos = Math.max(bloques, 3)
      return {
        ...turno,
        bloques,
        bloquesMinimos,
        indiceInicio,
        indiceFin: indiceInicio + bloquesMinimos
      }
    }).filter(t => t.indiceInicio !== -1)
    .sort((a, b) => a.indiceInicio - b.indiceInicio)

    // Estructura para rastrear qué bloques están ocupados en cada columna
    const columnasOcupadas: Array<Set<number>> = []
    const turnosPorColumna: Array<Array<typeof turnosConBloques[0]>> = []

    turnosConBloques.forEach(turno => {
      let columnaAsignada = -1
      
      // Buscar la primera columna donde todos los bloques necesarios estén libres
      for (let col = 0; col < columnasOcupadas.length; col++) {
        let puedePoner = true
        
        // Verificar si todos los bloques que necesita el turno están libres
        for (let bloque = turno.indiceInicio; bloque < turno.indiceFin; bloque++) {
          if (columnasOcupadas[col].has(bloque)) {
            puedePoner = false
            break
          }
        }
        
        if (puedePoner) {
          columnaAsignada = col
          break
        }
      }
      
      // Si no se encontró columna disponible, crear una nueva
      if (columnaAsignada === -1) {
        columnaAsignada = columnasOcupadas.length
        columnasOcupadas.push(new Set())
        turnosPorColumna.push([])
      }
      
      // Marcar todos los bloques como ocupados en esta columna
      for (let bloque = turno.indiceInicio; bloque < turno.indiceFin; bloque++) {
        columnasOcupadas[columnaAsignada].add(bloque)
      }
      
      // Agregar el turno a su columna
      turnosPorColumna[columnaAsignada].push(turno)
    })

    return turnosPorColumna
  }

  const getEstadisticas = () => {
    return {
      total: turnos.length,
      programados: turnos.filter((t) => t.estado === "PROGRAMADO").length,
      enSalaEspera: turnos.filter((t) => t.estado === "EN_SALA_ESPERA").length,
      asistidos: turnos.filter((t) => t.estado === "ASISTIO").length,
      noAsistidos: turnos.filter((t) => t.estado === "NO_ASISTIO").length,
      cancelados: turnos.filter((t) => t.estado === "CANCELADO").length,
    }
  }

  if (loading) {
    return (
      <Card className="p-12 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Cargando turnos...</p>
        </div>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="p-12">
        <div className="text-center space-y-2">
          <p className="text-red-600 font-medium">Error al cargar los turnos</p>
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      </Card>
    )
  }

  const stats = getEstadisticas()
  const columnas = organizarTurnosPorColumnas()
  const anchoColumna = 240 // Ancho reducido de cada columna

  return (
    <div className="space-y-4">
      {/* Estadísticas */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-primary rounded-full"></div>
            <span className="text-sm font-medium">Total</span>
          </div>
          <p className="text-2xl font-bold text-primary">{stats.total}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span className="text-sm font-medium">Programados</span>
          </div>
          <p className="text-2xl font-bold text-blue-600">{stats.programados}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
            <span className="text-sm font-medium">En Sala</span>
          </div>
          <p className="text-2xl font-bold text-yellow-600">{stats.enSalaEspera}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm font-medium">Asistidos</span>
          </div>
          <p className="text-2xl font-bold text-green-600">{stats.asistidos}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
            <span className="text-sm font-medium">No Asistidos</span>
          </div>
          <p className="text-2xl font-bold text-orange-600">{stats.noAsistidos}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <span className="text-sm font-medium">Cancelados</span>
          </div>
          <p className="text-2xl font-bold text-red-600">{stats.cancelados}</p>
        </Card>
      </div>

      {/* Grid de Turnos - SCROLL VERTICAL EXTERNO */}
      <Card className="p-0 overflow-hidden">
        {/* Header fijo */}
        <div className="sticky top-0 bg-background border-b h-12 flex items-center px-4 z-20">
          <span className="text-xs font-semibold text-muted-foreground">CALENDARIO DEL DÍA</span>
        </div>

        {/* Contenedor principal con scroll vertical */}
        <div className="max-h-[calc(100vh-160px)] overflow-y-auto overflow-x-hidden">
          <div className="flex overflow-x-auto pb-4">
            {/* Columna de horas FIJA */}
            <div className="w-16 border-r bg-muted/30 flex-shrink-0 sticky left-0 z-10">
              {bloquesHorarios.map((bloque) => {
                const esInicioHora = bloque.endsWith(':00')
                return (
                  <div 
                    key={`hora-${bloque}`}
                    className={`h-14 flex items-center justify-center ${
                      esInicioHora ? 'border-t-2 border-t-gray-300 bg-muted/50' : 'border-t border-t-gray-100'
                    }`}
                  >
                    {esInicioHora && (
                      <span className="font-mono text-xs font-bold">
                        {bloque}
                      </span>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Área de turnos con SCROLL HORIZONTAL INTERNO */}
            <div className="flex-1 overflow-x-auto">
              <div 
                className="relative"
                style={{ 
                  minWidth: `${columnas.length * anchoColumna}px`,
                  height: `${bloquesHorarios.length * 56}px` // 56px por bloque (h-14)
                }}
              >
                {/* Grid de fondo */}
                {bloquesHorarios.map((bloque, index) => {
                  const esInicioHora = bloque.endsWith(':00')
                  return (
                    <div
                      key={`bg-${bloque}`}
                      className={`absolute w-full ${
                        esInicioHora ? 'border-t-2 border-t-gray-300' : 'border-t border-t-gray-100'
                      }`}
                      style={{
                        top: `${index * 56}px`, //aca 56
                        height: '56px'          //aca 56
                      }}
                    />
                  )
                })}

                {/* Columnas de turnos */}
                {columnas.map((columna, colIndex) => (
                  <div
                    key={`col-${colIndex}`}
                    className="absolute top-0"
                    style={{
                      left: `${colIndex * anchoColumna + 8}px`,
                      width: `${anchoColumna - 16}px`
                    }}
                  >
                    {columna.map((turno) => {
                      const alturaReal = turno.bloques * 56    //56
                      const alturaMinima = 120
                      const alturaFinal = Math.max(alturaReal, alturaMinima)
                      
                      return (
                        <div
                          key={turno.id}
                          className="absolute"
                          style={{
                            top: `${turno.indiceInicio * 56}px`, //56
                            height: `${alturaFinal}px`,
                            width: '100%'
                          }}
                        >
                          <TurnoCard
                            turno={turno}
                            onClick={() => setSelectedTurno(turno)}
                            onEstadoChange={handleEstadoChange}
                            puedeModificar={puedeModificar}
                          />
                        </div>
                      )
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Dialog de detalles */}
      {selectedTurno && (
        <TurnoDetailDialog
          turno={selectedTurno}
          open={!!selectedTurno}
          onOpenChange={(open) => !open && setSelectedTurno(null)}
          onEstadoChange={handleEstadoChange}
          puedeModificar={puedeModificar}
        />
      )}

      <CancelarTurnoDialog
        open={cancelDialog !== null}
        onOpenChange={(open) => {
          if (!open) {
            setCancelDialog(null)
          }
        }}
        onConfirm={async ({ solicitadoPor }) => {
          await handleConfirmCancelacion(solicitadoPor)
        }}
        isSubmitting={isCancelling}
      />
    </div>
  )
}
