"use client"

import { useState, useEffect } from "react"
import type { DayEntry, MNZDTask } from "@/lib/types"

interface DayEditModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (entry: DayEntry) => void
  date: Date
  initialEntry: DayEntry | undefined
}

const createEmptyEntry = (date: Date): DayEntry => ({
  date: date.toISOString().split("T")[0],
  tasks: [
    { id: "core", name: "1️⃣ Core Skill Action", completed: false, minutes: 0 },
    { id: "thinking", name: "2️⃣ Thinking Action", completed: false, minutes: 0 },
    { id: "communication", name: "3️⃣ Communication Action", completed: false, minutes: 0 },
    { id: "body", name: "4️⃣ Body Action", completed: false, minutes: 0 },
  ] as MNZDTask[],
  totalHours: 0,
  note: "",
  completed: false,
})

export default function DayEditModal({ isOpen, onClose, onSave, date, initialEntry }: DayEditModalProps) {
  const [entry, setEntry] = useState<DayEntry>(initialEntry || createEmptyEntry(date))

  useEffect(() => {
    setEntry(initialEntry || createEmptyEntry(date))
  }, [initialEntry, date])

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const [expandedTask, setExpandedTask] = useState<string | null>(null)

  if (!isOpen) return null

  const handleTaskToggle = (taskId: string) => {
    setEntry((prev) => {
      if (!prev.tasks) return prev
      const updatedTasks = prev.tasks.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t))
      return {
        ...prev,
        tasks: updatedTasks,
        completed: updatedTasks.every((t) => t.completed),
      }
    })
  }

  const handleTaskMinutes = (taskId: string, minutes: number) => {
    setEntry((prev) => {
      if (!prev.tasks) return prev
      const updatedTasks = prev.tasks.map((t) => (t.id === taskId ? { ...t, minutes } : t))
      const newTotal = updatedTasks.reduce((sum, t) => sum + (t.minutes || 0) / 60, 0)
      return {
        ...prev,
        tasks: updatedTasks,
        totalHours: isNaN(newTotal) ? 0 : newTotal,
      }
    })
  }

  const handleHoursChange = (hours: number) => {
    setEntry((prev) => ({
      ...prev,
      totalHours: isNaN(hours) ? 0 : hours,
    }))
  }

  const handleSave = () => {
    if (!entry.tasks || entry.tasks.length === 0) {
      onSave(entry)
      return
    }
    const allCompleted = entry.tasks.every((t) => t.completed)
    onSave({
      ...entry,
      completed: allCompleted,
      totalHours: isNaN(entry.totalHours) ? 0 : Math.round(entry.totalHours * 10) / 10,
    })
  }

  const allCompleted = entry.tasks && entry.tasks.length > 0 ? entry.tasks.every((t) => t.completed) : false

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ 
      position: 'fixed',
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      backdropFilter: 'blur(4px)'
    }}>
      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl scrollbar-hide">
        <style jsx>{`
          .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
        `}</style>
        <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
              {date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Complete all 4 tasks for MNZD</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl">
            ×
          </button>
        </div>

        <div className="p-6 space-y-6 bg-white dark:bg-gray-900">
          {/* Quick MNZD Update */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">Quick MNZD Update</h3>
            <div className="flex flex-wrap gap-2">
              {entry.tasks?.map((task, index) => (
                <button
                  key={task.id || index}
                  onClick={() => handleTaskToggle(task.id)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    task.completed
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                  }`}
                >
                  {task.name.split(' ')[0]} {task.completed ? '✓' : ''}
                </button>
              ))}
            </div>
          </div>

          {/* Hours Input */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100">Total Hours Invested</label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min="0"
                max="24"
                step="0.1"
                value={entry.totalHours || 0}
                onChange={(e) => handleHoursChange(parseFloat(e.target.value) || 0)}
                className="w-24 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-600 dark:text-gray-400">hours</span>
              <input
                type="range"
                min="0"
                max="12"
                step="0.1"
                value={entry.totalHours || 0}
                onChange={(e) => handleHoursChange(parseFloat(e.target.value) || 0)}
                className="flex-1"
              />
            </div>
          </div>

          {/* Tasks */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">MNZD Tasks Detail</h3>
            {entry.tasks &&
              entry.tasks.map((task, index) => (
                <div key={task.id || index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-3 bg-gray-50 dark:bg-gray-800">
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => handleTaskToggle(task.id)}
                      className={`flex-shrink-0 w-6 h-6 rounded border-2 flex items-center justify-center text-lg transition-colors ${
                        task.completed
                          ? "border-blue-500 bg-blue-500 text-white"
                          : "border-gray-300 dark:border-gray-600 hover:border-blue-500"
                      }`}
                    >
                      {task.completed ? "✓" : ""}
                    </button>
                    <div className="flex-grow">
                      <button
                        onClick={() => setExpandedTask(expandedTask === task.id ? null : task.id)}
                        className="text-left w-full"
                      >
                        <div className="font-semibold text-gray-900 dark:text-gray-100">
                          {task.name}
                        </div>
                      </button>
                    </div>
                  </div>

                  {expandedTask === task.id && (
                    <div className="border-t border-gray-200 dark:border-gray-600 pt-3 space-y-3">
                      <div>
                        <label className="text-sm text-gray-600 dark:text-gray-400 block mb-2">
                          Minutes spent ({task.minutes || 0} min)
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="120"
                          value={task.minutes || 0}
                          onChange={(e) => handleTaskMinutes(task.id, Number.parseInt(e.target.value))}
                          className="w-full"
                        />
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {(() => {
                            const hours = (task.minutes || 0) / 60
                            return isNaN(hours) ? "0" : (Math.round(hours * 10) / 10).toString()
                          })()} hours
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
          </div>

          {/* Notes */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100">What did you do? (optional)</label>
            <textarea
              value={entry.note || ""}
              onChange={(e) => setEntry((prev) => ({ ...prev, note: e.target.value }))}
              placeholder="Describe what you worked on, how you felt, or what you learned..."
              className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none h-20"
            />
          </div>

          {/* Summary */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Total time:</span>
              <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {(() => {
                  const hours = entry.totalHours || 0
                  return isNaN(hours) ? "0.0" : (Math.round(hours * 10) / 10).toString()
                })()} hours
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-gray-100 dark:bg-gray-800">
              <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">MNZD Status:</span>
              <span className={`text-lg font-semibold ${allCompleted ? "text-blue-600 dark:text-blue-400" : "text-gray-600 dark:text-gray-400"}`}>
                {allCompleted ? "✅ COMPLETE" : `${entry.tasks ? entry.tasks.filter((t) => t.completed).length : 0}/4`}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4 flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Close
            </button>
            <button
              onClick={handleSave}
              className={`flex-1 rounded-md px-4 py-2 font-medium transition-colors ${
                allCompleted
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
              }`}
            >
              Save Day
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
