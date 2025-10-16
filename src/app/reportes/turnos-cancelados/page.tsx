"use client"

import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  Calendar,
  Download,
  Loader2,
  RefreshCw,
  TrendingDown,
  TrendingUp,
  XCircle,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import Link from "next/link"
import { ChangeEvent, useCallback, useEffect, useMemo, useState } from "react"
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

import { MainLayout } from "@/components/layout/main-layout"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useAuth } from "@/context/auth-context"
import { exportarReporteTurnosCancelados } from "@/utils/pdfExport"

interface EspecialidadOption {
  id: string
  nombre: string
}

interface ReporteTurnosCanceladosResponse {
  rango: {
    from: string
    to: string
  }
  filtros: {
    especialidad: string | null
  }
  resumen: {
    total: number
    totalTurnos: number
    tasa: number
    comparacionAnterior: {
      totalAnterior: number
      diferencia: number
      variacion: number
    }
    promedioMensualUltimosSeisMeses: number
    cancelacionesPorOrigen: Array<{
      origen: string
      etiqueta: string
      total: number
      porcentaje: number
    }>
  }
  cancelaciones: {
    page: number
    pageSize: number
    total: number
    items: Array<{
      id: number
      fecha: string
      solicitadoPor: string
      solicitadoPorEtiqueta: string
      canceladoPor: {
        id: number
        nombre: string
        rol: string
      } | null
      turno: {
        id: number
        fecha: string
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
    }>
  }
}

const toInputDate = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`

export default function ReporteTurnosCancelados() {
  const { user } = useAuth()
  const canAccessReport = user?.rol === "GERENTE" || user?.rol === "MESA_ENTRADA"

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
  const [reporte, setReporte] = useState<ReporteTurnosCanceladosResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [isExporting, setIsExporting] = useState(false)
  const pageSize = 10

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

  const dateTimeFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat("es-AR", {
        dateStyle: "medium",
        timeStyle: "short",
      }),
    [],
  )

  const fetchEspecialidades = useCallback(async () => {
    if (!canAccessReport) {
      setEspecialidades([])
      return
    }
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
  }, [canAccessReport])

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
        page: page.toString(),
        pageSize: pageSize.toString(),
      })
      if (filters.especialidad !== "all" && filters.especialidad.trim().length > 0) {
        params.set("especialidad", filters.especialidad)
      }

      const response = await fetch(`/api/v1/reportes/turnos-cancelados?${params.toString()}`, {
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

      setReporte(payload as ReporteTurnosCanceladosResponse)
    } catch (err) {
      console.error(err)
      setReporte(null)
      setError(err instanceof Error ? err.message : "Ocurrió un error inesperado.")
    } finally {
      setIsLoading(false)
    }
  }, [filters, page, canAccessReport])

  useEffect(() => {
    if (!canAccessReport) return
    fetchEspecialidades()
  }, [fetchEspecialidades, canAccessReport])

  useEffect(() => {
    if (!canAccessReport) return
    fetchReporte()
  }, [fetchReporte, canAccessReport])

  const handleDateChange =
    (field: "from" | "to") => (event: ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value
      setFilters((prev) => {
        if (field === "from" && value > prev.to) {
          setPage(1)
          return { ...prev, from: value, to: value }
        }
        if (field === "to" && value < prev.from) {
          setPage(1)
          return { ...prev, from: value, to: value }
        }
        setPage(1)
        return { ...prev, [field]: value }
      })
    }

  const handleEspecialidadChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setFilters((prev) => ({
      ...prev,
      especialidad: event.target.value,
    }))
    setPage(1)
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
    const totalCancelados = reporte?.resumen.total ?? 0
    const totalTurnos = reporte?.resumen.totalTurnos ?? 0
    const tasa = reporte?.resumen.tasa ?? 0
    const promedioMensual = reporte?.resumen.promedioMensualUltimosSeisMeses ?? 0
    const comparacion = reporte?.resumen.comparacionAnterior
    const variacion = comparacion?.variacion ?? 0
    const diferencia = comparacion?.diferencia ?? 0
    const variacionPositiva = variacion >= 0

    const variacionStyles = variacionPositiva
      ? {
          gradient: "from-rose-500/10 via-background to-background",
          iconBg: "bg-rose-500/15 text-rose-600",
          valueClass: "text-rose-600",
          icon: TrendingUp,
        }
      : {
          gradient: "from-emerald-500/10 via-background to-background",
          iconBg: "bg-emerald-500/15 text-emerald-600",
          valueClass: "text-emerald-600",
          icon: TrendingDown,
        }

    return [
      {
        key: "total",
        label: "Total cancelados",
        value: reporte ? numberFormatter.format(totalCancelados) : "—",
        helper: reporte
          ? `Sobre ${numberFormatter.format(totalTurnos)} turnos`
          : "Sin datos en el período",
        icon: XCircle,
        gradient: "from-rose-500/10 via-background to-background",
        iconBg: "bg-rose-500/15 text-rose-600",
        valueClass: "text-rose-600",
      },
      {
        key: "tasa",
        label: "Tasa de cancelación",
        value: reporte ? ratioFormatter.format(tasa) : "—",
        helper: "del total de turnos",
        icon: TrendingDown,
        gradient: "from-amber-500/10 via-background to-background",
        iconBg: "bg-amber-500/15 text-amber-600",
        valueClass: "text-amber-600",
      },
      {
        key: "promedio",
        label: "Promedio mensual",
        value: reporte ? promedioMensual.toFixed(1) : "—",
        helper: "últimos 6 meses",
        icon: Calendar,
        gradient: "from-sky-500/10 via-background to-background",
        iconBg: "bg-sky-500/15 text-sky-600",
        valueClass: "text-sky-700",
      },
      {
        key: "variacion",
        label: "Variación vs. período anterior",
        value: reporte ? `${variacion >= 0 ? "+" : ""}${variacion.toFixed(1)}%` : "—",
        helper: reporte
          ? `${diferencia >= 0 ? "+" : ""}${numberFormatter.format(diferencia)} cancelaciones`
          : "Sin datos comparativos",
        icon: variacionStyles.icon,
        gradient: variacionStyles.gradient,
        iconBg: variacionStyles.iconBg,
        valueClass: variacionStyles.valueClass,
      },
    ]
  }, [numberFormatter, ratioFormatter, reporte])

  const handleExport = useCallback(async () => {
    if (!reporte) {
      return
    }

    setIsExporting(true)
    try {
      const totalCancelaciones = reporte.cancelaciones.total ?? 0
      const exportPageSize = Math.min(Math.max(totalCancelaciones, 100), 1000)

      const params = new URLSearchParams({
        from: filters.from,
        to: filters.to,
        page: "1",
        pageSize: exportPageSize.toString(),
      })

      if (filters.especialidad !== "all" && filters.especialidad.trim().length > 0) {
        params.set("especialidad", filters.especialidad)
      }

      const response = await fetch(`/api/v1/reportes/turnos-cancelados?${params.toString()}`, {
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

      const data = payload as ReporteTurnosCanceladosResponse

      const especialidadLabel =
        filters.especialidad === "all"
          ? "Todas"
          : especialidades.find((item) => item.id === filters.especialidad)?.nombre ?? "Personalizada"

      await exportarReporteTurnosCancelados(data, {
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
  }, [especialidades, filters.especialidad, filters.from, filters.to, reporte])

  const origenes = reporte?.resumen.cancelacionesPorOrigen ?? []
  const origenPrincipal = origenes[0]
  const variation = reporte?.resumen.comparacionAnterior.variacion ?? 0
  const variationDifference = reporte?.resumen.comparacionAnterior.diferencia ?? 0
  const variationColor = !reporte
    ? "text-muted-foreground"
    : variation > 0
      ? "text-red-600"
      : variation < 0
        ? "text-emerald-600"
        : "text-muted-foreground"
  const VariationIcon =
    variation > 0 ? TrendingUp : variation < 0 ? TrendingDown : null

  const origenesChartData = origenes.map((item) => ({
    name: item.etiqueta,
    value: item.total,
    porcentaje: item.porcentaje,
  }))

const totalPages = reporte
  ? Math.max(1, Math.ceil(reporte.cancelaciones.total / reporte.cancelaciones.pageSize))
  : 1

const handlePrevPage = () => setPage((prev) => Math.max(1, prev - 1))
const handleNextPage = () => setPage((prev) => Math.min(totalPages, prev + 1))

useEffect(() => {
  if (!reporte) return
  const paginas = Math.max(1, Math.ceil(reporte.cancelaciones.total / reporte.cancelaciones.pageSize))
  if (page > paginas) {
    setPage(paginas)
  }
}, [reporte, page])

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
              <h1 className="text-3xl font-bold text-foreground">Reporte de Turnos Cancelados</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Analiza la tasa de cancelación y las especialidades más afectadas en el período seleccionado.
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
          <Card className="p-4 shadow-md border border-border/40 bg-gradient-to-br from-background via-background to-rose-50/20">
            <div className="mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              <h3 className="font-semibold">Período de Análisis</h3>
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

          {/* Análisis destacado */}
          <Card className="border border-rose-200/70 bg-gradient-to-r from-rose-50 via-background to-background p-4 shadow-md">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 text-red-600" />
              <div>
                <h3 className="font-semibold text-red-900">Análisis de Cancelaciones</h3>
                <p className="mt-1 text-sm text-red-800">
                  {!reporte
                    ? "Selecciona un período para ver el detalle."
                    : reporte.resumen.total === 0
                      ? "No se registraron cancelaciones en los filtros actuales."
                      : (
                        <>
                          Se registraron{" "}
                          <span className="font-bold">
                            {numberFormatter.format(reporte.resumen.total)} cancelaciones
                          </span>{" "}
                          ({ratioFormatter.format(reporte.resumen.tasa)}) en el período analizado.
                          {origenPrincipal ? (
                            <>
                              {" "}
                              La mayoría fueron solicitadas por{" "}
                              <span className="font-bold">{origenPrincipal.etiqueta}</span> (
                              {origenPrincipal.porcentaje.toFixed(1)}%).
                            </>
                          ) : null}
                        </>
                      )}
                </p>
              </div>
            </div>
          </Card>

          {/* Cancelaciones por origen */}
          <Card className="p-6 shadow-md border border-border/40 bg-gradient-to-br from-background via-background to-rose-50/10">
            <div className="mb-4 flex items-center gap-2">
              <XCircle className="h-5 w-5" />
              <h2 className="text-xl font-bold text-foreground">Cancelaciones por solicitante</h2>
            </div>
            <p className="mb-6 text-sm text-muted-foreground">
              Distribución según quién solicitó la cancelación del turno.
            </p>

            {origenesChartData.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No se registraron cancelaciones en el período seleccionado.
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={origenesChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} interval={0} angle={-20} textAnchor="end" height={70} />
                  <YAxis />
                  <Tooltip
                    formatter={(value: number, name: string, entry) => [
                      numberFormatter.format(value as number),
                      entry?.payload?.porcentaje
                        ? `${name} (${(entry.payload.porcentaje as number).toFixed(1)}%)`
                        : name,
                    ]}
                  />
                  <Bar dataKey="value" fill="#ef4444" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Card>

          {/* Tabla detallada */}
          <Card className="p-6 shadow-md border border-border/40 bg-gradient-to-br from-background via-background to-rose-50/10">
            <h2 className="mb-4 text-xl font-bold text-foreground">Registro Detallado de Cancelaciones</h2>
            <p className="mb-6 text-sm text-muted-foreground">
              Historial de cancelaciones registradas dentro del período y filtros seleccionados.
            </p>

            {isLoading && !reporte ? (
              <div className="flex items-center justify-center py-12 text-muted-foreground">
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Cargando datos...
              </div>
            ) : reporte && reporte.cancelaciones.items.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No se registraron cancelaciones en el período seleccionado.
              </p>
            ) : (
              <>
                <div className="overflow-x-auto rounded-lg border border-border/40">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/30 text-left text-muted-foreground">
                        <th className="p-3 font-semibold uppercase tracking-wide text-xs">Fecha</th>
                        <th className="p-3 font-semibold uppercase tracking-wide text-xs">Paciente</th>
                        <th className="p-3 font-semibold uppercase tracking-wide text-xs">Profesional</th>
                        <th className="p-3 font-semibold uppercase tracking-wide text-xs">Especialidad</th>
                        <th className="p-3 font-semibold uppercase tracking-wide text-xs">Solicitado por</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reporte?.cancelaciones.items.map((log) => (
                        <tr key={log.id} className="border-b last:border-b-0 hover:bg-muted/30">
                          <td className="p-3">
                            {dateTimeFormatter.format(new Date(log.fecha))}
                          </td>
                          <td className="p-3 font-medium">
                            {log.turno.paciente.apellido}, {log.turno.paciente.nombre}
                          </td>
                          <td className="p-3">
                            {log.turno.profesional.apellido}, {log.turno.profesional.nombre}
                          </td>
                          <td className="p-3">
                            {log.turno.profesional.especialidad ?? "Sin especialidad"}
                          </td>
                          <td className="p-3">{log.solicitadoPorEtiqueta}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
                  <span>
                    Página {page} de {totalPages}
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePrevPage}
                      disabled={page === 1 || isLoading}
                    >
                      Anterior
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleNextPage}
                      disabled={page === totalPages || isLoading}
                    >
                      Siguiente
                    </Button>
                  </div>
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
