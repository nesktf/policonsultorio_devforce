"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { User, Save, X } from "lucide-react"

interface EditarPacienteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  paciente: any
  onPacienteActualizado: (paciente: any) => void
}

export function EditarPacienteDialog({
  open,
  onOpenChange,
  paciente,
  onPacienteActualizado,
}: EditarPacienteDialogProps) {
  const [formData, setFormData] = useState({
    nombre: paciente?.nombre || "",
    apellido: paciente?.apellido || "",
    dni: paciente?.dni || "",
    telefono: paciente?.telefono || "",
    email: paciente?.email || "",
    fechaNacimiento: paciente?.fechaNacimiento || "",
    direccion: paciente?.direccion || "",
    obraSocial: paciente?.obraSocial || "",
    numeroAfiliado: paciente?.numeroAfiliado || "",
    estado: paciente?.estado || "activo",
  })

  const [errors, setErrors] = useState<any>({})

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev: any) => ({ ...prev, [field]: "" }))
    }
  }

  const validateForm = () => {
    const newErrors: any = {}

    if (!formData.nombre.trim()) newErrors.nombre = "El nombre es requerido"
    if (!formData.apellido.trim()) newErrors.apellido = "El apellido es requerido"
    if (!formData.dni.trim()) newErrors.dni = "El DNI es requerido"
    if (!formData.telefono.trim()) newErrors.telefono = "El teléfono es requerido"
    if (!formData.email.trim()) newErrors.email = "El email es requerido"
    if (!formData.fechaNacimiento) newErrors.fechaNacimiento = "La fecha de nacimiento es requerida"
    if (!formData.direccion.trim()) newErrors.direccion = "La dirección es requerida"
    if (!formData.obraSocial.trim()) newErrors.obraSocial = "La obra social es requerida"
    if (!formData.numeroAfiliado.trim()) newErrors.numeroAfiliado = "El número de afiliado es requerido"

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = "El formato del email no es válido"
    }

    // Validar DNI (solo números)
    if (formData.dni && !/^\d+$/.test(formData.dni)) {
      newErrors.dni = "El DNI debe contener solo números"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    const pacienteActualizado = {
      ...paciente,
      ...formData,
    }

    onPacienteActualizado(pacienteActualizado)
  }

  const handleCancel = () => {
    setFormData({
      nombre: paciente?.nombre || "",
      apellido: paciente?.apellido || "",
      dni: paciente?.dni || "",
      telefono: paciente?.telefono || "",
      email: paciente?.email || "",
      fechaNacimiento: paciente?.fechaNacimiento || "",
      direccion: paciente?.direccion || "",
      obraSocial: paciente?.obraSocial || "",
      numeroAfiliado: paciente?.numeroAfiliado || "",
      estado: paciente?.estado || "activo",
    })
    setErrors({})
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Editar Paciente
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Datos Personales */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Datos Personales</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre *</Label>
                <Input
                  id="nombre"
                  value={formData.nombre}
                  onChange={(e) => handleInputChange("nombre", e.target.value)}
                  className={errors.nombre ? "border-red-500" : ""}
                />
                {errors.nombre && <p className="text-sm text-red-500">{errors.nombre}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="apellido">Apellido *</Label>
                <Input
                  id="apellido"
                  value={formData.apellido}
                  onChange={(e) => handleInputChange("apellido", e.target.value)}
                  className={errors.apellido ? "border-red-500" : ""}
                />
                {errors.apellido && <p className="text-sm text-red-500">{errors.apellido}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="dni">DNI *</Label>
                <Input
                  id="dni"
                  value={formData.dni}
                  onChange={(e) => handleInputChange("dni", e.target.value)}
                  className={errors.dni ? "border-red-500" : ""}
                />
                {errors.dni && <p className="text-sm text-red-500">{errors.dni}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="fechaNacimiento">Fecha de Nacimiento *</Label>
                <Input
                  id="fechaNacimiento"
                  type="date"
                  value={formData.fechaNacimiento}
                  onChange={(e) => handleInputChange("fechaNacimiento", e.target.value)}
                  className={errors.fechaNacimiento ? "border-red-500" : ""}
                />
                {errors.fechaNacimiento && <p className="text-sm text-red-500">{errors.fechaNacimiento}</p>}
              </div>
            </div>
          </div>

          {/* Contacto */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Información de Contacto</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="telefono">Teléfono *</Label>
                <Input
                  id="telefono"
                  value={formData.telefono}
                  onChange={(e) => handleInputChange("telefono", e.target.value)}
                  placeholder="11-1234-5678"
                  className={errors.telefono ? "border-red-500" : ""}
                />
                {errors.telefono && <p className="text-sm text-red-500">{errors.telefono}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className={errors.email ? "border-red-500" : ""}
                />
                {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="direccion">Dirección *</Label>
              <Textarea
                id="direccion"
                value={formData.direccion}
                onChange={(e) => handleInputChange("direccion", e.target.value)}
                className={errors.direccion ? "border-red-500" : ""}
                rows={2}
              />
              {errors.direccion && <p className="text-sm text-red-500">{errors.direccion}</p>}
            </div>
          </div>

          {/* Obra Social */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Información Médica</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="obraSocial">Obra Social *</Label>
                <Select value={formData.obraSocial} onValueChange={(value) => handleInputChange("obraSocial", value)}>
                  <SelectTrigger className={errors.obraSocial ? "border-red-500" : ""}>
                    <SelectValue placeholder="Seleccionar obra social" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="OSDE">OSDE</SelectItem>
                    <SelectItem value="Swiss Medical">Swiss Medical</SelectItem>
                    <SelectItem value="Galeno">Galeno</SelectItem>
                    <SelectItem value="IOMA">IOMA</SelectItem>
                    <SelectItem value="PAMI">PAMI</SelectItem>
                    <SelectItem value="Particular">Particular</SelectItem>
                  </SelectContent>
                </Select>
                {errors.obraSocial && <p className="text-sm text-red-500">{errors.obraSocial}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="numeroAfiliado">Número de Afiliado *</Label>
                <Input
                  id="numeroAfiliado"
                  value={formData.numeroAfiliado}
                  onChange={(e) => handleInputChange("numeroAfiliado", e.target.value)}
                  className={errors.numeroAfiliado ? "border-red-500" : ""}
                />
                {errors.numeroAfiliado && <p className="text-sm text-red-500">{errors.numeroAfiliado}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="estado">Estado</Label>
                <Select value={formData.estado} onValueChange={(value) => handleInputChange("estado", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="activo">Activo</SelectItem>
                    <SelectItem value="inactivo">Inactivo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleCancel}>
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button type="submit">
              <Save className="h-4 w-4 mr-2" />
              Guardar Cambios
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
