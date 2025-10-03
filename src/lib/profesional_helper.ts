
/**
 * Obtiene el ID del profesional asociado a un usuario
 * @param userId - ID del usuario
 * @returns ID del profesional o null si no existe
 */
export async function getProfesionalIdByUserId(userId: number): Promise<number | null> {
  try {
    const response = await fetch(`/api/v2/profesional/by-user/${userId}`)
    
    if (!response.ok) {
      return null
    }
    
    const data = await response.json()
    return data.profesionalId || null
    
  } catch (error) {
    console.error("Error obteniendo ID de profesional:", error)
    return null
  }
}