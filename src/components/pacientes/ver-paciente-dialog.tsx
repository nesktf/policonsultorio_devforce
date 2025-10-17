"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { User, Phone, Mail, MapPin, CreditCard, Calendar, Clock, Activity } from "lucide-react"

interface VerPacienteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  paciente: any
}

export function VerPacienteDialog({ open, onOpenChange, paciente }: VerPacienteDialogProps) {
  const calcularEdad = (fechaNacimiento: string) => {
    const hoy = new Date()
    const nacimiento = new Date(fechaNacimiento)
    let edad = hoy.getFullYear() - nacimiento.getFullYear()
    const mes = hoy.getMonth() - nacimiento.getMonth()

    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--
    }

    return edad
  }

  const formatearFecha = (fecha: string) => {
    if (!fecha) return "No registrada"
    
    try {
      const fechaObj = new Date(fecha)
      if (isNaN(fechaObj.getTime())) return "Fecha inválida"
      
      return fechaObj.toLocaleDateString("es-AR")
    } catch (error) {
      return "Fecha inválida"
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Información del Paciente
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Información Personal */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-4 w-4" />
                Datos Personales
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-2xl font-semibold">
                    {paciente.apellido}, {paciente.nombre}
                  </h3>
                  <p className="text-base text-muted-foreground mt-1">{calcularEdad(paciente.fechaNacimiento)} años</p>
                </div>
                <Badge
                  variant={paciente.estado === "activo" ? "secondary" : "outline"}
                  className={paciente.estado === "activo" ? "text-green-700 bg-green-100" : ""}
                >
                  {paciente.estado === "activo" ? "Activo" : "Inactivo"}
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="flex items-center gap-3">
                  <CreditCard className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  <div>
                    <span className="text-sm font-medium text-muted-foreground block">DNI</span>
                    <span className="text-base">{paciente.dni}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  <div>
                    <span className="text-sm font-medium text-muted-foreground block">Nacimiento</span>
                    <span className="text-base">{formatearFecha(paciente.fechaNacimiento)}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <Phone className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                <div>
                  <span className="text-sm font-medium text-muted-foreground block">Teléfono</span>
                  <span className="text-base">{paciente.telefono}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2 border-t">
                <Mail className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <span className="text-sm font-medium text-muted-foreground block">Email</span>
                  <span className="text-base">{paciente.email}</span>
                </div>
              </div>

              <div className="flex items-start gap-3 pt-2 border-t">
                <MapPin className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-sm font-medium text-muted-foreground block mb-1">Dirección</span>
                  <p className="text-base">{paciente.direccion}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Información Médica */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Información Médica
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <span className="text-sm font-medium text-muted-foreground block mb-1">Obra Social</span>
                  <p className="text-base">{paciente.obraSocial || "No registrada"}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-muted-foreground block mb-1">Número de Afiliado</span>
                  <p className="text-base">{paciente.numeroAfiliado || "No registrado"}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  <div>
                    <span className="text-sm font-medium text-muted-foreground block">Última Consulta</span>
                    <span className="text-base">{formatearFecha(paciente.ultimaConsulta)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  <div>
                    <span className="text-sm font-medium text-muted-foreground block">Fecha de Registro</span>
                    <span className="text-base">{formatearFecha(paciente.fechaRegistro)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Turnos Reservados */}
          {paciente.turnosReservados && paciente.turnosReservados.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Turnos Reservados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {paciente.turnosReservados.map((turno: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{formatearFecha(turno.fecha)}</p>
                        <p className="text-sm text-muted-foreground">Profesional ID: {turno.profesionalId}</p>
                      </div>
                      <Badge variant={turno.estado === "confirmado" ? "secondary" : "outline"}>{turno.estado}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
