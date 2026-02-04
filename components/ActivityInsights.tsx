"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Activity, Clock, Target, TrendingUp } from 'lucide-react'

interface ActivityInsights {
  dailyActiveMinutes: number
  sessionActiveMinutes: number
  inactivityStreak: number
  isActiveUser: boolean
}

export default function ActivityInsights() {
  const [insights, setInsights] = useState<ActivityInsights>({
    dailyActiveMinutes: 0,
    sessionActiveMinutes: 0,
    inactivityStreak: 0,
    isActiveUser: true
  })

  useEffect(() => {
    const updateInsights = () => {
      // Mock data since we use email-only notifications
      const data = {
        dailyActiveMinutes: 45,
        weeklyGoalProgress: 78,
        streakMaintenance: 85,
        optimalTimes: ['7:00 AM', '6:00 PM'],
        sessionActiveMinutes: 25,
        inactivityStreak: 0,
        isActiveUser: true
      }
      setInsights(data)
    }

    // Update immediately
    updateInsights()

    // Update every minute
    const interval = setInterval(updateInsights, 60000)

    return () => clearInterval(interval)
  }, [])

  const getActivityStatus = () => {
    if (insights.isActiveUser) return { label: 'Active', color: 'bg-green-500' }
    if (insights.inactivityStreak < 2) return { label: 'Recently Active', color: 'bg-yellow-500' }
    return { label: 'Inactive', color: 'bg-red-500' }
  }

  const status = getActivityStatus()

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Activity className="h-5 w-5" />
          Activity Insights
          <Badge variant="outline" className="ml-auto">
            <div className={`w-2 h-2 rounded-full ${status.color} mr-1`} />
            {status.label}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Clock className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Today</p>
              <p className="font-semibold">{insights.dailyActiveMinutes}m</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Target className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Session</p>
              <p className="font-semibold">{insights.sessionActiveMinutes}m</p>
            </div>
          </div>
        </div>

        {insights.inactivityStreak > 0 && (
          <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
            <TrendingUp className="h-4 w-4 text-orange-600" />
            <div>
              <p className="text-sm font-medium text-orange-800">
                Inactivity Streak: {insights.inactivityStreak}
              </p>
              <p className="text-xs text-orange-600">
                Smart reminders are helping you stay engaged
              </p>
            </div>
          </div>
        )}

        <div className="text-xs text-gray-500 pt-2 border-t">
          Activity tracking helps optimize your notification timing for better engagement
        </div>
      </CardContent>
    </Card>
  )
}