import { NextResponse } from 'next/server'
import { prisma } from '@/prisma/instance'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const fechaInicio = searchParams.get('fechaInicio')
    const fechaFin = searchParams.get('fechaFin')
    const profesionalId = searchParams.get('profesionalId')

    if (!fechaInicio || !fechaFin) {
      return NextResponse.json(
        { error: 'Se requieren fechaInicio y fechaFin' },
        { status: 400 }
      )
    }

    // Convertir fechas
    const fechaInicioDate = new Date(fechaInicio + 'T00:00:00Z')
    const fechaFinDate = new Date(fechaFin + 'T23:59:59Z')

    // Construir filtros
    const whereClause: any = {
      fecha: {
        gte: fechaInicioDate,
        lte: fechaFinDate
      }
    }

    if (profesionalId && profesionalId !== 'todos') {
      whereClause.id_profesional = parseInt(profesionalId)
    }

    // Obtener turnos con estadísticas agrupadas por profesional
    const turnosGrouped = await prisma.turno.groupBy({
      by: ['id_profesional', 'estado'],
      where: whereClause,
      _count: {
        id: true
      }
    })

    // Obtener información de profesionales
    const profesionales = await prisma.profesional.findMany({
      select: {
        id: true,
        nombre: true,
        apellido: true,
        especialidad: true
      }
    })

    // Procesar datos para crear estadísticas
    const statsMap = new Map()

    // Inicializar todos los profesionales con ceros
    profesionales.forEach(prof => {
      if (!profesionalId || profesionalId === 'todos' || prof.id === parseInt(profesionalId)) {
        statsMap.set(prof.id, {
          id: prof.id,
          nombre: prof.nombre,
          apellido: prof.apellido,
          especialidad: prof.especialidad,
          asistidos: 0,
          cancelados: 0,
          ausentes: 0,
          total: 0,
          porcentajeAsistencia: 0,
          porcentajeCancelacion: 0
        })
      }
    })

    // Agregar datos de turnos
    turnosGrouped.forEach(group => {
      const profId = group.id_profesional
      if (statsMap.has(profId)) {
        const stat = statsMap.get(profId)
        const count = group._count.id

        switch (group.estado) {
          case 'ASISTIO':
            stat.asistidos += count
            break
          case 'CANCELADO':
            stat.cancelados += count
            break
          case 'NO_ASISTIO':
            stat.ausentes += count
            break
          case 'PROGRAMADO':
          case 'EN_SALA_ESPERA':
            // Estos estados se pueden considerar como programados/pendientes
            // No los contamos en las estadísticas de resultado
            break
        }
        
        stat.total = stat.asistidos + stat.cancelados + stat.ausentes
      }
    })

    // Calcular porcentajes
    const stats = Array.from(statsMap.values()).map((stat: any) => {
      if (stat.total > 0) {
        stat.porcentajeAsistencia = (stat.asistidos / stat.total) * 100
        stat.porcentajeCancelacion = (stat.cancelados / stat.total) * 100
      }
      return stat
    }).filter((stat: any) => stat.total > 0) // Solo mostrar profesionales con turnos

    // Ordenar por porcentaje de asistencia descendente
    stats.sort((a: any, b: any) => b.porcentajeAsistencia - a.porcentajeAsistencia)

    return NextResponse.json({
      stats,
      periodo: {
        fechaInicio,
        fechaFin
      },
      filtros: {
        profesionalId: profesionalId || 'todos'
      }
    })

  } catch (error) {
    console.error('Error al generar reporte de turnos por profesional:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}