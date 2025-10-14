import { NextResponse } from 'next/server'
import { obtenerProfesionales } from '@/prisma/profesional'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
    const profesionales = await obtenerProfesionales()
    
    return NextResponse.json({
      profesionales: profesionales.map((p: any) => ({
        id: p.id,
        nombre: p.nombre,
        apellido: p.apellido,
        especialidad: p.especialidad
      }))
    })
  } catch (error) {
    console.error('Error al obtener profesionales:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}