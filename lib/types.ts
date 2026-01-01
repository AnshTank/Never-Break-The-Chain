export interface MNZDTask {
  id: "code" | "think" | "express" | "move"
  name: string
  completed: boolean
  minutes?: number
}

export interface DayEntry {
  date: string
  tasks: MNZDTask[]
  totalHours: number
  note: string
  completed: boolean // true if all 4 tasks done
}

export interface JourneyData {
  [dateStr: string]: DayEntry
}
