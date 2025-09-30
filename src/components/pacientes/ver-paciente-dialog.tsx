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
    return new Date(fecha).toLocaleDateString("es-AR")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
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
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold">
                    {paciente.apellido}, {paciente.nombre}
                  </h3>
                  <p className="text-muted-foreground">{calcularEdad(paciente.fechaNacimiento)} años</p>
                </div>
                <Badge
                  variant={paciente.estado === "activo" ? "secondary" : "outline"}
                  className={paciente.estado === "activo" ? "text-green-700 bg-green-100" : ""}
                >
                  {paciente.estado === "activo" ? "Activo" : "Inactivo"}
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">DNI:</span>
                  <span>{paciente.dni}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Nacimiento:</span>
                  <span>{formatearFecha(paciente.fechaNacimiento)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Teléfono:</span>
                  <span>{paciente.telefono}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Email:</span>
                  <span>{paciente.email}</span>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                <div>
                  <span className="font-medium">Dirección:</span>
                  <p className="text-muted-foreground">{paciente.direccion}</p>
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
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="font-medium">Obra Social:</span>
                  <p className="text-muted-foreground">{paciente.obraSocial}</p>
                </div>
                <div>
                  <span className="font-medium">Número de Afiliado:</span>
                  <p className="text-muted-foreground">{paciente.numeroAfiliado}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Última Consulta:</span>
                  <span>{formatearFecha(paciente.ultimaConsulta)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Fecha de Registro:</span>
                  <span>{formatearFecha(paciente.fechaRegistro)}</span>
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
