"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/context/auth-context"
import { NuevaConsultaDialog } from "@/components/pacientes/nueva-consulta-dialog"
import { AntecedentesFamiliaresCard } from "@/components/pacientes/antecedentes-familiares-card"
import { Input } from "@/components/ui/input"
import {
  FileText,
  Calendar,
  User,
  Stethoscope,
  Pill,
  Activity,
  AlertCircle,
  Plus,
  ArrowLeft,
  Clock,
  Heart,
  Thermometer,
  Weight,
  Eye,
  UserCheck,
  Loader2,
  Search,
  Filter,
} from "lucide-react"
import Link from "next/link"
import { Role } from "@/generated/prisma"

type PacienteData = {
  id: number,
  nombre: string,
  apellido: string,
  dni: string,
  fechaNacimiento: string,
  obraSocial: string,
  numeroAfiliado: string,
  antecedentes: string,
  profesionalesAsignados: string[],
}

type HistoriaData = {
  id: string,
  pacienteId: string,
  profesionalId: string,
  fecha: string,
  hora: string,
  profesional: string,
  especialidad: string,
  motivo: string | null,
  anamnesis: string,
  examenFisico: string,
  signosVitales: any,
  diagnostico: string,
  tratamiento: string,
  medicamentos: any[],
  estudiosComplementarios: any[],
  indicaciones: string,
  proximoControl: string,
  observaciones: string,
}

export default function HistoriasClinicasPage() {
  const { user } = useAuth()
  const searchParams = useSearchParams()
  const router = useRouter()
  const pacienteId = searchParams.get("paciente")

  const [loading, setLoading] = useState(true)
  const [profesionalId, setProfesionalId] = useState<number | null>(null)
  const [pacientes, setPacientes] = useState<PacienteData[]>([])
  const [historias, setHistorias] = useState<HistoriaData[]>([])
  const [paciente, setPaciente] = useState<PacienteData | null>(null)
  const [historiaClinica, setHistoriaClinica] = useState<HistoriaData[]>([])
  const [showNuevaConsulta, setShowNuevaConsulta] = useState(false)
  const [vistaLista, setVistaLista] = useState(!pacienteId)
  const [pacientesFiltrados, setPacientesFiltrados] = useState<PacienteData[]>([])
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Obtener el ID del profesional del usuario actual
  const getProfesionalId = async () => {
    if (!user || user.rol !== Role.PROFESIONAL) return null
    
    try {
      const response = await fetch(`/api/v2/profesional/by-user/${user.id}`)
      if (!response.ok) return null
      
      const data = await response.json()
      return data.profesionalId
    } catch (error) {
      console.error("Error obteniendo ID de profesional:", error)
      return null
    }
  }

  // Obtener pacientes con turnos del profesional
  const fetchPacientesConTurnos = async (profesionalId: number) => {
    try {
      // Obtener turnos del profesional
      const turnosRes = await fetch(`/api/v2/turnos?id_profesional=${profesionalId}`)
      if (!turnosRes.ok) throw new Error("Error al obtener turnos")
      const turnosData = await turnosRes.json()
      
      // Obtener IDs únicos de pacientes con turnos
      const pacientesIds = [...new Set(turnosData.turnos.map((t: any) => t.id_paciente))]
      
      // Obtener todos los pacientes
      const pacientesRes = await fetch("/api/v2/historia/paciente")
      if (!pacientesRes.ok) throw new Error("Error al obtener pacientes")
      const pacientesData = await pacientesRes.json()
      
      // Filtrar solo los pacientes que tienen turnos con este profesional
      const pacientesConTurnos = pacientesData.pacientes.filter((p: PacienteData) => 
        pacientesIds.includes(p.id)
      )
      
      setPacientes(pacientesConTurnos)
      setPacientesFiltrados(pacientesConTurnos)
      
    } catch (error) {
      console.error("Error fetching pacientes con turnos:", error)
    }
  }

  // Obtener todos los pacientes (para gerente)
  const fetchTodosPacientes = async () => {
    try {
      const res = await fetch("/api/v2/historia/paciente")
      if (!res.ok) throw new Error("Error al obtener pacientes")
      const data = await res.json()
      setPacientes(data.pacientes)
      setPacientesFiltrados(data.pacientes)
    } catch (error) {
      console.error("Error fetching pacientes:", error)
    }
  }

  // Obtener historias clínicas
  const fetchHistorias = async (profesionalId?: number) => {
    try {
      let url = "/api/v2/historia"
      if (profesionalId) {
        url += `?id_profesional=${profesionalId}`
      }
      
      const res = await fetch(url)
      if (!res.ok) throw new Error("Error al obtener historias")
      const data = await res.json()
      setHistorias(data.historias)
    } catch (error) {
      console.error("Error fetching historias:", error)
    }
  }

  const onSearchTerm = (newTerm: string) => {
    const filtrados = pacientes.filter((paciente) => {
      return paciente.nombre.toLowerCase().includes(newTerm.toLowerCase()) ||
              paciente.apellido.toLowerCase().includes(newTerm.toLowerCase()) ||
              paciente.dni.includes(newTerm);
    });
    setPacientesFiltrados(filtrados);
    setSearchTerm(newTerm);
  };

  // Inicializar datos
  useEffect(() => {
    const initData = async () => {
      if (!user) {
        setLoading(false)
        return
      }

      setLoading(true)

      try {
        if (user.rol === Role.PROFESIONAL) {
          const profId = await getProfesionalId()
          if (profId) {
            setProfesionalId(profId)
            await Promise.all([
              fetchPacientesConTurnos(profId),
              fetchHistorias(profId)
            ])
          }
        } else if (user.rol === Role.GERENTE) {
          await Promise.all([
            fetchTodosPacientes(),
            fetchHistorias()
          ])
        }
      } catch (error) {
        console.error("Error inicializando datos:", error)
      } finally {
        setLoading(false)
      }
    }

    initData()
  }, [user])

  // Manejar selección de paciente
  useEffect(() => {
    if (pacienteId && !vistaLista && pacientes.length > 0) {
      const parsed = parseInt(pacienteId)
      const pacienteEncontrado = pacientes.find((p) => p.id === parsed)

      if (!pacienteEncontrado) {
        setPaciente(null)
        return
      }

      setPaciente(pacienteEncontrado)

      // Filtrar historias del paciente
      let historiasDelPaciente = historias.filter(
        (h) => h.pacienteId === pacienteId
      )

      // // Si es profesional, filtrar solo sus historias
      // if (user?.rol === Role.PROFESIONAL && profesionalId) {
      //   const profesionalIdStr = profesionalId.toString()
      //   historiasDelPaciente = historiasDelPaciente.filter(
      //     (h) => h.profesionalId === profesionalIdStr
      //   )
      // }

      setHistoriaClinica(
        historiasDelPaciente.sort(
          (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
        )
      )
    } else if (!pacienteId) {
      setVistaLista(true)
    }
  }, [pacienteId, pacientes, historias, user, vistaLista, profesionalId])

  const verHistoriaClinica = (pacienteSeleccionado: PacienteData) => {
    router.push(`/historias-clinicas?paciente=${pacienteSeleccionado.id}`)
    setVistaLista(false)
  }

  const volverALista = () => {
    router.push("/historias-clinicas")
    setVistaLista(true)
    setPaciente(null)
    setHistoriaClinica([])
  }

  const calcularEdad = (fechaNacimiento: string) => {
    const hoy = new Date()
    const nacimiento = new Date(fechaNacimiento)
    let edad = hoy.getFullYear() - nacimiento.getFullYear()
    const mes = hoy.getMonth() - nacimiento.getMonth()

    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--
    }

    return edad
  }

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString("es-AR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatearFechaCorta = (fecha: string) => {
    return new Date(fecha).toLocaleDateString("es-AR")
  }

  const handleNuevaConsulta = async (nuevaConsulta: any) => {
    // Recargar historias después de crear la consulta
    try {
      if (profesionalId) {
        await fetchHistorias(profesionalId)
      } else {
        await fetchHistorias()
      }
    } catch (error) {
      console.error("Error recargando historias:", error)
    }
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-screen">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </MainLayout>
    )
  }

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

  if (user.rol === Role.MESA_ENTRADA) {
    return (
      <MainLayout>
        <div className="p-6">
          <Card>
            <CardContent className="flex flex-col items-center justify-center h-32 space-y-4">
              <AlertCircle className="h-12 w-12 text-muted-foreground" />
              <p className="text-muted-foreground">No tienes permisos para acceder a las historias clínicas.</p>
              <Link href="/pacientes">
                <Button variant="outline" className="gap-2 bg-transparent">
                  <ArrowLeft className="h-4 w-4" />
                  Volver a Pacientes
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    )
  }

  if (vistaLista) {
    return (
      <MainLayout>
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Historias Clínicas</h1>
              <p className="text-muted-foreground">
                {user.rol === Role.PROFESIONAL 
                  ? "Pacientes con turnos asignados" 
                  : "Gestión de historias clínicas"}
              </p>
            </div>
          </div>

        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nombre, apellido, o DNI..."
                  value={searchTerm}
                  onChange={(e) => onSearchTerm(e.target.value) }
                  className="pl-10"
                />
              </div>
            </div>
          </CardContent>
        </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="h-5 w-5" />
                Pacientes ({pacientesFiltrados.length})
              </CardTitle>
              <CardDescription>
                Selecciona un paciente para ver su historia clínica completa
              </CardDescription>
            </CardHeader>
            <CardContent>
              {pacientesFiltrados.length === 0 ? (
                <div className="text-center py-8">
                  <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    {user.rol === Role.PROFESIONAL
                      ? "No tienes pacientes con turnos asignados"
                      : "No se encontraron pacientes"}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {pacientesFiltrados.map((pacienteItem) => {
                    const consultasPaciente = historias.filter(
                      (h) => h.pacienteId === pacienteItem.id.toString()
                    )
                    const ultimaConsulta = consultasPaciente[0]
                    const especialidades = [...new Set(consultasPaciente.map((c) => c.especialidad))]

                    return (
                      <Card
                        key={pacienteItem.id}
                        className="hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => verHistoriaClinica(pacienteItem)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                                <span className="text-sm font-medium text-primary">
                                  {pacienteItem.nombre[0]}
                                  {pacienteItem.apellido[0]}
                                </span>
                              </div>
                              <div>
                                <h3 className="font-semibold">
                                  {pacienteItem.apellido}, {pacienteItem.nombre}
                                </h3>
                                <p className="text-sm text-muted-foreground">DNI: {pacienteItem.dni}</p>
                              </div>
                            </div>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">Consultas:</span>
                              <Badge variant="secondary">{consultasPaciente.length}</Badge>
                            </div>

                            {ultimaConsulta && (
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Última consulta:</span>
                                <span className="text-xs">{formatearFechaCorta(ultimaConsulta.fecha)}</span>
                              </div>
                            )}

                            {especialidades.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {especialidades.slice(0, 2).map((esp, idx) => (
                                  <Badge key={idx} variant="outline" className="text-xs">
                                    {esp}
                                  </Badge>
                                ))}
                                {especialidades.length > 2 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{especialidades.length - 2}
                                  </Badge>
                                )}
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    )
  }

  if (!pacienteId || !paciente) {
    return (
      <MainLayout>
        <div className="p-6">
          <Card>
            <CardContent className="flex flex-col items-center justify-center h-32 space-y-4">
              <AlertCircle className="h-12 w-12 text-muted-foreground" />
              <p className="text-muted-foreground">
                {user.rol === Role.PROFESIONAL 
                  ? "No tienes permisos para ver la historia clínica de este paciente o el paciente no tiene turnos contigo."
                  : "No se encontró el paciente especificado."}
              </p>
              <Button variant="outline" className="gap-2 bg-transparent" onClick={volverALista}>
                <ArrowLeft className="h-4 w-4" />
                Volver a Lista
              </Button>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" className="gap-2" onClick={volverALista}>
              <ArrowLeft className="h-4 w-4" />
              Volver
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Historia Clínica</h1>
              <p className="text-muted-foreground">
                {user.rol === Role.PROFESIONAL
                  ? "Tus consultas con este paciente"
                  : "Registro médico completo del paciente"}
              </p>
            </div>
          </div>
          {user.rol === Role.PROFESIONAL && (
            <Button onClick={() => setShowNuevaConsulta(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Nueva Consulta
            </Button>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Información del Paciente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-lg font-medium text-primary">
                    {paciente.nombre[0]}
                    {paciente.apellido[0]}
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold">
                    {paciente.apellido}, {paciente.nombre}
                  </h3>
                  <p className="text-muted-foreground">DNI: {paciente.dni}</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    <strong>Edad:</strong> {calcularEdad(paciente.fechaNacimiento)} años
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm">
                    <strong>Fecha de nacimiento:</strong> {formatearFecha(paciente.fechaNacimiento)}
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-sm">
                  <strong>Obra Social:</strong> {paciente.obraSocial || "No especificada"}
                </div>
                <div className="text-sm">
                  <strong>N° Afiliado:</strong> {paciente.numeroAfiliado || "N/A"}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <AntecedentesFamiliaresCard 
          pacienteId={paciente.id.toString()}
          antecedentesInitial={paciente.antecedentes}
          editable={user.rol === Role.PROFESIONAL}
          compact={false}
        />

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Resumen de Historia Clínica
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <FileText className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-blue-600">{historiaClinica.length}</p>
                <p className="text-sm text-blue-700">Total Consultas</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <Calendar className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-green-600">
                  {historiaClinica.length > 0 ? formatearFechaCorta(historiaClinica[0].fecha) : "N/A"}
                </p>
                <p className="text-sm text-green-700">Última Consulta</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <Stethoscope className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-purple-600">
                  {[...new Set(historiaClinica.map((h) => h.especialidad))].length}
                </p>
                <p className="text-sm text-purple-700">Especialidades</p>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <Pill className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-orange-600">
                  {historiaClinica.reduce((acc, h) => acc + (h.medicamentos?.length || 0), 0)}
                </p>
                <p className="text-sm text-orange-700">Medicamentos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {user.rol === Role.PROFESIONAL ? "Mis Consultas" : "Historial de Consultas"} ({historiaClinica.length})
            </CardTitle>
            <CardDescription>
              {user.rol === Role.PROFESIONAL 
                ? "Consultas que has realizado con este paciente"
                : "Consultas ordenadas por fecha (más reciente primero)"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {historiaClinica.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  {user.rol === Role.PROFESIONAL 
                    ? "No has realizado consultas con este paciente"
                    : "No hay consultas registradas"}
                </p>
                {user.rol === Role.PROFESIONAL && (
                  <Button onClick={() => setShowNuevaConsulta(true)} className="mt-4 gap-2" variant="outline">
                    <Plus className="h-4 w-4" />
                    Agregar Primera Consulta
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                {historiaClinica.map((consulta, index) => (
                  <div key={consulta.id} className="border border-border rounded-lg p-6 space-y-4">
                    <div className="flex items-center justify-between pb-4 border-b">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-primary">#{historiaClinica.length - index}</span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{consulta.motivo}</h3>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatearFecha(consulta.fecha)}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {consulta.hora}
                            </div>
                            <div className="flex items-center gap-1">
                              <Stethoscope className="h-3 w-3" />
                              {consulta.profesional}
                            </div>
                          </div>
                        </div>
                      </div>
                      <Badge variant="secondary">{consulta.especialidad}</Badge>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium text-sm text-muted-foreground mb-2">
                            HISTORIA DE LA ENFERMEDAD ACTUAL
                          </h4>
                          <p className="text-sm">{consulta.anamnesis}</p>
                        </div>

                        {consulta.examenFisico && (
                          <div>
                            <h4 className="font-medium text-sm text-muted-foreground mb-2">EXAMEN FÍSICO</h4>
                            <p className="text-sm">{consulta.examenFisico}</p>
                          </div>
                        )}

                        {consulta.signosVitales && (
                          <div>
                            <h4 className="font-medium text-sm text-muted-foreground mb-2">SIGNOS VITALES</h4>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div className="flex items-center gap-1">
                                <Heart className="h-3 w-3 text-red-500" />
                                <span>PA: {consulta.signosVitales.presionArterial} mmHg</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Activity className="h-3 w-3 text-blue-500" />
                                <span>FC: {consulta.signosVitales.frecuenciaCardiaca} lpm</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Thermometer className="h-3 w-3 text-orange-500" />
                                <span>T°: {consulta.signosVitales.temperatura}°C</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Weight className="h-3 w-3 text-green-500" />
                                <span>Peso: {consulta.signosVitales.peso} kg</span>
                              </div>
                            </div>
                          </div>
                        )}

                        <div>
                          <h4 className="font-medium text-sm text-muted-foreground mb-2">DIAGNÓSTICO</h4>
                          <p className="text-sm font-medium">{consulta.diagnostico}</p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        {consulta.tratamiento && (
                          <div>
                            <h4 className="font-medium text-sm text-muted-foreground mb-2">TRATAMIENTO</h4>
                            <p className="text-sm">{consulta.tratamiento}</p>
                          </div>
                        )}

                        {consulta.indicaciones && (
                          <div>
                            <h4 className="font-medium text-sm text-muted-foreground mb-2">INDICACIONES</h4>
                            <p className="text-sm">{consulta.indicaciones}</p>
                          </div>
                        )}

                        {consulta.proximoControl && (
                          <div>
                            <h4 className="font-medium text-sm text-muted-foreground mb-2">PRÓXIMO CONTROL</h4>
                            <p className="text-sm font-medium text-primary">
                              {formatearFecha(consulta.proximoControl)}
                            </p>
                          </div>
                        )}

                        {consulta.observaciones && (
                          <div>
                            <h4 className="font-medium text-sm text-muted-foreground mb-2">OBSERVACIONES</h4>
                            <p className="text-sm italic">{consulta.observaciones}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {user.rol === Role.PROFESIONAL && paciente && profesionalId && (
          <NuevaConsultaDialog
            open={showNuevaConsulta}
            onOpenChange={setShowNuevaConsulta}
            paciente={{
              id: paciente.id.toString(),
              nombre: paciente.nombre,
              apellido: paciente.apellido,
              dni: paciente.dni,
              fechaNacimiento: paciente.fechaNacimiento,
            }}
            profesionalId={profesionalId}
            onConsultaCreada={handleNuevaConsulta}
          />
        )}
      </div>
    </MainLayout>
  )
}
