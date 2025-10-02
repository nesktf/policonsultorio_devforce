import { Maybe } from "@/lib/error_monads";
import { DBData } from "@/prisma/instance"
import { retrieveHistoriaClinica, retrieveHistoriasFromProfesional, retrieveHistoriasClinicas, HistoriaDBData, HistoriaClinicaDBInput, registerHistoriaClinica, updateHistoriaClinica, SignoVitalDBData, MedicamentoDBData, EstudioDBData } from "@/prisma/historia_clinica";
import { NextRequest, NextResponse } from "next/server";
import { JsonArray } from "@/generated/prisma/runtime/library";

/* Sample data
{
  id: "1",
  pacienteId: "1",
  profesionalId: "2",
  fecha: "2024-01-15",
  hora: "10:30",
  profesional: "Dr. Carlos Mendez",
  especialidad: "Cardiología",
  motivo: "Control rutinario",
  anamnesis:
    "Paciente refiere sentirse bien en general. Sin síntomas cardiovasculares. Mantiene actividad física regular.",
  examenFisico: "Paciente en buen estado general. Signos vitales estables.",
  signosVitales: {
    presionArterial: "120/80",
    frecuenciaCardiaca: "72",
    temperatura: "36.5",
    peso: "68",
    altura: "165",
  },
  diagnostico: "Control cardiológico normal",
  tratamiento: "Continuar con medicación actual",
  medicamentos: [
    { nombre: "Enalapril", dosis: "10mg", frecuencia: "1 vez al día", duracion: "Continuar" },
    { nombre: "Aspirina", dosis: "100mg", frecuencia: "1 vez al día", duracion: "Continuar" },
  ],
  estudiosComplementarios: [
    { tipo: "Electrocardiograma", resultado: "Normal", fecha: "2024-01-15" },
    { tipo: "Análisis de sangre", resultado: "Valores normales", fecha: "2024-01-10" },
  ],
  indicaciones: "Mantener dieta baja en sodio. Continuar con ejercicio regular. Control en 6 meses.",
  proximoControl: "2024-07-15",
  observaciones: "Paciente colaborador, cumple bien con el tratamiento.",
}
*/

type MedicamentoAPIData = {
  nombre: string,
  dosis: string,
  frecuencia: string,
  duracion: string,
}

type EstudioAPIData = {
  tipo: string,
  resultado: string,
  fecha: string,
}

type SignosVitalesAPIData = {
  presionArterial: string, // int XX/YYY
  frecuenciaCardiaca: string, // int
  temperatura: string, // double, ºc
  peso: string, // double, kg
  altura: string, // double, cm
}

type HistoriaAPIData = {
  id: string, // int
  pacienteId: string, // int
  profesionalId: string, // int
  fecha: string, // YYYY-MM-DD
  hora: string, // HH:MM
  profesional: string
  especialidad: string,

  motivo: string | null,
  anamnesis: string,
  examenFisico: string,
  signosVitales: SignosVitalesAPIData | null,
  diagnostico: string,
  tratamiento: string,
  medicamentos: Array<MedicamentoAPIData>;
  estudiosComplementarios: Array<EstudioAPIData>;
  indicaciones: string;
  proximoControl: string,
  observaciones: string,
};

function parseId(maybe_id: string): Maybe<number> {
  try {
    const id = Math.floor(Number(maybe_id));
    if (id <= 0) {
      return Maybe.None();
    }
    return Maybe.Some(id);
  } catch (err) {
    return Maybe.None();
  }
}

// Error format -> { error: string }
// Args:
// - ID Historia -> returns a single entry (arr.len == 1) { historias: HistoriaAPIData[] }
// - No ID -> returns every entry { historias: HistoriaAPIData[] }
// - ID profesional -> returns every entry for profesionalId { historias: HistoriaAPIData[] }
export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const raw_id_historia = params.get("id_historia");
  const raw_id_profesional = params.get("id_profesional");

  if (raw_id_historia && raw_id_profesional) {
    return NextResponse.json(
      { error: "Solo enviar id de historia o profesional" },
      { status: 400 }
    );
  }

  const toApiData = (data: DBData<HistoriaDBData>): HistoriaAPIData => {
    const hist = data.data;
    return {
      id: data.id.toString(), 
      pacienteId: hist.paciente.id.toString(),
      profesionalId: hist.profesional.id.toString(),
      fecha: hist.fecha.toISOString(),
      hora: hist.fecha.toTimeString(),
      profesional: `${hist.profesional.nombre} ${hist.profesional.apellido}`,
      especialidad: hist.profesional.especialidad,
      motivo: hist.profesional.especialidad,
      anamnesis: hist.detalle,
      examenFisico: hist.examen_fisico ? hist.examen_fisico : "",
      signosVitales: hist.signos_vitales ? {
        presionArterial: hist.signos_vitales.presion,
        frecuenciaCardiaca: hist.signos_vitales.frecuencia,
        temperatura: hist.signos_vitales.temperatura,
        peso: hist.signos_vitales.peso,
        altura: hist.signos_vitales.altura
      } : null,
      diagnostico: hist.diagnostico,
      tratamiento: hist.tratamiento ? hist.tratamiento : "",
      medicamentos: hist.medicamentos.map((med) => (med as MedicamentoAPIData)),
      estudiosComplementarios: hist.estudios.map((est) => (est as EstudioAPIData)),
      indicaciones: hist.indicaciones ? hist.indicaciones : "",
      proximoControl: hist.proximo_control ? hist.proximo_control.toISOString() : "",
      observaciones: hist.observaciones ? hist.observaciones : "",
    }
  };

  try {
    if (raw_id_historia) {
      // Single entry
      const id_historia = parseId(raw_id_historia)
      if (!id_historia.hasValue()) {
        throw new Error("Invalid id_historia");
      }

      const historias = await retrieveHistoriaClinica(id_historia.unwrap())
      return NextResponse.json(
        { historias: historias.transform(toApiData).unwrap() }
      );
    } else if (raw_id_profesional) {
      // Entries for id_profesional
      const id_profesional = parseId(raw_id_profesional);
      if (!id_profesional.hasValue()) {
        throw new Error("Invalid id_profesional");
      }
      
      const historias = await retrieveHistoriasFromProfesional(id_profesional.unwrap())
      return NextResponse.json(
        { historias: historias.transform((hists) => hists.map(toApiData)).unwrap() }
      );
    } else {
      // All entries
      const historias = await retrieveHistoriasClinicas();
      return NextResponse.json(
        { historias: historias.transform((hists) => hists.map(toApiData)).unwrap() }
      );
    }
  } catch (error) {
    console.log(`ERROR: api/v2/historia @ GET: ${error}`);
    return NextResponse.json(
      { error },
      { status: 500 }
    );
  }
}

function validateInputData(data: any): {parsed: HistoriaClinicaDBInput | null, where: string} {
  const onErr = (where: string) => {
    return { parsed: null, where: `historia.${where}`}
  };

  const id_paciente = parseId(data.pacienteId);
  if (!id_paciente.hasValue()) {
    return onErr("profesionalId");
  }
  const id_profesional = parseId(data.profesionalId);
  if (!id_profesional.hasValue()) {
    return onErr("profesionalId");
  }
  if (!data.fecha) {
    return onErr("fecha")
  }
  const fecha = new Date(data.fecha);

  if (!data.motivo) {
    return onErr("motivo")
  }
  const motivo = data.motivo as string;

  if (!data.detalle) {
    return onErr("detalle");
  }
  const detalle = data.detalle as string;

  const examen_fisico = data.examen_fisico ? data.examenFisico as string : null;

  let signos_vitales: SignoVitalDBData | null = null;
  if (data.signosVitales) {
    const signos = data.signosVitales;
    if (!signos.presionArterial) {
      return onErr("signosVitales.presionArterial");
    }
    if (!signos.frecuenciaCardiaca) {
      return onErr("signosVitales.frecuenciaCardiaca");
    }
    if (!signos.temperatura) {
      return onErr("signosVitales.temperatura");
    }
    if (!signos.peso) {
      return onErr("signosVitales.peso");
    }
    if (!signos.altura) {
      return onErr("signosVitales.altura");
    }
    signos_vitales = {
      presion: signos.presionArterial as string,
      frecuencia: signos.frecuenciaCardiaca as string,
      temperatura: signos.temperatura as string,
      peso: signos.peso as string,
      altura: signos.altura as string,
    }
  }

  if (!data.diagnostico) {
    return onErr("diagnostico");
  }

  if (!data.proximoControl) {

  }
  const proximo_control = new Date(data.proximoControl as string);

  const diagnostico = data.diagnostico as string;
  const tratamiento = data.tratamiento ? data.tratamiento as string : null;
  const indicaciones = data.indicaciones ? data.indicaciones as string : null;
  const observaciones = data.observaciones ? data.observaciones as string : null;

  let medicamentos: Array<MedicamentoDBData> = [];
  if (data.medicamentos) {
    try {
      if (Array.isArray(data.medicamentos)) {
        return onErr(`medicamentos`);
      }
      medicamentos = (data.medicamentos as Array<any>).map((med: any) => {
        if (!med.nombre) {
          throw new Error("nombre");
        }
        if (!med.dosis) {
          throw new Error("dosis");
        }
        if (!med.frecuencia) {
          throw new Error("frecuencia");
        }
        if (!med.duracion) {
          throw new Error("duracion");
        }
        return med as MedicamentoDBData;
      });
    } catch (where) {
      return onErr(`medicamentos.${where as string}`);
    }
  }

  let estudios: Array<EstudioDBData> = []
  if (data.estudiosComplementarios) {
    try {
      if (Array.isArray(data.estudios)) {
        return onErr(`medicamentos`);
      }
      estudios = (data.estudios as Array<any>).map((est: any) => {
        if (!est.tipo) {
          throw new Error("tipo");
        }
        if (!est.resultado) {
          throw new Error("resultado");
        }
        if (!est.fecha) {
          throw new Error("fecha");
        }
        return est as EstudioDBData;
      });
    } catch (where) {
      return onErr(`estudios.${where as string}`);
    }
  }

  return {
    parsed: {
      id_paciente: id_paciente.unwrap(),
      id_profesional: id_profesional.unwrap(),
      fecha,
      motivo,
      detalle,
      examen_fisico,
      signos_vitales,
      diagnostico,
      tratamiento,
      indicaciones,
      observaciones,
      proximo_control,
      medicamentos,
      estudios,
    },
    where: "",
  };
}

// Args:
// - { historia: HistoriaAPIData } without ID -> returns { historiaId: int }
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const {parsed, where} = validateInputData(data.historia);
    if (!parsed) {
      return NextResponse.json(
        { error: `Invalid input format at ${where}`},
        { status: 400 }
      );
    }
    const ret = await registerHistoriaClinica(parsed);
    return NextResponse.json(
      { historiaId: ret.unwrap() }
    );
  } catch (error) {
    console.log(`ERROR: api/v2/historia @ POST: ${error}`);
    return NextResponse.json(
      { error },
      { status: 500 }
    );
  }
}

// Args:
// - { historia: HistoriaDBData } -> returns { historiaId: int }
export async function PUT(req: NextRequest) {
  try {
    const data = await req.json();
    const id = parseId(data.historia.id);
    if (!id) {
      return NextResponse.json(
        { error: `Invalid input format at historia.id`},
        { status: 400 }
      );
    }
    const {parsed, where} = validateInputData(data.historia);
    if (!parsed) {
      return NextResponse.json(
        { error: `Invalid input format at ${where}`},
        { status: 400 }
      );
    }
    const ret = await updateHistoriaClinica(id.unwrap(), parsed);
    return NextResponse.json(
      { historiaId: ret.unwrap() }
    );
  } catch (error) {
    console.log(`ERROR: api/v2/historia @ POST: ${error}`);
    return NextResponse.json(
      { error },
      { status: 500 }
    );
  }
}
