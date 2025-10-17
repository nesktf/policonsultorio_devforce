import { NextResponse } from 'next/server'
import { prisma } from '@/prisma/instance'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const fecha = searchParams.get('fecha')
    const especialidad = searchParams.get('especialidad')
    const estado = searchParams.get('estado')

    if (!fecha) {
      return NextResponse.json(
        { error: 'Se requiere la fecha' },
        { status: 400 }
      )
    }

    // Convertir fecha a rango completo del día
    const fechaInicio = new Date(fecha + 'T00:00:00Z')
    const fechaFin = new Date(fecha + 'T23:59:59Z')

    // Construir filtros
    const whereClause: any = {
      fecha: {
        gte: fechaInicio,
        lte: fechaFin
      }
    }

    if (estado && estado !== 'todos') {
      whereClause.estado = estado
    }

    // Obtener turnos con información completa
    const turnos = await prisma.turno.findMany({
      where: whereClause,
      include: {
        paciente: {
          select: {
            nombre: true,
            apellido: true,
            dni: true,
            telefono: true
          }
        },
        profesional: {
          select: {
            nombre: true,
            apellido: true,
            especialidad: true
          }
        }
      },
      orderBy: {
        fecha: 'asc'
      }
    })

    // Filtrar por especialidad si se especifica
    let turnosFiltrados = turnos
    if (especialidad && especialidad !== 'todas') {
      turnosFiltrados = turnos.filter(turno => 
        turno.profesional.especialidad === especialidad
      )
    }

    // Crear estadísticas por especialidad
    const especialidadMap = new Map()
    turnosFiltrados.forEach(turno => {
      const esp = turno.profesional.especialidad
      if (especialidadMap.has(esp)) {
        especialidadMap.set(esp, especialidadMap.get(esp) + 1)
      } else {
        especialidadMap.set(esp, 1)
      }
    })

    const especialidadStats = Array.from(especialidadMap.entries()).map(([especialidad, cantidad]) => ({
      especialidad,
      cantidad,
      color: getColorForEspecialidad(especialidad)
    })).sort((a, b) => b.cantidad - a.cantidad)

    // Formatear turnos para el frontend
    const turnosFormateados = turnosFiltrados.map(turno => ({
      id: turno.id,
      fecha: turno.fecha.toISOString(),
      hora: turno.fecha.toLocaleTimeString('es-AR', { 
        hour: '2-digit', 
        minute: '2-digit',
        timeZone: 'America/Argentina/Buenos_Aires'
      }),
      paciente: {
        nombre: turno.paciente.nombre,
        apellido: turno.paciente.apellido,
        dni: turno.paciente.dni,
        telefono: turno.paciente.telefono
      },
      profesional: {
        nombre: turno.profesional.nombre,
        apellido: turno.profesional.apellido,
        especialidad: turno.profesional.especialidad
      },
      estado: turno.estado,
      duracionMinutos: turno.duracion_minutos
    }))

    return NextResponse.json({
      turnos: turnosFormateados,
      especialidadStats,
      fecha,
      totalTurnos: turnosFormateados.length,
      filtros: {
        especialidad: especialidad || 'todas',
        estado: estado || 'todos'
      }
    })

  } catch (error) {
    console.error('Error al generar agenda diaria:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// Función auxiliar para asignar colores a especialidades
function getColorForEspecialidad(especialidad: string): string {
  const colores = [
    '#3b82f6', // blue
    '#10b981', // green
    '#f59e0b', // yellow
    '#ef4444', // red
    '#8b5cf6', // purple
    '#06b6d4', // cyan
    '#f97316', // orange
    '#84cc16', // lime
    '#ec4899', // pink
    '#6b7280'  // gray
  ]
  
  // Usar hash simple del nombre para asignar color consistente
  let hash = 0
  for (let i = 0; i < especialidad.length; i++) {
    hash = especialidad.charCodeAt(i) + ((hash << 5) - hash)
  }
  
  return colores[Math.abs(hash) % colores.length]
}