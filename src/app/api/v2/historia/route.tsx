import { NextRequest } from "next/server";

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

  motivo: string | undefined,
  anamnesis: string | undefined,
  examenFisico: string | undefined,
  signosVitales: SignosVitalesAPIData,
  diagnostico: string,
  tratamiento: string | undefined,
  medicamentos: Array<MedicamentoAPIData>;
  estudiosComplementarios: Array<EstudioAPIData>;
  indicaciones: string | undefined;
  proximoControl: string | undefined,
  observaciones: string | undefined,
};

// Args:
// - ID Historia -> returns a single entry
// - No ID -> returns every entry
// - ID profesional -> returns every entry for profesionalId
export async function GET(req: NextRequest) {

}

// Args:
// - HistoriaAPIData without ID
export async function POST(req: NextRequest) {

}

// Args:
// - HistoriaAPIData
export async function PUT(req: NextRequest) {

}
