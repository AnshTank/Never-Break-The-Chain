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

export default function MNZDCustomizeModal({ isOpen, onClose, onSaveStart }: MNZDCustomizeModalProps) {
  const { settings, updateSettings } = useUserSettings()
  const [configs, setConfigs] = useState<MNZDConfig[]>([])
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (settings?.mnzdConfigs) {
      setConfigs([...settings.mnzdConfigs])
    }
  }, [settings])

  const updateConfig = (id: string, field: keyof MNZDConfig, value: string | number) => {
    setConfigs(prev => prev.map(config => 
      config.id === id ? { ...config, [field]: value } : config
    ))
  }

  const handleSave = async () => {
    setIsSaving(true)
    onSaveStart?.()
    try {
      await updateSettings({ mnzdConfigs: configs })
      onClose()
    } catch (error) {
      // console.error('Failed to save MNZD settings:', error)
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
          {configs.map((config, index) => (
            <div key={config.id} className="border rounded-lg p-4 space-y-4">
              <div className="flex items-center gap-3">
                <div 
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold"
                  style={{ backgroundColor: config.color || '#3b82f6' }}
                >
                  {config.id.charAt(0).toUpperCase()}
                </div>
                <h3 className="text-lg font-semibold">Task {index + 1}</h3>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`${config.id}-name`}>Task Name</Label>
                  <Input
                    id={`${config.id}-name`}
                    value={config.name}
                    onChange={(e) => updateConfig(config.id, 'name', e.target.value)}
                    placeholder="Enter task name"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor={`${config.id}-minutes`}>Minimum Minutes</Label>
                  <Input
                    id={`${config.id}-minutes`}
                    type="number"
                    min="1"
                    max="480"
                    value={config.minMinutes}
                    onChange={(e) => updateConfig(config.id, 'minMinutes', parseInt(e.target.value) || 1)}
                    placeholder="30"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor={`${config.id}-description`}>Description</Label>
                <Textarea
                  id={`${config.id}-description`}
                  value={config.description}
                  onChange={(e) => updateConfig(config.id, 'description', e.target.value)}
                  placeholder="Describe what this task involves..."
                  className="min-h-[60px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`${config.id}-color`}>Theme Color</Label>
                <div className="flex items-center gap-3">
                  <Input
                    id={`${config.id}-color`}
                    type="color"
                    value={config.color || '#3b82f6'}
                    onChange={(e) => updateConfig(config.id, 'color', e.target.value)}
                    className="w-16 h-10 cursor-pointer"
                  />
                  <div 
                    className="flex-1 h-10 rounded-lg border"
                    style={{ backgroundColor: config.color || '#3b82f6' }}
                  />
                </div>
              </div>
            </div>
          ))}
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
            disabled={isSaving}
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