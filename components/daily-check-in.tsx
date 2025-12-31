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
  const [showHoursInput, setShowHoursInput] = useState(false);
  const [taskConfigs, setTaskConfigs] =
    useState<TaskConfig[]>(defaultTaskConfigs);
  const [settingsOpen, setSettingsOpen] = useState(false);

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
      })),
      totalHours: 0,
      note: "",
      completed: false,
    };

    // Update task names to match current config
    if (todayData.tasks) {
      todayData.tasks = todayData.tasks.map((task) => {
        const config = taskConfigs.find((c) => c.id === task.id);
        return {
          ...task,
          name: config?.name || task.name,
        };
      });
    }

    setTodayEntry(todayData);
    setIsLoading(false);
  }, [currentData, todayStr, taskConfigs]);

  const handleTaskToggle = (taskId: string) => {
    try {
      if (!todayEntry) return;
      const updatedTasks = todayEntry.tasks.map((t) =>
        t.id === taskId ? { ...t, completed: !t.completed } : t
      );
      const newEntry = {
        ...todayEntry,
        tasks: updatedTasks,
        completed: updatedTasks.every((t) => t.completed),
      };
      setTodayEntry(newEntry);
      onSubmit(today, newEntry);
    } catch (error) {
      console.error("Error toggling task:", error);
    }
  };

  const handleHoursUpdate = (hours: number) => {
    if (!todayEntry) return;
    const newEntry = { ...todayEntry, totalHours: hours };
    setTodayEntry(newEntry);
    onSubmit(today, newEntry);
    setShowHoursInput(false);
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
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Customize Your MNZD System</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-6 max-h-96 overflow-y-auto scrollbar-gradient">
                    <style jsx>{`
                      .scrollbar-gradient::-webkit-scrollbar {
                        width: 8px;
                      }
                      .scrollbar-gradient::-webkit-scrollbar-track {
                        background: linear-gradient(
                          180deg,
                          #f3f4f6 0%,
                          #e5e7eb 100%
                        );
                        border-radius: 4px;
                      }
                      .scrollbar-gradient::-webkit-scrollbar-thumb {
                        background: linear-gradient(
                          180deg,
                          #fb923c 0%,
                          #f97316 50%,
                          #ea580c 100%
                        );
                        border-radius: 4px;
                      }
                      .scrollbar-gradient::-webkit-scrollbar-thumb:hover {
                        background: linear-gradient(
                          180deg,
                          #f97316 0%,
                          #ea580c 50%,
                          #dc2626 100%
                        );
                      }
                    `}</style>
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
                </DialogContent>
              </Dialog>
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
            <button
              onClick={() => setShowHoursInput(!showHoursInput)}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              {todayEntry.totalHours.toFixed(1)}h
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {todayEntry.tasks.map((task) => {
            const config = taskConfigs.find((c) => c.id === task.id);

            // Default descriptions
            const defaultDescriptions = {
              code: "Work on real code daily by building, fixing, or improving something small. Watching videos does not count.",
              think: "Spend time thinking through one problem or approach, even if you do not fully solve it.",
              express: "Write or speak one clear thought about what you worked on or learned.",
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
                    : "bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 hover:shadow-sm"
                }`}
              >
                <button
                  onClick={() => handleTaskToggle(task.id)}
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
                        {config && (
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${
                              task.completed
                                ? "bg-green-200 text-green-700"
                                : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                            }`}
                          >
                            {config.minMinutes}min
                          </span>
                        )}
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

                {task.completed && (
                  <div className="absolute top-2 right-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {showHoursInput && (
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Update today's hours:
            </div>
            <div className="flex items-center gap-2">
              {[0.5, 1, 2, 3, 4, 6].map((hours) => (
                <button
                  key={hours}
                  onClick={() => handleHoursUpdate(hours)}
                  className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-sm hover:bg-blue-200 dark:hover:bg-blue-800"
                >
                  {hours}h
                </button>
              ))}
            </div>
          </div>
        )}

        {todayAllCompleted && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 text-center">
            <div className="text-green-800 dark:text-green-200 font-semibold">
              🎉 Today's MNZD Complete!
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
