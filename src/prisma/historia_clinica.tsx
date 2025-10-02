import { Prisma } from "@/generated/prisma";
import { JsonArray } from "@/generated/prisma/runtime/library";
import { Result } from "@/lib/error_monads"
import { prisma, DBId, DBData } from "@/prisma/instance"

export type SignoVitalDBData = {
  presion: string,
  frecuencia: string,
  temperatura: string,
  peso: string
  altura: string,
};

export type MedicamentoDBData = {
  nombre: string,
  dosis: string,
  frecuencia: string,
  duracion: string,
};

export type EstudioDBData = {
  tipo: string,
  resultado: string,
  fecha: string,
};

export type HistoriaDBData = {
  paciente: { id: DBId, nombre: string, apellido: string },
  profesional: { id: DBId, nombre: string, apellido: string, especialidad: string, },
  fecha: Date,
  motivo: string,
  detalle: string,
  examen_fisico: string | null,
  diagnostico: string,
  tratamiento: string | null,
  indicaciones: string | null,
  observaciones: string | null,
  proximo_control: Date | null,
  signos_vitales: SignoVitalDBData | null; 
  medicamentos: Array<MedicamentoDBData>,
  estudios: Array<EstudioDBData>,
};

function histFromDbData(hist: any): HistoriaDBData {
  return {
    paciente: {
      id: hist.paciente.id,
      nombre: hist.paciente.nombre,
      apellido: hist.paciente.apellido,
    },
    profesional: {
      id: hist.profesional.id,
      nombre: hist.profesional.nombre,
      apellido: hist.profesional.apellido,
      especialidad: hist.profesional.especialidad,
    },
    fecha: hist.fecha,
    detalle: hist.detalle,
    motivo: hist.motivo,
    examen_fisico: hist.examen_fisico,
    signos_vitales: hist.signos_vitales ? (hist.signos_vitales as SignoVitalDBData) : null,
    medicamentos: hist.medicamentos ? (hist.medicamentos as JsonArray).map((med) => {
      return med as MedicamentoDBData;
    }) : [],
    estudios: hist.estudios ? (hist.estudios as JsonArray).map((est) => {
      return est as EstudioDBData;
    }) : [],
    diagnostico: hist.diagnostico,
    tratamiento: hist.tratamiento,
    indicaciones: hist.indicaciones,
    observaciones: hist.observaciones,
    proximo_control: hist.proximo_control,
  }
}

export async function retrieveHistoriaClinica(id: DBId): Promise<Result<DBData<HistoriaDBData>>> {
  try {
    return Result.Some(await prisma.historiaClinica.findUniqueOrThrow({
      where: { id },
      include: { paciente: true, profesional: true }
    })
    .then((hist) => {
      return {
        id: hist.id,
        data: histFromDbData(hist)
      }
    }));
  } catch (err) {
    return Result.None(new Error(`${err}`));
  }
}

export async function retrieveHistoriasClinicas(): Promise<Result<Array<DBData<HistoriaDBData>>>> {
  try {
    return Result.Some(await prisma.historiaClinica.findMany({
      include: { paciente: true, profesional: true }
    })
    .then((hists) => hists.map((hist) => {
      return {
        id: hist.id,
        data: histFromDbData(hist)
      }
    })));
  } catch (err) {
    return Result.None(new Error(`${err}`));
  }
}

export async function retrieveHistoriasFromProfesional(id_prof: DBId): Promise<Result<Array<DBData<HistoriaDBData>>>> {
  try {
    return Result.Some(await prisma.historiaClinica.findMany({
      where: { id_profesional: id_prof },
      include: { paciente: true, profesional: true }
    })
    .then((hists) => hists.map((hist) => {
      return {
        id: hist.id,
        data: histFromDbData(hist)
      }
    })));
  } catch (err) {
    return Result.None(new Error(`${err}`));
  }
}

export type HistoriaClinicaDBInput = {
  id_paciente: DBId,
  id_profesional: DBId,
  fecha: Date,
  motivo: string,
  detalle: string,
  examen_fisico: string | null,
  diagnostico: string,
  tratamiento: string | null,
  indicaciones: string | null,
  observaciones: string | null,
  proximo_control: Date | null,
  signos_vitales: SignoVitalDBData | null; 
  medicamentos: Array<MedicamentoDBData>,
  estudios: Array<EstudioDBData>,
};

export async function registerHistoriaClinica(hist: HistoriaClinicaDBInput): Promise<Result<DBId>> {
  const asMaybeJson = (data: any | null) => {
    return data ? (data as Prisma.InputJsonValue) : undefined;
  };

  try {
    const entry = await prisma.historiaClinica.create({
      data: {
        id_paciente: hist.id_paciente,
        id_profesional: hist.id_profesional,
        fecha: hist.fecha,
        motivo: hist.motivo,
        detalle: hist.detalle,
        examen_fisico: hist.examen_fisico,
        signos_vitales: asMaybeJson(hist.signos_vitales),
        diagnostico: hist.diagnostico,
        tratamiento: hist.tratamiento,
        medicamentos: hist.medicamentos.length > 0 ? asMaybeJson(hist.medicamentos) : undefined,
        estudios: hist.estudios.length > 0 ? asMaybeJson(hist.estudios) : undefined,
        indicaciones: hist.indicaciones,
        observaciones: hist.observaciones,
        proximo_control: hist.proximo_control,
      }
    });
    return Result.Some(entry.id);
  } catch (err) {
    return Result.None(new Error(`${err}`));
  }
}

export async function updateHistoriaClinica(id: DBId, hist: HistoriaClinicaDBInput): Promise<Result<DBId>> {
  const asMaybeJson = (data: any | null) => {
    return data ? (data as Prisma.InputJsonValue) : undefined;
  };

  try {
    const entry = await prisma.historiaClinica.update({
      where: { id },
      data: {
        id_paciente: hist.id_paciente,
        id_profesional: hist.id_profesional,
        fecha: hist.fecha,
        motivo: hist.motivo,
        detalle: hist.detalle,
        examen_fisico: hist.examen_fisico,
        signos_vitales: asMaybeJson(hist.signos_vitales),
        diagnostico: hist.diagnostico,
        tratamiento: hist.tratamiento,
        medicamentos: hist.medicamentos.length > 0 ? asMaybeJson(hist.medicamentos) : undefined,
        estudios: hist.estudios.length > 0 ? asMaybeJson(hist.estudios) : undefined,
        indicaciones: hist.indicaciones,
        observaciones: hist.observaciones,
        proximo_control: hist.proximo_control,
      }
    });
    return Result.Some(entry.id);
  } catch (err) {
    return Result.None(new Error(`${err}`));
  }
}


// export async function getHistoriaClinica(pacienteId: number) {
//   try {
//     return await prisma.historiaClinica.findMany({
//       where: {
//         id_paciente: pacienteId,
//       },
//       include: {
//         profesional: true,
//       },
//       orderBy: {
//         fecha: "desc",
//       },
//     })
//   } catch (error) {
//     console.error("Error al obtener historia clínica:", error)
//     throw error
//   }
// }
//
// export type SignosVitalesPayload = {
//   presionArterial?: string | null
//   frecuenciaCardiaca?: number | null
//   temperatura?: number | null
//   peso?: number | null
// }
//
// export type CrearHistoriaClinicaInput = {
//   pacienteId: number
//   profesionalId: number
//   motivo: string
//   detalle: string
//   examenFisico?: string | null
//   signosVitales?: SignosVitalesPayload | null
//   fecha?: Date
// }
//
// export async function crearHistoriaClinicaRegistro(data: CrearHistoriaClinicaInput) {
//   const {
//     pacienteId,
//     profesionalId,
//     motivo,
//     detalle,
//     examenFisico,
//     signosVitales,
//     fecha,
//   } = data
//
//   const payload: Prisma.HistoriaClinicaCreateInput = {
//     motivo,
//     detalle,
//     examen_fisico: examenFisico ?? null,
//     signos_vitales: signosVitales ? (signosVitales as Prisma.InputJsonValue) : null,
//     paciente: {
//       connect: { id: pacienteId },
//     },
//     profesional: {
//       connect: { id: profesionalId },
//     },
//   }
//
//   if (fecha) {
//     payload.fecha = fecha
//   }
//
//   try {
//     return await prisma.historiaClinica.create({
//       data: payload,
//       include: {
//         profesional: true,
//       },
//     })
//   } catch (error) {
//     console.error("Error al registrar historia clínica:", error)
//     throw error
//   }
// }
