"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TurnoCard } from "@/components/calendario-mesa/turno-card"
import { TurnoDetailDialog } from "@/components/calendario-mesa/turno-detail-dialog"
import { useAuth } from "@/context/auth-context"
import { Clock, Loader2 } from "lucide-react"


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
// Constante para la altura de cada fila de 15 minutos en píxeles.
const ROW_HEIGHT_PX = 105

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
        
        const data = await response.json()
        
        const turnosFormateados = data.turnos.map((turno: any) => ({
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

  const handleEstadoChange = async (turnoId: string, nuevoEstado: Turno["estado"]) => {
    const turnoAnterior = turnos.find(t => t.id === turnoId)
    
    setTurnos((prev) =>
      prev.map((t) =>
        t.id === turnoId ? { ...t, estado: nuevoEstado } : t
      )
    )
    
    try {
      const response = await fetch(`/api/v1/turnos/${turnoId}/estado`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: nuevoEstado })
      })
      
      if (!response.ok) {
        throw new Error('Error al actualizar el estado del turno')
      }
    } catch (error) {
      console.error('Error al actualizar estado:', error)
      
      if (turnoAnterior) {
        setTurnos((prev) =>
          prev.map((t) =>
            t.id === turnoId ? turnoAnterior : t
          )
        )
      }
    }
  }

  const calcularBloques = (duracion: number) => {
    if (duracion <= 0) return 1
    return Math.ceil(duracion / 15)
  }

  const organizarTurnosPorColumnas = () => {
    const turnosConBloques = turnos.map(turno => {
      const bloques = calcularBloques(turno.duracion)
      const indiceInicio = bloquesHorarios.indexOf(turno.hora)
      return {
        ...turno,
        bloques,
        indiceInicio,
        indiceFin: indiceInicio + bloques,
      }
    })
    .filter(t => t.indiceInicio !== -1)
    .sort((a, b) => a.indiceInicio - b.indiceInicio || b.bloques - a.bloques)

    const columnasOcupadas: Array<Array<{ inicio: number; fin: number }>> = []
    const turnosPorColumna: Array<Array<typeof turnosConBloques[0]>> = []

    turnosConBloques.forEach(turno => {
      let columnaAsignada = -1
      
      for (let col = 0; col < columnasOcupadas.length; col++) {
        const seSuperpone = columnasOcupadas[col].some(
          turnoPuesto => turno.indiceInicio < turnoPuesto.fin && turno.indiceFin > turnoPuesto.inicio
        )
        if (!seSuperpone) {
          columnaAsignada = col
          break
        }
      }
      
      if (columnaAsignada === -1) {
        columnaAsignada = columnasOcupadas.length
        columnasOcupadas.push([])
        turnosPorColumna.push([])
      }
      
      columnasOcupadas[columnaAsignada].push({ inicio: turno.indiceInicio, fin: turno.indiceFin })
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

  if (loading) {
    return (
      <Card className="p-12 flex items-center justify-center min-h-[500px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Cargando turnos...</p>
        </div>
      </Card>
    )
  }

  const columnas = organizarTurnosPorColumnas()
  const anchoColumna = 240

  return (
    <>
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
      
      <Card className="p-0 overflow-hidden">
        <div className="max-h-[calc(100vh-100px)] overflow-y-auto">
          <div className="flex">
            {/* Columna de horas FIJA */}
            <div className="w-20 border-r bg-muted/30 flex-shrink-0 sticky top-0 left-0 z-10">
              {bloquesHorarios.map((bloque) => {
                const esInicioHora = bloque.endsWith(':00')
                return (
                  <div 
                    key={`hora-${bloque}`}
                    className={`flex items-center justify-center text-center ${
                      esInicioHora ? 'border-t-2 border-t-slate-300' : 'border-t border-t-slate-200'
                    }`}
                    style={{ height: `${ROW_HEIGHT_PX}px` }}
                  >
                    {esInicioHora && (
                      <span className="font-mono text-xs font-bold text-slate-600">
                        {bloque}
                      </span>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Área de turnos con SCROLL HORIZONTAL */}
            <div className="flex-1">
              <div 
                className="relative"
                style={{ 
                  width: `${columnas.length * anchoColumna}px`,
                  minWidth: '100%',
                  height: `${bloquesHorarios.length * ROW_HEIGHT_PX}px`
                }}
              >
                {/* Grid de fondo */}
                {bloquesHorarios.map((_, index) => {
                  const esInicioHora = bloquesHorarios[index].endsWith(':00')
                  return (
                    <div
                      key={`bg-${index}`}
                      className={`absolute w-full ${
                        esInicioHora ? 'border-t-2 border-t-slate-300' : 'border-t border-t-slate-200'
                      }`}
                      style={{
                        top: `${index * ROW_HEIGHT_PX}px`,
                        height: `${ROW_HEIGHT_PX}px`
                      }}
                    />
                  )
                })}

                {/* Columnas de turnos */}
                {columnas.map((columna, colIndex) => (
                  <div
                    key={`col-${colIndex}`}
                    className="absolute top-0 h-full"
                    style={{
                      left: `${colIndex * anchoColumna}px`,
                      width: `${anchoColumna}px`,
                      padding: '0 4px',
                    }}
                  >
                    {columna.map((turno) => {
                      const alturaCalculada = turno.bloques * ROW_HEIGHT_PX
                      return (
                        <div
                          key={turno.id}
                          className="absolute w-[calc(100%-8px)]"
                          style={{
                            top: `${turno.indiceInicio * ROW_HEIGHT_PX}px`,
                            height: `${alturaCalculada - 2}px`,
                            marginTop: '1px',
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

      {selectedTurno && (
        <TurnoDetailDialog
          turno={selectedTurno}
          open={!!selectedTurno}
          onOpenChange={(open) => !open && setSelectedTurno(null)}
          onEstadoChange={handleEstadoChange}
          puedeModificar={puedeModificar}
        />
      )}
    </>
  )
}

