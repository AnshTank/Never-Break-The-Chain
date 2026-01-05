"use client"

import { useState } from "react"
import type { JourneyData, DayEntry } from "@/lib/types"
import DayDetailsModal from "./day-details-modal"

interface CompactMonthViewProps {
  month: Date
  journeyData: JourneyData
  onDayEntry: (date: Date, entry: DayEntry) => void
}

export default function CompactMonthView({ month, journeyData }: CompactMonthViewProps) {
  const [selectedDay, setSelectedDay] = useState<{ date: Date; entry: DayEntry | undefined } | null>(null)
  
  const getDaysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  const getFirstDayOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  
  const daysInMonth = getDaysInMonth(month)
  const firstDay = getFirstDayOfMonth(month)

  const weekDayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  const getColorForDay = (date: Date) => {
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
    const today = new Date()
    const entry = journeyData[dateStr]
    const isToday = date.getDate() === today.getDate() && 
                   date.getMonth() === today.getMonth() && 
                   date.getFullYear() === today.getFullYear()

    if (isToday) return "bg-gradient-to-br from-blue-400 to-blue-600 text-white shadow-lg"
    if (!entry || entry.totalHours <= 0) return "bg-gradient-to-br from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-800"
    
    const hours = entry.totalHours
    // Color based purely on hours invested
    if (hours < 0.5) return "bg-gradient-to-br from-red-100 to-red-200 text-red-800"
    if (hours < 1) return "bg-gradient-to-br from-orange-100 to-orange-200 text-orange-800"
    if (hours < 2) return "bg-gradient-to-br from-yellow-100 to-yellow-200 text-yellow-800"
    if (hours < 3) return "bg-gradient-to-br from-lime-100 to-lime-200 text-lime-800"
    if (hours < 4) return "bg-gradient-to-br from-green-200 to-green-300 text-green-800"
    if (hours < 6) return "bg-gradient-to-br from-emerald-300 to-emerald-400 text-emerald-900"
    if (hours < 8) return "bg-gradient-to-br from-teal-400 to-teal-500 text-white"
    return "bg-gradient-to-br from-cyan-500 to-blue-600 text-white"
  }

  return (
    <>
      <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-xl">
        {/* Weekday headers */}
        <div className="flex mb-4">
          {weekDayLabels.map((day, index) => (
            <div key={`weekday-${index}`} className="flex-1 text-center text-sm font-bold text-gray-700 dark:text-gray-300 py-3">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid - seamless design */}
        <div className="space-y-2">
          {Array.from({ length: Math.ceil((daysInMonth + firstDay) / 7) }, (_, weekIndex) => (
            <div key={weekIndex} className="flex gap-2">
              {Array.from({ length: 7 }, (_, dayIndex) => {
                const dayNumber = weekIndex * 7 + dayIndex - firstDay + 1
                const isValidDay = dayNumber > 0 && dayNumber <= daysInMonth
                
                if (!isValidDay) {
                  return <div key={dayIndex} className="flex-1 h-20" />
                }
                
                const date = new Date(month.getFullYear(), month.getMonth(), dayNumber)
                const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
                const entry = journeyData[dateStr]
                
                if (dayNumber === 1) {
                  console.log(`DEBUG Day 1 - Generated dateStr: '${dateStr}'`)
                  console.log(`DEBUG Day 1 - Available keys in journeyData:`, Object.keys(journeyData))
                  console.log(`DEBUG Day 1 - Entry found:`, entry)
                }
                
                console.log(`CompactMonthView - Date ${dateStr}, Entry:`, entry)
                const today = new Date()
                const isToday = date.getDate() === today.getDate() && 
                               date.getMonth() === today.getMonth() && 
                               date.getFullYear() === today.getFullYear()
                
                return (
                  <button
                    key={dayIndex}
                    onClick={() => setSelectedDay({ date, entry })}
                    className={`
                      flex-1 h-20 rounded-xl flex flex-col items-center justify-center font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg relative border border-transparent hover:border-white/30
                      ${getColorForDay(date)}
                    `}
                    title={
                      entry 
                        ? `${entry.totalHours.toFixed(1)}h, ${entry.tasks?.filter(t => t.completed).length || 0}/4 tasks` 
                        : "No activity recorded"
                    }
                  >
                    <div className="text-lg font-medium mb-1">
                      {dayNumber}
                    </div>
                    {entry ? (
                      <div className="text-xs font-normal opacity-80">
                        {(() => {
                          console.log(`Day ${dayNumber} - Entry exists:`, !!entry, 'Tasks:', entry.tasks)
                          if (!entry.tasks || !Array.isArray(entry.tasks)) {
                            console.log(`Day ${dayNumber} - Invalid tasks array`)
                            return "No tasks"
                          }
                          const completedTasks = entry.tasks.filter(t => t && t.completed).length
                          console.log(`Day ${dayNumber} - Completed tasks: ${completedTasks}, Total hours: ${entry.totalHours}`)
                          return `${completedTasks}/4 • ${entry.totalHours.toFixed(1)}h`
                        })()} 
                      </div>
                    ) : (
                      <div className="text-xs font-normal opacity-80">No data</div>
                    )}
                    {isToday && (
                      <div className="text-xs font-medium opacity-90 mt-1">TODAY</div>
                    )}
                    {entry?.completed && (
                      <div className="absolute -top-1 -right-1 bg-green-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs shadow-md">
                        ✓
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          ))}
        </div>

        {/* Color Legend */}
        <div className="mt-6 bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">Hours Color Guide</h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-gradient-to-br from-red-100 to-red-200"></div>
              <span className="text-gray-700 dark:text-gray-300">&lt; 0.5h: Very Low</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-gradient-to-br from-orange-100 to-orange-200"></div>
              <span className="text-gray-700 dark:text-gray-300">0.5-1h: Low</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-gradient-to-br from-yellow-100 to-yellow-200"></div>
              <span className="text-gray-700 dark:text-gray-300">1-2h: Moderate</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-gradient-to-br from-lime-100 to-lime-200"></div>
              <span className="text-gray-700 dark:text-gray-300">2-3h: Good</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-gradient-to-br from-green-200 to-green-300"></div>
              <span className="text-gray-700 dark:text-gray-300">3-4h: Very Good</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-gradient-to-br from-emerald-300 to-emerald-400"></div>
              <span className="text-gray-700 dark:text-gray-300">4-6h: Excellent</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-gradient-to-br from-teal-400 to-teal-500"></div>
              <span className="text-gray-700 dark:text-gray-300">6-8h: Outstanding</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-gradient-to-br from-cyan-500 to-blue-600"></div>
              <span className="text-gray-700 dark:text-gray-300">8+ hours: Exceptional</span>
            </div>
          </div>
        </div>
      </div>

      <DayDetailsModal
        isOpen={selectedDay !== null}
        onClose={() => setSelectedDay(null)}
        date={selectedDay?.date || new Date()}
      />
    </>
  )
}