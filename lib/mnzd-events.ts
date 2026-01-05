"use client"

// Global event system for MNZD updates
export class MNZDEventManager {
  private static instance: MNZDEventManager
  private listeners: Map<string, Set<Function>> = new Map()

  static getInstance(): MNZDEventManager {
    if (!MNZDEventManager.instance) {
      MNZDEventManager.instance = new MNZDEventManager()
    }
    return MNZDEventManager.instance
  }

  // Event types
  static EVENTS = {
    SETTINGS_UPDATED: 'mnzd:settings:updated',
    PROGRESS_UPDATED: 'mnzd:progress:updated',
    TASK_COMPLETED: 'mnzd:task:completed',
    DAY_COMPLETED: 'mnzd:day:completed'
  } as const

  subscribe(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    this.listeners.get(event)!.add(callback)

    // Return unsubscribe function
    return () => {
      this.listeners.get(event)?.delete(callback)
    }
  }

  emit(event: string, data?: any) {
    const callbacks = this.listeners.get(event)
    if (callbacks) {
      callbacks.forEach(callback => callback(data))
    }
  }

  // Convenience methods
  onSettingsUpdate(callback: Function) {
    return this.subscribe(MNZDEventManager.EVENTS.SETTINGS_UPDATED, callback)
  }

  onProgressUpdate(callback: Function) {
    return this.subscribe(MNZDEventManager.EVENTS.PROGRESS_UPDATED, callback)
  }

  onTaskComplete(callback: Function) {
    return this.subscribe(MNZDEventManager.EVENTS.TASK_COMPLETED, callback)
  }

  emitSettingsUpdate(settings: any) {
    this.emit(MNZDEventManager.EVENTS.SETTINGS_UPDATED, settings)
  }

  emitProgressUpdate(date: string, progress: any) {
    this.emit(MNZDEventManager.EVENTS.PROGRESS_UPDATED, { date, progress })
  }

  emitTaskComplete(date: string, taskId: string, completed: boolean) {
    this.emit(MNZDEventManager.EVENTS.TASK_COMPLETED, { date, taskId, completed })
  }
}

export const mnzdEvents = MNZDEventManager.getInstance()