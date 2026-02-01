"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Textarea } from "./ui/textarea"
import { useUserSettings } from "@/hooks/use-data"
import type { MNZDConfig } from "@/lib/models-new"

interface MNZDCustomizeModalProps {
  isOpen: boolean
  onClose: () => void
  onSaveStart?: () => void
}

const NAME_LIMIT = 30
const DESCRIPTION_LIMIT = 120
const MIN_TIME = 5
const MAX_TIME = 120

export default function MNZDCustomizeModal({ isOpen, onClose, onSaveStart }: MNZDCustomizeModalProps) {
  const { settings, updateSettings } = useUserSettings()
  const [configs, setConfigs] = useState<MNZDConfig[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (settings?.mnzdConfigs) {
      setConfigs([...settings.mnzdConfigs])
    }
  }, [settings])

  const validateField = (id: string, field: string, value: string | number) => {
    const key = `${id}-${field}`
    let error = ''

    if (field === 'name') {
      const nameValue = value as string
      if (nameValue.length > NAME_LIMIT) {
        error = `Keep it snappy! ${nameValue.length}/${NAME_LIMIT} characters. Shorter names are easier to track daily.`
      }
    } else if (field === 'description') {
      const descValue = value as string
      if (descValue.length > DESCRIPTION_LIMIT) {
        error = `Brief is better! ${descValue.length}/${DESCRIPTION_LIMIT} characters. Clear descriptions help you stay focused.`
      }
    } else if (field === 'minMinutes') {
      const timeValue = value as number
      if (timeValue < MIN_TIME) {
        error = `Too short! Minimum ${MIN_TIME} minutes helps build real momentum and creates lasting habits.`
      } else if (timeValue > MAX_TIME) {
        error = `Too ambitious! Maximum ${MAX_TIME} minutes keeps it sustainable. Small consistent wins beat burnout.`
      }
    }

    setErrors(prev => ({ ...prev, [key]: error }))
    return !error
  }

  const updateConfig = (id: string, field: keyof MNZDConfig | 'color', value: string | number) => {
    setConfigs(prev => prev.map(config => 
      config.id === id ? { ...config, [field]: value } : config
    ))
    
    if (field !== 'color') {
      validateField(id, field as string, value)
    }
  }

  const getCharacterCount = (text: string, limit: number) => {
    const remaining = limit - text.length
    const isOverLimit = remaining < 0
    return {
      text: `${text.length}/${limit}`,
      className: isOverLimit ? 'text-red-500' : remaining <= 10 ? 'text-amber-500' : 'text-gray-500'
    }
  }

  const hasErrors = () => {
    return Object.values(errors).some(error => error !== '')
  }

  const handleSave = async () => {
    // Validate all fields before saving
    let hasValidationErrors = false
    configs.forEach(config => {
      if (!validateField(config.id, 'name', config.name)) hasValidationErrors = true
      if (!validateField(config.id, 'description', config.description)) hasValidationErrors = true
      if (!validateField(config.id, 'minMinutes', config.minMinutes)) hasValidationErrors = true
    })

    if (hasValidationErrors) {
      return
    }

    setIsSaving(true)
    onSaveStart?.()
    try {
      await updateSettings({ mnzdConfigs: configs })
      onClose()
    } catch (error) {
      alert('Failed to save settings. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  if (!settings) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto" onOpenAutoFocus={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="text-2xl">Customize Your MNZD</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Personalize your Minimum Non-Zero Day tasks
          </p>
        </DialogHeader>

        <div className="space-y-6">
          {configs.map((config, index) => {
            const nameCount = getCharacterCount(config.name, NAME_LIMIT)
            const descCount = getCharacterCount(config.description, DESCRIPTION_LIMIT)
            const nameError = errors[`${config.id}-name`]
            const descError = errors[`${config.id}-description`]
            const timeError = errors[`${config.id}-minMinutes`]
            
            return (
              <div key={config.id} className="border rounded-lg p-4 space-y-4">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold"
                    style={{ backgroundColor: (config as any).color || '#3b82f6' }}
                  >
                    {config.id.charAt(0).toUpperCase()}
                  </div>
                  <h3 className="text-lg font-semibold">Task {index + 1}</h3>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label htmlFor={`${config.id}-name`}>Task Name</Label>
                      <span className={`text-xs ${nameCount.className}`}>
                        {nameCount.text}
                      </span>
                    </div>
                    <Input
                      id={`${config.id}-name`}
                      value={config.name}
                      onChange={(e) => updateConfig(config.id, 'name', e.target.value)}
                      placeholder="Enter task name"
                      className={nameError ? 'border-red-300 focus:border-red-500' : ''}
                    />
                    {nameError && (
                      <p className="text-xs text-red-600 mt-1">{nameError}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor={`${config.id}-minutes`}>Minimum Minutes</Label>
                    <Input
                      id={`${config.id}-minutes`}
                      type="number"
                      min={MIN_TIME}
                      max={MAX_TIME}
                      value={config.minMinutes}
                      onChange={(e) => updateConfig(config.id, 'minMinutes', parseInt(e.target.value) || MIN_TIME)}
                      placeholder="30"
                      className={timeError ? 'border-red-300 focus:border-red-500' : ''}
                    />
                    {timeError && (
                      <p className="text-xs text-red-600 mt-1">{timeError}</p>
                    )}
                    {!timeError && (
                      <p className="text-xs text-gray-500 mt-1">
                        Sweet spot: {MIN_TIME}-{MAX_TIME} minutes for sustainable daily habits
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor={`${config.id}-description`}>Description</Label>
                    <span className={`text-xs ${descCount.className}`}>
                      {descCount.text}
                    </span>
                  </div>
                  <Textarea
                    id={`${config.id}-description`}
                    value={config.description}
                    onChange={(e) => updateConfig(config.id, 'description', e.target.value)}
                    placeholder="Describe what this task involves..."
                    className={`min-h-[60px] ${descError ? 'border-red-300 focus:border-red-500' : ''}`}
                  />
                  {descError && (
                    <p className="text-xs text-red-600 mt-1">{descError}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`${config.id}-color`}>Theme Color</Label>
                  <div className="flex items-center gap-3">
                    <Input
                      id={`${config.id}-color`}
                      type="color"
                      value={(config as any).color || '#3b82f6'}
                      onChange={(e) => updateConfig(config.id, 'color', e.target.value)}
                      className="w-16 h-10 cursor-pointer"
                    />
                    <div 
                      className="flex-1 h-10 rounded-lg border"
                      style={{ backgroundColor: (config as any).color || '#3b82f6' }}
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div className="flex gap-3 pt-4 border-t">
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1"
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving || hasErrors()}
            className="flex-1"
          >
            {isSaving ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Saving...
              </div>
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}