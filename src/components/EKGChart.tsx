import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts'
import { ScreenType, EKGDataPoint } from '../App'
import './EKGChart.css'

interface EKGChartProps {
  data: EKGDataPoint[]
  currentScreen: ScreenType
}

export default function EKGChart({ data, currentScreen }: EKGChartProps) {
  const getChartConfig = () => {
    switch (currentScreen) {
      case 'mother':
        return {
          dataKey: 'mother',
          stroke: '#4ecdc4',
          label: 'Maternal EKG (mV)',
          yDomain: [-3, 6]
        }
      case 'combined':
        return {
          dataKey: 'combined',
          stroke: '#ffaa00',
          label: 'Combined EKG (mV)',
          yDomain: [-3, 6]
        }
      case 'fetal':
        return {
          dataKey: 'fetus',
          stroke: '#9b59ff',
          label: 'Fetal EKG (mV)',
          yDomain: [-1, 2]
        }
    }
  }

  const config = getChartConfig()

  // Show only last 5 seconds and calculate fixed domain
  let visibleData: EKGDataPoint[] = []
  let xDomain: [number, number] = [0, 5]

  if (data.length > 0) {
    const latestTime = data[data.length - 1].time
    const startTime = Math.floor(latestTime) - 4 // Show 5 full seconds
    const endTime = startTime + 5

    visibleData = data.filter(d => d.time >= startTime && d.time <= endTime)
    xDomain = [startTime, endTime]
  }

  // Generate clean tick marks at 0.5 second intervals
  const generateTicks = () => {
    if (data.length === 0) return [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5]
    const startTime = xDomain[0]
    const ticks = []
    // Start at the first 0.5 second mark
    let firstTick = Math.ceil(startTime * 2) / 2
    for (let i = 0; i < 11; i++) {
      ticks.push(firstTick + (i * 0.5))
    }
    return ticks
  }

  // Format tick labels to show 0.5 second increments
  const formatTick = (value: number) => {
    return value.toFixed(1)
  }

  return (
    <div className="ekg-chart">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={visibleData}
          margin={{ top: 20, right: 30, left: 50, bottom: 30 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#00ff41" opacity={0.3} />
          <XAxis
            dataKey="time"
            type="number"
            stroke="#ffffff"
            label={{ value: 'Time (seconds)', position: 'insideBottom', offset: -10, fill: '#ffffff', fontSize: 11 }}
            domain={xDomain}
            ticks={generateTicks()}
            tickFormatter={formatTick}
            interval={0}
            tick={{ fontSize: 10 }}
          />
          <YAxis
            stroke={config.stroke}
            label={{ value: config.label, angle: -90, position: 'insideLeft', fill: config.stroke, style: { fontWeight: 'bold', fontSize: 11 } }}
            domain={config.yDomain}
            tick={{ fontSize: 10 }}
          />
          <Line
            type="monotone"
            dataKey={config.dataKey}
            stroke={config.stroke}
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
