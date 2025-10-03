import { NextRequest, NextResponse } from "next/server";
import { getProfesionalPorUserId } from "@/prisma/profesional";

export async function GET(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const userId = parseInt(params.userId);
    
    if (isNaN(userId) || userId <= 0) {
      return NextResponse.json(
        { error: "ID de usuario inválido" },
        { status: 400 }
      );
    }

    const profesional = await getProfesionalPorUserId(userId);

    if (!profesional) {
      return NextResponse.json(
        { error: "No se encontró profesional para este usuario" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      profesionalId: profesional.id,
      nombre: profesional.nombre,
      apellido: profesional.apellido,
      especialidad: profesional.especialidad,
    });

  } catch (error) {
    console.error("Error en GET /api/v2/profesional/by-user:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}