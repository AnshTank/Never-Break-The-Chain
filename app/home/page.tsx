"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  BarChart3,
  Target,
  Link as LinkIcon,
  Timer,
  TrendingUp,
  Zap,
  CheckCircle,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <LinkIcon className="w-6 h-6 text-slate-700 dark:text-slate-300" />
              <span className="font-semibold text-slate-900 dark:text-slate-100">
                Never Break The Chain
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="sm">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-slate-100/50 dark:from-slate-900/50 dark:to-slate-800/50"></div>
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 rounded-full text-blue-700 dark:text-blue-300 text-sm font-medium mb-6">
            <Zap className="w-4 h-4" />
            Jerry Seinfeld's Proven Method
          </div>
          <h1 className="text-5xl sm:text-6xl font-bold text-slate-900 dark:text-slate-100 mb-6">
            Never Break
            <br />
            <span className="text-blue-600">The Chain</span>
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-400 mb-10 max-w-3xl mx-auto leading-relaxed">
            Build unbreakable daily habits with the methodology that helped
            Jerry Seinfeld become one of the most successful comedians. Track
            your MNZD progress and watch your consistency transform your life.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href="/signup">
              <Button size="lg" className="px-8 py-3 text-lg">
                Start Building Habits
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="px-8 py-3 text-lg">
                Sign In
              </Button>
            </Link>
          </div>

          {/* Demo Preview */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-8 max-w-4xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-green-500 rounded-lg mx-auto mb-2 flex items-center justify-center">
                  <span className="text-white font-bold">M</span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Meditation
                </p>
                <p className="text-xs text-green-600">2.5 hrs today</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-500 rounded-lg mx-auto mb-2 flex items-center justify-center">
                  <span className="text-white font-bold">N</span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Nutrition
                </p>
                <p className="text-xs text-blue-600">1.8 hrs today</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-orange-500 rounded-lg mx-auto mb-2 flex items-center justify-center">
                  <span className="text-white font-bold">Z</span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Zone
                </p>
                <p className="text-xs text-orange-600">3.2 hrs today</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-500 rounded-lg mx-auto mb-2 flex items-center justify-center">
                  <span className="text-white font-bold">D</span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Discipline
                </p>
                <p className="text-xs text-purple-600">4.1 hrs today</p>
              </div>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 rounded-full text-green-700 dark:text-green-300">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm font-medium">
                  47-day streak active
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MNZD System */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white dark:bg-slate-900">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-4">
              The MNZD System
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
              <strong>Minimum Non-Zero Days</strong> - Focus on four essential
              areas daily. Even 15 minutes counts as progress. The key is
              consistency, not perfection.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-8 rounded-2xl border border-purple-200 dark:border-purple-800">
              <div className="text-4xl mb-4">🧘</div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-3">
                Meditation
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                Daily mindfulness practice. Even 5 minutes of breathing
                exercises counts as a win.
              </p>
              <div className="text-sm text-purple-600 dark:text-purple-400 font-medium">
                Goal: Minimum 15 minutes daily
              </div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-8 rounded-2xl border border-green-200 dark:border-green-800">
              <div className="text-4xl mb-4">🥗</div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-3">
                Nutrition
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                Healthy eating and meal planning. One nutritious meal or snack
                preparation counts.
              </p>
              <div className="text-sm text-green-600 dark:text-green-400 font-medium">
                Goal: Minimum 30 minutes daily
              </div>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 p-8 rounded-2xl border border-orange-200 dark:border-orange-800">
              <div className="text-4xl mb-4">💪</div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-3">
                Zone (Exercise)
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                Physical activity and fitness. A 10-minute walk or quick workout
                session counts.
              </p>
              <div className="text-sm text-orange-600 dark:text-orange-400 font-medium">
                Goal: Minimum 30 minutes daily
              </div>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-8 rounded-2xl border border-blue-200 dark:border-blue-800">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-3">
                Discipline
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                Focused work on your goals and skills. Any productive work
                towards your objectives.
              </p>
              <div className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                Goal: Minimum 1 hour daily
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Showcase */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-4">
              Powerful Progress Tracking
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-400">
              Everything you need to build and maintain consistent daily habits
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-lg hover:shadow-xl transition-shadow">
              <Calendar className="w-12 h-12 text-blue-600 mb-6" />
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-3">
                Interactive Calendar
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                Visual monthly calendar with color-coded progress. See your
                streaks and patterns at a glance.
              </p>
              <div className="text-sm text-blue-600 font-medium">
                ✓ Color-coded daily progress
              </div>
            </div>
            <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-lg hover:shadow-xl transition-shadow">
              <BarChart3 className="w-12 h-12 text-green-600 mb-6" />
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-3">
                Advanced Analytics
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                Comprehensive charts showing actual hours worked, not just
                minimum requirements.
              </p>
              <div className="text-sm text-green-600 font-medium">
                ✓ Multiple chart types
              </div>
            </div>
            <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-lg hover:shadow-xl transition-shadow">
              <Target className="w-12 h-12 text-purple-600 mb-6" />
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-3">
                Streak Tracking
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                Never break your chain with powerful streak monitoring and
                milestone celebrations.
              </p>
              <div className="text-sm text-purple-600 font-medium">
                ✓ Current & longest streaks
              </div>
            </div>
            <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-lg hover:shadow-xl transition-shadow">
              <Timer className="w-12 h-12 text-orange-600 mb-6" />
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-3">
                Focus Timer
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                Built-in Pomodoro timer with beautiful themes and ambient sounds
                for focused work sessions.
              </p>
              <div className="text-sm text-orange-600 font-medium">
                ✓ Multiple themes & sounds
              </div>
            </div>
            <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-lg hover:shadow-xl transition-shadow">
              <TrendingUp className="w-12 h-12 text-red-600 mb-6" />
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-3">
                Year Heatmap
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                GitHub-style contribution heatmap showing your consistency over
                the entire year.
              </p>
              <div className="text-sm text-red-600 font-medium">
                ✓ Long-term visualization
              </div>
            </div>
            <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-lg hover:shadow-xl transition-shadow">
              <CheckCircle className="w-12 h-12 text-emerald-600 mb-6" />
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-3">
                Success Metrics
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                Detailed completion rates, success percentages, and performance
                insights.
              </p>
              <div className="text-sm text-emerald-600 font-medium">
                ✓ Real-time progress tracking
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-100 dark:bg-slate-800">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-8">
            Join the Consistency Revolution
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">
                10,000+
              </div>
              <p className="text-slate-600 dark:text-slate-400">
                Hours tracked by users
              </p>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600 mb-2">85%</div>
              <p className="text-slate-600 dark:text-slate-400">
                Users maintain 30+ day streaks
              </p>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600 mb-2">47</div>
              <p className="text-slate-600 dark:text-slate-400">
                Average streak length
              </p>
            </div>
          </div>
          <Link href="/signup">
            <Button size="lg" className="px-12 py-4 text-lg">
              Start Your Journey Today
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
