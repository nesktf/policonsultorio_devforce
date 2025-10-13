import { DBId, prisma } from "@/prisma/instance";
import { EstadoTurno } from "@/generated/prisma";
import { Result } from "@/lib/error_monads";

interface TurnoResumen {
  id: number;
  paciente: string;
  profesional: string;
  fechaIso: string;
  estado: string;
}

export default async function getTurnosPageData() {
  try {
    const [pacientes, especialidades, turnos] = await Promise.all([
      prisma.paciente.findMany({
        select: {
          id: true,
          nombre: true,
          apellido: true,
          dni: true,
        },
      }),
      prisma.profesional.findMany({
        select: {
          especialidad: true,
        },
        distinct: ["especialidad"],
      }),
      prisma.turno.findMany({
        include: {
          paciente: {
            select: {
              nombre: true,
              apellido: true,
            },
          },
          profesional: {
            select: {
              nombre: true,
              apellido: true,
            },
          },
        },
        orderBy: {
          fecha: "asc",
        },
      }),
    ]);

    const turnosResumen: TurnoResumen[] = turnos.map((turno) => ({
      id: turno.id,
      paciente: `${turno.paciente.apellido}, ${turno.paciente.nombre}`,
      profesional: `${turno.profesional.apellido}, ${turno.profesional.nombre}`,
      fechaIso: turno.fecha.toISOString(),
      estado: turno.estado,
    }));

    return { pacientes, especialidades, turnos: turnosResumen };
  } catch (error) {
    console.error("Error fetching data for registrar turno page:", error);
    return { pacientes: [], especialidades: [], turnos: [] };
  }
}

export async function getProfesionalturnos(
  id: DBId,
  from_date: Date,
  to_date: Date
) {
  return await prisma.turno.findMany({
    where: {
      id_profesional: id,
      fecha: {
        gte: from_date,
        lte: to_date,
      },
    },
    select: {
      fecha: true,
      duracion_minutos: true,
    },
  });
}

export async function getTurnosCalendarioProfesional(id: DBId, from: Date, to: Date) {
  return prisma.turno.findMany({
    where: {
      id_profesional: id,
      fecha: {
        gte: from,
        lte: to,
      },
    },
    select: {
      id: true,
      fecha: true,
      duracion_minutos: true,
      estado: true,
      paciente: {
        select: {
          id: true,
          nombre: true,
          apellido: true,
          dni: true,
        },
      },
      profesional: {
        select: {
          id: true,
          nombre: true,
          apellido: true,
          especialidad: true,
        },
      },
    },
    orderBy: {
      fecha: 'asc',
    },
  });
}


export async function getTurnosFiltrados({
  from,
  to,
  profesionalId,
  especialidad,
}: {
  from: Date;
  to: Date;
  profesionalId?: DBId | null;
  especialidad?: string | null;
}) {
  return prisma.turno.findMany({
    where: {
      fecha: {
        gte: from,
        lte: to,
      },
      ...(profesionalId ? { id_profesional: profesionalId } : {}),
      ...(especialidad
        ? {
            profesional: {
              especialidad,
            },
          }
        : {}),
    },
    include: {
      paciente: {
        select: {
          id: true,
          nombre: true,
          apellido: true,
          dni: true,
          telefono: true,
        },
      },
      profesional: {
        select: {
          id: true,
          nombre: true,
          apellido: true,
          especialidad: true,
        },
      },
    },
    orderBy: {
      fecha: 'asc',
    },
  });
}

export async function getTurnosPorEspecialidad(from: Date, to: Date) {
  const turnos = await prisma.turno.findMany({
    where: {
      fecha: {
        gte: from,
        lte: to,
      },
    },
    select: {
      estado: true,
      profesional: {
        select: {
          especialidad: true,
        },
      },
    },
  });

  const agregados = new Map<
    string,
    {
      total: number;
      programados: number;
      enSalaEspera: number;
      asistidos: number;
      noAsistidos: number;
      cancelados: number;
    }
  >();

  for (const turno of turnos) {
    const especialidad = turno.profesional?.especialidad ?? 'Sin especialidad';
    const registro =
      agregados.get(especialidad) ?? {
        total: 0,
        programados: 0,
        enSalaEspera: 0,
        asistidos: 0,
        noAsistidos: 0,
        cancelados: 0,
      };

    registro.total += 1;

    switch (turno.estado) {
      case EstadoTurno.PROGRAMADO:
        registro.programados += 1;
        break;
      case EstadoTurno.EN_SALA_ESPERA:
        registro.enSalaEspera += 1;
        break;
      case EstadoTurno.ASISTIO:
        registro.asistidos += 1;
        break;
      case EstadoTurno.NO_ASISTIO:
        registro.noAsistidos += 1;
        break;
      case EstadoTurno.CANCELADO:
        registro.cancelados += 1;
        break;
      default:
        break;
    }

    agregados.set(especialidad, registro);
  }

  return Array.from(agregados.entries()).map(([especialidad, valores]) => ({
    especialidad,
    ...valores,
  }));
}

export async function profesionalTieneConflictoDeTurno(
  id_profesional: DBId,
  fecha: Date,
  duracionMinutos: number,
): Promise<boolean> {
  const inicio = new Date(fecha);
  const fin = new Date(inicio.getTime() + duracionMinutos * 60 * 1000);

  const diaInicio = new Date(inicio);
  diaInicio.setHours(0, 0, 0, 0);
  const diaFin = new Date(inicio);
  diaFin.setHours(23, 59, 59, 999);

  const turnos = await prisma.turno.findMany({
    where: {
      id_profesional,
      fecha: {
        gte: diaInicio,
        lte: diaFin,
      },
    },
    select: {
      fecha: true,
      duracion_minutos: true,
    },
  });

  return turnos.some((turno) => {
    const turnoInicio = new Date(turno.fecha);
    const turnoFin = new Date(
      turnoInicio.getTime() + turno.duracion_minutos * 60 * 1000,
    );
    return inicio < turnoFin && fin > turnoInicio;
  });
}

export class TurnoData {
  id_paciente: DBId;
  id_profesional: DBId;
  fecha: Date;
  duracion: number;
  estado: EstadoTurno;
  motivo: string;
  detalle: string;

  constructor(
    id_paciente: DBId,
    id_profesional: DBId,
    fecha: Date,
    duracion: number,
    estado: EstadoTurno,
    motivo: string,
    detalle: string
  ) {
    this.id_paciente = id_paciente;
    this.id_profesional = id_profesional;
    this.fecha = fecha;
    this.duracion = duracion;
    this.estado = estado;
    this.motivo = motivo;
    this.detalle = detalle;
  }

  getPaciente(): DBId {
    return this.id_paciente;
  }
  getProfesional(): DBId {
    return this.id_profesional;
  }
  getFecha(): Date {
    return this.fecha;
  }
  getDuracion(): number {
    return this.duracion;
  }
  getEstado(): EstadoTurno {
    return this.estado;
  }
  getMotivo(): string {
    return this.motivo;
  }
  getDetalle(): string {
    return this.detalle;
  }
}

export async function registerTurno(data: TurnoData) {
  const id_paciente = data.getPaciente();
  const id_profesional = data.getProfesional();
  const fecha = data.getFecha();
  const duracion_minutos = data.getDuracion();
  const estado = data.getEstado();
  const motivo = data.getMotivo();
  const detalle = data.getDetalle();

  return await prisma.$transaction([
    prisma.turno.create({
      data: {
        id_paciente,
        id_profesional,
        fecha,
        duracion_minutos,
        estado,
      },
    }),
    prisma.historiaClinica.create({
      data: {
        id_paciente,
        id_profesional,
        motivo,
        detalle,
      },
    }),
  ]);
}

export async function getTurnosOcupantes(profesionalId: DBId, fecha: string) {
  return await prisma.turno.findMany({
    where: {
      id_profesional: profesionalId,
      fecha: {
        gte: new Date(`${fecha}T00:00:00`),
        lt: new Date(`${fecha}T23:59:59`),
      },
      estado: {
        in: [
          EstadoTurno.PROGRAMADO,
          EstadoTurno.EN_SALA_ESPERA,
          EstadoTurno.ASISTIO,
          EstadoTurno.NO_ASISTIO,
        ],
      },
    },
    select: { id: true, fecha: true, duracion_minutos: true, estado: true },
  });
}

export async function updateTurnoEstado(turno_id: DBId, estado: EstadoTurno): Promise<Result<EstadoTurno>> {
  try {
    const res = await prisma.turno.update({
      where: { id: turno_id },
      data: { estado }
    });
    return Result.Some(res.estado);
  } catch (err) {
    return Result.None(new Error(`${err}`));
  }
}
