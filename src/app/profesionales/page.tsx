// app/profesionales/page.tsx
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/context/auth-context"
import { Users, Search, Plus, Eye, Edit, Phone, Briefcase, Filter, AlertCircle, Loader2, Stethoscope, Calendar } from "lucide-react"
import { RegistrarProfesionalModal } from "@/components/profesionales/registrar-profesional-modal"
import { VerProfesionalDialog } from "@/components/profesionales/ver-profesional-dialog"

interface ObraSocial {
  id: number
  nombre: string
}

interface Profesional {
  id: number
  nombre: string
  apellido: string
  dni: string
  especialidad: string
  telefono: string
  direccion: string
  obras_sociales?: Array<{
    id_obra_social: number
    obra_social: ObraSocial
  }>
  _count?: {
    turnos: number
    historias: number
  }
}

export default function ProfesionalesPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [profesionales, setProfesionales] = useState<Profesional[]>([])
  const [obrasSociales, setObrasSociales] = useState<ObraSocial[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filtroEspecialidad, setFiltroEspecialidad] = useState("")
  const [filtroObraSocial, setFiltroObraSocial] = useState("0")
  const [showRegistrarModal, setShowRegistrarModal] = useState(false)
  const [showVerDialog, setShowVerDialog] = useState(false)
  const [profesionalSeleccionado, setProfesionalSeleccionado] = useState<Profesional | null>(null)

  // Cargar profesionales y obras sociales desde la API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        // Cargar profesionales
        const profResponse = await fetch('/api/v1/profesionales')
        if (!profResponse.ok) {
          throw new Error('Error al cargar profesionales')
        }
        const profesionalesData = await profResponse.json()
        setProfesionales(profesionalesData)

        // Cargar obras sociales activas
        const osResponse = await fetch('/api/v1/obra_social?state_id=1')
        if (osResponse.ok) {
          const osData = await osResponse.json()
          setObrasSociales(osData.obras_sociales)
        }
      } catch (error) {
        console.error('Error al cargar datos:', error)
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchData()
    }
  }, [user])

  if (!user) {
    return (
      <MainLayout>
        <div className="p-6">
          <Card>
            <CardContent className="flex items-center justify-center h-32">
              <p className="text-muted-foreground">Debes iniciar sesión para acceder a esta sección.</p>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    )
  }

  // Solo el gerente puede ver profesionales
  const canViewProfesionales = user.rol === "GERENTE"

  if (!canViewProfesionales) {
    return (
      <MainLayout>
        <div className="p-6">
          <Card>
            <CardContent className="flex flex-col items-center justify-center h-32 space-y-4">
              <AlertCircle className="h-12 w-12 text-muted-foreground" />
              <p className="text-muted-foreground text-center">No tienes permisos para ver esta sección.</p>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    )
  }

  // Obtener especialidades únicas
  const especialidadesUnicas = Array.from(new Set(profesionales.map(p => p.especialidad))).sort()

  // Filtrar profesionales
  const profesionalesFiltrados = profesionales.filter((profesional) => {
    const matchesSearch =
      profesional.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      profesional.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
      profesional.dni.includes(searchTerm) ||
      `${profesional.nombre} ${profesional.apellido}`.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesEspecialidad = 
      filtroEspecialidad === "" || 
      profesional.especialidad.toLowerCase() === filtroEspecialidad.toLowerCase()

    const matchesObraSocial = 
      filtroObraSocial === "0" || 
      profesional.obras_sociales?.some(os => os.id_obra_social === parseInt(filtroObraSocial))

    return matchesSearch && matchesEspecialidad && matchesObraSocial
  })

  const profesionalesOrdenados = profesionalesFiltrados.sort((a, b) => 
    a.apellido.localeCompare(b.apellido)
  )

  const handleVerProfesional = (profesional: Profesional) => {
    console.log("handleVerProfesional llamado", profesional)
    setProfesionalSeleccionado(profesional)
    setShowVerDialog(true)
    console.log("Estados actualizados - showVerDialog:", true)
  }

  const handleProfesionalRegistrado = async () => {
    console.log("Profesional registrado, recargando lista...")
    // Recargar la lista de profesionales
    try {
      const profResponse = await fetch('/api/v1/profesionales')
      if (profResponse.ok) {
        const profesionalesData = await profResponse.json()
        setProfesionales(profesionalesData)
      }
    } catch (error) {
      console.error('Error al recargar profesionales:', error)
    }
  }

  const handleOpenRegistrarModal = () => {
    console.log("Abriendo modal de registro")
    setShowRegistrarModal(true)
    console.log("showRegistrarModal:", true)
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="p-6 flex items-center justify-center h-[50vh]">
          <div className="text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
            <p className="text-muted-foreground">Cargando profesionales...</p>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Gestión de Profesionales</h1>
            <p className="text-muted-foreground">
              Administra la información de todos los profesionales del policonsultorio
            </p>
          </div>
          <Button onClick={() => setShowRegistrarModal(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Registrar Profesional
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium">Total Profesionales</span>
              </div>
              <p className="text-2xl font-bold text-blue-600">{profesionales.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Stethoscope className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium">Especialidades</span>
              </div>
              <p className="text-2xl font-bold text-green-600">{especialidadesUnicas.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-purple-600" />
                <span className="text-sm font-medium">Obras Sociales</span>
              </div>
              <p className="text-2xl font-bold text-purple-600">{obrasSociales.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                <span className="text-sm font-medium">Activos</span>
              </div>
              <p className="text-2xl font-bold text-amber-600">{profesionales.length}</p>
            </CardContent>
          </Card>
        </div>

        {/* Filtros y búsqueda */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nombre, apellido o DNI..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                <div className="flex items-center gap-2 flex-1">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <select
                    value={filtroEspecialidad}
                    onChange={(e) => setFiltroEspecialidad(e.target.value)}
                    className="px-3 py-2 border border-border rounded-md bg-background text-foreground w-full"
                  >
                    <option value="">Todas las especialidades</option>
                    {especialidadesUnicas.map((esp) => (
                      <option key={esp} value={esp}>
                        {esp}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-2 flex-1">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <select
                    value={filtroObraSocial}
                    onChange={(e) => setFiltroObraSocial(e.target.value)}
                    className="px-3 py-2 border border-border rounded-md bg-background text-foreground w-full"
                  >
                    <option value="0">Todas las obras sociales</option>
                    {obrasSociales.map((os) => (
                      <option key={os.id} value={os.id.toString()}>
                        {os.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de profesionales */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Lista de Profesionales ({profesionalesOrdenados.length})
            </CardTitle>
            <CardDescription>Profesionales ordenados alfabéticamente por apellido</CardDescription>
          </CardHeader>
          <CardContent>
            {profesionalesOrdenados.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No se encontraron profesionales</p>
              </div>
            ) : (
              <div className="space-y-4">
                {profesionalesOrdenados.map((profesional) => (
                  <div
                    key={profesional.id}
                    className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-primary">
                          {profesional.nombre[0]}
                          {profesional.apellido[0]}
                        </span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-foreground">
                            {profesional.apellido}, {profesional.nombre}
                          </h3>
                          <Badge variant="secondary" className="text-blue-700 bg-blue-100">
                            {profesional.especialidad}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <span className="font-medium">DNI:</span> {profesional.dni}
                          </div>
                          <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {profesional.telefono}
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="font-medium">Dirección:</span> {profesional.direccion}
                          </div>
                          {profesional.obras_sociales && profesional.obras_sociales.length > 0 && (
                            <div className="flex items-center gap-1 md:col-span-2">
                              <Briefcase className="h-3 w-3" />
                              <span className="font-medium">Obras Sociales:</span>{" "}
                              {profesional.obras_sociales.map(os => os.obra_social.nombre).join(", ")}
                            </div>
                          )}
                          {profesional._count && (
                            <>
                              <div className="flex items-center gap-1">
                                <span className="font-medium">Turnos:</span> {profesional._count.turnos}
                              </div>
                              <div className="flex items-center gap-1">
                                <span className="font-medium">Historias:</span> {profesional._count.historias}
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="gap-1"
                        onClick={() => handleVerProfesional(profesional)}
                      >
                        <Eye className="h-4 w-4" />
                        Ver
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Modales */}
        <RegistrarProfesionalModal
          open={showRegistrarModal}
          onOpenChange={setShowRegistrarModal}
          onProfesionalRegistrado={handleProfesionalRegistrado}
        />

        {profesionalSeleccionado && (
          <VerProfesionalDialog
            open={showVerDialog}
            onOpenChange={setShowVerDialog}
            profesional={profesionalSeleccionado}
          />
        )}
      </div>
    </MainLayout>
  )
}