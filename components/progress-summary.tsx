"use client"

import { useAnalytics } from "@/hooks/use-data"
import { useEffect, useCallback, useRef, useState } from "react"
import { mnzdEvents } from "@/lib/mnzd-events"
import { Skeleton } from "@/components/ui/skeleton"

interface ProgressSummaryProps {
  currentMonth?: Date
}

export default function ProgressSummary({ currentMonth }: ProgressSummaryProps) {
  const { analytics, loading, refetch } = useAnalytics()
  const lastMonthRef = useRef<string | null>(null)
  const [isRefetching, setIsRefetching] = useState(false)

  const monthKey = currentMonth ? `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}` : null
  const monthName = currentMonth ? currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Current Month'

  const handleProgressUpdate = useCallback(() => {
    if (currentMonth) refetch(currentMonth)
  }, [refetch, currentMonth])

  // Immediate refetch when month changes
  useEffect(() => {
    if (monthKey && monthKey !== lastMonthRef.current) {
      lastMonthRef.current = monthKey
      // Show loading state immediately
      setIsRefetching(true)
      if (currentMonth) {
        refetch(currentMonth).finally(() => setIsRefetching(false))
      } else {
        setIsRefetching(false)
      }
    }
  }, [monthKey, refetch, currentMonth])

  useEffect(() => {
    window.addEventListener('progressUpdated', handleProgressUpdate)
    const unsubscribe = mnzdEvents.onProgressUpdate(handleProgressUpdate)
    return () => {
      window.removeEventListener('progressUpdated', handleProgressUpdate)
      unsubscribe()
    }
  }, [handleProgressUpdate])

  const isLoading = loading || isRefetching

  if (!analytics && isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-6 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    )
  }

  if (!analytics) return null

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Progress Summary - {monthName}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className={`bg-card rounded-lg border border-border p-6 transition-opacity duration-200 ${isLoading ? 'opacity-50' : 'opacity-100'}`}>
          <div className="space-y-4">
            <div>
              <div className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Current MNZD Streak</div>
              <div className="text-4xl font-bold text-primary">{analytics.currentStreak}</div>
              <div className="text-sm text-muted-foreground mt-1">complete days in a row</div>
            </div>
            <div className="border-t border-border pt-4">
              <div className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Best MNZD Streak</div>
              <div className="text-3xl font-bold text-foreground">{analytics.longestStreak}</div>
              <div className="text-sm text-muted-foreground mt-1">your longest run</div>
            </div>
          </div>
        </div>

        <div className={`bg-card rounded-lg border border-border p-6 transition-opacity duration-200 ${isLoading ? 'opacity-50' : 'opacity-100'}`}>
          <div className="space-y-4">
            <div>
              <div className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Monthly Days</div>
              <div className="text-4xl font-bold text-primary">{analytics.totalDays}</div>
              <div className="text-sm text-muted-foreground mt-1">days tracked this month</div>
            </div>
            <div className="border-t border-border pt-4">
              <div className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Monthly Hours</div>
              <div className="text-3xl font-bold text-foreground">{analytics.totalHours.toFixed(1)}</div>
              <div className="text-sm text-muted-foreground mt-1">hours invested this month</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
