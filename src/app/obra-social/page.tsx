"use client"

import { useState, useEffect } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Plus, Search, Loader2, Building2, CheckCircle, XCircle } from "lucide-react"
import { Switch } from "@/components/ui/switch"

type ObraSocial = {
  id: number
  nombre: string
  estado: "ACTIVA" | "INACTIVA"
}

export default function ObrasSocialesPage() {
  const { toast } = useToast()
  const [obrasSociales, setObrasSociales] = useState<ObraSocial[]>([])
  const [filteredOS, setFilteredOS] = useState<ObraSocial[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [showDialog, setShowDialog] = useState(false)
  const [newOSName, setNewOSName] = useState("")
  const [submitting, setSubmitting] = useState(false)

  // Cargar obras sociales
  const fetchObrasSociales = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/v1/obra_social")
      if (!response.ok) throw new Error("Error al cargar obras sociales")
      
      const data = await response.json()
      const sorted = data.obras_sociales.sort((a: ObraSocial, b: ObraSocial) => 
        a.nombre.localeCompare(b.nombre)
      )
      
      setObrasSociales(sorted)
      setFilteredOS(sorted)
    } catch (error) {
      console.error("Error fetching obras sociales:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar las obras sociales",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchObrasSociales()
  }, [])

  // Filtrar obras sociales por búsqueda
  useEffect(() => {
    const filtered = obrasSociales.filter((os) =>
      os.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredOS(filtered)
  }, [searchTerm, obrasSociales])

  // Agregar nueva obra social
  const handleAgregarOS = async () => {
    if (!newOSName.trim()) {
      toast({
        title: "Error",
        description: "El nombre de la obra social es obligatorio",
        variant: "destructive",
      })
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch("/api/v1/obra_social", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: newOSName.trim(),
          estado: 1, // ACTIVA
        }),
      })

      if (!response.ok) throw new Error("Error al crear obra social")

      toast({
        title: "Éxito",
        description: "Obra social creada correctamente",
      })

      setShowDialog(false)
      setNewOSName("")
      fetchObrasSociales()
    } catch (error) {
      console.error("Error creating obra social:", error)
      toast({
        title: "Error",
        description: "No se pudo crear la obra social",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  // Cambiar estado de obra social
  const handleToggleEstado = async (os: ObraSocial) => {
    const nuevoEstado = os.estado === "ACTIVA" ? "INACTIVA" : "ACTIVA"
    const estadoId = nuevoEstado === "ACTIVA" ? 1 : 2

    try {
      const response = await fetch("/api/v1/obra_social", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: os.id,
          nombre: os.nombre,
          estado: estadoId,
        }),
      })

      if (!response.ok) throw new Error("Error al actualizar obra social")

      toast({
        title: "Éxito",
        description: `Obra social ${nuevoEstado === "ACTIVA" ? "activada" : "desactivada"} correctamente`,
      })

      fetchObrasSociales()
    } catch (error) {
      console.error("Error updating obra social:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar la obra social",
        variant: "destructive",
      })
    }
  }

  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Obras Sociales</h1>
            <p className="text-muted-foreground">
              Gestión de obras sociales y prepagas
            </p>
          </div>
          <Button onClick={() => setShowDialog(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Nueva Obra Social
          </Button>
        </div>

        {/* Buscador */}
        <Card>
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar obra social por nombre..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Tabla */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Listado de Obras Sociales ({filteredOS.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : filteredOS.length === 0 ? (
              <div className="text-center py-8">
                <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  {searchTerm ? "No se encontraron obras sociales" : "No hay obras sociales registradas"}
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">ID</TableHead>
                    <TableHead>Nombre</TableHead>
                    <TableHead className="w-[150px]">Estado</TableHead>
                    <TableHead className="w-[120px] text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOS.map((os) => (
                    <TableRow key={os.id}>
                      <TableCell className="font-medium">{os.id}</TableCell>
                      <TableCell>{os.nombre}</TableCell>
                      <TableCell>
                        {os.estado === "ACTIVA" ? (
                          <Badge className="gap-1 bg-green-100 text-green-800 hover:bg-green-100">
                            <CheckCircle className="h-3 w-3" />
                            Activa
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="gap-1 bg-red-100 text-red-800">
                            <XCircle className="h-3 w-3" />
                            Inactiva
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Label htmlFor={`switch-${os.id}`} className="text-xs text-muted-foreground">
                            {os.estado === "ACTIVA" ? "Activa" : "Inactiva"}
                          </Label>
                          <Switch
                            id={`switch-${os.id}`}
                            checked={os.estado === "ACTIVA"}
                            onCheckedChange={() => handleToggleEstado(os)}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Dialog para agregar nueva obra social */}
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Nueva Obra Social
              </DialogTitle>
              <DialogDescription>
                Ingrese el nombre de la nueva obra social o prepaga
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre *</Label>
                <Input
                  id="nombre"
                  placeholder="Ej: OSDE, Swiss Medical, PAMI..."
                  value={newOSName}
                  onChange={(e) => setNewOSName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleAgregarOS()
                    }
                  }}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowDialog(false)
                  setNewOSName("")
                }}
                disabled={submitting}
              >
                Cancelar
              </Button>
              <Button onClick={handleAgregarOS} disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  "Guardar"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  )
}