// Centralized state management for component synchronization
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

interface Task {
  id: string;
  minutes: number;
  completed: boolean;
}

interface DayProgress {
  date: string;
  tasks: Task[];
  totalHours: number;
  completedTasks: number;
  allCompleted: boolean;
}

interface UserSettings {
  mnzdConfigs: Array<{
    id: string;
    name: string;
    description: string;
    minMinutes: number;
    color: string;
  }>;
}

interface AppState {
  // Data
  userSettings: UserSettings | null;
  todayProgress: DayProgress | null;
  monthlyData: Record<string, DayProgress>;
  
  // Loading states
  isLoadingSettings: boolean;
  isLoadingProgress: boolean;
  isUpdatingProgress: boolean;
  
  // Error states
  settingsError: string | null;
  progressError: string | null;
  
  // Actions
  setUserSettings: (settings: UserSettings) => void;
  setTodayProgress: (progress: DayProgress) => void;
  setMonthlyData: (data: Record<string, DayProgress>) => void;
  updateTaskProgress: (taskId: string, minutes: number) => void;
  
  // Loading actions
  setLoadingSettings: (loading: boolean) => void;
  setLoadingProgress: (loading: boolean) => void;
  setUpdatingProgress: (updating: boolean) => void;
  
  // Error actions
  setSettingsError: (error: string | null) => void;
  setProgressError: (error: string | null) => void;
  
  // Computed values
  getTodayCompletedCount: () => number;
  getTodayAllCompleted: () => boolean;
  getTaskProgress: (taskId: string) => Task | null;
}

export const useAppStore = create<AppState>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    userSettings: null,
    todayProgress: null,
    monthlyData: {},
    
    isLoadingSettings: true,
    isLoadingProgress: true,
    isUpdatingProgress: false,
    
    settingsError: null,
    progressError: null,
    
    // Actions
    setUserSettings: (settings) => set({ 
      userSettings: settings, 
      isLoadingSettings: false,
      settingsError: null 
    }),
    
    setTodayProgress: (progress) => {
      const state = get();
      const updatedMonthlyData = { ...state.monthlyData };
      updatedMonthlyData[progress.date] = progress;
      
      set({ 
        todayProgress: progress, 
        monthlyData: updatedMonthlyData,
        isLoadingProgress: false,
        progressError: null 
      });
    },
    
    setMonthlyData: (data) => set({ monthlyData: data }),
    
    updateTaskProgress: (taskId, minutes) => {
      const state = get();
      if (!state.todayProgress || !state.userSettings) return;
      
      const config = state.userSettings.mnzdConfigs.find(c => c.id === taskId);
      if (!config) return;
      
      const updatedTasks = state.todayProgress.tasks.map(task => 
        task.id === taskId 
          ? { ...task, minutes, completed: minutes >= config.minMinutes }
          : task
      );
      
      const completedTasks = updatedTasks.filter(task => {
        const taskConfig = state.userSettings!.mnzdConfigs.find(c => c.id === task.id);
        return task.minutes >= (taskConfig?.minMinutes || 0);
      }).length;
      
      const totalHours = updatedTasks.reduce((sum, task) => sum + task.minutes, 0) / 60;
      const allCompleted = completedTasks === state.userSettings.mnzdConfigs.length;
      
      const updatedProgress: DayProgress = {
        ...state.todayProgress,
        tasks: updatedTasks,
        totalHours,
        completedTasks,
        allCompleted
      };
      
      // Update both today's progress and monthly data
      const updatedMonthlyData = { ...state.monthlyData };
      updatedMonthlyData[updatedProgress.date] = updatedProgress;
      
      set({ 
        todayProgress: updatedProgress,
        monthlyData: updatedMonthlyData
      });
    },
    
    // Loading actions
    setLoadingSettings: (loading) => set({ isLoadingSettings: loading }),
    setLoadingProgress: (loading) => set({ isLoadingProgress: loading }),
    setUpdatingProgress: (updating) => set({ isUpdatingProgress: updating }),
    
    // Error actions
    setSettingsError: (error) => set({ settingsError: error, isLoadingSettings: false }),
    setProgressError: (error) => set({ progressError: error, isLoadingProgress: false }),
    
    // Computed values
    getTodayCompletedCount: () => {
      const state = get();
      if (!state.todayProgress || !state.userSettings) return 0;
      
      return state.todayProgress.tasks.filter(task => {
        const config = state.userSettings!.mnzdConfigs.find(c => c.id === task.id);
        return task.minutes >= (config?.minMinutes || 0);
      }).length;
    },
    
    getTodayAllCompleted: () => {
      const state = get();
      if (!state.todayProgress || !state.userSettings) return false;
      
      const completedCount = state.getTodayCompletedCount();
      return completedCount === state.userSettings.mnzdConfigs.length;
    },
    
    getTaskProgress: (taskId) => {
      const state = get();
      return state.todayProgress?.tasks.find(task => task.id === taskId) || null;
    }
  }))
);

// Selectors for optimized re-renders
export const selectUserSettings = (state: AppState) => state.userSettings;
export const selectTodayProgress = (state: AppState) => state.todayProgress;
export const selectMonthlyData = (state: AppState) => state.monthlyData;
export const selectIsLoading = (state: AppState) => state.isLoadingSettings || state.isLoadingProgress;
export const selectTodayStats = (state: AppState) => ({
  completedCount: state.getTodayCompletedCount(),
  allCompleted: state.getTodayAllCompleted(),
  totalHours: state.todayProgress?.totalHours || 0
});