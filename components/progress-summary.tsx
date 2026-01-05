"use client"

import { useAnalytics } from "@/hooks/use-data"
import { RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useEffect } from "react"

interface ProgressSummaryProps {
  currentMonth?: Date
}

export default function ProgressSummary({ currentMonth }: ProgressSummaryProps) {
  const { analytics, loading, refetch } = useAnalytics()

  // Refresh analytics when month changes
  useEffect(() => {
    if (currentMonth) {
      const monthKey = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}`
      refetch(currentMonth)
    }
  }, [currentMonth?.getFullYear(), currentMonth?.getMonth()])

  // Listen for analytics refresh events
  useEffect(() => {
    const handleAnalyticsRefresh = () => {
      refetch(currentMonth)
    }
    
    window.addEventListener('analyticsRefresh', handleAnalyticsRefresh)
    return () => window.removeEventListener('analyticsRefresh', handleAnalyticsRefresh)
  }, [currentMonth, refetch])

  const handleRefresh = async () => {
    await refetch(currentMonth)
  }

  if (loading || !analytics) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Progress Summary</h3>
          <Button variant="outline" size="sm" disabled>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-card rounded-lg border border-border p-6 animate-pulse">
              <div className="h-4 bg-muted rounded mb-4"></div>
              <div className="h-8 bg-muted rounded mb-2"></div>
              <div className="h-3 bg-muted rounded"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const monthName = currentMonth ? currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Current Month'

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
