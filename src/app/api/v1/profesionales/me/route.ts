// src/app/api/profesionales/me/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/prisma/instance";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = parseInt(searchParams.get("userId") || "", 10);

  if (!userId) {
    return NextResponse.json({ error: "userId requerido" }, { status: 400 });
  }

  try {
    const profesional = await prisma.profesional.findUnique({
      where: { userId },
      select: {
        nombre: true,
        apellido: true,
        id: true,
        especialidad: true,
      },
    });

    if (!profesional) {
      return NextResponse.json(
        { error: "Profesional no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(profesional);
  } catch (err) {
    console.error("Error al buscar profesional:", err);
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}