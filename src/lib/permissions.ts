import { Role } from "@/generated/prisma"
import type { User } from "@/context/auth-context"

// Definir el tipo de permisos primero
interface RolePermissions {
  canViewAllTurnos: boolean
  canViewOwnTurnos: boolean
  canCreateTurnos: boolean
  canEditTurnos: boolean
  canCancelTurnos: boolean
  canChangeEstadoTurno: boolean
  canViewAllPacientes: boolean
  canViewOwnPacientes: boolean
  canCreatePacientes: boolean
  canEditPacientes: boolean
  canViewPacienteDetails: boolean
  canViewHistoriasClinicas: boolean
  canViewOwnHistoriasClinicas: boolean
  canCreateHistoriasClinicas: boolean
  canEditHistoriasClinicas: boolean
  canViewDashboard: boolean
  canViewBasicReports: boolean
  canViewAdvancedReports: boolean
  canManageUsers: boolean
  canManageSettings: boolean
}

// Definición de permisos por rol usando los valores del enum de Prisma
export const ROLE_PERMISSIONS: Record<string, RolePermissions> = {
  MESA_ENTRADA: {
    // Gestión de turnos
    canViewAllTurnos: true,
    canViewOwnTurnos: false,
    canCreateTurnos: true,
    canEditTurnos: true,
    canCancelTurnos: true,
    canChangeEstadoTurno: true,

    // Gestión de pacientes
    canViewAllPacientes: true,
    canViewOwnPacientes: false,
    canCreatePacientes: true,
    canEditPacientes: true,
    canViewPacienteDetails: true,

    // Historias clínicas - RESTRINGIDO
    canViewHistoriasClinicas: false,
    canViewOwnHistoriasClinicas: false,
    canCreateHistoriasClinicas: false,
    canEditHistoriasClinicas: false,

    // Dashboard y reportes
    canViewDashboard: true,
    canViewBasicReports: true,
    canViewAdvancedReports: false,

    // Configuración
    canManageUsers: false,
    canManageSettings: false,
  },

  PROFESIONAL: {
    // Gestión de turnos - SOLO SUS PACIENTES
    canViewAllTurnos: false,
    canViewOwnTurnos: true,
    canCreateTurnos: false,
    canEditTurnos: false,
    canCancelTurnos: false,
    canChangeEstadoTurno: true,

    // Gestión de pacientes - SOLO SUS PACIENTES
    canViewAllPacientes: false,
    canViewOwnPacientes: true,
    canCreatePacientes: false,
    canEditPacientes: false,
    canViewPacienteDetails: true,

    // Historias clínicas - SOLO SUS PACIENTES
    canViewHistoriasClinicas: true,
    canViewOwnHistoriasClinicas: true,
    canCreateHistoriasClinicas: true,
    canEditHistoriasClinicas: true,

    // Dashboard y reportes
    canViewDashboard: true,
    canViewBasicReports: true,
    canViewAdvancedReports: false,

    // Configuración
    canManageUsers: false,
    canManageSettings: false,
  },

  GERENTE: {
    // Acceso completo a todo
    canViewAllTurnos: true,
    canViewOwnTurnos: true,
    canCreateTurnos: true,
    canEditTurnos: true,
    canCancelTurnos: true,
    canChangeEstadoTurno: true,

    canViewAllPacientes: true,
    canViewOwnPacientes: true,
    canCreatePacientes: true,
    canEditPacientes: true,
    canViewPacienteDetails: true,

    canViewHistoriasClinicas: false,
    canViewOwnHistoriasClinicas: false,
    canCreateHistoriasClinicas: false,
    canEditHistoriasClinicas: false,

    canViewDashboard: true,
    canViewBasicReports: true,
    canViewAdvancedReports: true,

    canManageUsers: true,
    canManageSettings: true,
  },
} as const

// Tipo para las claves de permisos
type PermissionKey = keyof RolePermissions

// Funciones helper para verificar permisos
export const hasPermission = (userRole: Role, permission: PermissionKey): boolean => {
  return ROLE_PERMISSIONS[userRole]?.[permission] || false
}

export const canAccessRoute = (userRole: Role, route: string): boolean => {
  const routePermissions: Record<string, PermissionKey> = {
    "/": "canViewDashboard",
    "/turnos": "canViewAllTurnos",
    "/mi-agenda": "canViewOwnTurnos",
    "/pacientes": "canViewAllPacientes",
    "/mis-pacientes": "canViewOwnPacientes",
    "/historias-clinicas": "canViewHistoriasClinicas",
    "/configuracion": "canManageSettings",
    "/indicadores": "canViewAdvancedReports",
  }

  const requiredPermission = routePermissions[route]
  return requiredPermission ? hasPermission(userRole, requiredPermission) : true
}

// Filtrar datos según permisos del usuario
export const filterDataByRole = <T extends { profesionalId?: string; profesionalesAsignados?: string[] }>(
  data: T[],
  user: User | null,
  type: "turnos" | "pacientes" | "historias",
): T[] => {
  if (!user) return []

  if (user.rol === "GERENTE") {
    return [] // Gerente ve todo
  }

  if (user.rol === "MESA_ENTRADA") {
    if (type === "historias") {
      return [] // Mesa de entrada no ve historias clínicas
    }
    return data // Mesa de entrada ve todos los turnos y pacientes
  }

  if (user.rol === "PROFESIONAL") {
    return data.filter((item) => {
      // Filtrar por profesional asignado o que tenga relación con el profesional
      const userId = user.id.toString()
      return item.profesionalId === userId || item.profesionalesAsignados?.includes(userId)
    })
  }

  return []
}

// Verificar si un usuario puede realizar una acción específica sobre un elemento
export const canPerformAction = (
  user: User | null,
  action: "view" | "edit" | "delete" | "create",
  resource: "turno" | "paciente" | "historia",
  resourceData?: { profesionalId?: string; profesionalesAsignados?: string[] },
): boolean => {
  if (!user) return false

  if (user.rol === "GERENTE") return true

  if (user.rol === "MESA_ENTRADA" ) {
    if (resource === "historia") return false // No puede acceder a historias clínicas
    return ["view", "edit", "create"].includes(action) // Puede gestionar turnos y pacientes
  }

  if (user.rol === "PROFESIONAL") {
    const userId = user.id.toString()
    
    if (resource === "turno") {
      if (action === "create") return false // No puede crear turnos
      // Solo puede ver/editar sus propios turnos
      return resourceData?.profesionalId === userId
    }

    if (resource === "paciente") {
      if (["edit", "create"].includes(action)) return false // No puede crear/editar pacientes
      // Solo puede ver sus pacientes
      return resourceData?.profesionalesAsignados?.includes(userId) || resourceData?.profesionalId === userId || false
    }

    if (resource === "historia") {
      // Puede gestionar historias clínicas solo de sus pacientes
      return resourceData?.profesionalId === userId || resourceData?.profesionalesAsignados?.includes(userId) || false
    }
  }

  return false
}

// Mensajes de error personalizados por rol
export const getAccessDeniedMessage = (userRole: Role, resource: string): string => {
  const messages: Record<string, Record<string, string>> = {
    MESA_ENTRADA: {
      "historias-clinicas": "Los usuarios de mesa de entrada no tienen acceso a las historias clínicas.",
      configuracion: "No tienes permisos para acceder a la configuración del sistema.",
      default: "No tienes permisos para acceder a esta sección.",
    },
    PROFESIONAL: {
      "turnos-todos": "Solo puedes ver los turnos de tus pacientes asignados.",
      "pacientes-todos": "Solo puedes ver los pacientes que tienes asignados.",
      configuracion: "No tienes permisos para acceder a la configuración del sistema.",
      default: "Solo puedes acceder a información de tus pacientes asignados.",
    },
    GERENTE: {
      default: "Error inesperado de permisos.",
    },
  }

  return messages[userRole]?.[resource] || messages[userRole]?.["default"] || "Acceso denegado."
}