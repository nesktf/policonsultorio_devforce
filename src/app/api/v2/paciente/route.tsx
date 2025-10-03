import { NextRequest } from "next/server";

/* Sample data
{
  id: "1",
  nombre: "María",
  apellido: "González",
  dni: "12345678",
  telefono: "11-1234-5678",
  email: "maria.gonzalez@email.com",
  fechaNacimiento: "1985-03-15",
  direccion: "Av. Corrientes 1234, CABA",
  obraSocial: "OSDE",
  numeroAfiliado: "123456789",
  estado: "activo",
  fechaRegistro: "2024-01-10",
  ultimaConsulta: "2024-01-15",
  profesionalesAsignados: ["2"], // Dr. Carlos Mendez (Cardiología)
  turnosReservados: [{ profesionalId: "2", fecha: "2024-02-15", estado: "confirmado" }],
  consultasRealizadas: [{ profesionalId: "2", fecha: "2024-01-15", motivo: "Control rutinario" }],
}
*/

type TurnoReservadoAPIData = {
  profesionalId: string, // int
  fecha: string, // YYYY-MM-DD
  estado: string, // See database
}

type ConsultasRealizadasAPIData = {
  profesionalId: string, // int
  fecha: string, // YYYY-MM-DD
  motivo: string,
}

type PacienteAPIData = {
  id: string, // int
  nombre: string,
  apellido: string,
  dni: string,
  telefono: string,
  email: string,
  fechaNacimiento: string, // YYYY-MM-DD
  direccion: string,
  obraSocial: string | null,
  numeroAfiliado: string | null,
  estado: "ACTIVO" | "INACTIVO",
  fechaRegistro: string, // YYYY-MM-DD
  ultimaConsulta: string, // YYYY-MM-DD
  profesionalesAsignados: Array<String>, // ints
  turnosReservados: Array<TurnoReservadoAPIData>,
  consultasRealizadas: Array<ConsultasRealizadasAPIData>,
}

/* More sample data
{
  id: "1",
  nombre: "Ana",
  apellido: "García",
  dni: "12345678",
  telefono: "11-1234-5678",
  email: "ana.garcia@email.com",
  fechaNacimiento: "1985-03-15",
  direccion: "Av. Corrientes 1234",
  obraSocial: "OSDE",
  numeroAfiliado: "123456789",
  profesionalAsignado: "prof-1", // Dr. Juan Pérez
  ultimaConsulta: "2024-01-15",
  proximoTurno: "2024-01-25",
  especialidad: "Cardiología",
  estado: "activo",
  fechaRegistro: "2023-06-15",
}
*/

type PacienteProfAPIData = {
  id: string, // int
  nombre: string,
  apellido: string,
  dni: string,
  telefono: string,
  email: string,
  fechaNacimiento: string, // YYYY-MM-DD
  direccion: string,
  obraSocial: string | null,
  numeroAfiliado: string | null,
  profesionalAsignado: string,
  ultimaConsulta: string, // YYYY-MM-DD
  proximoTurno: string, // YYYY-MM-DD
  especialidad: string,
  estado: "ACTIVO" | "INACTIVO",
  fechaRegistro: string, // YYYY-MM-DD
}

// Error format -> { error: string }
// Args:
// ID Paciente -> returns a single entry (arr.len == 1) { pacientes: PacienteAPIData[] }
// No ID Paciente -> returns every entry { pacientes: PacienteAPIData[] }
// ID Profesional -> returns every entry for profesionalId { pacientes: PacienteProfAPIData[] }
export async function GET(req: NextRequest) {

}

// Args:
// PacienteAPIData without id -> returns { pacienteId: int }
export async function POST(req: NextRequest) {

}

// Args:
// PacienteAPIData -> returns { pacienteId: int }
export async function PUT(req: NextRequest) {

}
