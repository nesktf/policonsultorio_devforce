"use client"

import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TurnoEstadoAPIEnum } from "@/app/api/v2/turnos/estado/route"

interface TurnoProps {
  id: number;
  estado: string;
  // fecha: string;
  // duracion: number;
  // paciente: {
  //   id: number;
  //   nombre: string;
  //   apellido: string;
  //   dni: string;
  //   telefono: string;
  // };
  // profesional: {
  //   id: number;
  //   nombre: string;
  //   apellido: string;
  //   especialidad: string;
  // };
}


interface EditTurnoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  turno: TurnoProps;
  onEdit?: () => void;
};

const ESTADOS_API = [
  {name: "Programado", value: TurnoEstadoAPIEnum.PROGRAMADO},
  {name: "Asisitó", value: TurnoEstadoAPIEnum.ASISTIO},
  {name: "Cancelado", value: TurnoEstadoAPIEnum.CANCELADO},
  {name: "No asisitó", value: TurnoEstadoAPIEnum.NO_ASISTIO},
  {name: "En sala de espera", value: TurnoEstadoAPIEnum.EN_SALA_ESPERA},
];

export function EditarTurnoDialog({
  open,
  onOpenChange,
  turno,
  onEdit,
}: EditTurnoDialogProps) {
  const [submitError, setSubmitError] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [currEstado, setCurrEstado] = useState<string>("");

  const handleConfirm = async () => {
    setSubmitError("");
    setIsSubmitting(true);
    if (currEstado == "") {
      setSubmitError("Seleccione un estado");
      setIsSubmitting(false);
    }
    const estado_id = parseInt(currEstado);
    await fetch("/api/v2/turnos/estado", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        turno_id: turno.id,
        estado_id
      })
    })
    .then(async (body) => body.json())
    .then((json) => {
      if (json.error) {
        setSubmitError(json.error as string);
        return;
      }
      if (onEdit) {
        onEdit();
      }
      onOpenChange(false);
    });

    setIsSubmitting(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar turno</DialogTitle>
          <DialogDescription>Editar estado del turno</DialogDescription>
        </DialogHeader>

        {submitError ? (
          <Alert variant="destructive">
            <AlertDescription>{submitError}</AlertDescription>
          </Alert>
        ) : null}

        <div className="space-y-2">
          <Label>Nuevo Estado *</Label>
          <Select value={currEstado} onValueChange={setCurrEstado}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar nuevo estado" />
            </SelectTrigger>
            <SelectContent>
              {ESTADOS_API.map(({name, value}) => (
                <SelectItem key={value} value={value.toString()}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
              "Confirmar edición"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
