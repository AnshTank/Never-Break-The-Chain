"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/header";
import MonthlyCalendar from "@/components/monthly-calendar";
import DailyCheckIn from "@/components/daily-check-in";
import ProgressSummary from "@/components/progress-summary";
import ProgressView from "@/components/progress-view";
import CoolLoading from "@/components/cool-loading";
import MNZDInfoSection from "@/components/mnzd-info-section";
import NotificationSettings from "@/components/NotificationSettings";
import NotificationTester from "@/components/notification-tester";
import { GlobalStateProvider } from "@/lib/global-state";
import { useNotifications } from "@/lib/notifications/use-notifications";

export default function Home() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"calendar" | "progress">(
    "calendar"
  );
  const [loadedData, setLoadedData] = useState<any>({});
  const { scheduleSmartNotifications, isEnabled, sendWelcomeNotification } = useNotifications();

  // Memoize current month to prevent unnecessary re-renders
  const today = useMemo(() => new Date(), []);
  const [currentMonth, setCurrentMonth] = useState(
    () => new Date(today.getFullYear(), today.getMonth(), 1)
  );

  // Memoized navigation handlers
  const handlePreviousMonth = useCallback(() => {
    setCurrentMonth(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1)
    );
  }, []);

  const handleNextMonth = useCallback(() => {
    setCurrentMonth(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1)
    );
  }, []);

  const handleToday = useCallback(() => {
    const now = new Date();
    setCurrentMonth(new Date(now.getFullYear(), now.getMonth(), 1));
  }, []);

  const handleLoadingComplete = useCallback((data: any) => {
    console.log("Homepage received data:", data);
    setLoadedData(data);
    setIsLoading(false);
    
    // Initialize smart notifications with user progress
    if (isEnabled && data) {
      const userProgress = {
        completed: data.todayProgress?.completed || 0,
        streak: data.currentStreak || 0,
        timeOfDay: (new Date().getHours() < 12 ? "morning" : "evening") as "morning" | "evening",
        patterns: {
          usualCompletionTime: "12:00",
          strongestPillar: "Move",
          weakestPillar: "Document",
          weekdayPerformance: 75,
          weekendPerformance: 60
        }
      };
      scheduleSmartNotifications(userProgress);
      
      // Send welcome notification for new users (streak = 0 or 1)
      if (data.currentStreak <= 1) {
        setTimeout(() => {
          sendWelcomeNotification();
        }, 2000); // Delay to ensure dashboard is loaded
      }
    }
  }, [isEnabled, scheduleSmartNotifications, sendWelcomeNotification]);

  // Early return for loading states - no duplicate API calls
  if (isLoading) {
    return (
      <div data-loading="true">
        <CoolLoading
          message="Loading your journey dashboard..."
          onLoadingComplete={handleLoadingComplete}
        />
      </div>
    );
  }

  return (
    <GlobalStateProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-blue-950/30">
        <main className="mx-auto max-w-6xl px-2 sm:px-4 py-2 sm:py-4 md:py-6">
          <Header />

          {/* MNZD Info Section */}
          <MNZDInfoSection />

          <div className="space-y-4 sm:space-y-6">
            {/* Enhanced Tab Navigation */}
            <div className="relative">
              <div className="flex gap-2 sm:gap-8 border-b border-slate-200 dark:border-slate-700 overflow-x-auto">
                <button
                  onClick={() => setActiveTab("calendar")}
                  className={`relative pb-4 px-1 text-sm font-medium transition-all duration-300 whitespace-nowrap group ${
                    activeTab === "calendar"
                      ? "text-slate-900 dark:text-slate-100"
                      : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
                  }`}
                >
                  Calendar View
                  {activeTab === "calendar" && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full" />
                  )}
                </button>
                <button
                  onClick={() => setActiveTab("progress")}
                  className={`relative pb-4 px-1 text-sm font-medium transition-all duration-300 whitespace-nowrap hidden sm:block group ${
                    activeTab === "progress"
                      ? "text-slate-900 dark:text-slate-100"
                      : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
                  }`}
                >
                  Progress Analytics
                  {activeTab === "progress" && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full" />
                  )}
                </button>
                <Link
                  href="/timer"
                  className="relative pb-4 px-1 text-sm font-medium transition-all duration-300 whitespace-nowrap text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 group flex items-center gap-1"
                >
                  Focus Timer
                  <svg
                    className="w-4 h-4 opacity-60"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </Link>
              </div>
            </div>

            {activeTab === "calendar" && (
              <div className="space-y-4 animate-in fade-in-50 duration-700">
                {/* Mobile Progress Notice */}
                <div className="sm:hidden bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 border border-blue-200 dark:border-blue-800 rounded-xl p-4 backdrop-blur-sm">
                  <div className="flex items-start gap-3">
                    <div className="text-blue-600 dark:text-blue-400 mt-0.5">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 00-2-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-blue-900 dark:text-blue-100 font-medium">
                        Advanced Analytics Available
                      </p>
                      <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                        Switch to desktop for detailed progress insights and
                        data visualization
                      </p>
                    </div>
                  </div>
                </div>

                {/* Daily Check-in */}
                <DailyCheckIn preloadedData={loadedData} />

                {/* Notification Tester - Development Only */}
                <NotificationTester />

                {/* Current Month Calendar */}
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-slate-100 dark:to-slate-400 bg-clip-text text-transparent">
                      {currentMonth.toLocaleDateString("en-US", {
                        month: "long",
                        year: "numeric",
                      })}
                    </h2>
                    <div className="flex gap-2">
                      <button
                        onClick={handlePreviousMonth}
                        className="group relative overflow-hidden rounded-lg bg-white dark:bg-slate-800 px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md transition-all duration-300 hover:-translate-y-0.5"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-700 dark:to-slate-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <span className="relative">← Previous</span>
                      </button>
                      <button
                        onClick={handleToday}
                        className="group relative overflow-hidden rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:from-blue-600 hover:to-indigo-600"
                      >
                        <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
                        <span className="relative">Today</span>
                      </button>
                      <button
                        onClick={handleNextMonth}
                        className="group relative overflow-hidden rounded-lg bg-white dark:bg-slate-800 px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md transition-all duration-300 hover:-translate-y-0.5"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-700 dark:to-slate-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <span className="relative">Next →</span>
                      </button>
                    </div>
                  </div>
                  <MonthlyCalendar month={currentMonth} />
                </div>

                {/* Progress Summary */}
                <ProgressSummary currentMonth={currentMonth} />
              </div>
            )}

            {activeTab === "progress" && (
              <div className="animate-in fade-in-50 duration-700">
                <ProgressView />
              </div>
            )}
          </div>
        </main>
      </div>
    </GlobalStateProvider>
  );
}
