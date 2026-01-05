import { ObjectId } from 'mongodb'

export interface MNZDConfig {
  id: string
  name: string
  description: string
  minMinutes: number
}

export interface TaskProgress {
  id: string
  minutes: number
  completed: boolean
}

export interface DailyProgress {
  _id?: ObjectId
  userId: string
  date: string
  tasks: TaskProgress[]
  totalHours: number
  note: string
  completed: boolean
  createdAt: Date
  updatedAt: Date
}

export interface UserSettings {
  _id?: ObjectId
  userId: string
  mnzdConfigs: MNZDConfig[]
  theme: 'light' | 'dark' | 'system'
  timerTheme?: number
  timerCustomAccentColor?: string
  timerSettings?: {
    focusTime: number
    breakTime: number
    dailySessionGoal: number
    autoStart: boolean
    notifications: boolean
    soundVolume: number
    backgroundSound: string
    bgSoundVolume: number
  }
  timerData?: {
    sessions: any[]
    stats: {
      todayMinutes: number
      todaySessions: number
      totalHours: number
      mnzdProgress: { code: number, think: number, express: number, move: number }
    }
    tasks: any[]
    pomodoroCount: number
    completedSessions: number
  }
  welcomeCompleted?: boolean
  createdAt: Date
  updatedAt: Date
}

export const DEFAULT_MNZD_CONFIGS: MNZDConfig[] = [
  {
    id: 'code',
    name: 'Code',
    description: 'Programming and technical skills',
    minMinutes: 15
  },
  {
    id: 'think',
    name: 'Think',
    description: 'Learning and mental growth',
    minMinutes: 10
  },
  {
    id: 'express',
    name: 'Express',
    description: 'Writing and communication',
    minMinutes: 5
  },
  {
    id: 'move',
    name: 'Move',
    description: 'Physical activity and health',
    minMinutes: 10
  }
]