import { prisma } from "@/prisma/instance";

export async function getHistoriaClinica(pacienteId: number) {
  try {
    const historia = await prisma.historiaClinica.findMany({
      where: {
        id_paciente: pacienteId
      },
      include: {
        profesional: true,
      },
      orderBy: {
        id: 'desc'
      }
    });
    return historia;
  } catch (error) {
    console.error('Error al obtener historia clínica:', error);
    throw error;
  }
}
