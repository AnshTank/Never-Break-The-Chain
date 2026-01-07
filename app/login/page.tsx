"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"

function LoginForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [showIncompleteSetup, setShowIncompleteSetup] = useState(false)
  const [incompleteEmail, setIncompleteEmail] = useState("")
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const oauthError = searchParams.get('error')
    const message = searchParams.get('message')
    if (oauthError) {
      setError('Login failed. Please try again.')
    } else if (message) {
      setError('')
    }
  }, [searchParams])

  const handleCredentialsSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password: password || "",
          rememberMe
        }),
      })
      
      const data = await response.json()
      
      if (response.ok) {
        router.push("/")
      } else {
        if (data.needsPasswordSetup && data.email) {
          setIncompleteEmail(data.email)
          setShowIncompleteSetup(true)
          setError("")
        } else {
          setError(data.error || "Invalid email or password")
        }
      }
    } catch (err) {
      setError("Failed to sign in")
    } finally {
      setIsLoading(false)
    }
  }

  const handleContinueSetup = async () => {
    setIsLoading(true)
    try {
      const emailToUse = incompleteEmail || email
      const response = await fetch('/api/auth/resend-setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: emailToUse }),
      })
      
      const data = await response.json()
      
      if (response.ok) {
        window.location.href = '/welcome'
      } else {
        setError(data.error || "Failed to continue setup")
        setShowIncompleteSetup(false)
      }
    } catch (err) {
      setError("Failed to continue setup")
      setShowIncompleteSetup(false)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-blue-950/30 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-8 shadow-xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-slate-100 dark:to-slate-400 bg-clip-text text-transparent">
              Welcome Back
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2">Sign in to continue your journey</p>
          </div>

          {showIncompleteSetup ? (
            <div className="text-center space-y-4">
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                <h3 className="font-semibold text-amber-800 dark:text-amber-200 mb-2">Account Setup Incomplete</h3>
                <p className="text-sm text-amber-700 dark:text-amber-300 mb-3">
                  Your account <strong>{incompleteEmail}</strong> was created but setup wasn't completed.
                </p>
                <Button
                  type="button"
                  onClick={handleContinueSetup}
                  disabled={isLoading}
                  className="w-full bg-amber-600 hover:bg-amber-700 text-white"
                >
                  {isLoading ? "Continuing..." : "Continue Setup"}
                </Button>
                <Button
                  type="button"
                  onClick={() => setShowIncompleteSetup(false)}
                  variant="ghost"
                  className="w-full mt-2 text-slate-600 dark:text-slate-400"
                >
                  Back to Login
                </Button>
              </div>
            </div>
          ) : (
            <>
              <form onSubmit={handleCredentialsSignIn} className="space-y-4">
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
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="rememberMe"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                    disabled={isLoading}
                  />
                  <Label htmlFor="rememberMe" className="text-sm text-slate-600 dark:text-slate-400 cursor-pointer">
                    Remember me
                  </Label>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                  {rememberMe 
                    ? "You'll stay logged in for 7 days, even after closing your browser" 
                    : "You'll be logged out after 24 hours of inactivity"
                  }
                </p>
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
                  disabled={isLoading}
                >
                  {isLoading ? "Signing in..." : "Sign In"}
                </Button>
              </form>
              
              <div className="mt-4 text-center">
                <button
                  type="button"
                  onClick={() => {
                    if (!email) {
                      setError("Please enter your email first")
                      return
                    }
                    handleContinueSetup()
                  }}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                  disabled={isLoading}
                >
                  Can't remember your password? Try account recovery
                </button>
              </div>
            </>
          )}

          {error && (
            <div className="mt-4 text-red-600 dark:text-red-400 text-sm text-center">{error}</div>
          )}
          
          {searchParams.get('message') && (
            <div className="mt-4 text-green-600 dark:text-green-400 text-sm text-center">
              {searchParams.get('message')}
            </div>
          )}

          <div className="mt-6 flex justify-center gap-4 text-center">
            <Link href="/forgot-password" className="text-blue-600 dark:text-blue-400 text-sm hover:underline">
              Forgot your password?
            </Link>
            <span className="text-slate-300 dark:text-slate-600">•</span>
            <Link href="/delete-account" className="text-red-500 dark:text-red-400 text-sm hover:underline">
              Delete account
            </Link>
          </div>

          <div className="mt-6 text-center">
            <p className="text-slate-600 dark:text-slate-400 text-sm">
              Don't have an account?{" "}
              <Link href="/signup" className="text-blue-600 dark:text-blue-400 font-medium hover:underline">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Login() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}