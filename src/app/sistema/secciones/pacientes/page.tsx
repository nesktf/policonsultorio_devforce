import { PacientesClient } from "@/components/PacientesClient";
import { getPacientes } from "@/prisma/pacientes";

export default async function PacientesPage() {
  const { pacientes, obrasSociales } = await getPacientes();
  return (
    <PacientesClient
      initialPacientes={pacientes}
      obrasSociales={obrasSociales}
    />
  );
}
