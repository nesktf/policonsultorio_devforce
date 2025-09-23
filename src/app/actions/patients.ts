'use server';

import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

export async function createPatient(data: {
  nombre: string;
  apellido: string;
  dni: string;
  telefono: string;
  obraSocialId: number | null;
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
        id_obra_social: data.obraSocialId,
        direccion: 'Pendiente de actualización', // Required field
        fecha_nacimiento: new Date(), // Required field
      },
      include: {
        obra_social: true,
      },
    });
    return newPatient;
  } catch (error) {
    console.error('Error creating patient:', error);
    throw error;
  }
}