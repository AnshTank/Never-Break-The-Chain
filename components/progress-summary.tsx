"use client"

import type { JourneyData } from "@/lib/types"

interface ProgressSummaryProps {
  journeyData: JourneyData
}

export default function ProgressSummary({ journeyData }: ProgressSummaryProps) {
  const dates = Object.keys(journeyData).sort()

  let currentStreak = 0
  let maxStreak = 0
  let tempStreak = 0
  let recoveries = 0
  let wasIncomplete = false

  for (const dateStr of dates) {
    const entry = journeyData[dateStr]

    if (entry.completed) {
      tempStreak++
      if (wasIncomplete) {
        recoveries++
      }
      wasIncomplete = false
    } else {
      maxStreak = Math.max(maxStreak, tempStreak)
      tempStreak = 0
      wasIncomplete = true
    }
  }
  currentStreak = tempStreak
  maxStreak = Math.max(maxStreak, tempStreak)

  // Count MNZD completions and incomplete days
  const completedDays = dates.filter((d) => journeyData[d].completed).length
  const incompleteDays = dates.filter((d) => {
    const entry = journeyData[d]
    if (!entry.tasks || entry.tasks.length === 0) return false
    const completedTasks = entry.tasks.filter(t => t.completed).length
    return completedTasks > 0 && completedTasks < 4 // At least 1 but not all 4
  }).length
  const noActivityDays = dates.filter((d) => {
    const entry = journeyData[d]
    if (!entry.tasks || entry.tasks.length === 0) return true
    return entry.tasks.filter(t => t.completed).length === 0
  }).length

  // Calculate MNZD consistency percentage (only count days with activity)
  const activeDays = completedDays + incompleteDays
  const consistencyPercent = activeDays > 0 ? Math.round((completedDays / activeDays) * 100) : 0

  // Calculate total hours
  const totalHours = dates.reduce((sum, dateStr) => sum + journeyData[dateStr].totalHours, 0)

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* MNZD Stats */}
      <div className="bg-card rounded-lg border border-border p-6">
        <div className="space-y-4">
          <div>
            <div className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Current MNZD Streak</div>
            <div className="text-4xl font-bold text-primary">{currentStreak}</div>
            <div className="text-sm text-muted-foreground mt-1">complete days in a row</div>
          </div>
          <div className="border-t border-border pt-4">
            <div className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Best MNZD Streak</div>
            <div className="text-3xl font-bold text-foreground">{maxStreak}</div>
            <div className="text-sm text-muted-foreground mt-1">your longest run</div>
          </div>
        </div>
      </div>

      {/* Consistency & Recovery */}
      <div className="bg-card rounded-lg border border-border p-6">
        <div className="space-y-4">
          <div>
            <div className="text-xs text-muted-foreground uppercase tracking-wide mb-2">MNZD Consistency</div>
            <div className="text-4xl font-bold text-primary">{consistencyPercent}%</div>
            <div className="text-sm text-muted-foreground mt-1">
              {completedDays} complete out of {activeDays} active days
            </div>
          </div>
          <div className="border-t border-border pt-4">
            <div className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Times You Recovered</div>
            <div className="text-3xl font-bold text-foreground">{recoveries}</div>
            <div className="text-sm text-muted-foreground mt-1">recovery &gt; perfect streaks</div>
          </div>
        </div>
      </div>

      {/* Breakdown */}
      <div className="md:col-span-2 bg-gradient-to-br from-muted/20 to-transparent rounded-lg border border-border p-6">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-sm text-muted-foreground mb-1">MNZD Complete</div>
            <div className="text-2xl font-semibold text-primary">{completedDays}</div>
            <div className="text-xs text-muted-foreground mt-1">all 4 tasks</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground mb-1">Incomplete Days</div>
            <div className="text-2xl font-semibold text-foreground">{incompleteDays}</div>
            <div className="text-xs text-muted-foreground mt-1">1-3 tasks done</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground mb-1">Total Hours</div>
            <div className="text-2xl font-semibold text-primary">
              {(() => {
                const total = dates.reduce((sum, dateStr) => sum + journeyData[dateStr].totalHours, 0)
                return isNaN(total) ? "0.0" : (Math.round(total * 10) / 10).toString()
              })()}
            </div>
            <div className="text-xs text-muted-foreground mt-1">invested</div>
          </div>
        </div>
      </div>
    </div>
  )
}
