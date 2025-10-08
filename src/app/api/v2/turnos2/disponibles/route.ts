import { NextResponse } from "next/server";

export async function GET(req: Request) {
  // Por ahora devolvemos horarios de ejemplo
  const slots = ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30"];
  return NextResponse.json({ slots });
}
