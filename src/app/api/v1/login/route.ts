// src/app/api/login/route.ts
import { NextResponse } from "next/server";
import { createHash } from "crypto";
import findUserByEmail from "@/prisma/login";

/** Función que genera hash SHA-256 en hexadecimal */
function sha256Hex(input: string) {
  return createHash("sha256").update(input, "utf8").digest("hex");
}

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { ok: false, error: "Email y contraseña son requeridos" },
        { status: 400 }
      );
    }

    // Buscar usuario por email
    const user = await findUserByEmail(email);

    if (!user) {
      return NextResponse.json(
        { ok: false, error: "Usuario no encontrado" },
        { status: 401 }
      );
    }

    // Hashear la contraseña ingresada y compararla con la DB
    const hashCandidate = sha256Hex(password.trim());

    if (hashCandidate !== user.password) {
      return NextResponse.json(
        { ok: false, error: "Contraseña incorrecta" },
        { status: 401 }
      );
    }

    // Usuario autenticado, devolver datos sin la contraseña
    const { password: _p, ...userSafe } = user as any;

    return NextResponse.json({ ok: true, user: userSafe });
  } catch (error) {
    console.error("Error en login:", error);
    return NextResponse.json(
      { ok: false, error: "Error interno en el servidor" },
      { status: 500 }
    );
  }
}
