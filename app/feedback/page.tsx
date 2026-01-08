"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import FeedbackForm from "@/components/feedback-form";

export default function FeedbackPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-blue-950/30">
      {/* Header */}
      <div className="px-4 sm:px-6 py-8">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors duration-300 group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-1" />
            <span className="text-sm font-medium">Back</span>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 sm:px-6 pb-16">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-full border border-slate-200/50 dark:border-slate-700/50 mb-6">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Developer Feedback
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 dark:from-slate-100 dark:via-slate-300 dark:to-slate-100 bg-clip-text text-transparent mb-4">
              Share Your Thoughts
            </h1>

            <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Your feedback helps me build better experiences. Whether it's
              about this project, my other work, or just saying hello.
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
            <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/50 dark:border-slate-700/50 text-center group hover:scale-105 transition-all duration-300">
              <div className="text-2xl mb-3">⚡</div>
              <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-1">
                24h
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">
                Response Time
              </div>
            </div>

            <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/50 dark:border-slate-700/50 text-center group hover:scale-105 transition-all duration-300">
              <div className="text-2xl mb-3">👀</div>
              <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-1">
                100%
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">
                Read Rate
              </div>
            </div>

            <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/50 dark:border-slate-700/50 text-center group hover:scale-105 transition-all duration-300">
              <div className="text-2xl mb-3">🔒</div>
              <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-1">
                Secure
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">
                & Private
              </div>
            </div>
          </div>

          {/* Feedback Form */}
          <FeedbackForm />
        </div>
      </div>
    </div>
  );
}
