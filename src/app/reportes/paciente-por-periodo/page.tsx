"use client"

import {
  AlertCircle,
  ArrowLeft,
  BarChart3,
  Calendar,
  Download,
  Loader2,
  RefreshCw,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import Link from "next/link"
import {
  ChangeEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import type { TooltipProps } from "recharts"
import { format } from "date-fns"
import { es } from "date-fns/locale"

import { MainLayout } from "@/components/layout/main-layout"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useAuth } from "@/context/auth-context"
import { exportarReportePacientesPorPeriodo } from "@/utils/pdfExport"

type GroupByOption = "day" | "week" | "month"

interface ReportePacientesPorPeriodoResponse {
  rango: {
    from: string
    to: string
  }
  filtros: {
    agrupacion: GroupByOption
  }
  resumen: {
    totalAtendidos: number
    promedioPorGrupo: number
    maximo: {
      etiqueta: string
      total: number
      fechaInicio: string
      fechaFin: string
      tooltipRange: string
    } | null
    comparacionAnterior: {
      totalAnterior: number
      diferencia: number
      variacion: number
    }
  }
  series: Array<{
    etiqueta: string
    valor: number
    fechaInicio: string
    fechaFin: string
    tooltipLabel: string
    tooltipRange: string
  }>
  detalleMensual: Array<{
    mes: string
    total: number
    month: number
    year: number
  }>
  especialidades: Array<{
    especialidad: string
    total: number
    porcentaje: number
  }>
}

const toInputDate = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`

const GROUP_LABELS: Record<GroupByOption, string> = {
  day: "Día",
  week: "Semana",
  month: "Mes",
}

const capitalize = (value: string) => (value.length > 0 ? value[0].toUpperCase() + value.slice(1) : value)

type ChartDataPoint = {
  etiqueta: string
  pacientes: number
  tooltipLabel: string
  tooltipRange: string
  fechaInicio: string
  fechaFin: string
}

export default function ReportePacientesPorPeriodo() {
  const { user } = useAuth()
  const isGerente = user?.rol === "GERENTE"
  const isProfesional = user?.rol === "PROFESIONAL"

  const [filters, setFilters] = useState(() => {
    const now = new Date()
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
    return {
      from: toInputDate(firstDay),
      to: toInputDate(now),
      groupBy: "week" as GroupByOption,
    }
  })
  const [reporte, setReporte] = useState<ReportePacientesPorPeriodoResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [profesionalId, setProfesionalId] = useState<number | null>(null)
  const [isProfesionalReady, setIsProfesionalReady] = useState(!isProfesional)
  const [profesionalFetchError, setProfesionalFetchError] = useState<string | null>(null)
  const [profesionalInfo, setProfesionalInfo] = useState<{
    nombre: string
    apellido: string
    especialidad?: string | null
  } | null>(null)
  const [isExporting, setIsExporting] = useState(false)
  const [selectedYear, setSelectedYear] = useState<number | null>(null)

  useEffect(() => {
    let cancelled = false

    if (!isProfesional || !user) {
      setProfesionalId(null)
      setProfesionalFetchError(null)
      setProfesionalInfo(null)
      setIsProfesionalReady(true)
      return
    }

    const loadProfesional = async () => {
      setIsProfesionalReady(false)
      setProfesionalFetchError(null)
      setIsLoading(true)

      try {
        const response = await fetch(`/api/v2/profesional/by-user/${user.id}`)
        if (!response.ok) {
          throw new Error("No se encontró la información del profesional.")
        }
        const data = await response.json()
        if (cancelled) {
          return
        }
        const profesionalIdValue = Number(data?.profesionalId)
        if (!Number.isInteger(profesionalIdValue) || profesionalIdValue <= 0) {
          throw new Error("No se encontró la información del profesional.")
        }
        setProfesionalId(profesionalIdValue)
        setProfesionalInfo({
          nombre: typeof data?.nombre === "string" ? data.nombre : "",
          apellido: typeof data?.apellido === "string" ? data.apellido : "",
          especialidad: typeof data?.especialidad === "string" ? data.especialidad : null,
        })
      } catch (err) {
        console.error(err)
        if (!cancelled) {
          const message =
            err instanceof Error
              ? err.message
              : "No se pudo obtener la información del profesional."
          setProfesionalInfo(null)
          setProfesionalId(null)
          setProfesionalFetchError(message)
          setError(message)
          setIsLoading(false)
        }
      } finally {
        if (!cancelled) {
          setIsProfesionalReady(true)
        }
      }
    }

    loadProfesional()

    return () => {
      cancelled = true
    }
  }, [isProfesional, user])

  const numberFormatter = useMemo(
    () =>
      new Intl.NumberFormat("es-AR", {
        maximumFractionDigits: 0,
      }),
    [],
  )

  const decimalFormatter = useMemo(
    () =>
      new Intl.NumberFormat("es-AR", {
        maximumFractionDigits: 1,
        minimumFractionDigits: 1,
      }),
    [],
  )

  const fetchReporte = useCallback(async () => {
    if (!user) {
      return
    }
    if (isProfesional) {
      if (!isProfesionalReady) {
        return
      }
      if (profesionalFetchError) {
        return
      }
      if (profesionalId === null) {
        return
      }
    }

    setIsLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({
        from: filters.from,
        to: filters.to,
        groupBy: filters.groupBy,
      })

      if (isProfesional && profesionalId !== null) {
        params.set("profesionalId", profesionalId.toString())
      }

      const response = await fetch(`/api/v1/reportes/paciente-por-periodo?${params.toString()}`, {
        cache: "no-store",
      })

      const payload = await response.json().catch(() => null)
      if (!response.ok || !payload) {
        throw new Error(
          payload && typeof payload === "object" && "error" in payload
            ? (payload as { error?: string }).error ?? "No se pudo obtener el reporte."
            : "No se pudo obtener el reporte.",
        )
      }

      setReporte(payload as ReportePacientesPorPeriodoResponse)
    } catch (err) {
      console.error(err)
      setReporte(null)
      setError(err instanceof Error ? err.message : "Ocurrió un error inesperado.")
    } finally {
      setIsLoading(false)
    }
  }, [filters, isProfesional, isProfesionalReady, profesionalFetchError, profesionalId, user])

  useEffect(() => {
    fetchReporte()
  }, [fetchReporte])

  const handleDateChange =
    (field: "from" | "to") => (event: ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value
      setFilters((prev) => {
        if (field === "from" && value > prev.to) {
          return { ...prev, from: value, to: value }
        }
        if (field === "to" && value < prev.from) {
          return { ...prev, from: value, to: value }
        }
        return { ...prev, [field]: value }
      })
    }

  const handleGroupByChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setFilters((prev) => ({
      ...prev,
      groupBy: event.target.value as GroupByOption,
    }))
  }

  type SummaryCard = {
    key: string
    label: string
    value: string
    helper?: string
    highlight?: string
    icon: LucideIcon
    gradient: string
    iconBg: string
    valueClass: string
  }

  const resumenCards = useMemo<SummaryCard[]>(() => {
    const total = reporte?.resumen.totalAtendidos ?? 0
    const promedio = reporte?.resumen.promedioPorGrupo ?? 0
    const maximo = reporte?.resumen.maximo ?? null
    const comparacion = reporte?.resumen.comparacionAnterior
    const variacion = comparacion?.variacion ?? 0
    const diferencia = comparacion?.diferencia ?? 0
    const groupLabel = GROUP_LABELS[filters.groupBy].toLowerCase()

    const variacionEsPositiva = variacion >= 0
    const variacionStyles = variacionEsPositiva
      ? {
          gradient: "from-emerald-500/10 via-background to-background",
          iconBg: "bg-emerald-500/15 text-emerald-600",
          valueClass: "text-emerald-600",
          icon: TrendingUp,
        }
      : {
          gradient: "from-rose-500/10 via-background to-background",
          iconBg: "bg-rose-500/15 text-rose-600",
          valueClass: "text-rose-600",
          icon: TrendingDown,
        }

    return [
      {
        key: "total",
        label: "Total atendidos",
        value: reporte ? numberFormatter.format(total) : "—",
        helper: "en el período seleccionado",
        icon: Users,
        gradient: "from-sky-500/10 via-background to-background",
        iconBg: "bg-sky-500/15 text-sky-600",
        valueClass: "text-sky-700",
      },
      {
        key: "promedio",
        label: `Promedio por ${groupLabel}`,
        value: reporte ? decimalFormatter.format(promedio) : "—",
        helper: `pacientes por ${groupLabel}`,
        icon: BarChart3,
        gradient: "from-indigo-500/10 via-background to-background",
        iconBg: "bg-indigo-500/15 text-indigo-600",
        valueClass: "text-indigo-600",
      },
      {
        key: "maximo",
        label: "Mayor demanda",
        value: maximo ? numberFormatter.format(maximo.total) : "—",
        helper: maximo ? maximo.tooltipLabel : "Sin datos destacados",
        highlight: maximo ? maximo.tooltipRange : undefined,
        icon: Calendar,
        gradient: "from-amber-500/10 via-background to-background",
        iconBg: "bg-amber-500/15 text-amber-600",
        valueClass: "text-amber-600",
      },
      {
        key: "variacion",
        label: "Variación de asistidos",
        value: reporte ? `${variacion >= 0 ? "+" : ""}${variacion.toFixed(1)}%` : "—",
        helper: reporte
          ? `${diferencia >= 0 ? "+" : ""}${numberFormatter.format(diferencia)} pacientes vs. período anterior`
          : "Sin datos comparativos",
        icon: variacionStyles.icon,
        gradient: variacionStyles.gradient,
        iconBg: variacionStyles.iconBg,
        valueClass: variacionStyles.valueClass,
      },
    ]
  }, [decimalFormatter, filters.groupBy, numberFormatter, reporte])

  const handleExport = useCallback(async () => {
    if (!reporte) {
      return
    }

    setIsExporting(true)
    try {
      const params = new URLSearchParams({
        from: filters.from,
        to: filters.to,
        groupBy: filters.groupBy,
      })

      if (isProfesional && profesionalId !== null) {
        params.set("profesionalId", profesionalId.toString())
      }

      const response = await fetch(`/api/v1/reportes/paciente-por-periodo?${params.toString()}`, {
        cache: "no-store",
      })
      const payload = await response.json().catch(() => null)

      if (!response.ok || !payload) {
        throw new Error(
          payload && typeof payload === "object" && "error" in payload
            ? (payload as { error?: string }).error ?? "No se pudo obtener los datos para exportar."
            : "No se pudo obtener los datos para exportar.",
        )
      }

      const data = payload as ReportePacientesPorPeriodoResponse

      await exportarReportePacientesPorPeriodo(data, {
        agrupacionLabel: GROUP_LABELS[filters.groupBy],
        profesionalNombre: profesionalInfo
          ? `${profesionalInfo.apellido}, ${profesionalInfo.nombre}`
          : undefined,
      })
    } catch (err) {
      console.error(err)
      if (typeof window !== "undefined") {
        window.alert(
          err instanceof Error ? err.message : "Ocurrió un error inesperado al exportar el reporte.",
        )
      }
    } finally {
      setIsExporting(false)
    }
  }, [
    filters.from,
    filters.groupBy,
    filters.to,
    isProfesional,
    profesionalId,
    profesionalInfo,
    reporte,
  ])

  const chartData = useMemo<ChartDataPoint[]>(
    () =>
      (reporte?.series ?? []).map((item) => ({
        etiqueta: item.etiqueta,
        pacientes: item.valor,
        tooltipLabel: item.tooltipLabel,
        tooltipRange: item.tooltipRange,
        fechaInicio: item.fechaInicio,
        fechaFin: item.fechaFin,
      })),
    [reporte?.series],
  )

  const maximo = reporte?.resumen.maximo
  const maximoTotal =
    maximo && typeof maximo.total === "number" && Number.isFinite(maximo.total)
      ? numberFormatter.format(maximo.total)
      : null

  const detalleMensualPorAnio = useMemo(() => {
    const mapa = new Map<number, Map<number, number>>()
    for (const detalle of reporte?.detalleMensual ?? []) {
      if (typeof detalle.year !== "number" || typeof detalle.month !== "number") continue
      if (!mapa.has(detalle.year)) {
        mapa.set(detalle.year, new Map())
      }
      mapa.get(detalle.year)?.set(detalle.month, detalle.total)
    }
    return mapa
  }, [reporte?.detalleMensual])

  const availableYears = useMemo(() => {
    return Array.from(detalleMensualPorAnio.keys()).sort((a, b) => a - b)
  }, [detalleMensualPorAnio])

  useEffect(() => {
    if (availableYears.length === 0) {
      setSelectedYear(null)
      return
    }
    setSelectedYear((prev) => (prev && availableYears.includes(prev) ? prev : availableYears[availableYears.length - 1]))
  }, [availableYears])

  const monthlyRows = useMemo(() => {
    if (!selectedYear) {
      return []
    }
    const monthsMap = detalleMensualPorAnio.get(selectedYear)
    return Array.from({ length: 12 }, (_, index) => {
      const monthNumber = index + 1
      const total = monthsMap?.get(monthNumber) ?? 0
      const label = capitalize(
        format(new Date(selectedYear, index, 1), "MMMM yyyy", {
          locale: es,
        }),
      )
      return {
        key: `${selectedYear}-${monthNumber}`,
        label,
        total,
      }
    })
  }, [detalleMensualPorAnio, selectedYear])

  const handlePrevYear = useCallback(() => {
    if (!selectedYear) return
    const index = availableYears.indexOf(selectedYear)
    if (index > 0) {
      setSelectedYear(availableYears[index - 1])
    }
  }, [availableYears, selectedYear])

  const handleNextYear = useCallback(() => {
    if (!selectedYear) return
    const index = availableYears.indexOf(selectedYear)
    if (index >= 0 && index < availableYears.length - 1) {
      setSelectedYear(availableYears[index + 1])
    }
  }, [availableYears, selectedYear])

  const selectedYearIndex = selectedYear ? availableYears.indexOf(selectedYear) : -1
  const hasPrevYear = selectedYearIndex > 0
  const hasNextYear = selectedYearIndex >= 0 && selectedYearIndex < availableYears.length - 1


  const renderTooltipContent = useCallback(
    ({ active, payload }: TooltipProps<number, string>) => {
      if (!active || !payload?.length) {
        return null
      }

      const dataPoint = payload[0].payload as ChartDataPoint
      const pacientesLabel = dataPoint.pacientes === 1 ? "paciente" : "pacientes"
      const subtitle =
        filters.groupBy !== "day" ? dataPoint.tooltipRange : undefined

      return (
        <div className="rounded-md border bg-background/95 p-3 text-sm shadow-sm">
          <p className="font-semibold">
            {dataPoint.tooltipLabel ?? dataPoint.etiqueta}
          </p>
          {subtitle ? (
            <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
          ) : null}
          <p className="mt-2 font-medium">
            {numberFormatter.format(dataPoint.pacientes)} {pacientesLabel}
          </p>
        </div>
      )
    },
    [filters.groupBy, numberFormatter],
  )

  if (!user) {
    return (
      <MainLayout>
        <div className="p-6">
          <Card>
            <div className="flex h-32 items-center justify-center text-muted-foreground">
              Debes iniciar sesión para acceder a esta sección.
            </div>
          </Card>
        </div>
      </MainLayout>
    )
  }

  if (!isGerente && !isProfesional) {
    return (
      <MainLayout>
        <div className="p-6">
          <Card>
            <div className="flex h-32 flex-col items-center justify-center space-y-4 text-muted-foreground">
              <AlertCircle className="h-12 w-12" />
              <p>No tienes permisos para acceder a los reportes.</p>
              <Link href="/">
                <Button variant="outline" className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Volver al Dashboard
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="p-6">
        <div className="mx-auto max-w-7xl space-y-6">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <Link
                href="/reportes"
                className="mb-2 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4" />
                Reportes
              </Link>
              <h1 className="text-3xl font-bold text-foreground">Pacientes atendidos por período</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Visualiza la demanda de pacientes atendidos agrupada por día, semana o mes.
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="gap-2" onClick={fetchReporte} disabled={isLoading}>
                <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                Actualizar
              </Button>
              <Button
                variant="outline"
                className="gap-2"
                onClick={handleExport}
                disabled={isLoading || isExporting || !reporte}
              >
                <Download className="h-4 w-4" />
                {isExporting ? "Exportando..." : "Exportar"}
              </Button>
            </div>
          </div>

          {/* Filtros */}
          <Card className="p-4 shadow-md border border-border/40 bg-gradient-to-br from-background via-background to-indigo-50/10">
            <div className="mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              <h3 className="font-semibold">Período de análisis</h3>
            </div>
            <div className="flex flex-wrap gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-sm text-muted-foreground" htmlFor="from">
                  Desde:
                </label>
                <input
                  id="from"
                  type="date"
                  value={filters.from}
                  max={filters.to}
                  onChange={handleDateChange("from")}
                  className="rounded border px-3 py-1"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm text-muted-foreground" htmlFor="to">
                  Hasta:
                </label>
                <input
                  id="to"
                  type="date"
                  value={filters.to}
                  min={filters.from}
                  onChange={handleDateChange("to")}
                  className="rounded border px-3 py-1"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm text-muted-foreground" htmlFor="groupBy">
                  Agrupación:
                </label>
                <select
                  id="groupBy"
                  value={filters.groupBy}
                  onChange={handleGroupByChange}
                  className="rounded border px-3 py-1"
                >
                  <option value="day">Por día</option>
                  <option value="week">Por semana</option>
                  <option value="month">Por mes</option>
                </select>
              </div>
            </div>
          </Card>

          {/* Métricas principales */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {resumenCards.map((card) => {
              const Icon = card.icon
              return (
                <Card
                  key={card.key}
                  className={`relative overflow-hidden border border-border/40 bg-gradient-to-br ${card.gradient} p-6 shadow-md transition-all hover:border-primary/40 hover:shadow-lg`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground/80">
                        {card.label}
                      </p>
                      <p className={`mt-2 text-3xl font-semibold ${card.valueClass}`}>{card.value}</p>
                      {card.helper ? (
                        <p className="mt-1 text-xs text-muted-foreground">{card.helper}</p>
                      ) : null}
                      {card.highlight ? (
                        <p className="mt-2 text-xs font-medium text-foreground/80">{card.highlight}</p>
                      ) : null}
                    </div>
                    <div className={`flex h-10 w-10 items-center justify-center rounded-full ${card.iconBg}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>

          {/* Evolución por período */}
          <Card className="p-6 shadow-md border border-border/40 bg-gradient-to-br from-background via-background to-indigo-50/15">
            <div className="mb-4 flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              <h2 className="text-xl font-bold text-foreground">
                Evolución por {GROUP_LABELS[filters.groupBy].toLowerCase()}
              </h2>
            </div>
            <p className="mb-6 text-sm text-muted-foreground">
              Cantidad de pacientes atendidos agrupados según la selección actual.
            </p>

            {chartData.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No se encontraron datos en el período seleccionado.
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={360}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="etiqueta" />
                  <YAxis />
                  <Tooltip content={renderTooltipContent} />
                  <Legend />
                  <Bar dataKey="pacientes" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Card>

          {/* Detalle mensual */}
          <Card className="p-6 shadow-md border border-border/40 bg-gradient-to-br from-background via-background to-indigo-50/15">
            <h2 className="mb-4 text-xl font-bold text-foreground">Detalle mensual</h2>
            <p className="mb-6 text-sm text-muted-foreground">
              Total de pacientes atendidos por mes dentro del período.
            </p>

            {isLoading && !reporte ? (
              <div className="flex items-center justify-center py-12 text-muted-foreground">
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Cargando datos...
              </div>
            ) : monthlyRows.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No se registran datos para el rango seleccionado.
              </p>
            ) : (
              <>
                <div className="overflow-x-auto rounded-lg border border-border/40">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/30 text-left text-muted-foreground">
                        <th className="p-3 font-semibold uppercase tracking-wide text-xs">Mes</th>
                        <th className="p-3 font-semibold uppercase tracking-wide text-xs">
                          Pacientes atendidos
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {monthlyRows.map((detalle) => (
                        <tr
                          key={detalle.key}
                          className="border-b last:border-b-0 hover:bg-muted/30"
                        >
                          <td className="p-3 capitalize">{detalle.label}</td>
                          <td className="p-3 font-medium">
                            {numberFormatter.format(detalle.total)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {selectedYear ? (
                  <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
                    <span>Año {selectedYear}</span>
                    {availableYears.length > 1 ? (
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handlePrevYear}
                          disabled={!hasPrevYear || isLoading}
                        >
                          Anterior
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleNextYear}
                          disabled={!hasNextYear || isLoading}
                        >
                          Siguiente
                        </Button>
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </>
            )}
          </Card>

          {/* Especialidades destacadas */}
          <Card className="p-6 shadow-md border border-border/40 bg-gradient-to-br from-background via-background to-indigo-50/15">
            <div className="mb-4 flex items-center gap-2">
              <Users className="h-5 w-5" />
              <h2 className="text-xl font-bold text-foreground">Especialidades más demandadas</h2>
            </div>
            <p className="mb-6 text-sm text-muted-foreground">
              Distribución de pacientes atendidos según la especialidad del profesional.
            </p>

            {(reporte?.especialidades.length ?? 0) === 0 ? (
              <p className="text-sm text-muted-foreground">No hay datos disponibles.</p>
            ) : (
              <div className="space-y-4">
                {reporte?.especialidades.slice(0, 6).map((especialidad) => (
                  <div
                    key={especialidad.especialidad}
                    className="rounded-xl border border-border/40 bg-card/70 p-4 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
                    style={{ borderLeftColor: "rgb(79 70 229)", borderLeftWidth: "4px" }}
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-foreground">{especialidad.especialidad}</p>
                        <p className="text-xs text-muted-foreground">
                          {especialidad.porcentaje.toFixed(1)}% del total
                        </p>
                      </div>
                      <p className="text-xl font-bold text-foreground">
                        {numberFormatter.format(especialidad.total)}
                      </p>
                    </div>
                    <div className="h-3 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-500 via-sky-500 to-cyan-400"
                        style={{ width: `${Math.min(100, especialidad.porcentaje)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {error ? (
            <Card className="border-destructive/50 bg-destructive/10">
              <div className="flex items-center gap-3 p-4 text-sm text-destructive">
                <AlertCircle className="h-5 w-5" />
                <span>{error}</span>
              </div>
            </Card>
          ) : null}
        </div>
      </div>
    </MainLayout>
  )
}
