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


//para reportes
export async function getReporteObraSocial(obraSocialId: number | null) {
  try {
    let obraSocialInfo: { id: number | null; nombre: string; estado: string };
    let patientWhereClause: object;
    let turnosInProfesionalWhereClause: object;
    let profesionalWhereClause: object; // <-- AÑADIDO: Filtro para profesionales

    // 1. Definir la información y los filtros
    if (obraSocialId === null) {
      // Caso para "Sin Obra Social"
      obraSocialInfo = {
        id: null,
        nombre: 'Sin Obra Social (Particulares)',
        estado: 'ACTIVA',
      };
      patientWhereClause = { id_obra_social: null };
      turnosInProfesionalWhereClause = { paciente: { id_obra_social: null } };
      // Para particulares, consideramos a todos los profesionales disponibles
      profesionalWhereClause = {}; 
    } else {
      // Caso para una Obra Social específica
      const obraSocial = await prisma.obraSocial.findUnique({
        where: { id: obraSocialId },
      });

      if (!obraSocial) return null;

      obraSocialInfo = obraSocial;
      patientWhereClause = { id_obra_social: obraSocialId };
      turnosInProfesionalWhereClause = { paciente: { id_obra_social: obraSocialId } };
      profesionalWhereClause = {
        obras_sociales: {
          some: {
            id_obra_social: obraSocialId,
          },
        },
      };
    }

    // 2. Obtener los datos usando los filtros dinámicos
    const [pacientes, profesionalesRelevantes] = await Promise.all([
      prisma.paciente.findMany({
        where: patientWhereClause,
        select: {
          id: true,
          turnos: { select: { estado: true, fecha: true } },
        },
      }),
      // Usamos el nuevo filtro para obtener solo los profesionales correctos
      prisma.profesional.findMany({
        where: profesionalWhereClause, // <-- APLICANDO EL FILTRO
        select: {
          id: true,
          nombre: true,
          apellido: true,
          especialidad: true,
          turnos: {
            where: turnosInProfesionalWhereClause, // Este filtro anidado sigue siendo necesario para los turnos
            select: { id: true, estado: true },
          },
        },
      }),
    ]);

    // 3. Calcular las métricas (esta lógica no cambia, pero ahora opera sobre datos correctos)
    const totalPacientes = pacientes.length;
    
    const pacientesActivos = pacientes.filter(p => 
      p.turnos.some(t => {
        const fechaTurno = new Date(t.fecha);
        const haceUnMes = new Date();
        haceUnMes.setMonth(haceUnMes.getMonth() - 1);
        return fechaTurno >= haceUnMes;
      })
    ).length;

    const todosTurnos = pacientes.flatMap(p => p.turnos);

    const turnosPorEstado = {
      PROGRAMADO: todosTurnos.filter(t => t.estado === 'PROGRAMADO').length,
      EN_SALA_ESPERA: todosTurnos.filter(t => t.estado === 'EN_SALA_ESPERA').length,
      ASISTIO: todosTurnos.filter(t => t.estado === 'ASISTIO').length,
      NO_ASISTIO: todosTurnos.filter(t => t.estado === 'NO_ASISTIO').length,
      CANCELADO: todosTurnos.filter(t => t.estado === 'CANCELADO').length,
    };

    const profesionalesData = profesionalesRelevantes.map(prof => ({
      id: prof.id,
      nombre: `${prof.nombre} ${prof.apellido}`,
      especialidad: prof.especialidad,
      turnosAtendidos: prof.turnos.filter(t => t.estado === 'ASISTIO').length,
    })).sort((a, b) => b.turnosAtendidos - a.turnosAtendidos);

    //distribución de especialidades
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
        totalTurnos: todosTurnos.length,
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