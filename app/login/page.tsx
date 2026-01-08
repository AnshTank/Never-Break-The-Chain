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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm relative z-10">
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
              Welcome back
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-sm">Sign in to your account</p>
          </div>

          {showIncompleteSetup ? (
            <div className="space-y-4">
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-md p-4">
                <h3 className="font-medium text-amber-800 dark:text-amber-200 mb-2">Setup incomplete</h3>
                <p className="text-sm text-amber-700 dark:text-amber-300 mb-3">
                  Your account <strong>{incompleteEmail}</strong> needs to be set up.
                </p>
                <Button
                  type="button"
                  onClick={handleContinueSetup}
                  disabled={isLoading}
                  className="w-full bg-amber-600 hover:bg-amber-700 text-white"
                >
                  {isLoading ? "Continuing..." : "Continue setup"}
                </Button>
                <Button
                  type="button"
                  onClick={() => setShowIncompleteSetup(false)}
                  variant="ghost"
                  className="w-full mt-2"
                >
                  Back to login
                </Button>
              </div>
            </div>
          ) : (
            <>
              <form onSubmit={handleCredentialsSignIn} className="space-y-4">
                <div>
                  <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    disabled={isLoading}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    disabled={isLoading}
                    className="mt-1"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="rememberMe"
                      checked={rememberMe}
                      onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                      disabled={isLoading}
                    />
                    <Label htmlFor="rememberMe" className="text-sm cursor-pointer">
                      Remember me
                    </Label>
                  </div>
                  <Link href="/forgot-password" className="text-sm text-blue-600 hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <p className="text-xs text-slate-500">
                  {rememberMe 
                    ? "You'll stay logged in for 7 days" 
                    : "You'll be logged out after 24 hours of inactivity"
                  }
                </p>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? "Signing in..." : "Sign in"}
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
                  className="text-sm text-blue-600 hover:underline"
                  disabled={isLoading}
                >
                  Can't remember your password? Try account recovery
                </button>
              </div>
            </>
          )}

          {error && (
            <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
              <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
            </div>
          )}
          
          {searchParams.get('message') && (
            <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
              <p className="text-green-600 dark:text-green-400 text-sm">
                {searchParams.get('message')}
              </p>
            </div>
          )}

          <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
            <div className="text-center space-y-2">
              <Link href="/delete-account" className="text-red-500 text-sm hover:underline block">
                Delete account
              </Link>
              <p className="text-slate-600 dark:text-slate-400 text-sm">
                Don't have an account?{" "}
                <Link href="/signup" className="text-blue-600 font-medium hover:underline">
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Login() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin"></div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}