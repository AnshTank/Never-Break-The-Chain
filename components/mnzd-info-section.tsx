"use client"

import MNZDInfoModal from "./mnzd-info-modal"

export default function MNZDInfoSection() {
  return (
    <div className="bg-gradient-to-r from-slate-50 to-blue-50/30 dark:from-slate-900/50 dark:to-blue-950/30 rounded-xl p-6 mb-6 border border-slate-200/50 dark:border-slate-700/50">
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          Minimum Non-Zero Day (MNZD)
        </h2>
        <p className="text-slate-600 dark:text-slate-400">
          Showing up daily, even on bad days. All four pillars must happen for a complete day.
        </p>
        <p className="text-sm text-slate-500 dark:text-slate-500 leading-relaxed">
          <span className="font-medium">Code.</span> <span className="font-medium">Think.</span> <span className="font-medium">Express.</span> <span className="font-medium">Move.</span> No exceptions. No substitutions.
        </p>
        <div className="pt-1">
          <MNZDInfoModal autoOpen={false} />
        </div>
      </div>
    </div>
  )
}