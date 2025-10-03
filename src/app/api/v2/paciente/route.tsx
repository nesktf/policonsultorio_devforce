import { NextRequest, NextResponse } from "next/server";
import {
  getPacientes,
  getPacienteById,
  createPatient,
  updatePatient,
  searchPacientes,
} from "@/prisma/pacientes";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET - Obtener pacientes
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const idPaciente = searchParams.get('id');
    const searchTerm = searchParams.get('search');

    // Si hay ID, devolver un paciente específico
    if (idPaciente) {
      const paciente = await getPacienteById(parseInt(idPaciente));
      
      if (!paciente) {
        return NextResponse.json(
          { error: 'Paciente no encontrado' },
          { status: 404 }
        );
      }

      return NextResponse.json(
        { pacientes: [paciente] },
        { headers: { 'Cache-Control': 'no-store' } }
      );
    }

    // Si hay término de búsqueda
    if (searchTerm && searchTerm.trim().length > 0) {
      const pacientes = await searchPacientes(searchTerm.trim());
      return NextResponse.json(
        {
          total: pacientes.length,
          pacientes: pacientes.map(p => ({
            id: p.id.toString(),
            nombre: p.nombre,
            apellido: p.apellido,
            dni: p.dni,
            telefono: p.telefono,
            email: '', // No está en el schema, agregar si es necesario
            fechaNacimiento: p.fecha_nacimiento.toISOString().split('T')[0],
            direccion: p.direccion,
            obraSocial: p.obra_social?.nombre || null,
            numeroAfiliado: p.num_obra_social || null,
            estado: 'ACTIVO', // Agregar campo estado al schema si es necesario
            fechaRegistro: p.fecha_registro.toISOString().split('T')[0],
            ultimaConsulta: p.historias?.[0]?.fecha?.toISOString().split('T')[0] || null,
          }))
        },
        { headers: { 'Cache-Control': 'no-store' } }
      );
    }

    // Devolver todos los pacientes
    const { pacientes, obrasSociales } = await getPacientes();
    
    return NextResponse.json(
      {
        total: pacientes.length,
        pacientes: pacientes.map(p => ({
          id: p.id.toString(),
          nombre: p.nombre,
          apellido: p.apellido,
          dni: p.dni,
          telefono: p.telefono,
          email: '', // No está en el schema
          fechaNacimiento: p.fecha_nacimiento.toISOString().split('T')[0],
          direccion: p.direccion,
          obraSocial: p.obra_social?.nombre || null,
          numeroAfiliado: p.num_obra_social || null,
          estado: 'ACTIVO',
          fechaRegistro: p.fecha_registro.toISOString().split('T')[0],
          ultimaConsulta: null, // Calcular desde historias si es necesario
          profesionalesAsignados: [],
          turnosReservados: [],
          consultasRealizadas: [],
        })),
        obrasSociales: obrasSociales.map(os => ({
          id: os.id,
          nombre: os.nombre,
        })),
      },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (error) {
    console.error('Error en GET /api/v2/paciente:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// POST - Crear nuevo paciente
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validaciones básicas
    if (!body.nombre || typeof body.nombre !== 'string' || body.nombre.trim().length === 0) {
      return NextResponse.json(
        { error: 'El nombre es requerido' },
        { status: 400 }
      );
    }

    if (!body.apellido || typeof body.apellido !== 'string' || body.apellido.trim().length === 0) {
      return NextResponse.json(
        { error: 'El apellido es requerido' },
        { status: 400 }
      );
    }

    if (!body.dni || typeof body.dni !== 'string' || !/^\d{7,8}$/.test(body.dni.trim())) {
      return NextResponse.json(
        { error: 'DNI inválido. Debe contener 7 u 8 dígitos' },
        { status: 400 }
      );
    }

    if (!body.telefono || typeof body.telefono !== 'string' || body.telefono.trim().length === 0) {
      return NextResponse.json(
        { error: 'El teléfono es requerido' },
        { status: 400 }
      );
    }

    if (!body.direccion || typeof body.direccion !== 'string' || body.direccion.trim().length === 0) {
      return NextResponse.json(
        { error: 'La dirección es requerida' },
        { status: 400 }
      );
    }

    if (!body.fechaNacimiento) {
      return NextResponse.json(
        { error: 'La fecha de nacimiento es requerida' },
        { status: 400 }
      );
    }

    const fechaNacimiento = new Date(body.fechaNacimiento);
    if (isNaN(fechaNacimiento.getTime())) {
      return NextResponse.json(
        { error: 'Fecha de nacimiento inválida' },
        { status: 400 }
      );
    }

    // Crear paciente
    const nuevoPaciente = await createPatient({
      nombre: body.nombre.trim(),
      apellido: body.apellido.trim(),
      dni: body.dni.trim(),
      telefono: body.telefono.trim(),
      direccion: body.direccion.trim(),
      fecha_nacimiento: fechaNacimiento,
      id_obra_social: body.obraSocialId ? parseInt(body.obraSocialId) : null,
      num_obra_social: body.numeroAfiliado?.trim() || null,
    });

    return NextResponse.json(
      {
        pacienteId: nuevoPaciente.id,
        mensaje: 'Paciente creado exitosamente',
        paciente: {
          id: nuevoPaciente.id.toString(),
          nombre: nuevoPaciente.nombre,
          apellido: nuevoPaciente.apellido,
          dni: nuevoPaciente.dni,
        }
      },
      { status: 201, headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (error: any) {
    console.error('Error en POST /api/v2/paciente:', error);
    
    // Error de DNI duplicado
    if (error.code === 'P2002' && error.meta?.target?.includes('dni')) {
      return NextResponse.json(
        { error: 'Ya existe un paciente registrado con ese DNI' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Error al crear el paciente' },
      { status: 500 }
    );
  }
}

// PUT - Actualizar paciente
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.id) {
      return NextResponse.json(
        { error: 'El ID del paciente es requerido' },
        { status: 400 }
      );
    }

    const updateData: any = {};

    if (body.nombre) updateData.nombre = body.nombre.trim();
    if (body.apellido) updateData.apellido = body.apellido.trim();
    if (body.dni) updateData.dni = body.dni.trim();
    if (body.telefono) updateData.telefono = body.telefono.trim();
    if (body.direccion) updateData.direccion = body.direccion.trim();
    if (body.fechaNacimiento) {
      updateData.fecha_nacimiento = new Date(body.fechaNacimiento);
    }
    if (body.obraSocialId !== undefined) {
      updateData.id_obra_social = body.obraSocialId ? parseInt(body.obraSocialId) : null;
    }
    if (body.numeroAfiliado !== undefined) {
      updateData.num_obra_social = body.numeroAfiliado?.trim() || null;
    }

    const pacienteActualizado = await updatePatient(
      parseInt(body.id),
      updateData
    );

    return NextResponse.json(
      {
        pacienteId: pacienteActualizado.id,
        mensaje: 'Paciente actualizado exitosamente',
      },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (error: any) {
    console.error('Error en PUT /api/v2/paciente:', error);

    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Paciente no encontrado' },
        { status: 404 }
      );
    }

    if (error.code === 'P2002' && error.meta?.target?.includes('dni')) {
      return NextResponse.json(
        { error: 'Ya existe un paciente con ese DNI' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Error al actualizar el paciente' },
      { status: 500 }
    );
  }
}