import { NextResponse } from "next/server";
import { EstadoTurno } from "@/generated/prisma";
import { prisma } from "@/prisma/instance";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const ESTADOS_ACTUALIZABLES: EstadoTurno[] = [
  "ASISTIO",
  "NO_ASISTIO",
  "CANCELADO",
];

interface ActualizarEstadoPayload {
  estado?: unknown;
}

const isEstadoActualizable = (value: unknown): value is EstadoTurno =>
  typeof value === "string" && ESTADOS_ACTUALIZABLES.includes(value as EstadoTurno);

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
) {
  const turnoId = Number(params.id);
  if (!Number.isInteger(turnoId) || turnoId <= 0) {
    return NextResponse.json(
      { error: "El identificador de turno es inválido." },
      { status: 400 },
    );
  }

  let payload: ActualizarEstadoPayload;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Cuerpo inválido. Debe ser JSON." },
      { status: 400 },
    );
  }

  const { estado } = payload;
  if (!isEstadoActualizable(estado)) {
    return NextResponse.json(
      {
        error: "estado es requerido y debe ser uno de: ASISTIO, NO_ASISTIO o CANCELADO.",
      },
      { status: 400 },
    );
  }

  try {
    const turno = await prisma.turno.findUnique({ where: { id: turnoId } });

    if (!turno) {
      return NextResponse.json(
        { error: `No se encontró un turno con id ${turnoId}.` },
        { status: 404 },
      );
    }

    if (turno.estado === "CANCELADO" && estado !== "CANCELADO") {
      return NextResponse.json(
        { error: "Un turno cancelado no puede cambiar de estado." },
        { status: 409 },
      );
    }

    if (turno.estado === estado) {
      return NextResponse.json(
        {
          mensaje: "El turno ya se encuentra en el estado solicitado.",
          turno: {
            id: turno.id,
            estado: turno.estado,
          },
          requiereHistoria: estado === "ASISTIO",
        },
        { headers: { "Cache-Control": "no-store" } },
      );
    }

    const actualizado = await prisma.turno.update({
      where: { id: turnoId },
      data: { estado },
    });

    return NextResponse.json(
      {
        mensaje: "Estado de turno actualizado exitosamente.",
        turno: {
          id: actualizado.id,
          estado: actualizado.estado,
        },
        requiereHistoria: estado === "ASISTIO",
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error("Error al actualizar estado de turno:", error);
    return NextResponse.json(
      { error: "Error interno del servidor al actualizar el estado." },
      { status: 500 },
    );
  }
}
