import { DBId, prisma } from "@/prisma/instance";
import { EstadoTurno } from "@/generated/prisma";

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
    },
  });
}

export async function profesionalHasTurnoAt(
  id_profesional: DBId,
  fecha: Date
): Promise<boolean> {
  return (
    (await prisma.turno.findFirst({
      where: {
        id_profesional,
        fecha,
      },
    })) != undefined
  );
}

export class TurnoData {
  id_paciente: DBId;
  id_profesional: DBId;
  fecha: Date;
  estado: EstadoTurno;
  motivo: string;
  detalle: string;

  constructor(
    id_paciente: DBId,
    id_profesional: DBId,
    fecha: Date,
    estado: EstadoTurno,
    motivo: string,
    detalle: string
  ) {
    this.id_paciente = id_paciente;
    this.id_profesional = id_profesional;
    this.fecha = fecha;
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
  let id_paciente = data.getPaciente();
  let id_profesional = data.getProfesional();
  let fecha = data.getFecha();
  let estado = data.getEstado();
  let motivo = data.getMotivo();
  let detalle = data.getDetalle();

  return await prisma.$transaction([
    prisma.turno.create({
      data: {
        id_paciente,
        id_profesional,
        fecha,
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
