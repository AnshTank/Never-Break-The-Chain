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
    id: "move",
    name: "Move",
    description: "Physical activity and exercise",
    minMinutes: 30,
    color: "#8b5cf6",
  },
  {
    id: "nourish",
    name: "Nourish",
    description: "Learning and mental growth",
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
    id: "document",
    name: "Document",
    description: "Writing and reflection",
    minMinutes: 15,
    color: "#10b981",
  },
];
