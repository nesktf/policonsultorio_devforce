import { DBId, prisma } from "@/app/prisma/instance";

export async function getPacientes() {
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

export async function createPatient(data: {
  nombre: string;
  apellido: string;
  dni: string;
  telefono: string;
  direccion: string;
  fechaNacimiento: Date;
  obraSocialId: number | null;
  numObraSocial: string | null;
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
        fecha_nacimiento: data.fechaNacimiento,
        num_obra_social: data.numObraSocial,
        id_obra_social: data.obraSocialId,
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
        detalle: "Se crea la historia clínica del paciente."
      }
    });

    return newPatient;
  } catch (error) {
    console.error('Error creating patient:', error);
    throw error;
  }
}

export async function getPaciente(id: DBId) {
  return await prisma.paciente.findUnique({ where: { id } });
}
