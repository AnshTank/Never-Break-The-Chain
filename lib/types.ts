export interface MNZDTask {
  id: "move" | "nourish" | "zone" | "document"
  name: string
  completed: boolean
  minutes: number
  timerMinutes?: number
  manualMinutes?: number
}

export interface DayEntry {
  date: string
  tasks: MNZDTask[]
  totalHours: number
  focusHours?: number
  editableHours?: number
  note: string
  completed: boolean // true if all 4 tasks done
}

export interface JourneyData {
  [dateStr: string]: DayEntry
}

export interface MNZDConfig {
  id: "move" | "nourish" | "zone" | "document"
  name: string
  description: string
  minMinutes: number
  color: string
}
