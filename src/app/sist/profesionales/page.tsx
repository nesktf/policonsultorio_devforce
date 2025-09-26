import { ProfesionalClient } from '@/components/ProfesionalClient';
import { obtenerProfesionales, obtenerObrasSociales, obtenerEspecialidadesUnicas } from '@/prisma/profesional';

export default async function ProfesionalesPage() {
  const [profesionales, obrasSociales, especialidades] = await Promise.all([
    obtenerProfesionales(),
    obtenerObrasSociales(),
    obtenerEspecialidadesUnicas()
  ]);

  return (
    <ProfesionalClient 
      profesionalesIniciales={profesionales} 
      obrasSociales={obrasSociales}
      especialidades={especialidades}
    />
  );
}