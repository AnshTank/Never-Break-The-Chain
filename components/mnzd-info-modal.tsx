"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog"
import { Button } from "./ui/button"
import { Info, Code, Brain, MessageSquare, Activity } from "lucide-react"

export default function MNZDInfoModal({ autoOpen = false }: { autoOpen?: boolean }) {
  const [open, setOpen] = useState(autoOpen)

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Info className="w-4 h-4" />
            What is MNZD?
          </Button>
        </DialogTrigger>
      </Dialog>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{
            position: "fixed",
            backgroundColor: "rgba(0, 0, 0, 0.6)",
            backdropFilter: "blur(4px)",
          }}
        >
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl scrollbar-hide">
            <style jsx>{`
              .scrollbar-hide {
                -ms-overflow-style: none;
                scrollbar-width: none;
              }
              .scrollbar-hide::-webkit-scrollbar {
                display: none;
              }
            `}</style>
            <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <span className="text-2xl">🎯</span>
                  MNZD System
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Your daily discipline framework
                </p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl"
              >
                ×
              </button>
            </div>
            <div className="p-6 space-y-6 bg-white dark:bg-gray-900">
              <p className="text-sm text-muted-foreground">
                MNZD stands for <strong>Minimum Non-Zero Day</strong> - four essential daily tasks that create a complete, productive day.
              </p>
              
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20">
                  <div className="text-lg">1️⃣</div>
                  <div>
                    <h4 className="font-medium text-blue-900 dark:text-blue-100">Code (Career)</h4>
                    <p className="text-xs text-blue-700 dark:text-blue-300 mb-2">Touch real code for at least 15 minutes</p>
                    <p className="text-xs text-blue-600 dark:text-blue-400">Examples: Build React component, fix bugs, add features</p>
                    <p className="text-xs font-medium text-blue-800 dark:text-blue-200 mt-1">Rule: If no real code was touched → MNZD fails</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-950/20">
                  <div className="text-lg">2️⃣</div>
                  <div>
                    <h4 className="font-medium text-green-900 dark:text-green-100">Think (Problem-Solving)</h4>
                    <p className="text-xs text-green-700 dark:text-green-300 mb-2">Spend 10 minutes thinking</p>
                    <p className="text-xs text-green-600 dark:text-green-400">Examples: DSA problems, dry-run approaches, write solution ideas</p>
                    <p className="text-xs font-medium text-green-800 dark:text-green-200 mt-1">Rule: Thinking counts even if you don't solve it</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-3 rounded-lg bg-orange-50 dark:bg-orange-950/20">
                  <div className="text-lg">3️⃣</div>
                  <div>
                    <h4 className="font-medium text-orange-900 dark:text-orange-100">Express (Communication)</h4>
                    <p className="text-xs text-orange-700 dark:text-orange-300 mb-2">Use your voice or writing for 5 minutes</p>
                    <p className="text-xs text-orange-600 dark:text-orange-400">Examples: Explain work out loud, write reflections, summarize learnings</p>
                    <p className="text-xs font-medium text-orange-800 dark:text-orange-200 mt-1">Rule: Thoughts must leave your head</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-3 rounded-lg bg-purple-50 dark:bg-purple-950/20">
                  <div className="text-lg">4️⃣</div>
                  <div>
                    <h4 className="font-medium text-purple-900 dark:text-purple-100">Move (Body)</h4>
                    <p className="text-xs text-purple-700 dark:text-purple-300 mb-2">Move your body for 5-15 minutes</p>
                    <p className="text-xs text-purple-600 dark:text-purple-400">Examples: Walk, stretch, light workout</p>
                    <p className="text-xs font-medium text-purple-800 dark:text-purple-200 mt-1">Rule: Any movement counts</p>
                  </div>
                </div>
              </div>
              
              <div className="pt-2 border-t">
                <p className="text-xs text-muted-foreground">
                  <strong>Goal:</strong> Complete all 4 tasks daily. Even on bad days, doing the minimum in each area keeps your chain unbroken.
                </p>
              </div>
              
              {autoOpen && (
                <div className="pt-2">
                  <Button 
                    onClick={() => {
                      localStorage.removeItem('isNewUser')
                      setOpen(false)
                    }} 
                    className="w-full"
                  >
                    Got it! Let's start my journey
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}