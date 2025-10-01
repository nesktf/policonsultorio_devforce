"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/auth-context";
import { NuevoPacienteDialog } from "@/components/pacientes/nuevo-paciente-dialog";
import { HistoriaClinicaDialog } from "@/components/pacientes/historia-clinica-dialog";
import { VerPacienteDialog } from "@/components/pacientes/ver-paciente-dialog";
import { EditarPacienteDialog } from "@/components/pacientes/editar-paciente-dialog";
import {
  hasPermission,
  filterDataByRole,
  canPerformAction,
  getAccessDeniedMessage,
} from "@/lib/permissions";
import {
  Users,
  Search,
  Plus,
  Eye,
  Edit,
  Phone,
  Mail,
  Calendar,
  FileText,
  Filter,
  AlertCircle,
} from "lucide-react";

// Mock data - en producción vendría de la API
const mockPacientes = [
  {
    id: "1",
    nombre: "María",
    apellido: "González",
    dni: "12345678",
    telefono: "11-1234-5678",
    email: "maria.gonzalez@email.com",
    fechaNacimiento: "1985-03-15",
    direccion: "Av. Corrientes 1234, CABA",
    obraSocial: "OSDE",
    numeroAfiliado: "123456789",
    estado: "activo",
    fechaRegistro: "2024-01-10",
    ultimaConsulta: "2024-01-15",
    profesionalesAsignados: ["2"], // Dr. Carlos Mendez (Cardiología)
    turnosReservados: [
      { profesionalId: "2", fecha: "2024-02-15", estado: "confirmado" },
    ],
    consultasRealizadas: [
      { profesionalId: "2", fecha: "2024-01-15", motivo: "Control rutinario" },
    ],
  },
  {
    id: "2",
    nombre: "Juan Carlos",
    apellido: "Pérez",
    dni: "87654321",
    telefono: "11-8765-4321",
    email: "juan.perez@email.com",
    fechaNacimiento: "1978-07-22",
    direccion: "Rivadavia 5678, CABA",
    obraSocial: "Swiss Medical",
    numeroAfiliado: "987654321",
    estado: "activo",
    fechaRegistro: "2024-01-08",
    ultimaConsulta: "2024-01-14",
    profesionalesAsignados: ["3"], // Dra. María López (Dermatología)
    turnosReservados: [
      { profesionalId: "3", fecha: "2024-02-20", estado: "confirmado" },
    ],
    consultasRealizadas: [
      {
        profesionalId: "3",
        fecha: "2024-01-14",
        motivo: "Consulta por dolor en el pecho",
      },
    ],
  },
  {
    id: "3",
    nombre: "Ana María",
    apellido: "Martín",
    dni: "11223344",
    telefono: "11-1122-3344",
    email: "ana.martin@email.com",
    fechaNacimiento: "1992-11-08",
    direccion: "Santa Fe 9876, CABA",
    obraSocial: "Galeno",
    numeroAfiliado: "456789123",
    estado: "activo",
    fechaRegistro: "2024-01-05",
    ultimaConsulta: "2024-01-20",
    profesionalesAsignados: ["3"], // Dra. María López (Dermatología)
    turnosReservados: [],
    consultasRealizadas: [
      {
        profesionalId: "3",
        fecha: "2024-01-20",
        motivo: "Revisión de lunares",
      },
    ],
  },
  {
    id: "4",
    nombre: "Carlos Alberto",
    apellido: "Ruiz",
    dni: "44332211",
    telefono: "11-4433-2211",
    email: "carlos.ruiz@email.com",
    fechaNacimiento: "1965-05-30",
    direccion: "Callao 2468, CABA",
    obraSocial: "IOMA",
    numeroAfiliado: "789123456",
    estado: "activo",
    fechaRegistro: "2024-01-03",
    ultimaConsulta: "2024-01-12",
    profesionalesAsignados: ["4"], // Dr. Martínez (Traumatología)
    turnosReservados: [
      { profesionalId: "4", fecha: "2024-02-10", estado: "pendiente" },
    ],
    consultasRealizadas: [],
  },
  {
    id: "5",
    nombre: "Laura",
    apellido: "Fernández",
    dni: "99887766",
    telefono: "11-9988-7766",
    email: "laura.fernandez@email.com",
    fechaNacimiento: "1988-09-12",
    direccion: "Belgrano 3456, CABA",
    obraSocial: "Medicus",
    numeroAfiliado: "654321987",
    estado: "activo",
    fechaRegistro: "2024-01-01",
    ultimaConsulta: "2024-01-18",
    profesionalesAsignados: ["3"], // Dra. María López (Dermatología)
    turnosReservados: [],
    consultasRealizadas: [
      {
        profesionalId: "3",
        fecha: "2024-01-18",
        motivo: "Control post-operatorio",
      },
    ],
  },
  {
    id: "6",
    nombre: "Pedro",
    apellido: "Sánchez",
    dni: "55667788",
    telefono: "11-5566-7788",
    email: "pedro.sanchez@email.com",
    fechaNacimiento: "1975-04-03",
    direccion: "Pueyrredón 7890, CABA",
    obraSocial: "OSECAC",
    numeroAfiliado: "321654987",
    estado: "activo",
    fechaRegistro: "2024-01-02",
    ultimaConsulta: "2024-01-16",
    profesionalesAsignados: ["4"], // Dr. Martínez (Traumatología)
    turnosReservados: [
      { profesionalId: "4", fecha: "2024-02-12", estado: "programado" },
    ],
    consultasRealizadas: [
      { profesionalId: "4", fecha: "2024-01-16", motivo: "Dolor de espalda" },
    ],
  },
];

export default function PacientesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [pacientes, setPacientes] = useState(mockPacientes);
  const [searchTerm, setSearchTerm] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [showNuevoPacienteDialog, setShowNuevoPacienteDialog] = useState(false);
  const [showHistoriaClinica, setShowHistoriaClinica] = useState(false);
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState<any>(null);
  const [showVerPacienteDialog, setShowVerPacienteDialog] = useState(false);
  const [showEditarPacienteDialog, setShowEditarPacienteDialog] =
    useState(false);

  const getPacientesFiltradosPorRol = () => {
    return filterDataByRole(pacientes, user, "pacientes");
  };

  if (!user) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="flex items-center justify-center h-32">
            <p className="text-muted-foreground">
              Debes iniciar sesión para acceder a esta sección.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const canViewPacientes =
    hasPermission(user.role, "canViewAllPacientes") ||
    hasPermission(user.role, "canViewOwnPacientes");

  if (!canViewPacientes) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-32 space-y-4">
            <AlertCircle className="h-12 w-12 text-muted-foreground" />
            <p className="text-muted-foreground text-center">
              {getAccessDeniedMessage(user.role, "default")}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const pacientesPorRol = getPacientesFiltradosPorRol();
  const pacientesFiltrados = pacientesPorRol.filter((paciente) => {
    const matchesSearch =
      paciente.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      paciente.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
      paciente.dni.includes(searchTerm) ||
      paciente.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesEstado =
      filtroEstado === "todos" || paciente.estado === filtroEstado;

    return matchesSearch && matchesEstado;
  });

  const pacientesOrdenados = pacientesFiltrados.sort((a, b) =>
    a.apellido.localeCompare(b.apellido)
  );

  const calcularEdad = (fechaNacimiento: string) => {
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();

    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }

    return edad;
  };

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString("es-AR");
  };

  const handleNuevoPaciente = (nuevoPaciente: any) => {
    const pacienteConId = {
      ...nuevoPaciente,
      id: (pacientes.length + 1).toString(),
      fechaRegistro: new Date().toISOString().split("T")[0],
      estado: "activo",
      profesionalesAsignados: user?.role === "profesional" ? [user.id] : [],
      turnosReservados: [],
      consultasRealizadas: [],
    };
    setPacientes([...pacientes, pacienteConId]);
  };

  const handleVerHistoria = (paciente: any) => {
    if (!hasPermission(user.role, "canViewHistoriasClinicas")) {
      alert(getAccessDeniedMessage(user.role, "historias-clinicas"));
      return;
    }

    if (!canPerformAction(user, "view", "historia", paciente)) {
      alert(
        "No tienes permisos para ver la historia clínica de este paciente."
      );
      return;
    }

    setPacienteSeleccionado(paciente);
    setShowHistoriaClinica(true);
  };

  const handleVerPaciente = (paciente: any) => {
    // Verificar permisos para ver detalles del paciente
    if (!canPerformAction(user, "view", "paciente", paciente)) {
      alert("No tienes permisos para ver este paciente.");
      return;
    }

    setPacienteSeleccionado(paciente);
    setShowVerPacienteDialog(true);
  };

  const handleEditarPaciente = (paciente: any) => {
    if (!canPerformAction(user, "edit", "paciente", paciente)) {
      alert("No tienes permisos para editar este paciente.");
      return;
    }

    setPacienteSeleccionado(paciente);
    setShowEditarPacienteDialog(true);
  };

  const handleActualizarPaciente = (pacienteActualizado: any) => {
    setPacientes(
      pacientes.map((p) =>
        p.id === pacienteActualizado.id ? pacienteActualizado : p
      )
    );
    setShowEditarPacienteDialog(false);
    setPacienteSeleccionado(null);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {user.role === "profesional"
              ? "Mis Pacientes"
              : "Gestión de Pacientes"}
          </h1>
          <p className="text-muted-foreground">
            {user.role === "profesional"
              ? "Pacientes asignados y con turnos reservados contigo"
              : "Administra la información de todos los pacientes del policonsultorio"}
          </p>
        </div>
        {hasPermission(user.role, "canCreatePacientes") && (
          <Button
            onClick={() => setShowNuevoPacienteDialog(true)}
            className="gap-2"
          >
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
              <span className="text-sm font-medium">
                {user.role === "profesional"
                  ? "Mis Pacientes"
                  : "Total Pacientes"}
              </span>
            </div>
            <p className="text-2xl font-bold text-blue-600">
              {pacientesPorRol.length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium">Activos</span>
            </div>
            <p className="text-2xl font-bold text-green-600">
              {pacientesPorRol.filter((p) => p.estado === "activo").length}
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
              {pacientesPorRol.filter((p) => p.estado === "inactivo").length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-purple-600" />
              <span className="text-sm font-medium">
                {user.role === "profesional" ? "Atendidos" : "Nuevos este mes"}
              </span>
            </div>
            <p className="text-2xl font-bold text-purple-600">
              {user.role === "profesional"
                ? pacientesPorRol.filter((p) =>
                    p.consultasRealizadas?.some(
                      (c) => c.profesionalId === user.id
                    )
                  ).length
                : pacientesPorRol.filter((p) => {
                    const registro = new Date(p.fechaRegistro);
                    const hoy = new Date();
                    return (
                      registro.getMonth() === hoy.getMonth() &&
                      registro.getFullYear() === hoy.getFullYear()
                    );
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
            {user.role === "profesional"
              ? "Mis Pacientes"
              : "Lista de Pacientes"}{" "}
            ({pacientesOrdenados.length})
          </CardTitle>
          <CardDescription>
            {user.role === "profesional"
              ? "Pacientes que has atendido o tienen turnos contigo"
              : "Pacientes ordenados alfabéticamente por apellido"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {pacientesOrdenados.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {user.role === "profesional"
                  ? "No tienes pacientes asignados"
                  : "No se encontraron pacientes"}
              </p>
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
                          variant={
                            paciente.estado === "activo"
                              ? "secondary"
                              : "outline"
                          }
                          className={
                            paciente.estado === "activo"
                              ? "text-green-700 bg-green-100"
                              : ""
                          }
                        >
                          {paciente.estado === "activo" ? "Activo" : "Inactivo"}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <span className="font-medium">DNI:</span>{" "}
                          {paciente.dni}
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="font-medium">Edad:</span>{" "}
                          {calcularEdad(paciente.fechaNacimiento)} años
                        </div>
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {paciente.telefono}
                        </div>
                        <div className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {paciente.email}
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="font-medium">Obra Social:</span>{" "}
                          {paciente.obraSocial}
                        </div>
                        {user.role === "profesional" ? (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {paciente.consultasRealizadas?.some(
                              (c) => c.profesionalId === user.id
                            )
                              ? `Última consulta: ${formatearFecha(
                                  paciente.ultimaConsulta
                                )}`
                              : paciente.turnosReservados.some(
                                  (t) => t.profesionalId === user.id
                                )
                              ? "Turno programado"
                              : "Sin consultas previas"}
                          </div>
                        ) : (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Última consulta:{" "}
                            {formatearFecha(paciente.ultimaConsulta)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {hasPermission(user.role, "canViewHistoriasClinicas") &&
                      canPerformAction(user, "view", "historia", paciente) && (
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

                    {canPerformAction(user, "view", "paciente", paciente) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-1"
                        onClick={() => handleVerPaciente(paciente)}
                      >
                        <Eye className="h-4 w-4" />
                        Ver
                      </Button>
                    )}

                    {canPerformAction(user, "edit", "paciente", paciente) && (
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

      {hasPermission(user.role, "canCreatePacientes") && (
        <NuevoPacienteDialog
          open={showNuevoPacienteDialog}
          onOpenChange={setShowNuevoPacienteDialog}
          onPacienteCreado={handleNuevoPaciente}
        />
      )}

      {/* Dialog para ver paciente */}
      {pacienteSeleccionado && (
        <VerPacienteDialog
          open={showVerPacienteDialog}
          onOpenChange={setShowVerPacienteDialog}
          paciente={pacienteSeleccionado}
        />
      )}

      {/* Dialog para editar paciente */}
      {pacienteSeleccionado && (
        <EditarPacienteDialog
          open={showEditarPacienteDialog}
          onOpenChange={setShowEditarPacienteDialog}
          paciente={pacienteSeleccionado}
          onPacienteActualizado={handleActualizarPaciente}
        />
      )}

      {/* Dialog para historia clínica */}
      {pacienteSeleccionado && (
        <HistoriaClinicaDialog
          open={showHistoriaClinica}
          onOpenChange={setShowHistoriaClinica}
          paciente={pacienteSeleccionado}
        />
      )}
    </div>
  );
}
