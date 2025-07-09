// Chart components for shadcn BarChartStacked and related charts
// Based on shadcn/ui and recharts

import * as React from "react"
import {
  BarChart as ReBarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip as ReTooltip,
  Legend as ReLegend,
  ResponsiveContainer,
} from "recharts"

export type ChartConfig = Record<string, { label: string; color: string }>

export interface ChartContainerProps {
  config: ChartConfig
  children: React.ReactNode
  height?: number
}

export function ChartContainer({ config, children, height = 300 }: ChartContainerProps) {
  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer width="100%" height="100%">
        {children}
      </ResponsiveContainer>
    </div>
  )
}

export function ChartLegend({ content }: { content?: React.ReactNode }) {
  return <ReLegend content={content} />
}

export function ChartLegendContent(props: any) {
  // Default legend content, can be customized
  const { payload } = props
  return (
    <ul style={{ display: "flex", gap: 16, listStyle: "none", margin: 0, padding: 0 }}>
      {payload?.map((entry: any, idx: number) => (
        <li key={`item-${idx}`} style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <span style={{ display: "inline-block", width: 12, height: 12, background: entry.color, borderRadius: 2, marginRight: 4 }} />
          <span>{entry.value}</span>
        </li>
      ))}
    </ul>
  )
}

export function ChartTooltip({ content }: { content?: React.ReactNode }) {
  return <ReTooltip content={content} />
}

export function ChartTooltipContent({ active, payload, label, hideLabel }: any) {
  if (!active || !payload || payload.length === 0) return null
  return (
    <div style={{ background: "white", border: "1px solid #eee", borderRadius: 6, padding: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
      {!hideLabel && <div style={{ fontWeight: 600, marginBottom: 4 }}>{label}</div>}
      {payload.map((entry: any, idx: number) => (
        <div key={idx} style={{ color: entry.color, fontWeight: 500 }}>
          {entry.name}: {entry.value}
        </div>
      ))}
    </div>
  )
}

// Export recharts primitives for convenience
export { ReBarChart as BarChart, Bar, CartesianGrid, XAxis, YAxis } 