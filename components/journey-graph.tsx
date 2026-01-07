"use client"

import { useState, useEffect } from "react"
import { AreaChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, LineChart, Cell, ScatterChart, Scatter, ComposedChart } from "recharts"
import type { JourneyData } from "@/lib/types"

interface JourneyGraphProps {
  journeyData: JourneyData
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    const value = payload[0].value || 0
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-lg">
        <p className="text-sm font-medium">{`${data.weekday}, Day ${label}`}</p>
        <p className="text-sm text-blue-600">
          {`${value.toFixed(1)}h (${data.tasksCompleted}/4 tasks)`}
        </p>
      </div>
    )
  }
  return null
}

export default function JourneyGraph({ journeyData }: JourneyGraphProps) {
  const [viewMode, setViewMode] = useState<"month">("month")
  const [chartType, setChartType] = useState<"area" | "bar" | "line" | "scatter" | "composed">("area")
  const [selectedMonth, setSelectedMonth] = useState(new Date())
  const [monthData, setMonthData] = useState<JourneyData>({})
  const [loading, setLoading] = useState(false)

  const fetchMonthData = async (month: Date) => {
    setLoading(true)
    try {
      const year = month.getFullYear()
      const monthNum = month.getMonth() + 1
      const startDate = `${year}-${String(monthNum).padStart(2, '0')}-01`
      const lastDay = new Date(year, monthNum, 0).getDate()
      const endDate = `${year}-${String(monthNum).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`
      
      const [progressResponse, settingsResponse] = await Promise.all([
        fetch(`/api/progress-range?startDate=${startDate}&endDate=${endDate}`),
        fetch('/api/settings')
      ])
      
      if (!progressResponse.ok || !settingsResponse.ok) {
        throw new Error('Failed to fetch data')
      }
      
      const progressData = await progressResponse.json()
      const settingsData = await settingsResponse.json()
      const mnzdConfigs = settingsData.mnzdConfigs || []
      
      const transformedData: JourneyData = {}
      progressData.forEach((dayProgress: any) => {
        transformedData[dayProgress.date] = {
          date: dayProgress.date,
          tasks: dayProgress.tasks.map((task: any) => {
            const config = mnzdConfigs.find((c: any) => c.id === task.id)
            const minMinutes = config?.minMinutes || 0
            return {
              id: task.id,
              name: task.name || config?.name || task.id,
              completed: task.minutes >= minMinutes,
              minutes: task.minutes,
            }
          }),
          totalHours: dayProgress.totalHours || 0,
          note: dayProgress.note || '',
          completed: dayProgress.tasks.every((task: any) => {
            const config = mnzdConfigs.find((c: any) => c.id === task.id)
            return task.minutes >= (config?.minMinutes || 0)
          })
        }
      })
      
      setMonthData(transformedData)
    } catch (error) {
      // console.error('Error fetching month data:', error)
      setMonthData({})
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMonthData(selectedMonth)
  }, [selectedMonth])

  const getFilteredData = () => {
    const year = selectedMonth.getFullYear()
    const month = selectedMonth.getMonth()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    
    const monthDates = []
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      monthDates.push(dateStr)
    }
    return monthDates
  }

  const dates = getFilteredData()
  const data = dates.map((dateStr) => {
    const entry = monthData[dateStr]
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

  if (loading) {
    return (
      <div className="bg-card rounded-lg border border-border p-8 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent dark:via-gray-800/50 animate-shimmer"></div>
        <div className="relative space-y-4">
          <div className="w-16 h-16 mx-auto bg-gradient-to-r from-blue-200 via-purple-200 to-green-200 dark:from-blue-800 dark:via-purple-800 dark:to-green-800 rounded-full animate-pulse"></div>
          <div className="space-y-2">
            <div className="h-4 w-32 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded mx-auto animate-pulse"></div>
            <div className="h-3 w-48 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded mx-auto animate-pulse"></div>
          </div>
          <div className="flex justify-center space-x-2 mt-4">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce animation-delay-200"></div>
            <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce animation-delay-400"></div>
          </div>
        </div>
        <style jsx>{`
          @keyframes shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
          .animate-shimmer {
            animation: shimmer 2s infinite;
          }
          .animation-delay-200 { animation-delay: 200ms; }
          .animation-delay-400 { animation-delay: 400ms; }
        `}</style>
      </div>
    )
  }

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
      <div className="flex items-center justify-between bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-xl p-4 shadow-sm">
        <div className="flex items-center gap-1 bg-white dark:bg-gray-900 rounded-lg p-1 shadow-inner">
          <button
            onClick={() => setChartType("area")}
            className={`px-4 py-2 rounded-md text-sm font-semibold transition-all duration-200 ${
              chartType === "area"
                ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md transform scale-105"
                : "text-gray-600 hover:text-blue-600 hover:bg-blue-50 dark:text-gray-400 dark:hover:text-blue-400 dark:hover:bg-blue-900/20"
            }`}
          >
            Area
          </button>
          <button
            onClick={() => setChartType("bar")}
            className={`px-4 py-2 rounded-md text-sm font-semibold transition-all duration-200 ${
              chartType === "bar"
                ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-md transform scale-105"
                : "text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 dark:text-gray-400 dark:hover:text-emerald-400 dark:hover:bg-emerald-900/20"
            }`}
          >
            Bar
          </button>
          <button
            onClick={() => setChartType("line")}
            className={`px-4 py-2 rounded-md text-sm font-semibold transition-all duration-200 ${
              chartType === "line"
                ? "bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-md transform scale-105"
                : "text-gray-600 hover:text-purple-600 hover:bg-purple-50 dark:text-gray-400 dark:hover:text-purple-400 dark:hover:bg-purple-900/20"
            }`}
          >
            Line
          </button>
          <button
            onClick={() => setChartType("scatter")}
            className={`px-4 py-2 rounded-md text-sm font-semibold transition-all duration-200 ${
              chartType === "scatter"
                ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md transform scale-105"
                : "text-gray-600 hover:text-orange-600 hover:bg-orange-50 dark:text-gray-400 dark:hover:text-orange-400 dark:hover:bg-orange-900/20"
            }`}
          >
            Scatter
          </button>
          <button
            onClick={() => setChartType("composed")}
            className={`px-4 py-2 rounded-md text-sm font-semibold transition-all duration-200 ${
              chartType === "composed"
                ? "bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-md transform scale-105"
                : "text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 dark:text-gray-400 dark:hover:text-indigo-400 dark:hover:bg-indigo-900/20"
            }`}
          >
            Mixed
          </button>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="text-sm font-medium text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-900 px-3 py-1.5 rounded-lg shadow-sm">
            {chartType === "area" ? "Trend View" : chartType === "bar" ? "Daily Breakdown" : chartType === "line" ? "Line Graph" : chartType === "scatter" ? "Scatter Plot" : "Mixed View"}
          </div>
          <div className="flex items-center gap-2 bg-white dark:bg-gray-900 rounded-lg p-1 shadow-inner">
            <button
              onClick={() => setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() - 1))}
              className="px-3 py-2 rounded-md bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium transition-colors"
            >
              ←
            </button>
            <span className="text-sm font-semibold min-w-[120px] text-center text-gray-800 dark:text-gray-200 px-2">
              {monthNames[selectedMonth.getMonth()]} {selectedMonth.getFullYear()}
            </span>
            <button
              onClick={() => setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1))}
              className="px-3 py-2 rounded-md bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium transition-colors"
            >
              →
            </button>
          </div>
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
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-foreground bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
            Hours Invested {viewMode === "month" ? "Each Day" : "Over Time"}
          </h3>
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
              <Tooltip content={<CustomTooltip />} />
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
