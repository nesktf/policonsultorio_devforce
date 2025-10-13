import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

// Extender el tipo de jsPDF para incluir lastAutoTable
declare module 'jspdf' {
  interface jsPDF {
    lastAutoTable: {
      finalY: number
    }
  }
}

const addHeader = (doc: jsPDF, title: string, subtitle?: string) => {
  
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  // MEJORA: Color principal para el título (Azul)
  doc.setTextColor(59, 130, 246) 
  doc.text(title, 14, 22)
  
  if (subtitle) {
    doc.setFontSize(11)
    doc.setFont('helvetica', 'normal')
    // MEJORA: Gris más oscuro para mejor lectura
    doc.setTextColor(96, 108, 120) 
    doc.text(subtitle, 14, 30)
  }
  
  doc.setFontSize(9)
  // MEJORA: Gris más oscuro para la fecha
  doc.setTextColor(96, 108, 120) 
  doc.text(`Generado: ${new Date().toLocaleDateString('es-AR', { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })}`, 14, subtitle ? 36 : 30)
  
  // Línea divisoria
  // MEJORA: Usar color principal y un grosor sutil
  doc.setDrawColor(59, 130, 246) 
  doc.setLineWidth(0.5) 
  doc.line(14, subtitle ? 40 : 34, 196, subtitle ? 40 : 34)
  
  // Restaurar color de texto a negro y color de línea a negro (por si acaso) para el contenido
  doc.setTextColor(0, 0, 0) 
  doc.setDrawColor(0, 0, 0) 
}

const addFooter = (doc: jsPDF, pageNumber: number) => {
  const pageCount = doc.getNumberOfPages()
  doc.setFontSize(8)
  // MEJORA: Usar fuente itálica para el footer
  doc.setFont('helvetica', 'italic') 
  doc.setTextColor(150, 150, 150)
  doc.text(
    `Página ${pageNumber} de ${pageCount}`,
    doc.internal.pageSize.width / 2,
    doc.internal.pageSize.height - 10,
    { align: 'center' }
  )
  doc.setFont('helvetica', 'normal') // Restaurar fuente normal
}

// ============================================
// REPORTE OBRA SOCIAL
// ============================================

interface ReporteObraSocialData {
  obraSocial: {
    nombre: string
  }
  metricas: {
    totalPacientes: number
    pacientesActivos: number
    totalProfesionales: number
    totalTurnos: number
  }
  turnosPorEstado: {
    PROGRAMADO: number
    EN_SALA_ESPERA: number
    ASISTIO: number
    NO_ASISTIO: number
    CANCELADO: number
  }
  profesionales: Array<{
    id: number
    nombre: string
    especialidad: string
    turnosAtendidos: number
  }>
  distribucionEspecialidades: Array<{
    especialidad: string
    cantidad: number
  }>
}

export function exportarReporteObraSocial(reporte: ReporteObraSocialData) {
  const doc = new jsPDF()
  
  // Header
  addHeader(
    doc, 
    'Reporte de Obra Social',
    reporte.obraSocial.nombre
  )
  
  let yPos = 48
  
  // Métricas principales
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('Métricas Principales', 14, yPos)
  
  const metricas = [
    ['Métrica', 'Valor'],
    ['Total Pacientes', reporte.metricas.totalPacientes.toLocaleString('es-AR')],
    ['Pacientes Activos (último mes)', reporte.metricas.pacientesActivos.toLocaleString('es-AR')],
    ['Total Profesionales', reporte.metricas.totalProfesionales.toLocaleString('es-AR')],
    ['Total Turnos', reporte.metricas.totalTurnos.toLocaleString('es-AR')],
  ]
  
  autoTable(doc, {
    startY: yPos + 5,
    head: [metricas[0]],
    body: metricas.slice(1),
    theme: 'striped',
    headStyles: { 
      fillColor: [59, 130, 246],
      fontSize: 10,
      fontStyle: 'bold'
    },
    styles: {
      fontSize: 9,
      cellPadding: 3
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 80 }, 
      1: { cellWidth: 'auto' }
    }
  })
  
  // Distribución de Turnos
  yPos = doc.lastAutoTable.finalY + 15
  
  if (yPos > 240) {
    doc.addPage()
    yPos = 20
  }
  
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('Distribución de Turnos por Estado', 14, yPos)
  
  const totalTurnos = reporte.metricas.totalTurnos
  const turnosData = [
    ['Estado', 'Cantidad', 'Porcentaje'],
    [
      'Asistió', 
      reporte.turnosPorEstado.ASISTIO.toLocaleString('es-AR'),
      totalTurnos > 0 ? `${((reporte.turnosPorEstado.ASISTIO / totalTurnos) * 100).toFixed(1)}%` : '0%'
    ],
    [
      'Programados', 
      reporte.turnosPorEstado.PROGRAMADO.toLocaleString('es-AR'),
      totalTurnos > 0 ? `${((reporte.turnosPorEstado.PROGRAMADO / totalTurnos) * 100).toFixed(1)}%` : '0%'
    ],
    [
      'No Asistió', 
      reporte.turnosPorEstado.NO_ASISTIO.toLocaleString('es-AR'),
      totalTurnos > 0 ? `${((reporte.turnosPorEstado.NO_ASISTIO / totalTurnos) * 100).toFixed(1)}%` : '0%'
    ],
    [
      'Cancelados', 
      reporte.turnosPorEstado.CANCELADO.toLocaleString('es-AR'),
      totalTurnos > 0 ? `${((reporte.turnosPorEstado.CANCELADO / totalTurnos) * 100).toFixed(1)}%` : '0%'
    ],
    [
      'En Sala de Espera', 
      reporte.turnosPorEstado.EN_SALA_ESPERA.toLocaleString('es-AR'),
      totalTurnos > 0 ? `${((reporte.turnosPorEstado.EN_SALA_ESPERA / totalTurnos) * 100).toFixed(1)}%` : '0%'
    ],
  ]
  
  autoTable(doc, {
    startY: yPos + 5,
    head: [turnosData[0]],
    body: turnosData.slice(1),
    theme: 'striped',
    headStyles: { 
      fillColor: [59, 130, 246],
      fontSize: 10,
      fontStyle: 'bold'
    },
    styles: {
      fontSize: 9,
      cellPadding: 3
    },
    columnStyles: {
      // ✅ Aplicar negrita a la primera columna para resaltar el estado
      0: { fontStyle: 'bold', cellWidth: 80 }, 
      1: {  cellWidth: 50 },
      2: {  cellWidth: 'auto' }
    }
  })
  
  // Distribución por Especialidad
  yPos = doc.lastAutoTable.finalY + 15
  
  if (yPos > 240) {
    doc.addPage()
    yPos = 20
  }
  
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('Profesionales por Especialidad', 14, yPos)
  
  const totalProfesionales = reporte.metricas.totalProfesionales
  const especialidadesData = [
    ['Especialidad', 'Cantidad', 'Porcentaje'],
    ...reporte.distribucionEspecialidades.map(esp => [
      esp.especialidad,
      esp.cantidad.toLocaleString('es-AR'),
      totalProfesionales > 0 ? `${((esp.cantidad / totalProfesionales) * 100).toFixed(1)}%` : '0%'
    ])
  ]
  
  autoTable(doc, {
    startY: yPos + 5,
    head: [especialidadesData[0]],
    body: especialidadesData.slice(1),
    theme: 'striped',
    headStyles: { 
      fillColor: [59, 130, 246],
      fontSize: 10,
      fontStyle: 'bold'
    },
    styles: {
      fontSize: 9,
      cellPadding: 3
    },
    columnStyles: {
      // ✅ Aplicar negrita a la primera columna para resaltar la especialidad
      0: { fontStyle: 'bold', cellWidth: 100 }, 
      1: {  cellWidth: 40 },
      2: {  cellWidth: 'auto' }
    }
  })
  
  // Ranking de Profesionales
  yPos = doc.lastAutoTable.finalY + 15
  
  if (yPos > 200) {
    doc.addPage()
    yPos = 20
  }
  
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('Ranking de Profesionales', 14, yPos)
  
  const profesionalesData = [
    ['#', 'Profesional', 'Especialidad', 'Turnos Atendidos'],
    ...reporte.profesionales.slice(0, 20).map((prof, idx) => [
      (idx + 1).toString(),
      prof.nombre,
      prof.especialidad,
      prof.turnosAtendidos.toLocaleString('es-AR')
    ])
  ]
  
  autoTable(doc, {
    startY: yPos + 5,
    head: [profesionalesData[0]],
    body: profesionalesData.slice(1),
    theme: 'striped',
    headStyles: { 
      fillColor: [59, 130, 246],
      fontSize: 10,
      fontStyle: 'bold'
    },
    styles: {
      fontSize: 9,
      cellPadding: 3
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 15 },
      // ✅ Aplicar negrita a la columna 'Profesional'
      1: { fontStyle: 'bold', cellWidth: 70 }, 
      2: { cellWidth: 60 },
      3: {  cellWidth: 'auto' }
    }
  })
  
  // Agregar pie de página a todas las páginas
  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    addFooter(doc, i)
  }
  
  // Guardar
  const fileName = `reporte-obra-social-${reporte.obraSocial.nombre.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`
  doc.save(fileName)
}

// ============================================
// REPORTE PACIENTES NUEVOS
// ============================================

interface ReportePacientesNuevosData {
  fechaInicio: string
  fechaFin: string
  total: number
  periodos: Array<{
    id: string
    label: string
    cantidad: number
    fechaInicio: string
    fechaFin: string
  }>
  distribucionObrasSociales: Array<{
    nombre: string
    cantidad: number
  }>
  promedioDiario: number
  diasAnalizados: number
}

export function exportarReportePacientesNuevos(reporte: ReportePacientesNuevosData, groupBy: string) {
  const doc = new jsPDF()
  
  // Header
  const fechaInicio = new Date(reporte.fechaInicio).toLocaleDateString('es-AR')
  const fechaFin = new Date(reporte.fechaFin).toLocaleDateString('es-AR')
  
  addHeader(
    doc, 
    'Reporte de Pacientes Nuevos',
    `Período: ${fechaInicio} - ${fechaFin}`
  )
  
  let yPos = 48
  
  // Resumen General
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('Resumen General', 14, yPos)
  
  const resumen = [
    ['Métrica', 'Valor'],
    ['Total Pacientes Nuevos', reporte.total.toLocaleString('es-AR')],
    ['Promedio Diario', reporte.promedioDiario.toFixed(2)],
    ['Días Analizados', reporte.diasAnalizados.toLocaleString('es-AR')],
  ]
  
  autoTable(doc, {
    startY: yPos + 5,
    head: [resumen[0]],
    body: resumen.slice(1),
    theme: 'striped',
    headStyles: { 
      fillColor: [59, 130, 246],
      fontSize: 10,
      fontStyle: 'bold'
    },
    styles: {
      fontSize: 9,
      cellPadding: 3
    },
    columnStyles: {
      // ✅ Asegurar Negrita en la primera columna ('Métrica')
      0: { fontStyle: 'bold', cellWidth: 80 }, 
      1: {  cellWidth: 'auto' }
    }
  })
  
  // Distribución Temporal
  yPos = doc.lastAutoTable.finalY + 15
  
  if (yPos > 200) {
    doc.addPage()
    yPos = 20
  }
  
  const agrupacionLabel = groupBy === 'day' ? 'Diaria' : groupBy === 'week' ? 'Semanal' : 'Mensual'
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text(`Distribución Temporal (${agrupacionLabel})`, 14, yPos)
  
  const periodosData = [
    ['Período', 'Cantidad', 'Porcentaje'],
    ...reporte.periodos.map(periodo => [
      periodo.label,
      periodo.cantidad.toLocaleString('es-AR'),
      reporte.total > 0 ? `${((periodo.cantidad / reporte.total) * 100).toFixed(1)}%` : '0%'
    ])
  ]
  
  autoTable(doc, {
    startY: yPos + 5,
    head: [periodosData[0]],
    body: periodosData.slice(1),
    theme: 'striped',
    headStyles: { 
      fillColor: [59, 130, 246],
      fontSize: 10,
      fontStyle: 'bold'
    },
    styles: {
      fontSize: 9,
      cellPadding: 3
    },
    columnStyles: {
      // ✅ Aplicar negrita a la primera columna para resaltar el Período
      0: { fontStyle: 'bold', cellWidth: 100 },
      1: {  cellWidth: 40 },
      2: {  cellWidth: 'auto' }
    }
  })
  
  // Distribución por Obra Social
  yPos = doc.lastAutoTable.finalY + 15
  
  if (yPos > 220) {
    doc.addPage()
    yPos = 20
  }
  
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('Distribución por Obra Social', 14, yPos)
  
  const obrasSocialesData = [
    ['Obra Social', 'Pacientes', 'Porcentaje'],
    ...reporte.distribucionObrasSociales.map(os => [
      os.nombre,
      os.cantidad.toLocaleString('es-AR'),
      reporte.total > 0 ? `${((os.cantidad / reporte.total) * 100).toFixed(1)}%` : '0%'
    ])
  ]
  
  autoTable(doc, {
    startY: yPos + 5,
    head: [obrasSocialesData[0]],
    body: obrasSocialesData.slice(1),
    theme: 'striped',
    headStyles: { 
      fillColor: [59, 130, 246],
      fontSize: 10,
      fontStyle: 'bold'
    },
    styles: {
      fontSize: 9,
      cellPadding: 3
    },
    columnStyles: {
      // ✅ Aplicar negrita a la primera columna para resaltar la Obra Social
      0: { fontStyle: 'bold', cellWidth: 100 },
      1: { cellWidth: 40 },
      2: { cellWidth: 'auto' }
    }
  })
  
  // Agregar pie de página a todas las páginas
  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    addFooter(doc, i)
  }
  
  // Guardar
  const fileName = `reporte-pacientes-nuevos-${new Date().toISOString().split('T')[0]}.pdf`
  doc.save(fileName)
}

// ============================================
// REPORTE TURNOS POR ESPECIALIDAD
// ============================================

interface ReporteTurnosEspecialidadData {
  rango: {
    from: string
    to: string
  }
  totalEspecialidades: number
  totalTurnos: number
  resultados: Array<{
    especialidad: string
    total: number
    programados: number
    enSalaEspera: number
    asistidos: number
    noAsistidos: number
    cancelados: number
  }>
}

export function exportarReporteTurnosEspecialidad(reporte: ReporteTurnosEspecialidadData) {
  const doc = new jsPDF()
  
  // Header
  const fechaInicio = new Date(reporte.rango.from).toLocaleDateString('es-AR')
  const fechaFin = new Date(reporte.rango.to).toLocaleDateString('es-AR')
  
  addHeader(
    doc, 
    'Reporte de Turnos por Especialidad',
    `Período: ${fechaInicio} - ${fechaFin}`
  )
  
  let yPos = 48
  
  // Resumen General
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('Resumen General', 14, yPos)
  
  const totales = {
    programados: reporte.resultados.reduce((sum, esp) => sum + esp.programados, 0),
    enSalaEspera: reporte.resultados.reduce((sum, esp) => sum + esp.enSalaEspera, 0),
    asistidos: reporte.resultados.reduce((sum, esp) => sum + esp.asistidos, 0),
    noAsistidos: reporte.resultados.reduce((sum, esp) => sum + esp.noAsistidos, 0),
    cancelados: reporte.resultados.reduce((sum, esp) => sum + esp.cancelados, 0),
  }
  
  const resumen = [
    ['Estado', 'Cantidad', 'Porcentaje'],
    ['Total Turnos', reporte.totalTurnos.toLocaleString('es-AR'), '100.0%'],
    [
      'Programados', 
      totales.programados.toLocaleString('es-AR'), 
      reporte.totalTurnos > 0 ? `${((totales.programados / reporte.totalTurnos) * 100).toFixed(1)}%` : '0.0%'
    ],
    [
      'En Sala de Espera', 
      totales.enSalaEspera.toLocaleString('es-AR'), 
      reporte.totalTurnos > 0 ? `${((totales.enSalaEspera / reporte.totalTurnos) * 100).toFixed(1)}%` : '0.0%'
    ],
    [
      'Asistidos', 
      totales.asistidos.toLocaleString('es-AR'), 
      reporte.totalTurnos > 0 ? `${((totales.asistidos / reporte.totalTurnos) * 100).toFixed(1)}%` : '0.0%'
    ],
    [
      'No Asistidos', 
      totales.noAsistidos.toLocaleString('es-AR'), 
      reporte.totalTurnos > 0 ? `${((totales.noAsistidos / reporte.totalTurnos) * 100).toFixed(1)}%` : '0.0%'
    ],
    [
      'Cancelados', 
      totales.cancelados.toLocaleString('es-AR'), 
      reporte.totalTurnos > 0 ? `${((totales.cancelados / reporte.totalTurnos) * 100).toFixed(1)}%` : '0.0%'
    ],
  ]
  
  autoTable(doc, {
    startY: yPos + 5,
    head: [resumen[0]],
    body: resumen.slice(1),
    theme: 'striped',
    headStyles: { 
      fillColor: [59, 130, 246],
      fontSize: 10,
      fontStyle: 'bold'
    },
    styles: {
      fontSize: 9,
      cellPadding: 3
    },
    columnStyles: {
      // ✅ Asegurar Negrita en la primera columna ('Estado')
      0: { fontStyle: 'bold', cellWidth: 70 }, 
      1: {  cellWidth: 40 },
      2: {  cellWidth: 'auto' }
    },
    // Resaltar la fila de 'Total Turnos'
    didDrawCell: (data) => {
      // La fila de 'Total Turnos' es la primera en el 'body' (index 0)
      if (data.row.index === 0 && data.section === 'body') {
        doc.setFillColor(240, 248, 255); // Fondo azul muy claro
        doc.rect(data.cell.x, data.cell.y, data.cell.width, data.cell.height, 'F');
        doc.setTextColor(59, 130, 246); // Texto color primario
        doc.setFont('helvetica', 'bold');
      } else {
        // Restaurar estilos para otras filas
        doc.setTextColor(0, 0, 0);
        doc.setFont('helvetica', 'normal');
      }
    }
  })
  
  // Desglose por Especialidad
  yPos = doc.lastAutoTable.finalY + 15
  
  if (yPos > 180) {
    doc.addPage()
    yPos = 20
  }
  
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('Desglose por Especialidad', 14, yPos)
  
  const especialidadesData = [
    ['Especialidad', 'Total', 'Prog.', 'Sala', 'Asist.', 'No As.', 'Canc.'],
    ...reporte.resultados
      .sort((a, b) => b.total - a.total)
      .map(esp => [
        esp.especialidad,
        esp.total.toLocaleString('es-AR'),
        esp.programados.toString(),
        esp.enSalaEspera.toString(),
        esp.asistidos.toString(),
        esp.noAsistidos.toString(),
        esp.cancelados.toString()
      ])
  ]
  
  autoTable(doc, {
    startY: yPos + 5,
    head: [especialidadesData[0]],
    body: especialidadesData.slice(1),
    theme: 'striped',
    headStyles: { 
      fillColor: [59, 130, 246],
      fontSize: 9,
      fontStyle: 'bold'
    },
    styles: {
      fontSize: 8,
      cellPadding: 2
    },
    columnStyles: {
      // ✅ Aplicar negrita a la primera columna para resaltar la Especialidad
      0: { fontStyle: 'bold', cellWidth: 60 },
      1: {  cellWidth: 25 },
      2: { cellWidth: 20 },
      3: { cellWidth: 18 },
      4: { cellWidth: 20 },
      5: { cellWidth: 20 },
      6: { cellWidth: 20 }
    }
  })
  
  // Agregar pie de página a todas las páginas
  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    addFooter(doc, i)
  }
  
  // Guardar
  const fileName = `reporte-turnos-especialidad-${new Date().toISOString().split('T')[0]}.pdf`
  doc.save(fileName)
}