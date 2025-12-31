"use client"

import { useState, useEffect } from "react"
import type { DayEntry, JourneyData, MNZDTask } from "@/lib/types"

interface DailyCheckInProps {
  onSubmit: (date: Date, entry: DayEntry) => void
  currentData: JourneyData
}

const defaultTasks: MNZDTask[] = [
  { id: "core", name: "Core Skill", completed: false },
  { id: "thinking", name: "Thinking", completed: false },
  { id: "communication", name: "Communication", completed: false },
  { id: "body", name: "Body", completed: false },
]

export default function DailyCheckIn({ onSubmit, currentData }: DailyCheckInProps) {
  const [todayEntry, setTodayEntry] = useState<DayEntry | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showHoursInput, setShowHoursInput] = useState(false)

  const today = new Date()
  const todayStr = today.toISOString().split("T")[0]

  useEffect(() => {
    const todayData = currentData[todayStr] || {
      date: todayStr,
      tasks: [...defaultTasks],
      totalHours: 0,
      note: "",
      completed: false,
    }
    
    setTodayEntry(todayData)
    setIsLoading(false)
  }, [currentData, todayStr])

  const handleTaskToggle = (taskId: string) => {
    if (!todayEntry) return
    const updatedTasks = todayEntry.tasks.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t))
    const newEntry = {
      ...todayEntry,
      tasks: updatedTasks,
      completed: updatedTasks.every((t) => t.completed),
    }
    setTodayEntry(newEntry)
    onSubmit(today, newEntry)
  }

  const handleHoursUpdate = (hours: number) => {
    if (!todayEntry) return
    const newEntry = { ...todayEntry, totalHours: hours }
    setTodayEntry(newEntry)
    onSubmit(today, newEntry)
    setShowHoursInput(false)
  }

  if (isLoading || !todayEntry) {
    return <div className="h-32 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
  }

  const todayCompleted = todayEntry.tasks.filter((t) => t.completed).length
  const todayAllCompleted = todayCompleted === 4

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">✅ TODAY'S MNZD</div>
            <div className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              {today.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </div>
          </div>
          <div className="text-right">
            <div className={`text-lg font-bold ${
              todayAllCompleted ? "text-green-600" : "text-gray-600 dark:text-gray-400"
            }`}>
              {todayCompleted}/4
            </div>
            <button
              onClick={() => setShowHoursInput(!showHoursInput)}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              {todayEntry.totalHours.toFixed(1)}h
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {todayEntry.tasks.map((task) => (
            <button
              key={task.id}
              onClick={() => handleTaskToggle(task.id)}
              className={`p-3 rounded-lg text-sm font-medium transition-all ${
                task.completed
                  ? "bg-green-100 text-green-800 border-2 border-green-300"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-2 border-gray-200 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <span className="text-lg">{task.completed ? "✅" : "⭕"}</span>
                <span>{task.name}</span>
              </div>
            </button>
          ))}
        </div>

        {showHoursInput && (
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Update today's hours:</div>
            <div className="flex items-center gap-2">
              {[0.5, 1, 2, 3, 4, 6].map(hours => (
                <button
                  key={hours}
                  onClick={() => handleHoursUpdate(hours)}
                  className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-sm hover:bg-blue-200 dark:hover:bg-blue-800"
                >
                  {hours}h
                </button>
              ))}
            </div>
          </div>
        )}

        {todayAllCompleted && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 text-center">
            <div className="text-green-800 dark:text-green-200 font-semibold">🎉 Today's MNZD Complete!</div>
          </div>
        )}
      </div>
    </div>
  )
}
