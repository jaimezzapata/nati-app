import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { 
  getNatillera, 
  getNatilleraMembers, 
  getNatilleraAportes 
} from './firestore.service';
import { formatCurrency, formatDate, getMonthName } from '../utils/formatters';

/**
 * Convierte un timestamp de Firestore o Date a Date
 */
const toDate = (timestamp) => {
  if (!timestamp) return new Date();
  if (timestamp.toDate && typeof timestamp.toDate === 'function') {
    return timestamp.toDate();
  }
  if (timestamp instanceof Date) {
    return timestamp;
  }
  return new Date(timestamp);
};

/**
 * Obtiene datos completos para reportes de una natillera
 * @param {string} natilleraId - ID de la natillera
 * @param {Object} filters - Filtros a aplicar
 * @returns {Promise<Object>} - Datos del reporte
 */
export const getReportData = async (natilleraId, filters = {}) => {
  try {
    // Obtener datos base
    const natillera = await getNatillera(natilleraId);
    const miembros = await getNatilleraMembers(natilleraId);
    let aportes = await getNatilleraAportes(natilleraId);

    // Aplicar filtros
    if (filters.userId) {
      aportes = aportes.filter(a => a.userId === filters.userId);
    }

    if (filters.estado) {
      aportes = aportes.filter(a => a.estado === filters.estado);
    }

    if (filters.fechaInicio) {
      const fechaInicio = new Date(filters.fechaInicio);
      aportes = aportes.filter(a => {
        try {
          const fechaAporte = toDate(a.fechaPago);
          return fechaAporte >= fechaInicio;
        } catch (error) {
          console.error('Error procesando fecha:', error);
          return false;
        }
      });
    }

    if (filters.fechaFin) {
      const fechaFin = new Date(filters.fechaFin);
      fechaFin.setHours(23, 59, 59, 999); // Incluir todo el día
      aportes = aportes.filter(a => {
        try {
          const fechaAporte = toDate(a.fechaPago);
          return fechaAporte <= fechaFin;
        } catch (error) {
          console.error('Error procesando fecha:', error);
          return false;
        }
      });
    }

    if (filters.mesCuota) {
      aportes = aportes.filter(a => a.mesCuota === filters.mesCuota);
    }

    // Enriquecer aportes con información de usuarios
    const aportesEnriquecidos = aportes.map(aporte => {
      const miembro = miembros.find(m => m.userId === aporte.userId);
      return {
        ...aporte,
        nombreUsuario: miembro?.nombre || 'Usuario desconocido',
        emailUsuario: miembro?.email || ''
      };
    });

    // Calcular estadísticas
    const totalAportes = aportesEnriquecidos.length;
    const totalConfirmados = aportesEnriquecidos.filter(a => a.estado === 'confirmado').length;
    const totalPendientes = aportesEnriquecidos.filter(a => a.estado === 'pendiente').length;
    const totalRechazados = aportesEnriquecidos.filter(a => a.estado === 'rechazado').length;

    const montoTotal = aportesEnriquecidos
      .filter(a => a.estado === 'confirmado')
      .reduce((sum, a) => sum + (a.monto || 0), 0);

    const montoPendiente = aportesEnriquecidos
      .filter(a => a.estado === 'pendiente')
      .reduce((sum, a) => sum + (a.monto || 0), 0);

    // Estadísticas por socio
    const estadisticasPorSocio = miembros.map(miembro => {
      const aportesSocio = aportesEnriquecidos.filter(a => a.userId === miembro.userId);
      const confirmados = aportesSocio.filter(a => a.estado === 'confirmado');
      const pendientes = aportesSocio.filter(a => a.estado === 'pendiente');
      const rechazados = aportesSocio.filter(a => a.estado === 'rechazado');

      return {
        userId: miembro.userId,
        nombre: miembro.nombre,
        email: miembro.email,
        totalAportes: aportesSocio.length,
        confirmados: confirmados.length,
        pendientes: pendientes.length,
        rechazados: rechazados.length,
        montoTotal: confirmados.reduce((sum, a) => sum + (a.monto || 0), 0),
        montoPendiente: pendientes.reduce((sum, a) => sum + (a.monto || 0), 0)
      };
    });

    return {
      natillera,
      miembros,
      aportes: aportesEnriquecidos,
      estadisticas: {
        totalAportes,
        totalConfirmados,
        totalPendientes,
        totalRechazados,
        montoTotal,
        montoPendiente,
        porSocio: estadisticasPorSocio
      }
    };
  } catch (error) {
    console.error('Error al obtener datos del reporte:', error);
    throw error;
  }
};

/**
 * Exporta el reporte a PDF
 * @param {Object} reportData - Datos del reporte
 * @param {Object} filters - Filtros aplicados
 */
export const exportToPDF = async (reportData, filters = {}) => {
  try {
    const { natillera, aportes, estadisticas } = reportData;
    
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    
    // Encabezado con fondo
    doc.setFillColor(16, 185, 129); // emerald-500
    doc.rect(0, 0, pageWidth, 40, 'F');
    
    // Título
    doc.setFontSize(22);
    doc.setTextColor(255, 255, 255);
    doc.text('REPORTE DE NATILLERA', pageWidth / 2, 15, { align: 'center' });
    
    // Nombre de la natillera
    doc.setFontSize(14);
    doc.text(natillera.nombre.toUpperCase(), pageWidth / 2, 25, { align: 'center' });
    
    // Fecha de generación
    doc.setFontSize(9);
    doc.text(`Generado: ${formatDate(new Date())}`, pageWidth / 2, 32, { align: 'center' });
    
    let yPos = 50;
    
    // Información básica en recuadros
    doc.setFillColor(243, 244, 246); // gray-100
    doc.roundedRect(14, yPos, 85, 25, 3, 3, 'F');
    doc.roundedRect(pageWidth - 99, yPos, 85, 25, 3, 3, 'F');
    
    doc.setFontSize(9);
    doc.setTextColor(107, 114, 128); // gray-500
    doc.text('MONTO CUOTA', 19, yPos + 8);
    doc.text('PERIODICIDAD', pageWidth - 94, yPos + 8);
    
    doc.setFontSize(13);
    doc.setTextColor(0, 0, 0);
    doc.text(formatCurrency(natillera.montoCuota), 19, yPos + 18);
    doc.text(natillera.periodicidad.toUpperCase(), pageWidth - 94, yPos + 18);
    
    yPos += 35;
    
    // Filtros aplicados (si hay)
    if (Object.keys(filters).filter(k => filters[k]).length > 0) {
      // Calcular altura del recuadro según filtros
      let filtrosCount = 0;
      if (filters.userId) filtrosCount++;
      if (filters.estado) filtrosCount++;
      if (filters.fechaInicio || filters.fechaFin) filtrosCount++;
      if (filters.mesCuota) filtrosCount++;
      
      const filtrosHeight = 12 + (filtrosCount * 5) + 8;
      
      doc.setFillColor(254, 243, 199); // yellow-100
      doc.roundedRect(14, yPos, pageWidth - 28, filtrosHeight, 3, 3, 'F');
      
      doc.setFontSize(10);
      doc.setTextColor(146, 64, 14); // yellow-900
      doc.text('Filtros aplicados:', 19, yPos + 6);
      
      yPos += 12;
      doc.setFontSize(8);
      
      if (filters.userId) {
        const socio = reportData.miembros.find(m => m.userId === filters.userId);
        doc.text(`• Socio: ${socio?.nombre || 'Desconocido'}`, 21, yPos);
        yPos += 5;
      }
      if (filters.estado) {
        doc.text(`• Estado: ${filters.estado}`, 21, yPos);
        yPos += 5;
      }
      if (filters.mesCuota) {
        doc.text(`• Mes: ${getMonthName(filters.mesCuota)}`, 21, yPos);
        yPos += 5;
      }
      if (filters.fechaInicio || filters.fechaFin) {
        let rangoText = '• Rango: ';
        if (filters.fechaInicio) rangoText += `desde ${formatDate(new Date(filters.fechaInicio))}`;
        if (filters.fechaFin) rangoText += ` hasta ${formatDate(new Date(filters.fechaFin))}`;
        doc.text(rangoText, 21, yPos);
        yPos += 5;
      }
      yPos += 8;
    }
    
    // Resumen en tarjetas
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text('RESUMEN GENERAL', 14, yPos);
    yPos += 8;
    
    const cardWidth = (pageWidth - 42) / 3;
    
    // Tarjeta 1: Confirmados
    doc.setFillColor(220, 252, 231); // green-100
    doc.roundedRect(14, yPos, cardWidth, 28, 3, 3, 'F');
    doc.setFontSize(9);
    doc.setTextColor(22, 101, 52); // green-800
    doc.text('Confirmados', 19, yPos + 7);
    doc.setFontSize(18);
    doc.setTextColor(21, 128, 61); // green-700
    doc.text(estadisticas.totalConfirmados.toString(), 19, yPos + 18);
    doc.setFontSize(8);
    doc.setTextColor(22, 101, 52);
    doc.text(formatCurrency(estadisticas.montoTotal), 19, yPos + 24);
    
    // Tarjeta 2: Pendientes
    doc.setFillColor(254, 249, 195); // yellow-100
    doc.roundedRect(14 + cardWidth + 7, yPos, cardWidth, 28, 3, 3, 'F');
    doc.setFontSize(9);
    doc.setTextColor(133, 77, 14); // yellow-800
    doc.text('Pendientes', 19 + cardWidth + 7, yPos + 7);
    doc.setFontSize(18);
    doc.setTextColor(161, 98, 7); // yellow-700
    doc.text(estadisticas.totalPendientes.toString(), 19 + cardWidth + 7, yPos + 18);
    doc.setFontSize(8);
    doc.setTextColor(133, 77, 14);
    doc.text(formatCurrency(estadisticas.montoPendiente), 19 + cardWidth + 7, yPos + 24);
    
    // Tarjeta 3: Rechazados
    doc.setFillColor(254, 226, 226); // red-100
    doc.roundedRect(14 + (cardWidth + 7) * 2, yPos, cardWidth, 28, 3, 3, 'F');
    doc.setFontSize(9);
    doc.setTextColor(153, 27, 27); // red-800
    doc.text('Rechazados', 19 + (cardWidth + 7) * 2, yPos + 7);
    doc.setFontSize(18);
    doc.setTextColor(185, 28, 28); // red-700
    doc.text(estadisticas.totalRechazados.toString(), 19 + (cardWidth + 7) * 2, yPos + 18);
    
    yPos += 38;
    
    // Tabla de aportes con mejor diseño
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`DETALLE DE APORTES (${aportes.length})`, 14, yPos);
    yPos += 5;
    
    if (aportes.length > 0) {
      const aportesTableData = aportes.map(aporte => {
        let estadoText = aporte.estado.toUpperCase();
        return [
          aporte.nombreUsuario,
          getMonthName(aporte.mesCuota),
          formatCurrency(aporte.monto),
          formatDate(toDate(aporte.fechaPago)),
          estadoText,
          aporte.estado === 'rechazado' && aporte.motivoRechazo 
            ? aporte.motivoRechazo.substring(0, 35) + (aporte.motivoRechazo.length > 35 ? '...' : '')
            : '-'
        ];
      });
      
      doc.autoTable({
        startY: yPos,
        head: [['Socio', 'Mes', 'Monto', 'Fecha', 'Estado', 'Observación']],
        body: aportesTableData,
        theme: 'striped',
        headStyles: { 
          fillColor: [16, 185, 129],
          textColor: [255, 255, 255],
          fontSize: 9,
          fontStyle: 'bold',
          halign: 'center'
        },
        bodyStyles: {
          fontSize: 8,
          cellPadding: 3
        },
        alternateRowStyles: {
          fillColor: [249, 250, 251]
        },
        columnStyles: {
          0: { cellWidth: 40 },
          1: { cellWidth: 25, halign: 'center' },
          2: { cellWidth: 25, halign: 'right' },
          3: { cellWidth: 23, halign: 'center' },
          4: { cellWidth: 22, halign: 'center' },
          5: { cellWidth: 50 }
        },
        margin: { left: 14, right: 14 },
        didParseCell: function(data) {
          // Colorear la columna de estado
          if (data.column.index === 4 && data.section === 'body') {
            const estado = data.cell.raw;
            if (estado === 'CONFIRMADO') {
              data.cell.styles.textColor = [21, 128, 61]; // green-700
              data.cell.styles.fontStyle = 'bold';
            } else if (estado === 'PENDIENTE') {
              data.cell.styles.textColor = [161, 98, 7]; // yellow-700
              data.cell.styles.fontStyle = 'bold';
            } else if (estado === 'RECHAZADO') {
              data.cell.styles.textColor = [185, 28, 28]; // red-700
              data.cell.styles.fontStyle = 'bold';
            }
          }
        }
      });
    } else {
      doc.setFontSize(9);
      doc.setTextColor(107, 114, 128);
      doc.text('No hay aportes que coincidan con los filtros', 14, yPos + 10);
    }
    
    // Estadísticas por socio en nueva página
    if (estadisticas.porSocio.length > 0) {
      doc.addPage();
      
      // Encabezado de segunda página
      doc.setFillColor(16, 185, 129);
      doc.rect(0, 0, pageWidth, 30, 'F');
      doc.setFontSize(16);
      doc.setTextColor(255, 255, 255);
      doc.text('ESTADÍSTICAS POR SOCIO', pageWidth / 2, 18, { align: 'center' });
      
      const sociosTableData = estadisticas.porSocio.map(socio => [
        socio.nombre,
        socio.totalAportes.toString(),
        socio.confirmados.toString(),
        socio.pendientes.toString(),
        socio.rechazados.toString(),
        formatCurrency(socio.montoTotal),
        formatCurrency(socio.montoPendiente)
      ]);
      
      doc.autoTable({
        startY: 40,
        head: [['Socio', 'Total', 'Conf.', 'Pend.', 'Rech.', 'Monto Conf.', 'Monto Pend.']],
        body: sociosTableData,
        theme: 'grid',
        headStyles: { 
          fillColor: [16, 185, 129],
          textColor: [255, 255, 255],
          fontSize: 9,
          fontStyle: 'bold',
          halign: 'center'
        },
        bodyStyles: {
          fontSize: 9,
          cellPadding: 3
        },
        columnStyles: {
          0: { cellWidth: 50 },
          1: { halign: 'center' },
          2: { halign: 'center', textColor: [21, 128, 61] },
          3: { halign: 'center', textColor: [161, 98, 7] },
          4: { halign: 'center', textColor: [185, 28, 28] },
          5: { halign: 'right' },
          6: { halign: 'right' }
        },
        margin: { left: 14, right: 14 }
      });
    }
    
    // Footer en todas las páginas
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(107, 114, 128);
      doc.text(
        `Página ${i} de ${pageCount} - ${natillera.nombre}`,
        pageWidth / 2,
        pageHeight - 10,
        { align: 'center' }
      );
    }
    
    // Guardar PDF
    const filename = `Reporte_${natillera.nombre.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(filename);
  } catch (error) {
    console.error('Error al exportar PDF:', error);
    throw new Error('No se pudo generar el archivo PDF');
  }
};

/**
 * Exporta el reporte a Excel con formato profesional
 * @param {Object} reportData - Datos del reporte
 * @param {Object} filters - Filtros aplicados
 */
export const exportToExcel = async (reportData, filters = {}) => {
  try {
    const { natillera, aportes, estadisticas } = reportData;
    
    const wb = XLSX.utils.book_new();
    
    // === HOJA 1: RESUMEN GENERAL ===
    const resumenData = [
      ['REPORTE DE NATILLERA'],
      [],
      ['Información General'],
      ['Natillera:', natillera.nombre],
      ['Monto Cuota:', formatCurrency(natillera.montoCuota)],
      ['Periodicidad:', natillera.periodicidad],
      ['Fecha de Generación:', formatDate(new Date())],
      [],
      ['Filtros Aplicados'],
    ];
    
    if (Object.keys(filters).length > 0) {
      if (filters.userId) {
        const socio = reportData.miembros.find(m => m.userId === filters.userId);
        resumenData.push(['Socio:', socio?.nombre || 'Desconocido']);
      }
      if (filters.estado) {
        resumenData.push(['Estado:', filters.estado]);
      }
      if (filters.fechaInicio) {
        resumenData.push(['Desde:', formatDate(new Date(filters.fechaInicio))]);
      }
      if (filters.fechaFin) {
        resumenData.push(['Hasta:', formatDate(new Date(filters.fechaFin))]);
      }
      if (filters.mesCuota) {
        resumenData.push(['Mes:', getMonthName(filters.mesCuota)]);
      }
    } else {
      resumenData.push(['Sin filtros aplicados']);
    }
    
    resumenData.push([]);
    resumenData.push(['Estadísticas Generales']);
    resumenData.push([]);
    resumenData.push(['Concepto', 'Cantidad', 'Monto']);
    resumenData.push(['Total de Aportes', estadisticas.totalAportes, '']);
    resumenData.push(['✓ Confirmados', estadisticas.totalConfirmados, formatCurrency(estadisticas.montoTotal)]);
    resumenData.push(['⏳ Pendientes', estadisticas.totalPendientes, formatCurrency(estadisticas.montoPendiente)]);
    resumenData.push(['✗ Rechazados', estadisticas.totalRechazados, '']);
    
    const wsResumen = XLSX.utils.aoa_to_sheet(resumenData);
    
    // Estilos y formato para la hoja de resumen
    wsResumen['!cols'] = [
      { wch: 25 },
      { wch: 30 },
      { wch: 20 }
    ];
    
    // Merge cells para el título principal
    wsResumen['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 2 } }, // Título principal
      { s: { r: 2, c: 0 }, e: { r: 2, c: 1 } }, // "Información General"
      { s: { r: 8, c: 0 }, e: { r: 8, c: 1 } }, // "Filtros Aplicados"
    ];
    
    // Encontrar la fila de "Estadísticas Generales" dinámicamente
    const estadisticasRow = resumenData.findIndex(row => row[0] === 'Estadísticas Generales');
    if (estadisticasRow !== -1) {
      wsResumen['!merges'].push({ s: { r: estadisticasRow, c: 0 }, e: { r: estadisticasRow, c: 2 } });
    }
    
    XLSX.utils.book_append_sheet(wb, wsResumen, 'Resumen');
    
    // === HOJA 2: DETALLE DE APORTES ===
    const aportesData = [
      ['DETALLE DE APORTES'],
      [],
      ['Socio', 'Mes', 'Monto', 'Fecha Pago', 'Estado', 'Observación']
    ];
    
    aportes.forEach(aporte => {
      aportesData.push([
        aporte.nombreUsuario,
        getMonthName(aporte.mesCuota),
        aporte.monto,
        formatDate(toDate(aporte.fechaPago)),
        aporte.estado.toUpperCase(),
        aporte.estado === 'rechazado' && aporte.motivoRechazo 
          ? aporte.motivoRechazo 
          : '-'
      ]);
    });
    
    const wsAportes = XLSX.utils.aoa_to_sheet(aportesData);
    
    // Formato para la hoja de aportes
    wsAportes['!cols'] = [
      { wch: 25 }, // Socio
      { wch: 15 }, // Mes
      { wch: 15 }, // Monto
      { wch: 15 }, // Fecha
      { wch: 15 }, // Estado
      { wch: 45 }  // Observación
    ];
    
    // Merge del título
    wsAportes['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 5 } }
    ];
    
    XLSX.utils.book_append_sheet(wb, wsAportes, 'Aportes');
    
    // === HOJA 3: ESTADÍSTICAS POR SOCIO ===
    if (estadisticas.porSocio.length > 0) {
      const sociosData = [
        ['ESTADÍSTICAS POR SOCIO'],
        [],
        ['Socio', 'Total', '✓ Conf.', '⏳ Pend.', '✗ Rech.', 'Monto Confirmado', 'Monto Pendiente']
      ];
      
      estadisticas.porSocio.forEach(socio => {
        sociosData.push([
          socio.nombre,
          socio.totalAportes,
          socio.confirmados,
          socio.pendientes,
          socio.rechazados,
          socio.montoTotal,
          socio.montoPendiente
        ]);
      });
      
      // Agregar totales al final
      sociosData.push([]);
      sociosData.push([
        'TOTALES',
        estadisticas.totalAportes,
        estadisticas.totalConfirmados,
        estadisticas.totalPendientes,
        estadisticas.totalRechazados,
        estadisticas.montoTotal,
        estadisticas.montoPendiente
      ]);
      
      const wsSocios = XLSX.utils.aoa_to_sheet(sociosData);
      
      // Formato para la hoja por socio
      wsSocios['!cols'] = [
        { wch: 25 }, // Socio
        { wch: 10 }, // Total
        { wch: 10 }, // Confirmados
        { wch: 10 }, // Pendientes
        { wch: 10 }, // Rechazados
        { wch: 18 }, // Monto Confirmado
        { wch: 18 }  // Monto Pendiente
      ];
      
      // Merge del título
      wsSocios['!merges'] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 6 } }
      ];
      
      XLSX.utils.book_append_sheet(wb, wsSocios, 'Por Socio');
    }
    
    // Guardar archivo con nombre formateado
    const filename = `reporte_${natillera.nombre.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, filename);
  } catch (error) {
    console.error('Error al exportar Excel:', error);
    throw new Error('No se pudo generar el archivo Excel');
  }
};


/**
 * Exporta el reporte a CSV
 * @param {Object} reportData - Datos del reporte
 */
export const exportToCSV = async (reportData) => {
  try {
    const { natillera, aportes } = reportData;
    
    // Encabezados CSV
  const headers = [
    'Socio',
    'Email',
    'Mes Cuota',
    'Monto',
    'Fecha Pago',
    'Estado',
    'Motivo Rechazo',
    'Fecha Confirmación'
  ];
  
  // Datos
  const rows = aportes.map(aporte => [
    aporte.nombreUsuario,
    aporte.emailUsuario,
    getMonthName(aporte.mesCuota),
    aporte.monto,
    formatDate(toDate(aporte.fechaPago)),
    aporte.estado,
    aporte.motivoRechazo || '',
    aporte.fechaConfirmacion ? formatDate(toDate(aporte.fechaConfirmacion)) : ''
  ]);
  
  // Crear contenido CSV
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => {
      // Escapar comas y comillas en los valores
      const value = String(cell).replace(/"/g, '""');
      return value.includes(',') || value.includes('"') || value.includes('\n') 
        ? `"${value}"` 
        : value;
    }).join(','))
  ].join('\n');
  
  // Agregar BOM para UTF-8
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  
  const filename = `reporte_${natillera.nombre.replace(/\s+/g, '_')}_${new Date().getTime()}.csv`;
  saveAs(blob, filename);
  } catch (error) {
    console.error('Error al exportar CSV:', error);
    throw new Error('No se pudo generar el archivo CSV');
  }
};

/**
 * Obtiene los meses disponibles de una natillera para filtrado
 * @param {string} natilleraId - ID de la natillera
 * @returns {Promise<Array>} - Lista de meses únicos
 */
export const getAvailableMonths = async (natilleraId) => {
  try {
    const aportes = await getNatilleraAportes(natilleraId);
    const meses = [...new Set(aportes.map(a => a.mesCuota))];
    return meses.sort().reverse(); // Más recientes primero
  } catch (error) {
    console.error('Error al obtener meses disponibles:', error);
    return [];
  }
};
