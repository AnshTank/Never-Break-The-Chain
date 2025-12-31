"use client"

import { useState } from "react"
import type { JourneyData } from "@/lib/types"

interface YearHeatmapProps {
  journeyData: JourneyData
}

export default function YearHeatmap({ journeyData }: YearHeatmapProps) {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())

  const getColorForHours = (hours: number) => {
    if (hours === 0) return "bg-gray-100 dark:bg-gray-800"
    if (hours < 1) return "bg-green-100 dark:bg-green-900"
    if (hours < 2) return "bg-green-200 dark:bg-green-800"
    if (hours < 3) return "bg-green-300 dark:bg-green-700"
    if (hours < 4) return "bg-green-400 dark:bg-green-600"
    return "bg-green-500 dark:bg-green-500"
  }

  const getYearData = (year: number) => {
    // Generate comprehensive dummy data for entire year
    const dummyData: any = {}
    
    // Generate data for every day of the year
    for (let month = 0; month < 12; month++) {
      const daysInMonth = new Date(year, month + 1, 0).getDate()
      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day)
        const dateStr = date.toISOString().split("T")[0]
        
        // Skip future dates
        if (date > new Date()) continue
        
        // Generate realistic data with some variation
        const dayOfWeek = date.getDay()
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
        
        // 85% chance of having data on weekdays, 60% on weekends
        const hasData = Math.random() < (isWeekend ? 0.6 : 0.85)
        
        if (hasData) {
          // Generate hours (0-6 range with realistic distribution)
          const hours = Math.random() < 0.1 ? 0 : // 10% chance of 0 hours
                       Math.random() < 0.2 ? Math.random() * 1 : // 20% chance of 0-1 hours
                       Math.random() < 0.4 ? 1 + Math.random() * 1.5 : // 40% chance of 1-2.5 hours
                       Math.random() < 0.7 ? 2.5 + Math.random() * 1.5 : // 30% chance of 2.5-4 hours
                       4 + Math.random() * 2 // 30% chance of 4-6 hours
          
          const roundedHours = Math.round(hours * 10) / 10
          
          // Generate task completion based on hours
          const taskCount = hours === 0 ? 0 :
                           hours < 1 ? 1 :
                           hours < 2.5 ? 2 :
                           hours < 4 ? 3 : 4
          
          const tasks = Array.from({ length: 4 }, (_, i) => ({
            completed: i < taskCount
          }))
          
          dummyData[dateStr] = {
            totalHours: roundedHours,
            completed: taskCount === 4,
            tasks
          }
        }
      }
    }
    
    const combinedData = { ...journeyData, ...dummyData }
    
    const yearData = []
    for (let month = 0; month < 12; month++) {
      const monthData = []
      const daysInMonth = new Date(year, month + 1, 0).getDate()
      const firstDay = new Date(year, month, 1).getDay()
      
      // Add empty cells for days before month starts
      for (let i = 0; i < firstDay; i++) {
        monthData.push(null)
      }
      
      // Add actual days
      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day)
        const dateStr = date.toISOString().split("T")[0]
        const entry = combinedData[dateStr]
        monthData.push({
          day,
          date,
          hours: entry?.totalHours || 0,
          entry
        })
      }
      
      yearData.push(monthData)
    }
    return yearData
  }

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  const yearData = getYearData(selectedYear)

  const getYearStats = (year: number) => {
    // Generate same dummy data for stats calculation
    const dummyData: any = {}
    
    for (let month = 0; month < 12; month++) {
      const daysInMonth = new Date(year, month + 1, 0).getDate()
      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day)
        const dateStr = date.toISOString().split("T")[0]
        
        if (date > new Date()) continue
        
        const dayOfWeek = date.getDay()
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
        const hasData = Math.random() < (isWeekend ? 0.6 : 0.85)
        
        if (hasData) {
          const hours = Math.random() < 0.1 ? 0 :
                       Math.random() < 0.2 ? Math.random() * 1 :
                       Math.random() < 0.4 ? 1 + Math.random() * 1.5 :
                       Math.random() < 0.7 ? 2.5 + Math.random() * 1.5 :
                       4 + Math.random() * 2
          
          const roundedHours = Math.round(hours * 10) / 10
          const taskCount = hours === 0 ? 0 : hours < 1 ? 1 : hours < 2.5 ? 2 : hours < 4 ? 3 : 4
          
          dummyData[dateStr] = {
            totalHours: roundedHours,
            completed: taskCount === 4
          }
        }
      }
    }
    
    const combinedData = { ...journeyData, ...dummyData }
    
    let totalDays = 0
    let completedDays = 0
    let totalHours = 0
    
    for (let month = 0; month < 12; month++) {
      const daysInMonth = new Date(year, month + 1, 0).getDate()
      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day)
        if (date <= new Date()) {
          totalDays++
          const dateStr = date.toISOString().split("T")[0]
          const entry = combinedData[dateStr]
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

  const yearStats = getYearStats(selectedYear)

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

      {/* LeetCode-style Heatmap */}
      <div className="bg-card rounded-lg border border-border p-4">
        <h3 className="text-sm font-semibold text-foreground mb-4">{selectedYear} Activity</h3>
        <div className="space-y-4">
          {Array.from({ length: 3 }, (_, rowIdx) => (
            <div key={rowIdx} className="grid grid-cols-4 gap-4">
              {yearData.slice(rowIdx * 4, (rowIdx + 1) * 4).map((monthData, monthIdx) => {
                const actualMonthIdx = rowIdx * 4 + monthIdx
                return (
                  <div key={actualMonthIdx} className="space-y-1">
                    <div className="text-xs font-medium text-muted-foreground text-center">
                      {monthNames[actualMonthIdx]}
                    </div>
                    <div className="grid grid-cols-7 gap-1">
                      {monthData.map((dayData, dayIdx) => {
                        if (!dayData) {
                          return <div key={`empty-${dayIdx}`} className="w-6 h-6" />
                        }
                        
                        const isToday = dayData.date.toDateString() === new Date().toDateString()
                        
                        return (
                          <div
                            key={dayData.day}
                            title={`${monthNames[actualMonthIdx]} ${dayData.day}, ${selectedYear}: ${dayData.hours.toFixed(1)} hours`}
                            className={`
                              w-6 h-6 rounded-sm cursor-default transition-all hover:scale-125
                              ${getColorForHours(dayData.hours)}
                              ${isToday ? 'ring-2 ring-blue-500 ring-offset-1' : ''}
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
        
        {/* Legend */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
          <span className="text-xs text-muted-foreground">Less</span>
          <div className="flex gap-1">
            <div className="w-6 h-6 rounded-sm bg-gray-100 dark:bg-gray-800" />
            <div className="w-6 h-6 rounded-sm bg-green-100 dark:bg-green-900" />
            <div className="w-6 h-6 rounded-sm bg-green-200 dark:bg-green-800" />
            <div className="w-6 h-6 rounded-sm bg-green-300 dark:bg-green-700" />
            <div className="w-6 h-6 rounded-sm bg-green-400 dark:bg-green-600" />
            <div className="w-6 h-6 rounded-sm bg-green-500 dark:bg-green-500" />
          </div>
          <span className="text-xs text-muted-foreground">More</span>
        </div>
      </div>
    </div>
  )
}