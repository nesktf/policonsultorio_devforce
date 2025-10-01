import type { UserRole, User } from "@/context/auth-context"

// Definición de permisos por rol
export const ROLE_PERMISSIONS = {
  "mesa-entrada": {
    // Gestión de turnos
    canViewAllTurnos: true,
    canViewOwnTurnos: false, // Agregado para consistencia de tipos - mesa de entrada ve todos los turnos
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
    canViewOwnHistoriasClinicas: false, // Agregado para consistencia de tipos
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

  profesional: {
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

  gerente: {
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

    canViewHistoriasClinicas: true,
    canViewOwnHistoriasClinicas: true,
    canCreateHistoriasClinicas: true,
    canEditHistoriasClinicas: true,

    canViewDashboard: true,
    canViewBasicReports: true,
    canViewAdvancedReports: true,

    canManageUsers: true,
    canManageSettings: true,
  },
} as const

// Funciones helper para verificar permisos
export const hasPermission = (userRole: UserRole, permission: keyof (typeof ROLE_PERMISSIONS)[UserRole]): boolean => {
  return ROLE_PERMISSIONS[userRole]?.[permission] || false
}

export const canAccessRoute = (userRole: UserRole, route: string): boolean => {
  const routePermissions: Record<string, keyof (typeof ROLE_PERMISSIONS)[UserRole]> = {
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

  if (user.role === "gerente") {
    return data // Gerente ve todo
  }

  if (user.role === "mesa-entrada") {
    if (type === "historias") {
      return [] // Mesa de entrada no ve historias clínicas
    }
    return data // Mesa de entrada ve todos los turnos y pacientes
  }

  if (user.role === "profesional") {
    return data.filter((item) => {
      // Filtrar por profesional asignado o que tenga relación con el profesional
      return item.profesionalId === user.id || item.profesionalesAsignados?.includes(user.id)
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

  if (user.role === "gerente") return true

  if (user.role === "mesa-entrada") {
    if (resource === "historia") return false // No puede acceder a historias clínicas
    return ["view", "edit", "create"].includes(action) // Puede gestionar turnos y pacientes
  }

  if (user.role === "profesional") {
    if (resource === "turno") {
      if (action === "create") return false // No puede crear turnos
      // Solo puede ver/editar sus propios turnos
      return resourceData?.profesionalId === user.id
    }

    if (resource === "paciente") {
      if (["edit", "create"].includes(action)) return false // No puede crear/editar pacientes
      // Solo puede ver sus pacientes
      return resourceData?.profesionalesAsignados?.includes(user.id) || resourceData?.profesionalId === user.id || false
    }

    if (resource === "historia") {
      // Puede gestionar historias clínicas solo de sus pacientes
      return resourceData?.profesionalId === user.id || resourceData?.profesionalesAsignados?.includes(user.id) || false
    }
  }

  return false
}

// Mensajes de error personalizados por rol
export const getAccessDeniedMessage = (userRole: UserRole, resource: string): string => {
  const messages: Record<UserRole, Record<string, string>> = {
    "mesa-entrada": {
      "historias-clinicas": "Los usuarios de mesa de entrada no tienen acceso a las historias clínicas.",
      configuracion: "No tienes permisos para acceder a la configuración del sistema.",
      default: "No tienes permisos para acceder a esta sección.",
    },
    profesional: {
      "turnos-todos": "Solo puedes ver los turnos de tus pacientes asignados.",
      "pacientes-todos": "Solo puedes ver los pacientes que tienes asignados.",
      configuracion: "No tienes permisos para acceder a la configuración del sistema.",
      default: "Solo puedes acceder a información de tus pacientes asignados.",
    },
    gerente: {
      default: "Error inesperado de permisos.",
    },
  }

  return messages[userRole]?.[resource] || messages[userRole]?.["default"] || "Acceso denegado."
}
