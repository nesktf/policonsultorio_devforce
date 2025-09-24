import { PacientesClient } from '@/components/PacientesClient';
import { getPacientes } from '@/app/prisma';

export default async function PacientesPage() {
  const { pacientes, obrasSociales } = await getPacientes();
  return <PacientesClient initialPacientes={pacientes} obrasSociales={obrasSociales} />;
}
