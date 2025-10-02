import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma/instance";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const profesionalId = searchParams.get("profesionalId");
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    if (!profesionalId || !from || !to) {
      return NextResponse.json(
        { error: "Faltan parámetros requeridos" },
        { status: 400 }
      );
    }

    const fromDate = new Date(from);
    const toDate = new Date(to);

    if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
      return NextResponse.json({ error: "Fechas inválidas" }, { status: 400 });
    }

    const turnos = await prisma.turno.findMany({
      where: {
        id_profesional: Number(profesionalId),
        fecha: {
          gte: fromDate,
          lte: toDate,
        },
      },
      include: {
        paciente: true,
        profesional: true,
      },
      orderBy: {
        fecha: "asc",
      },
    });

    return NextResponse.json({ turnos });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
