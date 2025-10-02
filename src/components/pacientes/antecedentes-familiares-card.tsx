"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/context/auth-context"
import { Edit, Save, X, Heart } from "lucide-react"

interface AntecedentesFamiliaresCardProps {
  pacienteId: string
  editable?: boolean
  compact?: boolean
}

const mockAntecedentes =
  "Padre: Infarto de miocardio a los 55 años. Madre: Diabetes tipo 2. Abuela materna: Hipertensión arterial."

export function AntecedentesFamiliaresCard({
  pacienteId,
  editable = false,
  compact = false,
}: AntecedentesFamiliaresCardProps) {
  const { user } = useAuth()
  const [antecedentes, setAntecedentes] = useState<string>(mockAntecedentes)
  const [isEditing, setIsEditing] = useState(false)
  const [tempAntecedentes, setTempAntecedentes] = useState<string>(antecedentes)

  const puedeEditar = editable && (user?.role === "profesional" || user?.role === "gerente")

  const handleGuardar = () => {
    setAntecedentes(tempAntecedentes)
    setIsEditing(false)
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
            {puedeEditar && (
              <Button variant="ghost" size="sm" onClick={() => setIsEditing(!isEditing)}>
                {isEditing ? <X className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {!antecedentes ? (
            <p className="text-sm text-muted-foreground">No se registran antecedentes familiares</p>
          ) : (
            <p className="text-sm leading-relaxed">{antecedentes}</p>
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
            />
            <p className="text-xs text-muted-foreground">
              Incluya información sobre enfermedades cardiovasculares, diabetes, hipertensión, cáncer, alergias y otras
              condiciones relevantes.
            </p>
            <div className="flex gap-2 justify-end pt-2">
              <Button variant="outline" size="sm" onClick={handleCancelar} className="gap-2 bg-transparent">
                <X className="h-4 w-4" />
                Cancelar
              </Button>
              <Button size="sm" onClick={handleGuardar} className="gap-2">
                <Save className="h-4 w-4" />
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
