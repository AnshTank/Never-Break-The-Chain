"use client"

import { useState } from "react"
import type { JourneyData, DayEntry } from "@/lib/types"
import CompactMonthView from "./compact-month-view"
import YearHeatmap from "./year-heatmap"
import JourneyGraph from "./journey-graph"

interface ProgressViewProps {
  journeyData: JourneyData
  onDayEntry: (date: Date, entry: DayEntry) => void
}

export default function ProgressView({ journeyData, onDayEntry }: ProgressViewProps) {
  const [selectedMonth, setSelectedMonth] = useState(new Date())
  const [viewMode, setViewMode] = useState<"calendar" | "year" | "journey">("calendar")
  const [filterMode, setFilterMode] = useState<"year" | "lastMonth" | "month">("year")
  const [filteredMonth, setFilteredMonth] = useState<Date | null>(null)
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

  const getDisplayData = () => {
    // Add dummy data for demonstration
    const dummyData = {
      "2024-01-15": { totalHours: 3.2, completed: true, tasks: [{completed: true}, {completed: true}, {completed: true}, {completed: true}] },
      "2024-01-20": { totalHours: 2.1, completed: false, tasks: [{completed: true}, {completed: true}, {completed: false}, {completed: false}] },
      "2024-02-05": { totalHours: 4.5, completed: true, tasks: [{completed: true}, {completed: true}, {completed: true}, {completed: true}] },
      "2024-02-14": { totalHours: 1.8, completed: false, tasks: [{completed: true}, {completed: false}, {completed: false}, {completed: false}] },
      "2024-03-10": { totalHours: 3.7, completed: true, tasks: [{completed: true}, {completed: true}, {completed: true}, {completed: true}] },
      "2024-03-22": { totalHours: 2.9, completed: false, tasks: [{completed: true}, {completed: true}, {completed: true}, {completed: false}] },
      "2024-04-08": { totalHours: 4.1, completed: true, tasks: [{completed: true}, {completed: true}, {completed: true}, {completed: true}] },
      "2024-04-18": { totalHours: 0, completed: false, tasks: [{completed: false}, {completed: false}, {completed: false}, {completed: false}] },
      "2024-05-12": { totalHours: 3.8, completed: true, tasks: [{completed: true}, {completed: true}, {completed: true}, {completed: true}] },
      "2024-05-25": { totalHours: 2.3, completed: false, tasks: [{completed: true}, {completed: true}, {completed: false}, {completed: false}] },
      "2024-06-07": { totalHours: 4.6, completed: true, tasks: [{completed: true}, {completed: true}, {completed: true}, {completed: true}] },
      "2024-06-19": { totalHours: 1.5, completed: false, tasks: [{completed: true}, {completed: false}, {completed: false}, {completed: false}] },
      "2024-07-03": { totalHours: 3.4, completed: true, tasks: [{completed: true}, {completed: true}, {completed: true}, {completed: true}] },
      "2024-07-16": { totalHours: 2.7, completed: false, tasks: [{completed: true}, {completed: true}, {completed: false}, {completed: false}] },
      "2024-08-09": { totalHours: 4.3, completed: true, tasks: [{completed: true}, {completed: true}, {completed: true}, {completed: true}] },
      "2024-08-21": { totalHours: 0, completed: false, tasks: [{completed: false}, {completed: false}, {completed: false}, {completed: false}] },
      "2024-09-04": { totalHours: 3.9, completed: true, tasks: [{completed: true}, {completed: true}, {completed: true}, {completed: true}] },
      "2024-09-17": { totalHours: 2.4, completed: false, tasks: [{completed: true}, {completed: true}, {completed: false}, {completed: false}] },
      "2024-10-11": { totalHours: 4.7, completed: true, tasks: [{completed: true}, {completed: true}, {completed: true}, {completed: true}] },
      "2024-10-24": { totalHours: 1.9, completed: false, tasks: [{completed: true}, {completed: false}, {completed: false}, {completed: false}] },
      "2024-11-06": { totalHours: 3.6, completed: true, tasks: [{completed: true}, {completed: true}, {completed: true}, {completed: true}] },
      "2024-11-18": { totalHours: 2.8, completed: false, tasks: [{completed: true}, {completed: true}, {completed: true}, {completed: false}] },
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
    
    const combinedData = { ...journeyData, ...dummyData }
    
    if (filterMode === "year") {
      return combinedData
    } else if (filterMode === "lastMonth") {
      const now = new Date()
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      return filterByMonth(lastMonth, combinedData)
    } else {
      if (!filteredMonth) return combinedData
      return filterByMonth(filteredMonth, combinedData)
    }
  }

  const filterByMonth = (month: Date, data = journeyData) => {
    const filtered: JourneyData = {}
    const year = month.getFullYear()
    const monthNum = month.getMonth()
    const daysInMonth = new Date(year, monthNum + 1, 0).getDate()

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = new Date(year, monthNum, day).toISOString().split("T")[0]
      if (data[dateStr]) {
        filtered[dateStr] = data[dateStr]
      }
    }
    return filtered
  }

  const monthNames = ["January", "February", "March", "April", "May", "June", 
                     "July", "August", "September", "October", "November", "December"]
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
  const years = [2024, 2025, 2026]

  const displayData = getDisplayData()

  return (
    <div className="space-y-4 sm:space-y-8">
      {/* View Mode Tabs */}
      <div className="flex items-center justify-between">
        <div className="flex gap-1 sm:gap-2 overflow-x-auto">
          <button
            onClick={() => setViewMode("calendar")}
            className={`px-2 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
              viewMode === "calendar"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            Calendar View
          </button>
          <button
            onClick={() => setViewMode("year")}
            className={`px-2 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
              viewMode === "year"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            Year at Glance
          </button>
          <button
            onClick={() => setViewMode("journey")}
            className={`px-2 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
              viewMode === "journey"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            Your Journey
          </button>
        </div>
      </div>

      {viewMode === "calendar" && (
        <>
          {/* Month Navigation */}
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-foreground">Monthly Progress</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() - 1))}
                className="rounded-md bg-muted px-3 py-1.5 text-sm font-medium text-muted-foreground hover:bg-muted/80 transition-colors"
              >
                ← Prev
              </button>
              <button
                onClick={() => setSelectedMonth(new Date())}
                className="rounded-md bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary hover:bg-primary/20 transition-colors"
              >
                Today
              </button>
              <button
                onClick={() => setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1))}
                className="rounded-md bg-muted px-3 py-1.5 text-sm font-medium text-muted-foreground hover:bg-muted/80 transition-colors"
              >
                Next →
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
              journeyData={(() => {
                // Combine real data with dummy data
                const dummyData = {
                  "2024-01-15": { totalHours: 3.2, completed: true, tasks: [{completed: true}, {completed: true}, {completed: true}, {completed: true}] },
                  "2024-01-20": { totalHours: 2.1, completed: false, tasks: [{completed: true}, {completed: true}, {completed: false}, {completed: false}] },
                  "2024-02-05": { totalHours: 4.5, completed: true, tasks: [{completed: true}, {completed: true}, {completed: true}, {completed: true}] },
                  "2024-02-14": { totalHours: 1.8, completed: false, tasks: [{completed: true}, {completed: false}, {completed: false}, {completed: false}] },
                  "2024-03-10": { totalHours: 3.7, completed: true, tasks: [{completed: true}, {completed: true}, {completed: true}, {completed: true}] },
                  "2024-03-22": { totalHours: 2.9, completed: false, tasks: [{completed: true}, {completed: true}, {completed: true}, {completed: false}] },
                  "2024-04-08": { totalHours: 4.1, completed: true, tasks: [{completed: true}, {completed: true}, {completed: true}, {completed: true}] },
                  "2024-04-18": { totalHours: 0, completed: false, tasks: [{completed: false}, {completed: false}, {completed: false}, {completed: false}] },
                  "2024-05-12": { totalHours: 3.8, completed: true, tasks: [{completed: true}, {completed: true}, {completed: true}, {completed: true}] },
                  "2024-05-25": { totalHours: 2.3, completed: false, tasks: [{completed: true}, {completed: true}, {completed: false}, {completed: false}] },
                  "2024-06-07": { totalHours: 4.6, completed: true, tasks: [{completed: true}, {completed: true}, {completed: true}, {completed: true}] },
                  "2024-06-19": { totalHours: 1.5, completed: false, tasks: [{completed: true}, {completed: false}, {completed: false}, {completed: false}] },
                  "2024-07-03": { totalHours: 3.4, completed: true, tasks: [{completed: true}, {completed: true}, {completed: true}, {completed: true}] },
                  "2024-07-16": { totalHours: 2.7, completed: false, tasks: [{completed: true}, {completed: true}, {completed: false}, {completed: false}] },
                  "2024-08-09": { totalHours: 4.3, completed: true, tasks: [{completed: true}, {completed: true}, {completed: true}, {completed: true}] },
                  "2024-08-21": { totalHours: 0, completed: false, tasks: [{completed: false}, {completed: false}, {completed: false}, {completed: false}] },
                  "2024-09-04": { totalHours: 3.9, completed: true, tasks: [{completed: true}, {completed: true}, {completed: true}, {completed: true}] },
                  "2024-09-17": { totalHours: 2.4, completed: false, tasks: [{completed: true}, {completed: true}, {completed: false}, {completed: false}] },
                  "2024-10-11": { totalHours: 4.7, completed: true, tasks: [{completed: true}, {completed: true}, {completed: true}, {completed: true}] },
                  "2024-10-24": { totalHours: 1.9, completed: false, tasks: [{completed: true}, {completed: false}, {completed: false}, {completed: false}] },
                  "2024-11-06": { totalHours: 3.6, completed: true, tasks: [{completed: true}, {completed: true}, {completed: true}, {completed: true}] },
                  "2024-11-18": { totalHours: 2.8, completed: false, tasks: [{completed: true}, {completed: true}, {completed: true}, {completed: false}] },
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
                return { ...journeyData, ...dummyData }
              })()} 
              onDayEntry={onDayEntry} 
            />

            {/* Month Summary */}
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
              {(() => {
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
                  const entry = (() => {
                    const dummyData = {
                      "2024-01-15": { totalHours: 3.2, completed: true, tasks: [{completed: true}, {completed: true}, {completed: true}, {completed: true}] },
                      "2024-01-20": { totalHours: 2.1, completed: false, tasks: [{completed: true}, {completed: true}, {completed: false}, {completed: false}] },
                      "2024-02-05": { totalHours: 4.5, completed: true, tasks: [{completed: true}, {completed: true}, {completed: true}, {completed: true}] },
                      "2024-02-14": { totalHours: 1.8, completed: false, tasks: [{completed: true}, {completed: false}, {completed: false}, {completed: false}] },
                      "2024-03-10": { totalHours: 3.7, completed: true, tasks: [{completed: true}, {completed: true}, {completed: true}, {completed: true}] },
                      "2024-03-22": { totalHours: 2.9, completed: false, tasks: [{completed: true}, {completed: true}, {completed: true}, {completed: false}] },
                      "2024-04-08": { totalHours: 4.1, completed: true, tasks: [{completed: true}, {completed: true}, {completed: true}, {completed: true}] },
                      "2024-04-18": { totalHours: 0, completed: false, tasks: [{completed: false}, {completed: false}, {completed: false}, {completed: false}] },
                      "2024-05-12": { totalHours: 3.8, completed: true, tasks: [{completed: true}, {completed: true}, {completed: true}, {completed: true}] },
                      "2024-05-25": { totalHours: 2.3, completed: false, tasks: [{completed: true}, {completed: true}, {completed: false}, {completed: false}] },
                      "2024-06-07": { totalHours: 4.6, completed: true, tasks: [{completed: true}, {completed: true}, {completed: true}, {completed: true}] },
                      "2024-06-19": { totalHours: 1.5, completed: false, tasks: [{completed: true}, {completed: false}, {completed: false}, {completed: false}] },
                      "2024-07-03": { totalHours: 3.4, completed: true, tasks: [{completed: true}, {completed: true}, {completed: true}, {completed: true}] },
                      "2024-07-16": { totalHours: 2.7, completed: false, tasks: [{completed: true}, {completed: true}, {completed: false}, {completed: false}] },
                      "2024-08-09": { totalHours: 4.3, completed: true, tasks: [{completed: true}, {completed: true}, {completed: true}, {completed: true}] },
                      "2024-08-21": { totalHours: 0, completed: false, tasks: [{completed: false}, {completed: false}, {completed: false}, {completed: false}] },
                      "2024-09-04": { totalHours: 3.9, completed: true, tasks: [{completed: true}, {completed: true}, {completed: true}, {completed: true}] },
                      "2024-09-17": { totalHours: 2.4, completed: false, tasks: [{completed: true}, {completed: true}, {completed: false}, {completed: false}] },
                      "2024-10-11": { totalHours: 4.7, completed: true, tasks: [{completed: true}, {completed: true}, {completed: true}, {completed: true}] },
                      "2024-10-24": { totalHours: 1.9, completed: false, tasks: [{completed: true}, {completed: false}, {completed: false}, {completed: false}] },
                      "2024-11-06": { totalHours: 3.6, completed: true, tasks: [{completed: true}, {completed: true}, {completed: true}, {completed: true}] },
                      "2024-11-18": { totalHours: 2.8, completed: false, tasks: [{completed: true}, {completed: true}, {completed: true}, {completed: false}] },
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
                    const combinedData = { ...journeyData, ...dummyData }
                    return combinedData[dateStr]
                  })()
                  
                  // Check if date is before today (not today or future)
                  const isBeforeToday = date.getDate() < today.getDate() || 
                                       date.getMonth() < today.getMonth() || 
                                       date.getFullYear() < today.getFullYear()
                  
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
        </>
      )}

      {viewMode === "year" && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">Year at a Glance</h2>
          <YearHeatmap journeyData={displayData} />
        </div>
      )}

      {viewMode === "journey" && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">Your Journey</h2>
          <JourneyGraph journeyData={displayData} />
        </div>
      )}
      {/* Progress Filter - Enhanced */}
      <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl border border-slate-200 p-8 space-y-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800">Filter Your Progress</h3>
              <p className="text-sm text-slate-600">Analyze your journey with powerful filters</p>
            </div>
          </div>
          <div className="bg-white rounded-lg px-4 py-2 border border-slate-200 shadow-sm">
            <div className="text-lg font-bold text-slate-800">
              {(() => {
                const totalEntries = Object.keys(displayData).length
                const completedEntries = Object.values(displayData).filter(entry => entry.completed).length
                const percentage = totalEntries > 0 ? Math.round((completedEntries / totalEntries) * 100) : 0
                return `${percentage}%`
              })()} 
            </div>
            <div className="text-xs text-slate-600">
              {(() => {
                const totalEntries = Object.keys(displayData).length
                const completedEntries = Object.values(displayData).filter(entry => entry.completed).length
                return `${completedEntries}/${totalEntries} completed`
              })()} 
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Filters */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
              <div className="text-sm font-semibold text-slate-700">Quick Filters</div>
            </div>
            <div className="space-y-2">
              <button
                onClick={() => setFilterMode("year")}
                className={`w-full px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  filterMode === "year"
                    ? "bg-blue-500 text-white shadow-lg transform scale-105"
                    : "bg-white text-slate-700 hover:bg-blue-50 border border-slate-200 hover:border-blue-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span>📅 Full Year {new Date().getFullYear()}</span>
                  {filterMode === "year" && <span className="text-xs">✓</span>}
                </div>
              </button>
              <button
                onClick={() => setFilterMode("lastMonth")}
                className={`w-full px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  filterMode === "lastMonth"
                    ? "bg-blue-500 text-white shadow-lg transform scale-105"
                    : "bg-white text-slate-700 hover:bg-blue-50 border border-slate-200 hover:border-blue-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span>⏮️ Last Month</span>
                  {filterMode === "lastMonth" && <span className="text-xs">✓</span>}
                </div>
              </button>
            </div>
          </div>

          {/* Month Selector */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <div className="text-sm font-semibold text-slate-700">Select Specific Month</div>
            </div>
            <div className="grid grid-cols-4 gap-3">
              {months.map((month) => {
                const monthIndex = months.indexOf(month)
                const monthDate = new Date(new Date().getFullYear(), monthIndex, 1)
                const isSelected = filterMode === "month" && filteredMonth?.getMonth() === monthIndex
                
                // Calculate month stats
                const monthStats = (() => {
                  const year = new Date().getFullYear()
                  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate()
                  let completed = 0
                  let total = 0
                  
                  // Create combined data for this calculation
                  const dummyData = {
                    "2024-01-15": { totalHours: 3.2, completed: true, tasks: [{completed: true}, {completed: true}, {completed: true}, {completed: true}] },
                    "2024-01-20": { totalHours: 2.1, completed: false, tasks: [{completed: true}, {completed: true}, {completed: false}, {completed: false}] },
                    "2024-02-05": { totalHours: 4.5, completed: true, tasks: [{completed: true}, {completed: true}, {completed: true}, {completed: true}] },
                    "2024-02-14": { totalHours: 1.8, completed: false, tasks: [{completed: true}, {completed: false}, {completed: false}, {completed: false}] },
                    "2024-03-10": { totalHours: 3.7, completed: true, tasks: [{completed: true}, {completed: true}, {completed: true}, {completed: true}] },
                    "2024-03-22": { totalHours: 2.9, completed: false, tasks: [{completed: true}, {completed: true}, {completed: true}, {completed: false}] },
                    "2024-04-08": { totalHours: 4.1, completed: true, tasks: [{completed: true}, {completed: true}, {completed: true}, {completed: true}] },
                    "2024-04-18": { totalHours: 0, completed: false, tasks: [{completed: false}, {completed: false}, {completed: false}, {completed: false}] },
                    "2024-05-12": { totalHours: 3.8, completed: true, tasks: [{completed: true}, {completed: true}, {completed: true}, {completed: true}] },
                    "2024-05-25": { totalHours: 2.3, completed: false, tasks: [{completed: true}, {completed: true}, {completed: false}, {completed: false}] },
                    "2024-06-07": { totalHours: 4.6, completed: true, tasks: [{completed: true}, {completed: true}, {completed: true}, {completed: true}] },
                    "2024-06-19": { totalHours: 1.5, completed: false, tasks: [{completed: true}, {completed: false}, {completed: false}, {completed: false}] },
                    "2024-07-03": { totalHours: 3.4, completed: true, tasks: [{completed: true}, {completed: true}, {completed: true}, {completed: true}] },
                    "2024-07-16": { totalHours: 2.7, completed: false, tasks: [{completed: true}, {completed: true}, {completed: false}, {completed: false}] },
                    "2024-08-09": { totalHours: 4.3, completed: true, tasks: [{completed: true}, {completed: true}, {completed: true}, {completed: true}] },
                    "2024-08-21": { totalHours: 0, completed: false, tasks: [{completed: false}, {completed: false}, {completed: false}, {completed: false}] },
                    "2024-09-04": { totalHours: 3.9, completed: true, tasks: [{completed: true}, {completed: true}, {completed: true}, {completed: true}] },
                    "2024-09-17": { totalHours: 2.4, completed: false, tasks: [{completed: true}, {completed: true}, {completed: false}, {completed: false}] },
                    "2024-10-11": { totalHours: 4.7, completed: true, tasks: [{completed: true}, {completed: true}, {completed: true}, {completed: true}] },
                    "2024-10-24": { totalHours: 1.9, completed: false, tasks: [{completed: true}, {completed: false}, {completed: false}, {completed: false}] },
                    "2024-11-06": { totalHours: 3.6, completed: true, tasks: [{completed: true}, {completed: true}, {completed: true}, {completed: true}] },
                    "2024-11-18": { totalHours: 2.8, completed: false, tasks: [{completed: true}, {completed: true}, {completed: true}, {completed: false}] },
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
                  const combinedData = { ...journeyData, ...dummyData }
                  
                  for (let day = 1; day <= daysInMonth; day++) {
                    const date = new Date(year, monthIndex, day)
                    if (date <= new Date()) {
                      total++
                      const dateStr = date.toISOString().split("T")[0]
                      if (combinedData[dateStr]?.completed) completed++
                    }
                  }
                  return { completed, total, percentage: total > 0 ? Math.round((completed / total) * 100) : 0 }
                })()
                
                return (
                  <button
                    key={month}
                    onClick={() => {
                      setFilteredMonth(monthDate)
                      setFilterMode("month")
                    }}
                    className={`p-3 rounded-lg text-xs font-medium transition-all duration-200 relative overflow-hidden ${
                      isSelected
                        ? "bg-blue-500 text-white shadow-lg transform scale-105"
                        : "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 hover:border-slate-300"
                    }`}
                    title={`${month}: ${monthStats.completed}/${monthStats.total} days (${monthStats.percentage}%)`}
                  >
                    <div className="relative z-10">
                      <div className="font-semibold">{month.slice(0, 3)}</div>
                      <div className="text-xs opacity-80">{monthStats.completed}/{monthStats.total}</div>
                      <div className="text-xs font-bold">{monthStats.percentage}%</div>
                    </div>
                    {/* Progress bar background */}
                    <div 
                      className={`absolute bottom-0 left-0 h-1 transition-all duration-300 ${
                        isSelected ? "bg-white/30" : "bg-blue-200"
                      }`}
                      style={{ width: `${monthStats.percentage}%` }}
                    ></div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
        
        {/* Filter Results Summary */}
        <div className="border-t border-slate-200 pt-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
            <div className="text-sm font-semibold text-slate-700">Filtered Results</div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {(() => {
              const entries = Object.values(displayData)
              const totalHours = entries.reduce((sum, entry) => sum + entry.totalHours, 0)
              const avgHours = entries.length > 0 ? totalHours / entries.length : 0
              const completedDays = entries.filter(entry => entry.completed).length
              const streak = (() => {
                const sortedDates = Object.keys(displayData).sort().reverse()
                let currentStreak = 0
                for (const dateStr of sortedDates) {
                  if (displayData[dateStr].completed) {
                    currentStreak++
                  } else {
                    break
                  }
                }
                return currentStreak
              })()
              
              return (
                <>
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <span className="text-lg">📊</span>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-blue-600">{entries.length}</div>
                        <div className="text-xs text-slate-600 font-medium">Total Days</div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                        <span className="text-lg">✅</span>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-emerald-600">{completedDays}</div>
                        <div className="text-xs text-slate-600 font-medium">Completed</div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <span className="text-lg">⏰</span>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-purple-600">{totalHours.toFixed(1)}h</div>
                        <div className="text-xs text-slate-600 font-medium">Total Hours</div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                        <span className="text-lg">🔥</span>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-orange-600">{streak}</div>
                        <div className="text-xs text-slate-600 font-medium">Current Streak</div>
                      </div>
                    </div>
                  </div>
                </>
              )
            })()} 
          </div>
        </div>
      </div>
    </div>
  )
}