// src/components/profesionales/ver-profesional-dialog.tsx
"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { User, Phone, MapPin, Briefcase, Stethoscope, Calendar, Clock, Loader2 } from "lucide-react"

// Separator simple si no existe en tu proyecto
const Separator = ({ className = "" }: { className?: string }) => (
  <div className={`border-t border-border ${className}`} />
)

interface ObraSocial {
  id: number
  nombre: string
}

interface Profesional {
  id: number
  nombre: string
  apellido: string
  dni: string
  especialidad: string
  telefono: string
  direccion: string
  obras_sociales?: Array<{
    id_obra_social: number
    obra_social: ObraSocial
  }>
  _count?: {
    turnos: number
    historias: number
  }
}

interface Turno {
  id: number
  fecha: string
  duracion: number
  estado: string
  paciente: {
    id: number
    nombre: string
    apellido: string
    dni: string
    telefono: string
  }
}

interface VerProfesionalDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  profesional: Profesional
}

export function VerProfesionalDialog({
  open,
  onOpenChange,
  profesional,
}: VerProfesionalDialogProps) {
  const [proximosTurnos, setProximosTurnos] = useState<Turno[]>([])
  const [loadingTurnos, setLoadingTurnos] = useState(false)

  useEffect(() => {
    if (open && profesional) {
      fetchProximosTurnos()
    }
  }, [open, profesional])

  const fetchProximosTurnos = async () => {
    setLoadingTurnos(true)
    try {
      // Usamos la API v2/turnos que permite filtrar por profesional
      const ahora = new Date()
      const dentroDeUnMes = new Date()
      dentroDeUnMes.setMonth(dentroDeUnMes.getMonth() + 1)

      const from = ahora.toISOString().split('T')[0]
      const to = dentroDeUnMes.toISOString().split('T')[0]

      const response = await fetch(
        `/api/v1/turnos?from=${from}&to=${to}&profesionalId=${profesional.id}`
      )

      if (response.ok) {
        const data = await response.json()
        // Filtrar solo turnos futuros y tomar los primeros 3
        const turnosFuturos = data.turnos
          .filter((t: Turno) => new Date(t.fecha) > ahora)
          .slice(0, 3)
        setProximosTurnos(turnosFuturos)
      }
    } catch (error) {
      console.error('Error al cargar turnos:', error)
    } finally {
      setLoadingTurnos(false)
    }
  }

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  const formatearHora = (fecha: string) => {
    return new Date(fecha).toLocaleTimeString("es-AR", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getEstadoBadge = (estado: string) => {
    const estadoMap: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", label: string }> = {
      PROGRAMADO: { variant: "default", label: "Programado" },
      EN_SALA_ESPERA: { variant: "secondary", label: "En Sala de Espera" },
      ASISTIO: { variant: "outline", label: "Asistió" },
      NO_ASISTIO: { variant: "destructive", label: "No Asistió" },
      CANCELADO: { variant: "outline", label: "Cancelado" },
    }

    const config = estadoMap[estado] || { variant: "default" as const, label: estado }
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Detalles del Profesional
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Información Personal */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Información Personal</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Nombre Completo</p>
                  <p className="text-base font-medium">
                    {profesional.apellido}, {profesional.nombre}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">DNI</p>
                  <p className="text-base">{profesional.dni}</p>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Stethoscope className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Especialidad</p>
                    <Badge variant="secondary" className="mt-1">
                      {profesional.especialidad}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Teléfono</p>
                    <p className="text-base">{profesional.telefono}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Dirección</p>
                  <p className="text-base">{profesional.direccion}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Obras Sociales */}
          {profesional.obras_sociales && profesional.obras_sociales.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Obras Sociales
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {profesional.obras_sociales.map((os, index) => (
                    <Badge key={`${os.id_obra_social}-${index}`} variant="outline">
                      {os.obra_social.nombre}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Estadísticas */}
          {profesional._count && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Estadísticas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm font-medium text-blue-900">Total de Turnos</p>
                    <p className="text-2xl font-bold text-blue-700">{profesional._count.turnos}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Próximos Turnos */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Próximos Turnos
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingTurnos ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : proximosTurnos.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No hay turnos programados próximamente
                </p>
              ) : (
                <div className="space-y-3">
                  {proximosTurnos.map((turno) => (
                    <div
                      key={turno.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex flex-col items-center justify-center bg-primary/10 rounded-lg p-2 min-w-[60px]">
                          <span className="text-xs font-medium text-primary">
                            {formatearFecha(turno.fecha).split('/')[0]}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(turno.fecha).toLocaleDateString("es-AR", { month: "short" })}
                          </span>
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">
                            {turno.paciente.apellido}, {turno.paciente.nombre}
                          </p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>{formatearHora(turno.fecha)}</span>
                            <span>•</span>
                            <span>{turno.duracion} min</span>
                          </div>
                        </div>
                      </div>
                      {getEstadoBadge(turno.estado)}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}