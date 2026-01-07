"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { useUserSettings, useGlobalDailyProgress } from "@/hooks/use-data";
import type { DayEntry, MNZDTask } from "@/lib/types";

interface DayEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (entry: DayEntry) => void;
  date: Date;
  initialEntry: DayEntry | undefined;
}

const createEmptyEntry = (date: Date, settings?: any): DayEntry => {
  const defaultTasks = [
    { id: "code", name: "Code", completed: false, minutes: 0 },
    { id: "think", name: "Think", completed: false, minutes: 0 },
    { id: "express", name: "Express", completed: false, minutes: 0 },
    { id: "move", name: "Move", completed: false, minutes: 0 },
  ];
  
  const tasks = settings?.mnzdConfigs ? settings.mnzdConfigs.map((config: any) => ({
    id: config.id,
    name: config.name,
    completed: false,
    minutes: 0
  })) : defaultTasks;
  
  return {
    date: date.toISOString().split("T")[0],
    tasks: tasks as MNZDTask[],
    totalHours: 0,
    note: "",
    completed: false,
  };
};

const migrateEntry = (entry: any, settings?: any): DayEntry => {
  if (!entry || !entry.tasks) return entry;
  
  const migratedTasks = entry.tasks.map((task: any, index: number) => {
    const config = settings?.mnzdConfigs?.find((c: any) => c.id === task.id);
    
    if (config) {
      return {
        id: config.id,
        name: config.name,
        completed: task.completed || false,
        minutes: task.minutes || 0
      };
    }
    
    // Fallback to default mapping
    const taskMapping = [
      { id: "code", name: "Code" },
      { id: "think", name: "Think" },
      { id: "express", name: "Express" },
      { id: "move", name: "Move" }
    ];
    
    const newTask = taskMapping[index] || taskMapping[0];
    
    return {
      id: newTask.id,
      name: newTask.name,
      completed: task.completed || false,
      minutes: task.minutes || 0
    };
  });
  
  return {
    date: entry.date,
    tasks: migratedTasks,
    totalHours: entry.totalHours || 0,
    note: entry.note || "",
    completed: entry.completed || false,
  };
};

export default function DayEditModal({
  isOpen,
  onClose,
  onSave,
  date,
  initialEntry,
}: DayEditModalProps) {
  const { settings } = useUserSettings();
  const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  // console.log('Day edit modal - Date received:', date, 'DateStr:', dateStr);
  const { loadProgressForDate, updateProgressForDate, getTodayProgress } = useGlobalDailyProgress();
  
  const [entry, setEntry] = useState<DayEntry | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (settings && isOpen) {
      const today = new Date().toISOString().split('T')[0]
      
      if (dateStr === today) {
        // Use today's cached data
        const todayData = getTodayProgress()
        if (todayData) {
          const freshEntry = migrateEntry(todayData, settings)
          setEntry(freshEntry)
          setIsLoading(false)
        }
      } else {
        // Load data for other dates
        setIsLoading(true)
        loadProgressForDate(dateStr).then(progress => {
          if (progress) {
            const freshEntry = migrateEntry(progress, settings)
            setEntry(freshEntry)
          } else {
            const emptyEntry = createEmptyEntry(date, settings)
            setEntry(emptyEntry)
          }
          setIsLoading(false)
        })
      }
    }
  }, [settings, dateStr, isOpen]);

  if (!settings) {
    return null;
  }

  if (!entry || isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Loading...</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center p-8">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span>Loading day data...</span>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  const handleTaskToggle = (taskId: string) => {
    setEntry((prev) => {
      if (!prev.tasks) return prev;
      const task = prev.tasks.find(t => t.id === taskId);
      if (!task) return prev;
      
      const config = settings.mnzdConfigs.find(c => c.id === taskId) || {
        id: taskId,
        minMinutes: 10
      };
      
      if (task.completed) {
        // Allow unchecking
        const updatedTasks = prev.tasks.map((t) =>
          t.id === taskId ? { ...t, completed: false, minutes: 0 } : t
        );
        const mnzdHours = updatedTasks.reduce((sum, t) => sum + (t.minutes || 0) / 60, 0);
        return {
          ...prev,
          tasks: updatedTasks,
          completed: updatedTasks.every((t) => t.completed),
          totalHours: Math.max(mnzdHours, prev.totalHours || 0)
        };
      } else {
        // Check if minimum minutes met
        if ((task.minutes || 0) < config.minMinutes) {
          alert(`Please enter at least ${config.minMinutes} minutes for this task before marking it complete.`);
          return prev;
        }
        
        const updatedTasks = prev.tasks.map((t) =>
          t.id === taskId ? { ...t, completed: true } : t
        );
        const mnzdHours = updatedTasks.reduce((sum, t) => sum + (t.minutes || 0) / 60, 0);
        return {
          ...prev,
          tasks: updatedTasks,
          completed: updatedTasks.every((t) => t.completed),
          totalHours: Math.max(mnzdHours, prev.totalHours || 0)
        };
      }
    });
  };

  const handleTaskMinutes = (taskId: string, minutes: number) => {
    setEntry((prev) => {
      if (!prev.tasks) return prev;
      const config = settings.mnzdConfigs.find(c => c.id === taskId) || { minMinutes: 10 };
      const updatedTasks = prev.tasks.map((t) => {
        if (t.id === taskId) {
          return {
            ...t,
            minutes,
            completed: minutes >= config.minMinutes
          };
        }
        return t;
      });
      const mnzdHours = Math.round(updatedTasks.reduce(
        (sum, t) => sum + (t.minutes || 0) / 60,
        0
      ) * 10) / 10;
      return {
        ...prev,
        tasks: updatedTasks,
        totalHours: mnzdHours,
        completed: updatedTasks.every((t) => t.completed)
      };
    });
  };

  const handleHoursChange = (hours: number) => {
    const mnzdHours = getMNZDHours();
    const roundedHours = Math.round(hours * 10) / 10;
    setEntry((prev) => ({
      ...prev,
      totalHours: isNaN(roundedHours) ? mnzdHours : Math.max(roundedHours, mnzdHours),
    }));
  };

  const getMNZDHours = () => {
    if (!entry.tasks) return 0;
    return entry.tasks.reduce((sum, t) => sum + (t.minutes || 0) / 60, 0);
  };

  const handleSave = async () => {
    if (!entry?.tasks || entry.tasks.length === 0) {
      return;
    }
    
    setIsSaving(true);
    
    try {
      // Calculate completion based on minutes vs minimum requirements
      const updatedTasks = entry.tasks.map(task => {
        const config = settings.mnzdConfigs.find(c => c.id === task.id) || { minMinutes: 10 };
        return {
          ...task,
          completed: task.minutes >= config.minMinutes
        };
      });
      
      const allCompleted = updatedTasks.every((t) => t.completed);
      const mnzdHours = updatedTasks.reduce((sum, t) => sum + (t.minutes || 0) / 60, 0);
      const finalTotalHours = Math.max(entry.totalHours || 0, mnzdHours);
      
      const finalEntry = {
        ...entry,
        tasks: updatedTasks,
        completed: allCompleted,
        totalHours: Math.round(finalTotalHours * 10) / 10,
      };
      
      // console.log('Day edit modal save debug:', {
        modalDate: date,
        dateStr: dateStr,
        finalEntry: finalEntry,
        isToday: dateStr === new Date().toISOString().split('T')[0]
      });
      
      // Save to database
      await updateProgressForDate(dateStr, finalEntry);
      
      // Trigger parent refresh with optimistic update
      onSave(finalEntry);
      
      // Force calendar refresh
      window.dispatchEvent(new CustomEvent('progressUpdated'));
      
      // Close modal
      onClose();
    } catch (error) {
      // console.error('Error saving progress:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const allCompleted =
    entry.tasks && entry.tasks.length > 0
      ? entry.tasks.every((t) => t.completed)
      : false;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto" onOpenAutoFocus={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {date.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Complete all 4 tasks for MNZD
          </p>
        </DialogHeader>

        <div className="space-y-6">
          {/* Total Hours Input */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold">
              Total Hours Invested Today
            </label>
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
              <div className="text-xs text-blue-700 dark:text-blue-300 mb-2">
                MNZD tasks: {getMNZDHours().toFixed(1)}h | Additional: {Math.max(0, (entry.totalHours || 0) - getMNZDHours()).toFixed(1)}h
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min="0"
                  max="16"
                  step="0.1"
                  value={Math.round((entry.totalHours || 0) * 10) / 10}
                  onChange={(e) => handleHoursChange(parseFloat(e.target.value) || 0)}
                  className="w-24 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                />
                <span className="text-sm text-muted-foreground">hours total</span>
                <input
                  type="range"
                  min="0"
                  max="16"
                  step="0.1"
                  value={entry.totalHours || 0}
                  onChange={(e) => handleHoursChange(parseFloat(e.target.value) || 0)}
                  className="flex-1"
                />
              </div>
            </div>
          </div>

          {/* Tasks */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">
              MNZD Tasks Detail
            </h3>
            {entry.tasks &&
              entry.tasks.map((task, index) => {
                const config = settings.mnzdConfigs.find(c => c.id === task.id) || {
                  id: task.id,
                  name: task.name,
                  minMinutes: 10
                };
                
                return (
                <div key={task.id || index} className={`border rounded-lg p-4 space-y-3 transition-all duration-500 ${
                  task.completed 
                    ? "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800" 
                    : "bg-muted border-border"
                }`}>
                  <div className="flex items-start gap-3">
                    <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-500 ${
                      task.completed
                        ? "bg-green-500 text-white scale-110"
                        : "bg-gray-200 text-gray-500"
                    }`}>
                      {task.completed ? "✓" : "○"}
                    </div>
                    <div className="flex-grow">
                      <div className="flex items-center justify-between">
                        <div className="font-semibold">
                          {config.name}
                        </div>
                        <div className="flex items-center gap-2">
                          {task.completed && task.minutes > 0 && (
                            <span className="text-xs px-2 py-1 rounded-full bg-green-200 text-green-700">
                              {task.minutes}min
                            </span>
                          )}
                          <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                            min {config.minMinutes}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-border pt-3 space-y-3">
                    <div>
                      <label className="text-sm text-muted-foreground block mb-2">
                        Minutes spent ({task.minutes || 0} min)
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="120"
                        value={task.minutes || 0}
                        onChange={(e) => handleTaskMinutes(task.id, Number.parseInt(e.target.value))}
                        className="w-full"
                      />
                      <div className="flex items-center justify-between mt-2">
                        <div className="text-xs text-muted-foreground">
                          {((task.minutes || 0) / 60).toFixed(1)} hours
                        </div>
                        <div className={`text-xs font-medium ${
                          (task.minutes || 0) >= config.minMinutes 
                            ? "text-green-600" 
                            : "text-red-600"
                        }`}>
                          {(task.minutes || 0) >= config.minMinutes 
                            ? "✓ Minimum met" 
                            : `Need ${config.minMinutes - (task.minutes || 0)} more min`
                          }
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )})}
          </div>

          {/* Notes */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold">
              What did you do? (optional)
            </label>
            <div className="space-y-2">
              <textarea
                value={entry.note || ""}
                onChange={(e) => {
                  const value = e.target.value
                  if (value.length <= 300) {
                    setEntry((prev) => ({ ...prev, note: value }))
                  }
                }}
                placeholder="Write a brief summary of your day in 2 paragraphs (max 300 characters)..."
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none h-20"
              />
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground">
                  Keep it concise - summarize your day in 2 short paragraphs
                </span>
                <span className={`font-medium ${
                  (entry.note || "").length > 250 ? "text-orange-600" : "text-muted-foreground"
                }`}>
                  {(entry.note || "").length}/300
                </span>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="border-t border-border pt-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Total time:
              </span>
              <span className="text-lg font-semibold">
                {(entry.totalHours || 0).toFixed(1)} hours
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
              <span className="text-sm font-semibold">
                MNZD Status:
              </span>
              <span
                className={`text-lg font-semibold ${
                  allCompleted
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-muted-foreground"
                }`}
              >
                {allCompleted
                  ? "✅ COMPLETE"
                  : `${
                      entry.tasks
                        ? entry.tasks.filter((t) => t.completed).length
                        : 0
                    }/4`}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="border-t border-border pt-4 flex gap-3">
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1"
            >
              Close
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className={`flex-1 ${
                allCompleted
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : ""
              }`}
            >
              {isSaving ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Saving...
                </div>
              ) : (
                "Save Day"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
