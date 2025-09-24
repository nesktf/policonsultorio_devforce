import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const DEFAULT_SLOTS = [
  '09:00',
  '09:30',
  '10:00',
  '10:30',
  '11:00',
  '11:30',
  '12:00',
  '12:30',
  '13:00',
  '13:30',
  '14:00',
  '14:30',
  '15:00',
  '15:30',
  '16:00',
  '16:30',
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const profesionalIdParam = searchParams.get('profesionalId');
  const fechaParam = searchParams.get('fecha');
  const timezoneOffsetParam = searchParams.get('timezoneOffset');

  const profesionalId = Number(profesionalIdParam);
  const timezoneOffsetMinutes = Number(timezoneOffsetParam ?? '0');
  const effectiveOffset = Number.isFinite(timezoneOffsetMinutes) ? timezoneOffsetMinutes : 0;

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
    const turnos = await prisma.turno.findMany({
      where: {
        id_profesional: profesionalId,
        fecha: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      select: {
        fecha: true,
      },
    });

    const takenSlots = new Set(
      turnos.map(({ fecha }) => {
        const utcDate = new Date(fecha);
        const localDate = new Date(utcDate.getTime() - effectiveOffset * 60_000);
        const hours = localDate.getHours().toString().padStart(2, '0');
        const minutes = localDate.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
      })
    );

    const availableSlots = DEFAULT_SLOTS.filter((slot) => !takenSlots.has(slot));

    return NextResponse.json(
      { slots: availableSlots, takenSlots: Array.from(takenSlots) },
      { headers: { 'Cache-Control': 'no-store' } }
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
