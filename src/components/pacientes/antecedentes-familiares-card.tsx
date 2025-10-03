"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/context/auth-context"
import { useToast } from "@/hooks/use-toast"
import { Edit, Save, X, Heart, Loader2 } from "lucide-react"

interface AntecedentesFamiliaresCardProps {
  pacienteId: string
  antecedentesInitial?: string
  editable?: boolean
  compact?: boolean
}

export function AntecedentesFamiliaresCard({
  pacienteId,
  antecedentesInitial = "",
  editable = false,
  compact = false,
}: AntecedentesFamiliaresCardProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [antecedentes, setAntecedentes] = useState<string>(antecedentesInitial)
  const [isEditing, setIsEditing] = useState(false)
  const [tempAntecedentes, setTempAntecedentes] = useState<string>(antecedentesInitial)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setAntecedentes(antecedentesInitial)
    setTempAntecedentes(antecedentesInitial)
  }, [antecedentesInitial])

  const puedeEditar = editable && (user?.rol === "PROFESIONAL")

  const handleGuardar = async () => {
    setLoading(true)
    
    try {
      const response = await fetch("/api/v2/historia/antecedente", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          idPaciente: pacienteId,
          antecedente: tempAntecedentes,
        }),
      })

      if (!response.ok) {
        throw new Error("Error al guardar antecedentes")
      }

      const data = await response.json()
      
      setAntecedentes(tempAntecedentes)
      setIsEditing(false)
      
      toast({
        title: "Antecedentes guardados",
        description: "Los antecedentes familiares se han actualizado correctamente.",
      })
    } catch (error) {
      console.error("Error guardando antecedentes:", error)
      toast({
        title: "Error",
        description: "No se pudieron guardar los antecedentes. Intente nuevamente.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCancelar = () => {
    setTempAntecedentes(antecedentes)
    setIsEditing(false)
  }

  if (compact) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Antecedentes Familiares</CardTitle>
            {puedeEditar && !isEditing && (
              <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
                <Edit className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <div className="space-y-2">
              <Textarea
                value={tempAntecedentes}
                onChange={(e) => setTempAntecedentes(e.target.value)}
                placeholder="Describa los antecedentes familiares..."
                className="min-h-[100px]"
                disabled={loading}
              />
              <div className="flex gap-2 justify-end">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleCancelar}
                  disabled={loading}
                  className="bg-transparent"
                >
                  <X className="h-4 w-4 mr-1" />
                  Cancelar
                </Button>
                <Button 
                  size="sm" 
                  onClick={handleGuardar}
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-1" />
                  )}
                  Guardar
                </Button>
              </div>
            </div>
          ) : (
            <>
              {!antecedentes ? (
                <p className="text-sm text-muted-foreground">No se registran antecedentes familiares</p>
              ) : (
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{antecedentes}</p>
              )}
            </>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Heart className="h-5 w-5 text-red-500" />
          <div>
            <CardTitle>Antecedentes Familiares</CardTitle>
            <CardDescription>Historial médico familiar relevante</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <div className="space-y-2">
            <Label htmlFor="antecedentes">Antecedentes Familiares</Label>
            <Textarea
              id="antecedentes"
              value={tempAntecedentes}
              onChange={(e) => setTempAntecedentes(e.target.value)}
              placeholder="Describa los antecedentes familiares relevantes del paciente..."
              className="min-h-[150px]"
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground">
              Incluya información sobre enfermedades cardiovasculares, diabetes, hipertensión, cáncer, alergias y otras
              condiciones relevantes.
            </p>
            <div className="flex gap-2 justify-end pt-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleCancelar}
                disabled={loading}
                className="gap-2 bg-transparent"
              >
                <X className="h-4 w-4" />
                Cancelar
              </Button>
              <Button 
                size="sm" 
                onClick={handleGuardar}
                disabled={loading}
                className="gap-2"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Guardar
              </Button>
            </div>
          </div>
        ) : (
          <div>
            {!antecedentes ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">No se registran antecedentes familiares</p>
                {puedeEditar && (
                  <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Agregar Antecedentes
                  </Button>
                )}
              </div>
            ) : (
              <div className="bg-muted/30 p-4 rounded-lg">
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{antecedentes}</p>
                {puedeEditar && (
                  <Button variant="outline" size="sm" onClick={() => setIsEditing(true)} className="mt-4">
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                  </Button>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}