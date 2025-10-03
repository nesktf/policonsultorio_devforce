import { setAntecedentePaciente } from "@/prisma/historia_clinica";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    if (!data.idPaciente) {
      return NextResponse.json(
        { error: "No id provided" },
        { status: 400 }
      );
    }
    if (!data.antecedente) {
      return NextResponse.json(
        { error: "No string provided" },
        { status: 400 }
      );
    }
    const id_paciente = parseInt(data.idPaciente);
    const antecedente = data.antecedente as string;
    const ret = await setAntecedentePaciente(id_paciente, antecedente);
    return NextResponse.json(
      { pacienteId: ret.unwrap() },
    )
  } catch (error) {
    console.log(`ERROR: api/v2/historia/antecedente @ POST: ${error}`);
    return NextResponse.json(
      { error },
      { status: 500 }
    );
  }
}
