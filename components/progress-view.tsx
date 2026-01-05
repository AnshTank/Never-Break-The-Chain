"use client"

import { useState } from "react"
import type { JourneyData, DayEntry } from "@/lib/types"
import CompactMonthView from "./compact-month-view"
import YearHeatmap from "./year-heatmap"
import JourneyGraph from "./journey-graph"
import { useProgressData } from "@/hooks/use-progress-data"

interface ProgressViewProps {
  onDayEntry: (date: Date, entry: DayEntry) => void
}

export default function ProgressView({ onDayEntry }: ProgressViewProps) {
  const [selectedMonth, setSelectedMonth] = useState(new Date())
  const [viewMode, setViewMode] = useState<"calendar" | "year" | "journey">("calendar")
  const { data: monthlyData, loading } = useProgressData(selectedMonth)
  const today = new Date()

  const isCurrentMonth = (month: Date) => {
    return month.getFullYear() === today.getFullYear() && month.getMonth() === today.getMonth()
  }

  const isFutureMonth = (month: Date) => {
    return month > today || (month.getFullYear() === today.getFullYear() && month.getMonth() > today.getMonth())
  }

  const getMonthStatus = (month: Date) => {
    if (isCurrentMonth(month)) return "current"
    if (isFutureMonth(month)) return "future"
    return "past"
  }

  const monthNames = ["January", "February", "March", "April", "May", "June", 
                     "July", "August", "September", "October", "November", "December"]

  return (
    <div className="space-y-8 animate-in fade-in-50 duration-700">
      {/* Enhanced View Mode Tabs */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2 overflow-x-auto">
          <button
            onClick={() => setViewMode("calendar")}
            className={`flex-shrink-0 px-6 py-3 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap ${
              viewMode === "calendar"
                ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg"
                : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-600"
            }`}
          >
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Calendar View
            </div>
          </button>
          <button
            onClick={() => setViewMode("year")}
            className={`flex-shrink-0 px-6 py-3 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap ${
              viewMode === "year"
                ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg"
                : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-600"
            }`}
          >
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 00-2-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Year Heatmap
            </div>
          </button>
          <button
            onClick={() => setViewMode("journey")}
            className={`flex-shrink-0 px-6 py-3 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap ${
              viewMode === "journey"
                ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg"
                : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-600"
            }`}
          >
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              Analytics
            </div>
          </button>
        </div>
      </div>

      {viewMode === "calendar" && (
        <div className="space-y-8 animate-in slide-in-from-left-5 duration-500">
          {/* Enhanced Month Navigation */}
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-slate-100 dark:to-slate-400 bg-clip-text text-transparent">
              Monthly Progress
            </h2>
            <div className="flex gap-3">
              <button
                onClick={() => setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() - 1))}
                className="group relative overflow-hidden rounded-xl bg-white dark:bg-slate-800 px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-700 dark:to-slate-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <span className="relative flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Previous
                </span>
              </button>
              <button
                onClick={() => setSelectedMonth(new Date())}
                className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:from-blue-600 hover:to-indigo-600"
              >
                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
                <span className="relative">Current Month</span>
              </button>
              <button
                onClick={() => setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1))}
                className="group relative overflow-hidden rounded-xl bg-white dark:bg-slate-800 px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-700 dark:to-slate-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <span className="relative flex items-center gap-2">
                  Next
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </button>
            </div>
          </div>

          {/* Current Month Status */}
          <div className="bg-card rounded-lg border border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">
                {monthNames[selectedMonth.getMonth()]} {selectedMonth.getFullYear()}
              </h3>
              <div className="flex items-center gap-3">
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                  getMonthStatus(selectedMonth) === "current" 
                    ? "bg-blue-100 text-blue-800" 
                    : getMonthStatus(selectedMonth) === "future"
                    ? "bg-purple-100 text-purple-800"
                    : "bg-gray-100 text-gray-800"
                }`}>
                  {getMonthStatus(selectedMonth) === "current" && "Current Month - MNZD Active"}
                  {getMonthStatus(selectedMonth) === "future" && "Future Month - Track Progress"}
                  {getMonthStatus(selectedMonth) === "past" && "Past Month"}
                </div>
              </div>
            </div>

            <CompactMonthView 
              month={selectedMonth} 
              journeyData={monthlyData} 
              onDayEntry={onDayEntry} 
            />

            {/* Month Summary */}
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
              {(() => {
                if (loading) {
                  return Array.from({ length: 4 }, (_, i) => (
                    <div key={i} className="text-center p-4 bg-gray-50 rounded-lg animate-pulse">
                      <div className="h-8 bg-gray-200 rounded mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded"></div>
                    </div>
                  ))
                }
                
                const year = selectedMonth.getFullYear()
                const month = selectedMonth.getMonth()
                const daysInMonth = new Date(year, month + 1, 0).getDate()
                
                let completedDays = 0
                let totalHours = 0
                let partialDays = 0
                let missedDays = 0

                for (let day = 1; day <= daysInMonth; day++) {
                  const date = new Date(year, month, day)
                  const dateStr = date.toISOString().split("T")[0]
                  const entry = monthlyData[dateStr]
                  
                  // Check if date is before today (not today or future)
                  const isBeforeToday = date < today
                  
                  if (entry && entry.tasks) {
                    totalHours += entry.totalHours
                    const completedTasks = entry.tasks.filter(t => t.completed).length
                    
                    if (completedTasks === 4) {
                      completedDays++
                    } else if (completedTasks >= 1 && completedTasks <= 3) {
                      partialDays++
                    } else if (completedTasks === 0 && isBeforeToday) {
                      missedDays++
                    }
                  } else if (isBeforeToday) {
                    missedDays++
                  }
                }

                return (
                  <>
                    <div className="text-center p-4 bg-emerald-50 rounded-lg">
                      <div className="text-2xl font-bold text-emerald-600">{completedDays}</div>
                      <div className="text-sm text-emerald-700">Complete Days</div>
                    </div>
                    <div className="text-center p-4 bg-amber-50 rounded-lg">
                      <div className="text-2xl font-bold text-amber-600">{partialDays}</div>
                      <div className="text-sm text-amber-700">Partial Days</div>
                    </div>
                    <div className="text-center p-4 bg-red-50 rounded-lg">
                      <div className="text-2xl font-bold text-red-600">{missedDays}</div>
                      <div className="text-sm text-red-700">Missed Days</div>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{totalHours.toFixed(1)}</div>
                      <div className="text-sm text-blue-700">Total Hours</div>
                    </div>
                  </>
                )
              })()}
            </div>
          </div>

          {/* Quick Month Selector */}
          <div className="bg-card rounded-lg border border-border p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Quick Jump</h3>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
              {Array.from({ length: 12 }, (_, i) => {
                const monthDate = new Date(selectedMonth.getFullYear(), i, 1)
                const isSelected = selectedMonth.getMonth() === i
                const status = getMonthStatus(monthDate)
                
                return (
                  <button
                    key={i}
                    onClick={() => setSelectedMonth(monthDate)}
                    className={`p-3 rounded-lg text-sm font-medium transition-all ${
                      isSelected
                        ? "bg-primary text-primary-foreground"
                        : status === "current"
                        ? "bg-blue-100 text-blue-800 hover:bg-blue-200"
                        : status === "future"
                        ? "bg-purple-100 text-purple-800 hover:bg-purple-200"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    {monthNames[i].slice(0, 3)}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {viewMode === "year" && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">Year at a Glance</h2>
          <YearHeatmap journeyData={monthlyData} />
        </div>
      )}

      {viewMode === "journey" && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">Your Journey</h2>
          <JourneyGraph journeyData={monthlyData} />
        </div>
      )}
    </div>
  )
}