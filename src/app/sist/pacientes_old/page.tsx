"use client"

import { useState } from "react"
import { useAuth } from "@/context/auth-context"
import { MainLayout } from "@/components/layout/main-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, User, FileText, Plus } from "lucide-react"
import { VerPacienteDialog } from "@/components/pacientes/ver-paciente-dialog"
import { EditarPacienteDialog } from "@/components/pacientes/editar-paciente-dialog"
import { NuevaConsultaDialog } from "@/components/pacientes/nueva-consulta-dialog"
import { useRouter } from "next/navigation"

// Mock data - En producción vendría de una API
const mockPacientes = [
  {
    id: "1",
    nombre: "Ana",
    apellido: "García",
    dni: "12345678",
    telefono: "11-1234-5678",
    email: "ana.garcia@email.com",
    fechaNacimiento: "1985-03-15",
    direccion: "Av. Corrientes 1234",
    obraSocial: "OSDE",
    numeroAfiliado: "123456789",
    profesionalAsignado: "prof-1", // Dr. Juan Pérez
    ultimaConsulta: "2024-01-15",
    proximoTurno: "2024-01-25",
    especialidad: "Cardiología",
    estado: "activo",
    fechaRegistro: "2023-06-15",
  },
  {
    id: "2",
    nombre: "Carlos",
    apellido: "López",
    dni: "87654321",
    telefono: "11-8765-4321",
    email: "carlos.lopez@email.com",
    fechaNacimiento: "1978-07-22",
    direccion: "Calle Falsa 123",
    obraSocial: "Swiss Medical",
    numeroAfiliado: "987654321",
    profesionalAsignado: "prof-1", // Dr. Juan Pérez
    ultimaConsulta: "2024-01-10",
    proximoTurno: null,
    especialidad: "Cardiología",
    estado: "activo",
    fechaRegistro: "2023-08-20",
  },
  {
    id: "3",
    nombre: "María",
    apellido: "Rodríguez",
    dni: "11223344",
    telefono: "11-1122-3344",
    email: "maria.rodriguez@email.com",
    fechaNacimiento: "1990-11-08",
    direccion: "San Martín 567",
    obraSocial: "IOMA",
    numeroAfiliado: "112233445",
    profesionalAsignado: "prof-2", // Dra. María González
    ultimaConsulta: "2024-01-12",
    proximoTurno: "2024-01-28",
    especialidad: "Dermatología",
    estado: "activo",
    fechaRegistro: "2023-09-10",
  },
  {
    id: "4",
    nombre: "Pedro",
    apellido: "Martínez",
    dni: "55667788",
    telefono: "11-5566-7788",
    email: "pedro.martinez@email.com",
    fechaNacimiento: "1982-05-30",
    direccion: "Belgrano 890",
    obraSocial: "Galeno",
    numeroAfiliado: "556677889",
    profesionalAsignado: "prof-2", // Dra. María González
    ultimaConsulta: "2024-01-08",
    proximoTurno: "2024-01-30",
    especialidad: "Dermatología",
    estado: "activo",
    fechaRegistro: "2023-07-25",
  },
]

// Mock turnos para verificar relaciones
const mockTurnos = [
  {
    id: "1",
    pacienteId: "1",
    profesionalId: "prof-1",
    fecha: "2024-01-25",
    hora: "10:00",
    estado: "confirmado",
  },
  {
    id: "2",
    pacienteId: "3",
    profesionalId: "prof-2",
    fecha: "2024-01-28",
    hora: "14:00",
    estado: "confirmado",
  },
  {
    id: "3",
    pacienteId: "4",
    profesionalId: "prof-2",
    fecha: "2024-01-30",
    hora: "16:00",
    estado: "programado",
  },
]

export default function MisPacientesPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedPaciente, setSelectedPaciente] = useState<any>(null)
  const [showVerDialog, setShowVerDialog] = useState(false)
  const [showEditarDialog, setShowEditarDialog] = useState(false)
  const [showNuevaConsultaDialog, setShowNuevaConsultaDialog] = useState(false)

  // Filtrar pacientes según el profesional actual
  const misPacientes = mockPacientes.filter((paciente) => {
    // Solo mostrar pacientes asignados al profesional actual
    const esAsignado = paciente.profesionalAsignado === user?.id

    // También incluir pacientes que tienen turnos con este profesional
    const tieneTurno = mockTurnos.some((turno) => turno.pacienteId === paciente.id && turno.profesionalId === user?.id)

    return esAsignado || tieneTurno
  })

  // Filtrar por término de búsqueda
  const pacientesFiltrados = misPacientes.filter(
    (paciente) =>
      `${paciente.nombre} ${paciente.apellido}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      paciente.dni.includes(searchTerm) ||
      paciente.especialidad.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleVerPaciente = (paciente: any) => {
    setSelectedPaciente(paciente)
    setShowVerDialog(true)
  }

  const handleEditarPaciente = (paciente: any) => {
    setSelectedPaciente(paciente)
    setShowEditarDialog(true)
  }

  const handleVerHistoria = (paciente: any) => {
    router.push(`/historias-clinicas?pacienteId=${paciente.id}`)
  }

  const handleNuevaConsulta = (paciente: any) => {
    setSelectedPaciente(paciente)
    setShowNuevaConsultaDialog(true)
  }

  // Solo profesionales pueden acceder a esta página
  if (user?.role !== "profesional") {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Acceso Restringido</h2>
            <p className="text-gray-600">Esta página está disponible solo para profesionales.</p>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Mis Pacientes</h1>
            <p className="text-gray-600">
              Gestiona los pacientes asignados a ti ({pacientesFiltrados.length} pacientes)
            </p>
          </div>
        </div>

        {/* Filtros */}
        <Card>
          <CardContent className="p-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Buscar por nombre, DNI o especialidad..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Pacientes */}
        <div className="grid gap-4">
          {pacientesFiltrados.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron pacientes</h3>
                <p className="text-gray-600">
                  {searchTerm
                    ? "No hay pacientes que coincidan con tu búsqueda."
                    : "No tienes pacientes asignados actualmente."}
                </p>
              </CardContent>
            </Card>
          ) : (
            pacientesFiltrados.map((paciente) => (
              <Card key={paciente.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {paciente.apellido}, {paciente.nombre}
                        </h3>
                        <Badge variant="secondary">{paciente.especialidad}</Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">DNI:</span> {paciente.dni}
                        </div>
                        <div>
                          <span className="font-medium">Teléfono:</span> {paciente.telefono}
                        </div>
                        <div>
                          <span className="font-medium">Obra Social:</span> {paciente.obraSocial}
                        </div>
                        <div>
                          <span className="font-medium">Última consulta:</span>{" "}
                          {paciente.ultimaConsulta
                            ? new Date(paciente.ultimaConsulta).toLocaleDateString()
                            : "Sin consultas"}
                        </div>
                        <div>
                          <span className="font-medium">Próximo turno:</span>{" "}
                          {paciente.proximoTurno ? new Date(paciente.proximoTurno).toLocaleDateString() : "Sin turnos"}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 ml-4">
                      <Button variant="outline" size="sm" onClick={() => handleVerPaciente(paciente)}>
                        <User className="h-4 w-4 mr-1" />
                        Ver
                      </Button>

                      <Button variant="outline" size="sm" onClick={() => handleVerHistoria(paciente)}>
                        <FileText className="h-4 w-4 mr-1" />
                        Historia
                      </Button>

                      <Button variant="default" size="sm" onClick={() => handleNuevaConsulta(paciente)}>
                        <Plus className="h-4 w-4 mr-1" />
                        Nueva Consulta
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Dialogs */}
      {selectedPaciente && (
        <>
          <VerPacienteDialog open={showVerDialog} onOpenChange={setShowVerDialog} paciente={selectedPaciente} />

          <EditarPacienteDialog
            open={showEditarDialog}
            onOpenChange={setShowEditarDialog}
            paciente={selectedPaciente}
            onPacienteActualizado={(pacienteActualizado) => {
              console.log("Paciente actualizado:", pacienteActualizado)
              setShowEditarDialog(false)
            }}
          />

          <NuevaConsultaDialog
            open={showNuevaConsultaDialog}
            onOpenChange={setShowNuevaConsultaDialog}
            paciente={selectedPaciente}
            onConsultaCreada={(consulta) => {
              console.log("Nueva consulta:", consulta)
              setShowNuevaConsultaDialog(false)
            }}
          />
        </>
      )}
    </MainLayout>
  )
}
