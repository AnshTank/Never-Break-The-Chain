import { MNZDConfig } from '@/lib/models-new'

interface GlobalState {
  settings: { mnzdConfigs: MNZDConfig[] } | null
  settingsLoading: boolean
  userStatus: { isNewUser: boolean } | null
  userStatusLoading: boolean
  progressCache: Map<string, any>
}

class StateManager {
  private state: GlobalState = {
    settings: null,
    settingsLoading: false,
    userStatus: null,
    userStatusLoading: false,
    progressCache: new Map()
  }
  
  private listeners: Set<() => void> = new Set()
  private settingsPromise: Promise<any> | null = null
  private userStatusPromise: Promise<any> | null = null

  subscribe(listener: () => void) {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  getState() {
    return this.state
  }

  private notify() {
    this.listeners.forEach(listener => listener())
  }

  async fetchSettings() {
    if (this.settingsPromise) return this.settingsPromise
    if (this.state.settings) return this.state.settings

    this.state.settingsLoading = true
    this.notify()

    this.settingsPromise = fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        this.state.settings = data
        this.state.settingsLoading = false
        this.notify()
        return data
      })
      .catch(err => {
        // console.error('Error fetching settings:', err)
        this.state.settingsLoading = false
        this.notify()
        throw err
      })
      .finally(() => {
        this.settingsPromise = null
      })

    return this.settingsPromise
  }

  async updateSettings(updates: { mnzdConfigs?: MNZDConfig[]; theme?: 'light' | 'dark' | 'system' }) {
    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })
      if (!response.ok) throw new Error('Failed to update settings')
      
      // Clear state and force refetch
      this.state.settings = null
      this.settingsPromise = null
      this.notify()
      
      // Refetch fresh data
      await this.fetchSettings()
    } catch (err) {
      // console.error('Error updating settings:', err)
      throw err
    }
  }

  async fetchUserStatus() {
    if (this.userStatusPromise) return this.userStatusPromise
    if (this.state.userStatus) return this.state.userStatus

    this.state.userStatusLoading = true
    this.notify()

    this.userStatusPromise = fetch('/api/user')
      .then(res => res.json())
      .then(data => {
        this.state.userStatus = data
        this.state.userStatusLoading = false
        this.notify()
        return data
      })
      .catch(err => {
        // console.error('Error fetching user status:', err)
        this.state.userStatusLoading = false
        this.notify()
        throw err
      })
      .finally(() => {
        this.userStatusPromise = null
      })

    return this.userStatusPromise
  }

  async updateUserStatus(newStatus: boolean) {
    try {
      const response = await fetch('/api/user', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ welcomeCompleted: !newStatus })
      })
      if (!response.ok) throw new Error('Failed to update user status')
      
      this.state.userStatus = { isNewUser: newStatus }
      this.notify()
    } catch (err) {
      // console.error('Error updating user status:', err)
      throw err
    }
  }

  invalidateProgressCache(dateStr?: string) {
    if (dateStr) {
      this.state.progressCache.delete(dateStr)
    } else {
      this.state.progressCache.clear()
    }
    this.notify()
  }
}

export const stateManager = new StateManager()