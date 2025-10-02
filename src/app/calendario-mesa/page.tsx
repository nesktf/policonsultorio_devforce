import CalendarioMesaClient from "@/components/calendario-mesa/calendario-mesa-client"

async function getProfesionalesYEspecialidades() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"
    const response = await fetch(`${baseUrl}/api/v1/calendario-mesa/profesionales`, {
      cache: "no-store",
    })

    if (!response.ok) {
      throw new Error("Error al cargar profesionales")
    }

    const data = await response.json()
    
    return {
      profesionales: [
        { id: "todos", nombre: "Todos los profesionales" },
        ...data.profesionales.map((prof: any) => ({
          id: prof.id.toString(),
          nombre: prof.nombre,
        })),
      ],
      especialidades: [
        { id: "todas", nombre: "Todas las especialidades" },
        ...data.especialidades.map((esp: string) => ({
          id: esp,
          nombre: esp,
        })),
      ],
    }
  } catch (error) {
    console.error("Error cargando datos:", error)
    return {
      profesionales: [{ id: "todos", nombre: "Todos los profesionales" }],
      especialidades: [{ id: "todas", nombre: "Todas las especialidades" }],
    }
  }
}

export default async function CalendarioMesaPage() {
  const { profesionales, especialidades } = await getProfesionalesYEspecialidades()

  return (
    <CalendarioMesaClient
      profesionales={profesionales}
      especialidades={especialidades}
    />
  )
}