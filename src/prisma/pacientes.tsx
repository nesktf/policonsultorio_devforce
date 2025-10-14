import { DBId, prisma } from "@/prisma/instance";

export async function getPacientes() {
  try {
    const [pacientes, obrasSociales] = await Promise.all([
      prisma.paciente.findMany({
        include: {
          obra_social: true,
        },
        orderBy: {
          apellido: 'asc',
        },
      }),
      prisma.obraSocial.findMany({
        where: {
          estado: 'ACTIVA'
        }
      })
    ]);
    return { pacientes, obrasSociales };
  } catch (error) {
    console.error('Error fetching data:', error);
    return { pacientes: [], obrasSociales: [] };
  }
}

export async function getPacienteByDni(dni: string) {
  try {
    return await prisma.paciente.findUnique({
      where: { dni },
      include: {
        obra_social: true,
      },
    });
  } catch (error) {
    console.error('Error fetching patient by DNI:', error);
    return null;
  }
}

export async function getPacienteById(id: DBId) {
  try {
    return await prisma.paciente.findUnique({
      where: { id },
      include: {
        obra_social: true,
      },
    });
  } catch (error) {
    console.error('Error fetching patient by ID:', error);
    return null;
  }
}

export async function createPatient(data: {
  nombre: string;
  apellido: string;
  dni: string;
  telefono: string;
  direccion: string;
  fecha_nacimiento: Date;        
  id_obra_social: number | null; 
  num_obra_social: string | null;
}) {
  try {
    // First, get the highest ID to manually handle auto-increment
    const lastPatient = await prisma.paciente.findFirst({
      orderBy: {
        id: 'desc'
      }
    });
    
    const newId = (lastPatient?.id ?? 0) + 1;

    const newPatient = await prisma.paciente.create({
      data: {
        id: newId,
        nombre: data.nombre,
        apellido: data.apellido,
        dni: data.dni,
        telefono: data.telefono,
        direccion: data.direccion,
        fecha_nacimiento: data.fecha_nacimiento,
        num_obra_social: data.num_obra_social,
        id_obra_social: data.id_obra_social,
      },
      include: {
        obra_social: true,
      },
    });

    // Crear registro inicial de historia clínica
    await prisma.historiaClinica.create({
      data: {
        id_paciente: newId,
        id_profesional: 1, // ID del profesional que registra
        motivo: "Registro inicial del paciente",
        detalle: "Se crea la historia clínica del paciente.",
        diagnostico: "Paciente registrado en el sistema"
      }
    });

    return newPatient;
  } catch (error) {
    console.error('Error creating patient:', error);
    throw error;
  }
}

export async function updatePatient(id: DBId, data: Partial<{
  nombre: string;
  apellido: string;
  dni: string;
  direccion: string;
  fecha_nacimiento: Date;
  telefono: string;
  id_obra_social: number | null;
  num_obra_social: string | null;
}>) {
  try {
    return await prisma.paciente.update({
      where: { id },
      data,
      include: {
        obra_social: true,
      },
    });
  } catch (error) {
    console.error('Error updating patient:', error);
    throw error;
  }
}

export async function deletePatient(id: DBId) {
  try {
    // First delete related historia clinica records
    await prisma.historiaClinica.deleteMany({
      where: {
        id_paciente: id,
      },
    });

    // Then delete the patient
    return await prisma.paciente.delete({
      where: { id },
    });
  } catch (error) {
    console.error('Error deleting patient:', error);
    throw error;
  }
}

export async function searchPacientes(searchTerm: string) {
  try {
    return await prisma.paciente.findMany({
      where: {
        OR: [
          { nombre: { contains: searchTerm, mode: 'insensitive' } },
          { apellido: { contains: searchTerm, mode: 'insensitive' } },
          { dni: { contains: searchTerm } },
        ],
      },
      include: {
        obra_social: true,
      },
      orderBy: {
        apellido: 'asc',
      },
    });
  } catch (error) {
    console.error('Error searching patients:', error);
    return [];
  }
}

// Keep the original getPaciente function for backward compatibility
export async function getPaciente(id: DBId) {
  return await prisma.paciente.findUnique({ where: { id } });
}

const MONTH_LABELS = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

export async function getPacientesNuevosPorMes(
  year: number,
  obraSocialId?: number | null,
) {
  const start = new Date(Date.UTC(year, 0, 1, 0, 0, 0, 0));
  const end = new Date(Date.UTC(year + 1, 0, 1, 0, 0, 0, 0));

  const where: Record<string, unknown> = {
    fecha_registro: {
      gte: start,
      lt: end,
    },
  };

  if (obraSocialId != null) {
    where.id_obra_social = obraSocialId;
  }

  const pacientes = await prisma.paciente.findMany({
    where,
    select: {
      fecha_registro: true,
    },
  });

  const meses = MONTH_LABELS.map((label, index) => ({
    month: index + 1,
    label,
    cantidad: 0,
  }));

  for (const paciente of pacientes) {
    const fecha = new Date(paciente.fecha_registro);
    const monthIndex = fecha.getUTCMonth();
    meses[monthIndex].cantidad += 1;
  }

  return {
    year,
    obraSocialId: obraSocialId ?? null,
    total: pacientes.length,
    meses,
  };
}

//nuevo

export async function getPacientesNuevosPorPeriodo(
  fechaInicio: Date,
  fechaFin: Date,
  obraSocialFilter?: number | null | 'sin-obra-social',
) {
  const start = new Date(fechaInicio);
  start.setHours(0, 0, 0, 0);
  
  const end = new Date(fechaFin);
  end.setHours(23, 59, 59, 999);

  const where: any = {
    fecha_registro: {
      gte: start,
      lte: end,
    },
  };

  // Manejar el filtro de obra social
  if (obraSocialFilter === 'sin-obra-social') {
    where.id_obra_social = null;
  } else if (obraSocialFilter !== null && obraSocialFilter !== undefined) {
    where.id_obra_social = obraSocialFilter;
  }

  const pacientes = await prisma.paciente.findMany({
    where,
    select: {
      fecha_registro: true,
      id_obra_social: true,
      obra_social: {
        select: {
          nombre: true,
        },
      },
    },
  });

  // Agrupar por mes
  const mesesMap = new Map<string, number>();
  const diffMonths = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth()) + 1;
  
  for (let i = 0; i < diffMonths; i++) {
    const date = new Date(start.getFullYear(), start.getMonth() + i, 1);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    mesesMap.set(key, 0);
  }

  for (const paciente of pacientes) {
    const fecha = new Date(paciente.fecha_registro);
    const key = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
    if (mesesMap.has(key)) {
      mesesMap.set(key, mesesMap.get(key)! + 1);
    }
  }

  const meses = Array.from(mesesMap.entries()).map(([key, cantidad]) => {
    const [year, month] = key.split('-');
    return {
      month: parseInt(month),
      year: parseInt(year),
      label: `${MONTH_LABELS[parseInt(month) - 1]} ${year}`,
      cantidad,
    };
  });

  // Distribución por obra social
  const obrasSocialesMap = new Map<string, { nombre: string; cantidad: number }>();
  let sinObraSocial = 0;

  for (const paciente of pacientes) {
    if (paciente.id_obra_social && paciente.obra_social) {
      const key = String(paciente.id_obra_social);
      if (obrasSocialesMap.has(key)) {
        obrasSocialesMap.get(key)!.cantidad += 1;
      } else {
        obrasSocialesMap.set(key, {
          nombre: paciente.obra_social.nombre,
          cantidad: 1,
        });
      }
    } else {
      sinObraSocial += 1;
    }
  }

  const distribucionObrasSociales = Array.from(obrasSocialesMap.values())
    .sort((a, b) => b.cantidad - a.cantidad);

  if (sinObraSocial > 0) {
    distribucionObrasSociales.push({
      nombre: 'Sin Obra Social',
      cantidad: sinObraSocial,
    });
  }

  // Calcular promedio diario
  const diffDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  const promedioDiario = pacientes.length / diffDays;

  return {
    fechaInicio: start.toISOString(),
    fechaFin: end.toISOString(),
    obraSocialId: obraSocialFilter === 'sin-obra-social' ? null : (obraSocialFilter ?? null),
    total: pacientes.length,
    meses,
    distribucionObrasSociales,
    promedioDiario: parseFloat(promedioDiario.toFixed(2)),
    diasAnalizados: diffDays,
  };
}