"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { MNZDConfig } from "@/lib/types";
import NotificationPermissionStep from "./NotificationPermissionStep";
// import { DEFAULT_MNZD_CONFIGS } from "@/lib/models";
// Temporarily define default configs inline
const DEFAULT_MNZD_CONFIGS = [
  { id: "move", name: "Move", minMinutes: 30, description: "Physical activity", color: "#8b5cf6" },
  { id: "nourish", name: "Nourish", minMinutes: 20, description: "Learning", color: "#06b6d4" },
  { id: "zone", name: "Zone", minMinutes: 45, description: "Deep work", color: "#f59e0b" },
  { id: "document", name: "Document", minMinutes: 15, description: "Writing", color: "#10b981" }
];

interface WelcomeFlowProps {
  isNewUser: boolean;
  onComplete: (configs: MNZDConfig[]) => void;
}

export default function WelcomeFlow({ isNewUser, onComplete }: WelcomeFlowProps) {
  const [step, setStep] = useState<"info" | "customize" | "notifications" | "complete">("info");
  const [tempConfigs, setTempConfigs] = useState<any[]>(DEFAULT_MNZD_CONFIGS);

  if (!isNewUser) return null;

  const handleConfigUpdate = (index: number, field: keyof MNZDConfig, value: string | number) => {
    const updated = [...tempConfigs];
    updated[index] = { ...updated[index], [field]: value };
    setTempConfigs(updated);
  };

  const handleComplete = async () => {
    try {
      // Send MNZD configs to the API
      const response = await fetch('/api/user/complete-welcome', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ mnzdConfigs: tempConfigs }),
      })

      if (response.ok) {
        onComplete(tempConfigs)
        setStep("complete")
      } else {
        console.error('Failed to save MNZD configurations')
        // Still complete the flow locally even if API fails
        onComplete(tempConfigs)
        setStep("complete")
      }
    } catch (error) {
      console.error('Error saving MNZD configurations:', error)
      // Still complete the flow locally even if API fails
      onComplete(tempConfigs)
      setStep("complete")
    }
  };

  return (
    <Dialog open={true} onOpenChange={() => {}}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        {step === "info" && (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl">Welcome to Never Break The Chain! 🔗</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div className="text-center">
                <div className="text-6xl mb-4">🎯</div>
                <h3 className="text-xl font-semibold mb-2">Meet Your MNZD System</h3>
                <p className="text-muted-foreground">
                  Four daily tasks that build discipline and consistency
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg text-center">
                  <div className="text-3xl mb-2">💻</div>
                  <h4 className="font-semibold">Code</h4>
                  <p className="text-sm text-muted-foreground">Build something real daily</p>
                </div>
                <div className="p-4 border rounded-lg text-center">
                  <div className="text-3xl mb-2">🧠</div>
                  <h4 className="font-semibold">Think</h4>
                  <p className="text-sm text-muted-foreground">Problem-solve and reflect</p>
                </div>
                <div className="p-4 border rounded-lg text-center">
                  <div className="text-3xl mb-2">✍️</div>
                  <h4 className="font-semibold">Express</h4>
                  <p className="text-sm text-muted-foreground">Share your thoughts</p>
                </div>
                <div className="p-4 border rounded-lg text-center">
                  <div className="text-3xl mb-2">🏃</div>
                  <h4 className="font-semibold">Move</h4>
                  <p className="text-sm text-muted-foreground">Keep your body active</p>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-950/50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">How it works:</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Complete all 4 tasks daily to maintain your chain</li>
                  <li>• Set minimum time requirements for each task</li>
                  <li>• Track your progress and build streaks</li>
                  <li>• Use the focus timer for deep work sessions</li>
                </ul>
              </div>

              <Button onClick={() => setStep("customize")} className="w-full">
                Customize My MNZD System
              </Button>
            </div>
          </>
        )}

        {step === "customize" && (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl">Customize Your MNZD System</DialogTitle>
              <p className="text-sm text-muted-foreground">
                Make these tasks meaningful to your goals and lifestyle
              </p>
            </DialogHeader>

            <div className="space-y-6">
              {tempConfigs.map((config, index) => (
                <div key={config.id} className="space-y-3 p-4 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-primary">
                        {config.id === "move" ? "🏃" : config.id === "nourish" ? "🧠" : config.id === "zone" ? "🎯" : "📝"}
                      </span>
                    </div>
                    <Label className="text-base font-semibold">
                      {config.name}
                    </Label>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm text-muted-foreground">
                        Task Name
                      </Label>
                      <Input
                        value={config.name}
                        onChange={(e) => handleConfigUpdate(index, "name", e.target.value)}
                        placeholder="e.g., Programming, Writing, Design"
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label className="text-sm text-muted-foreground">
                        What does this mean to you?
                      </Label>
                      <textarea
                        value={config.description}
                        onChange={(e) => handleConfigUpdate(index, "description", e.target.value)}
                        placeholder="Ex. Build React apps, Learn algorithms, Write technical blogs"
                        className="mt-1 w-full h-16 px-3 py-2 text-sm border border-input rounded-md resize-none"
                        maxLength={120}
                      />
                    </div>

                    <div>
                      <Label className="text-sm text-muted-foreground">
                        Minimum Minutes Daily
                      </Label>
                      <Input
                        type="number"
                        value={config.minMinutes}
                        onChange={(e) => handleConfigUpdate(index, "minMinutes", parseInt(e.target.value) || 0)}
                        className="mt-1 w-24"
                        min="1"
                        max="480"
                      />
                    </div>
                  </div>
                </div>
              ))}

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep("info")} className="flex-1">
                  Back
                </Button>
                <Button onClick={() => setStep("notifications")} className="flex-1">
                  Continue
                </Button>
              </div>
            </div>
          </>
        )}

        {step === "notifications" && (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl">Enable Smart Notifications</DialogTitle>
            </DialogHeader>
            <NotificationPermissionStep
              onComplete={handleComplete}
              onSkip={handleComplete}
            />
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}