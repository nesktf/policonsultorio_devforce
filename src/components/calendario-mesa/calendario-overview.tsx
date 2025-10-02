"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react"

interface CalendarioOverviewProps {
  selectedDate: Date
  onDateSelect: (date: Date) => void
  onViewDay: () => void
}

export function CalendarioOverview({ selectedDate, onDateSelect, onViewDay }: CalendarioOverviewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date(selectedDate))
  const [turnosPorDia, setTurnosPorDia] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchEstadisticas() {
      try {
        setLoading(true)
        
        const year = currentMonth.getFullYear()
        const month = currentMonth.getMonth()
        
        const from = new Date(year, month, 1).toISOString().split('T')[0]
        const to = new Date(year, month + 1, 0).toISOString().split('T')[0]
        
        const response = await fetch(`/api/v1/calendario-mesa/estadisticas?from=${from}&to=${to}`)
        
        if (!response.ok) {
          throw new Error("Error al cargar estadísticas")
        }
        
        const data = await response.json()
        setTurnosPorDia(data.estadisticas)
      } catch (error) {
        console.error("Error:", error)
        setTurnosPorDia({})
      } finally {
        setLoading(false)
      }
    }
    
    fetchEstadisticas()
  }, [currentMonth])

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    return { daysInMonth, startingDayOfWeek, year, month }
  }

  const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentMonth)

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
  }

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
  }

  const handleDayClick = (day: number) => {
    const newDate = new Date(year, month, day)
    onDateSelect(newDate)
    onViewDay()
  }

  const getTurnosDelDia = (day: number) => {
    const dateKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
    return turnosPorDia[dateKey] || null
  }

  const isToday = (day: number) => {
    const today = new Date()
    return (
      day === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear()
    )
  }

  const monthName = currentMonth.toLocaleDateString("es-AR", { month: "long", year: "numeric" })

  const days = []
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(null)
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i)
  }

  if (loading) {
    return (
      <Card className="p-12 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Cargando calendario...</p>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold capitalize">{monthName}</h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={previousMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={nextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2 mb-2">
        {["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].map((dia) => (
          <div key={dia} className="text-center text-sm font-medium text-muted-foreground p-2">
            {dia}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {days.map((day, index) => {
          if (day === null) {
            return <div key={`empty-${index}`} className="aspect-square" />
          }

          const turnos = getTurnosDelDia(day)
          const today = isToday(day)

          return (
            <button
              key={day}
              onClick={() => handleDayClick(day)}
              className={`
                aspect-square p-2 rounded-lg border-2 transition-all hover:shadow-md
                ${today ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}
                ${turnos ? "bg-blue-50" : "bg-background"}
              `}
            >
              <div className="flex flex-col items-center justify-center h-full space-y-1">
                <span className={`text-sm font-medium ${today ? "text-primary font-bold" : ""}`}>
                  {day}
                </span>
                
                {turnos && (
                  <div className="space-y-0.5 w-full">
                    <Badge variant="outline" className="text-xs px-1 py-0 w-full justify-center bg-primary/10">
                      {turnos.total} turnos
                    </Badge>
                    
                    <div className="flex gap-0.5 justify-center">
                      {turnos.programados > 0 && (
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500" title={`${turnos.programados} programados`} />
                      )}
                      {turnos.enSalaEspera > 0 && (
                        <div className="w-1.5 h-1.5 rounded-full bg-yellow-500" title={`${turnos.enSalaEspera} en sala`} />
                      )}
                      {turnos.asistidos > 0 && (
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500" title={`${turnos.asistidos} asistidos`} />
                      )}
                      {turnos.noAsistidos > 0 && (
                        <div className="w-1.5 h-1.5 rounded-full bg-orange-500" title={`${turnos.noAsistidos} no asistidos`} />
                      )}
                      {turnos.cancelados > 0 && (
                        <div className="w-1.5 h-1.5 rounded-full bg-red-500" title={`${turnos.cancelados} cancelados`} />
                      )}
                    </div>
                  </div>
                )}
              </div>
            </button>
          )
        })}
      </div>

      <div className="mt-6 pt-4 border-t">
        <div className="flex flex-wrap gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span>Programados</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <span>En Sala de Espera</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span>Asistidos</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-orange-500" />
            <span>No Asistidos</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span>Cancelados</span>
          </div>
        </div>
      </div>
    </Card>
  )
}