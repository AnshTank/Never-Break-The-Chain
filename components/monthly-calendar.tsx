"use client";

import { useEffect, useMemo, useCallback } from "react";
import { getDaysInMonth, getFirstDayOfMonth } from "@/lib/date-utils";
import { useProgressRange } from "@/hooks/use-data";
import type { DayEntry } from "@/lib/types";
import DayCell from "./day-cell";
import { mnzdEvents } from "@/lib/mnzd-events";

interface MonthlyCalendarProps {
  month: Date;
}

export default function MonthlyCalendar({ month }: MonthlyCalendarProps) {
  // Memoize date calculations to prevent recalculation on every render
  const { year, monthNum, startDate, endDate } = useMemo(() => {
    const year = month.getFullYear()
    const monthNum = month.getMonth()
    const startDate = `${year}-${String(monthNum + 1).padStart(2, '0')}-01`
    const lastDay = new Date(year, monthNum + 1, 0).getDate()
    const endDate = `${year}-${String(monthNum + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`
    return { year, monthNum, startDate, endDate }
  }, [month])
  
  const { progressData, loading, refetch } = useProgressRange(startDate, endDate);
  
  // Memoize progress map to avoid recalculation
  const progressMap = useMemo(() => {
    return progressData.reduce((acc, entry) => {
      acc[entry.date] = entry;
      return acc;
    }, {} as Record<string, DayEntry>);
  }, [progressData])
  
  // Memoize calendar structure
  const { daysInMonth, firstDay, days, emptyDays, weekDayLabels } = useMemo(() => {
    const daysInMonth = getDaysInMonth(month);
    const firstDay = getFirstDayOfMonth(month);
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const emptyDays = Array.from({ length: firstDay }, () => null);
    const weekDayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return { daysInMonth, firstDay, days, emptyDays, weekDayLabels }
  }, [month])
  
  // Optimize event handlers with useCallback
  const handleProgressUpdate = useCallback(() => {
    refetch();
  }, [refetch]);
  
  const handleEntryChange = useCallback(async (date: Date, newEntry: DayEntry) => {
    // Update local progress map immediately
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
    progressMap[dateStr] = newEntry
    
    // Force re-render by refreshing data
    await refetch()
  }, [progressMap, refetch]);
  
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

  if (loading) {
    return (
      <div className="bg-card rounded-lg border border-border p-3 sm:p-6">
        <div className="animate-pulse">
          <div className="grid grid-cols-7 gap-1 mb-2">
            {weekDayLabels.map((day) => (
              <div key={day} className="h-6 bg-gray-200 dark:bg-gray-700 rounded" />
            ))}
          </div>
          <div className="grid grid-cols-7 gap-3">
            {Array.from({ length: 35 }).map((_, i) => (
              <div key={i} className="h-12 sm:h-16 bg-gray-200 dark:bg-gray-700 rounded" />
            ))}
          </div>
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
