// import { NextResponse } from "next/server"
// import {
//   crearHistoriaClinicaRegistro,
//   getHistoriaClinica,
// } from "@/prisma/historia_clinica"
// import { getPaciente } from "@/prisma/pacientes"
// import { getProfesional } from "@/prisma/profesional"
//
// function mapHistoriaEntry(entry: Awaited<ReturnType<typeof getHistoriaClinica>>[number]) {
//   return {
//     id: entry.id,
//     fecha: entry.fecha.toISOString(),
//     pacienteId: entry.id_paciente,
//     profesional: {
//       id: entry.profesional.id,
//       nombre: entry.profesional.nombre,
//       apellido: entry.profesional.apellido,
//       especialidad: entry.profesional.especialidad,
//     },
//     motivo: entry.motivo,
//     detalle: entry.detalle,
//     examenFisico: entry.examen_fisico ?? null,
//     signosVitales: entry.signos_vitales ?? null,
//   }
// }
//
// export async function GET(request: Request) {
//   const { searchParams } = new URL(request.url)
//   const pacienteIdParam = searchParams.get("pacienteId")
//
//   if (!pacienteIdParam) {
//     return NextResponse.json(
//       { error: 'Debes indicar el parámetro "pacienteId".' },
//       { status: 400 },
//     )
//   }
//
//   const pacienteId = Number(pacienteIdParam)
//
//   if (!Number.isInteger(pacienteId) || pacienteId <= 0) {
//     return NextResponse.json(
//       { error: "pacienteId debe ser un número entero positivo." },
//       { status: 400 },
//     )
//   }
//
//   try {
//     const registros = await getHistoriaClinica(pacienteId)
//     const resultados = registros.map(mapHistoriaEntry)
//
//     return NextResponse.json(
//       {
//         total: resultados.length,
//         registros: resultados,
//       },
//       { headers: { "Cache-Control": "no-store" } },
//     )
//   } catch (error) {
//     console.error("Error al obtener historias clínicas:", error)
//     return NextResponse.json(
//       { error: "Error interno del servidor al obtener la historia clínica." },
//       { status: 500 },
//     )
//   }
// }
//
// export async function POST(request: Request) {
//   let payload: unknown
//
//   try {
//     payload = await request.json()
//   } catch {
//     return NextResponse.json(
//       { error: "Cuerpo de la petición inválido. Debe ser JSON." },
//       { status: 400 },
//     )
//   }
//
//   if (typeof payload !== "object" || payload === null) {
//     return NextResponse.json(
//       { error: "El cuerpo de la petición es inválido." },
//       { status: 400 },
//     )
//   }
//
//   const {
//     pacienteId,
//     profesionalId,
//     motivo,
//     detalle,
//     examenFisico,
//     signosVitales,
//     fecha,
//     hora,
//   } = payload as Record<string, unknown>
//
//   const parsedPacienteId = Number(pacienteId)
//   const parsedProfesionalId = Number(profesionalId)
//
//   if (!Number.isInteger(parsedPacienteId) || parsedPacienteId <= 0) {
//     return NextResponse.json(
//       { error: "pacienteId debe ser un número entero positivo." },
//       { status: 400 },
//     )
//   }
//
//   if (!Number.isInteger(parsedProfesionalId) || parsedProfesionalId <= 0) {
//     return NextResponse.json(
//       { error: "profesionalId debe ser un número entero positivo." },
//       { status: 400 },
//     )
//   }
//
//   if (typeof motivo !== "string" || motivo.trim().length === 0) {
//     return NextResponse.json(
//       { error: "motivo es requerido y debe ser un string no vacío." },
//       { status: 400 },
//     )
//   }
//
//   if (typeof detalle !== "string" || detalle.trim().length === 0) {
//     return NextResponse.json(
//       { error: "detalle es requerido y debe ser un string no vacío." },
//       { status: 400 },
//     )
//   }
//
//   let registroFecha: Date | undefined
//   if (typeof fecha === "string" && fecha.length > 0) {
//     const isoCandidate = typeof hora === "string" && hora.length > 0 ? `${fecha}T${hora}` : fecha
//     const parsed = new Date(isoCandidate)
//     if (Number.isNaN(parsed.getTime())) {
//       return NextResponse.json(
//         { error: "fecha/hora inválidas. Usa el formato ISO 8601." },
//         { status: 400 },
//       )
//     }
//     registroFecha = parsed
//   }
//
//   if (signosVitales && typeof signosVitales !== "object") {
//     return NextResponse.json(
//       { error: "signosVitales debe ser un objeto con los valores de la consulta." },
//       { status: 400 },
//     )
//   }
//
//   try {
//     const [paciente, profesional] = await Promise.all([
//       getPaciente(parsedPacienteId),
//       getProfesional(parsedProfesionalId),
//     ])
//
//     if (!paciente) {
//       return NextResponse.json(
//         { error: `No se encontró un paciente con id ${parsedPacienteId}.` },
//         { status: 404 },
//       )
//     }
//
//     if (!profesional) {
//       return NextResponse.json(
//         { error: `No se encontró un profesional con id ${parsedProfesionalId}.` },
//         { status: 404 },
//       )
//     }
//
//     const creado = await crearHistoriaClinicaRegistro({
//       pacienteId: parsedPacienteId,
//       profesionalId: parsedProfesionalId,
//       motivo: motivo.trim(),
//       detalle: detalle.trim(),
//       examenFisico: typeof examenFisico === "string" ? examenFisico : null,
//       signosVitales:
//         signosVitales && typeof signosVitales === "object"
//           ? (signosVitales as Record<string, unknown>)
//           : null,
//       fecha: registroFecha,
//     })
//
//     return NextResponse.json(mapHistoriaEntry(creado), { status: 201 })
//   } catch (error) {
//     console.error("Error al registrar historia clínica:", error)
//     return NextResponse.json(
//       { error: "Error interno del servidor al registrar la historia clínica." },
//       { status: 500 },
//     )
//   }
// }
