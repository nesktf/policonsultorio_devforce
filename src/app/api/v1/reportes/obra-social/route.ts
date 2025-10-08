{/*
import { NextResponse } from 'next/server';
import { getReporteObraSocial } from '@/prisma/obra_social';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function parseIntOrNull(value: string | null) {
  if (!value) {
    return null;
  }
  const parsed = Number(value);
  return Number.isInteger(parsed) ? parsed : null;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const obraSocialIdParam = searchParams.get('obraSocialId');
  
  if (!obraSocialIdParam) {
    return NextResponse.json(
      { error: 'Debes indicar el parámetro "obraSocialId".' },
      { status: 400 },
    );
  }

  const obraSocialId = parseIntOrNull(obraSocialIdParam);
  
  if (obraSocialId === null) {
    return NextResponse.json(
      { error: 'El parámetro "obraSocialId" debe ser un número válido.' },
      { status: 400 },
    );
  }

  try {
    const reporte = await getReporteObraSocial(obraSocialId);

    if (!reporte) {
      return NextResponse.json(
        { error: 'Obra social no encontrada.' },
        { status: 404 },
      );
    }

    return NextResponse.json(reporte, {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (error) {
    console.error('Error al generar el reporte de obra social:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor al generar el reporte.' },
      { status: 500 },
    );
  }
}
*/}

import { NextResponse } from 'next/server';
import { getReporteObraSocial } from '@/prisma/obra_social';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function parseIntOrNull(value: string | null): number | null {
  if (!value) return null;
  const parsed = Number(value);
  return Number.isInteger(parsed) ? parsed : null;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const obraSocialIdParam = searchParams.get('obraSocialId');

  if (!obraSocialIdParam) {
    return NextResponse.json(
      { error: 'Debes indicar el parámetro "obraSocialId".' },
      { status: 400 },
    );
  }

  // MODIFICADO: Lógica para manejar 'sin-obra-social'
  let obraSocialId: number | null;
  
  if (obraSocialIdParam === 'sin-obra-social') {
    obraSocialId = null; // Usamos null para representar a los particulares
  } else {
    obraSocialId = parseIntOrNull(obraSocialIdParam);
    if (obraSocialId === null) {
      return NextResponse.json(
        { error: 'El parámetro "obraSocialId" debe ser un número válido o "sin-obra-social".' },
        { status: 400 },
      );
    }
  }

  try {
    // La función getReporteObraSocial ahora aceptará 'null'
    const reporte = await getReporteObraSocial(obraSocialId);

    if (!reporte) {
      return NextResponse.json(
        { error: 'Datos no encontrados para la selección.' },
        { status: 404 },
      );
    }

    return NextResponse.json(reporte, {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (error) {
    console.error('Error al generar el reporte:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor al generar el reporte.' },
      { status: 500 },
    );
  }
}