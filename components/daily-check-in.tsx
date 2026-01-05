"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useUserSettings, useGlobalDailyProgress } from "@/hooks/use-data";
import { mnzdEvents } from "@/lib/mnzd-events";
import MNZDCustomizeModal from "./mnzd-customize-modal";

export default function DailyCheckIn() {
  const [showMNZDModal, setShowMNZDModal] = useState(false);
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [localProgress, setLocalProgress] = useState<any>(null);
  
  // Memoize today's date string to prevent recalculation
  const todayStr = useMemo(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  }, []);
  
  const handleCustomizeComplete = useCallback(() => {
    setShowMNZDModal(false)
    setIsCustomizing(false)
  }, [])
  
  const handleCustomizeStart = useCallback(() => {
    setIsCustomizing(true)
  }, [])

  const { settings, loading: settingsLoading } = useUserSettings();
  const { todayProgress, todayLoading } = useGlobalDailyProgress();

  // Use local progress if available, otherwise use global today's progress
  const currentProgress = localProgress || todayProgress;
  
  // Memoize task calculations to prevent recalculation
  const { taskConfigs, completedTasks, todayCompleted, todayAllCompleted } = useMemo(() => {
    if (!settings || !currentProgress) {
      return { taskConfigs: [], completedTasks: [], todayCompleted: 0, todayAllCompleted: false }
    }
    
    const taskConfigs = settings.mnzdConfigs;
    const completedTasks = currentProgress?.tasks?.filter((task) => {
      const config = taskConfigs.find((c) => c.id === task.id);
      const taskMinutes = task?.minutes || 0;
      return taskMinutes >= (config?.minMinutes || 0);
    }) || [];
    
    const todayCompleted = completedTasks.length;
    const todayAllCompleted = todayCompleted === 4;
    
    return { taskConfigs, completedTasks, todayCompleted, todayAllCompleted }
  }, [settings, currentProgress])
  
  // Optimize event handlers with useCallback
  const handleProgressUpdate = useCallback(() => {
    setLocalProgress(null); // Clear local state to use fresh global data
  }, []);
  
  const handleMNZDProgressUpdate = useCallback(({ date, progress: updatedProgress }) => {
    if (date === todayStr) {
      setLocalProgress(updatedProgress);
    }
  }, [todayStr]);
  
  const handleTaskComplete = useCallback(({ date, taskId, completed }) => {
    if (date === todayStr && currentProgress) {
      const updatedTasks = currentProgress.tasks?.map((task: any) => 
        task.id === taskId ? { ...task, completed } : task
      ) || [];
      
      setLocalProgress({
        ...currentProgress,
        tasks: updatedTasks
      });
    }
  }, [todayStr, currentProgress]);
  
  // Listen for real-time updates with optimized dependencies
  useEffect(() => {
    const unsubscribeSettings = mnzdEvents.onSettingsUpdate(() => {
      // Settings updated, component will re-render automatically
    });

    const unsubscribeProgress = mnzdEvents.onProgressUpdate(handleMNZDProgressUpdate);
    const unsubscribeTask = mnzdEvents.onTaskComplete(handleTaskComplete);
    
    window.addEventListener('progressUpdated', handleProgressUpdate);

    return () => {
      unsubscribeSettings();
      unsubscribeProgress();
      unsubscribeTask();
      window.removeEventListener('progressUpdated', handleProgressUpdate);
    };
  }, [handleMNZDProgressUpdate, handleTaskComplete, handleProgressUpdate]);

  // Reset local progress when today's progress changes
  useEffect(() => {
    if (todayProgress && !localProgress) {
      setLocalProgress(todayProgress);
    }
  }, [todayProgress, localProgress]);
  
  // Early return for loading states
  if (settingsLoading || todayLoading || !settings) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-24 bg-gray-200 dark:bg-gray-700 rounded"
              ></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  TODAY'S MNZD
                </span>
                <button
                  onClick={() => setShowMNZDModal(true)}
                  className="text-xs px-2 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-full transition-colors"
                  disabled={isCustomizing}
                >
                  {isCustomizing ? (
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 border border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      <span>Customizing...</span>
                    </div>
                  ) : (
                    "Customize"
                  )}
                </button>
              </div>
              <div className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                {new Date().toLocaleDateString("en-US", {
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
                {(currentProgress?.totalHours || 0).toFixed(1)}h total
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {taskConfigs.map((config) => {
            const task = currentProgress?.tasks?.find((t) => t.id === config.id);
            const taskMinutes = task?.minutes || 0;
            const isCompleted = taskMinutes >= config.minMinutes;
            
            return (
              <div
                key={config.id}
                className={`relative overflow-hidden rounded-xl border-2 transition-all duration-200 ${
                  isCompleted
                    ? "bg-gradient-to-br from-green-50 to-green-100 border-green-300"
                    : "bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border-gray-200 dark:border-gray-600"
                }`}
              >
                <div className="p-4 sm:p-5">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
                        style={{ backgroundColor: config.color || '#3b82f6' }}
                      >
                        {config.name.charAt(0).toUpperCase()}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h3
                          className={`font-semibold text-sm sm:text-base ${
                            isCompleted
                              ? "text-green-800"
                              : "text-gray-900 dark:text-gray-100"
                          }`}
                        >
                          {config.name}
                        </h3>
                        <div className="flex items-center gap-2">
                          {isCompleted && taskMinutes > 0 && (
                            <span className="text-xs px-2 py-1 rounded-full bg-green-200 text-green-700">
                              {taskMinutes}min
                            </span>
                          )}
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${
                              isCompleted
                                ? "bg-green-200 text-green-700"
                                : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                            }`}
                          >
                            min {config.minMinutes}
                          </span>
                        </div>
                      </div>

                      <p
                        className={`text-xs sm:text-sm leading-relaxed ${
                          isCompleted
                            ? "text-green-700"
                            : "text-gray-600 dark:text-gray-400"
                        }`}
                      >
                        {config.description}
                      </p>
                    </div>
                  </div>
                </div>
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
        </div>
      </div>
      
      <MNZDCustomizeModal 
        isOpen={showMNZDModal} 
        onClose={handleCustomizeComplete}
        onSaveStart={handleCustomizeStart}
      />
      
    </>
  );
}
