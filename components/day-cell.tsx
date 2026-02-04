"use client"

import { useState } from "react"
import type { DayEntry } from "@/lib/types"
import DayEditModal from "./day-edit-modal"
import { useDailyProgress, useUserSettings } from "@/hooks/use-data"
import { useGlobalDailyProgress, useGlobalState } from "@/lib/global-state"
import { mnzdEvents } from "@/lib/mnzd-events"

interface DayCellProps {
  day: number
  date: Date
  entry?: DayEntry
  isToday: boolean
  onEntryChange: (date: Date, entry: DayEntry) => void
}

export default function DayCell({ day, date, entry, isToday, onEntryChange }: DayCellProps) {
  const [showModal, setShowModal] = useState(false)
  const [localEntry, setLocalEntry] = useState<DayEntry | undefined>(entry)
  const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
  const { updateProgress } = useDailyProgress(dateStr)
  const { settings } = useUserSettings()
  const { getTodayProgress, updateProgressForDate, updateTodayProgressImmediate } = useGlobalDailyProgress()
  const globalState = useGlobalState()

  // Use global state data for today, local state for other days, fallback to prop data
  const actualEntry = isToday ? getTodayProgress() : (localEntry || entry)
  
  // Debug logging for December 30th and 31st
  if (dateStr === '2024-12-30' || dateStr === '2024-12-31') {
    // console.log(`Debug ${dateStr}:`, {
    //   dateStr,
    //   isToday,
    //   propEntry: entry,
    //   todayProgress: getTodayProgress(),
    //   actualEntry,
    //   hasActualEntry: !!actualEntry,
    //   hasTasks: !!actualEntry?.tasks,
    //   tasksLength: actualEntry?.tasks?.length || 0,
    //   completedTasks: actualEntry?.tasks?.filter(task => {
    //     const config = settings?.mnzdConfigs.find(c => c.id === task.id)
    //     const minRequired = config?.minMinutes || 0
    //     return task.minutes >= minRequired
    //   }).length || 0
    // })
  }

  const handleClick = () => {
    if (!isFuture) {
      setShowModal(true)
    }
  }

  // Calculate completion based on minutes vs minimum requirements
  let completedCount = 0
  if (actualEntry?.tasks && settings?.mnzdConfigs) {
    completedCount = actualEntry.tasks.filter((task: any) => {
      const config = settings.mnzdConfigs.find(c => c.id === task.id)
      const minRequired = config?.minMinutes || 0
      return task.minutes >= minRequired
    }).length
  }
  
  const allCompleted = completedCount === 4
  const hours = actualEntry?.totalHours || 0

  // Check if date is in the future
  const today = new Date()
  const isFuture = date.getTime() > today.getTime()

  // Use the isToday prop passed from parent (which does proper date comparison)
  const getHourColor = () => {
    if (isFuture) return "bg-gradient-to-br from-gray-100 to-gray-200 border border-gray-300 opacity-50"
    if (isToday) return "bg-gradient-to-br from-blue-200 to-blue-300 border-2 border-blue-400"
    
    // For past days only, use 5-color system based on task completion
    if (!actualEntry) return "bg-gradient-to-br from-red-100 to-red-200 border border-red-300" // 0 tasks - red
    
    if (completedCount === 0) return "bg-gradient-to-br from-red-100 to-red-200 border border-red-300" // 0 tasks - red
    if (completedCount === 1) return "bg-gradient-to-br from-orange-100 to-orange-200 border border-orange-300" // 1 task - orange
    if (completedCount === 2) return "bg-gradient-to-br from-yellow-100 to-yellow-200 border border-yellow-300" // 2 tasks - yellow
    if (completedCount === 3) return "bg-gradient-to-br from-blue-100 to-blue-200 border border-blue-300" // 3 tasks - blue
    if (completedCount === 4) return "bg-gradient-to-br from-green-100 to-green-200 border border-green-300" // 4 tasks - green
    
    return "bg-gradient-to-br from-gray-100 to-gray-200 border border-gray-300"
  }

  const handleSave = async (newEntry: DayEntry) => {
    try {
      // Update local state immediately for UI responsiveness
      if (!isToday) {
        setLocalEntry(newEntry)
      }
      
      if (isToday) {
        // Update UI immediately for today
        updateTodayProgressImmediate(newEntry)
        
        // Try server update in background (silently)
        updateProgressForDate(dateStr, newEntry).catch(() => {/* Server update failed, but UI already updated */})
      } else {
        // For other days, update local cache immediately
        const today = new Date()
        const currentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`
        const trackedDays = JSON.parse(localStorage.getItem('trackedDays') || '{}')
        
        if (!trackedDays[currentMonth]) {
          trackedDays[currentMonth] = []
        }
        if (!trackedDays[currentMonth].includes(dateStr)) {
          trackedDays[currentMonth].push(dateStr)
          localStorage.setItem('trackedDays', JSON.stringify(trackedDays))
        }
        
        // Update local cache
        const progressCache = JSON.parse(localStorage.getItem('progressCache') || '{}')
        progressCache[dateStr] = newEntry
        localStorage.setItem('progressCache', JSON.stringify(progressCache))
        
        // Try server update in background
        updateProgress(newEntry).catch(() => {/* Server update failed, but UI already updated */})
      }
      
      setShowModal(false)
      onEntryChange(date, newEntry)
      
      // Refresh analytics and calendar
      window.dispatchEvent(new CustomEvent('progressUpdated', { detail: { date: dateStr } }))
      mnzdEvents.emitProgressUpdate(dateStr, newEntry)
      
      // Force analytics refresh
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('analyticsRefresh'))
      }, 100)
    } catch (error) {
      // console.error('Error saving entry:', error)
    }
  }

  return (
    <>
      <div
        onClick={handleClick}
        className={`
          relative w-full h-12 sm:h-16 rounded-lg transition-all shadow-sm ${isFuture ? 'cursor-not-allowed' : 'cursor-pointer hover:shadow-lg hover:scale-105'}
          ${getHourColor()}
          p-1 sm:p-2 flex flex-col items-center justify-center
        `}
        title={isFuture ? "Future dates cannot be edited" : actualEntry ? `${completedCount}/4 tasks, ${hours.toFixed(1)}h` : "Click to add entry"}
      >
        <div className={`text-xs sm:text-sm font-bold ${isFuture ? "text-gray-400" : isToday ? "text-blue-900" : "text-gray-900"}`}>{day}</div>
        {!isFuture && <div className={`text-xs font-semibold ${isToday ? "text-blue-800" : "text-gray-700"}`}>{completedCount}/4</div>}
        {allCompleted && !isFuture && (
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center shadow-sm z-10">
            <div className="text-white text-xs font-bold">✓</div>
          </div>
        )}
        {isToday && <div className="text-xs text-blue-800 font-bold hidden sm:block">TODAY</div>}
        {isFuture && <div className="text-xs text-gray-400 font-medium hidden sm:block">FUTURE</div>}
      </div>

      <DayEditModal
        isOpen={showModal && !isFuture}
        onClose={() => setShowModal(false)}
        onSave={handleSave}
        date={date}
        initialEntry={actualEntry}
      />
    </>
  )
}