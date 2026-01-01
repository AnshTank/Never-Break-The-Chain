"use client";

import { useState, useEffect } from "react";
import { Settings } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import type { DayEntry, JourneyData, MNZDTask } from "@/lib/types";
import FocusTimer from "./focus-timer";

interface DailyCheckInProps {
  onSubmit: (date: Date, entry: DayEntry) => void;
  currentData: JourneyData;
}

interface TaskConfig {
  id: string;
  name: string;
  description: string;
  minMinutes: number;
  completed: boolean;
}

const defaultTaskConfigs: TaskConfig[] = [
  {
    id: "code",
    name: "Code (Career)",
    description: "",
    minMinutes: 20,
    completed: false,
  },
  {
    id: "think",
    name: "Think (Problem-Solving)",
    description: "",
    minMinutes: 10,
    completed: false,
  },
  {
    id: "express",
    name: "Express (Communication)",
    description: "",
    minMinutes: 5,
    completed: false,
  },
  {
    id: "move",
    name: "Move (Body)",
    description: "",
    minMinutes: 10,
    completed: false,
  },
];

export default function DailyCheckIn({
  onSubmit,
  currentData,
}: DailyCheckInProps) {
  const [todayEntry, setTodayEntry] = useState<DayEntry | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [taskConfigs, setTaskConfigs] =
    useState<TaskConfig[]>(defaultTaskConfigs);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<string | null>(null);
  const [tempMinutes, setTempMinutes] = useState<{ [key: string]: number }>({});
  const [showTimer, setShowTimer] = useState(false);
  const [activeTimerTask, setActiveTimerTask] = useState<string | null>(null);

  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];

  useEffect(() => {
    // Load task configs from localStorage
    const savedConfigs = localStorage.getItem("mnzdTaskConfigs");
    if (savedConfigs) {
      setTaskConfigs(JSON.parse(savedConfigs));
    }
  }, []);

  useEffect(() => {
    const todayData = currentData[todayStr] || {
      date: todayStr,
      tasks: taskConfigs.map((config) => ({
        id: config.id,
        name: config.name,
        completed: false,
        minutes: 0,
      })),
      totalHours: 0,
      note: "",
      completed: false,
    };

    // Update task names to match current config and ensure minutes field exists
    if (todayData.tasks) {
      todayData.tasks = todayData.tasks.map((task) => {
        const config = taskConfigs.find((c) => c.id === task.id);
        return {
          ...task,
          name: config?.name || task.name,
          minutes: task.minutes || 0,
        };
      });
    }

    setTodayEntry(todayData);
    setIsLoading(false);
  }, [currentData, todayStr, taskConfigs]);

  const handleTaskClick = (taskId: string) => {
    const task = todayEntry?.tasks.find((t) => t.id === taskId);
    if (!task) return;

    if (task.completed) {
      // If already completed, allow unchecking
      const updatedTasks = todayEntry.tasks.map((t) =>
        t.id === taskId ? { ...t, completed: false, minutes: 0 } : t
      );
      const mnzdHours = updatedTasks.reduce(
        (sum, t) => sum + (t.minutes || 0) / 60,
        0
      );
      const currentTotal = todayEntry.totalHours || 0;
      const oldMnzdHours = todayEntry.tasks.reduce(
        (sum, t) => sum + (t.minutes || 0) / 60,
        0
      );
      const additionalHours = currentTotal - oldMnzdHours;
      const newEntry = {
        ...todayEntry,
        tasks: updatedTasks,
        completed: updatedTasks.every((t) => t.completed),
        totalHours: mnzdHours + Math.max(0, additionalHours),
      };
      setTodayEntry(newEntry);
      onSubmit(today, newEntry);
    } else {
      // If not completed, open minutes input
      setEditingTask(taskId);
      setTempMinutes({ ...tempMinutes, [taskId]: task.minutes || 0 });
    }
  };

  const handleTimerUpdate = (taskId: string, minutes: number) => {
    if (!todayEntry) return;
    
    const updatedTasks = todayEntry.tasks.map((t) =>
      t.id === taskId ? { ...t, minutes: Math.floor(minutes * 60) } : t
    );
    
    const mnzdHours = updatedTasks.reduce((sum, t) => sum + (t.minutes || 0) / 60, 0);
    const currentTotal = todayEntry.totalHours || 0;
    const oldMnzdHours = todayEntry.tasks.reduce((sum, t) => sum + (t.minutes || 0) / 60, 0);
    const additionalHours = currentTotal - oldMnzdHours;
    
    const newEntry = {
      ...todayEntry,
      tasks: updatedTasks,
      totalHours: mnzdHours + Math.max(0, additionalHours)
    };
    
    setTodayEntry(newEntry);
    onSubmit(today, newEntry);
  };

  const handleStartTimer = (taskId: string) => {
    setActiveTimerTask(taskId);
    setShowTimer(true);
  };

  const handleMinutesSubmit = (taskId: string) => {

    const config = taskConfigs.find((c) => c.id === taskId);
    const minutes = tempMinutes[taskId] || 0;

    if (!config || minutes < config.minMinutes) {
      alert(
        `Minimum ${config?.minMinutes || 0} minutes required for this task!`
      );
      return;
    }

    const updatedTasks = todayEntry.tasks.map((t) =>
      t.id === taskId ? { ...t, completed: true, minutes } : t
    );

    const mnzdHours = updatedTasks.reduce(
      (sum, t) => sum + (t.minutes || 0) / 60,
      0
    );
    const currentTotal = todayEntry.totalHours || 0;
    const oldMnzdHours = todayEntry.tasks.reduce(
      (sum, t) => sum + (t.minutes || 0) / 60,
      0
    );
    const additionalHours = currentTotal - oldMnzdHours;

    const newEntry = {
      ...todayEntry,
      tasks: updatedTasks,
      completed: updatedTasks.every((t) => t.completed),
      totalHours: mnzdHours + Math.max(0, additionalHours),
    };

    setTodayEntry(newEntry);
    onSubmit(today, newEntry);
    setEditingTask(null);
  };

  const handleConfigUpdate = (
    index: number,
    field: "name" | "description" | "minMinutes",
    value: string | number
  ) => {
    const updated = [...taskConfigs];
    updated[index] = { ...updated[index], [field]: value };
    setTaskConfigs(updated);
  };

  const saveTaskConfigs = () => {
    localStorage.setItem("mnzdTaskConfigs", JSON.stringify(taskConfigs));
    setSettingsOpen(false);
    // Refresh today's entry with new configs
    const updatedTasks = taskConfigs.map((config) => {
      const existingTask = todayEntry?.tasks.find((t) => t.id === config.id);
      return {
        id: config.id,
        name: config.name,
        completed: existingTask?.completed || false,
        minutes: existingTask?.minutes || 0,
      };
    });
    if (todayEntry) {
      const newEntry = { ...todayEntry, tasks: updatedTasks };
      setTodayEntry(newEntry);
      onSubmit(today, newEntry);
    }
  };

  if (isLoading || !todayEntry) {
    return (
      <div className="h-32 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
    );
  }

  const todayCompleted = todayEntry.tasks.filter((t) => t.completed).length;
  const todayAllCompleted = todayCompleted === 4;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                ✅ TODAY'S MNZD
              </span>
              <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <Settings className="w-3 h-3" />
                  </Button>
                </DialogTrigger>
              </Dialog>
            {settingsOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
                style={{
                  position: "fixed",
                  backgroundColor: "rgba(0, 0, 0, 0.6)",
                  backdropFilter: "blur(4px)",
                }}
              >
                <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl scrollbar-hide">
                  <style jsx>{`
                    .scrollbar-hide {
                      -ms-overflow-style: none;
                      scrollbar-width: none;
                    }
                    .scrollbar-hide::-webkit-scrollbar {
                      display: none;
                    }
                  `}</style>
                  <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-6 flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                        Customize Your MNZD System
                      </h2>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        MNZD = Code, Think, Express, Move - Your daily discipline system
                      </p>
                    </div>
                    <button
                      onClick={() => setSettingsOpen(false)}
                      className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl"
                    >
                      ×
                    </button>
                  </div>
                  <div className="p-6 space-y-6 bg-white dark:bg-gray-900">
                    {taskConfigs.map((config, index) => (
                      <div
                        key={config.id}
                        className="space-y-3 p-4 border rounded-lg"
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                            <span className="text-sm font-bold text-primary">
                              {config.id === "code"
                                ? "1️⃣"
                                : config.id === "think"
                                ? "2️⃣"
                                : config.id === "express"
                                ? "3️⃣"
                                : "4️⃣"}
                            </span>
                          </div>
                          <Label className="text-base font-semibold">
                            {config.name}
                          </Label>
                        </div>

                        <div className="space-y-3">
                          <div>
                            <Label className="text-sm text-muted-foreground">
                              Task Name
                            </Label>
                            <Input
                              value={config.name}
                              onChange={(e) =>
                                handleConfigUpdate(
                                  index,
                                  "name",
                                  e.target.value
                                )
                              }
                              placeholder="e.g., Programming, Writing, Design"
                              className="mt-1"
                            />
                          </div>

                          <div>
                            <Label className="text-sm text-muted-foreground">
                              What does this mean to you? (one line)
                            </Label>
                            <textarea
                              value={config.description}
                              onChange={(e) =>
                                handleConfigUpdate(
                                  index,
                                  "description",
                                  e.target.value
                                )
                              }
                              placeholder="Ex. Build React apps, Learn algorithms, Write technical blogs"
                              className="mt-1 w-full h-16 px-3 py-2 text-sm border border-input rounded-md resize-none"
                              maxLength={120}
                            />
                          </div>

                          <div>
                            <Label className="text-sm text-muted-foreground">
                              Minimum Minutes
                            </Label>
                            <Input
                              type="number"
                              value={config.minMinutes}
                              onChange={(e) =>
                                handleConfigUpdate(
                                  index,
                                  "minMinutes",
                                  parseInt(e.target.value) || 0
                                )
                              }
                              className="mt-1 w-24"
                              min="1"
                              max="480"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                    <Button onClick={saveTaskConfigs} className="w-full">
                      Save My MNZD System
                    </Button>
                  </div>
                </div>
              </div>
            )}
            </div>
            <div className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              {today.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </div>
          </div>
          <div className="text-right">
            <div
              className={`text-lg font-bold ${
                todayAllCompleted
                  ? "text-green-600"
                  : "text-gray-600 dark:text-gray-400"
              }`}
            >
              {todayCompleted}/4
            </div>
            <div className="text-sm text-blue-600 font-medium">
              {todayEntry.totalHours.toFixed(1)}h total
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {todayEntry.tasks.map((task) => {
            const config = taskConfigs.find((c) => c.id === task.id);
            const isEditing = editingTask === task.id;

            // Default descriptions
            const defaultDescriptions = {
              code: "Work on real code daily by building, fixing, or improving something small. Watching videos does not count.",
              think:
                "Spend time thinking through one problem or approach, even if you do not fully solve it.",
              express:
                "Write or speak one clear thought about what you worked on or learned.",
              move: "Do some form of physical movement to keep your body active and disciplined.",
            };

            const displayText =
              config?.description ||
              defaultDescriptions[
                task.id as keyof typeof defaultDescriptions
              ] ||
              task.name;

            return (
              <div
                key={task.id}
                className={`relative overflow-hidden rounded-xl border-2 transition-all duration-200 ${
                  task.completed
                    ? "bg-gradient-to-br from-green-50 to-green-100 border-green-300 shadow-md"
                    : isEditing
                    ? "bg-gradient-to-br from-blue-50 to-blue-100 border-blue-300 shadow-md"
                    : "bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 hover:shadow-sm"
                }`}
              >
                {isEditing ? (
                  <div className="p-4 sm:p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-2xl">⏱️</span>
                      <h3 className="font-semibold text-blue-800">
                        {config?.id === "code"
                          ? "Code"
                          : config?.id === "think"
                          ? "Think"
                          : config?.id === "express"
                          ? "Express"
                          : "Move"}
                      </h3>
                    </div>
                    <p className="text-sm text-blue-700 mb-4">
                      Enter minutes spent (minimum {config?.minMinutes || 0}{" "}
                      required)
                    </p>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        max="120"
                        value={tempMinutes[task.id] || 0}
                        onChange={(e) => {
                          const value = parseInt(e.target.value) || 0;
                          if (value > 120) {
                            alert(
                              "Maximum 120 minutes per task. For longer sessions, add additional hours in the day edit modal."
                            );
                            return;
                          }
                          setTempMinutes({ ...tempMinutes, [task.id]: value });
                        }}
                        className="w-20 px-2 py-1 border rounded text-center"
                        autoFocus
                      />
                      <span className="text-sm text-gray-600">min</span>
                      <button
                        onClick={() => handleStartTimer(task.id)}
                        className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 mr-2"
                      >
                        ⏱️ Timer
                      </button>
                      <button
                        onClick={() => handleMinutesSubmit(task.id)}
                        className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                      >
                        ✓
                      </button>
                      <button
                        onClick={() => setEditingTask(null)}
                        className="px-3 py-1 bg-gray-300 text-gray-700 rounded text-sm hover:bg-gray-400"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => handleTaskClick(task.id)}
                    className={`w-full p-4 sm:p-5 text-left focus:outline-none rounded-xl ${
                      task.completed
                        ? "focus:ring-2 focus:ring-green-500 focus:ring-inset"
                        : "focus:ring-2 focus:ring-blue-500 focus:ring-inset"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1">
                        <span className="text-2xl">
                          {task.completed ? "✅" : "⭕"}
                        </span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <h3
                            className={`font-semibold text-sm sm:text-base ${
                              task.completed
                                ? "text-green-800"
                                : "text-gray-900 dark:text-gray-100"
                            }`}
                          >
                            {config?.id === "code"
                              ? "Code"
                              : config?.id === "think"
                              ? "Think"
                              : config?.id === "express"
                              ? "Express"
                              : "Move"}
                          </h3>
                          <div className="flex items-center gap-2">
                            {task.completed && task.minutes > 0 && (
                              <span className="text-xs px-2 py-1 rounded-full bg-green-200 text-green-700">
                                {task.minutes}min
                              </span>
                            )}
                            {config && (
                              <span
                                className={`text-xs px-2 py-1 rounded-full ${
                                  task.completed
                                    ? "bg-green-200 text-green-700"
                                    : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                                }`}
                              >
                                min {config.minMinutes}
                              </span>
                            )}
                          </div>
                        </div>

                        <p
                          className={`text-xs sm:text-sm leading-relaxed ${
                            task.completed
                              ? "text-green-700"
                              : "text-gray-600 dark:text-gray-400"
                          }`}
                        >
                          {displayText}
                        </p>
                      </div>
                    </div>
                  </button>
                )}

                {task.completed && !isEditing && (
                  <div className="absolute top-2 right-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {todayAllCompleted && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 text-center">
            <div className="text-green-800 dark:text-green-200 font-semibold">
              🎉 Today's MNZD Complete!
            </div>
          </div>
        )}

        {showTimer && activeTimerTask && (
          <div className="mt-4">
            <FocusTimer
              taskName={taskConfigs.find(c => c.id === activeTimerTask)?.name || "Focus Session"}
              initialMinutes={taskConfigs.find(c => c.id === activeTimerTask)?.minMinutes || 25}
              onTimeUpdate={(minutes) => handleTimerUpdate(activeTimerTask, minutes)}
            />
            <div className="mt-2 text-center">
              <button
                onClick={() => setShowTimer(false)}
                className="text-sm text-gray-600 hover:text-gray-800 underline"
              >
                Close Timer
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
