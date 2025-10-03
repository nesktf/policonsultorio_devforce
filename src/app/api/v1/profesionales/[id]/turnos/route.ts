import { NextResponse } from "next/server";
import { getTurnosCalendarioProfesional } from "@/prisma/turnos";
import { EstadoTurno } from "@/generated/prisma";
import { getProfesional } from "@/prisma/profesional";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type EventoCalendario = {
  id: number;
  estado: EstadoTurno;
  fechaIso: string;
  horaLocal: string;
  duracionMinutos: number;
  paciente: {
    id: number;
    nombre: string;
    apellido: string;
    dni: string;
  };
};

function parseDateParam(
  value: string | null,
  fallback: Date | null
): Date | null {
  if (!value) {
    return fallback;
  }

  const isDateOnly = /^\d{4}-\d{2}-\d{2}$/.test(value);
  const isoValue = isDateOnly ? `${value}T00:00:00.000Z` : value;
  const parsed = new Date(isoValue);

  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function startOfDay(date: Date) {
  return new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
      0,
      0,
      0,
      0
    )
  );
}

function endOfDay(date: Date) {
  return new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
      23,
      59,
      59,
      999
    )
  );
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const profesionalId = Number(params.id);
  if (!Number.isInteger(profesionalId) || profesionalId <= 0) {
    return NextResponse.json(
      { error: "El identificador de profesional es inválido." },
      { status: 400 }
    );
  }

  const { searchParams } = new URL(request.url);
  const timezoneOffsetMinutes = Number(
    searchParams.get("timezoneOffset") ?? "0"
  );
  const effectiveOffset = Number.isFinite(timezoneOffsetMinutes)
    ? timezoneOffsetMinutes
    : 0;

  const nowUtc = new Date();
  const defaultFrom = startOfDay(nowUtc);
  const defaultTo = endOfDay(
    new Date(nowUtc.getTime() + 7 * 24 * 60 * 60 * 1000)
  );

  const fromParam = parseDateParam(searchParams.get("from"), defaultFrom);
  const toParam = parseDateParam(searchParams.get("to"), defaultTo);

  if (!fromParam || !toParam) {
    return NextResponse.json(
      {
        error:
          "Parámetros de fecha inválidos. Usa el formato YYYY-MM-DD o ISO 8601.",
      },
      { status: 400 }
    );
  }

  const from = startOfDay(fromParam);
  const to = endOfDay(toParam);

  if (from > to) {
    return NextResponse.json(
      { error: 'El parámetro "from" debe ser menor o igual que "to".' },
      { status: 400 }
    );
  }

  const profesional = await getProfesional(profesionalId);
  if (!profesional) {
    return NextResponse.json(
      { error: "Profesional no encontrado." },
      { status: 404 }
    );
  }

  try {
    const turnos = await getTurnosCalendarioProfesional(
      profesionalId,
      from,
      to
    );

    const agrupados = new Map<string, EventoCalendario[]>();

    for (const turno of turnos) {
      const utcDate = turno.fecha;
      const localDate = new Date(
        utcDate.getTime() - effectiveOffset * 60 * 1000
      );
      const fechaClave = localDate.toISOString().slice(0, 10);
      const hora = localDate.toISOString().slice(11, 16);

      const dia = agrupados.get(fechaClave) ?? [];
      dia.push({
        id: turno.id,
        estado: turno.estado,
        fechaIso: utcDate.toISOString(),
        horaLocal: hora,
        duracionMinutos: turno.duracion_minutos,
        paciente: {
          id: turno.paciente.id,
          nombre: turno.paciente.nombre,
          apellido: turno.paciente.apellido,
          dni: turno.paciente.dni,
        },
      });
      agrupados.set(fechaClave, dia);
    }

    const turnosPorDia = Array.from(agrupados.entries())
      .map(([fecha, lista]) => ({
        fecha,
        turnos: lista.sort((a, b) => a.horaLocal.localeCompare(b.horaLocal)),
      }))
      .sort((a, b) => a.fecha.localeCompare(b.fecha));

    return NextResponse.json(
      {
        profesional: {
          id: profesional.id,
          nombre: profesional.nombre,
          apellido: profesional.apellido,
          especialidad: profesional.especialidad,
        },
        rango: {
          from: from.toISOString(),
          to: to.toISOString(),
          timezoneOffsetMinutes: effectiveOffset,
        },
        totalTurnos: turnos.length,
        turnosPorDia,
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("Error al obtener turnos del profesional:", error);
    return NextResponse.json(
      {
        error:
          "Error interno del servidor al obtener el calendario del profesional.",
      },
      { status: 500 }
    );
  }
}