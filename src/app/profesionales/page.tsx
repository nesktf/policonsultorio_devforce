import { ProfesionalClient } from '@/components/ProfesionalClient';
import { obtenerProfesionales, obtenerObrasSociales } from '@/app/prisma/profesional';

export default async function ProfesionalesPage() {
  const profesionales = await obtenerProfesionales();
  const obrasSociales = await obtenerObrasSociales();

  return (
    <ProfesionalClient 
      profesionalesIniciales={profesionales} 
      obrasSociales={obrasSociales} 
    />
  );
}
