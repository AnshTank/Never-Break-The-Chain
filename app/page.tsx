"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Header from "@/components/header"
import MonthlyCalendar from "@/components/monthly-calendar"
import DailyCheckIn from "@/components/daily-check-in"
import ProgressSummary from "@/components/progress-summary"
import ProgressView from "@/components/progress-view"
import type { JourneyData, DayEntry } from "@/lib/types"

export default function Home() {
  const router = useRouter()
  const [journeyData, setJourneyData] = useState<JourneyData>({})
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"calendar" | "progress">("calendar")
  
  // Force current month to be December 2024 (today's month)
  const today = new Date()
  const [currentMonth, setCurrentMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1))

  // Check authentication and load data
  useEffect(() => {
    const isAuthenticated = localStorage.getItem("isAuthenticated")
    if (!isAuthenticated) {
      router.push("/login")
      return
    }
    
    const saved = localStorage.getItem("journeyData")
    if (saved) {
      setJourneyData(JSON.parse(saved))
    }
    setIsLoading(false)
  }, [router])

  // Save data to localStorage whenever it changes
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem("journeyData", JSON.stringify(journeyData))
    }
  }, [journeyData, isLoading])

  const handleDayEntry = (date: Date, entry: DayEntry) => {
    const key = date.toISOString().split("T")[0]
    setJourneyData((prev) => ({
      ...prev,
      [key]: entry,
    }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      <main className="mx-auto max-w-6xl px-2 sm:px-4 py-4 sm:py-8 md:py-12">
        {!isLoading && (
          <>
            <Header />

            <div className="mt-6 sm:mt-12 space-y-6 sm:space-y-12">
              {/* Tab Navigation */}
              <div className="flex gap-2 sm:gap-4 border-b border-border overflow-x-auto">
                <button
                  onClick={() => setActiveTab("calendar")}
                  className={`pb-2 px-2 sm:px-1 text-sm font-medium transition-colors whitespace-nowrap ${
                    activeTab === "calendar"
                      ? "text-primary border-b-2 border-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Calendar View
                </button>
                <button
                  onClick={() => setActiveTab("progress")}
                  className={`pb-2 px-2 sm:px-1 text-sm font-medium transition-colors whitespace-nowrap hidden sm:block ${
                    activeTab === "progress"
                      ? "text-primary border-b-2 border-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Progress View
                </button>
              </div>

              {activeTab === "calendar" && (
                <>
                  {/* Mobile Progress Notice */}
                  <div className="sm:hidden bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                    <div className="flex items-center gap-2">
                      <div className="text-blue-600">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm text-blue-800 font-medium">Want to view progress analytics?</p>
                        <p className="text-xs text-blue-600">Switch to desktop for detailed progress tracking</p>
                      </div>
                    </div>
                  </div>

                  {/* Daily Check-in */}
                  <DailyCheckIn onSubmit={handleDayEntry} currentData={journeyData} />

                  {/* Current Month Calendar */}
                  <div className="space-y-3 sm:space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                        {currentMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                      </h2>
                      <div className="flex gap-1 sm:gap-2">
                        <button
                          onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}
                          className="rounded-md bg-muted px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-medium text-muted-foreground hover:bg-muted/80 transition-colors"
                        >
                          ← Prev
                        </button>
                        <button
                          onClick={() => {
                            const now = new Date()
                            setCurrentMonth(new Date(now.getFullYear(), now.getMonth(), 1))
                          }}
                          className="rounded-md bg-primary/10 px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-medium text-primary hover:bg-primary/20 transition-colors"
                        >
                          Today
                        </button>
                        <button
                          onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
                          className="rounded-md bg-muted px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-medium text-muted-foreground hover:bg-muted/80 transition-colors"
                        >
                          Next →
                        </button>
                      </div>
                    </div>
                    <MonthlyCalendar month={currentMonth} journeyData={journeyData} onDayClick={handleDayEntry} />
                  </div>

                  {/* Progress Summary */}
                  <ProgressSummary journeyData={journeyData} />
                </>
              )}

              {activeTab === "progress" && (
                <ProgressView journeyData={journeyData} onDayEntry={handleDayEntry} />
              )}
            </div>
          </>
        )}
      </main>
    </div>
  )
}
