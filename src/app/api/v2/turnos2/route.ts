import { prisma } from "@/prisma/instance";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      pacienteId,
      profesionalId,
      fecha,
      durationMinutes,
      motivo,
      detalle,
    } = body;

    if (!pacienteId || !profesionalId || !fecha) {
      return NextResponse.json(
        { error: "Faltan campos obligatorios" },
        { status: 400 }
      );
    }
    const fechaLocal = new Date(fecha);
    // Convertimos a UTC para guardar correctamente
    const fechaUTC = new Date(
      fechaLocal.getTime() - fechaLocal.getTimezoneOffset() * 60000
    );

    const nuevoTurno = await prisma.turno.create({
      data: {
        id_paciente: Number(pacienteId),
        id_profesional: Number(profesionalId),
        fecha: fechaUTC,
        duracion_minutos: Number(durationMinutes),
        estado: "PROGRAMADO", // Valor por defecto
      },
      include: {
        paciente: true,
        profesional: true,
      },
    });

    return NextResponse.json({ turno: nuevoTurno }, { status: 201 });
  } catch (error) {
    console.error("Error al registrar turno:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
