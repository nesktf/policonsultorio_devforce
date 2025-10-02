import { NextResponse } from "next/server";
import { getProfesionalesConEspecialidades } from "@/prisma/calendario-mesa";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const profesionales = await getProfesionalesConEspecialidades();

    // Extraer especialidades únicas
    const especialidadesSet = new Set(
      profesionales
        .map((p) => p.especialidad)
        .filter((esp): esp is string => Boolean(esp))
    );

    const profesionalesFormateados = profesionales.map((prof) => ({
      id: prof.id,
      nombre: `${prof.nombre} ${prof.apellido}`,
      especialidad: prof.especialidad,
    }));

    const especialidades = Array.from(especialidadesSet).sort();

    return NextResponse.json(
      {
        profesionales: profesionalesFormateados,
        especialidades,
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("Error al obtener profesionales:", error);
    return NextResponse.json(
      { error: "Error interno del servidor al obtener los profesionales." },
      { status: 500 }
    );
  }
}