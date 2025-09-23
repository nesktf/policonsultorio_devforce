import { PrismaClient } from '@/generated/prisma';
import { PacientesClient } from '@/components/PacientesClient';

const prisma = new PrismaClient();

async function getPacientes() {
  try {
    const [pacientes, obrasSociales] = await Promise.all([
      prisma.paciente.findMany({
        include: {
          obra_social: true,
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

export default async function PacientesPage() {
  const { pacientes, obrasSociales } = await getPacientes();
  return <PacientesClient initialPacientes={pacientes} obrasSociales={obrasSociales} />;
}