"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { CalendarIcon, User, Phone, Mail, MapPin, CreditCard, AlertCircle, CheckCircle, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface NuevoPacienteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onPacienteCreado: (paciente: any) => void
}

const obrasSociales = ["OSDE", "Swiss Medical", "Galeno", "IOMA", "PAMI", "Medicus", "Sancor Salud", "Particular"]

export function NuevoPacienteDialog({ open, onOpenChange, onPacienteCreado }: NuevoPacienteDialogProps) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)
  const [showErrorDialog, setShowErrorDialog] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Estados del formulario
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    dni: "",
    telefono: "",
    email: "",
    fechaNacimiento: undefined as Date | undefined,
    direccion: "",
    obraSocial: "",
    numeroAfiliado: "",
    contactoEmergencia: "",
    telefonoEmergencia: "",
    observaciones: "",
  })

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    // Campos obligatorios
    if (!formData.nombre.trim()) newErrors.nombre = "El nombre es obligatorio"
    if (!formData.apellido.trim()) newErrors.apellido = "El apellido es obligatorio"
    if (!formData.dni.trim()) newErrors.dni = "El DNI es obligatorio"
    if (!formData.telefono.trim()) newErrors.telefono = "El teléfono es obligatorio"
    if (!formData.email.trim()) newErrors.email = "El email es obligatorio"
    if (!formData.fechaNacimiento) newErrors.fechaNacimiento = "La fecha de nacimiento es obligatoria"
    if (!formData.direccion.trim()) newErrors.direccion = "La dirección es obligatoria"
    if (!formData.obraSocial) newErrors.obraSocial = "La obra social es obligatoria"

    // Validaciones específicas
    if (formData.dni && !/^\d{7,8}$/.test(formData.dni)) {
      newErrors.dni = "El DNI debe tener 7 u 8 dígitos"
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "El email no tiene un formato válido"
    }

    if (formData.telefono && !/^[\d\s\-+$$$$]{8,}$/.test(formData.telefono)) {
      newErrors.telefono = "El teléfono no tiene un formato válido"
    }

    // Validar edad (no menor a 0 años, no mayor a 120 años)
    if (formData.fechaNacimiento) {
      const hoy = new Date()
      const edad = hoy.getFullYear() - formData.fechaNacimiento.getFullYear()
      if (edad < 0 || edad > 120) {
        newErrors.fechaNacimiento = "La fecha de nacimiento no es válida"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      // Simular llamada a API
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          // Simular éxito/error aleatoriamente para demostración
          if (Math.random() > 0.1) {
            // 90% éxito
            resolve(true)
          } else {
            reject(new Error("Error de conexión"))
          }
        }, 1500)
      })

      // Si llegamos aquí, fue exitoso
      const nuevoPaciente = {
        ...formData,
        fechaNacimiento: formData.fechaNacimiento?.toISOString().split("T")[0],
        ultimaConsulta: null,
      }

      onPacienteCreado(nuevoPaciente)
      setShowSuccessDialog(true)
    } catch (error) {
      console.error("Error al crear paciente:", error)
      setShowErrorDialog(true)
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setFormData({
      nombre: "",
      apellido: "",
      dni: "",
      telefono: "",
      email: "",
      fechaNacimiento: undefined,
      direccion: "",
      obraSocial: "",
      numeroAfiliado: "",
      contactoEmergencia: "",
      telefonoEmergencia: "",
      observaciones: "",
    })
    setErrors({})
  }

  const handleClose = () => {
    resetForm()
    onOpenChange(false)
  }

  const handleSuccessClose = () => {
    setShowSuccessDialog(false)
    handleClose()
    toast({
      title: "¡Paciente registrado exitosamente!",
      description: `${formData.nombre} ${formData.apellido} ha sido agregado al sistema.`,
    })
  }

  const handleErrorClose = () => {
    setShowErrorDialog(false)
  }

  const updateFormData = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  return (
    <>
      {/* Dialog principal */}
      <Dialog open={open && !showSuccessDialog && !showErrorDialog} onOpenChange={handleClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Registrar Nuevo Paciente
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Información personal */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground border-b pb-2">Información Personal</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre *</Label>
                  <Input
                    id="nombre"
                    value={formData.nombre}
                    onChange={(e) => updateFormData("nombre", e.target.value)}
                    placeholder="Ej: María"
                    className={errors.nombre ? "border-destructive" : ""}
                  />
                  {errors.nombre && (
                    <p className="text-sm text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.nombre}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="apellido">Apellido *</Label>
                  <Input
                    id="apellido"
                    value={formData.apellido}
                    onChange={(e) => updateFormData("apellido", e.target.value)}
                    placeholder="Ej: González"
                    className={errors.apellido ? "border-destructive" : ""}
                  />
                  {errors.apellido && (
                    <p className="text-sm text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.apellido}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dni">DNI *</Label>
                  <Input
                    id="dni"
                    value={formData.dni}
                    onChange={(e) => updateFormData("dni", e.target.value.replace(/\D/g, ""))}
                    placeholder="Ej: 12345678"
                    maxLength={8}
                    className={errors.dni ? "border-destructive" : ""}
                  />
                  {errors.dni && (
                    <p className="text-sm text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.dni}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fechaNacimiento">Fecha de Nacimiento *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !formData.fechaNacimiento && "text-muted-foreground",
                          errors.fechaNacimiento && "border-destructive",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.fechaNacimiento
                          ? format(formData.fechaNacimiento, "PPP", { locale: es })
                          : "Seleccionar fecha"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={formData.fechaNacimiento}
                        onSelect={(date) => updateFormData("fechaNacimiento", date)}
                        disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  {errors.fechaNacimiento && (
                    <p className="text-sm text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.fechaNacimiento}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Información de contacto */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground border-b pb-2">Información de Contacto</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="telefono" className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Teléfono *
                  </Label>
                  <Input
                    id="telefono"
                    value={formData.telefono}
                    onChange={(e) => updateFormData("telefono", e.target.value)}
                    placeholder="Ej: 11-1234-5678"
                    className={errors.telefono ? "border-destructive" : ""}
                  />
                  {errors.telefono && (
                    <p className="text-sm text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.telefono}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateFormData("email", e.target.value)}
                    placeholder="Ej: maria@email.com"
                    className={errors.email ? "border-destructive" : ""}
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.email}
                    </p>
                  )}
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="direccion" className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Dirección *
                  </Label>
                  <Input
                    id="direccion"
                    value={formData.direccion}
                    onChange={(e) => updateFormData("direccion", e.target.value)}
                    placeholder="Ej: Av. Corrientes 1234, CABA"
                    className={errors.direccion ? "border-destructive" : ""}
                  />
                  {errors.direccion && (
                    <p className="text-sm text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.direccion}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Información de obra social */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground border-b pb-2">Obra Social</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="obraSocial" className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    Obra Social *
                  </Label>
                  <Select value={formData.obraSocial} onValueChange={(value) => updateFormData("obraSocial", value)}>
                    <SelectTrigger className={errors.obraSocial ? "border-destructive" : ""}>
                      <SelectValue placeholder="Seleccionar obra social" />
                    </SelectTrigger>
                    <SelectContent>
                      {obrasSociales.map((obra) => (
                        <SelectItem key={obra} value={obra}>
                          {obra}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.obraSocial && (
                    <p className="text-sm text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.obraSocial}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="numeroAfiliado">Número de Afiliado</Label>
                  <Input
                    id="numeroAfiliado"
                    value={formData.numeroAfiliado}
                    onChange={(e) => updateFormData("numeroAfiliado", e.target.value)}
                    placeholder="Ej: 123456789"
                  />
                </div>
              </div>
            </div>

            {/* Contacto de emergencia */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground border-b pb-2">Contacto de Emergencia</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contactoEmergencia">Nombre del Contacto</Label>
                  <Input
                    id="contactoEmergencia"
                    value={formData.contactoEmergencia}
                    onChange={(e) => updateFormData("contactoEmergencia", e.target.value)}
                    placeholder="Ej: Juan Pérez (hermano)"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="telefonoEmergencia">Teléfono de Emergencia</Label>
                  <Input
                    id="telefonoEmergencia"
                    value={formData.telefonoEmergencia}
                    onChange={(e) => updateFormData("telefonoEmergencia", e.target.value)}
                    placeholder="Ej: 11-9876-5432"
                  />
                </div>
              </div>
            </div>

            {/* Observaciones */}
            <div className="space-y-2">
              <Label htmlFor="observaciones">Observaciones</Label>
              <Textarea
                id="observaciones"
                value={formData.observaciones}
                onChange={(e) => updateFormData("observaciones", e.target.value)}
                placeholder="Información adicional sobre el paciente..."
                rows={3}
              />
            </div>

            {/* Botones */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Registrando..." : "Registrar Paciente"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog de éxito */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="max-w-md">
          <div className="text-center space-y-4">
            <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <DialogTitle className="text-lg font-semibold text-green-800">
                ¡Paciente Registrado Exitosamente!
              </DialogTitle>
              <p className="text-sm text-muted-foreground mt-2">
                {formData.nombre} {formData.apellido} ha sido agregado al sistema correctamente.
              </p>
            </div>
            <Button onClick={handleSuccessClose} className="w-full">
              Continuar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog de error */}
      <Dialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
        <DialogContent className="max-w-md">
          <div className="text-center space-y-4">
            <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <X className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <DialogTitle className="text-lg font-semibold text-red-800">Error al Registrar Paciente</DialogTitle>
              <p className="text-sm text-muted-foreground mt-2">
                Hubo un problema al registrar el paciente. Por favor, verifica los datos e intenta nuevamente.
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleErrorClose} className="flex-1 bg-transparent">
                Reintentar
              </Button>
              <Button onClick={handleClose} className="flex-1">
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
