// components/pacientes/nuevo-paciente-dialog.tsx
"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { User, AlertCircle, CheckCircle, X, Loader2 } from "lucide-react"

interface NuevoPacienteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onPacienteCreado: (paciente: any) => void
}

interface ObraSocial {
  id: number
  nombre: string
}

export function NuevoPacienteDialog({ open, onOpenChange, onPacienteCreado }: NuevoPacienteDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)
  const [showErrorDialog, setShowErrorDialog] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [obrasSociales, setObrasSociales] = useState<ObraSocial[]>([])
  const [loadingObrasSociales, setLoadingObrasSociales] = useState(true)

  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    dni: "",
    telefono: "",
    fechaNacimiento: "",
    direccion: "",
    obraSocialId: "",
    numeroAfiliado: "",
  })

  // Cargar obras sociales
  useEffect(() => {
    const fetchObrasSociales = async () => {
      try {
        setLoadingObrasSociales(true)
        const response = await fetch('/api/v1/pacientes')
        if (response.ok) {
          const data = await response.json()
          setObrasSociales(data.obrasSociales || [])
        }
      } catch (error) {
        console.error('Error al cargar obras sociales:', error)
      } finally {
        setLoadingObrasSociales(false)
      }
    }

    if (open) {
      fetchObrasSociales()
    }
  }, [open])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.nombre.trim()) newErrors.nombre = "El nombre es obligatorio"
    if (!formData.apellido.trim()) newErrors.apellido = "El apellido es obligatorio"
    if (!formData.dni.trim()) newErrors.dni = "El DNI es obligatorio"
    if (!formData.telefono.trim()) newErrors.telefono = "El teléfono es obligatorio"
    if (!formData.fechaNacimiento) newErrors.fechaNacimiento = "La fecha de nacimiento es obligatoria"
    if (!formData.direccion.trim()) newErrors.direccion = "La dirección es obligatoria"

    if (formData.dni && !/^\d{7,8}$/.test(formData.dni)) {
      newErrors.dni = "El DNI debe tener 7 u 8 dígitos"
    }

    if (formData.fechaNacimiento) {
      const nacimiento = new Date(formData.fechaNacimiento)
      const hoy = new Date()
      const edad = hoy.getFullYear() - nacimiento.getFullYear()
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
    setErrorMessage("")

    try {
      const nuevoPaciente = {
        nombre: formData.nombre,
        apellido: formData.apellido,
        dni: formData.dni,
        telefono: formData.telefono,
        direccion: formData.direccion,
        fechaNacimiento: formData.fechaNacimiento,
        obraSocialId: formData.obraSocialId ? parseInt(formData.obraSocialId) : null,
        numeroAfiliado: formData.numeroAfiliado || null,
      }

      await onPacienteCreado(nuevoPaciente)
      setShowSuccessDialog(true)
    } catch (error: any) {
      console.error("Error al crear paciente:", error)
      setErrorMessage(error.message || "Error al registrar el paciente")
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
      fechaNacimiento: "",
      direccion: "",
      obraSocialId: "",
      numeroAfiliado: "",
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
  }

  const handleErrorClose = () => {
    setShowErrorDialog(false)
  }

  const updateFormData = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  return (
    <>
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
                  <Input
                    id="fechaNacimiento"
                    type="date"
                    value={formData.fechaNacimiento}
                    onChange={(e) => updateFormData("fechaNacimiento", e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                    className={errors.fechaNacimiento ? "border-destructive" : ""}
                  />
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
                  <Label htmlFor="telefono">Teléfono *</Label>
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

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="direccion">Dirección *</Label>
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
                  <Label htmlFor="obraSocial">Obra Social</Label>
                  {loadingObrasSociales ? (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Cargando obras sociales...
                    </div>
                  ) : (
                    <Select 
                      value={formData.obraSocialId} 
                      onValueChange={(value) => updateFormData("obraSocialId", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar obra social (opcional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Sin obra social</SelectItem>
                        {obrasSociales.map((obra) => (
                          <SelectItem key={obra.id} value={obra.id.toString()}>
                            {obra.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="numeroAfiliado">Número de Afiliado</Label>
                  <Input
                    id="numeroAfiliado"
                    value={formData.numeroAfiliado}
                    onChange={(e) => updateFormData("numeroAfiliado", e.target.value)}
                    placeholder="Ej: 123456789"
                    disabled={!formData.obraSocialId}
                  />
                </div>
              </div>
            </div>

            {/* Botones */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Registrando...
                  </>
                ) : (
                  "Registrar Paciente"
                )}
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
                {errorMessage || "Hubo un problema al registrar el paciente. Por favor, verifica los datos e intenta nuevamente."}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleErrorClose} className="flex-1">
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