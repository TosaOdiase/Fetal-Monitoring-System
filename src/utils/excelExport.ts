/**
 * Excel Export Utility
 * 
 * Exports monitoring data to Excel with BPM and voltage graphs
 */

import ExcelJS from 'exceljs'
import { Chart, ChartConfiguration } from 'chart.js/auto'
import { MonitoringDataPoint } from './dataStorage'

/**
 * Generate a chart image using Chart.js
 */
async function generateChartImage(
  data: MonitoringDataPoint[],
  type: 'bpm' | 'voltage-maternal' | 'voltage-fetal',
  width: number = 1200,
  height: number = 600
): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    // Create a canvas element
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    
    if (!ctx) {
      reject(new Error('Could not get canvas context'))
      return
    }

    // Prepare data based on type
    let labels: number[]
    let datasets: any[]
    let chartTitle: string

    if (type === 'bpm') {
      // Filter to only include points with BPM data
      const bpmData = data.filter(p => p.maternalBPM > 0 || p.fetalBPM > 0)
      labels = bpmData.map(p => p.time)
      chartTitle = 'BPM Over Time'
      datasets = [
        {
          label: 'Maternal BPM',
          data: bpmData.map(p => p.maternalBPM || null),
          borderColor: 'rgb(78, 205, 196)',
          backgroundColor: 'rgba(78, 205, 196, 0.1)',
          tension: 0.4,
          fill: false
        },
        {
          label: 'Fetal BPM',
          data: bpmData.map(p => p.fetalBPM || null),
          borderColor: 'rgb(155, 89, 255)',
          backgroundColor: 'rgba(155, 89, 255, 0.1)',
          tension: 0.4,
          fill: false
        }
      ]
    } else if (type === 'voltage-maternal') {
      // Maternal voltage only
      labels = data.map(p => p.time)
      chartTitle = 'Maternal Voltage Over Time'
      datasets = [
        {
          label: 'Maternal Voltage (V)',
          data: data.map(p => p.maternalVoltage),
          borderColor: 'rgb(78, 205, 196)',
          backgroundColor: 'rgba(78, 205, 196, 0.1)',
          tension: 0.4,
          fill: false
        }
      ]
    } else {
      // Fetal voltage only
      labels = data.map(p => p.time)
      chartTitle = 'Fetal Voltage Over Time'
      datasets = [
        {
          label: 'Fetal Voltage (V)',
          data: data.map(p => p.fetalVoltage),
          borderColor: 'rgb(155, 89, 255)',
          backgroundColor: 'rgba(155, 89, 255, 0.1)',
          tension: 0.4,
          fill: false
        }
      ]
    }

    const config: ChartConfiguration<'line'> = {
      type: 'line',
      data: {
        labels: labels,
        datasets: datasets.map(dataset => ({
          ...dataset,
          pointRadius: 0, // Hide points to show more data
          pointHoverRadius: 2,
          borderWidth: 1.5 // Thinner lines to show more detail
        }))
      },
      options: {
        responsive: false,
        maintainAspectRatio: false,
        layout: {
          padding: {
            left: 10,
            right: 10,
            top: 10,
            bottom: 10
          }
        },
        plugins: {
          legend: {
            display: true,
            position: 'top',
            labels: {
              font: {
                size: 12
              }
            }
          },
          title: {
            display: true,
            text: chartTitle,
            font: {
              size: 18,
              weight: 'bold'
            },
            padding: {
              top: 10,
              bottom: 20
            }
          },
          tooltip: {
            mode: 'index',
            intersect: false,
            enabled: true
          }
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'Time (seconds)',
              font: {
                size: 12,
                weight: 'bold'
              }
            },
            grid: {
              color: 'rgba(0, 0, 0, 0.1)',
              drawBorder: true,
              borderColor: 'rgba(0, 0, 0, 0.3)',
              borderWidth: 1
            },
            border: {
              display: true,
              color: 'rgba(0, 0, 0, 0.5)',
              width: 2
            },
            ticks: {
              maxTicksLimit: 20, // Show more time points
              font: {
                size: 10
              }
            }
          },
          y: {
            title: {
              display: true,
              text: type === 'bpm' ? 'BPM' : 'Voltage (V)',
              font: {
                size: 12,
                weight: 'bold'
              }
            },
            grid: {
              color: 'rgba(0, 0, 0, 0.1)',
              drawBorder: true,
              borderColor: 'rgba(0, 0, 0, 0.3)',
              borderWidth: 1
            },
            border: {
              display: true,
              color: 'rgba(0, 0, 0, 0.5)',
              width: 2
            },
            ticks: {
              font: {
                size: 10
              }
            }
          }
        }
      }
    }

    const chart = new Chart(ctx, config)

    // Wait for chart to render, then add border and export as image
    setTimeout(() => {
      // Draw border around entire chart (after chart is rendered)
      const borderCtx = canvas.getContext('2d')
      if (borderCtx) {
        borderCtx.strokeStyle = 'rgba(0, 0, 0, 0.6)'
        borderCtx.lineWidth = 3
        borderCtx.strokeRect(1, 1, width - 2, height - 2)
      }
      
      const imageData = canvas.toDataURL('image/png')
      // Convert base64 to Uint8Array (browser-compatible)
      const base64Data = imageData.replace(/^data:image\/png;base64,/, '')
      const binaryString = atob(base64Data)
      const bytes = new Uint8Array(binaryString.length)
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i)
      }
      chart.destroy()
      resolve(bytes)
    }, 500)
  })
}

export async function exportToExcel(data: MonitoringDataPoint[]): Promise<void> {
  if (data.length === 0) {
    throw new Error('No data to export')
  }

  const workbook = new ExcelJS.Workbook()
  
  // Create worksheets - data tables first, then chart sheets
  const dataSheet = workbook.addWorksheet('Monitoring Data')
  const bpmSheet = workbook.addWorksheet('BPM Analysis')
  const voltageSheet = workbook.addWorksheet('Voltage Analysis')
  const bpmChartSheet = workbook.addWorksheet('BPM Chart')
  const maternalVoltageChartSheet = workbook.addWorksheet('Maternal Voltage Chart')
  const fetalVoltageChartSheet = workbook.addWorksheet('Fetal Voltage Chart')

  // ===== DATA SHEET =====
  dataSheet.columns = [
    { header: 'Time (s)', key: 'time', width: 12 },
    { header: 'Timestamp', key: 'timestamp', width: 20 },
    { header: 'Maternal BPM', key: 'maternalBPM', width: 15 },
    { header: 'Fetal BPM', key: 'fetalBPM', width: 15 },
    { header: 'Maternal Voltage (V)', key: 'maternalVoltage', width: 20 },
    { header: 'Fetal Voltage (V)', key: 'fetalVoltage', width: 18 },
    { header: 'Combined Voltage (V)', key: 'combinedVoltage', width: 22 }
  ]

  // Add data rows
  data.forEach(point => {
    dataSheet.addRow({
      time: point.time,
      timestamp: new Date(point.timestamp).toLocaleString(),
      maternalBPM: point.maternalBPM || 0,
      fetalBPM: point.fetalBPM || 0,
      maternalVoltage: point.maternalVoltage.toFixed(3),
      fetalVoltage: point.fetalVoltage.toFixed(3),
      combinedVoltage: point.combinedVoltage.toFixed(3)
    })
  })

  // Format header row
  dataSheet.getRow(1).font = { bold: true }
  dataSheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF4472C4' }
  }
  dataSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } }

  // ===== BPM ANALYSIS SHEET =====
  bpmSheet.columns = [
    { header: 'Time (s)', key: 'time', width: 12 },
    { header: 'Maternal BPM', key: 'maternalBPM', width: 15 },
    { header: 'Fetal BPM', key: 'fetalBPM', width: 15 }
  ]

  // Add BPM data (only non-zero values)
  data.forEach(point => {
    if (point.maternalBPM > 0 || point.fetalBPM > 0) {
      bpmSheet.addRow({
        time: point.time,
        maternalBPM: point.maternalBPM || null,
        fetalBPM: point.fetalBPM || null
      })
    }
  })

  // Format header
  bpmSheet.getRow(1).font = { bold: true }
  bpmSheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF70AD47' }
  }
  bpmSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } }

  // ===== BPM CHART SHEET (Chart only, no table) =====
  if (bpmSheet.rowCount > 1) {
    try {
      const chartImage = await generateChartImage(data, 'bpm')
      const imageId = workbook.addImage({
        buffer: chartImage.buffer as ArrayBuffer,
        extension: 'png'
      })
      // Add chart directly - no table, just the chart
      bpmChartSheet.addImage(imageId, {
        tl: { col: 0, row: 0 }, // Start at column A, row 1 (0-indexed)
        ext: { width: 1200, height: 600 } // Larger size to show more points
      })
      // Set column width and row height to accommodate chart
      bpmChartSheet.getColumn(1).width = 25
      bpmChartSheet.getRow(1).height = 600
    } catch (error) {
      console.warn('Could not generate BPM chart:', error)
      bpmChartSheet.getCell('A1').value = 'Error: Could not generate BPM chart'
    }
  }

  // ===== VOLTAGE ANALYSIS SHEET =====
  voltageSheet.columns = [
    { header: 'Time (s)', key: 'time', width: 12 },
    { header: 'Maternal Voltage (V)', key: 'maternalVoltage', width: 20 },
    { header: 'Fetal Voltage (V)', key: 'fetalVoltage', width: 18 }
  ]

  // Add voltage data
  data.forEach(point => {
    voltageSheet.addRow({
      time: point.time,
      maternalVoltage: point.maternalVoltage,
      fetalVoltage: point.fetalVoltage
    })
  })

  // Format header
  voltageSheet.getRow(1).font = { bold: true }
  voltageSheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFFFC000' }
  }
  voltageSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } }

  // ===== MATERNAL VOLTAGE CHART SHEET (Chart only, no table) =====
  if (voltageSheet.rowCount > 1) {
    try {
      const maternalChartImage = await generateChartImage(data, 'voltage-maternal')
      const maternalImageId = workbook.addImage({
        buffer: maternalChartImage.buffer as ArrayBuffer,
        extension: 'png'
      })
      // Add chart directly - no table, just the chart
      maternalVoltageChartSheet.addImage(maternalImageId, {
        tl: { col: 0, row: 0 }, // Start at column A, row 1 (0-indexed)
        ext: { width: 1200, height: 600 } // Larger size to show more points
      })
      // Set column width and row height to accommodate chart
      maternalVoltageChartSheet.getColumn(1).width = 25
      maternalVoltageChartSheet.getRow(1).height = 600
    } catch (error) {
      console.warn('Could not generate Maternal Voltage chart:', error)
      maternalVoltageChartSheet.getCell('A1').value = 'Error: Could not generate Maternal Voltage chart'
    }
  }

  // ===== FETAL VOLTAGE CHART SHEET (Chart only, no table) =====
  if (voltageSheet.rowCount > 1) {
    try {
      const fetalChartImage = await generateChartImage(data, 'voltage-fetal')
      const fetalImageId = workbook.addImage({
        buffer: fetalChartImage.buffer as ArrayBuffer,
        extension: 'png'
      })
      // Add chart directly - no table, just the chart
      fetalVoltageChartSheet.addImage(fetalImageId, {
        tl: { col: 0, row: 0 }, // Start at column A, row 1 (0-indexed)
        ext: { width: 1200, height: 600 } // Larger size to show more points
      })
      // Set column width and row height to accommodate chart
      fetalVoltageChartSheet.getColumn(1).width = 25
      fetalVoltageChartSheet.getRow(1).height = 600
    } catch (error) {
      console.warn('Could not generate Fetal Voltage chart:', error)
      fetalVoltageChartSheet.getCell('A1').value = 'Error: Could not generate Fetal Voltage chart'
    }
  }

  // Generate filename with timestamp
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)
  const filename = `Fetal_EKG_Monitoring_${timestamp}.xlsx`

  // Write to buffer and download
  const buffer = await workbook.xlsx.writeBuffer()
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}

