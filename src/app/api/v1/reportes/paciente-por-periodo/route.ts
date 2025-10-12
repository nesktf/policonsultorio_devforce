import { NextResponse } from "next/server"
import { endOfDay, startOfDay, startOfMonth } from "date-fns"

import {
  AgrupacionPeriodo,
  getReportePacientesPorPeriodo,
} from "@/prisma/reportes"

export const dynamic = "force-dynamic"
export const revalidate = 0

const parseDate = (value: string | null): Date | null => {
  if (!value) return null
  const isDateOnly = /^\d{4}-\d{2}-\d{2}$/.test(value)
  const dateISO = isDateOnly ? `${value}T00:00:00Z` : value
  const parsed = new Date(dateISO)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

const getDefaultRange = () => {
  const now = new Date()
  const from = startOfMonth(now)
  const to = endOfDay(now)
  return { from, to }
}

const AGRUPACIONES_VALIDAS: AgrupacionPeriodo[] = ["day", "week", "month"]

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)

  const fromParam = parseDate(searchParams.get("from"))
  const toParam = parseDate(searchParams.get("to"))
  const { from: defaultFrom, to: defaultTo } = getDefaultRange()

  const from = startOfDay(fromParam ?? defaultFrom)
  const to = endOfDay(toParam ?? defaultTo)

  if (from > to) {
    return NextResponse.json(
      {
        error:
          'El parámetro "from" debe ser anterior o igual al parámetro "to".',
      },
      { status: 400 },
    )
  }

  const agrupacionParam = (searchParams.get("groupBy") ??
    "week") as AgrupacionPeriodo
  const agrupacion = AGRUPACIONES_VALIDAS.includes(agrupacionParam)
    ? agrupacionParam
    : "week"

  const profesionalIdParam = searchParams.get("profesionalId")
  let profesionalId: number | undefined
  if (profesionalIdParam) {
    const parsed = Number(profesionalIdParam)
    if (!Number.isInteger(parsed) || parsed <= 0) {
      return NextResponse.json(
        { error: 'El parámetro "profesionalId" debe ser un entero positivo.' },
        { status: 400 },
      )
    }
    profesionalId = parsed
  }

  try {
    const reporte = await getReportePacientesPorPeriodo({
      from,
      to,
      agrupacion,
      profesionalId,
    })

    return NextResponse.json(reporte, {
      headers: {
        "Cache-Control": "no-store",
      },
    })
  } catch (error) {
    console.error(
      "Error al generar el reporte de pacientes por periodo:",
      error,
    )
    return NextResponse.json(
      { error: "Error interno del servidor al generar el reporte." },
      { status: 500 },
    )
  }
}
