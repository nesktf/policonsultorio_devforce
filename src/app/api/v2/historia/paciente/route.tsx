import { NextRequest } from "next/server";

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
  obraSocial: string | undefined,
  numeroAfiliado: string | undefined,
  profesionalesAsignados: Array<string>, // ints
};

// Args:
// - ID paciente -> returns a single entry
// - No ID paciente -> returns every entry
// - ID profesional -> returns every entry with profesionalesAsignados
export async function GET(req: NextRequest) {

}
