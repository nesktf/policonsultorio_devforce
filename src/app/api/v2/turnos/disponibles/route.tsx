// app/api/test-turnos/route.ts
import { NextResponse } from "next/server";
import { getTurnosOcupantes } from "@/prisma/turnos";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const profesionalId = Number(searchParams.get("profesionalId"));
  const fecha = searchParams.get("fecha");
  const durationMinutes = Number(searchParams.get("durationMinutes") || 30);
  const inicio = new Date(`${fecha}T08:00:00`); // se crea sin zona (naive)
  const fin = new Date(`${fecha}T22:00:00`);

  if (!profesionalId || !fecha) {
    return NextResponse.json({ error: "Faltan parámetros" }, { status: 400 });
  }

  // Traer los turnos ocupantes (filtramos por estados que bloquean)
  const turnosRaw = await getTurnosOcupantes(profesionalId, fecha);

  // Reconstruimos cada turno interpretando sus componentes UTC como hora local (solución para "timestamp without time zone")
  const turnos = turnosRaw.map((t) => {
    const d = new Date(t.fecha); // Date que devuelve Prisma
    // Reconstruimos usando los getters UTC para obtener la misma "hora" pero en zona local
    const inicioTurnoLocal = new Date(
      d.getUTCFullYear(),
      d.getUTCMonth(),
      d.getUTCDate(),
      d.getUTCHours(),
      d.getUTCMinutes(),
      d.getUTCSeconds(),
      d.getUTCMilliseconds()
    );
    return {
      id: t.id,
      fechaOriginal_iso: d.toISOString(),
      fechaOriginal_localString: d.toLocaleString("es-AR"),
      inicioTurnoLocal_iso: inicioTurnoLocal.toISOString(),
      inicioTurnoLocal_localString: inicioTurnoLocal.toLocaleString("es-AR"),
      inicioMs: inicioTurnoLocal.getTime(),
      duracion_minutos: t.duracion_minutos,
      estado: t.estado,
    };
  });

  // Generar slots y comprobar intersección (usando ms para robustez)
  const slots: string[] = [];
  const slotDetails: Array<{
    slot: string;
    blocked: boolean;
    blockers: {
      id: number;
      estado: string;
      inicioLocal: string;
      duracion: number;
    }[];
  }> = [];

  let current = new Date(inicio);

  while (current < fin) {
    const finSlot = new Date(current.getTime() + durationMinutes * 60000);

    const blockers = turnos
      .map((t) => {
        const inicioTurnoMs = t.inicioMs;
        const finTurnoMs = inicioTurnoMs + t.duracion_minutos * 60000;
        const overlap =
          current.getTime() < finTurnoMs && finSlot.getTime() > inicioTurnoMs;
        return overlap
          ? {
              id: t.id,
              estado: t.estado,
              inicioLocal: t.inicioTurnoLocal_localString,
              duracion: t.duracion_minutos,
            }
          : null;
      })
      .filter(Boolean) as {
      id: number;
      estado: string;
      inicioLocal: string;
      duracion: number;
    }[];

    const hh = current.getHours().toString().padStart(2, "0");
    const mm = current.getMinutes().toString().padStart(2, "0");
    const slot = `${hh}:${mm}`;

    if (blockers.length === 0) {
      slots.push(slot);
    }

    slotDetails.push({ slot, blocked: blockers.length > 0, blockers });

    current = finSlot;
  }

  // Devuelvo también los turnos reconstruidos y los detalles por slot para debugging
  return NextResponse.json({
    debug: {
      queryRange: { inicio: inicio.toString(), fin: fin.toString() },
      turnosRawCount: turnosRaw.length,
      turnos,
      slotDetails,
    },
    slots,
  });
}
