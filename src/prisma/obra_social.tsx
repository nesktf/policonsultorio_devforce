import { prisma, DBId, DBData } from "@/prisma/instance";
import { EstadoObraSocial } from "@/generated/prisma";


export class ObraSocialData {
  private nombre: string;
  private estado: EstadoObraSocial;

  constructor(nombre: string, estado?: EstadoObraSocial) {
    this.nombre = nombre;
    if (estado) {
      this.estado = estado;
    } else {
      this.estado = EstadoObraSocial.ACTIVA;
    }
  }

  getNombre(): string { return this.nombre; }
  getEstado(): EstadoObraSocial { return this.estado; }
};

export async function retrieveObrasSociales(estado?: EstadoObraSocial): Promise<Array<DBData<ObraSocialData>>> {
  try {
    return await prisma.obraSocial.findMany({ where: { estado }})
    .then((oss) => oss.map((os): DBData<ObraSocialData> => {
      return { id: os.id, data: new ObraSocialData(os.nombre, os.estado) };
    }));
  } catch (err) {
    console.log(`Error @ fetchObraSociales(): ${err}`);
    return []
  }
}

export async function findObrasSociales(nombre: string,
                                        estado?: EstadoObraSocial): Promise<Array<DBData<ObraSocialData>>> {
  try {
    return prisma.obraSocial.findMany({
      where: {
        nombre: {
          contains: nombre,
          mode: "insensitive",
        },
        estado
      },
    })
    .then((oss) => oss.map((os): DBData<ObraSocialData> => {
      return { id: os.id, data: new ObraSocialData(os.nombre, os.estado) };
    }));
  } catch (err) {
    console.log(`Error @ findObrasSociales(): ${err}`);
    return []
  }
}

export async function createObraSocial(os: ObraSocialData): Promise<DBData<ObraSocialData> | null> {
  try {
    let ret = await prisma.obraSocial.create({
      data: { nombre: os.getNombre(), estado: os.getEstado() }
    });
    return { id: ret.id, data: os };
  } catch (err) {
    console.log(`Error @ createObraSocial(): ${err}`);
    return null;
  }
}

export async function updateObraSocial(id: DBId, os: ObraSocialData): Promise<boolean> {
  try {
    await prisma.obraSocial.update({
      where: { id },
      data: { nombre: os.getNombre(), estado: os.getEstado() }
    });
    return true;
  } catch (err) {
    console.log(`Error @ updateObraSocial() ${err}`);
    return false;
  }
}


// Para reportes
export async function getReporteObraSocial(obraSocialId: number | null) {
  try {
    let obraSocialInfo: { id: number | null; nombre: string; estado: string };
    let patientWhereClause: object;
    let profesionalWhereClause: object;
    let turnosWhereClause: object; // NUEVO: Filtro común para turnos

    // 1. Definir la información y los filtros
    if (obraSocialId === null) {
      // Caso para "Sin Obra Social"
      obraSocialInfo = {
        id: null,
        nombre: 'Sin Obra Social (Particulares)',
        estado: 'ACTIVA',
      };
      patientWhereClause = { id_obra_social: null };
      profesionalWhereClause = {};
      // CORREGIDO: Filtro para turnos de particulares
      turnosWhereClause = {
        paciente: { id_obra_social: null }
      };
    } else {
      // Caso para una Obra Social específica
      const obraSocial = await prisma.obraSocial.findUnique({
        where: { id: obraSocialId },
      });

      if (!obraSocial) return null;

      obraSocialInfo = obraSocial;
      patientWhereClause = { id_obra_social: obraSocialId };
      profesionalWhereClause = {
        obras_sociales: {
          some: {
            id_obra_social: obraSocialId,
          },
        },
      };
      // CORREGIDO: Filtro para turnos que cumplen AMBAS condiciones
      turnosWhereClause = {
        paciente: { id_obra_social: obraSocialId },
        profesional: {
          obras_sociales: {
            some: {
              id_obra_social: obraSocialId,
            },
          },
        },
      };
    }

    // 2. Obtener los datos usando los filtros dinámicos
    const [pacientes, profesionalesRelevantes, todosLosTurnos] = await Promise.all([
      prisma.paciente.findMany({
        where: patientWhereClause,
        select: {
          id: true,
          turnos: { 
            where: turnosWhereClause, // Aplicar el filtro correcto
            select: { estado: true, fecha: true } 
          },
        },
      }),
      prisma.profesional.findMany({
        where: profesionalWhereClause,
        select: {
          id: true,
          nombre: true,
          apellido: true,
          especialidad: true,
          turnos: {
            where: turnosWhereClause, // Usar el mismo filtro
            select: { id: true, estado: true },
          },
        },
      }),
      // NUEVO: Obtener todos los turnos filtrados directamente
      prisma.turno.findMany({
        where: turnosWhereClause,
        select: {
          id: true,
          estado: true,
          fecha: true,
        },
      }),
    ]);

    // 3. Calcular las métricas
    const totalPacientes = pacientes.length;
    
    const pacientesActivos = pacientes.filter(p => 
      p.turnos.some(t => {
        const fechaTurno = new Date(t.fecha);
        const haceUnMes = new Date();
        haceUnMes.setMonth(haceUnMes.getMonth() - 1);
        return fechaTurno >= haceUnMes;
      })
    ).length;

    // CORREGIDO: Usar todosLosTurnos en lugar de turnos de pacientes
    const turnosPorEstado = {
      PROGRAMADO: todosLosTurnos.filter(t => t.estado === 'PROGRAMADO').length,
      EN_SALA_ESPERA: todosLosTurnos.filter(t => t.estado === 'EN_SALA_ESPERA').length,
      ASISTIO: todosLosTurnos.filter(t => t.estado === 'ASISTIO').length,
      NO_ASISTIO: todosLosTurnos.filter(t => t.estado === 'NO_ASISTIO').length,
      CANCELADO: todosLosTurnos.filter(t => t.estado === 'CANCELADO').length,
    };

    const profesionalesData = profesionalesRelevantes.map(prof => ({
      id: prof.id,
      nombre: `${prof.nombre} ${prof.apellido}`,
      especialidad: prof.especialidad,
      turnosAtendidos: prof.turnos.filter(t => t.estado === 'ASISTIO').length,
    })).sort((a, b) => b.turnosAtendidos - a.turnosAtendidos);

    // Distribución de especialidades
    const distribucionEspecialidadesMap = new Map<string, number>();
    profesionalesRelevantes.forEach(p => {
        const count = distribucionEspecialidadesMap.get(p.especialidad) || 0;
        distribucionEspecialidadesMap.set(p.especialidad, count + 1);
    });

    const distribucionEspecialidades = Array.from(distribucionEspecialidadesMap.entries())
      .map(([especialidad, cantidad]) => ({ especialidad, cantidad }))
      .sort((a, b) => b.cantidad - a.cantidad);
    
    // 4. Ensamblar y devolver el reporte
    return {
      obraSocial: obraSocialInfo,
      metricas: {
        totalPacientes,
        pacientesActivos,
        totalProfesionales: profesionalesRelevantes.length,
        totalTurnos: todosLosTurnos.length, // CORREGIDO: Usar el conteo correcto
      },
      turnosPorEstado,
      profesionales: profesionalesData,
      distribucionEspecialidades,
    };

  } catch (error) {
    console.error('Error al generar reporte:', error);
    throw error;
  }
}