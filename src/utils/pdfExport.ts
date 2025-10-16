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

// Función para cargar el logo como base64
const loadLogo = async (): Promise<string | null> => {
  try {
    const response = await fetch('/logo.png')
    const blob = await response.blob()
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result as string)
      reader.onerror = () => resolve(null)
      reader.readAsDataURL(blob)
    })
  } catch (error) {
    console.error('Error cargando logo:', error)
    return null
  }
}

const addHeader = async (doc: jsPDF, title: string, subtitle?: string) => {
  // Intentar cargar y agregar el logo
  const logoData = await loadLogo()
  
  if (logoData) {
    try {
      // Agregar logo en la esquina superior derecha
      doc.addImage(logoData, 'PNG', 160, 10, 30, 30)
    } catch (error) {
      console.error('Error agregando logo al PDF:', error)
    }
  }
  
  // Nombre de la empresa
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(59, 130, 246)
  doc.text('POLICONSULTORIO DEVFORCE', 14, 15)
  
  // Título del reporte
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(30, 41, 59) // Gris oscuro más elegante
  doc.text(title, 14, 28)
  
  // Subtítulo
  if (subtitle) {
    doc.setFontSize(11)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(71, 85, 105)
    doc.text(subtitle, 14, 36)
  }
  
  // Fecha de generación
  doc.setFontSize(9)
  doc.setTextColor(100, 116, 139)
  doc.text(`Generado el ${new Date().toLocaleDateString('es-AR', { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })}`, 14, subtitle ? 42 : 38)
  
  // Línea divisoria con gradiente visual
  doc.setDrawColor(59, 130, 246)
  doc.setLineWidth(0.8)
  doc.line(14, subtitle ? 46 : 42, 196, subtitle ? 46 : 42)
  
  // Línea secundaria más delgada
  doc.setDrawColor(226, 232, 240)
  doc.setLineWidth(0.3)
  doc.line(14, subtitle ? 47 : 43, 196, subtitle ? 47 : 43)
  
  // Restaurar colores
  doc.setTextColor(0, 0, 0)
  doc.setDrawColor(0, 0, 0)
}

const addFooter = (doc: jsPDF, pageNumber: number) => {
  const pageCount = doc.getNumberOfPages()
  const pageHeight = doc.internal.pageSize.height
  
  // Línea superior del footer
  doc.setDrawColor(226, 232, 240)
  doc.setLineWidth(0.5)
  doc.line(14, pageHeight - 20, 196, pageHeight - 20)
  
  // Nombre de la empresa a la izquierda
  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(71, 85, 105)
  doc.text('Policonsultorio DevForce', 14, pageHeight - 12)
  
  // Número de página al centro
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(100, 116, 139)
  doc.text(
    `Página ${pageNumber} de ${pageCount}`,
    doc.internal.pageSize.width / 2,
    pageHeight - 12,
    { align: 'center' }
  )
  
  // Información adicional a la derecha
  doc.setFontSize(7)
  doc.setTextColor(148, 163, 184)
  doc.text('Sistema de Gestión Médica', 196, pageHeight - 12, { align: 'right' })
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

export async function exportarReporteObraSocial(reporte: ReporteObraSocialData) {
  const doc = new jsPDF()
  
  // Header (ahora es async)
  await addHeader(
    doc, 
    'Reporte de Obra Social',
    reporte.obraSocial.nombre
  )
  
  let yPos = 54
  
  // Métricas principales
  doc.setFontSize(13)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(30, 41, 59)
  doc.text('Métricas Principales', 14, yPos)
  
  const metricas = [
    ['Métrica', 'Valor'],
    ['Total Pacientes', reporte.metricas.totalPacientes.toLocaleString('es-AR')],
    ['Pacientes Activos (último mes)', reporte.metricas.pacientesActivos.toLocaleString('es-AR')],
    ['Total Profesionales', reporte.metricas.totalProfesionales.toLocaleString('es-AR')],
    ['Total Turnos', reporte.metricas.totalTurnos.toLocaleString('es-AR')],
  ]
  
  autoTable(doc, {
    startY: yPos + 6,
    head: [metricas[0]],
    body: metricas.slice(1),
    theme: 'striped',
    headStyles: { 
      fillColor: [59, 130, 246],
      textColor: [255, 255, 255],
      fontSize: 10,
      fontStyle: 'bold',
      halign: 'left'
    },
    styles: {
      fontSize: 9,
      cellPadding: 4,
      lineColor: [226, 232, 240],
      lineWidth: 0.1
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 90, textColor: [51, 65, 85] }, 
      1: { cellWidth: 'auto', halign: 'right', fontStyle: 'bold', textColor: [59, 130, 246] }
    }
  })
  
  // Distribución de Turnos
  yPos = doc.lastAutoTable.finalY + 15
  
  if (yPos > 235) {
    doc.addPage()
    yPos = 20
  }
  
  doc.setFontSize(13)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(30, 41, 59)
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
    startY: yPos + 6,
    head: [turnosData[0]],
    body: turnosData.slice(1),
    theme: 'striped',
    headStyles: { 
      fillColor: [59, 130, 246],
      textColor: [255, 255, 255],
      fontSize: 10,
      fontStyle: 'bold'
    },
    styles: {
      fontSize: 9,
      cellPadding: 4,
      lineColor: [226, 232, 240],
      lineWidth: 0.1
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 85, textColor: [51, 65, 85] }, 
      1: { cellWidth: 50, halign: 'right', fontStyle: 'bold', textColor: [59, 130, 246] },
      2: { cellWidth: 'auto', halign: 'right', textColor: [71, 85, 105] }
    }
  })
  
  // Distribución por Especialidad
  yPos = doc.lastAutoTable.finalY + 15
  
  if (yPos > 235) {
    doc.addPage()
    yPos = 20
  }
  
  doc.setFontSize(13)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(30, 41, 59)
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
    startY: yPos + 6,
    head: [especialidadesData[0]],
    body: especialidadesData.slice(1),
    theme: 'striped',
    headStyles: { 
      fillColor: [59, 130, 246],
      textColor: [255, 255, 255],
      fontSize: 10,
      fontStyle: 'bold'
    },
    styles: {
      fontSize: 9,
      cellPadding: 4,
      lineColor: [226, 232, 240],
      lineWidth: 0.1
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 105, textColor: [51, 65, 85] }, 
      1: { cellWidth: 40, halign: 'right', fontStyle: 'bold', textColor: [59, 130, 246] },
      2: { cellWidth: 'auto', halign: 'right', textColor: [71, 85, 105] }
    }
  })
  
  // Ranking de Profesionales
  yPos = doc.lastAutoTable.finalY + 15
  
  if (yPos > 195) {
    doc.addPage()
    yPos = 20
  }
  
  doc.setFontSize(13)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(30, 41, 59)
  doc.text('Ranking de Profesionales', 14, yPos)
  
  const profesionalesData = [
    ['#', 'Profesional', 'Especialidad', 'Turnos'],
    ...reporte.profesionales.slice(0, 20).map((prof, idx) => [
      (idx + 1).toString(),
      prof.nombre,
      prof.especialidad,
      prof.turnosAtendidos.toLocaleString('es-AR')
    ])
  ]
  
  autoTable(doc, {
    startY: yPos + 6,
    head: [profesionalesData[0]],
    body: profesionalesData.slice(1),
    theme: 'striped',
    headStyles: { 
      fillColor: [59, 130, 246],
      textColor: [255, 255, 255],
      fontSize: 10,
      fontStyle: 'bold'
    },
    styles: {
      fontSize: 9,
      cellPadding: 4,
      lineColor: [226, 232, 240],
      lineWidth: 0.1
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 12, fontStyle: 'bold', fillColor: [240, 249, 255] },
      1: { fontStyle: 'bold', cellWidth: 70, textColor: [51, 65, 85] }, 
      2: { cellWidth: 60, textColor: [71, 85, 105] },
      3: { cellWidth: 'auto', halign: 'right', fontStyle: 'bold', textColor: [59, 130, 246] }
    },
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
  obraSocialFiltro?: string
}

export async function exportarReportePacientesNuevos(reporte: ReportePacientesNuevosData, groupBy: string) {
  const doc = new jsPDF()
  
  // Header
  const fechaInicio = new Date(reporte.fechaInicio).toLocaleDateString('es-AR')
  const fechaFin = new Date(reporte.fechaFin).toLocaleDateString('es-AR')
  
  // Construir el subtítulo con el filtro de obra social si existe
  let subtitle = `Período: ${fechaInicio} - ${fechaFin}`
  if (reporte.obraSocialFiltro) {
    subtitle += ` | Obra Social: ${reporte.obraSocialFiltro}`
  }
  
  await addHeader(
    doc, 
    'Reporte de Pacientes Nuevos',
    subtitle 
  )
  
  let yPos = 54
  
  // Resumen General
  doc.setFontSize(13)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(30, 41, 59)
  doc.text('Resumen General', 14, yPos)
  
  const resumen = [
    ['Métrica', 'Valor'],
    ['Total Pacientes Nuevos', reporte.total.toLocaleString('es-AR')],
    ['Promedio Diario', reporte.promedioDiario.toFixed(2)],
    ['Días Analizados', reporte.diasAnalizados.toLocaleString('es-AR')],
  ]
  
  autoTable(doc, {
    startY: yPos + 6,
    head: [resumen[0]],
    body: resumen.slice(1),
    theme: 'striped',
    headStyles: { 
      fillColor: [59, 130, 246],
      textColor: [255, 255, 255],
      fontSize: 10,
      fontStyle: 'bold'
    },
    styles: {
      fontSize: 9,
      cellPadding: 4,
      lineColor: [226, 232, 240],
      lineWidth: 0.1
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 90, textColor: [51, 65, 85] }, 
      1: { cellWidth: 'auto', halign: 'right', fontStyle: 'bold', textColor: [59, 130, 246] }
    }
  })
  
  // Distribución Temporal
  yPos = doc.lastAutoTable.finalY + 15
  
  if (yPos > 195) {
    doc.addPage()
    yPos = 20
  }
  
  const agrupacionLabel = groupBy === 'day' ? 'Diaria' : groupBy === 'week' ? 'Semanal' : 'Mensual'
  doc.setFontSize(13)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(30, 41, 59)
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
    startY: yPos + 6,
    head: [periodosData[0]],
    body: periodosData.slice(1),
    theme: 'striped',
    headStyles: { 
      fillColor: [59, 130, 246],
      textColor: [255, 255, 255],
      fontSize: 10,
      fontStyle: 'bold'
    },
    styles: {
      fontSize: 9,
      cellPadding: 4,
      lineColor: [226, 232, 240],
      lineWidth: 0.1
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 105, textColor: [51, 65, 85] },
      1: { cellWidth: 40, halign: 'right', fontStyle: 'bold', textColor: [59, 130, 246] },
      2: { cellWidth: 'auto', halign: 'right', textColor: [71, 85, 105] }
    }
  })
  
  // Distribución por Obra Social
  yPos = doc.lastAutoTable.finalY + 15
  
  if (yPos > 215) {
    doc.addPage()
    yPos = 20
  }
  
  doc.setFontSize(13)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(30, 41, 59)
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
    startY: yPos + 6,
    head: [obrasSocialesData[0]],
    body: obrasSocialesData.slice(1),
    theme: 'striped',
    headStyles: { 
      fillColor: [59, 130, 246],
      textColor: [255, 255, 255],
      fontSize: 10,
      fontStyle: 'bold'
    },
    styles: {
      fontSize: 9,
      cellPadding: 4,
      lineColor: [226, 232, 240],
      lineWidth: 0.1
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 105, textColor: [51, 65, 85] },
      1: { cellWidth: 40, halign: 'right', fontStyle: 'bold', textColor: [59, 130, 246] },
      2: { cellWidth: 'auto', halign: 'right', textColor: [71, 85, 105] }
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
// REPORTE PACIENTES ATENDIDOS
// ============================================

interface ReportePacientesAtendidosData {
  rango: {
    from: string
    to: string
  }
  filtros: {
    especialidad: string | null
  }
  resumen: {
    totalTurnos: number
    asistidos: number
    noAsistidos: number
    cancelados: number
    tasaAsistencia: number
    comparacionAnterior: {
      asistidosAnteriores: number
      diferencia: number
      variacion: number
    }
  }
  distribucion: Array<{
    etiqueta: string
    valor: number
    porcentaje: number
  }>
  detalle: Array<{
    etiqueta: string
    rango: string
    total: number
    asistidos: number
    noAsistidos: number
    cancelados: number
    tasaAsistencia: number
  }>
}

interface ExportOpcionesPacientesAtendidos {
  agrupacionLabel: string
  especialidadLabel: string
}

export async function exportarReportePacientesAtendidos(
  reporte: ReportePacientesAtendidosData,
  opciones: ExportOpcionesPacientesAtendidos,
) {
  const doc = new jsPDF()
  const numberFormatter = new Intl.NumberFormat('es-AR')
  const percentFormatter = new Intl.NumberFormat('es-AR', {
    style: 'percent',
    maximumFractionDigits: 1,
    minimumFractionDigits: 1,
  })

  const fechaDesde = new Date(reporte.rango.from).toLocaleDateString('es-AR')
  const fechaHasta = new Date(reporte.rango.to).toLocaleDateString('es-AR')

  const subtitle = [
    `Período: ${fechaDesde} - ${fechaHasta}`,
    `Agrupación: ${opciones.agrupacionLabel}`,
    `Especialidad: ${opciones.especialidadLabel}`,
  ].join(' | ')

  await addHeader(doc, 'Reporte de Pacientes Atendidos', subtitle)

  let yPos = 54

  doc.setFontSize(13)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(30, 41, 59)
  doc.text('Indicadores principales', 14, yPos)

  const resumen = [
    ['Turnos totales', numberFormatter.format(reporte.resumen.totalTurnos)],
    ['Pacientes asistidos', numberFormatter.format(reporte.resumen.asistidos)],
    ['Pacientes no asistidos', numberFormatter.format(reporte.resumen.noAsistidos)],
    ['Turnos cancelados', numberFormatter.format(reporte.resumen.cancelados)],
    ['Tasa de asistencia', percentFormatter.format(reporte.resumen.tasaAsistencia || 0)],
    [
      'Asistidos período anterior',
      numberFormatter.format(reporte.resumen.comparacionAnterior.asistidosAnteriores),
    ],
    [
      'Diferencia vs. período anterior',
      numberFormatter.format(reporte.resumen.comparacionAnterior.diferencia),
    ],
    [
      'Variación porcentual',
      `${reporte.resumen.comparacionAnterior.variacion.toFixed(1)}%`,
    ],
  ]

  autoTable(doc, {
    startY: yPos + 6,
    head: [['Métrica', 'Valor']],
    body: resumen,
    theme: 'striped',
    headStyles: {
      fillColor: [16, 185, 129],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 10,
    },
    styles: {
      fontSize: 9,
      cellPadding: 4,
      lineColor: [226, 232, 240],
      lineWidth: 0.1,
      textColor: [30, 41, 59],
    },
    alternateRowStyles: {
      fillColor: [240, 253, 250],
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 90, textColor: [22, 101, 52] },
      1: { halign: 'right', cellWidth: 'auto', textColor: [6, 95, 70] },
    },
  })

  yPos = doc.lastAutoTable.finalY + 15
  if (yPos > 195) {
    doc.addPage()
    yPos = 20
  }

  doc.setFontSize(13)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(30, 41, 59)
  doc.text('Distribución por estado del turno', 14, yPos)

  const distribucionRows = reporte.distribucion.map((item, index) => [
    index + 1,
    item.etiqueta,
    numberFormatter.format(item.valor),
    `${item.porcentaje.toFixed(1)}%`,
  ])

  autoTable(doc, {
    startY: yPos + 6,
    head: [['#', 'Estado', 'Turnos', 'Participación']],
    body: distribucionRows,
    theme: 'striped',
    headStyles: {
      fillColor: [59, 130, 246],
      textColor: [255, 255, 255],
      fontSize: 10,
    },
    styles: {
      fontSize: 9,
      cellPadding: 4,
      lineColor: [226, 232, 240],
      lineWidth: 0.1,
    },
    alternateRowStyles: {
      fillColor: [239, 246, 255],
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 12 },
      1: { cellWidth: 70, fontStyle: 'bold', textColor: [30, 64, 175] },
      2: { halign: 'right', cellWidth: 35, textColor: [30, 41, 59] },
      3: { halign: 'right', cellWidth: 35, textColor: [30, 41, 59] },
    },
  })

  yPos = doc.lastAutoTable.finalY + 15
  if (yPos > 195) {
    doc.addPage()
    yPos = 20
  }

  doc.setFontSize(13)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(30, 41, 59)
  doc.text(`Detalle por ${opciones.agrupacionLabel.toLowerCase()}`, 14, yPos)

  const detalleRows = reporte.detalle.map((item, index) => [
    index + 1,
    item.etiqueta,
    item.rango,
    numberFormatter.format(item.total),
    numberFormatter.format(item.asistidos),
    numberFormatter.format(item.noAsistidos),
    numberFormatter.format(item.cancelados),
    percentFormatter.format(item.tasaAsistencia || 0),
  ])

  autoTable(doc, {
    startY: yPos + 6,
    head: [
      [
        '#',
        'Período',
        'Rango',
        'Turnos',
        'Asistidos',
        'No asistidos',
        'Cancelados',
        'Tasa asistencia',
      ],
    ],
    body: detalleRows,
    theme: 'striped',
    headStyles: {
      fillColor: [2, 132, 199],
      textColor: [255, 255, 255],
      fontSize: 9,
    },
    styles: {
      fontSize: 8,
      cellPadding: 3,
      lineColor: [226, 232, 240],
      lineWidth: 0.1,
    },
    alternateRowStyles: {
      fillColor: [241, 245, 249],
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 10 },
      1: { cellWidth: 32, fontStyle: 'bold', textColor: [30, 64, 175] },
      2: { cellWidth: 42 },
      3: { halign: 'right', cellWidth: 22 },
      4: { halign: 'right', cellWidth: 22 },
      5: { halign: 'right', cellWidth: 24 },
      6: { halign: 'right', cellWidth: 24 },
      7: { halign: 'right', cellWidth: 26 },
    },
  })

  const pageCount = doc.getNumberOfPages()
  for (let page = 1; page <= pageCount; page++) {
    doc.setPage(page)
    addFooter(doc, page)
  }

  const fileName = `reporte-pacientes-atendidos-${new Date()
    .toISOString()
    .slice(0, 10)}.pdf`
  doc.save(fileName)
}

// ============================================
// REPORTE PACIENTES POR PERÍODO
// ============================================

interface ReportePacientesPeriodoData {
  rango: {
    from: string
    to: string
  }
  filtros: {
    agrupacion: string
  }
  resumen: {
    totalAtendidos: number
    promedioPorGrupo: number
    maximo: {
      etiqueta: string
      total: number
      fechaInicio: string
      fechaFin: string
      tooltipRange: string
    } | null
    comparacionAnterior: {
      totalAnterior: number
      diferencia: number
      variacion: number
    }
  }
  series: Array<{
    etiqueta: string
    valor: number
    fechaInicio: string
    fechaFin: string
    tooltipLabel: string
    tooltipRange: string
  }>
  detalleMensual: Array<{
    mes: string
    total: number
    month: number
    year: number
  }>
  especialidades: Array<{
    especialidad: string
    total: number
    porcentaje: number
  }>
}

interface ExportOpcionesPacientesPeriodo {
  agrupacionLabel: string
  profesionalNombre?: string
}

export async function exportarReportePacientesPorPeriodo(
  reporte: ReportePacientesPeriodoData,
  opciones: ExportOpcionesPacientesPeriodo,
) {
  const doc = new jsPDF()
  const numberFormatter = new Intl.NumberFormat('es-AR')

  const fechaDesde = new Date(reporte.rango.from).toLocaleDateString('es-AR')
  const fechaHasta = new Date(reporte.rango.to).toLocaleDateString('es-AR')

  const subtitleParts = [
    `Período: ${fechaDesde} - ${fechaHasta}`,
    `Agrupación: ${opciones.agrupacionLabel}`,
  ]
  if (opciones.profesionalNombre) {
    subtitleParts.push(`Profesional: ${opciones.profesionalNombre}`)
  }

  await addHeader(
    doc,
    'Reporte de Pacientes Atendidos por Período',
    subtitleParts.join(' | '),
  )

  let yPos = 54

  doc.setFontSize(13)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(30, 41, 59)
  doc.text('Resumen general', 14, yPos)

  const resumen = [
    ['Total pacientes atendidos', numberFormatter.format(reporte.resumen.totalAtendidos)],
    ['Promedio por grupo', reporte.resumen.promedioPorGrupo.toFixed(2)],
    [
      'Período con mayor demanda',
      reporte.resumen.maximo
        ? `${reporte.resumen.maximo.etiqueta} (${numberFormatter.format(reporte.resumen.maximo.total)} pacientes)`
        : 'Sin datos',
    ],
    [
      'Pacientes período anterior',
      numberFormatter.format(reporte.resumen.comparacionAnterior.totalAnterior),
    ],
    [
      'Diferencia vs. período anterior',
      numberFormatter.format(reporte.resumen.comparacionAnterior.diferencia),
    ],
    [
      'Variación porcentual',
      `${reporte.resumen.comparacionAnterior.variacion.toFixed(1)}%`,
    ],
  ]

  autoTable(doc, {
    startY: yPos + 6,
    head: [['Indicador', 'Valor']],
    body: resumen,
    theme: 'striped',
    headStyles: {
      fillColor: [99, 102, 241],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 10,
    },
    styles: {
      fontSize: 9,
      cellPadding: 4,
      lineColor: [226, 232, 240],
      lineWidth: 0.1,
    },
    alternateRowStyles: {
      fillColor: [237, 233, 254],
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 90, textColor: [55, 48, 163] },
      1: { halign: 'right', cellWidth: 'auto', textColor: [76, 29, 149] },
    },
  })

  yPos = doc.lastAutoTable.finalY + 15
  if (yPos > 195) {
    doc.addPage()
    yPos = 20
  }

  doc.setFontSize(13)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(30, 41, 59)
  doc.text(`Detalle por ${opciones.agrupacionLabel.toLowerCase()}`, 14, yPos)

  const seriesRows = reporte.series.map((item, index) => [
    index + 1,
    item.etiqueta,
    item.tooltipRange || `${new Date(item.fechaInicio).toLocaleDateString('es-AR')} - ${new Date(item.fechaFin).toLocaleDateString('es-AR')}`,
    numberFormatter.format(item.valor),
  ])

  autoTable(doc, {
    startY: yPos + 6,
    head: [['#', 'Período', 'Rango', 'Pacientes atendidos']],
    body: seriesRows,
    theme: 'striped',
    headStyles: {
      fillColor: [14, 165, 233],
      textColor: [255, 255, 255],
      fontSize: 10,
    },
    styles: {
      fontSize: 9,
      cellPadding: 4,
      lineColor: [226, 232, 240],
      lineWidth: 0.1,
    },
    alternateRowStyles: {
      fillColor: [224, 242, 254],
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 12 },
      1: { cellWidth: 40, fontStyle: 'bold', textColor: [2, 132, 199] },
      2: { cellWidth: 70 },
      3: { halign: 'right', cellWidth: 35 },
    },
  })

  yPos = doc.lastAutoTable.finalY + 15
  if (yPos > 195) {
    doc.addPage()
    yPos = 20
  }

  doc.setFontSize(13)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(30, 41, 59)
  doc.text('Detalle mensual', 14, yPos)

  const detalleRows = reporte.detalleMensual.map((item, index) => [
    index + 1,
    item.mes,
    numberFormatter.format(item.total),
  ])

  autoTable(doc, {
    startY: yPos + 6,
    head: [['#', 'Mes', 'Pacientes atendidos']],
    body: detalleRows,
    theme: 'striped',
    headStyles: {
      fillColor: [236, 72, 153],
      textColor: [255, 255, 255],
      fontSize: 10,
    },
    styles: {
      fontSize: 9,
      cellPadding: 4,
      lineColor: [226, 232, 240],
      lineWidth: 0.1,
    },
    alternateRowStyles: {
      fillColor: [252, 231, 243],
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 12 },
      1: { cellWidth: 90, textColor: [157, 23, 77], fontStyle: 'bold' },
      2: { halign: 'right', cellWidth: 40 },
    },
  })

  yPos = doc.lastAutoTable.finalY + 15
  if (yPos > 195) {
    doc.addPage()
    yPos = 20
  }

  doc.setFontSize(13)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(30, 41, 59)
  doc.text('Especialidades más demandadas', 14, yPos)

  const especialidadesRows = reporte.especialidades.map((item, index) => [
    index + 1,
    item.especialidad,
    numberFormatter.format(item.total),
    `${item.porcentaje.toFixed(1)}%`,
  ])

  autoTable(doc, {
    startY: yPos + 6,
    head: [['#', 'Especialidad', 'Pacientes', 'Participación']],
    body: especialidadesRows,
    theme: 'striped',
    headStyles: {
      fillColor: [34, 197, 94],
      textColor: [255, 255, 255],
      fontSize: 10,
    },
    styles: {
      fontSize: 9,
      cellPadding: 4,
      lineColor: [226, 232, 240],
      lineWidth: 0.1,
    },
    alternateRowStyles: {
      fillColor: [240, 253, 244],
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 12 },
      1: { cellWidth: 70, fontStyle: 'bold', textColor: [22, 101, 52] },
      2: { halign: 'right', cellWidth: 35 },
      3: { halign: 'right', cellWidth: 35 },
    },
  })

  const pageCount = doc.getNumberOfPages()
  for (let page = 1; page <= pageCount; page++) {
    doc.setPage(page)
    addFooter(doc, page)
  }

  const fileName = `reporte-pacientes-periodo-${new Date()
    .toISOString()
    .slice(0, 10)}.pdf`
  doc.save(fileName)
}

// ============================================
// REPORTE TURNOS POR ESPECIALIDAD
// ============================================

interface ReporteTurnosCanceladosData {
  rango: {
    from: string
    to: string
  }
  filtros: {
    especialidad: string | null
  }
  resumen: {
    total: number
    totalTurnos: number
    tasa: number
    comparacionAnterior: {
      totalAnterior: number
      diferencia: number
      variacion: number
    }
    promedioMensualUltimosSeisMeses: number
    cancelacionesPorOrigen: Array<{
      origen: string
      etiqueta: string
      total: number
      porcentaje: number
    }>
  }
  cancelaciones: {
    page: number
    pageSize: number
    total: number
    items: Array<{
      id: number
      fecha: string
      solicitadoPor: string
      solicitadoPorEtiqueta: string
      turno: {
        paciente: {
          nombre: string
          apellido: string
        }
        profesional: {
          nombre: string
          apellido: string
          especialidad: string | null
        }
      }
    }>
  }
}

interface ExportOpcionesTurnosCancelados {
  especialidadLabel: string
}

export async function exportarReporteTurnosCancelados(
  reporte: ReporteTurnosCanceladosData,
  opciones: ExportOpcionesTurnosCancelados,
) {
  const doc = new jsPDF()
  const numberFormatter = new Intl.NumberFormat('es-AR')
  const percentFormatter = new Intl.NumberFormat('es-AR', {
    style: 'percent',
    maximumFractionDigits: 1,
    minimumFractionDigits: 1,
  })

  const fechaDesde = new Date(reporte.rango.from).toLocaleDateString('es-AR')
  const fechaHasta = new Date(reporte.rango.to).toLocaleDateString('es-AR')

  await addHeader(
    doc,
    'Reporte de Turnos Cancelados',
    `Período: ${fechaDesde} - ${fechaHasta} | Especialidad: ${opciones.especialidadLabel}`,
  )

  let yPos = 54

  doc.setFontSize(13)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(30, 41, 59)
  doc.text('Indicadores clave', 14, yPos)

  const resumenRows = [
    ['Cancelaciones registradas', numberFormatter.format(reporte.resumen.total)],
    ['Turnos totales', numberFormatter.format(reporte.resumen.totalTurnos)],
    ['Tasa de cancelación', percentFormatter.format(reporte.resumen.tasa || 0)],
    [
      'Cancelaciones previo período',
      numberFormatter.format(reporte.resumen.comparacionAnterior.totalAnterior),
    ],
    [
      'Diferencia con período anterior',
      numberFormatter.format(reporte.resumen.comparacionAnterior.diferencia),
    ],
    [
      'Variación porcentual',
      `${reporte.resumen.comparacionAnterior.variacion.toFixed(1)}%`,
    ],
    [
      'Promedio mensual últimos 6 meses',
      reporte.resumen.promedioMensualUltimosSeisMeses.toFixed(1),
    ],
  ]

  autoTable(doc, {
    startY: yPos + 6,
    head: [['Indicador', 'Valor']],
    body: resumenRows,
    theme: 'striped',
    headStyles: {
      fillColor: [239, 68, 68],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 10,
    },
    styles: {
      fontSize: 9,
      cellPadding: 4,
      lineColor: [254, 226, 226],
      lineWidth: 0.1,
    },
    alternateRowStyles: {
      fillColor: [254, 242, 242],
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 90, textColor: [153, 27, 27] },
      1: { halign: 'right', cellWidth: 'auto', textColor: [185, 28, 28] },
    },
  })

  yPos = doc.lastAutoTable.finalY + 15
  if (yPos > 195) {
    doc.addPage()
    yPos = 20
  }

  doc.setFontSize(13)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(30, 41, 59)
  doc.text('Cancelaciones por solicitante', 14, yPos)

  const origenRows = reporte.resumen.cancelacionesPorOrigen.map((item, index) => [
    index + 1,
    item.etiqueta,
    numberFormatter.format(item.total),
    `${item.porcentaje.toFixed(1)}%`,
  ])

  autoTable(doc, {
    startY: yPos + 6,
    head: [['#', 'Origen', 'Cancelaciones', 'Participación']],
    body: origenRows,
    theme: 'striped',
    headStyles: {
      fillColor: [248, 113, 113],
      textColor: [255, 255, 255],
      fontSize: 10,
    },
    styles: {
      fontSize: 9,
      cellPadding: 4,
      lineColor: [254, 226, 226],
      lineWidth: 0.1,
    },
    alternateRowStyles: {
      fillColor: [254, 242, 242],
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 12 },
      1: { cellWidth: 70, fontStyle: 'bold', textColor: [153, 27, 27] },
      2: { halign: 'right', cellWidth: 35 },
      3: { halign: 'right', cellWidth: 35 },
    },
  })

  yPos = doc.lastAutoTable.finalY + 15
  if (yPos > 195) {
    doc.addPage()
    yPos = 20
  }

  doc.setFontSize(13)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(30, 41, 59)
  doc.text('Detalle de cancelaciones', 14, yPos)

  const detalleRows = reporte.cancelaciones.items.map((item, index) => [
    index + 1,
    new Date(item.fecha).toLocaleString('es-AR', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }),
    `${item.turno.paciente.apellido}, ${item.turno.paciente.nombre}`,
    `${item.turno.profesional.apellido}, ${item.turno.profesional.nombre}`,
    item.turno.profesional.especialidad ?? 'Sin especialidad',
    item.solicitadoPorEtiqueta,
  ])

  autoTable(doc, {
    startY: yPos + 6,
    head: [
      ['#', 'Fecha', 'Paciente', 'Profesional', 'Especialidad', 'Solicitado por'],
    ],
    body: detalleRows,
    theme: 'striped',
    headStyles: {
      fillColor: [185, 28, 28],
      textColor: [255, 255, 255],
      fontSize: 9,
    },
    styles: {
      fontSize: 8,
      cellPadding: 3,
      lineColor: [254, 226, 226],
      lineWidth: 0.1,
    },
    alternateRowStyles: {
      fillColor: [254, 242, 242],
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 10 },
      1: { cellWidth: 32 },
      2: { cellWidth: 42, fontStyle: 'bold' },
      3: { cellWidth: 42 },
      4: { cellWidth: 36 },
      5: { cellWidth: 32 },
    },
  })

  const pageCount = doc.getNumberOfPages()
  for (let page = 1; page <= pageCount; page++) {
    doc.setPage(page)
    addFooter(doc, page)
  }

  const fileName = `reporte-turnos-cancelados-${new Date()
    .toISOString()
    .slice(0, 10)}.pdf`
  doc.save(fileName)
}

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

export async function exportarReporteTurnosEspecialidad(reporte: ReporteTurnosEspecialidadData) {
  const doc = new jsPDF()
  
  // Header
  const fechaInicio = new Date(reporte.rango.from).toLocaleDateString('es-AR')
  const fechaFin = new Date(reporte.rango.to).toLocaleDateString('es-AR')
  
  await addHeader(
    doc, 
    'Reporte de Turnos por Especialidad',
    `Período: ${fechaInicio} - ${fechaFin}`
  )
  
  let yPos = 54
  
  // Resumen General
  doc.setFontSize(13)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(30, 41, 59)
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
    startY: yPos + 6,
    head: [resumen[0]],
    body: resumen.slice(1),
    theme: 'striped',
    headStyles: { 
      fillColor: [59, 130, 246],
      textColor: [255, 255, 255],
      fontSize: 10,
      fontStyle: 'bold'
    },
    styles: {
      fontSize: 9,
      cellPadding: 4,
      lineColor: [226, 232, 240],
      lineWidth: 0.1
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 75, textColor: [51, 65, 85] }, 
      1: { cellWidth: 40, halign: 'right', fontStyle: 'bold', textColor: [59, 130, 246] },
      2: { cellWidth: 'auto', halign: 'right', textColor: [71, 85, 105] }
    },
    didDrawCell: (data) => {
      if (data.row.index === 0 && data.section === 'body') {
        doc.setFillColor(240, 249, 255)
        doc.rect(data.cell.x, data.cell.y, data.cell.width, data.cell.height, 'F')
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(59, 130, 246)
      }
    }
  })
  
  // Desglose por Especialidad
  yPos = doc.lastAutoTable.finalY + 15
  
  if (yPos > 175) {
    doc.addPage()
    yPos = 20
  }
  
  doc.setFontSize(13)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(30, 41, 59)
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
    startY: yPos + 6,
    head: [especialidadesData[0]],
    body: especialidadesData.slice(1),
    theme: 'striped',
    headStyles: { 
      fillColor: [59, 130, 246],
      textColor: [255, 255, 255],
      fontSize: 9,
      fontStyle: 'bold'
    },
    styles: {
      fontSize: 8,
      cellPadding: 3,
      lineColor: [226, 232, 240],
      lineWidth: 0.1
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 60, textColor: [51, 65, 85] },
      1: { cellWidth: 25, halign: 'right', fontStyle: 'bold', textColor: [59, 130, 246] },
      2: { cellWidth: 20, halign: 'center', textColor: [71, 85, 105] },
      3: { cellWidth: 18, halign: 'center', textColor: [71, 85, 105] },
      4: { cellWidth: 20, halign: 'center', textColor: [34, 197, 94] },
      5: { cellWidth: 20, halign: 'center', textColor: [239, 68, 68] },
      6: { cellWidth: 20, halign: 'center', textColor: [148, 163, 184] }
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
