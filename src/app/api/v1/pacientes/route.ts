import { NextResponse } from 'next/server';
import { createPatient, getPacienteByDni } from '@/prisma/pacientes';

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

  if (!isNonEmptyString(nombre)) {
    return NextResponse.json(
      { error: 'nombre es requerido y debe ser un string no vacío.' },
      { status: 400 },
    );
  }

  if (!isNonEmptyString(apellido)) {
    return NextResponse.json(
      { error: 'apellido es requerido y debe ser un string no vacío.' },
      { status: 400 },
    );
  }

  if (!isNonEmptyString(dni) || !/^\d{7,9}$/.test(dni.trim())) {
    return NextResponse.json(
      { error: 'dni es requerido y debe contener solo números (7 a 9 dígitos).' },
      { status: 400 },
    );
  }

  if (!isNonEmptyString(telefono)) {
    return NextResponse.json(
      { error: 'telefono es requerido y debe ser un string no vacío.' },
      { status: 400 },
    );
  }

  if (!isNonEmptyString(direccion)) {
    return NextResponse.json(
      { error: 'direccion es requerida y debe ser un string no vacío.' },
      { status: 400 },
    );
  }

  if (typeof fecha_nacimiento !== 'string' || fecha_nacimiento.trim().length === 0) {
    return NextResponse.json(
      { error: 'fecha_nacimiento es requerida y debe ser un string con formato YYYY-MM-DD.' },
      { status: 400 },
    );
  }

  const fechaNacimientoDate = new Date(`${fecha_nacimiento}T00:00:00`);
  if (Number.isNaN(fechaNacimientoDate.getTime())) {
    return NextResponse.json(
      { error: 'fecha_nacimiento inválida. Utilice el formato YYYY-MM-DD.' },
      { status: 400 },
    );
  }

  const obraSocialId = parseOptionalNumber(id_obra_social);

  if (obraSocialId !== null && !isNonEmptyString(num_obra_social)) {
    return NextResponse.json(
      { error: 'num_obra_social es requerido cuando se indica una obra social.' },
      { status: 400 },
    );
  }

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
