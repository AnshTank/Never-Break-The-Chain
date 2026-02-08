"use client";

import { useEffect, useCallback } from "react";
import { getDaysInMonth, getFirstDayOfMonth } from "@/lib/date-utils";
import { useSharedData } from "@/lib/data-provider";
import type { DayEntry } from "@/lib/types";
import DayCell from "./day-cell";
import { mnzdEvents } from "@/lib/mnzd-events";

interface MonthlyCalendarProps {
  month: Date;
}

export default function MonthlyCalendar({ month }: MonthlyCalendarProps) {
  // Use shared data instead of individual API calls
  const { currentMonthData, yearData, loading, refreshData } = useSharedData();
  
  // Get data for the selected month
  const getMonthData = () => {
    const year = month.getFullYear()
    const monthNum = month.getMonth() + 1
    const result: Record<string, DayEntry> = {}
    
    // Check if it's current month, use currentMonthData, otherwise use yearData
    const today = new Date()
    const isCurrentMonth = year === today.getFullYear() && monthNum === today.getMonth() + 1
    const sourceData = isCurrentMonth ? currentMonthData : yearData
    
    Object.entries(sourceData).forEach(([dateStr, entry]) => {
      const entryDate = new Date(dateStr)
      if (entryDate.getFullYear() === year && entryDate.getMonth() + 1 === monthNum) {
        result[dateStr] = entry
      }
    })
    
    return result
  }
  
  const progressMap = getMonthData()
  
  // Calculate calendar structure directly
  const daysInMonth = getDaysInMonth(month);
  const firstDay = getFirstDayOfMonth(month);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptyDays = Array.from({ length: firstDay }, () => null);
  const weekDayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  
  // Optimize event handlers with useCallback
  const handleProgressUpdate = useCallback(() => {
    // Refresh shared data
    refreshData();
  }, [refreshData]);
  
  const handleEntryChange = useCallback(async (date: Date, newEntry: DayEntry) => {
    // Do nothing - the progressUpdated event will handle the refresh
    // This prevents flicker from unnecessary API calls
  }, []);
  
  // Listen for progress updates with optimized dependencies
  useEffect(() => {
    // Listen for both custom events and MNZD events
    window.addEventListener('progressUpdated', handleProgressUpdate);
    
    const unsubscribe = mnzdEvents.onProgressUpdate(handleProgressUpdate);
    
    return () => {
      window.removeEventListener('progressUpdated', handleProgressUpdate);
      unsubscribe();
    };
  }, [handleProgressUpdate]);

  if (loading || Object.keys(progressMap).length === 0) {
    return (
      <div className="bg-card rounded-lg border border-border p-3 sm:p-6">
        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekDayLabels.map((day) => (
            <div key={day} className="text-center text-xs font-semibold text-muted-foreground py-1 sm:py-2">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-3">
          {Array.from({ length: 35 }).map((_, i) => (
            <div key={i} className="h-12 sm:h-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg border border-border p-3 sm:p-6">
      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDayLabels.map((day) => (
          <div
            key={day}
            className="text-center text-xs font-semibold text-muted-foreground py-1 sm:py-2"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-3">
        {emptyDays.map((_, i) => (
          <div key={`empty-${i}`} />
        ))}
        {days.map((day) => {
          const date = new Date(month.getFullYear(), month.getMonth(), day);
          const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
          const entry = progressMap[dateStr];
          const today = new Date();
          const isToday =
            date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear();

          return (
            <DayCell
              key={day}
              day={day}
              date={date}
              entry={entry}
              isToday={isToday}
              onEntryChange={handleEntryChange}
            />
          );
        })}
      </div>
    </div>
  );
}
