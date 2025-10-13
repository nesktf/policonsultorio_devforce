import { EstadoTurno } from "@/generated/prisma";
import { Maybe, Result } from "@/lib/error_monads";
import { DBId } from "@/prisma/instance";
import { updateTurnoEstado } from "@/prisma/turnos";
import { NextRequest, NextResponse } from "next/server";

enum TurnoEstadoAPIEnum {
  PROGRAMADO,
  EN_SALA_ESPERA,
  ASISTIO,
  NO_ASISTIO,
  CANCELADO,
}

const estado_map = new Map([
  [TurnoEstadoAPIEnum.PROGRAMADO, EstadoTurno.PROGRAMADO],
  [TurnoEstadoAPIEnum.EN_SALA_ESPERA, EstadoTurno.EN_SALA_ESPERA],
  [TurnoEstadoAPIEnum.ASISTIO, EstadoTurno.ASISTIO],
  [TurnoEstadoAPIEnum.NO_ASISTIO, EstadoTurno.NO_ASISTIO],
  [TurnoEstadoAPIEnum.CANCELADO, EstadoTurno.CANCELADO],
]);


function parseInputJson(data: any): Maybe<{turno_id: DBId, estado_id: EstadoTurno}> {
  function parseId(maybe_id: any): Maybe<number> {
    try {
      const id = Math.floor(parseInt(maybe_id));
      if (id <= 0) {
        return Maybe.None();
      }
      if (Number.isNaN(id)) {
        return Maybe.None();
      }
      return Maybe.Some(id);
    } catch (err) {
      return Maybe.None();
    }
  }

  const {turno_id: raw_turno_id, estado_id: raw_estado_id} = data;
  if (!raw_turno_id) {
    return Maybe.None();
  }
  if (!raw_estado_id) {
    return Maybe.None();
  }

  return parseId(raw_estado_id)
  .andThen((estado_num): Maybe<{turno_id: DBId, estado_id: EstadoTurno}> => {
    const estado_id = estado_map.get(estado_num);
    if (estado_id == undefined) {
      return Maybe.None();
    }
    return parseId(raw_turno_id).transform((turno_id) => {
      return { estado_id , turno_id }
    });
  });
}

export async function PUT(req: NextRequest) {
  try {
    const parsed = parseInputJson(await req.json());
    if (!parsed.hasValue()) {
      return NextResponse.json(
        { error: "Malformed json input" },
        { status: 400 }
      );
    }
    const {estado_id, turno_id} = parsed.unwrap();
    const res = await updateTurnoEstado(turno_id, estado_id);
    if (!res.hasValue()) {
      return NextResponse.json(
        { error: res.error() },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { status: "ok" }
    )
  } catch (error) {
    console.log(`ERROR: api/v2/turno/estado @ PUT: ${error}`);
    return NextResponse.json(
      { error },
      { status: 500 }
    );
  }
}
