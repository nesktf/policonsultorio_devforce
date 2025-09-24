import { NextResponse } from 'next/server';
import { profesionalHasTurnoAt, registerTurno, TurnoData } from '@/prisma/turnos';
import type { EstadoTurno } from '@/generated/prisma';
import { getProfesional } from '@/prisma/profesional';
import { getPaciente } from '@/prisma/pacientes';

interface TurnoPayload {
  pacienteId?: unknown;
  profesionalId?: unknown;
  fecha?: unknown;
  estado?: unknown;
  motivo?: unknown;
  detalle?: unknown;
}

const ESTADO_DEFAULT: EstadoTurno = 'CONFIRMADO';

const isEstadoTurno = (value: unknown): value is EstadoTurno =>
  value === 'CONFIRMADO' || value === 'CANCELADO';

export async function POST(request: Request) {
  let payload: TurnoPayload;

  try {
    payload = await request.json();
  } catch (error) {
    return NextResponse.json(
      { error: 'Cuerpo de la petición inválido. Debe ser JSON.' },
      { status: 400 }
    );
  }

  const { pacienteId, profesionalId, fecha, estado, motivo, detalle } = payload;

  const parsedPacienteId = Number(pacienteId);
  const parsedProfesionalId = Number(profesionalId);

  if (!Number.isInteger(parsedPacienteId) || parsedPacienteId <= 0) {
    return NextResponse.json(
      { error: 'pacienteId debe ser un número entero positivo.' },
      { status: 400 }
    );
  }

  if (!Number.isInteger(parsedProfesionalId) || parsedProfesionalId <= 0) {
    return NextResponse.json(
      { error: 'profesionalId debe ser un número entero positivo.' },
      { status: 400 }
    );
  }

  if (typeof fecha !== 'string') {
    return NextResponse.json(
      { error: 'fecha es requerida y debe ser un string en formato ISO 8601.' },
      { status: 400 }
    );
  }

  const parsedFecha = new Date(fecha);
  if (Number.isNaN(parsedFecha.getTime())) {
    return NextResponse.json(
      { error: 'fecha inválida. Debe ser un string en formato ISO 8601.' },
      { status: 400 }
    );
  }

  if (typeof motivo !== 'string' || motivo.trim().length === 0) {
    return NextResponse.json(
      { error: 'motivo es requerido y debe ser un string no vacío.' },
      { status: 400 }
    );
  }

  if (typeof detalle !== 'string' || detalle.trim().length === 0) {
    return NextResponse.json(
      { error: 'detalle es requerido y debe ser un string no vacío.' },
      { status: 400 }
    );
  }

  const trimmedMotivo = motivo.trim();
  const trimmedDetalle = detalle.trim();

  const estadoTurno: EstadoTurno = isEstadoTurno(estado) ? estado : ESTADO_DEFAULT;

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
        { error: `No se encontró un profesional con id ${parsedProfesionalId}.` },
        { status: 404 }
      );
    }

    if (await profesionalHasTurnoAt(parsedProfesionalId, parsedFecha)) {
      return NextResponse.json(
        { error: 'El profesional ya tiene un turno registrado para la fecha y hora indicadas.' },
        { status: 409 }
      );
    }

    const fechaRegistroIso = new Date().toISOString();
    const turnoIso = parsedFecha.toISOString();
    const detalleHistoria = `${trimmedDetalle} | Registro: ${fechaRegistroIso}. Paciente DNI ${paciente.dni}. Turno ${turnoIso} con ${profesional.apellido}, ${profesional.nombre} (ID ${profesional.id}). Estado ${estadoTurno}.`;

    let data = new TurnoData(parsedPacienteId, parsedProfesionalId, parsedFecha,
                             estadoTurno, trimmedMotivo, detalleHistoria);
    let nuevoTurno = await registerTurno(data);

    return NextResponse.json(nuevoTurno, { status: 201 });
  } catch (error) {
    console.error('Error al crear turno:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor al crear el turno.' },
      { status: 500 }
    );
  }
}
