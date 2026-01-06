"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { AlertTriangle, ArrowLeft, Heart } from "lucide-react"
import { useGlobalState } from "@/lib/global-state"

export default function DeleteAccount() {
  const [step, setStep] = useState<"reason" | "confirm" | "verify">("reason")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [reason, setReason] = useState("")
  const [feedback, setFeedback] = useState("")
  const [confirmed, setConfirmed] = useState(false)
  const router = useRouter()
  const { clearAllCache } = useGlobalState()

  const reasons = [
    "I don't use the app anymore",
    "I found a better alternative",
    "Privacy concerns",
    "Too complicated to use",
    "Not meeting my needs",
    "Technical issues",
    "Other"
  ]

  const handleDeleteAccount = async () => {
    if (!email || !password) {
      setError("Please enter your email and password")
      return
    }

    if (!confirmed) {
      setError("Please confirm that you understand your data will be deleted")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const response = await fetch('/api/auth/delete-account', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          reason,
          feedback
        }),
      })

      const data = await response.json()

      if (response.ok) {
        // Clear all cached data immediately
        clearAllCache()
        
        // Clear localStorage if any
        if (typeof window !== 'undefined') {
          localStorage.clear()
          sessionStorage.clear()
        }
        
        router.push("/login?message=Account deleted successfully")
      } else {
        setError(data.error || "Failed to delete account")
      }
    } catch (err) {
      setError("Failed to delete account")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-red-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-red-950/30 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-8 shadow-xl">
          
          {step === "reason" && (
            <>
              <div className="text-center mb-8">
                <div className="w-16 h-16 mx-auto mb-4 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                  <Heart className="w-8 h-8 text-red-500 dark:text-red-400" />
                </div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                  We're sad to see you go
                </h1>
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                  Your journey matters to us. Help us understand what went wrong so we can improve.
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reason">Why are you leaving? (Optional)</Label>
                  <Select value={reason} onValueChange={setReason}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a reason" />
                    </SelectTrigger>
                    <SelectContent>
                      {reasons.map((r) => (
                        <SelectItem key={r} value={r}>{r}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="feedback">Any additional feedback? (Optional)</Label>
                  <Textarea
                    id="feedback"
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Tell us how we could have done better..."
                    className="resize-none h-20"
                    maxLength={500}
                  />
                  <p className="text-xs text-slate-500">{feedback.length}/500 characters</p>
                </div>

                {error && (
                  <div className="text-red-600 dark:text-red-400 text-sm text-center bg-red-50 dark:bg-red-900/20 p-2 rounded">
                    {error}
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={() => {
                      if (!reason) {
                        setError("Please select at least one reason before continuing")
                        return
                      }
                      setError("")
                      setStep("confirm")
                    }}
                    className="w-full bg-red-500 hover:bg-red-600 text-white"
                  >
                    Continue
                  </Button>
                </div>
              </div>
            </>
          )}

          {step === "confirm" && (
            <>
              <div className="text-center mb-8">
                <div className="w-16 h-16 mx-auto mb-4 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-8 h-8 text-red-500 dark:text-red-400" />
                </div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                  Are you absolutely sure?
                </h1>
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                  This action cannot be undone. We will permanently delete your account and all associated data.
                </p>
              </div>

              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-red-800 dark:text-red-200 mb-2">
                  What will be deleted:
                </h3>
                <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
                  <li>• All your MNZD progress and streaks</li>
                  <li>• Daily check-in history and notes</li>
                  <li>• Focus timer sessions and statistics</li>
                  <li>• Custom task configurations</li>
                  <li>• Account settings and preferences</li>
                  <li>• All personal data and analytics</li>
                </ul>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => setStep("verify")}
                  className="w-full bg-red-500 hover:bg-red-600 text-white"
                >
                  I Understand
                </Button>
              </div>
            </>
          )}

          {step === "verify" && (
            <>
              <div className="text-center mb-8">
                <div className="w-16 h-16 mx-auto mb-4 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-8 h-8 text-red-500 dark:text-red-400" />
                </div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                  Verify Your Identity
                </h1>
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                  Please enter your credentials to confirm account deletion
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="flex items-start space-x-2 pt-2">
                  <Checkbox
                    id="confirm"
                    checked={confirmed}
                    onCheckedChange={(checked) => setConfirmed(checked as boolean)}
                    disabled={isLoading}
                  />
                  <Label htmlFor="confirm" className="text-sm text-slate-600 dark:text-slate-400 cursor-pointer leading-5">
                    I understand that this action is permanent and all my data will be deleted forever
                  </Label>
                </div>

                {error && (
                  <div className="text-red-600 dark:text-red-400 text-sm text-center bg-red-50 dark:bg-red-900/20 p-2 rounded">
                    {error}
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={handleDeleteAccount}
                    disabled={isLoading || !confirmed}
                    className="w-full bg-red-500 hover:bg-red-600 text-white"
                  >
                    {isLoading ? "Deleting..." : "Delete Account"}
                  </Button>
                </div>
              </div>
            </>
          )}

          <div className="mt-6 text-center">
            <Link href="/login" className="text-blue-600 dark:text-blue-400 text-sm hover:underline">
              Changed your mind? Go back to login
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}