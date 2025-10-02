import { NextResponse } from "next/server";
import { obtenerEspecialidadesUnicas } from "@/prisma/profesional";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const especialidades = await obtenerEspecialidadesUnicas();
    return NextResponse.json(
      especialidades.map((especialidad) => ({
        id: especialidad,
        nombre: especialidad,
      })),
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("Error al obtener especialidades:", error);
    return NextResponse.json(
      { error: "Error interno del servidor al obtener las especialidades." },
      { status: 500 }
    );
  }
}
