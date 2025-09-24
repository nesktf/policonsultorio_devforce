import { DBId, prisma } from "@/app/prisma/instance";
import type { DatosProfesionalFormulario } from '@/components/RegistrarProfesionalModal';

export async function crearProfesional(datos: DatosProfesionalFormulario) {
  try {
    const nuevoProfesional = await prisma.profesional.create({
      data: {
        nombre: datos.nombre,
        apellido: datos.apellido,
        dni: datos.dni,
        especialidad: datos.especialidad,
        telefono: datos.telefono,
        direccion: datos.direccion,
        obras_sociales: {
          create: datos.obras_sociales_ids.map(obraSocialId => ({
            id_obra_social: obraSocialId
          }))
        }
      },
      include: {
        obras_sociales: {
          include: {
            obra_social: true
          }
        },
        _count: {
          select: {
            turnos: true,
            historias: true
          }
        }
      }
    });

    return nuevoProfesional;
  } catch (error) {
    console.error('Error al crear profesional:', error);
    throw new Error('Error al registrar el profesional');
  }
}

export async function obtenerProfesionales() {
  try {
    const profesionales = await prisma.profesional.findMany({
      include: {
        obras_sociales: {
          include: {
            obra_social: true
          }
        },
        _count: {
          select: {
            turnos: true,
            historias: true
          }
        }
      }
    });
    return profesionales;
  } catch (error) {
    console.error('Error al obtener profesionales:', error);
    return [];
  }
}

export async function obtenerObrasSociales() {
  try {
    const obrasSociales = await prisma.obraSocial.findMany({
      where: {
        estado: 'ACTIVA'
      }
    });
    return obrasSociales;
  } catch (error) {
    console.error('Error al obtener obras sociales:', error);
    return [];
  }
}

export async function getProfesionalesEspecialidad(especialidad: string) {
  return await prisma.profesional.findMany({
    where: {
      especialidad,
    },
    select: {
      id: true,
      nombre: true,
      apellido: true,
    },
    orderBy: {
      apellido: 'asc',
    },
  });
}

export async function getProfesional(id: DBId) {
  return await prisma.profesional.findUnique({ where: { id } });
}
