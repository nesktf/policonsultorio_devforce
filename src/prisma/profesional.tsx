import { DBId, prisma } from "@/prisma/instance";
import type { DatosProfesionalFormulario } from '@/components/RegistrarProfesionalModal';


export async function obtenerEspecialidadesUnicas() {
  try {
    const especialidades = await prisma.profesional.findMany({
      select: {
        especialidad: true
      },
      distinct: ['especialidad'],
      orderBy: {
        especialidad: 'asc'
      }
    });
    return especialidades.map(prof => prof.especialidad);
  } catch (error) {
    console.error('Error al obtener especialidades:', error);
    return [];
  }
}

export async function obtenerObrasSocialesActivas() {
  try {
    const obrasSociales = await prisma.obraSocial.findMany({
      where: {
        estado: 'ACTIVA'
      },
      orderBy: {
        nombre: 'asc'
      }
    });
    return obrasSociales;
  } catch (error) {
    console.error('Error al obtener obras sociales activas:', error);
    return [];
  }
}

// verificar si un DNI ya existe
export async function verificarDNIExistente(dni: string): Promise<boolean> {
  try {
    const profesionalExistente = await prisma.profesional.findFirst({
      where: {
        dni: dni
      }
    });
    return profesionalExistente !== null;
  } catch (error) {
    console.error('Error al verificar DNI:', error);
    return false;
  }
}

export async function crearProfesional(datos: DatosProfesionalFormulario) {
  try {
    const dniExiste = await verificarDNIExistente(datos.dni);
    if (dniExiste) {
      throw new Error(`Ya existe un profesional registrado con el DNI ${datos.dni}`);
    }

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
    
    // Muestra el mensaje de error por DNI
    if (error instanceof Error && error.message.includes('DNI')) {
      throw error;
    }
    
    // Sino muestra un mensaje de error general
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