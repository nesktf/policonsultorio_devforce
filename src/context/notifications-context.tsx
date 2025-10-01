"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useAuth } from "./auth-context"

export interface Notification {
  id: string
  type: "patient-waiting" | "appointment-reminder" | "system" | "urgent"
  title: string
  message: string
  timestamp: Date
  read: boolean
  fromUser?: string
  toUser?: string
  patientName?: string
  appointmentTime?: string
}

interface NotificationsContextType {
  notifications: Notification[]
  unreadCount: number
  addNotification: (notification: Omit<Notification, "id" | "timestamp" | "read">) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  notifyPatientInWaitingRoom: (patientName: string, professionalId: string, appointmentTime: string) => void
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined)

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const { user } = useAuth()

  const addNotification = (notification: Omit<Notification, "id" | "timestamp" | "read">) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date(),
      read: false,
    }

    setNotifications((prev) => [newNotification, ...prev])

    // Auto-remove system notifications after 10 seconds
    if (notification.type === "system") {
      setTimeout(() => {
        setNotifications((prev) => prev.filter((n) => n.id !== newNotification.id))
      }, 10000)
    }
  }

  const markAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  const notifyPatientInWaitingRoom = (patientName: string, professionalId: string, appointmentTime: string) => {
    // This would typically send to a specific professional
    // For demo purposes, we'll show it to all professionals
    if (user?.role === "profesional" || user?.role === "gerente") {
      addNotification({
        type: "patient-waiting",
        title: "Paciente en Sala de Espera",
        message: `${patientName} está esperando para su cita de las ${appointmentTime}`,
        patientName,
        appointmentTime,
        fromUser: "Mesa de Entrada",
      })
    }
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  // Simulate real-time notifications for demo
  useEffect(() => {
    if (!user) return

    const interval = setInterval(() => {
      // Random notifications for demo purposes
      if (Math.random() > 0.95) {
        const demoNotifications = [
          {
            type: "appointment-reminder" as const,
            title: "Recordatorio de cita",
            message: "Próxima cita en 15 minutos con Juan Pérez",
          },
          {
            type: "system" as const,
            title: "Sistema actualizado",
            message: "El sistema se ha actualizado correctamente",
          },
        ]

        const randomNotification = demoNotifications[Math.floor(Math.random() * demoNotifications.length)]
        addNotification(randomNotification)
      }
    }, 30000) // Check every 30 seconds

    return () => clearInterval(interval)
  }, [user])

  return (
    <NotificationsContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        notifyPatientInWaitingRoom,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationsContext)
  if (context === undefined) {
    throw new Error("useNotifications must be used within a NotificationsProvider")
  }
  return context
}
