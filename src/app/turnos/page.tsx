// src/app/turnos/page.tsx

import { PrismaClient } from '@/generated/prisma';
import { RegistrarTurnoClient } from '@/components/RegistrarTurnoClient';

const prisma = new PrismaClient();

async function getFormData() {
  try {
    const [pacientes, especialidades] = await Promise.all([
      prisma.paciente.findMany({
        select: {
          id: true,
          apellido: true,
          dni: true,
        }
      }),
      // CAMBIO AQUÍ: Esta es la nueva forma de obtener las especialidades.
      // Pedimos solo el campo 'especialidad' y que los resultados sean distintos (únicos).
      prisma.profesional.findMany({
        select: {
          especialidad: true,
        },
        distinct: ['especialidad'],
      })
    ]);
    return { pacientes, especialidades };
  } catch (error) {
    console.error('Error fetching form data:', error);
    return { pacientes: [], especialidades: [] };
  }
}

export default async function RegistrarTurnoPage() {
  const { pacientes, especialidades } = await getFormData();

  return <RegistrarTurnoClient pacientes={pacientes} especialidades={especialidades} />;
}