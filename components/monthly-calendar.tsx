"use client";

import { getDaysInMonth, getFirstDayOfMonth } from "@/lib/date-utils";
import type { JourneyData, DayEntry } from "@/lib/types";
import { generateDummyData } from "@/lib/dummy-data";
import DayCell from "./day-cell";

interface MonthlyCalendarProps {
  month: Date;
  journeyData: JourneyData;
  onDayClick: (date: Date, entry: DayEntry) => void;
}

export default function MonthlyCalendar({
  month,
  journeyData,
  onDayClick,
}: MonthlyCalendarProps) {
  const daysInMonth = getDaysInMonth(month);
  const firstDay = getFirstDayOfMonth(month);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptyDays = Array.from({ length: firstDay }, () => null);

  // Combine real data with dummy data
  const dummyData = generateDummyData(2024);
  const combinedData = { ...journeyData, ...dummyData };

  const weekDayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

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
          const dateStr = date.toISOString().split("T")[0];
          const entry = combinedData[dateStr];
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
              onEntryChange={(newEntry) => onDayClick(date, newEntry)}
            />
          );
        })}
      </div>
    </div>
  );
}
