"use client"

import { useState } from "react"

interface ProgressFilterProps {
  filterMode: "year" | "lastMonth" | "month"
  onFilterChange: (mode: "year" | "lastMonth" | "month") => void
  onMonthSelect: (month: Date | null) => void
}

export default function ProgressFilter({ filterMode, onFilterChange, onMonthSelect }: ProgressFilterProps) {
  const [selectedMonth, setSelectedMonth] = useState<string>("")
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString())

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]
  const years = [2024, 2025, 2026]

  const handleMonthSelect = (monthName: string) => {
    setSelectedMonth(monthName)
    const monthIndex = months.indexOf(monthName)
    const month = new Date(Number.parseInt(selectedYear), monthIndex, 1)
    onMonthSelect(month)
    onFilterChange("month")
  }

  return (
    <div className="bg-card rounded-lg border border-border p-6 space-y-4">
      <div className="text-sm text-muted-foreground mb-4">View your progress:</div>

      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => {
            onFilterChange("year")
            setSelectedMonth("")
          }}
          className={`px-4 py-2 rounded-md text-sm transition-colors ${
            filterMode === "year"
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          }`}
        >
          Full Year
        </button>
        <button
          onClick={() => {
            onFilterChange("lastMonth")
            setSelectedMonth("")
          }}
          className={`px-4 py-2 rounded-md text-sm transition-colors ${
            filterMode === "lastMonth"
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          }`}
        >
          Last Month
        </button>
      </div>

      {/* Month selector */}
      <div className="space-y-3 border-t border-border pt-4">
        <div className="text-sm text-muted-foreground">Or choose a specific month:</div>

        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
        >
          {years.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>

        <div className="grid grid-cols-3 gap-2">
          {months.map((month) => (
            <button
              key={month}
              onClick={() => handleMonthSelect(month)}
              className={`px-3 py-2 rounded-md text-sm transition-colors ${
                selectedMonth === month
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {month.slice(0, 3)}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
