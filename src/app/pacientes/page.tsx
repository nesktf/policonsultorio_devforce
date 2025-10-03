// app/pacientes/page.tsx
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/context/auth-context"
import { NuevoPacienteDialog } from "@/components/pacientes/nuevo-paciente-dialog"
import { HistoriaClinicaDialog } from "@/components/pacientes/historia-clinica-dialog"
import { VerPacienteDialog } from "@/components/pacientes/ver-paciente-dialog"
import { EditarPacienteDialog } from "@/components/pacientes/editar-paciente-dialog"
import { Users, Search, Plus, Eye, Edit, Phone, Mail, Calendar, FileText, Filter, AlertCircle, Loader2 } from "lucide-react"

interface Paciente {
  id: string
  nombre: string
  apellido: string
  dni: string
  telefono: string
  email?: string
  fechaNacimiento?: string
  direccion: string
  obraSocial?: string
  numeroAfiliado?: string
  estado: "activo" | "inactivo"
  fechaRegistro: string
  ultimaConsulta?: string
  profesionalesAsignados?: string[]
  turnosReservados?: any[]
  consultasRealizadas?: any[]
}

export default function PacientesPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [pacientes, setPacientes] = useState<Paciente[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filtroEstado, setFiltroEstado] = useState("todos")
  const [showNuevoPacienteDialog, setShowNuevoPacienteDialog] = useState(false)
  const [showHistoriaClinica, setShowHistoriaClinica] = useState(false)
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState<Paciente | null>(null)
  const [showVerPacienteDialog, setShowVerPacienteDialog] = useState(false)
  const [showEditarPacienteDialog, setShowEditarPacienteDialog] = useState(false)

  // Cargar pacientes desde la API
  useEffect(() => {
    const fetchPacientes = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/v1/pacientes')
        
        if (!response.ok) {
          throw new Error('Error al cargar pacientes')
        }

        const data = await response.json()
        
        // Transformar los datos de la API al formato del componente
        const pacientesTransformados = data.pacientes.map((p: any) => ({
          id: p.id.toString(),
          nombre: p.nombre,
          apellido: p.apellido,
          dni: p.dni,
          telefono: p.telefono,
          email: `${p.nombre.toLowerCase()}.${p.apellido.toLowerCase()}@email.com`,
          fechaNacimiento: p.fecha_nacimiento ? new Date(p.fecha_nacimiento).toISOString().split('T')[0] : undefined,
          direccion: p.direccion,
          obraSocial: p.obra_social?.nombre || 'Sin obra social',
          numeroAfiliado: p.num_obra_social || 'N/A',
          estado: 'activo' as const,
          fechaRegistro: p.fecha_registro ? new Date(p.fecha_registro).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          ultimaConsulta: undefined,
          profesionalesAsignados: [],
          turnosReservados: [],
          consultasRealizadas: [],
        }))

        setPacientes(pacientesTransformados)
      } catch (error) {
        console.error('Error al cargar pacientes:', error)
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchPacientes()
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

  const canViewPacientes = user.rol === "GERENTE" || user.rol === "MESA_ENTRADA" || user.rol === "PROFESIONAL"
  const canCreatePacientes = user.rol === "GERENTE" || user.rol === "MESA_ENTRADA"
  const canEditPacientes = user.rol === "GERENTE" || user.rol === "MESA_ENTRADA"
  const canViewHistorias = user.rol === "PROFESIONAL" || user.rol === "GERENTE"

  if (!canViewPacientes) {
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

  const pacientesFiltrados = pacientes.filter((paciente) => {
    const matchesSearch =
      paciente.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      paciente.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
      paciente.dni.includes(searchTerm) ||
      (paciente.email && paciente.email.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesEstado = filtroEstado === "todos" || paciente.estado === filtroEstado

    return matchesSearch && matchesEstado
  })

  const pacientesOrdenados = pacientesFiltrados.sort((a, b) => a.apellido.localeCompare(b.apellido))

  const calcularEdad = (fechaNacimiento?: string) => {
    if (!fechaNacimiento) return "N/A"
    const hoy = new Date()
    const nacimiento = new Date(fechaNacimiento)
    let edad = hoy.getFullYear() - nacimiento.getFullYear()
    const mes = hoy.getMonth() - nacimiento.getMonth()

    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--
    }

    return edad
  }

  const formatearFecha = (fecha?: string) => {
    if (!fecha) return "N/A"
    return new Date(fecha).toLocaleDateString("es-AR")
  }

  const handleNuevoPaciente = async (nuevoPaciente: any) => {
    try {
      const response = await fetch('/api/v1/pacientes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nombre: nuevoPaciente.nombre,
          apellido: nuevoPaciente.apellido,
          dni: nuevoPaciente.dni,
          telefono: nuevoPaciente.telefono,
          direccion: nuevoPaciente.direccion,
          fecha_nacimiento: nuevoPaciente.fechaNacimiento,
          id_obra_social: nuevoPaciente.obraSocialId || null,
          num_obra_social: nuevoPaciente.numeroAfiliado || null,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Error al crear paciente')
      }

      const data = await response.json()
      
      // Agregar el nuevo paciente a la lista
      const pacienteTransformado = {
        id: data.id.toString(),
        nombre: data.nombre,
        apellido: data.apellido,
        dni: data.dni,
        telefono: data.telefono,
        email: `${data.nombre.toLowerCase()}.${data.apellido.toLowerCase()}@email.com`,
        fechaNacimiento: data.fecha_nacimiento ? new Date(data.fecha_nacimiento).toISOString().split('T')[0] : undefined,
        direccion: data.direccion,
        obraSocial: data.obra_social?.nombre || 'Sin obra social',
        numeroAfiliado: data.num_obra_social || 'N/A',
        estado: 'activo' as const,
        fechaRegistro: new Date().toISOString().split('T')[0],
        ultimaConsulta: undefined,
        profesionalesAsignados: [],
        turnosReservados: [],
        consultasRealizadas: [],
      }

      setPacientes([pacienteTransformado, ...pacientes])
    } catch (error) {
      console.error('Error al crear paciente:', error)
      throw error
    }
  }

  const handleVerHistoria = (paciente: Paciente) => {
    if (!canViewHistorias) {
      alert("No tienes permisos para ver historias clínicas.")
      return
    }

    setPacienteSeleccionado(paciente)
    setShowHistoriaClinica(true)
  }

  const handleVerPaciente = (paciente: Paciente) => {
    setPacienteSeleccionado(paciente)
    setShowVerPacienteDialog(true)
  }

  const handleEditarPaciente = (paciente: Paciente) => {
    if (!canEditPacientes) {
      alert("No tienes permisos para editar pacientes.")
      return
    }

    setPacienteSeleccionado(paciente)
    setShowEditarPacienteDialog(true)
  }

  const handleActualizarPaciente = (pacienteActualizado: Paciente) => {
    setPacientes(pacientes.map((p) => (p.id === pacienteActualizado.id ? pacienteActualizado : p)))
    setShowEditarPacienteDialog(false)
    setPacienteSeleccionado(null)
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="p-6 flex items-center justify-center h-[50vh]">
          <div className="text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
            <p className="text-muted-foreground">Cargando pacientes...</p>
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
            <h1 className="text-3xl font-bold text-foreground">
              {user.rol === "PROFESIONAL" ? "Mis Pacientes" : "Gestión de Pacientes"}
            </h1>
            <p className="text-muted-foreground">
              {user.rol === "PROFESIONAL"
                ? "Pacientes asignados y con turnos reservados contigo"
                : "Administra la información de todos los pacientes del policonsultorio"}
            </p>
          </div>
          {canCreatePacientes && (
            <Button onClick={() => setShowNuevoPacienteDialog(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Nuevo Paciente
            </Button>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium">Total Pacientes</span>
              </div>
              <p className="text-2xl font-bold text-blue-600">{pacientes.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium">Activos</span>
              </div>
              <p className="text-2xl font-bold text-green-600">
                {pacientes.filter((p) => p.estado === "activo").length}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                <span className="text-sm font-medium">Inactivos</span>
              </div>
              <p className="text-2xl font-bold text-gray-600">
                {pacientes.filter((p) => p.estado === "inactivo").length}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-purple-600" />
                <span className="text-sm font-medium">Nuevos este mes</span>
              </div>
              <p className="text-2xl font-bold text-purple-600">
                {pacientes.filter((p) => {
                  const registro = new Date(p.fechaRegistro)
                  const hoy = new Date()
                  return registro.getMonth() === hoy.getMonth() && registro.getFullYear() === hoy.getFullYear()
                }).length}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filtros y búsqueda */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nombre, apellido, DNI o email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <select
                  value={filtroEstado}
                  onChange={(e) => setFiltroEstado(e.target.value)}
                  className="px-3 py-2 border border-border rounded-md bg-background text-foreground"
                >
                  <option value="todos">Todos los estados</option>
                  <option value="activo">Activos</option>
                  <option value="inactivo">Inactivos</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de pacientes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Lista de Pacientes ({pacientesOrdenados.length})
            </CardTitle>
            <CardDescription>Pacientes ordenados alfabéticamente por apellido</CardDescription>
          </CardHeader>
          <CardContent>
            {pacientesOrdenados.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No se encontraron pacientes</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pacientesOrdenados.map((paciente) => (
                  <div
                    key={paciente.id}
                    className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-primary">
                          {paciente.nombre[0]}
                          {paciente.apellido[0]}
                        </span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-foreground">
                            {paciente.apellido}, {paciente.nombre}
                          </h3>
                          <Badge
                            variant={paciente.estado === "activo" ? "secondary" : "outline"}
                            className={paciente.estado === "activo" ? "text-green-700 bg-green-100" : ""}
                          >
                            {paciente.estado === "activo" ? "Activo" : "Inactivo"}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <span className="font-medium">DNI:</span> {paciente.dni}
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="font-medium">Edad:</span> {calcularEdad(paciente.fechaNacimiento)} años
                          </div>
                          <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {paciente.telefono}
                          </div>
                          {paciente.email && (
                            <div className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {paciente.email}
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <span className="font-medium">Obra Social:</span> {paciente.obraSocial}
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Registro: {formatearFecha(paciente.fechaRegistro)}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {canViewHistorias && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-1"
                          onClick={() => handleVerHistoria(paciente)}
                        >
                          <FileText className="h-4 w-4" />
                          Historia
                        </Button>
                      )}

                      <Button variant="ghost" size="sm" className="gap-1" onClick={() => handleVerPaciente(paciente)}>
                        <Eye className="h-4 w-4" />
                        Ver
                      </Button>

                      {canEditPacientes && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-1"
                          onClick={() => handleEditarPaciente(paciente)}
                        >
                          <Edit className="h-4 w-4" />
                          Editar
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {canCreatePacientes && (
          <NuevoPacienteDialog
            open={showNuevoPacienteDialog}
            onOpenChange={setShowNuevoPacienteDialog}
            onPacienteCreado={handleNuevoPaciente}
          />
        )}

        {pacienteSeleccionado && (
          <>
            <VerPacienteDialog
              open={showVerPacienteDialog}
              onOpenChange={setShowVerPacienteDialog}
              paciente={pacienteSeleccionado}
            />

            <EditarPacienteDialog
              open={showEditarPacienteDialog}
              onOpenChange={setShowEditarPacienteDialog}
              paciente={pacienteSeleccionado}
              onPacienteActualizado={handleActualizarPaciente}
            />

            <HistoriaClinicaDialog
              open={showHistoriaClinica}
              onOpenChange={setShowHistoriaClinica}
              paciente={pacienteSeleccionado}
            />
          </>
        )}
      </div>
    </MainLayout>
  )
}