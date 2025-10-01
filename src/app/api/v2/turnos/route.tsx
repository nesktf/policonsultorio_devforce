import { NextRequest } from "next/server";

/* Sample data
{
  id: "1",
  pacienteId: "1",
  profesionalId: "prof-1",
  fecha: "2024-01-25",
  hora: "10:00",
  estado: "confirmado",
}
*/

type TurnoAPIData = {
  id: string, // int
  pacienteId: string, // int
  profesionalId: string, // un nombre?
  fecha: string, // YYYY-MM-DD
  hora: string, // HH:MM
  estado: string, // Check database
};

// Error format -> { error: string }
// Args:
// - ID turno -> returns a single entry (arr.len == 1) { turnos: TurnoAPIData[] }
// - No ID -> returns every entry { turnos: TurnoAPIData[] }
// - ID profesional -> returns every entry for profesionalId { turnos: TurnoAPIData[] }
export async function GET(req: NextRequest) {

}

// Args:
// - TurnoAPIData without ID -> returns { turnoId: int }
export async function POST(req: NextRequest) {

}

// Args:
// - TurnoAPIData -> returns { turnoId: int }
export async function PUT(req: NextRequest) {

}
