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
    obraSocialId: "none",
    numeroAfiliado: "",
  })

  // Función para formatear fecha dd/mm/aaaa
  const formatearFecha = (value: string) => {
    // Remover caracteres no numéricos
    const numeros = value.replace(/\D/g, "")
    
    if (numeros.length === 0) return ""
    if (numeros.length <= 2) return numeros
    if (numeros.length <= 4) return `${numeros.slice(0, 2)}/${numeros.slice(2)}`
    return `${numeros.slice(0, 2)}/${numeros.slice(2, 4)}/${numeros.slice(4, 8)}`
  }

  // Función para convertir dd/mm/aaaa a formato ISO (aaaa-mm-dd)
  const fechaAFormatoISO = (fechaFormateada: string) => {
    if (!fechaFormateada || fechaFormateada.length !== 10) return ""
    
    const [dia, mes, año] = fechaFormateada.split("/")
    if (!dia || !mes || !año) return ""
    
    // Asegurar que tenga el formato correcto
    const diaFormatted = dia.padStart(2, "0")
    const mesFormatted = mes.padStart(2, "0")
    
    return `${año}-${mesFormatted}-${diaFormatted}`
  }

  // Función para convertir formato ISO a dd/mm/aaaa
  const fechaISOAFormateada = (fechaISO: string) => {
    if (!fechaISO) return ""
    const [año, mes, dia] = fechaISO.split("-")
    return `${dia}/${mes}/${año}`
  }

  // Validación en tiempo real para cada campo
  const validarCampo = (campo: string, valor: string) => {
    switch (campo) {
      case "nombre":
        return valor.trim() ? "" : "El nombre es obligatorio"
      case "apellido":
        return valor.trim() ? "" : "El apellido es obligatorio"
      case "dni":
        if (!valor.trim()) return "El DNI es obligatorio"
        if (!/^\d{7,8}$/.test(valor)) return "El DNI debe tener 7 u 8 dígitos"
        return ""
      case "telefono":
        return valor.trim() ? "" : "El teléfono es obligatorio"
      case "direccion":
        return valor.trim() ? "" : "La dirección es obligatoria"
      case "fechaNacimiento":
        if (!valor.trim()) return "La fecha de nacimiento es obligatoria"
        if (valor.length !== 10) return "Formato: dd/mm/aaaa"
        
        const [dia, mes, año] = valor.split("/")
        if (!dia || !mes || !año || año.length !== 4) return "Formato: dd/mm/aaaa"
        
        const diaNum = parseInt(dia)
        const mesNum = parseInt(mes)
        const añoNum = parseInt(año)
        
        if (diaNum < 1 || diaNum > 31) return "Día inválido"
        if (mesNum < 1 || mesNum > 12) return "Mes inválido"
        
        const fechaObj = new Date(añoNum, mesNum - 1, diaNum)
        if (fechaObj.getDate() !== diaNum || fechaObj.getMonth() !== mesNum - 1) {
          return "Fecha inválida"
        }
        
        const hoy = new Date()
        const edad = hoy.getFullYear() - añoNum
        if (edad < 0 || edad > 120) return "La fecha de nacimiento no es válida"
        
        return ""
      default:
        return ""
    }
  }

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

    // Validar todos los campos usando las funciones individuales
    newErrors.nombre = validarCampo("nombre", formData.nombre)
    newErrors.apellido = validarCampo("apellido", formData.apellido)
    newErrors.dni = validarCampo("dni", formData.dni)
    newErrors.telefono = validarCampo("telefono", formData.telefono)
    newErrors.direccion = validarCampo("direccion", formData.direccion)
    newErrors.fechaNacimiento = validarCampo("fechaNacimiento", formData.fechaNacimiento)

    // Filtrar errores vacíos
    const filteredErrors = Object.fromEntries(
      Object.entries(newErrors).filter(([_, value]) => value !== "")
    )

    setErrors(filteredErrors)
    return Object.keys(filteredErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    // Validación adicional de fecha antes del envío
    const fechaISO = fechaAFormatoISO(formData.fechaNacimiento);
    if (!fechaISO) {
      setErrors(prev => ({ ...prev, fechaNacimiento: "Error al convertir la fecha. Verifique el formato." }));
      return;
    }

    setIsSubmitting(true)
    setErrorMessage("")

    try {
      console.log("Fecha original:", formData.fechaNacimiento);
      console.log("Fecha convertida a ISO:", fechaISO);
      
      const nuevoPaciente = {
        nombre: formData.nombre,
        apellido: formData.apellido,
        dni: formData.dni,
        telefono: formData.telefono,
        direccion: formData.direccion,
        fecha_nacimiento: fechaISO,
        id_obra_social: formData.obraSocialId && formData.obraSocialId !== "none" ? parseInt(formData.obraSocialId) : null,
        num_obra_social: formData.numeroAfiliado || null,
      }

      console.log("Objeto a enviar:", nuevoPaciente);

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
      obraSocialId: "none",
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
    let processedValue = value
    
    // Formatear fecha si es el campo fechaNacimiento
    if (field === "fechaNacimiento") {
      processedValue = formatearFecha(value)
    }
    
    setFormData((prev) => ({ ...prev, [field]: processedValue }))
    
    // Validar en tiempo real
    const error = validarCampo(field, processedValue)
    setErrors((prev) => ({ ...prev, [field]: error }))
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
                  <Label htmlFor="nombre" className={errors.nombre ? "text-destructive" : ""}>
                    Nombre *
                  </Label>
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
                  <Label htmlFor="apellido" className={errors.apellido ? "text-destructive" : ""}>
                    Apellido *
                  </Label>
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
                  <Label htmlFor="dni" className={errors.dni ? "text-destructive" : ""}>
                    DNI *
                  </Label>
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
                  <Label htmlFor="fechaNacimiento" className={errors.fechaNacimiento ? "text-destructive" : ""}>
                    Fecha de Nacimiento *
                  </Label>
                  <Input
                    id="fechaNacimiento"
                    type="text"
                    value={formData.fechaNacimiento}
                    onChange={(e) => updateFormData("fechaNacimiento", e.target.value)}
                    placeholder="dd/mm/aaaa"
                    maxLength={10}
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
                  <Label htmlFor="telefono" className={errors.telefono ? "text-destructive" : ""}>
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

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="direccion" className={errors.direccion ? "text-destructive" : ""}>
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
                        <SelectItem value="none">Sin obra social</SelectItem>
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
                    disabled={!formData.obraSocialId || formData.obraSocialId === "none"}
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
              <Button onClick={() => { setShowErrorDialog(false); handleClose(); }} className="flex-1">
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}