import { prisma } from "@/prisma/instance";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search");

  if (!search || search.length < 3) {
    return NextResponse.json({ pacientes: [] });
  }

  try {
    const pacientes = await prisma.paciente.findMany({
      where: {
        OR: [
          { nombre: { contains: search, mode: "insensitive" } },
          { apellido: { contains: search, mode: "insensitive" } },
          { dni: { contains: search } },
        ],
      },
      select: {
        id: true,
        nombre: true,
        apellido: true,
        dni: true,
        telefono: true,
      },
      take: 10,
    });

    return NextResponse.json({ pacientes });
  } catch (error) {
    console.error("Error al buscar pacientes:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
