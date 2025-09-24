// src/app/api/profesionales/route.ts

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request) {
  // Obtenemos la URL para poder leer los parámetros
  const { searchParams } = new URL(request.url);
  // Buscamos un parámetro llamado 'especialidad' en la URL
  const especialidad = searchParams.get('especialidad');

  // Si no nos envían una especialidad, devolvemos un error
  if (!especialidad) {
    return NextResponse.json(
      { error: 'El parámetro especialidad es requerido' },
      { status: 400 }
    );
  }

  try {
    // Usamos Prisma para buscar todos los profesionales que coincidan con la especialidad
    const profesionales = await prisma.profesional.findMany({
      where: {
        especialidad,
      },
      select: {
        id: true,
        nombre: true,
        apellido: true,
      },
      orderBy: {
        apellido: 'asc',
      },
    });

    // Devolvemos solo los campos necesarios para el selector del cliente
    return NextResponse.json(profesionales, {
      headers: {
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('Error al buscar profesionales:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      {
        status: 500,
        headers: {
          'Cache-Control': 'no-store',
        },
      }
    );
  }
}
