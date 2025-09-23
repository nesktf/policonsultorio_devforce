import { createObraSocial, findObrasSociales, ObraSocialData, retrieveObrasSociales, updateObraSocial } from "@/app/prisma"
import { EstadoObraSocial } from "@/generated/prisma";
import { NextRequest, NextResponse } from "next/server";

export enum APIEstadoObraSocial {
  ACTIVA = 1,
  INACTIVA = 2,
};
const state_map = new Map([
  [APIEstadoObraSocial.ACTIVA, EstadoObraSocial.ACTIVA],
  [APIEstadoObraSocial.INACTIVA, EstadoObraSocial.INACTIVA]
]);

export async function GET(req: NextRequest) {
  const params = {
    name: req.nextUrl.searchParams.get("name"),
    state_id: req.nextUrl.searchParams.get("state_id"),
  };

  let search_state: EstadoObraSocial | undefined;
  if (params.state_id && typeof(params.state_id) == "number") {
    let id = Number(params.state_id);
    switch (id) {
      case APIEstadoObraSocial.ACTIVA: {
        search_state = EstadoObraSocial.ACTIVA;
      } break;
      case APIEstadoObraSocial.INACTIVA: {
        search_state = EstadoObraSocial.INACTIVA;
      } break;
      default: {
        search_state = undefined;
      }
    }
  }

  let ret = params.name ? 
    await findObrasSociales(params.name, search_state) :
    await retrieveObrasSociales(search_state);

  return NextResponse.json({
    obras_sociales: ret.map((os) => {
      return { id: os.id, nombre: os.data.getNombre(), estado: os.data.getEstado() }
    }),
  });
}

function parseState(maybe_id?: number): EstadoObraSocial {
  if (maybe_id) {
    if (typeof(maybe_id) != "number") {
      throw Error("ID estado invalido");
    }
    let estado_id: APIEstadoObraSocial = Number(maybe_id);
    let ret = state_map.get(estado_id);
    if (!ret) {
      throw Error("ID estado invalido");
    }
    return ret;
  } else {
    return EstadoObraSocial.ACTIVA;
  }
}

export async function POST(req: NextRequest) {
  try {
    let { nombre, estado } = await req.json();
    if (typeof(nombre) != "string") {
      throw Error("Nombre inválido");
    }

    let ret = await createObraSocial(new ObraSocialData(nombre, parseState(estado)));
    if (!ret) {
      throw Error("ObraSocial upload failed");
    }
    return NextResponse.json({
      obra_social: {
        id: ret.id,
        nombre: ret.data.getNombre(),
        estado: ret.data.getEstado()
      }
    });
  } catch (error) {
    return NextResponse.json({ error }, { status: 400 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    let { id, nombre, estado } = await req.json();
    if (typeof(id) != "number") {
      throw Error("ID inválido");
    }
    if (typeof(nombre) != "string") {
      throw Error("Nombre inválido");
    }
    let data = new ObraSocialData(nombre, parseState(estado));
    let ret = await updateObraSocial(Number(id), data);
    if (!ret) {
      throw Error("ObraSocial update failed");
    }
    return NextResponse.json({
      obra_social: {
        id: Number(id),
        nombre: data.getNombre(),
        estado: data.getEstado()
      }
    });
  } catch (error) {
    return NextResponse.json({ error }, { status: 400 });
  }
}
