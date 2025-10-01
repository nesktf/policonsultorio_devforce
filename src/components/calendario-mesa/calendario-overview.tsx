"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface CalendarioOverviewProps {
  selectedDate: Date
  onDateSelect: (date: Date) => void
  onViewDay: () => void
}

// Mock data - conteo de turnos por día con nuevos estados
const mockTurnosPorDia: Record<string, { 
  total: number
  programados: number
  enSalaEspera: number
  asistidos: number
  noAsistidos: number
  cancelados: number 
}> = {
  "2025-09-30": { total: 8, programados: 3, enSalaEspera: 1, asistidos: 2, noAsistidos: 1, cancelados: 1 },
  "2025-10-01": { total: 12, programados: 5, enSalaEspera: 2, asistidos: 3, noAsistidos: 1, cancelados: 1 },
  "2025-10-02": { total: 6, programados: 3, enSalaEspera: 0, asistidos: 2, noAsistidos: 0, cancelados: 1 },
  "2025-10-03": { total: 10, programados: 4, enSalaEspera: 1, asistidos: 3, noAsistidos: 1, cancelados: 1 },
  "2025-10-04": { total: 5, programados: 2, enSalaEspera: 1, asistidos: 2, noAsistidos: 0, cancelados: 0 },
}

export function CalendarioOverview({ selectedDate, onDateSelect, onViewDay }: CalendarioOverviewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date(selectedDate))

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
    return mockTurnosPorDia[dateKey] || null
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

  // Crear array de días con espacios vacíos al inicio
  const days = []
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(null)
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i)
  }

  return (
    <Card className="p-6">
      {/* Header del calendario */}
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

      {/* Días de la semana */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].map((dia) => (
          <div key={dia} className="text-center text-sm font-medium text-muted-foreground p-2">
            {dia}
          </div>
        ))}
      </div>

      {/* Grid de días */}
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

      {/* Leyenda */}
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