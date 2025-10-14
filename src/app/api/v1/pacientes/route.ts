// app/api/v1/pacientes/route.ts
import { NextResponse } from 'next/server';
import {
  createPatient,
  getPacienteByDni,
  searchPacientes,
  getPacientes,
} from '@/prisma/pacientes';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface CreatePacientePayload {
  nombre?: unknown;
  apellido?: unknown;
  dni?: unknown;
  telefono?: unknown;
  direccion?: unknown;
  fecha_nacimiento?: unknown;
  id_obra_social?: unknown;
  num_obra_social?: unknown;
}

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;

const parseOptionalNumber = (value: unknown): number | null => {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  if (typeof value === 'number' && Number.isInteger(value)) {
    return value;
  }
  if (typeof value === 'string' && value.trim() !== '' && Number.isInteger(Number(value))) {
    return Number(value);
  }
  return null;
};

// GET - Buscar o listar todos los pacientes
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const searchTerm = searchParams.get('search');

  try {
    // Si hay término de búsqueda, buscar pacientes
    if (searchTerm && searchTerm.trim().length > 0) {
      const pacientes = await searchPacientes(searchTerm.trim());
      const resultados = pacientes.map((paciente) => ({
        id: paciente.id,
        nombre: paciente.nombre,
        apellido: paciente.apellido,
        dni: paciente.dni,
        telefono: paciente.telefono,
        direccion: paciente.direccion,
        fecha_nacimiento: paciente.fecha_nacimiento,
        num_obra_social: paciente.num_obra_social,
        obra_social: paciente.obra_social,
        fecha_registro: paciente.fecha_registro,
      }));

      return NextResponse.json(
        {
          total: resultados.length,
          pacientes: resultados,
        },
        { headers: { 'Cache-Control': 'no-store' } },
      );
    }

    // Si no hay búsqueda, devolver todos los pacientes
    const { pacientes, obrasSociales } = await getPacientes();
    
    return NextResponse.json(
      {
        total: pacientes.length,
        pacientes: pacientes.map(p => ({
          id: p.id,
          nombre: p.nombre,
          apellido: p.apellido,
          dni: p.dni,
          telefono: p.telefono,
          direccion: p.direccion,
          fecha_nacimiento: p.fecha_nacimiento,
          num_obra_social: p.num_obra_social,
          obra_social: p.obra_social,
          fecha_registro: p.fecha_registro,
        })),
        obrasSociales,
      },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  } catch (error) {
    console.error('Error al obtener pacientes:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor al obtener pacientes.' },
      { status: 500 },
    );
  }
}

// POST - Crear nuevo paciente
export async function POST(request: Request) {
  let payload: CreatePacientePayload;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { error: 'Cuerpo de la petición inválido. Debe ser JSON.' },
      { status: 400 },
    );
  }

  console.log('Payload recibido en API:', JSON.stringify(payload, null, 2));

  const {
    nombre,
    apellido,
    dni,
    telefono,
    direccion,
    fecha_nacimiento,
    id_obra_social,
    num_obra_social,
  } = payload;

  console.log('fecha_nacimiento extraída:', fecha_nacimiento, 'tipo:', typeof fecha_nacimiento);

  // Validaciones
  if (!isNonEmptyString(nombre)) {
    return NextResponse.json(
      { error: 'Nombre es requerido y debe ser un string no vacío.' },
      { status: 400 },
    );
  }

  if (!isNonEmptyString(apellido)) {
    return NextResponse.json(
      { error: 'Apellido es requerido y debe ser un string no vacío.' },
      { status: 400 },
    );
  }

  if (!isNonEmptyString(dni) || !/^\d{7,9}$/.test(dni.trim())) {
    return NextResponse.json(
      { error: 'DNI es requerido y debe contener solo números (7 a 9 dígitos).' },
      { status: 400 },
    );
  }

  if (!isNonEmptyString(telefono)) {
    return NextResponse.json(
      { error: 'Teléfono es requerido y debe ser un string no vacío.' },
      { status: 400 },
    );
  }

  if (!isNonEmptyString(direccion)) {
    return NextResponse.json(
      { error: 'Dirección es requerida y debe ser un string no vacío.' },
      { status: 400 },
    );
  }

  if (typeof fecha_nacimiento !== 'string' || fecha_nacimiento.trim().length === 0) {
    return NextResponse.json(
      { error: 'Fecha de nacimiento es requerida y debe ser un string con formato YYYY-MM-DD.' },
      { status: 400 },
    );
  }

  const fechaNacimientoDate = new Date(`${fecha_nacimiento}T00:00:00Z`);
  if (Number.isNaN(fechaNacimientoDate.getTime())) {
    return NextResponse.json(
      { error: 'Fecha de nacimiento inválida. Utilice el formato YYYY-MM-DD.' },
      { status: 400 },
    );
  }

  const obraSocialId = parseOptionalNumber(id_obra_social);

  if (obraSocialId !== null && !isNonEmptyString(num_obra_social)) {
    return NextResponse.json(
      { error: 'Número de obra social es requerido cuando se indica una obra social.' },
      { status: 400 },
    );
  }

  // Verificar si el paciente ya existe
  const existingPaciente = await getPacienteByDni(dni.trim());
  if (existingPaciente) {
    return NextResponse.json(
      { error: 'Ya existe un paciente registrado con ese DNI.' },
      { status: 409 },
    );
  }

  try {
    const nuevoPaciente = await createPatient({
      nombre: nombre.trim(),
      apellido: apellido.trim(),
      dni: dni.trim(),
      telefono: telefono.trim(),
      direccion: direccion.trim(),
      fecha_nacimiento: fechaNacimientoDate,
      id_obra_social: obraSocialId,
      num_obra_social: obraSocialId ? String(num_obra_social).trim() : null,
    });

    return NextResponse.json(nuevoPaciente, {
      status: 201,
      headers: {
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('Error al registrar paciente:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor al registrar el paciente.' },
      { status: 500 },
    );
  }
}