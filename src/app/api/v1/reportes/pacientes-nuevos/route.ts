import { NextResponse } from 'next/server';
import { getPacientesNuevosPorMes } from '@/prisma/pacientes';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const YEAR_REGEX = /^\d{4}$/;

function parseIntOrNull(value: string | null) {
  if (!value) {
    return null;
  }
  const parsed = Number(value);
  return Number.isInteger(parsed) ? parsed : null;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const yearParam = searchParams.get('year');
  if (!yearParam || !YEAR_REGEX.test(yearParam)) {
    return NextResponse.json(
      { error: 'Debes indicar el parámetro "year" con un año de cuatro dígitos.' },
      { status: 400 },
    );
  }

  const year = Number(yearParam);
  const obraSocialId = parseIntOrNull(searchParams.get('obraSocialId'));

  try {
    const reporte = await getPacientesNuevosPorMes(year, obraSocialId);

    return NextResponse.json(
      {
        ...reporte,
        mensaje: reporte.total === 0 ? 'No se encontraron registros para los filtros aplicados.' : undefined,
      },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  } catch (error) {
    console.error('Error al generar el reporte de pacientes nuevos:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor al generar el reporte.' },
      { status: 500 },
    );
  }
}
