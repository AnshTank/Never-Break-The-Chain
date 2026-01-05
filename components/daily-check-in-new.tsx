"use client";

import { useUserSettings, useDailyProgress } from "@/hooks/use-data";

export default function DailyCheckIn() {
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];

  const { settings, loading: settingsLoading } = useUserSettings();
  const { progress } = useDailyProgress(todayStr);

  if (settingsLoading || !settings) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const taskConfigs = settings.mnzdConfigs;
  const completedTasks = progress?.tasks?.filter(task => {
    const config = taskConfigs.find(c => c.id === task.id);
    return task.minutes >= (config?.minMinutes || 0);
  }) || [];
  
  const todayCompleted = completedTasks.length;
  const todayAllCompleted = todayCompleted === 4;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                TODAY'S MNZD
              </span>
            </div>
            <div className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              {today.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </div>
          </div>
          <div className="text-right">
            <div className={`text-lg font-bold ${
              todayAllCompleted ? "text-green-600" : "text-gray-600 dark:text-gray-400"
            }`}>
              {todayCompleted}/4
            </div>
            <div className="text-sm text-blue-600 font-medium">
              {(progress?.totalHours || 0).toFixed(1)}h total
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {taskConfigs.map((config) => {
            const task = progress?.tasks?.find(t => t.id === config.id);
            const isCompleted = task && task.minutes >= config.minMinutes;

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
                      <span className="text-2xl">
                        {isCompleted ? "✅" : "⭕"}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className={`font-semibold text-sm sm:text-base ${
                          isCompleted ? "text-green-800" : "text-gray-900 dark:text-gray-100"
                        }`}>
                          {config.name}
                        </h3>
                        <div className="flex items-center gap-2">
                          {isCompleted && task && task.minutes > 0 && (
                            <span className="text-xs px-2 py-1 rounded-full bg-green-200 text-green-700">
                              {task.minutes}min
                            </span>
                          )}
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            isCompleted
                              ? "bg-green-200 text-green-700"
                              : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                          }`}>
                            min {config.minMinutes}
                          </span>
                        </div>
                      </div>

                      <p className={`text-xs sm:text-sm leading-relaxed ${
                        isCompleted ? "text-green-700" : "text-gray-600 dark:text-gray-400"
                      }`}>
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
  );
}