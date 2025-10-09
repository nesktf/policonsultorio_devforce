import { NextResponse } from "next/server"
import { endOfDay, startOfDay, startOfMonth } from "date-fns"

import { getReporteTurnosCancelados } from "@/prisma/reportes"

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

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)

  const fromParam = parseDate(searchParams.get("from"))
  const toParam = parseDate(searchParams.get("to"))
  const { from: defaultFrom, to: defaultTo } = getDefaultRange()

  const from = startOfDay(fromParam ?? defaultFrom)
  const to = endOfDay(toParam ?? defaultTo)

  const pageParam = parseInt(searchParams.get("page") ?? "1", 10)
  const pageSizeParam = parseInt(searchParams.get("pageSize") ?? "10", 10)

  const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1
  const pageSize =
    Number.isFinite(pageSizeParam) && pageSizeParam > 0 && pageSizeParam <= 100
      ? pageSizeParam
      : 10

  if (from > to) {
    return NextResponse.json(
      {
        error:
          'El parámetro "from" debe ser anterior o igual al parámetro "to".',
      },
      { status: 400 },
    )
  }

  const especialidad = searchParams.get("especialidad")

  try {
    const reporte = await getReporteTurnosCancelados({
      from,
      to,
      especialidad: especialidad ?? undefined,
      page,
      pageSize,
    })

    return NextResponse.json(reporte, {
      headers: {
        "Cache-Control": "no-store",
      },
    })
  } catch (error) {
    console.error("Error al generar el reporte de turnos cancelados:", error)
    return NextResponse.json(
      { error: "Error interno del servidor al generar el reporte." },
      { status: 500 },
    )
  }
}
