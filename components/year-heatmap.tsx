"use client"

import { useState } from "react"
import type { JourneyData } from "@/lib/types"
import { useSharedData } from "@/lib/data-provider"

interface YearHeatmapProps {
  journeyData: JourneyData
}

export default function YearHeatmap({ journeyData }: YearHeatmapProps) {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const { loading } = useSharedData()
  
  // Filter data for selected year
  const yearData = Object.entries(journeyData).reduce((acc, [dateStr, entry]) => {
    const entryYear = new Date(dateStr).getFullYear()
    if (entryYear === selectedYear) {
      acc[dateStr] = entry
    }
    return acc
  }, {} as JourneyData)

  const getColorForHours = (hours: number) => {
    // console.log('getColorForHours - hours:', hours, 'type:', typeof hours)
    if (hours < 0.1) return "bg-gray-100 dark:bg-gray-800"
    if (hours < 1) return "bg-green-100 dark:bg-green-900"
    if (hours < 2) return "bg-green-200 dark:bg-green-800"
    if (hours < 3) return "bg-green-300 dark:bg-green-700"
    if (hours < 4) return "bg-green-400 dark:bg-green-600"
    return "bg-green-500 dark:bg-green-500"
  }

  const getYearStats = () => {
    let totalDays = 0
    let completedDays = 0
    let totalHours = 0
    
    for (let month = 0; month < 12; month++) {
      const daysInMonth = new Date(selectedYear, month + 1, 0).getDate()
      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(selectedYear, month, day)
        if (date <= new Date()) {
          totalDays++
          const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
          const entry = yearData[dateStr]
          if (entry?.completed) {
            completedDays++
          }
          if (entry) {
            totalHours += entry.totalHours
          }
        }
      }
    }
    
    return { totalDays, completedDays, totalHours }
  }

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  const yearStats = getYearStats()

  return (
    <div className="space-y-6">
      {/* Year Controls */}
      <div className="flex items-center justify-end">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSelectedYear(selectedYear - 1)}
            className="px-3 py-1 rounded-md bg-muted hover:bg-muted/80 text-sm"
          >
            ←
          </button>
          <span className="text-lg font-semibold min-w-[80px] text-center">
            {selectedYear}
          </span>
          <button
            onClick={() => setSelectedYear(selectedYear + 1)}
            className="px-3 py-1 rounded-md bg-muted hover:bg-muted/80 text-sm"
          >
            →
          </button>
        </div>
      </div>

      {/* Year Stats */}
      <div className="bg-card rounded-lg border border-border p-4">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-primary">{yearStats.completedDays}</div>
            <div className="text-sm text-muted-foreground">Days Completed</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-emerald-600">{yearStats.totalHours.toFixed(1)}h</div>
            <div className="text-sm text-muted-foreground">Total Hours</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-600">
              {yearStats.totalDays > 0 ? Math.round((yearStats.completedDays / yearStats.totalDays) * 100) : 0}%
            </div>
            <div className="text-sm text-muted-foreground">Success Rate</div>
          </div>
        </div>
      </div>

      {/* GitHub-style Heatmap */}
      <div className="bg-card rounded-lg border border-border p-4">
        <h3 className="text-sm font-semibold text-foreground mb-4">{selectedYear} Activity</h3>
        <div className="space-y-6 min-h-[400px]">
          {loading ? (
            // Skeleton for heatmap
            <div className="space-y-6">
              {Array.from({ length: 3 }, (_, rowIdx) => (
                <div key={rowIdx} className="grid grid-cols-4 gap-6">
                  {Array.from({ length: 4 }, (_, colIdx) => (
                    <div key={colIdx} className="space-y-2 p-3 rounded-lg bg-gradient-to-br from-gray-50/50 to-gray-100/30 dark:from-gray-800/30 dark:to-gray-700/20">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                      <div className="grid grid-cols-7 gap-1">
                        {Array.from({ length: 35 }, (_, i) => (
                          <div key={i} className="w-5 h-5 bg-gray-200 dark:bg-gray-700 rounded-sm animate-pulse" />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              {Array.from({ length: 3 }, (_, rowIdx) => (
                <div key={rowIdx} className="grid grid-cols-4 gap-6">
                  {Array.from({ length: 4 }, (_, colIdx) => {
                    const monthIdx = rowIdx * 4 + colIdx
                    if (monthIdx >= 12) return null
                    
                    const daysInMonth = new Date(selectedYear, monthIdx + 1, 0).getDate()
                    const firstDay = new Date(selectedYear, monthIdx, 1).getDay()
                    
                    return (
                      <div key={monthIdx} className="space-y-2 p-3 rounded-lg bg-gradient-to-br from-gray-50/50 to-gray-100/30 dark:from-gray-800/30 dark:to-gray-700/20">
                        <div className="text-xs font-medium text-muted-foreground text-center">
                          {monthNames[monthIdx]}
                        </div>
                        <div className="grid grid-cols-7 gap-1">
                          {/* Empty cells for days before month starts */}
                          {Array.from({ length: firstDay }, (_, i) => (
                            <div key={`empty-${i}`} className="w-5 h-5" />
                          ))}
                          
                          {/* Actual days */}
                          {Array.from({ length: daysInMonth }, (_, dayIdx) => {
                            const day = dayIdx + 1
                            const date = new Date(selectedYear, monthIdx, day)
                            const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
                            const entry = yearData[dateStr]
                            const hours = entry?.totalHours || 0
                            const isToday = date.toDateString() === new Date().toDateString()
                            
                            return (
                              <div
                                key={day}
                                title={`${monthNames[monthIdx]} ${day}, ${selectedYear}: ${hours.toFixed(1)} hours${entry?.completed ? ' (MNZD Complete)' : ''}`}
                                className={`
                                  w-5 h-5 rounded-sm cursor-default transition-all hover:scale-125 hover:z-10 relative
                                  ${getColorForHours(hours)}
                                  ${isToday ? 'ring-1 ring-blue-500 ring-offset-1' : ''}
                                  ${entry?.completed ? 'ring-1 ring-green-400' : ''}
                                `}
                              />
                            )
                          })}
                        </div>
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Legend */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
          <span className="text-xs text-muted-foreground">Less</span>
          <div className="flex gap-1">
            <div className="w-5 h-5 rounded-sm bg-gray-100 dark:bg-gray-800" />
            <div className="w-5 h-5 rounded-sm bg-green-100 dark:bg-green-900" />
            <div className="w-5 h-5 rounded-sm bg-green-200 dark:bg-green-800" />
            <div className="w-5 h-5 rounded-sm bg-green-300 dark:bg-green-700" />
            <div className="w-5 h-5 rounded-sm bg-green-400 dark:bg-green-600" />
            <div className="w-5 h-5 rounded-sm bg-green-500 dark:bg-green-500" />
          </div>
          <span className="text-xs text-muted-foreground">More</span>
        </div>
      </div>
    </div>
  )
}