import { Maybe } from "@/lib/error_monads";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma/instance";

function parseId(maybe_id: string): Maybe<number> {
  try {
    const id = Math.floor(Number(maybe_id));
    if (id <= 0 || Number.isNaN(id)) {
      return Maybe.None();
    }
    return Maybe.Some(id);
  } catch (err) {
    return Maybe.None();
  }
}

// GET: Obtener turnos
// Query params:
// - id_turno: devuelve un turno específico
// - id_profesional: devuelve turnos del profesional
// - id_paciente: devuelve turnos del paciente
export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const raw_id_turno = params.get("id_turno");
  const raw_id_profesional = params.get("id_profesional");
  const raw_id_paciente = params.get("id_paciente");

  try {
    // Turno específico
    if (raw_id_turno) {
      const id_turno = parseId(raw_id_turno);
      if (!id_turno.hasValue()) {
        return NextResponse.json(
          { error: "ID de turno inválido" },
          { status: 400 }
        );
      }

      const turno = await prisma.turno.findUnique({
        where: { id: id_turno.unwrap() },
        include: {
          paciente: true,
          profesional: true,
        }
      });

      if (!turno) {
        return NextResponse.json(
          { error: "Turno no encontrado" },
          { status: 404 }
        );
      }

      return NextResponse.json({ turnos: [turno] });
    }

    // Turnos por profesional
    if (raw_id_profesional) {
      const id_profesional = parseId(raw_id_profesional);
      if (!id_profesional.hasValue()) {
        return NextResponse.json(
          { error: "ID de profesional inválido" },
          { status: 400 }
        );
      }

      const turnos = await prisma.turno.findMany({
        where: { id_profesional: id_profesional.unwrap() },
        include: {
          paciente: true,
          profesional: true,
        },
        orderBy: { fecha: 'desc' }
      });

      return NextResponse.json({ turnos });
    }

    // Turnos por paciente
    if (raw_id_paciente) {
      const id_paciente = parseId(raw_id_paciente);
      if (!id_paciente.hasValue()) {
        return NextResponse.json(
          { error: "ID de paciente inválido" },
          { status: 400 }
        );
      }

      const turnos = await prisma.turno.findMany({
        where: { id_paciente: id_paciente.unwrap() },
        include: {
          paciente: true,
          profesional: true,
        },
        orderBy: { fecha: 'desc' }
      });

      return NextResponse.json({ turnos });
    }

    // Todos los turnos
    const turnos = await prisma.turno.findMany({
      include: {
        paciente: true,
        profesional: true,
      },
      orderBy: { fecha: 'desc' }
    });

    return NextResponse.json({ turnos });

  } catch (error) {
    console.error('ERROR: api/v2/turnos @ GET:', error);
    return NextResponse.json(
      { error: "Error al obtener turnos" },
      { status: 500 }
    );
  }
}

// POST: Crear turno
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    const id_paciente = parseId(data.pacienteId);
    const id_profesional = parseId(data.profesionalId);

    if (!id_paciente.hasValue() || !id_profesional.hasValue()) {
      return NextResponse.json(
        { error: "IDs de paciente y profesional requeridos" },
        { status: 400 }
      );
    }

    if (!data.fecha) {
      return NextResponse.json(
        { error: "Fecha requerida" },
        { status: 400 }
      );
    }

    const turno = await prisma.turno.create({
      data: {
        id_paciente: id_paciente.unwrap(),
        id_profesional: id_profesional.unwrap(),
        fecha: new Date(data.fecha),
        duracion_minutos: data.duracionMinutos || 30,
        estado: data.estado || "PROGRAMADO",
      },
      include: {
        paciente: true,
        profesional: true,
      }
    });

    return NextResponse.json(
      { turnoId: turno.id, turno },
      { status: 201 }
    );

  } catch (error) {
    console.error('ERROR: api/v2/turnos @ POST:', error);
    return NextResponse.json(
      { error: "Error al crear turno" },
      { status: 500 }
    );
  }
}

// PUT: Actualizar turno
export async function PUT(req: NextRequest) {
  try {
    const data = await req.json();

    const id = parseId(data.id);
    if (!id.hasValue()) {
      return NextResponse.json(
        { error: "ID de turno inválido" },
        { status: 400 }
      );
    }

    const updateData: any = {};
    if (data.fecha) updateData.fecha = new Date(data.fecha);
    if (data.estado) updateData.estado = data.estado;
    if (data.duracionMinutos) updateData.duracion_minutos = data.duracionMinutos;

    const turno = await prisma.turno.update({
      where: { id: id.unwrap() },
      data: updateData,
      include: {
        paciente: true,
        profesional: true,
      }
    });

    return NextResponse.json({ turnoId: turno.id, turno });

  } catch (error) {
    console.error('ERROR: api/v2/turnos @ PUT:', error);
    return NextResponse.json(
      { error: "Error al actualizar turno" },
      { status: 500 }
    );
  }
}