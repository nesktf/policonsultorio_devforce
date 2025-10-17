// src/components/profesionales/registrar-profesional-modal.tsx
"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react"

export interface DatosProfesionalFormulario {
  nombre: string
  apellido: string
  dni: string
  especialidad: string
  telefono: string
  direccion: string
  obras_sociales_ids: number[]
  nombreUsuario?: string
  email?: string
  password?: string
  rol?: string
}

interface ObraSocial {
  id: number
  nombre: string
}

interface RegistrarProfesionalModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onProfesionalRegistrado: () => void
}

export function RegistrarProfesionalModal({
  open,
  onOpenChange,
  onProfesionalRegistrado,
}: RegistrarProfesionalModalProps) {
  console.log("RegistrarProfesionalModal renderizado con open:", open)
  
  const [formData, setFormData] = useState<DatosProfesionalFormulario>({
    nombre: "",
    apellido: "",
    dni: "",
    especialidad: "",
    telefono: "+54",
    direccion: "",
    obras_sociales_ids: [],
  })
  const [obrasSociales, setObrasSociales] = useState<ObraSocial[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [verificandoDni, setVerificandoDni] = useState(false)
  const [dniExiste, setDniExiste] = useState(false)

  useEffect(() => {
    if (open) {
      fetchObrasSociales()
    }
  }, [open])

  const fetchObrasSociales = async () => {
    try {
      const response = await fetch('/api/v1/obra_social?state_id=1')
      if (response.ok) {
        const data = await response.json()
        setObrasSociales(data.obras_sociales)
      }
    } catch (error) {
      console.error('Error al cargar obras sociales:', error)
    }
  }

  const verificarDNI = async (dni: string) => {
    if (dni.length < 7) return

    setVerificandoDni(true)
    try {
      const response = await fetch(`/api/v1/profesionales?verificar_dni=${dni}`)
      if (response.ok) {
        const data = await response.json()
        setDniExiste(data.existe)
      }
    } catch (error) {
      console.error('Error al verificar DNI:', error)
    } finally {
      setVerificandoDni(false)
    }
  }

  const handleDniChange = (value: string) => {
    const numericValue = value.replace(/\D/g, '')
    setFormData({ ...formData, dni: numericValue })
    setDniExiste(false)
    
    if (numericValue.length >= 7) {
      verificarDNI(numericValue)
    }
  }

  const handleObraSocialToggle = (id: number) => {
    setFormData(prev => ({
      ...prev,
      obras_sociales_ids: prev.obras_sociales_ids.includes(id)
        ? prev.obras_sociales_ids.filter(osId => osId !== id)
        : [...prev.obras_sociales_ids, id]
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validaciones
    if (!formData.nombre || !formData.apellido || !formData.dni) {
      setError("Los campos Nombre, Apellido y DNI son obligatorios")
      return
    }

    if (dniExiste) {
      setError("El DNI ingresado ya está registrado")
      return
    }

    if (!formData.telefono.startsWith('+')) {
      setError("El teléfono debe comenzar con +")
      return
    }

    if (formData.obras_sociales_ids.length === 0) {
      setError("Debe seleccionar al menos una obra social")
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/v1/profesionales', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al registrar profesional')
      }

      // Éxito
      onProfesionalRegistrado()
      onOpenChange(false)
      resetForm()
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error al registrar profesional')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      nombre: "",
      apellido: "",
      dni: "",
      especialidad: "",
      telefono: "+54",
      direccion: "",
      obras_sociales_ids: [],
    })
    setError(null)
    setDniExiste(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Registrar Nuevo Profesional</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre *</Label>
              <Input
                id="nombre"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                placeholder="Juan"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="apellido">Apellido *</Label>
              <Input
                id="apellido"
                value={formData.apellido}
                onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                placeholder="Pérez"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dni">DNI *</Label>
              <div className="relative">
                <Input
                  id="dni"
                  value={formData.dni}
                  onChange={(e) => handleDniChange(e.target.value)}
                  placeholder="12345678"
                  maxLength={9}
                  required
                />
                {verificandoDni && (
                  <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-muted-foreground" />
                )}
                {!verificandoDni && formData.dni.length >= 7 && (
                  <div className="absolute right-3 top-3">
                    {dniExiste ? (
                      <AlertCircle className="h-4 w-4 text-destructive" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    )}
                  </div>
                )}
              </div>
              {dniExiste && (
                <p className="text-xs text-destructive">Este DNI ya está registrado</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="especialidad">Especialidad *</Label>
              <Input
                id="especialidad"
                value={formData.especialidad}
                onChange={(e) => setFormData({ ...formData, especialidad: e.target.value })}
                placeholder="Cardiología"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="telefono">Teléfono *</Label>
              <Input
                id="telefono"
                value={formData.telefono}
                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                placeholder="+5493875123456"
                required
              />
              <p className="text-xs text-muted-foreground">Debe comenzar con + seguido del código de país</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="direccion">Dirección *</Label>
              <Input
                id="direccion"
                value={formData.direccion}
                onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                placeholder="Av. Belgrano 123"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Obras Sociales *</Label>
            <div className="border rounded-md p-4 space-y-2 max-h-48 overflow-y-auto">
              {obrasSociales.length === 0 ? (
                <p className="text-sm text-muted-foreground">Cargando obras sociales...</p>
              ) : (
                obrasSociales.map((os) => (
                  <label key={os.id} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.obras_sociales_ids.includes(os.id)}
                      onChange={() => handleObraSocialToggle(os.id)}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm">{os.nombre}</span>
                  </label>
                ))
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Seleccione las obras sociales con las que trabaja el profesional
            </p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onOpenChange(false)
                resetForm()
              }}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading || dniExiste}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Registrando...
                </>
              ) : (
                "Registrar Profesional"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}