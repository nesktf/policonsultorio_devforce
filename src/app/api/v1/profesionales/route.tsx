// src/app/api/v1/profesionales/route.ts

import { NextResponse } from 'next/server';
import { getProfesionalesEspecialidad, crearProfesional, obtenerProfesionales, verificarDNIExistente } from '@/prisma/profesional';
import type { DatosProfesionalFormulario } from '@/components/RegistrarProfesionalModal';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET - Búsqueda y filtros de profesionales
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const especialidad = searchParams.get('especialidad');
  const nombre = searchParams.get('nombre');
  const obraSocialId = searchParams.get('obra_social_id');
  
  // verifico existencia del dni
  const verificarDni = searchParams.get('verificar_dni');

  try {
    // espero mientras se verifica
    if (verificarDni) {
      const dniExiste = await verificarDNIExistente(verificarDni);
      return NextResponse.json({ 
        existe: dniExiste,
        dni: verificarDni 
      }, {
        headers: {
          'Cache-Control': 'no-store',
        },
      });
    }

    //llamo a los profesionales
    let profesionales = await obtenerProfesionales();

    // Aplico los filtros
    if (especialidad && especialidad.trim() !== '') {
      profesionales = profesionales.filter(prof => 
        prof.especialidad.toLowerCase() === especialidad.toLowerCase()
      );
    }

    if (nombre && nombre.trim() !== '') {
      const termino = nombre.toLowerCase().trim();
      profesionales = profesionales.filter(prof => 
        prof.nombre.toLowerCase().includes(termino) || 
        prof.apellido.toLowerCase().includes(termino) ||
        `${prof.nombre} ${prof.apellido}`.toLowerCase().includes(termino)
      );
    }

    if (obraSocialId && obraSocialId !== '0') {
      const obraSocialIdNum = parseInt(obraSocialId);
      profesionales = profesionales.filter(prof => 
        prof.obras_sociales?.some(os => os.id_obra_social === obraSocialIdNum)
      );
    }

    return NextResponse.json(profesionales, {
      headers: {
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('Error en GET /api/v1/profesionales:', error);
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

// Crear profesional con verificación de DNI
export async function POST(request: Request) {
  try {
    const datos: DatosProfesionalFormulario = await request.json();
    
    // Validaciones básicas
    if (!datos.nombre || !datos.apellido || !datos.dni) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      );
    }

    // Validar formato de DNI
    const dniRegex = /^\d{1,9}$/;
    if (!dniRegex.test(datos.dni)) {
      return NextResponse.json(
        { error: 'El DNI debe contener solo números y máximo 9 dígitos' },
        { status: 400 }
      );
    }

    // Validar formato de teléfono
    const telefonoRegex = /^\+\d{1,13}$/;
    if (!telefonoRegex.test(datos.telefono)) {
      return NextResponse.json(
        { error: 'El teléfono debe comenzar con + seguido de números (máximo 14 caracteres)' },
        { status: 400 }
      );
    }

    // Crear el profesional 
    const nuevoProfesional = await crearProfesional(datos);
    
    return NextResponse.json(nuevoProfesional, { 
      status: 201,
      headers: {
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('Error al crear profesional:', error);
    
    // Si es un error de DNI duplicado, devolver mensaje específico
    if (error instanceof Error && error.message.includes('DNI')) {
      return NextResponse.json(
        { error: error.message },
        { 
          status: 409, // Conflict
          headers: {
            'Cache-Control': 'no-store',
          },
        }
      );
    }
    
    // Para otros errores
    return NextResponse.json(
      { error: 'Error al registrar el profesional' },
      { 
        status: 500,
        headers: {
          'Cache-Control': 'no-store',
        },
      }
    );
  }
}