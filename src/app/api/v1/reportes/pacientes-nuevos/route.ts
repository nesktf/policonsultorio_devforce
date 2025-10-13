import { NextResponse } from 'next/server';
import { getPacientesNuevosPorPeriodoConAgrupacion } from '@/prisma/pacientes';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const AGRUPACIONES_VALIDAS = ["day", "week", "month"] as const;

function parseIntOrNull(value: string | null) {
  if (!value) {
    return null;
  }
  const parsed = Number(value);
  return Number.isInteger(parsed) ? parsed : null;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const fechaInicio = searchParams.get('fechaInicio');
  const fechaFin = searchParams.get('fechaFin');

  if (!fechaInicio || !DATE_REGEX.test(fechaInicio)) {
    return NextResponse.json(
      { error: 'Debes indicar el parámetro "fechaInicio" con formato YYYY-MM-DD.' },
      { status: 400 },
    );
  }

  if (!fechaFin || !DATE_REGEX.test(fechaFin)) {
    return NextResponse.json(
      { error: 'Debes indicar el parámetro "fechaFin" con formato YYYY-MM-DD.' },
      { status: 400 },
    );
  }

  const obraSocialIdParam = searchParams.get('obraSocialId');
  let id_obra_social: number | null | 'sin-obra-social' = null;
  
  if (obraSocialIdParam === 'sin-obra-social') {
    id_obra_social = 'sin-obra-social';
  } else if (obraSocialIdParam) {
    const parsed = parseIntOrNull(obraSocialIdParam);
    id_obra_social = parsed;
  }

  const groupByParam = (searchParams.get("groupBy") ?? "month").toLowerCase();
  const agrupacion = AGRUPACIONES_VALIDAS.includes(groupByParam as (typeof AGRUPACIONES_VALIDAS)[number])
    ? (groupByParam as (typeof AGRUPACIONES_VALIDAS)[number])
    : "month";

  try {
    const reporte = await getPacientesNuevosPorPeriodoConAgrupacion(
      new Date(fechaInicio),
      new Date(fechaFin),
      id_obra_social,
      agrupacion
    );

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