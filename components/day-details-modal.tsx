"use client"

import { useState } from "react"
import type { DayEntry } from "@/lib/types"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface DayDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  date: Date
  entry?: DayEntry
}

export default function DayDetailsModal({ isOpen, onClose, date, entry }: DayDetailsModalProps) {
  const [isNotesExpanded, setIsNotesExpanded] = useState(false)

  const completedTasks = entry?.tasks?.filter((t: any) => t.completed).length || 0
  const totalTasks = entry?.tasks?.length || 4

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="scrollbar-hide">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold">
            {date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
          </DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">
            {entry ? `${completedTasks}/${totalTasks} MNZD tasks completed` : "No activity recorded"}
          </p>
        </DialogHeader>

        <div className="space-y-6">
          {!entry ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📅</div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">No Activity</h3>
              <p className="text-gray-600 dark:text-gray-400">No data recorded for this day</p>
            </div>
          ) : (
            <>
              {/* Day Summary */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{entry.totalHours.toFixed(1)}h</div>
                    <div className="text-sm text-blue-700 dark:text-blue-300">Total Hours</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">{completedTasks}/{totalTasks}</div>
                    <div className="text-sm text-purple-700 dark:text-purple-300">MNZD Tasks</div>
                  </div>
                </div>
                
                {entry.completed && (
                  <div className="mt-4 text-center">
                    <div className="inline-flex items-center px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-full text-sm font-medium">
                      ✓ MNZD Complete
                    </div>
                  </div>
                )}
              </div>

              {/* MNZD Tasks Status */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  MNZD Tasks
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {entry.tasks?.map((task: any, index: number) => {
                    const taskName = task.name || `Task ${index + 1}`
                    
                    return (
                      <div key={task.id || index} className={`p-4 rounded-lg border-2 transition-all ${
                        task.completed 
                          ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800" 
                          : "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                      }`}>
                        <div className="flex items-center gap-3">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${
                            task.completed 
                              ? "bg-green-500 text-white" 
                              : "bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-400"
                          }`}>
                            {task.completed ? "✓" : "○"}
                          </div>
                          <div className="flex-grow">
                            <div className={`font-medium ${
                              task.completed 
                                ? "text-green-800 dark:text-green-300" 
                                : "text-gray-700 dark:text-gray-300"
                            }`}>
                              {taskName}
                            </div>
                            {task.minutes > 0 && (
                              <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                {task.minutes} minutes
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Additional Activities Section */}
              {(!entry.note || entry.note.trim() === "") && (
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-lg p-6 text-center">
                  <div className="text-4xl mb-2">📝</div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">No Additional Notes</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">No extra activities or notes recorded for this day</p>
                </div>
              )}

              {/* Notes */}
              {entry.note && entry.note.trim() !== "" && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                      📝 What I Did Extra
                    </h3>
                    {entry.note.length > 150 && (
                      <button
                        onClick={() => setIsNotesExpanded(!isNotesExpanded)}
                        className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors"
                      >
                        {isNotesExpanded ? "Show Less" : "Show More"}
                      </button>
                    )}
                  </div>
                  <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                    <p className={`text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed ${
                      !isNotesExpanded && entry.note.length > 150 ? "line-clamp-3" : ""
                    }`}>
                      {!isNotesExpanded && entry.note.length > 150 
                        ? entry.note.substring(0, 150) + "..." 
                        : entry.note
                      }
                    </p>
                    {!isNotesExpanded && entry.note.length > 150 && (
                      <button
                        onClick={() => setIsNotesExpanded(true)}
                        className="mt-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors"
                      >
                        Read more
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Performance Insights */}
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Day Insights</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                  <div className="p-3 bg-white dark:bg-gray-800 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {Math.round((completedTasks / totalTasks) * 100)}%
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Task Completion</div>
                  </div>
                  <div className="p-3 bg-white dark:bg-gray-800 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {completedTasks > 0 ? (entry.totalHours / completedTasks).toFixed(1) : "0"}h
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Avg per Task</div>
                  </div>
                  <div className="p-3 bg-white dark:bg-gray-800 rounded-lg">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {entry.completed ? "🎯" : completedTasks > 0 ? "📈" : "⏸️"}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      {entry.completed ? "Perfect" : completedTasks > 0 ? "Progress" : "Rest"}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}