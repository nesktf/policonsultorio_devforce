"use client"

import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from "lucide-react"

type CancelacionOrigen = "PACIENTE" | "PROFESIONAL"

interface CancelarTurnoDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (input: { solicitadoPor: CancelacionOrigen }) => Promise<void> | void
  isSubmitting?: boolean
}

const OPCIONES_SOLICITADO_POR: Array<{ value: CancelacionOrigen; label: string }> = [
  { value: "PACIENTE", label: "Paciente" },
  { value: "PROFESIONAL", label: "Profesional" },
]

export function CancelarTurnoDialog({
  open,
  onOpenChange,
  onConfirm,
  isSubmitting = false,
}: CancelarTurnoDialogProps) {
  const [solicitadoPor, setSolicitadoPor] = useState<CancelacionOrigen>("PACIENTE")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) {
      setSolicitadoPor("PACIENTE")
      setError(null)
    }
  }, [open])

  const handleConfirm = async () => {
    if (!solicitadoPor) {
      setError("Selecciona quién solicitó la cancelación.")
      return
    }

    setError(null)
    try {
      await onConfirm({
        solicitadoPor,
      })
    } catch (err) {
      const mensaje =
        err instanceof Error
          ? err.message
          : "No se pudo registrar la cancelación del turno."
      setError(mensaje)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cancelar turno</DialogTitle>
          <DialogDescription>
            Indica quién solicitó la cancelación del turno.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="solicitado-por">Solicitado por</Label>
            <Select
              value={solicitadoPor}
              onValueChange={(value) => {
                setSolicitadoPor(value as CancelacionOrigen)
                setError(null)
              }}
              disabled={isSubmitting}
            >
              <SelectTrigger id="solicitado-por">
                <SelectValue placeholder="Selecciona una opción" />
              </SelectTrigger>
              <SelectContent>
                {OPCIONES_SOLICITADO_POR.map((opcion) => (
                  <SelectItem key={opcion.value} value={opcion.value}>
                    {opcion.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </div>

        <DialogFooter className="flex items-center justify-between gap-2 sm:justify-between">
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              "Confirmar cancelación"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
