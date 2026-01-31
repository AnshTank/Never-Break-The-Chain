import { ObjectId } from "mongodb";

export interface MNZDConfig {
  id: string;
  name: string;
  description: string;
  minMinutes: number;
  color?: string;
}

export interface TaskProgress {
  id: string;
  minutes: number;
  completed?: boolean;
}

export interface DailyProgress {
  _id?: ObjectId;
  userId: string;
  date: string;
  tasks: TaskProgress[];
  totalHours: number;
  note: string;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserSettings {
  _id?: ObjectId;
  userId: string;
  mnzdConfigs: MNZDConfig[];
  newUser: boolean;
  timerSettings?: {
    focusTime: number;
    breakTime: number;
    dailySessionGoal: number;
    autoStart: boolean;
    notifications: boolean;
    soundVolume: number;
    backgroundSound: string;
    notificationSound: string;
    bgSoundVolume: number;
    timerTheme?: string;
    timerCustomAccentColor?: string;
  };
  timerData?: {
    sessions: any[];
    stats: {
      todayMinutes: number;
      todaySessions: number;
      totalHours: number;
      mnzdProgress: {
        code: number;
        think: number;
        express: number;
        move: number;
      };
    };
    tasks: any[];
    pomodoroCount: number;
    completedSessions: number;
  };
  welcomeCompleted?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const DEFAULT_MNZD_CONFIGS: MNZDConfig[] = [
  {
    id: "meditation",
    name: "Meditation",
    description: "Mindfulness and mental clarity",
    minMinutes: 30,
    color: "#8b5cf6",
  },
  {
    id: "nutrition",
    name: "Nutrition",
    description: "Learning and knowledge growth",
    minMinutes: 20,
    color: "#06b6d4",
  },
  {
    id: "zone",
    name: "Zone",
    description: "Deep focused work time",
    minMinutes: 45,
    color: "#f59e0b",
  },
  {
    id: "discipline",
    name: "Discipline",
    description: "Focused work and productivity",
    minMinutes: 15,
    color: "#10b981",
  },
];
