import { DBId, prisma } from "@/prisma/instance";
import { EstadoTurno } from "@/generated/prisma";

export interface TurnosCalendarioFilters {
  from: Date;
  to: Date;
  profesionalId?: DBId | null;
  especialidad?: string | null;
}

export async function getTurnosCalendario({
  from,
  to,
  profesionalId,
  especialidad,
}: TurnosCalendarioFilters) {
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
      fecha: "asc",
    },
  });
}

export async function getEstadisticasPorDia(from: Date, to: Date) {
  const turnos = await prisma.turno.findMany({
    where: {
      fecha: {
        gte: from,
        lte: to,
      },
    },
    select: {
      fecha: true,
      estado: true,
    },
  });

  const estadisticasPorDia = new Map<
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
    const fecha = new Date(turno.fecha);
    const dateKey = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, "0")}-${String(fecha.getDate()).padStart(2, "0")}`;

    const registro =
      estadisticasPorDia.get(dateKey) ?? {
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
    }

    estadisticasPorDia.set(dateKey, registro);
  }

  return Object.fromEntries(estadisticasPorDia);
}

export async function getProfesionalesConEspecialidades() {
  return prisma.profesional.findMany({
    select: {
      id: true,
      nombre: true,
      apellido: true,
      especialidad: true,
    },
    orderBy: {
      apellido: "asc",
    },
  });
}