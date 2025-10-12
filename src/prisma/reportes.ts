import type { Prisma } from "@/generated/prisma"
import { prisma } from "@/prisma/instance"
import {
  addDays,
  differenceInCalendarDays,
  differenceInCalendarMonths,
  endOfDay,
  endOfISOWeek,
  endOfMonth,
  format,
  getISOWeek,
  startOfDay,
  startOfISOWeek,
  startOfMonth,
  subMonths,
  subYears,
} from "date-fns"
import { es } from "date-fns/locale"

const ESTADO_ASISTIO = "ASISTIO"
const ESTADO_NO_ASISTIO = "NO_ASISTIO"
const ESTADO_CANCELADO = "CANCELADO"

type CancelacionOrigenKey = "PACIENTE" | "PROFESIONAL"
type Agrupacion = "day" | "week" | "month"
export type AgrupacionPeriodo = Agrupacion

const CATEGORIA_CANCELACION_LABELS: Record<CancelacionOrigenKey, string> = {
  PACIENTE: "Paciente",
  PROFESIONAL: "Profesional",
}

const capitalize = (value: string) => (value.length > 0 ? value[0].toUpperCase() + value.slice(1) : value)

interface TurnoWhereParams {
  from: Date
  to: Date
  especialidad?: string
}

const buildTurnoWhere = ({ from, to, especialidad }: TurnoWhereParams): Prisma.TurnoWhereInput => {
  const where: Prisma.TurnoWhereInput = {
    fecha: {
      gte: from,
      lte: to,
    },
  }

  if (especialidad) {
    where.profesional = {
      especialidad,
    }
  }

  return where
}

const buildTurnoCancelacionWhere = ({
  from,
  to,
  especialidad,
}: TurnoWhereParams): Prisma.TurnoCancelacionLogWhereInput => {
  const where: Prisma.TurnoCancelacionLogWhereInput = {
    fecha: {
      gte: from,
      lte: to,
    },
  }

  if (especialidad) {
    where.turno = {
      profesional: {
        especialidad,
      },
    }
  }

  return where
}

const calcularPromedioMensual = (cancelaciones: Date[], meses: number) => {
  if (meses <= 0) return 0
  return cancelaciones.length / meses
}

interface BucketDescriptor {
  etiqueta: string
  tooltipLabel: string
  tooltipRange: string
  fechaInicio: Date
  fechaFin: Date
}

const describeBucket = (key: string, agrupacion: Agrupacion): BucketDescriptor => {
  if (agrupacion === "day") {
    const [yearStr, monthStr, dayStr] = key.split("-")
    const start = startOfDay(new Date(Number(yearStr), Number(monthStr) - 1, Number(dayStr)))
    const end = endOfDay(start)
    return {
      etiqueta: format(start, "dd MMM", { locale: es }),
      tooltipLabel: format(start, "EEEE d 'de' MMMM yyyy", { locale: es }),
      tooltipRange: format(start, "EEEE d 'de' MMMM yyyy", { locale: es }),
      fechaInicio: start,
      fechaFin: end,
    }
  }

  if (agrupacion === "week") {
    const [yearStr, weekStr] = key.split("-W")
    const year = Number(yearStr)
    const week = Number(weekStr)
    const reference = new Date(year, 0, 4)
    const startOfYear = startOfISOWeek(reference)
    const start = addDays(startOfYear, (week - 1) * 7)
    const end = endOfISOWeek(start)
    return {
      etiqueta: `Sem ${week}`,
      tooltipLabel: `Semana ${week} - ${year}`,
      tooltipRange: `${format(start, "d MMM yyyy", { locale: es })} - ${format(end, "d MMM yyyy", {
        locale: es,
      })}`,
      fechaInicio: start,
      fechaFin: end,
    }
  }

  const [yearStr, monthStr] = key.split("-")
  const start = startOfMonth(new Date(Number(yearStr), Number(monthStr) - 1, 1))
  const end = endOfMonth(start)
  return {
    etiqueta: format(start, "MMM yyyy", { locale: es }),
    tooltipLabel: format(start, "MMMM yyyy", { locale: es }),
    tooltipRange: `${format(start, "d MMM yyyy", { locale: es })} - ${format(end, "d MMM yyyy", {
      locale: es,
    })}`,
    fechaInicio: start,
    fechaFin: end,
  }
}

interface GetReporteTurnosCanceladosArgs extends TurnoWhereParams {
  page?: number
  pageSize?: number
}

export async function getReporteTurnosCancelados({
  from,
  to,
  especialidad,
  page = 1,
  pageSize = 10,
}: GetReporteTurnosCanceladosArgs) {
  const emptyResponse = () => ({
    rango: {
      from: from.toISOString(),
      to: to.toISOString(),
    },
    filtros: {
      especialidad: especialidad ?? null,
    },
    resumen: {
      total: 0,
      totalTurnos: 0,
      tasa: 0,
      comparacionAnterior: {
        totalAnterior: 0,
        diferencia: 0,
        variacion: 0,
      },
      promedioMensualUltimosSeisMeses: 0,
      cancelacionesPorOrigen: [],
    },
    cancelaciones: {
      page,
      pageSize,
      total: 0,
      items: [],
    },
  })

  const whereTurnos = buildTurnoWhere({ from, to, especialidad })
  const whereLogs = buildTurnoCancelacionWhere({ from, to, especialidad })

  const skip = Math.max(page - 1, 0) * Math.max(pageSize, 1)
  const take = Math.max(pageSize, 1)

  const periodoDias = differenceInCalendarDays(to, from) + 1
  const periodoAnteriorFin = endOfDay(addDays(from, -1))
  const periodoAnteriorInicio = startOfDay(addDays(periodoAnteriorFin, -(periodoDias - 1)))
  const seisMesesInicio = startOfMonth(subMonths(to, 5))

  let totalTurnos = 0
  let totalCancelados = 0
  let canceladosPeriodoAnterior = 0
  let cancelacionesUltimosSeisMeses: Array<{ fecha: Date }> = []
  let origenesAgrupados: Array<{ solicitadoPor: string | null; _count: { _all: number } }> = []
  let cancelacionesPaginadas: Array<{
    id: number
    fecha: Date
    solicitadoPor: string | null
    turno: {
      id: number
      fecha: Date
      paciente: {
        id: number
        nombre: string
        apellido: string
      }
      profesional: {
        id: number
        nombre: string
        apellido: string
        especialidad: string | null
      }
    }
    canceladoPor: { id: number; nombre: string; rol: string } | null
  }> = []

  try {
    ;[
      totalTurnos,
      totalCancelados,
      canceladosPeriodoAnterior,
      cancelacionesUltimosSeisMeses,
      origenesAgrupados,
      cancelacionesPaginadas,
    ] = await Promise.all([
      prisma.turno.count({ where: whereTurnos }),
      prisma.turnoCancelacionLog.count({ where: whereLogs }),
      prisma.turnoCancelacionLog.count({
        where: {
          fecha: {
            gte: periodoAnteriorInicio,
            lte: periodoAnteriorFin,
          },
          ...(especialidad
            ? {
                turno: {
                  profesional: {
                    especialidad,
                  },
                },
              }
            : {}),
        },
      }),
      prisma.turnoCancelacionLog.findMany({
        where: {
          fecha: {
            gte: seisMesesInicio,
            lte: to,
          },
          ...(especialidad
            ? {
                turno: {
                  profesional: {
                    especialidad,
                  },
                },
              }
            : {}),
        },
        select: {
          fecha: true,
        },
      }),
      prisma.turnoCancelacionLog.groupBy({
        where: whereLogs,
        by: ["solicitadoPor"],
        _count: {
          _all: true,
        },
      }),
      prisma.turnoCancelacionLog.findMany({
        where: whereLogs,
        select: {
          id: true,
          fecha: true,
          solicitadoPor: true,
          turno: {
            select: {
              id: true,
              fecha: true,
              paciente: {
                select: {
                  id: true,
                  nombre: true,
                  apellido: true,
                },
              },
              profesional: {
                select: {
                  id: true,
                  nombre: true,
                  apellido: true,
                  especialidad: true,
                },
              },
            },
          },
          canceladoPor: {
            select: {
              id: true,
              nombre: true,
              rol: true,
            },
          },
        },
        orderBy: {
          fecha: "desc",
        },
        skip,
        take,
      }),
    ])
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code?: string }).code === "P2021"
    ) {
      return emptyResponse()
    }
    throw error
  }

  const tasaCancelacion = totalTurnos === 0 ? 0 : totalCancelados / totalTurnos

  const diferencia = totalCancelados - canceladosPeriodoAnterior
  const variacion =
    canceladosPeriodoAnterior === 0
      ? totalCancelados === 0
        ? 0
        : 100
      : (diferencia / canceladosPeriodoAnterior) * 100

  const promedioMensualUltimosSeisMeses = calcularPromedioMensual(
    cancelacionesUltimosSeisMeses.map((log) => log.fecha),
    differenceInCalendarMonths(to, seisMesesInicio) + 1,
  )

  const origenesConteo = new Map<CancelacionOrigenKey, number>()
  for (const categoria of Object.keys(CATEGORIA_CANCELACION_LABELS) as CancelacionOrigenKey[]) {
    origenesConteo.set(categoria, 0)
  }

  for (const item of origenesAgrupados) {
    const categoriaRaw = item.solicitadoPor ?? "PACIENTE"
    const categoria = categoriaRaw.toUpperCase() as CancelacionOrigenKey
    const total = item._count._all
    origenesConteo.set(categoria, (origenesConteo.get(categoria) ?? 0) + total)
  }

  const cancelacionesPorOrigen = Array.from(origenesConteo.entries())
    .map(([categoria, total]) => ({
      origen: categoria,
      etiqueta: CATEGORIA_CANCELACION_LABELS[categoria] ?? "Paciente",
      total,
      porcentaje: totalCancelados === 0 ? 0 : (total / totalCancelados) * 100,
    }))
    .sort((a, b) => b.total - a.total)

  const cancelacionesRecientes = cancelacionesPaginadas.map((log) => {
    const categoriaRaw = log.solicitadoPor ?? "PACIENTE"
    const categoria = categoriaRaw.toUpperCase() as CancelacionOrigenKey
    return {
      id: log.id,
      fecha: log.fecha.toISOString(),
      solicitadoPor: categoria,
      solicitadoPorEtiqueta: CATEGORIA_CANCELACION_LABELS[categoria] ?? "Paciente",
      canceladoPor: log.canceladoPor
        ? {
            id: log.canceladoPor.id,
            nombre: log.canceladoPor.nombre,
            rol: log.canceladoPor.rol,
          }
        : null,
      turno: {
        id: log.turno.id,
        fecha: log.turno.fecha.toISOString(),
        paciente: log.turno.paciente,
        profesional: log.turno.profesional,
      },
    }
  })

  return {
    rango: {
      from: from.toISOString(),
      to: to.toISOString(),
    },
    filtros: {
      especialidad: especialidad ?? null,
    },
    resumen: {
      total: totalCancelados,
      totalTurnos,
      tasa: tasaCancelacion,
      comparacionAnterior: {
        totalAnterior: canceladosPeriodoAnterior,
        diferencia,
        variacion,
      },
      promedioMensualUltimosSeisMeses,
      cancelacionesPorOrigen,
    },
    cancelaciones: {
      page,
      pageSize: take,
      total: totalCancelados,
      items: cancelacionesRecientes,
    },
  }
}

interface GetReportePacientesAtendidosArgs extends TurnoWhereParams {
  agrupacion?: Agrupacion
  page?: number
  pageSize?: number
}

export async function getReportePacientesAtendidos({
  from,
  to,
  especialidad,
  agrupacion = "day",
  page = 1,
  pageSize = 12,
}: GetReportePacientesAtendidosArgs) {
  const opcionesAgrupacion: readonly Agrupacion[] = ["day", "week", "month"]
  const agrupacionValida: Agrupacion = opcionesAgrupacion.includes(agrupacion) ? agrupacion : "day"
  const where = buildTurnoWhere({ from, to, especialidad })

  const turnos = await prisma.turno.findMany({
    where,
    select: {
      fecha: true,
      estado: true,
    },
  })

  const totalTurnos = turnos.length
  const asistidos = turnos.filter((turno) => turno.estado === ESTADO_ASISTIO).length
  const noAsistidos = turnos.filter((turno) => turno.estado === ESTADO_NO_ASISTIO).length
  const cancelados = turnos.filter((turno) => turno.estado === ESTADO_CANCELADO).length

  const tasaAsistencia = totalTurnos === 0 ? 0 : asistidos / totalTurnos

  const periodoDias = differenceInCalendarDays(to, from) + 1
  const previousEnd = endOfDay(addDays(from, -1))
  const previousStart = startOfDay(addDays(previousEnd, -(periodoDias - 1)))

  const asistidosPeriodoAnterior = await prisma.turno.count({
    where: {
      ...buildTurnoWhere({ from: previousStart, to: previousEnd, especialidad }),
      estado: ESTADO_ASISTIO,
    },
  })

  const diferencia = asistidos - asistidosPeriodoAnterior
  const variacion =
    asistidosPeriodoAnterior === 0
      ? asistidos === 0
        ? 0
        : 100
      : (diferencia / asistidosPeriodoAnterior) * 100

  const detallePorPeriodoMap = new Map<
    string,
    {
      id: string
      fechaInicio: Date
      fechaFin: Date
      total: number
      asistidos: number
      noAsistidos: number
      cancelados: number
    }
  >()

  for (const turno of turnos) {
    let key: string
    let inicio: Date
    let fin: Date

    if (agrupacionValida === "day") {
      inicio = startOfDay(turno.fecha)
      fin = endOfDay(turno.fecha)
      key = format(inicio, "yyyy-MM-dd")
    } else if (agrupacionValida === "week") {
      inicio = startOfISOWeek(turno.fecha)
      fin = endOfISOWeek(turno.fecha)
      const weekNumber = getISOWeek(inicio)
      key = `${inicio.getFullYear()}-W${String(weekNumber).padStart(2, "0")}`
    } else {
      inicio = startOfMonth(turno.fecha)
      fin = endOfMonth(turno.fecha)
      key = format(inicio, "yyyy-MM")
    }

    const registro =
      detallePorPeriodoMap.get(key) ?? {
        id: key,
        fechaInicio: inicio,
        fechaFin: fin,
        total: 0,
        asistidos: 0,
        noAsistidos: 0,
        cancelados: 0,
      }

    registro.total += 1
    switch (turno.estado) {
      case ESTADO_ASISTIO:
        registro.asistidos += 1
        break
      case ESTADO_NO_ASISTIO:
        registro.noAsistidos += 1
        break
      case ESTADO_CANCELADO:
        registro.cancelados += 1
        break
      default:
        break
    }

    detallePorPeriodoMap.set(key, registro)
  }

  const detalleOrdenado = Array.from(detallePorPeriodoMap.values())
    .sort((a, b) => a.fechaInicio.getTime() - b.fechaInicio.getTime())
    .map((bucket) => {
      const inicioClampedTime = Math.max(bucket.fechaInicio.getTime(), from.getTime())
      const finClampedTime = Math.min(bucket.fechaFin.getTime(), to.getTime())
      const inicioClamped = new Date(inicioClampedTime)
      const finClamped = new Date(finClampedTime)

      const rangoTexto =
        inicioClampedTime === finClampedTime
          ? capitalize(format(inicioClamped, "EEEE d 'de' MMMM yyyy", { locale: es }))
          : `${capitalize(format(inicioClamped, "d MMM yyyy", { locale: es }))} - ${capitalize(
              format(finClamped, "d MMM yyyy", { locale: es }),
            )}`

      const etiqueta = (() => {
        switch (agrupacionValida) {
          case "day":
            return capitalize(format(inicioClamped, "EEEE d 'de' MMMM yyyy", { locale: es }))
          case "week": {
            const semana = getISOWeek(bucket.fechaInicio)
            const inicioTexto = capitalize(format(inicioClamped, "d MMM", { locale: es }))
            const finTexto = capitalize(format(finClamped, "d MMM", { locale: es }))
            return `Semana ${String(semana).padStart(2, "0")} - ${bucket.fechaInicio.getFullYear()} (${inicioTexto} - ${finTexto})`
          }
          case "month":
          default:
            return capitalize(format(bucket.fechaInicio, "MMMM yyyy", { locale: es }))
        }
      })()

      return {
        id: bucket.id,
        etiqueta,
        rango: rangoTexto,
        fechaInicio: inicioClamped.toISOString(),
        fechaFin: finClamped.toISOString(),
        total: bucket.total,
        asistidos: bucket.asistidos,
        noAsistidos: bucket.noAsistidos,
        cancelados: bucket.cancelados,
        tasaAsistencia: bucket.total === 0 ? 0 : bucket.asistidos / bucket.total,
      }
    })

  const safePageSize = Math.max(pageSize, 1)
  const totalItems = detalleOrdenado.length
  const totalPages = totalItems === 0 ? 1 : Math.ceil(totalItems / safePageSize)
  const currentPage =
    totalItems === 0 ? 1 : Math.min(Math.max(page, 1), totalPages)
  const startIndex = (currentPage - 1) * safePageSize
  const detalle = detalleOrdenado.slice(startIndex, startIndex + safePageSize)

  const distribucion = [
    {
      etiqueta: "Asistidos",
      valor: asistidos,
      porcentaje: totalTurnos === 0 ? 0 : (asistidos / totalTurnos) * 100,
      color: "#22c55e",
    },
    {
      etiqueta: "No asistidos",
      valor: noAsistidos,
      porcentaje: totalTurnos === 0 ? 0 : (noAsistidos / totalTurnos) * 100,
      color: "#f97316",
    },
    {
      etiqueta: "Cancelados",
      valor: cancelados,
      porcentaje: totalTurnos === 0 ? 0 : (cancelados / totalTurnos) * 100,
      color: "#ef4444",
    },
  ]

  return {
    rango: {
      from: from.toISOString(),
      to: to.toISOString(),
    },
    filtros: {
      especialidad: especialidad ?? null,
    },
    resumen: {
      totalTurnos,
      asistidos,
      noAsistidos,
      cancelados,
      tasaAsistencia,
      comparacionAnterior: {
        asistidosAnteriores: asistidosPeriodoAnterior,
        diferencia,
        variacion,
      },
    },
    distribucion,
    detalle,
    paginacion: {
      page: currentPage,
      pageSize: safePageSize,
      totalItems,
      totalPages,
    },
  }
}

const keyAgrupacion = (fecha: Date, agrupacion: Agrupacion): string => {
  switch (agrupacion) {
    case "day":
      return format(fecha, "yyyy-MM-dd")
    case "week": {
      const week = getISOWeek(fecha)
      return `${fecha.getFullYear()}-W${String(week).padStart(2, "0")}`
    }
    case "month":
    default:
      return format(fecha, "yyyy-MM")
  }
}

interface GetReportePacientesPorPeriodoArgs {
  from: Date
  to: Date
  agrupacion: Agrupacion
  profesionalId?: number
}

export async function getReportePacientesPorPeriodo({
  from,
  to,
  agrupacion,
  profesionalId,
}: GetReportePacientesPorPeriodoArgs) {
  const asistidos = await prisma.turno.findMany({
    where: {
      fecha: {
        gte: from,
        lte: to,
      },
      estado: ESTADO_ASISTIO,
      ...(profesionalId ? { id_profesional: profesionalId } : {}),
    },
    select: {
      fecha: true,
      profesional: {
        select: {
          especialidad: true,
        },
      },
    },
  })

  const agregados = new Map<string, number>()
  for (const turno of asistidos) {
    const key = keyAgrupacion(turno.fecha, agrupacion)
    agregados.set(key, (agregados.get(key) ?? 0) + 1)
  }

  const buckets = Array.from(agregados.entries())
    .map(([key, total]) => {
      const descriptor = describeBucket(key, agrupacion)
      return {
        ...descriptor,
        valor: total,
      }
    })
    .sort((a, b) => a.fechaInicio.getTime() - b.fechaInicio.getTime())

  const series = buckets.map((bucket) => ({
    etiqueta: bucket.etiqueta,
    valor: bucket.valor,
    fechaInicio: bucket.fechaInicio.toISOString(),
    fechaFin: bucket.fechaFin.toISOString(),
    tooltipLabel: bucket.tooltipLabel,
    tooltipRange: bucket.tooltipRange,
  }))

  const totalAtendidos = asistidos.length
  const promedioPorGrupo = series.length === 0 ? 0 : totalAtendidos / series.length

  const maximoBucket =
    buckets.length === 0
      ? null
      : buckets.reduce((acumulado, item) => (item.valor > acumulado.valor ? item : acumulado), buckets[0])

  const maximo = maximoBucket
    ? {
        etiqueta: maximoBucket.tooltipLabel,
        total: maximoBucket.valor,
        fechaInicio: maximoBucket.fechaInicio.toISOString(),
        fechaFin: maximoBucket.fechaFin.toISOString(),
        tooltipRange: maximoBucket.tooltipRange,
      }
    : null

  const previousFrom = subYears(from, 1)
  const previousTo = subYears(to, 1)

  const asistidosPeriodoAnterior = await prisma.turno.count({
    where: {
      fecha: {
        gte: previousFrom,
        lte: previousTo,
      },
      estado: ESTADO_ASISTIO,
    },
  })

  const diferencia = totalAtendidos - asistidosPeriodoAnterior
  const variacion =
    asistidosPeriodoAnterior === 0
      ? totalAtendidos === 0
        ? 0
        : 100
      : (diferencia / asistidosPeriodoAnterior) * 100

  const detalleMensualMapa = new Map<string, { total: number; fecha: Date }>()
  for (const turno of asistidos) {
    const key = format(turno.fecha, "yyyy-MM")
    const registro = detalleMensualMapa.get(key) ?? { total: 0, fecha: turno.fecha }
    registro.total += 1
    detalleMensualMapa.set(key, registro)
  }

  const detalleMensual = Array.from(detalleMensualMapa.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([key, valores]) => {
      const [yearStr, monthStr] = key.split("-")
      const year = Number(yearStr)
      const month = Number(monthStr)
      const fechaInicio = startOfMonth(valores.fecha)
      return {
        mes: format(fechaInicio, "MMMM yyyy", { locale: es }),
        total: valores.total,
        month,
        year,
      }
    })

  const especialidadesMapa = new Map<string, number>()
  for (const turno of asistidos) {
    const key = turno.profesional?.especialidad ?? "Sin especialidad"
    especialidadesMapa.set(key, (especialidadesMapa.get(key) ?? 0) + 1)
  }

  const especialidades = Array.from(especialidadesMapa.entries())
    .map(([especialidad, total]) => ({
      especialidad,
      total,
      porcentaje: totalAtendidos === 0 ? 0 : (total / totalAtendidos) * 100,
    }))
    .sort((a, b) => b.total - a.total)

  return {
    rango: {
      from: from.toISOString(),
      to: to.toISOString(),
    },
    filtros: {
      agrupacion,
    },
    resumen: {
      totalAtendidos,
      promedioPorGrupo,
      maximo,
      comparacionAnterior: {
        totalAnterior: asistidosPeriodoAnterior,
        diferencia,
        variacion,
      },
    },
    series,
    detalleMensual,
    especialidades,
  }
}
