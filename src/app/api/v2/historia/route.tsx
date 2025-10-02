import { Maybe } from "@/lib/error_monads";
import { DBData } from "@/prisma/instance"
import { retrieveHistoriaClinica, retrieveHistoriasFromProfesional, retrieveHistoriasClinicas, HistoriaDBData } from "@/prisma/historia_clinica";
import { NextRequest, NextResponse } from "next/server";

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

// Args:
// - HistoriaAPIData without ID -> returns { historiaId: int }
export async function POST(req: NextRequest) {

}

// Args:
// - HistoriaAPIData -> returns { historiaId: int }
export async function PUT(req: NextRequest) {

}
