import { NextResponse } from "next/server";
import { getEstadisticasPorDia } from "@/prisma/calendario-mesa";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function parseDateParam(value: string | null): Date | null {
  if (!value) {
    return null;
  }

  const isDateOnly = /^\d{4}-\d{2}-\d{2}$/.test(value);
  const isoValue = isDateOnly ? `${value}T00:00:00.000Z` : value;
  const parsed = new Date(isoValue);

  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function startOfDayUtc(date: Date) {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0, 0)
  );
}

function endOfDayUtc(date: Date) {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 23, 59, 59, 999)
  );
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const fromParam = parseDateParam(searchParams.get("from"));
  const toParam = parseDateParam(searchParams.get("to"));

  if (!fromParam || !toParam) {
    return NextResponse.json(
      {
        error:
          'Debes indicar los parámetros "from" y "to" en formato YYYY-MM-DD o ISO 8601.',
      },
      { status: 400 }
    );
  }

  const from = startOfDayUtc(fromParam);
  const to = endOfDayUtc(toParam);

  if (from > to) {
    return NextResponse.json(
      { error: 'El parámetro "from" debe ser menor o igual que "to".' },
      { status: 400 }
    );
  }

  try {
    const estadisticas = await getEstadisticasPorDia(from, to);

    return NextResponse.json(
      {
        rango: {
          from: from.toISOString(),
          to: to.toISOString(),
        },
        estadisticas,
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("Error al obtener estadísticas:", error);
    return NextResponse.json(
      { error: "Error interno del servidor al obtener las estadísticas." },
      { status: 500 }
    );
  }
}