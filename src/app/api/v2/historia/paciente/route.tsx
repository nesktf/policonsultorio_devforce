import { Maybe } from "@/lib/error_monads";
import { NextRequest, NextResponse } from "next/server";
import { HistoriaPacienteDBData, retrieveHistoriaPaciente, retrieveHistoriasPacientes } from "@/prisma/historia_clinica";

/* Sample data
{
  id: "1",
  nombre: "María González",
  apellido: "González",
  dni: "12345678",
  fechaNacimiento: "1985-03-15",
  obraSocial: "OSDE",
  numeroAfiliado: "123456789",
  profesionalesAsignados: ["2"], // Dr. Carlos Mendez
}
*/

type PacienteAPIData = {
  id: number,
  nombre: string,
  apellido: string,
  dni: string,
  fechaNacimiento: string, // YYYY-MM-DD
  obraSocial: string,
  numeroAfiliado: string,
  profesionalesAsignados: Array<string>, // ints
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

// Args:
// - ID paciente -> returns a single entry { pacientes: PacienteAPIData[] }
// - No ID paciente -> returns every entry { pacientes: PacienteAPIData[] }
// - ID profesional -> returns every entry with profesionalesAsignados { pacientes: PacienteAPIData[] }
export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const raw_id_paciente = params.get("id_paciente");
  const raw_id_profesional = params.get("id_profesional");

  if (raw_id_paciente && raw_id_profesional) {
    return NextResponse.json(
      { error: "Solo enviar id de historia o profesional" },
      { status: 400 }
    );
  }

  const toApiData = (data: HistoriaPacienteDBData): PacienteAPIData => {
    return {
      id: data.id,
      nombre: data.nombre,
      apellido: data.apellido,
      dni: data.dni,
      fechaNacimiento: data.fecha_nacimiento.toISOString(),
      obraSocial: data.obra_social ? data.obra_social : "",
      numeroAfiliado: data.numero_afiliado ? data.numero_afiliado : "",
      profesionalesAsignados: data.profesionales.map((id) => id.toString()),
    };
  };

  try {
    if (raw_id_paciente) {
      // Single entry
      const id_paciente= parseId(raw_id_paciente)
      if (!id_paciente.hasValue()) {
        throw new Error("Invalid id_paciente");
      }

      const paciente = await retrieveHistoriaPaciente(id_paciente.unwrap());
      return NextResponse.json(
        { pacientes: [paciente.transform(toApiData).unwrap()] }
      );
    } else if (raw_id_profesional) {
      // Entries for id_profesional
      const id_profesional = parseId(raw_id_profesional);
      if (!id_profesional.hasValue()) {
        throw new Error("Invalid id_profesional");
      }

      const all_pacientes = await retrieveHistoriasPacientes();
      const filtered = all_pacientes.unwrap().filter((pacs) => {
        const found = pacs.profesionales.filter((pac) => pac == id_profesional.unwrap());
        return found.length > 0;
      })
      
      return NextResponse.json(
        { pacientes: filtered.map((pac) => toApiData(pac)) }
      );
    } else {
      // All entries

      const pacientes = await retrieveHistoriasPacientes();
      return NextResponse.json(
        { pacientes: pacientes.transform((pacs) => pacs.map(toApiData)).unwrap() }
      );
    }
  } catch (error) {
    console.log(`ERROR: api/v2/historia/paciente @ GET: ${error}`);
    return NextResponse.json(
      { error },
      { status: 500 }
    );
  }
}
