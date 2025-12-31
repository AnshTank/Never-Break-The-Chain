"use client"

import { useState } from "react"
import { AreaChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, LineChart, Cell, ScatterChart, Scatter, ComposedChart } from "recharts"
import type { JourneyData } from "@/lib/types"

interface JourneyGraphProps {
  journeyData: JourneyData
}

export default function JourneyGraph({ journeyData }: JourneyGraphProps) {
  const [viewMode, setViewMode] = useState<"month">("month")
  const [chartType, setChartType] = useState<"area" | "bar" | "line" | "scatter" | "composed">("area")
  const [selectedMonth, setSelectedMonth] = useState(new Date())

  const getFilteredData = () => {
    const year = selectedMonth.getFullYear()
    const month = selectedMonth.getMonth()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    
    const monthDates = []
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = new Date(year, month, day).toISOString().split("T")[0]
      monthDates.push(dateStr)
    }
    return monthDates
  }

  // Enhanced dummy data with more variety
  const getDummyData = () => {
    const dummyJourneyData = {
      "2024-12-01": { totalHours: 2.5, completed: false, tasks: [{completed: true}, {completed: true}, {completed: false}, {completed: false}] },
      "2024-12-02": { totalHours: 4.2, completed: true, tasks: [{completed: true}, {completed: true}, {completed: true}, {completed: true}] },
      "2024-12-03": { totalHours: 1.8, completed: false, tasks: [{completed: true}, {completed: false}, {completed: false}, {completed: false}] },
      "2024-12-04": { totalHours: 0, completed: false, tasks: [{completed: false}, {completed: false}, {completed: false}, {completed: false}] },
      "2024-12-05": { totalHours: 3.7, completed: true, tasks: [{completed: true}, {completed: true}, {completed: true}, {completed: true}] },
      "2024-12-06": { totalHours: 2.1, completed: false, tasks: [{completed: true}, {completed: true}, {completed: false}, {completed: false}] },
      "2024-12-07": { totalHours: 5.3, completed: true, tasks: [{completed: true}, {completed: true}, {completed: true}, {completed: true}] },
      "2024-12-08": { totalHours: 1.2, completed: false, tasks: [{completed: true}, {completed: false}, {completed: false}, {completed: false}] },
      "2024-12-09": { totalHours: 0, completed: false, tasks: [{completed: false}, {completed: false}, {completed: false}, {completed: false}] },
      "2024-12-10": { totalHours: 4.8, completed: true, tasks: [{completed: true}, {completed: true}, {completed: true}, {completed: true}] },
      "2024-12-11": { totalHours: 2.9, completed: false, tasks: [{completed: true}, {completed: true}, {completed: true}, {completed: false}] },
      "2024-12-12": { totalHours: 3.4, completed: true, tasks: [{completed: true}, {completed: true}, {completed: true}, {completed: true}] },
      "2024-12-13": { totalHours: 1.6, completed: false, tasks: [{completed: true}, {completed: false}, {completed: false}, {completed: false}] },
      "2024-12-14": { totalHours: 0, completed: false, tasks: [{completed: false}, {completed: false}, {completed: false}, {completed: false}] },
      "2024-12-15": { totalHours: 4.1, completed: true, tasks: [{completed: true}, {completed: true}, {completed: true}, {completed: true}] },
      "2024-12-16": { totalHours: 2.7, completed: false, tasks: [{completed: true}, {completed: true}, {completed: false}, {completed: false}] },
      "2024-12-17": { totalHours: 3.8, completed: true, tasks: [{completed: true}, {completed: true}, {completed: true}, {completed: true}] },
      "2024-12-18": { totalHours: 1.4, completed: false, tasks: [{completed: true}, {completed: false}, {completed: false}, {completed: false}] },
      "2024-12-19": { totalHours: 0, completed: false, tasks: [{completed: false}, {completed: false}, {completed: false}, {completed: false}] },
      "2024-12-20": { totalHours: 5.1, completed: true, tasks: [{completed: true}, {completed: true}, {completed: true}, {completed: true}] },
      "2024-12-21": { totalHours: 2.3, completed: false, tasks: [{completed: true}, {completed: true}, {completed: false}, {completed: false}] },
      "2024-12-22": { totalHours: 4.6, completed: true, tasks: [{completed: true}, {completed: true}, {completed: true}, {completed: true}] },
      "2024-12-23": { totalHours: 1.9, completed: false, tasks: [{completed: true}, {completed: false}, {completed: false}, {completed: false}] },
      "2024-12-24": { totalHours: 0, completed: false, tasks: [{completed: false}, {completed: false}, {completed: false}, {completed: false}] },
      "2024-12-25": { totalHours: 3.2, completed: true, tasks: [{completed: true}, {completed: true}, {completed: true}, {completed: true}] },
      "2024-12-26": { totalHours: 2.8, completed: false, tasks: [{completed: true}, {completed: true}, {completed: true}, {completed: false}] },
      "2024-12-27": { totalHours: 4.4, completed: true, tasks: [{completed: true}, {completed: true}, {completed: true}, {completed: true}] },
      "2024-12-28": { totalHours: 1.7, completed: false, tasks: [{completed: true}, {completed: false}, {completed: false}, {completed: false}] },
      "2024-12-29": { totalHours: 0, completed: false, tasks: [{completed: false}, {completed: false}, {completed: false}, {completed: false}] },
      "2024-12-30": { totalHours: 3.9, completed: true, tasks: [{completed: true}, {completed: true}, {completed: true}, {completed: true}] },
      "2024-12-31": { totalHours: 2.6, completed: false, tasks: [{completed: true}, {completed: true}, {completed: false}, {completed: false}] }
    }
    return { ...journeyData, ...dummyJourneyData }
  }

  const dates = getFilteredData()
  const dataSource = getDummyData()
  const data = dates.map((dateStr) => {
    const entry = dataSource[dateStr]
    const date = new Date(dateStr)
    const tasksCompleted = entry?.tasks ? entry.tasks.filter(t => t.completed).length : 0
    return {
      date: date.getDate().toString(),
      hours: entry?.totalHours || 0,
      completed: entry?.completed ? 1 : 0,
      tasksCompleted,
      shortDate: dateStr,
      hasData: !!entry,
      weekday: date.toLocaleDateString("en-US", { weekday: "short" })
    }
  })

  if (data.length === 0) {
    return (
      <div className="bg-card rounded-lg border border-border p-8 text-center text-muted-foreground">
        <p>Start showing up to see your journey unfold.</p>
      </div>
    )
  }

  const maxHours = Math.max(...data.map((d) => d.hours)) || 5
  const yAxisMax = Math.ceil(maxHours) + 2
  const avgHours = data.length > 0 ? data.reduce((sum, d) => sum + d.hours, 0) / data.length : 0
  const totalHours = data.reduce((sum, d) => sum + d.hours, 0)
  const completedDays = data.filter(d => d.completed).length
  const streak = (() => {
    let currentStreak = 0
    for (let i = data.length - 1; i >= 0; i--) {
      if (data[i].completed) currentStreak++
      else break
    }
    return currentStreak
  })()

  const monthNames = ["January", "February", "March", "April", "May", "June", 
                     "July", "August", "September", "October", "November", "December"]

  return (
    <div className="space-y-4">
      {/* Enhanced View Controls */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <div className="border-l border-border mx-2" />
          <button
            onClick={() => setChartType("area")}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              chartType === "area"
                ? "bg-blue-100 text-blue-800"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            📈 Area
          </button>
          <button
            onClick={() => setChartType("bar")}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              chartType === "bar"
                ? "bg-blue-100 text-blue-800"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            📊 Bar
          </button>
          <button
            onClick={() => setChartType("line")}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              chartType === "line"
                ? "bg-blue-100 text-blue-800"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            📈 Line
          </button>
          <button
            onClick={() => setChartType("scatter")}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              chartType === "scatter"
                ? "bg-blue-100 text-blue-800"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            🔵 Scatter
          </button>
          <button
            onClick={() => setChartType("composed")}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              chartType === "composed"
                ? "bg-blue-100 text-blue-800"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            🎯 Combined
          </button>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() - 1))}
            className="px-2 py-1 rounded-md bg-muted hover:bg-muted/80 text-sm"
          >
            ←
          </button>
          <span className="text-sm font-medium min-w-[120px] text-center">
            {monthNames[selectedMonth.getMonth()]} {selectedMonth.getFullYear()}
          </span>
          <button
            onClick={() => setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1))}
            className="px-2 py-1 rounded-md bg-muted hover:bg-muted/80 text-sm"
          >
            →
          </button>
        </div>
      </div>

      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
          <div className="text-2xl font-bold text-blue-600">{totalHours.toFixed(1)}h</div>
          <div className="text-sm text-blue-700">Total Hours</div>
        </div>
        <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 p-4 rounded-lg border border-emerald-200">
          <div className="text-2xl font-bold text-emerald-600">{completedDays}</div>
          <div className="text-sm text-emerald-700">Completed Days</div>
        </div>
        <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
          <div className="text-2xl font-bold text-purple-600">{avgHours.toFixed(1)}h</div>
          <div className="text-sm text-purple-700">Avg per Day</div>
        </div>
        <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-200">
          <div className="text-2xl font-bold text-orange-600">{streak}</div>
          <div className="text-sm text-orange-700">Current Streak</div>
        </div>
      </div>

      <div className="bg-card rounded-lg border border-border p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">
            Hours Invested {viewMode === "month" ? "Each Day" : "Over Time"}
          </h3>
          <div className="text-sm text-muted-foreground">
            {chartType === "area" ? "📈 Trend View" : chartType === "bar" ? "📊 Daily Breakdown" : chartType === "line" ? "📈 Line Graph" : chartType === "scatter" ? "🔵 Scatter Plot" : "🎯 Combined View"}
          </div>
        </div>
        
        <ResponsiveContainer width="100%" height={360}>
          {chartType === "area" ? (
            <AreaChart data={data} margin={{ top: 5, right: 20, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                  <stop offset="25%" stopColor="#3b82f6" stopOpacity={0.6} />
                  <stop offset="50%" stopColor="#eab308" stopOpacity={0.4} />
                  <stop offset="75%" stopColor="#f97316" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1} />
                </linearGradient>
                <linearGradient id="areaStroke" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="50%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#ef4444" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12, fill: "#6b7280" }}
                interval={viewMode === "month" ? 0 : Math.max(0, Math.floor(data.length / 8) - 1)}
              />
              <YAxis
                domain={[0, yAxisMax]}
                label={{ value: "Hours", angle: -90, position: "insideLeft" }}
                tick={{ fontSize: 12, fill: "#6b7280" }}
                width={50}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "0.5rem",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
                }}
                formatter={(value: number, name: string, props: any) => {
                  const payload = props.payload
                  if (name === "hours") {
                    return [
                      `${value.toFixed(1)}h (${payload.tasksCompleted}/4 tasks)`,
                      "Hours Invested"
                    ]
                  }
                  return [value, name]
                }}
                labelFormatter={(label) => {
                  const item = data.find(d => d.date === label)
                  return item ? `${item.weekday}, ${viewMode === "month" ? `Day ${label}` : label}` : label
                }}
              />
              <Area
                type="monotone"
                dataKey="hours"
                stroke="url(#areaStroke)"
                fill="url(#colorHours)"
                strokeWidth={4}
                isAnimationActive={true}
              />
              <Line
                type="monotone"
                dataKey="hours"
                stroke="transparent"
                dot={(props) => {
                  const { cx, cy, payload, index } = props
                  const entry = data[data.indexOf(payload)]
                  if (!entry.hasData) {
                    return (
                      <circle
                        key={`area-dot-${index}`}
                        cx={cx}
                        cy={cy}
                        r={4}
                        fill="#ef4444"
                        opacity={0.7}
                        stroke="white"
                        strokeWidth={2}
                      />
                    )
                  }
                  // 5 different colors based on task completion (0-4 tasks)
                  let dotColor = "#ef4444" // default red
                  if (entry.tasksCompleted === 0) {
                    dotColor = "#ef4444" // red for 0 tasks
                  } else if (entry.tasksCompleted === 1) {
                    dotColor = "#f97316" // orange for 1 task
                  } else if (entry.tasksCompleted === 2) {
                    dotColor = "#eab308" // yellow for 2 tasks
                  } else if (entry.tasksCompleted === 3) {
                    dotColor = "#3b82f6" // blue for 3 tasks
                  } else if (entry.tasksCompleted === 4) {
                    dotColor = "#10b981" // green for 4 tasks
                  }
                  
                  // Size based on hours (3-12 radius range)
                  const minRadius = 3
                  const maxRadius = 12
                  const maxHours = Math.max(...data.map(d => d.hours))
                  const radius = maxHours > 0 
                    ? minRadius + ((entry.hours / maxHours) * (maxRadius - minRadius))
                    : minRadius
                  
                  // Add glow effect for high task completion
                  const glowEffect = entry.tasksCompleted >= 3 ? "drop-shadow(0 0 8px rgba(59, 130, 246, 0.6))" : "none"
                  
                  return (
                    <circle
                      key={`area-dot-${index}`}
                      cx={cx}
                      cy={cy}
                      r={radius}
                      fill={dotColor}
                      opacity={0.9}
                      stroke="white"
                      strokeWidth={3}
                      filter={glowEffect}
                      style={{ filter: glowEffect }}
                    />
                  )
                }}
                activeDot={{ r: 9, stroke: "#3b82f6", strokeWidth: 3, fill: "white" }}
              />
            </AreaChart>
          ) : chartType === "bar" ? (
            <BarChart data={data} margin={{ top: 5, right: 20, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12, fill: "#6b7280" }}
                interval={viewMode === "month" ? 0 : Math.max(0, Math.floor(data.length / 8) - 1)}
              />
              <YAxis
                domain={[0, yAxisMax]}
                label={{ value: "Hours", angle: -90, position: "insideLeft" }}
                tick={{ fontSize: 12, fill: "#6b7280" }}
                width={50}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "0.5rem",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
                }}
                formatter={(value: number, name: string, props: any) => {
                  const payload = props.payload
                  return [
                    `${value.toFixed(1)}h (${payload.tasksCompleted}/4 tasks)`,
                    "Hours Invested"
                  ]
                }}
                labelFormatter={(label) => {
                  const item = data.find(d => d.date === label)
                  return item ? `${item.weekday}, ${viewMode === "month" ? `Day ${label}` : label}` : label
                }}
              />
              <Bar dataKey="hours" radius={[4, 4, 0, 0]} isAnimationActive={true}>
                {data.map((entry, index) => {
                  let barColor = "#ef4444" // default red
                  
                  // 5 different colors based on task completion (0-4 tasks)
                  if (entry.tasksCompleted === 0) {
                    barColor = "#ef4444" // red for 0 tasks
                  } else if (entry.tasksCompleted === 1) {
                    barColor = "#f97316" // orange for 1 task
                  } else if (entry.tasksCompleted === 2) {
                    barColor = "#eab308" // yellow for 2 tasks
                  } else if (entry.tasksCompleted === 3) {
                    barColor = "#3b82f6" // blue for 3 tasks
                  } else if (entry.tasksCompleted === 4) {
                    barColor = "#10b981" // green for 4 tasks
                  }
                  
                  return <Cell key={`cell-${index}`} fill={barColor} />
                })}
              </Bar>
            </BarChart>
          ) : chartType === "scatter" ? (
            <ScatterChart data={data} margin={{ top: 5, right: 20, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12, fill: "#6b7280" }}
                interval={viewMode === "month" ? 0 : Math.max(0, Math.floor(data.length / 8) - 1)}
              />
              <YAxis
                domain={[0, yAxisMax]}
                label={{ value: "Hours", angle: -90, position: "insideLeft" }}
                tick={{ fontSize: 12, fill: "#6b7280" }}
                width={50}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "0.5rem",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
                }}
                formatter={(value: number, name: string, props: any) => {
                  const payload = props.payload
                  return [
                    `${value.toFixed(1)}h (${payload.tasksCompleted}/4 tasks)`,
                    "Hours Invested"
                  ]
                }}
                labelFormatter={(label) => {
                  const item = data.find(d => d.date === label)
                  return item ? `${item.weekday}, ${viewMode === "month" ? `Day ${label}` : label}` : label
                }}
              />
              <Scatter
                dataKey="hours"
                shape={(props) => {
                  const { cx, cy, payload } = props
                  const entry = data[data.indexOf(payload)]
                  
                  // 5 different colors based on task completion
                  let dotColor = "#ef4444"
                  if (entry.tasksCompleted === 0) {
                    dotColor = "#ef4444" // red for 0 tasks
                  } else if (entry.tasksCompleted === 1) {
                    dotColor = "#f97316" // orange for 1 task
                  } else if (entry.tasksCompleted === 2) {
                    dotColor = "#eab308" // yellow for 2 tasks
                  } else if (entry.tasksCompleted === 3) {
                    dotColor = "#3b82f6" // blue for 3 tasks
                  } else if (entry.tasksCompleted === 4) {
                    dotColor = "#10b981" // green for 4 tasks
                  }
                  
                  // Size based on hours (6-20 radius range for scatter)
                  const minRadius = 6
                  const maxRadius = 20
                  const maxHours = Math.max(...data.map(d => d.hours))
                  const radius = maxHours > 0 
                    ? minRadius + ((entry.hours / maxHours) * (maxRadius - minRadius))
                    : minRadius
                  
                  return (
                    <circle
                      cx={cx}
                      cy={cy}
                      r={radius}
                      fill={dotColor}
                      opacity={0.7}
                      stroke="white"
                      strokeWidth={3}
                    />
                  )
                }}
              />
            </ScatterChart>
          ) : chartType === "composed" ? (
            <ComposedChart data={data} margin={{ top: 5, right: 20, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12, fill: "#6b7280" }}
                interval={viewMode === "month" ? 0 : Math.max(0, Math.floor(data.length / 8) - 1)}
              />
              <YAxis
                domain={[0, yAxisMax]}
                label={{ value: "Hours", angle: -90, position: "insideLeft" }}
                tick={{ fontSize: 12, fill: "#6b7280" }}
                width={50}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "0.5rem",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
                }}
                formatter={(value: number, name: string, props: any) => {
                  const payload = props.payload
                  return [
                    `${value.toFixed(1)}h (${payload.tasksCompleted}/4 tasks)`,
                    "Hours Invested"
                  ]
                }}
                labelFormatter={(label) => {
                  const item = data.find(d => d.date === label)
                  return item ? `${item.weekday}, ${viewMode === "month" ? `Day ${label}` : label}` : label
                }}
              />
              <Area
                type="monotone"
                dataKey="hours"
                fill="url(#colorHours)"
                stroke="transparent"
                opacity={0.3}
              />
              <Bar dataKey="hours" radius={[2, 2, 0, 0]} opacity={0.6}>
                {data.map((entry, index) => {
                  let barColor = "#ef4444"
                  if (entry.tasksCompleted === 0) {
                    barColor = "#ef4444"
                  } else if (entry.tasksCompleted === 1) {
                    barColor = "#f97316"
                  } else if (entry.tasksCompleted === 2) {
                    barColor = "#eab308"
                  } else if (entry.tasksCompleted === 3) {
                    barColor = "#3b82f6"
                  } else if (entry.tasksCompleted === 4) {
                    barColor = "#10b981"
                  }
                  return <Cell key={`cell-${index}`} fill={barColor} />
                })}
              </Bar>
              <Line
                type="monotone"
                dataKey="hours"
                stroke="#1f2937"
                strokeWidth={2}
                dot={false}
              />
            </ComposedChart>
          ) : (
            <LineChart data={data} margin={{ top: 5, right: 20, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12, fill: "#6b7280" }}
                interval={viewMode === "month" ? 0 : Math.max(0, Math.floor(data.length / 8) - 1)}
              />
              <YAxis
                domain={[0, yAxisMax]}
                label={{ value: "Hours", angle: -90, position: "insideLeft" }}
                tick={{ fontSize: 12, fill: "#6b7280" }}
                width={50}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "0.5rem",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
                }}
                formatter={(value: number, name: string, props: any) => {
                  const payload = props.payload
                  return [
                    `${value.toFixed(1)}h (${payload.tasksCompleted}/4 tasks)`,
                    "Hours Invested"
                  ]
                }}
                labelFormatter={(label) => {
                  const item = data.find(d => d.date === label)
                  return item ? `${item.weekday}, ${viewMode === "month" ? `Day ${label}` : label}` : label
                }}
              />
              <Line
                type="monotone"
                dataKey="hours"
                stroke="#3b82f6"
                strokeWidth={3}
                strokeDasharray="5 5"
                isAnimationActive={true}
                dot={(props) => {
                  const { cx, cy, payload, index } = props
                  const entry = data[data.indexOf(payload)]
                  if (!entry.hasData) {
                    return (
                      <circle
                        key={`line-dot-${index}`}
                        cx={cx}
                        cy={cy}
                        r={4}
                        fill="#ef4444"
                        opacity={0.7}
                        stroke="white"
                        strokeWidth={2}
                      />
                    )
                  }
                  // 5 different colors based on task completion (0-4 tasks)
                  let dotColor = "#ef4444" // default red
                  if (entry.tasksCompleted === 0) {
                    dotColor = "#ef4444" // red for 0 tasks
                  } else if (entry.tasksCompleted === 1) {
                    dotColor = "#f97316" // orange for 1 task
                  } else if (entry.tasksCompleted === 2) {
                    dotColor = "#eab308" // yellow for 2 tasks
                  } else if (entry.tasksCompleted === 3) {
                    dotColor = "#3b82f6" // blue for 3 tasks
                  } else if (entry.tasksCompleted === 4) {
                    dotColor = "#10b981" // green for 4 tasks
                  }
                  
                  // Size based on hours (3-12 radius range)
                  const minRadius = 3
                  const maxRadius = 12
                  const maxHours = Math.max(...data.map(d => d.hours))
                  const radius = maxHours > 0 
                    ? minRadius + ((entry.hours / maxHours) * (maxRadius - minRadius))
                    : minRadius
                  
                  // Add thick red border for 0 tasks
                  const strokeColor = entry.tasksCompleted === 0 ? "#ef4444" : "white"
                  const strokeWidth = entry.tasksCompleted === 0 ? 4 : 2
                  
                  return (
                    <circle
                      key={`line-dot-${index}`}
                      cx={cx}
                      cy={cy}
                      r={radius}
                      fill={dotColor}
                      opacity={0.8}
                      stroke={strokeColor}
                      strokeWidth={strokeWidth}
                    />
                  )
                }}
                activeDot={{ r: 9, stroke: "#3b82f6", strokeWidth: 3, fill: "white" }}
              />
            </LineChart>
          )}
        </ResponsiveContainer>

        {/* Legend */}
        <div className="mt-4 flex flex-wrap gap-4 justify-center text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-red-500"></div>
            <span>0 Tasks</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-orange-500"></div>
            <span>1 Task</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
            <span>2 Tasks</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-blue-500"></div>
            <span>3 Tasks</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-green-500"></div>
            <span>4 Tasks</span>
          </div>
          {(chartType === "scatter" || chartType === "area" || chartType === "line") && (
            <div className="flex items-center gap-2 ml-4 pl-4 border-l border-gray-300">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                <div className="w-3 h-3 rounded-full bg-gray-400"></div>
                <div className="w-4 h-4 rounded-full bg-gray-400"></div>
              </div>
              <span>Size = Hours</span>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
