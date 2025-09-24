// src/app/turnos/page.tsx

import { RegistrarTurnoSection } from '@/components/RegistrarTurnoSection';
import getTurnosPageData from '@/app/prisma/turnos';

export default async function RegistrarTurnoPage() {
  const { pacientes, especialidades, turnos } = await getTurnosPageData();

  return (
    <RegistrarTurnoSection
      pacientes={pacientes}
      especialidades={especialidades}
      turnosIniciales={turnos}
    />
  );
}
