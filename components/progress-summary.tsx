"use client"

import { useAnalytics } from "@/hooks/use-data"
import { RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useEffect, useCallback, useRef } from "react"
import { mnzdEvents } from "@/lib/mnzd-events"

interface ProgressSummaryProps {
  currentMonth?: Date
}

export default function ProgressSummary({ currentMonth }: ProgressSummaryProps) {
  const { analytics, loading, refetch } = useAnalytics()
  const lastMonthRef = useRef<string | null>(null)
  const isInitialMount = useRef(true)

  // Calculate month key directly
  const monthKey = currentMonth ? `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}` : null
  
  // Calculate month name directly
  const monthName = currentMonth ? currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Current Month'
  
  // Optimize refresh handler with useCallback
  const handleRefresh = useCallback(async () => {
    if (currentMonth) {
      await refetch(currentMonth)
      // Trigger calendar refresh by emitting progress update event
      window.dispatchEvent(new CustomEvent('progressUpdated', { detail: { refreshAll: true } }))
      mnzdEvents.emitProgressUpdate('refresh', {})
    }
  }, [refetch, currentMonth])

  // Listen for progress updates to auto-refresh analytics
  const handleProgressUpdate = useCallback(() => {
    if (currentMonth) {
      refetch(currentMonth)
    }
  }, [refetch, currentMonth])

  // Only fetch on mount and when month actually changes
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false
      return // Don't fetch on initial mount, global state handles it
    }
    
    if (monthKey && monthKey !== lastMonthRef.current) {
      console.log('Month changed from', lastMonthRef.current, 'to', monthKey, '- fetching new data')
      lastMonthRef.current = monthKey
      if (currentMonth) {
        // Force refetch with the new month
        refetch(currentMonth)
      }
    }
  }, [monthKey, refetch, currentMonth])

  // Listen for progress updates to keep analytics in sync
  useEffect(() => {
    window.addEventListener('progressUpdated', handleProgressUpdate)
    const unsubscribe = mnzdEvents.onProgressUpdate(handleProgressUpdate)
    
    return () => {
      window.removeEventListener('progressUpdated', handleProgressUpdate)
      unsubscribe()
    }
  }, [handleProgressUpdate])

  if (loading || !analytics) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-6 w-48 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded animate-pulse"></div>
          <div className="h-8 w-8 bg-gradient-to-r from-blue-200 to-blue-300 dark:from-blue-800 dark:to-blue-700 rounded animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <div key={i} className="bg-card rounded-lg border border-border p-6 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent dark:via-gray-800/50 animate-shimmer"></div>
              <div className="space-y-4 relative">
                <div>
                  <div className="h-3 w-32 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded animate-pulse mb-2"></div>
                  <div className="h-10 w-16 bg-gradient-to-r from-blue-200 to-purple-200 dark:from-blue-800 dark:to-purple-800 rounded animate-pulse mb-2"></div>
                  <div className="h-3 w-24 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded animate-pulse"></div>
                </div>
                <div className="border-t border-border pt-4">
                  <div className="h-3 w-28 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded animate-pulse mb-2"></div>
                  <div className="h-8 w-12 bg-gradient-to-r from-green-200 to-green-300 dark:from-green-800 dark:to-green-700 rounded animate-pulse mb-2"></div>
                  <div className="h-3 w-20 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded animate-pulse"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <style jsx>{`
          @keyframes shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
          .animate-shimmer {
            animation: shimmer 2s infinite;
          }
        `}</style>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Progress Summary - {monthName}</h3>
        <Button variant="outline" size="sm" onClick={handleRefresh}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* MNZD Stats */}
        <div className="bg-card rounded-lg border border-border p-6">
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

        {/* Consistency & Recovery */}
        <div className="bg-card rounded-lg border border-border p-6">
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
