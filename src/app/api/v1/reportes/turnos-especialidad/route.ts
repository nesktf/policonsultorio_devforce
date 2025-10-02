import { NextResponse } from 'next/server';
import { getTurnosPorEspecialidad } from '@/prisma/turnos';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function parseDate(value: string | null): Date | null {
  if (!value) {
    return null;
  }
  const isDateOnly = /^\d{4}-\d{2}-\d{2}$/.test(value);
  const isoValue = isDateOnly ? `${value}T00:00:00.000Z` : value;
  const parsed = new Date(isoValue);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function startOfDay(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0, 0));
}

function endOfDay(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 23, 59, 59, 999));
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const fromParam = parseDate(searchParams.get('from'));
  const toParam = parseDate(searchParams.get('to'));

  if (!fromParam || !toParam) {
    return NextResponse.json(
      { error: 'Debes indicar los parámetros "from" y "to" en formato YYYY-MM-DD o ISO 8601.' },
      { status: 400 },
    );
  }

  const from = startOfDay(fromParam);
  const to = endOfDay(toParam);

  if (from > to) {
    return NextResponse.json(
      { error: 'El parámetro "from" debe ser menor o igual que "to".' },
      { status: 400 },
    );
  }

  try {
    const datos = await getTurnosPorEspecialidad(from, to);
    const totalTurnos = datos.reduce((acc, item) => acc + item.total, 0);

    return NextResponse.json(
      {
        rango: {
          from: from.toISOString(),
          to: to.toISOString(),
        },
        totalEspecialidades: datos.length,
        totalTurnos,
        resultados: datos,
      },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  } catch (error) {
    console.error('Error al generar el reporte de turnos por especialidad:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor al generar el reporte.' },
      { status: 500 },
    );
  }
}
