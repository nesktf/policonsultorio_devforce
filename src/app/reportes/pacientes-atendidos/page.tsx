"use client"

import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Download,
  Loader2,
  RefreshCw,
  Ban,
  Users,
  XCircle,
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
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts"

import { MainLayout } from "@/components/layout/main-layout"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useAuth } from "@/context/auth-context"
import { exportarReportePacientesAtendidos } from "@/utils/pdfExport"

interface EspecialidadOption {
  id: string
  nombre: string
}

type GroupByOption = "day" | "week" | "month"

interface ReportePacientesAtendidosResponse {
  rango: {
    from: string
    to: string
  }
  filtros: {
    especialidad: string | null
  }
  resumen: {
    totalTurnos: number
    asistidos: number
    noAsistidos: number
    cancelados: number
    tasaAsistencia: number
    comparacionAnterior: {
      asistidosAnteriores: number
      diferencia: number
      variacion: number
    }
  }
  distribucion: Array<{
    etiqueta: string
    valor: number
    porcentaje: number
    color: string
  }>
  detalle: Array<{
    id: string
    etiqueta: string
    rango: string
    fechaInicio: string
    fechaFin: string
    total: number
    asistidos: number
    noAsistidos: number
    cancelados: number
    tasaAsistencia: number
  }>
  paginacion: {
    page: number
    pageSize: number
    totalItems: number
    totalPages: number
  }
}

const toInputDate = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`

const GROUP_LABELS: Record<GroupByOption, string> = {
  day: "Día",
  week: "Semana",
  month: "Mes",
}

const PAGE_SIZE = 12

export default function ReportePacientesAtendidos() {
  const { user } = useAuth()

  const [filters, setFilters] = useState(() => {
    const now = new Date()
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
    return {
      from: toInputDate(firstDay),
      to: toInputDate(now),
      especialidad: "all",
    }
  })
  const [especialidades, setEspecialidades] = useState<EspecialidadOption[]>([])
  const [reporte, setReporte] = useState<ReportePacientesAtendidosResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [groupBy, setGroupBy] = useState<GroupByOption>("day")
  const [page, setPage] = useState(1)
  const [isExporting, setIsExporting] = useState(false)
  const canAccessReport = !!user && (user.rol === "GERENTE" || user.rol === "MESA_ENTRADA")

  const numberFormatter = useMemo(
    () =>
      new Intl.NumberFormat("es-AR", {
        maximumFractionDigits: 0,
      }),
    [],
  )

  const ratioFormatter = useMemo(
    () =>
      new Intl.NumberFormat("es-AR", {
        style: "percent",
        maximumFractionDigits: 1,
        minimumFractionDigits: 1,
      }),
    [],
  )

  const fetchEspecialidades = useCallback(async () => {
    try {
      const response = await fetch("/api/v1/profesionales/especialidades", {
        cache: "no-store",
      })
      if (!response.ok) {
        throw new Error("No se pudieron cargar las especialidades.")
      }
      const data = (await response.json()) as Array<{ id: string; nombre: string }>
      setEspecialidades(data)
    } catch (err) {
      console.error(err)
      setEspecialidades([])
    }
  }, [])

  const fetchReporte = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      if (!canAccessReport) {
        setReporte(null)
        setIsLoading(false)
        return
      }
      const params = new URLSearchParams({
        from: filters.from,
        to: filters.to,
        groupBy,
        page: page.toString(),
        pageSize: PAGE_SIZE.toString(),
      })
      if (filters.especialidad !== "all" && filters.especialidad.trim().length > 0) {
        params.set("especialidad", filters.especialidad)
      }

      const response = await fetch(`/api/v1/reportes/pacientes-atendidos?${params.toString()}`, {
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

      const data = payload as ReportePacientesAtendidosResponse
      setReporte(data)
      if (data.paginacion?.page && data.paginacion.page !== page) {
        setPage(data.paginacion.page)
      }
    } catch (err) {
      console.error(err)
      setReporte(null)
      setError(err instanceof Error ? err.message : "Ocurrió un error inesperado.")
    } finally {
      setIsLoading(false)
    }
  }, [filters, groupBy, page, canAccessReport])

  useEffect(() => {
    if (!canAccessReport) {
      return
    }
    fetchEspecialidades()
  }, [fetchEspecialidades, canAccessReport])

  useEffect(() => {
    if (!canAccessReport) {
      return
    }
    fetchReporte()
  }, [fetchReporte, canAccessReport])

  const handleDateChange =
    (field: "from" | "to") => (event: ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value
      setPage(1)
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

  const handleEspecialidadChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setPage(1)
    setFilters((prev) => ({
      ...prev,
      especialidad: event.target.value,
    }))
  }

  const handleGroupByChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setGroupBy(event.target.value as GroupByOption)
    setPage(1)
  }

  const handleExport = useCallback(async () => {
    if (!reporte) {
      return
    }

    setIsExporting(true)
    try {
      const params = new URLSearchParams({
        from: filters.from,
        to: filters.to,
        groupBy,
        page: "1",
        pageSize: "500",
      })

      if (filters.especialidad !== "all" && filters.especialidad.trim().length > 0) {
        params.set("especialidad", filters.especialidad)
      }

      const response = await fetch(`/api/v1/reportes/pacientes-atendidos?${params.toString()}`, {
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

      const especialidadLabel =
        filters.especialidad === "all"
          ? "Todas"
          : especialidades.find((item) => item.id === filters.especialidad)?.nombre ?? "Personalizada"

      const data = payload as ReportePacientesAtendidosResponse

      await exportarReportePacientesAtendidos(data, {
        agrupacionLabel: GROUP_LABELS[groupBy],
        especialidadLabel,
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
  }, [especialidades, filters.especialidad, filters.from, filters.to, groupBy, reporte])

  const pieData = useMemo(
    () =>
      (reporte?.distribucion ?? []).map((item) => ({
        name: item.etiqueta,
        value: item.valor,
        color: item.color,
        porcentaje: item.porcentaje,
      })),
    [reporte?.distribucion],
  )

  const pieChartData = useMemo(
    () => pieData.filter((item) => item.value > 0),
    [pieData],
  )

  const renderPieLabel = useCallback(
    ({ name, percent = 0 }: { name: string; percent?: number }) =>
      `${name}: ${(percent * 100).toFixed(1)}%`,
    [],
  )

  type ResumenCard = {
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

  const resumenCards = useMemo<ResumenCard[]>(() => {
    const totalTurnosNumber = reporte?.resumen.totalTurnos ?? 0
    const asistidosNumber = reporte?.resumen.asistidos ?? 0
    const noAsistidosNumber = reporte?.resumen.noAsistidos ?? 0
    const canceladosNumber = reporte?.resumen.cancelados ?? 0
    const comparacion = reporte?.resumen.comparacionAnterior

    const porcentaje = (valor: number) => {
      if (!reporte || totalTurnosNumber === 0) {
        return "—"
      }
      return ratioFormatter.format(valor / totalTurnosNumber)
    }



    return [
      {
        key: "total",
        label: "Total de turnos",
        value: reporte ? numberFormatter.format(totalTurnosNumber) : "—",
        helper: "en el período seleccionado",
        icon: Users,
        gradient: "",
        iconBg: "bg-sky-500/15 text-sky-600",
        valueClass: "text-sky-700",
      },
      {
        key: "asistidos",
        label: "Pacientes asistidos",
        value: reporte ? numberFormatter.format(asistidosNumber) : "—",
        helper: `${porcentaje(asistidosNumber)} del total`,
        icon: CheckCircle2,
        gradient: "",
        iconBg: "bg-emerald-500/15 text-emerald-600",
        valueClass: "text-emerald-600",
      },
      {
        key: "no-asistidos",
        label: "No asistidos",
        value: reporte ? numberFormatter.format(noAsistidosNumber) : "—",
        helper: `${porcentaje(noAsistidosNumber)} del total`,
        icon: XCircle,
        gradient: "",
        iconBg: "bg-amber-500/15 text-amber-600",
        valueClass: "text-amber-600",
      },
      {
        key: "cancelados",
        label: "Turnos cancelados",
        value: reporte ? numberFormatter.format(canceladosNumber) : "—",
        helper: `${porcentaje(canceladosNumber)} del total`,
        icon: Ban,
        gradient: "",
        iconBg: "bg-rose-500/15 text-rose-600",
        valueClass: "text-rose-600",
      },
    ]
  }, [numberFormatter, ratioFormatter, reporte])

  const detalle = useMemo(() => reporte?.detalle ?? [], [reporte?.detalle])
  const currentPage = reporte?.paginacion?.page ?? page
  const totalPages = reporte?.paginacion?.totalPages ?? 1
  const canGoPrev = currentPage > 1
  const canGoNext = currentPage < totalPages

  const handlePrevPage = () => {
    if (canGoPrev) {
      setPage((prev) => Math.max(1, prev - 1))
    }
  }

  const handleNextPage = () => {
    if (canGoNext) {
      setPage((prev) => prev + 1)
    }
  }

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

  if (!canAccessReport) {
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
              <h1 className="text-3xl font-bold text-foreground">Reporte de Pacientes Atendidos</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Seguimiento de asistencia de pacientes y desempeño de las consultas médicas.
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
          <Card className="p-4 shadow-md border border-border/40 bg-gradient-to-br from-background via-background to-primary/5">
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
                <label className="text-sm text-muted-foreground" htmlFor="especialidad">
                  Especialidad:
                </label>
                <select
                  id="especialidad"
                  value={filters.especialidad}
                  onChange={handleEspecialidadChange}
                  className="rounded border px-3 py-1"
                >
                  <option value="all">Todas</option>
                  {especialidades.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.nombre}
                    </option>
                  ))}
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

          {/* Distribución de asistencia */}
          <Card className="p-6 shadow-md border border-border/40 bg-gradient-to-br from-background via-background to-primary/5">
            <div className="mb-4 flex items-center gap-2">
              <Users className="h-5 w-5" />
              <h2 className="text-xl font-bold text-foreground">Distribución de asistencia</h2>
            </div>
            <p className="mb-6 text-sm text-muted-foreground">
              Relación de turnos asistidos, no asistidos y cancelados en el período seleccionado.
            </p>

            {pieChartData.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No se registraron turnos en el período seleccionado.
              </p>
            ) : (
              <div className="flex flex-col items-center gap-8 lg:flex-row">
                <div className="w-full lg:w-1/2">
                  <ResponsiveContainer width="100%" height={320}>
                    <PieChart margin={{ top: 10 }}>
                      <Pie
                        data={pieChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={110}
                        paddingAngle={4}
                        dataKey="value"
                        label={renderPieLabel}
                        labelLine={false}
                        animationDuration={600}
                      >
                        {pieChartData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={entry.color}
                            stroke="#ffffff"
                            strokeWidth={2}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: number, name: string) => [
                          numberFormatter.format(value),
                          name,
                        ]}
                        wrapperStyle={{ zIndex: 10 }}
                        contentStyle={{
                          backgroundColor: "rgba(15, 23, 42, 0.95)",
                          borderRadius: 12,
                          border: "none",
                          color: "#F8FAFC",
                          boxShadow: "0 10px 25px rgba(15, 23, 42, 0.25)",
                        }}
                      />
                      <Legend
                        verticalAlign="bottom"
                        align="center"
                        iconType="circle"
                        wrapperStyle={{ paddingTop: 12 }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="grid w-full gap-4 lg:w-1/2">
                  {pieData.map((item) => (
                    <div
                      key={item.name}
                      className="rounded-xl border border-border/40 bg-card/70 p-4 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
                      style={{ borderLeftColor: item.color, borderLeftWidth: "4px" }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className="h-4 w-4 rounded-full"
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="font-semibold">{item.name}</span>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-foreground">
                            {numberFormatter.format(item.value)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {item.porcentaje.toFixed(1)}% del total
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>

          {/* Tabla de detalle */}
          <Card className="p-6 shadow-md border border-border/40 bg-gradient-to-br from-background via-background to-primary/5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-foreground">Detalle de asistencia</h2>
                <p className="text-sm text-muted-foreground">
                  Desglose agrupado por {GROUP_LABELS[groupBy].toLowerCase()} dentro del rango seleccionado.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <label htmlFor="groupByDetail" className="text-sm text-muted-foreground">
                  Agrupación:
                </label>
                <select
                  id="groupByDetail"
                  value={groupBy}
                  onChange={handleGroupByChange}
                  className="rounded border px-3 py-1 text-sm"
                >
                  <option value="day">Diaria</option>
                  <option value="week">Semanal</option>
                  <option value="month">Mensual</option>
                </select>
              </div>
            </div>

            {isLoading && !reporte ? (
              <div className="flex items-center justify-center py-12 text-muted-foreground">
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Cargando datos...
              </div>
            ) : detalle.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No se registran datos para el rango seleccionado.
              </p>
            ) : (
              <>
                <div className="overflow-x-auto rounded-lg border border-border/40">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/30 text-left text-muted-foreground">
                        <th className="p-3 font-semibold uppercase tracking-wide text-xs">Período</th>
                        <th className="p-3 font-semibold uppercase tracking-wide text-xs">Turnos</th>
                        <th className="p-3 font-semibold uppercase tracking-wide text-xs">Asistidos</th>
                        <th className="p-3 font-semibold uppercase tracking-wide text-xs">No asistidos</th>
                        <th className="p-3 font-semibold uppercase tracking-wide text-xs">Cancelados</th>
                        <th className="p-3 font-semibold uppercase tracking-wide text-xs">Tasa asistencia</th>
                      </tr>
                    </thead>
                    <tbody>
                      {detalle.map((item) => (
                        <tr key={item.id} className="border-b last:border-b-0 hover:bg-muted/30">
                          <td className="p-3">
                            <div className="font-semibold capitalize text-foreground">{item.etiqueta}</div>
                            <div className="text-xs capitalize text-muted-foreground">{item.rango}</div>
                          </td>
                          <td className="p-3 font-medium">
                            {numberFormatter.format(item.total)}
                          </td>
                          <td className="p-3 text-green-600">
                            {numberFormatter.format(item.asistidos)}
                          </td>
                          <td className="p-3 text-orange-600">
                            {numberFormatter.format(item.noAsistidos)}
                          </td>
                          <td className="p-3 text-red-600">
                            {numberFormatter.format(item.cancelados)}
                          </td>
                          <td className="p-3">
                            {ratioFormatter.format(item.tasaAsistencia)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
                  <span>
                    Página {currentPage} de {totalPages}
                  </span>
                  {totalPages > 1 ? (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handlePrevPage}
                        disabled={!canGoPrev || isLoading}
                      >
                        Anterior
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleNextPage}
                        disabled={!canGoNext || isLoading}
                      >
                        Siguiente
                      </Button>
                    </div>
                  ) : null}
                </div>
              </>
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
