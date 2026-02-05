"use client";

import { useState, useEffect } from "react";
import type { JourneyData, DayEntry } from "@/lib/types";
import CompactMonthView from "./compact-month-view";
import YearHeatmap from "./year-heatmap";
import JourneyGraph from "./journey-graph";
import { useSharedData } from "@/lib/data-provider";

interface ProgressViewProps {
  onDayEntry?: (date: Date, entry: DayEntry) => void;
}

export default function ProgressView({
  onDayEntry = () => {},
}: ProgressViewProps) {
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [viewMode, setViewMode] = useState<"calendar" | "year" | "journey">(
    "calendar",
  );
  const [today, setToday] = useState(new Date());

  // Use shared data instead of individual fetching
  const { currentMonthData, yearData, loading, refreshData } = useSharedData();
  
  // Get data for selected month from year data
  const getMonthData = () => {
    const year = selectedMonth.getFullYear()
    const month = selectedMonth.getMonth() + 1
    const result: JourneyData = {}
    
    Object.entries(yearData).forEach(([dateStr, entry]) => {
      const entryDate = new Date(dateStr)
      if (entryDate.getFullYear() === year && entryDate.getMonth() + 1 === month) {
        result[dateStr] = entry
      }
    })
    
    return result
  }
  
  const monthlyData = getMonthData()

  // Listen for progress updates and refresh shared data
  useEffect(() => {
    const handleProgressUpdate = () => {
      refreshData()
    };

    window.addEventListener("progressUpdated", handleProgressUpdate);
    return () =>
      window.removeEventListener("progressUpdated", handleProgressUpdate);
  }, [refreshData]);

  const isCurrentMonth = (month: Date) => {
    return (
      month.getFullYear() === today.getFullYear() &&
      month.getMonth() === today.getMonth()
    );
  };

  const isFutureMonth = (month: Date) => {
    return (
      month > today ||
      (month.getFullYear() === today.getFullYear() &&
        month.getMonth() > today.getMonth())
    );
  };

  const getMonthStatus = (month: Date) => {
    if (isCurrentMonth(month)) return "current";
    if (isFutureMonth(month)) return "future";
    return "past";
  };

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  // Calculate month stats directly without useMemo
  const getMonthStats = () => {
    if (loading || !monthlyData) {
      return {
        completedDays: 0,
        partialDays: 0,
        missedDays: 0,
        totalHours: 0,
      };
    }

    const year = selectedMonth.getFullYear();
    const month = selectedMonth.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const todayDate = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
    );
    const isCurrentMonthView =
      selectedMonth.getMonth() === today.getMonth() &&
      selectedMonth.getFullYear() === today.getFullYear();

    let completedDays = 0;
    let totalHours = 0;
    let partialDays = 0;
    let missedDays = 0;

    const minRequirements = {
      meditation: 30,
      nutrition: 20,
      zone: 45,
      discipline: 15,
    };

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      const currentDate = new Date(year, month, day);

      if (isCurrentMonthView && currentDate > todayDate) {
        continue;
      }

      const entry = monthlyData[dateStr];

      if (
        entry &&
        entry.tasks &&
        Array.isArray(entry.tasks) &&
        entry.tasks.length > 0
      ) {
        totalHours += entry.totalHours || 0;

        const completedTasks = entry.tasks.filter((task) => {
          const minRequired =
            minRequirements[task.id as keyof typeof minRequirements] || 0;
          return (task.minutes || 0) >= minRequired;
        }).length;

        const hasAnyProgress = entry.tasks.some(
          (task) => (task.minutes || 0) > 0,
        );

        if (completedTasks === 4) {
          completedDays++;
        } else if (hasAnyProgress) {
          partialDays++;
        } else {
          missedDays++;
        }
      } else {
        missedDays++;
      }
    }

    return {
      completedDays,
      partialDays,
      missedDays,
      totalHours,
    };
  };

  const monthStats = getMonthStats();

  return (
    <div className="space-y-6">
      {/* View Mode Tabs */}
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        <button
          onClick={() => setViewMode("calendar")}
          className={`flex-shrink-0 px-6 py-3 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap ${
            viewMode === "calendar"
              ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg"
              : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-600"
          }`}
        >
          Calendar View
        </button>
        <button
          onClick={() => setViewMode("year")}
          className={`flex-shrink-0 px-6 py-3 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap ${
            viewMode === "year"
              ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg"
              : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-600"
          }`}
        >
          Year Heatmap
        </button>
        <button
          onClick={() => setViewMode("journey")}
          className={`flex-shrink-0 px-6 py-3 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap ${
            viewMode === "journey"
              ? "bg-gradient-to-r from-teal-400 to-teal-400 text-purple-700 shadow-lg"
              : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-600"
          }`}
        >
          Analytics
        </button>
      </div>

      <div className="transition-all duration-500 ease-in-out">
        <div className={`${viewMode === "calendar" ? "block" : "hidden"}`}>
          <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Monthly Progress
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setSelectedMonth(
                      new Date(
                        selectedMonth.getFullYear(),
                        selectedMonth.getMonth() - 1,
                      ),
                    );
                  }}
                  className="group relative overflow-hidden rounded-xl bg-white dark:bg-slate-800 px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
                >
                  ← Previous
                </button>
                <button
                  onClick={() => {
                    setSelectedMonth(new Date());
                  }}
                  className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:from-blue-600 hover:to-indigo-600"
                >
                  Current Month
                </button>
                <button
                  onClick={() => {
                    setSelectedMonth(
                      new Date(
                        selectedMonth.getFullYear(),
                        selectedMonth.getMonth() + 1,
                      ),
                    );
                  }}
                  className="group relative overflow-hidden rounded-xl bg-white dark:bg-slate-800 px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
                >
                  Next →
                </button>
              </div>
            </div>

            <CompactMonthView
              month={selectedMonth || new Date()}
              journeyData={monthlyData || {}}
              onDayEntry={onDayEntry}
            />

            <div className="mt-6">
              <div className="mb-6 text-center">
                <h3 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">
                  {selectedMonth
                    ? monthNames[selectedMonth.getMonth()]
                    : "Loading"}{" "}
                  {selectedMonth ? selectedMonth.getFullYear() : ""}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {selectedMonth &&
                    getMonthStatus(selectedMonth) === "current" &&
                    "Current Month - MNZD Active"}
                  {selectedMonth &&
                    getMonthStatus(selectedMonth) === "future" &&
                    "Future Month - Track Progress"}
                  {selectedMonth &&
                    getMonthStatus(selectedMonth) === "past" &&
                    "Past Month"}
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 transition-all duration-500 min-h-[120px]">
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-4 border border-green-200 dark:border-green-800">
                  <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                    {loading ? "..." : monthStats.completedDays}
                  </div>
                  <div className="text-sm text-green-700 dark:text-green-300">
                    Complete Days
                  </div>
                </div>
                <div className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-xl p-4 border border-yellow-200 dark:border-yellow-800">
                  <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                    {loading ? "..." : monthStats.partialDays}
                  </div>
                  <div className="text-sm text-yellow-700 dark:text-yellow-300">
                    Partial Days
                  </div>
                </div>
                <div className="bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 rounded-xl p-4 border border-red-200 dark:border-red-800">
                  <div className="text-3xl font-bold text-red-600 dark:text-red-400">
                    {loading ? "..." : monthStats.missedDays}
                  </div>
                  <div className="text-sm text-red-700 dark:text-red-300">
                    Missed Days
                  </div>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                    {loading ? "..." : monthStats.totalHours.toFixed(1)}
                  </div>
                  <div className="text-sm text-blue-700 dark:text-blue-300">
                    Total Hours
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-4">
                  Quick Jump
                </h3>
                <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                  {selectedMonth &&
                    Array.from({ length: 12 }, (_, i) => {
                      const monthDate = new Date(
                        selectedMonth.getFullYear(),
                        i,
                        1,
                      );
                      const isSelected = selectedMonth.getMonth() === i;
                      const status = getMonthStatus(monthDate);
                      return (
                        <button
                          key={i}
                          onClick={() => {
                            setSelectedMonth(monthDate);
                          }}
                          className={`p-3 rounded-lg text-sm font-medium transition-all ${
                            isSelected
                              ? "bg-primary text-primary-foreground"
                              : status === "current"
                                ? "bg-blue-100 text-blue-800 hover:bg-blue-200"
                                : status === "future"
                                  ? "bg-purple-100 text-purple-800 hover:bg-purple-200"
                                  : "bg-muted text-muted-foreground hover:bg-muted/80"
                          }`}
                        >
                          {monthNames[i].slice(0, 3)}
                        </button>
                      );
                    })}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={`${viewMode === "year" ? "block" : "hidden"}`}>
          <div className="space-y-6 animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-6">
              Year at a Glance
            </h2>
            <YearHeatmap journeyData={yearData} />
          </div>
        </div>

        <div className={`${viewMode === "journey" ? "block" : "hidden"}`}>
          <div className="space-y-6 animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-6">
              Your Journey
            </h2>
            <JourneyGraph journeyData={monthlyData} />
          </div>
        </div>
      </div>
    </div>
  );
}
