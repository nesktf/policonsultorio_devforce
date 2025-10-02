import { NextResponse } from 'next/server';
import { getProfesionalturnos } from '@/prisma/turnos';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const STEP_MINUTES = 15;
const DAY_START_MINUTES = 9 * 60;
const DAY_END_MINUTES = 17 * 60;
const ALLOWED_DURATIONS = new Set([15, 30, 45, 60]);

function formatMinutes(minutes: number) {
  const hours = Math.floor(minutes / 60)
    .toString()
    .padStart(2, '0');
  const mins = (minutes % 60).toString().padStart(2, '0');
  return `${hours}:${mins}`;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const profesionalIdParam = searchParams.get('profesionalId');
  const fechaParam = searchParams.get('fecha');
  const timezoneOffsetParam = searchParams.get('timezoneOffset');
  const durationParam = searchParams.get('durationMinutes');

  const profesionalId = Number(profesionalIdParam);
  const timezoneOffsetMinutes = Number(timezoneOffsetParam ?? '0');
  const effectiveOffset = Number.isFinite(timezoneOffsetMinutes) ? timezoneOffsetMinutes : 0;

  const durationMinutes = durationParam ? Number(durationParam) : 30;

  if (!ALLOWED_DURATIONS.has(durationMinutes)) {
    return NextResponse.json(
      { error: 'durationMinutes debe ser uno de: 15, 30, 45, 60.' },
      { status: 400 },
    );
  }

  if (!Number.isInteger(profesionalId) || profesionalId <= 0) {
    return NextResponse.json(
      { error: 'profesionalId es requerido y debe ser un número entero positivo.' },
      { status: 400 }
    );
  }

  if (!fechaParam) {
    return NextResponse.json(
      { error: 'fecha es requerida (formato YYYY-MM-DD).' },
      { status: 400 }
    );
  }

  const [year, month, day] = fechaParam.split('-').map(Number);
  if (!year || !month || !day) {
    return NextResponse.json(
      { error: 'fecha inválida. Usa el formato YYYY-MM-DD.' },
      { status: 400 }
    );
  }

  const startOfDayMs = Date.UTC(year, month - 1, day, 0, 0, 0) + effectiveOffset * 60_000;
  const endOfDayMs = Date.UTC(year, month - 1, day, 23, 59, 59, 999) + effectiveOffset * 60_000;

  const startOfDay = new Date(startOfDayMs);
  const endOfDay = new Date(endOfDayMs);

  if (Number.isNaN(startOfDay.getTime())) {
    return NextResponse.json(
      { error: 'fecha inválida. Usa el formato YYYY-MM-DD.' },
      { status: 400 }
    );
  }

  try {
    const turnos = await getProfesionalturnos(profesionalId, startOfDay, endOfDay);

    const intervalosTomados = turnos.map(({ fecha, duracion_minutos }) => {
      const utcDate = new Date(fecha);
      const localDate = new Date(utcDate.getTime() - effectiveOffset * 60_000);
      const inicio = localDate.getHours() * 60 + localDate.getMinutes();
      const duracion = duracion_minutos ?? 30;
      return {
        inicio,
        fin: inicio + duracion,
      };
    });

    const availableSlots: string[] = [];
    const takenSlots = new Set<string>(
      intervalosTomados.map(({ inicio }) => formatMinutes(inicio)),
    );

    for (
      let minutes = DAY_START_MINUTES;
      minutes + durationMinutes <= DAY_END_MINUTES;
      minutes += STEP_MINUTES
    ) {
      const inicioSlot = minutes;
      const finSlot = minutes + durationMinutes;

      const solapado = intervalosTomados.some(({ inicio, fin }) => {
        return inicioSlot < fin && finSlot > inicio;
      });

      const label = formatMinutes(minutes);
      if (solapado) {
        continue;
      }

      availableSlots.push(label);
    }

    return NextResponse.json(
      {
        durationMinutes,
        slots: availableSlots,
        takenSlots: Array.from(takenSlots),
      },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  } catch (error) {
    console.error('Error al obtener horarios disponibles:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor al obtener los horarios disponibles.' },
      {
        status: 500,
        headers: { 'Cache-Control': 'no-store' },
      }
    );
  }
}
