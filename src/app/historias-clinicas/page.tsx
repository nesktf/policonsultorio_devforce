"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/context/auth-context";
import { NuevaConsultaDialog } from "@/components/pacientes/nueva-consulta-dialog";
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
  Search,
  Filter,
  Eye,
  UserCheck,
} from "lucide-react";
import Link from "next/link";

// Mock data - en producción vendría de la API
const mockPacientes = [
  {
    id: "1",
    nombre: "María González",
    apellido: "González",
    dni: "12345678",
    fechaNacimiento: "1985-03-15",
    obraSocial: "OSDE",
    numeroAfiliado: "123456789",
    profesionalesAsignados: ["2"], // Dr. Carlos Mendez
  },
  {
    id: "2",
    nombre: "Juan Carlos",
    apellido: "Pérez",
    dni: "87654321",
    fechaNacimiento: "1978-07-22",
    obraSocial: "Swiss Medical",
    numeroAfiliado: "987654321",
    profesionalesAsignados: ["3"], // Dra. María López
  },
  {
    id: "3",
    nombre: "Ana María",
    apellido: "Martín",
    dni: "11223344",
    fechaNacimiento: "1992-11-08",
    obraSocial: "Galeno",
    numeroAfiliado: "456789123",
    profesionalesAsignados: ["2", "3"], // Ambos profesionales
  },
  {
    id: "4",
    nombre: "Carlos Alberto",
    apellido: "Ruiz",
    dni: "44332211",
    fechaNacimiento: "1965-05-30",
    obraSocial: "IOMA",
    numeroAfiliado: "789123456",
    profesionalesAsignados: ["2"], // Dr. Carlos Mendez
  },
  {
    id: "5",
    nombre: "Laura Beatriz",
    apellido: "Fernández",
    dni: "55667788",
    fechaNacimiento: "1990-12-03",
    obraSocial: "OSDE",
    numeroAfiliado: "555666777",
    profesionalesAsignados: ["3"], // Dra. María López
  },
];

const mockHistoriaClinica = [
  {
    id: "1",
    pacienteId: "1",
    profesionalId: "2",
    fecha: "2024-01-15",
    hora: "10:30",
    profesional: "Dr. Carlos Mendez",
    especialidad: "Cardiología",
    motivo: "Control rutinario",
    anamnesis:
      "Paciente refiere sentirse bien en general. Sin síntomas cardiovasculares. Mantiene actividad física regular.",
    examenFisico: "Paciente en buen estado general. Signos vitales estables.",
    signosVitales: {
      presionArterial: "120/80",
      frecuenciaCardiaca: "72",
      temperatura: "36.5",
      peso: "68",
      altura: "165",
    },
    diagnostico: "Control cardiológico normal",
    tratamiento: "Continuar con medicación actual",
    medicamentos: [
      {
        nombre: "Enalapril",
        dosis: "10mg",
        frecuencia: "1 vez al día",
        duracion: "Continuar",
      },
      {
        nombre: "Aspirina",
        dosis: "100mg",
        frecuencia: "1 vez al día",
        duracion: "Continuar",
      },
    ],
    estudiosComplementarios: [
      { tipo: "Electrocardiograma", resultado: "Normal", fecha: "2024-01-15" },
      {
        tipo: "Análisis de sangre",
        resultado: "Valores normales",
        fecha: "2024-01-10",
      },
    ],
    indicaciones:
      "Mantener dieta baja en sodio. Continuar con ejercicio regular. Control en 6 meses.",
    proximoControl: "2024-07-15",
    observaciones: "Paciente colaborador, cumple bien con el tratamiento.",
  },
  {
    id: "2",
    pacienteId: "1",
    profesionalId: "2",
    fecha: "2023-12-10",
    hora: "14:00",
    profesional: "Dr. Carlos Mendez",
    especialidad: "Cardiología",
    motivo: "Seguimiento hipertensión",
    anamnesis:
      "Paciente con antecedentes de hipertensión arterial. Refiere adherencia al tratamiento.",
    examenFisico: "Buen estado general. Auscultación cardiopulmonar normal.",
    signosVitales: {
      presionArterial: "125/85",
      frecuenciaCardiaca: "75",
      temperatura: "36.3",
      peso: "69",
      altura: "165",
    },
    diagnostico: "Hipertensión arterial controlada",
    tratamiento: "Ajuste de medicación",
    medicamentos: [
      {
        nombre: "Enalapril",
        dosis: "10mg",
        frecuencia: "1 vez al día",
        duracion: "3 meses",
      },
    ],
    estudiosComplementarios: [],
    indicaciones: "Dieta hiposódica. Control de peso. Ejercicio moderado.",
    proximoControl: "2024-01-15",
    observaciones: "Buen control de la presión arterial.",
  },
  {
    id: "3",
    pacienteId: "2",
    profesionalId: "3",
    fecha: "2024-01-14",
    hora: "09:00",
    profesional: "Dra. María López",
    especialidad: "Pediatría",
    motivo: "Consulta por dolor de espalda",
    anamnesis:
      "Paciente refiere dolor lumbar de 3 días de evolución, sin irradiación. Relacionado con esfuerzo físico.",
    examenFisico:
      "Contractura muscular paravertebral. Movilidad limitada por dolor.",
    signosVitales: {
      presionArterial: "130/85",
      frecuenciaCardiaca: "78",
      temperatura: "36.4",
      peso: "75",
      altura: "175",
    },
    diagnostico: "Lumbalgia mecánica",
    tratamiento: "Antiinflamatorios y relajantes musculares",
    medicamentos: [
      {
        nombre: "Ibuprofeno",
        dosis: "600mg",
        frecuencia: "Cada 8 horas",
        duracion: "7 días",
      },
      {
        nombre: "Diclofenac gel",
        dosis: "Aplicar",
        frecuencia: "3 veces al día",
        duracion: "10 días",
      },
    ],
    estudiosComplementarios: [],
    indicaciones:
      "Reposo relativo. Aplicar calor local. Evitar esfuerzos. Kinesiología si no mejora.",
    proximoControl: "2024-01-21",
    observaciones: "Paciente con trabajo de oficina. Recomendar ergonomía.",
  },
  {
    id: "4",
    pacienteId: "3",
    profesionalId: "2",
    fecha: "2024-01-12",
    hora: "16:30",
    profesional: "Dr. Carlos Mendez",
    especialidad: "Cardiología",
    motivo: "Control ginecológico anual",
    anamnesis:
      "Paciente asintomática. Ciclos menstruales regulares. Sin antecedentes familiares relevantes.",
    examenFisico:
      "Examen ginecológico normal. Mamas sin alteraciones palpables.",
    signosVitales: {
      presionArterial: "110/70",
      frecuenciaCardiaca: "68",
      temperatura: "36.2",
      peso: "58",
      altura: "160",
    },
    diagnostico: "Control ginecológico normal",
    tratamiento: "Preventivo",
    medicamentos: [],
    estudiosComplementarios: [
      { tipo: "Papanicolaou", resultado: "Pendiente", fecha: "2024-01-12" },
      { tipo: "Ecografía mamaria", resultado: "Normal", fecha: "2024-01-12" },
    ],
    indicaciones:
      "Continuar con controles anuales. Autoexamen mamario mensual.",
    proximoControl: "2025-01-12",
    observaciones: "Paciente joven, sin factores de riesgo.",
  },
];

export default function HistoriasClinicasPage() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pacienteId = searchParams.get("paciente");

  const [paciente, setPaciente] = useState<any>(null);
  const [historiaClinica, setHistoriaClinica] = useState<any[]>([]);
  const [showNuevaConsulta, setShowNuevaConsulta] = useState(false);
  const [vistaLista, setVistaLista] = useState(!pacienteId); // Si no hay pacienteId, mostrar lista
  const [filtroNombre, setFiltroNombre] = useState("");
  const [filtroEspecialidad, setFiltroEspecialidad] = useState("");
  const [pacientesFiltrados, setPacientesFiltrados] = useState<any[]>([]);

  const obtenerPacientesPermitidos = () => {
    if (!user) return [];

    if (user.role === "mesa-entrada") {
      return []; // Mesa de entrada no puede ver historias clínicas
    }

    if (user.role === "gerente") {
      return mockPacientes; // Gerente ve todos los pacientes
    }

    if (user.role === "profesional") {
      return mockPacientes.filter((p) =>
        p.profesionalesAsignados.includes(user.id)
      );
    }

    return [];
  };

  const filtrarPacientes = () => {
    const pacientesPermitidos = obtenerPacientesPermitidos();

    let filtrados = pacientesPermitidos;

    if (filtroNombre) {
      filtrados = filtrados.filter(
        (p) =>
          `${p.nombre} ${p.apellido}`
            .toLowerCase()
            .includes(filtroNombre.toLowerCase()) ||
          p.dni.includes(filtroNombre)
      );
    }

    if (filtroEspecialidad) {
      // Filtrar por especialidad basado en las consultas del paciente
      filtrados = filtrados.filter((p) => {
        const consultasPaciente = mockHistoriaClinica.filter(
          (h) => h.pacienteId === p.id
        );
        return consultasPaciente.some((c) =>
          c.especialidad
            .toLowerCase()
            .includes(filtroEspecialidad.toLowerCase())
        );
      });
    }

    setPacientesFiltrados(filtrados);
  };

  const verHistoriaClinica = (pacienteSeleccionado: any) => {
    router.push(`/historias-clinicas?paciente=${pacienteSeleccionado.id}`);
    setVistaLista(false);
  };

  const volverALista = () => {
    router.push("/historias-clinicas");
    setVistaLista(true);
    setPaciente(null);
    setHistoriaClinica([]);
  };

  useEffect(() => {
    if (vistaLista) {
      filtrarPacientes();
    }
  }, [filtroNombre, filtroEspecialidad, vistaLista, user]);

  useEffect(() => {
    if (pacienteId && !vistaLista) {
      // Buscar paciente
      const pacienteEncontrado = mockPacientes.find((p) => p.id === pacienteId);

      if (user?.role === "profesional" && pacienteEncontrado) {
        const tienePermiso = pacienteEncontrado.profesionalesAsignados.includes(
          user.id
        );
        if (!tienePermiso) {
          setPaciente(null);
          return;
        }
      }

      setPaciente(pacienteEncontrado);

      if (pacienteEncontrado) {
        // Buscar historia clínica
        let historia = mockHistoriaClinica.filter(
          (h) => h.pacienteId === pacienteId
        );

        if (user?.role === "profesional") {
          historia = historia.filter((h) => h.profesionalId === user.id);
        }

        setHistoriaClinica(
          historia.sort(
            (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
          )
        );
      }
    } else {
      setVistaLista(true);
    }
  }, [pacienteId, user, vistaLista]);

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
    return new Date(fecha).toLocaleDateString("es-AR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatearFechaCorta = (fecha: string) => {
    return new Date(fecha).toLocaleDateString("es-AR");
  };

  const handleNuevaConsulta = (nuevaConsulta: any) => {
    const consultaConId = {
      ...nuevaConsulta,
      id: (historiaClinica.length + 1).toString(),
      pacienteId: pacienteId,
      fecha: new Date().toISOString().split("T")[0],
      hora: new Date().toLocaleTimeString("es-AR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    setHistoriaClinica([consultaConId, ...historiaClinica]);
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

  if (user.role === "mesa-entrada") {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-32 space-y-4">
            <AlertCircle className="h-12 w-12 text-muted-foreground" />
            <p className="text-muted-foreground">
              No tienes permisos para acceder a las historias clínicas.
            </p>
            <Link href="/pacientes">
              <Button variant="outline" className="gap-2 bg-transparent">
                <ArrowLeft className="h-4 w-4" />
                Volver a Pacientes
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (vistaLista) {
    return (
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Historias Clínicas
            </h1>
            <p className="text-muted-foreground">
              {user.role === "profesional"
                ? "Historias clínicas de tus pacientes"
                : "Gestión de historias clínicas"}
            </p>
          </div>
        </div>

        {/* Filtros */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros de Búsqueda
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nombre o DNI..."
                  value={filtroNombre}
                  onChange={(e) => setFiltroNombre(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select
                value={filtroEspecialidad}
                onValueChange={setFiltroEspecialidad}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por especialidad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">
                    Todas las especialidades
                  </SelectItem>
                  <SelectItem value="cardiologia">Cardiología</SelectItem>
                  <SelectItem value="pediatria">Pediatría</SelectItem>
                  <SelectItem value="ginecologia">Ginecología</SelectItem>
                  <SelectItem value="medicina-general">
                    Medicina General
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Lista de pacientes */}
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
                  {obtenerPacientesPermitidos().length === 0
                    ? "No tienes pacientes asignados"
                    : "No se encontraron pacientes con los filtros aplicados"}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pacientesFiltrados.map((pacienteItem) => {
                  const consultasPaciente = mockHistoriaClinica.filter(
                    (h) => h.pacienteId === pacienteItem.id
                  );
                  const ultimaConsulta = consultasPaciente.sort(
                    (a, b) =>
                      new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
                  )[0];
                  const especialidades = [
                    ...new Set(consultasPaciente.map((c) => c.especialidad)),
                  ];

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
                              <p className="text-sm text-muted-foreground">
                                DNI: {pacienteItem.dni}
                              </p>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">
                              Consultas:
                            </span>
                            <Badge variant="secondary">
                              {consultasPaciente.length}
                            </Badge>
                          </div>

                          {ultimaConsulta && (
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">
                                Última consulta:
                              </span>
                              <span className="text-xs">
                                {formatearFechaCorta(ultimaConsulta.fecha)}
                              </span>
                            </div>
                          )}

                          {especialidades.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {especialidades.slice(0, 2).map((esp, idx) => (
                                <Badge
                                  key={idx}
                                  variant="outline"
                                  className="text-xs"
                                >
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
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!pacienteId || !paciente) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-32 space-y-4">
            <AlertCircle className="h-12 w-12 text-muted-foreground" />
            <p className="text-muted-foreground">
              {user.role === "profesional"
                ? "No tienes permisos para ver la historia clínica de este paciente."
                : "No se encontró el paciente especificado."}
            </p>
            <Button
              variant="outline"
              className="gap-2 bg-transparent"
              onClick={volverALista}
            >
              <ArrowLeft className="h-4 w-4" />
              Volver a Lista
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            className="gap-2"
            onClick={volverALista}
          >
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Historia Clínica
            </h1>
            <p className="text-muted-foreground">
              {user.role === "profesional"
                ? "Tus consultas con este paciente"
                : "Registro médico completo del paciente"}
            </p>
          </div>
        </div>
        {user.role === "profesional" && (
          <Button onClick={() => setShowNuevaConsulta(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Nueva Consulta
          </Button>
        )}
      </div>

      {/* Información del paciente */}
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
                  <strong>Edad:</strong>{" "}
                  {calcularEdad(paciente.fechaNacimiento)} años
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm">
                  <strong>Fecha de nacimiento:</strong>{" "}
                  {formatearFecha(paciente.fechaNacimiento)}
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-sm">
                <strong>Obra Social:</strong> {paciente.obraSocial}
              </div>
              <div className="text-sm">
                <strong>N° Afiliado:</strong> {paciente.numeroAfiliado}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resumen de la historia clínica */}
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
              <p className="text-2xl font-bold text-blue-600">
                {historiaClinica.length}
              </p>
              <p className="text-sm text-blue-700">Total Consultas</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <Calendar className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-green-600">
                {historiaClinica.length > 0
                  ? formatearFechaCorta(historiaClinica[0].fecha)
                  : "N/A"}
              </p>
              <p className="text-sm text-green-700">Última Consulta</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <Stethoscope className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-purple-600">
                {
                  [...new Set(historiaClinica.map((h) => h.especialidad))]
                    .length
                }
              </p>
              <p className="text-sm text-purple-700">Especialidades</p>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <Pill className="h-8 w-8 text-orange-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-orange-600">
                {historiaClinica.reduce(
                  (acc, h) => acc + (h.medicamentos?.length || 0),
                  0
                )}
              </p>
              <p className="text-sm text-orange-700">Medicamentos</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de consultas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {user.role === "profesional"
              ? "Mis Consultas"
              : "Historial de Consultas"}{" "}
            ({historiaClinica.length})
          </CardTitle>
          <CardDescription>
            {user.role === "profesional"
              ? "Consultas que has realizado con este paciente"
              : "Consultas ordenadas por fecha (más reciente primero)"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {historiaClinica.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {user.role === "profesional"
                  ? "No has realizado consultas con este paciente"
                  : "No hay consultas registradas"}
              </p>
              {user.role === "profesional" && (
                <Button
                  onClick={() => setShowNuevaConsulta(true)}
                  className="mt-4 gap-2"
                  variant="outline"
                >
                  <Plus className="h-4 w-4" />
                  Agregar Primera Consulta
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {historiaClinica.map((consulta, index) => (
                <div
                  key={consulta.id}
                  className="border border-border rounded-lg p-6 space-y-4"
                >
                  {/* Header de la consulta */}
                  <div className="flex items-center justify-between pb-4 border-b">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-primary">
                          #{historiaClinica.length - index}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">
                          {consulta.motivo}
                        </h3>
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

                  {/* Contenido de la consulta */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Columna izquierda */}
                    <div className="space-y-4">
                      {/* Anamnesis */}
                      <div>
                        <h4 className="font-medium text-sm text-muted-foreground mb-2">
                          ANAMNESIS
                        </h4>
                        <p className="text-sm">{consulta.anamnesis}</p>
                      </div>

                      {/* Examen físico */}
                      <div>
                        <h4 className="font-medium text-sm text-muted-foreground mb-2">
                          EXAMEN FÍSICO
                        </h4>
                        <p className="text-sm">{consulta.examenFisico}</p>
                      </div>

                      {/* Signos vitales */}
                      <div>
                        <h4 className="font-medium text-sm text-muted-foreground mb-2">
                          SIGNOS VITALES
                        </h4>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="flex items-center gap-1">
                            <Heart className="h-3 w-3 text-red-500" />
                            <span>
                              PA: {consulta.signosVitales.presionArterial} mmHg
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Activity className="h-3 w-3 text-blue-500" />
                            <span>
                              FC: {consulta.signosVitales.frecuenciaCardiaca}{" "}
                              lpm
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Thermometer className="h-3 w-3 text-orange-500" />
                            <span>
                              T°: {consulta.signosVitales.temperatura}°C
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Weight className="h-3 w-3 text-green-500" />
                            <span>Peso: {consulta.signosVitales.peso} kg</span>
                          </div>
                        </div>
                      </div>

                      {/* Diagnóstico */}
                      <div>
                        <h4 className="font-medium text-sm text-muted-foreground mb-2">
                          DIAGNÓSTICO
                        </h4>
                        <p className="text-sm font-medium">
                          {consulta.diagnostico}
                        </p>
                      </div>
                    </div>

                    {/* Columna derecha */}
                    <div className="space-y-4">
                      {/* Medicamentos */}
                      {consulta.medicamentos &&
                        consulta.medicamentos.length > 0 && (
                          <div>
                            <h4 className="font-medium text-sm text-muted-foreground mb-2">
                              MEDICAMENTOS
                            </h4>
                            <div className="space-y-2">
                              {consulta.medicamentos.map(
                                (med: any, idx: number) => (
                                  <div
                                    key={idx}
                                    className="bg-muted/50 p-2 rounded text-xs"
                                  >
                                    <div className="font-medium">
                                      {med.nombre} {med.dosis}
                                    </div>
                                    <div className="text-muted-foreground">
                                      {med.frecuencia} - {med.duracion}
                                    </div>
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        )}

                      {/* Estudios complementarios */}
                      {consulta.estudiosComplementarios &&
                        consulta.estudiosComplementarios.length > 0 && (
                          <div>
                            <h4 className="font-medium text-sm text-muted-foreground mb-2">
                              ESTUDIOS COMPLEMENTARIOS
                            </h4>
                            <div className="space-y-2">
                              {consulta.estudiosComplementarios.map(
                                (estudio: any, idx: number) => (
                                  <div
                                    key={idx}
                                    className="bg-muted/50 p-2 rounded text-xs"
                                  >
                                    <div className="font-medium">
                                      {estudio.tipo}
                                    </div>
                                    <div className="text-muted-foreground">
                                      {estudio.resultado} (
                                      {formatearFechaCorta(estudio.fecha)})
                                    </div>
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        )}

                      {/* Indicaciones */}
                      <div>
                        <h4 className="font-medium text-sm text-muted-foreground mb-2">
                          INDICACIONES
                        </h4>
                        <p className="text-sm">{consulta.indicaciones}</p>
                      </div>

                      {/* Próximo control */}
                      {consulta.proximoControl && (
                        <div>
                          <h4 className="font-medium text-sm text-muted-foreground mb-2">
                            PRÓXIMO CONTROL
                          </h4>
                          <p className="text-sm font-medium text-primary">
                            {formatearFecha(consulta.proximoControl)}
                          </p>
                        </div>
                      )}

                      {/* Observaciones */}
                      {consulta.observaciones && (
                        <div>
                          <h4 className="font-medium text-sm text-muted-foreground mb-2">
                            OBSERVACIONES
                          </h4>
                          <p className="text-sm italic">
                            {consulta.observaciones}
                          </p>
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

      {/* Dialog para nueva consulta */}
      {user.role === "profesional" && (
        <NuevaConsultaDialog
          open={showNuevaConsulta}
          onOpenChange={setShowNuevaConsulta}
          paciente={paciente}
          onConsultaCreada={handleNuevaConsulta}
        />
      )}
    </div>
  );
}
