// src/app/turnos/page.tsx

import { RegistrarTurnoSection } from '@/components/RegistrarTurnoSection';
import prisma from '@/lib/prisma';

interface TurnoResumen {
  id: number;
  paciente: string;
  profesional: string;
  fechaIso: string;
}

async function getPageData() {
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
        distinct: ['especialidad'],
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
          fecha: 'asc',
        },
      }),
    ]);

    const turnosResumen: TurnoResumen[] = turnos.map((turno) => ({
      id: turno.id,
      paciente: `${turno.paciente.apellido}, ${turno.paciente.nombre}`,
      profesional: `${turno.profesional.apellido}, ${turno.profesional.nombre}`,
      fechaIso: turno.fecha.toISOString(),
    }));

    return { pacientes, especialidades, turnos: turnosResumen };
  } catch (error) {
    console.error('Error fetching data for registrar turno page:', error);
    return { pacientes: [], especialidades: [], turnos: [] };
  }
}

export default async function RegistrarTurnoPage() {
  const { pacientes, especialidades, turnos } = await getPageData();

  return (
    <RegistrarTurnoSection
      pacientes={pacientes}
      especialidades={especialidades}
      turnosIniciales={turnos}
    />
  );
}
