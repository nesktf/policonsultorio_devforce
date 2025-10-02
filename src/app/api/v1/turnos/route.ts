import { NextResponse } from "next/server";
import {
  getTurnosFiltrados,
  profesionalTieneConflictoDeTurno,
  registerTurno,
  TurnoData,
} from "@/prisma/turnos";
import type { EstadoTurno } from "@/generated/prisma";
import { getProfesional } from "@/prisma/profesional";
import { getPaciente } from "@/prisma/pacientes";

interface TurnoPayload {
  pacienteId?: unknown;
  profesionalId?: unknown;
  fecha?: unknown;
  durationMinutes?: unknown;
  estado?: unknown;
  motivo?: unknown;
  detalle?: unknown;
}

const ESTADO_DEFAULT: EstadoTurno = "PROGRAMADO";

const isEstadoTurno = (value: unknown): value is EstadoTurno =>
  typeof value === "string" &&
  ["PROGRAMADO", "EN_SALA_ESPERA", "ASISTIO", "NO_ASISTIO", "CANCELADO"].includes(value);

export async function POST(request: Request) {
  let payload: TurnoPayload;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Cuerpo de la petición inválido. Debe ser JSON." },
      { status: 400 }
    );
  }

  const { pacienteId, profesionalId, fecha, estado, motivo, detalle, durationMinutes } = payload;

  const parsedPacienteId = Number(pacienteId);
  const parsedProfesionalId = Number(profesionalId);

  if (!Number.isInteger(parsedPacienteId) || parsedPacienteId <= 0) {
    return NextResponse.json(
      { error: "pacienteId debe ser un número entero positivo." },
      { status: 400 }
    );
  }

  if (!Number.isInteger(parsedProfesionalId) || parsedProfesionalId <= 0) {
    return NextResponse.json(
      { error: "profesionalId debe ser un número entero positivo." },
      { status: 400 }
    );
  }

  if (typeof fecha !== "string") {
    return NextResponse.json(
      { error: "fecha es requerida y debe ser un string en formato ISO 8601." },
      { status: 400 }
    );
  }

  const parsedFecha = new Date(fecha);
  if (Number.isNaN(parsedFecha.getTime())) {
    return NextResponse.json(
      { error: "fecha inválida. Debe ser un string en formato ISO 8601." },
      { status: 400 }
    );
  }

  const allowedDurations = new Set([15, 30, 45, 60]);
  const parsedDuration = durationMinutes == null ? 30 : Number(durationMinutes);

  if (!allowedDurations.has(parsedDuration)) {
    return NextResponse.json(
      { error: "durationMinutes debe ser uno de: 15, 30, 45 o 60." },
      { status: 400 }
    );
  }

  if (typeof motivo !== "string" || motivo.trim().length === 0) {
    return NextResponse.json(
      { error: "motivo es requerido y debe ser un string no vacío." },
      { status: 400 }
    );
  }

  if (typeof detalle !== "string" || detalle.trim().length === 0) {
    return NextResponse.json(
      { error: "detalle es requerido y debe ser un string no vacío." },
      { status: 400 }
    );
  }

  const trimmedMotivo = motivo.trim();
  const trimmedDetalle = detalle.trim();

  const estadoTurno: EstadoTurno = isEstadoTurno(estado)
    ? estado
    : ESTADO_DEFAULT;

  try {
    const [paciente, profesional] = await Promise.all([
      getPaciente(parsedPacienteId),
      getProfesional(parsedProfesionalId),
    ]);

    if (!paciente) {
      return NextResponse.json(
        { error: `No se encontró un paciente con id ${parsedPacienteId}.` },
        { status: 404 }
      );
    }

    if (!profesional) {
      return NextResponse.json(
        {
          error: `No se encontró un profesional con id ${parsedProfesionalId}.`,
        },
        { status: 404 }
      );
    }

    if (await profesionalTieneConflictoDeTurno(parsedProfesionalId, parsedFecha, parsedDuration)) {
      return NextResponse.json(
        {
          error:
            "El profesional ya tiene un turno registrado para la fecha y hora indicadas.",
        },
        { status: 409 }
      );
    }

    const fechaRegistroIso = new Date().toISOString();
    const turnoIso = parsedFecha.toISOString();
    const detalleHistoria = `${trimmedDetalle} | Registro: ${fechaRegistroIso}. Paciente DNI ${paciente.dni}. Turno ${turnoIso} con ${profesional.apellido}, ${profesional.nombre} (ID ${profesional.id}). Estado ${estadoTurno}.`;

    const data = new TurnoData(
      parsedPacienteId,
      parsedProfesionalId,
      parsedFecha,
      parsedDuration,
      estadoTurno,
      trimmedMotivo,
      detalleHistoria
    );

    const [turnoCreado] = await registerTurno(data);

    if (!turnoCreado) {
      throw new Error("No se pudo crear el turno.");
    }

    return NextResponse.json(
      {
        id: turnoCreado.id,
        fecha: turnoCreado.fecha.toISOString(),
        estado: turnoCreado.estado,
        duracion: turnoCreado.duracion_minutos,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error al crear turno:", error);
    return NextResponse.json(
      { error: "Error interno del servidor al crear el turno." },
      { status: 500 }
    );
  }
}

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
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0, 0));
}

function endOfDayUtc(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 23, 59, 59, 999));
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const fromParam = parseDateParam(searchParams.get('from'));
  const toParam = parseDateParam(searchParams.get('to'));

  if (!fromParam || !toParam) {
    return NextResponse.json(
      { error: 'Debes indicar los parámetros "from" y "to" en formato YYYY-MM-DD o ISO 8601.' },
      { status: 400 },
    );
  }

  const from = startOfDayUtc(fromParam);
  const to = endOfDayUtc(toParam);

  if (from > to) {
    return NextResponse.json(
      { error: 'El parámetro "from" debe ser menor o igual que "to".' },
      { status: 400 },
    );
  }

  const profesionalIdParam = searchParams.get('profesionalId');
  const especialidadParam = searchParams.get('especialidad');

  const profesionalId = profesionalIdParam ? Number(profesionalIdParam) : null;
  if (profesionalIdParam && (!Number.isInteger(profesionalId) || (profesionalId ?? 0) <= 0)) {
    return NextResponse.json(
      { error: 'profesionalId debe ser un número entero positivo.' },
      { status: 400 },
    );
  }

  const especialidad = especialidadParam && especialidadParam !== 'todas' ? especialidadParam : null;

  try {
    const turnos = await getTurnosFiltrados({
      from,
      to,
      profesionalId,
      especialidad,
    });

    const resultados = turnos.map((turno) => ({
      id: turno.id,
      fecha: turno.fecha.toISOString(),
      duracion: turno.duracion_minutos,
      estado: turno.estado,
      paciente: {
        id: turno.paciente.id,
        nombre: turno.paciente.nombre,
        apellido: turno.paciente.apellido,
        dni: turno.paciente.dni,
        telefono: turno.paciente.telefono,
      },
      profesional: {
        id: turno.profesional.id,
        nombre: turno.profesional.nombre,
        apellido: turno.profesional.apellido,
        especialidad: turno.profesional.especialidad,
      },
    }));

    return NextResponse.json(
      {
        rango: {
          from: from.toISOString(),
          to: to.toISOString(),
        },
        total: resultados.length,
        turnos: resultados,
      },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  } catch (error) {
    console.error('Error al obtener turnos:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor al obtener los turnos.' },
      { status: 500 },
    );
  }
}

// MODIFICAR TURNO
