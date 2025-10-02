import { prisma } from "@/prisma/instance"
import type { Prisma } from "@prisma/client"

export async function getHistoriaClinica(pacienteId: number) {
  try {
    return await prisma.historiaClinica.findMany({
      where: {
        id_paciente: pacienteId,
      },
      include: {
        profesional: true,
      },
      orderBy: {
        fecha: "desc",
      },
    })
  } catch (error) {
    console.error("Error al obtener historia clínica:", error)
    throw error
  }
}

export type SignosVitalesPayload = {
  presionArterial?: string | null
  frecuenciaCardiaca?: number | null
  temperatura?: number | null
  peso?: number | null
}

export type CrearHistoriaClinicaInput = {
  pacienteId: number
  profesionalId: number
  motivo: string
  detalle: string
  examenFisico?: string | null
  signosVitales?: SignosVitalesPayload | null
  fecha?: Date
}

export async function crearHistoriaClinicaRegistro(data: CrearHistoriaClinicaInput) {
  const {
    pacienteId,
    profesionalId,
    motivo,
    detalle,
    examenFisico,
    signosVitales,
    fecha,
  } = data

  const payload: Prisma.HistoriaClinicaCreateInput = {
    motivo,
    detalle,
    examen_fisico: examenFisico ?? null,
    signos_vitales: signosVitales ? (signosVitales as Prisma.InputJsonValue) : null,
    paciente: {
      connect: { id: pacienteId },
    },
    profesional: {
      connect: { id: profesionalId },
    },
  }

  if (fecha) {
    payload.fecha = fecha
  }

  try {
    return await prisma.historiaClinica.create({
      data: payload,
      include: {
        profesional: true,
      },
    })
  } catch (error) {
    console.error("Error al registrar historia clínica:", error)
    throw error
  }
}
