import { NextResponse } from "next/server";
import { getTurnosCalendario } from "@/prisma/calendario-mesa";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function parseDateParam(value: string | null): Date | null {
  if (!value) {
    return null;
  }

  const isDateOnly = /^\d{4}-\d{2}-\d{2}$/.test(value);
  const isoValue = isDateOnly ? `${value}T00:00:00.000Z` : value;
  const parsed = new Date(isoValue);

  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function startOfDayUtc(date: Date) {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0, 0)
  );
}

function endOfDayUtc(date: Date) {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 23, 59, 59, 999)
  );
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const fromParam = parseDateParam(searchParams.get("from"));
  const toParam = parseDateParam(searchParams.get("to"));

  if (!fromParam || !toParam) {
    return NextResponse.json(
      {
        error:
          'Debes indicar los parámetros "from" y "to" en formato YYYY-MM-DD o ISO 8601.',
      },
      { status: 400 }
    );
  }

  const from = startOfDayUtc(fromParam);
  const to = endOfDayUtc(toParam);

  if (from > to) {
    return NextResponse.json(
      { error: 'El parámetro "from" debe ser menor o igual que "to".' },
      { status: 400 }
    );
  }

  const profesionalIdParam = searchParams.get("profesionalId");
  const especialidadParam = searchParams.get("especialidad");

  let profesionalId = null;
  if (profesionalIdParam && profesionalIdParam !== "todos") {
    profesionalId = Number(profesionalIdParam);
    if (!Number.isInteger(profesionalId) || profesionalId <= 0) {
      return NextResponse.json(
        { error: "profesionalId debe ser un número entero positivo." },
        { status: 400 }
      );
    }
  }

  const especialidad =
    especialidadParam && especialidadParam !== "todas"
      ? especialidadParam
      : null;

  try {
    const turnos = await getTurnosCalendario({
      from,
      to,
      profesionalId,
      especialidad,
    });

    const resultados = turnos.map((turno) => {
      const fechaTurno = new Date(turno.fecha);
      
      return {
        id: turno.id,
        fecha: turno.fecha.toISOString(),
        hora: fechaTurno.toLocaleTimeString("es-AR", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }),
        duracion: turno.duracion_minutos,
        estado: turno.estado,
        paciente: {
          id: turno.paciente.id,
          nombre: turno.paciente.nombre,
          apellido: turno.paciente.apellido,
          dni: turno.paciente.dni,
          telefono: turno.paciente.telefono || "Sin teléfono",
        },
        profesional: {
          id: turno.profesional.id,
          nombre: turno.profesional.nombre,
          apellido: turno.profesional.apellido,
          especialidad: turno.profesional.especialidad,
        },
      };
    });

    return NextResponse.json(
      {
        rango: {
          from: from.toISOString(),
          to: to.toISOString(),
        },
        filtros: {
          profesionalId,
          especialidad,
        },
        total: resultados.length,
        turnos: resultados,
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("Error al obtener turnos del calendario:", error);
    return NextResponse.json(
      { error: "Error interno del servidor al obtener los turnos." },
      { status: 500 }
    );
  }
}