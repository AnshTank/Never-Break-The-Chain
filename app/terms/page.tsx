"use client"

import Link from "next/link"
import { ArrowLeft, Shield, Users, Zap, Heart, CheckCircle, AlertTriangle } from "lucide-react"

export default function TermsOfService() {
  const terms = [
    {
      icon: Heart,
      title: "Be Respectful",
      description: "Use our app to build positive habits. Don't spam, harass, or misuse the platform.",
      color: "text-red-500 bg-red-50"
    },
    {
      icon: Shield,
      title: "Keep Your Account Safe",
      description: "You're responsible for your password and account security. Let us know if something seems wrong.",
      color: "text-blue-500 bg-blue-50"
    },
    {
      icon: Users,
      title: "Your Data, Your Control",
      description: "You own your habit data. Export it anytime. Delete your account whenever you want.",
      color: "text-green-500 bg-green-50"
    },
    {
      icon: Zap,
      title: "Free Forever",
      description: "Never Break The Chain is free to use. No hidden fees, no credit card required, ever.",
      color: "text-amber-500 bg-amber-50"
    }
  ]

  const rights = [
    "✅ Use the app to track your habits and build consistency",
    "✅ Export your data anytime in a readable format",
    "✅ Delete your account and all data with one click",
    "✅ Contact support if you need help or have questions",
    "✅ Expect the service to work as described"
  ]

  const responsibilities = [
    "🚫 Don't create fake accounts or spam the system",
    "🚫 Don't try to hack or break our security",
    "🚫 Don't use the app for anything illegal or harmful",
    "🚫 Don't share your account with others",
    "🚫 Don't abuse our support team"
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-amber-600 hover:text-amber-800 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
          <div className="text-center mb-12">
            <div className="w-16 h-16 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-amber-600" />
            </div>
            <h1 className="text-4xl font-bold text-slate-900 mb-4">Simple Terms</h1>
            <p className="text-slate-600 text-lg">No legal jargon. Just honest rules that protect everyone.</p>
            <p className="text-sm text-slate-500 mt-2">Last updated: January 2025</p>
          </div>

          {/* Main Terms */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {terms.map((term, index) => (
              <div key={index} className={`p-6 rounded-xl border-2 ${term.color.includes('red') ? 'border-red-200' : term.color.includes('blue') ? 'border-blue-200' : term.color.includes('green') ? 'border-green-200' : 'border-amber-200'}`}>
                <div className={`w-12 h-12 ${term.color.split(' ')[1]} rounded-lg flex items-center justify-center mb-4`}>
                  <term.icon className={`w-6 h-6 ${term.color.split(' ')[0]}`} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">{term.title}</h3>
                <p className="text-slate-600">{term.description}</p>
              </div>
            ))}
          </div>

          {/* Your Rights */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-green-500" />
              What You Can Do
            </h2>
            <div className="bg-green-50 border border-green-200 rounded-xl p-6">
              <div className="space-y-3">
                {rights.map((right, index) => (
                  <p key={index} className="text-green-800 font-medium">{right}</p>
                ))}
              </div>
            </div>
          </div>

          {/* Responsibilities */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-red-500" />
              What's Not Allowed
            </h2>
            <div className="bg-red-50 border border-red-200 rounded-xl p-6">
              <div className="space-y-3">
                {responsibilities.map((responsibility, index) => (
                  <p key={index} className="text-red-800 font-medium">{responsibility}</p>
                ))}
              </div>
            </div>
          </div>

          {/* Simple Summary */}
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-8 text-center">
            <h3 className="text-2xl font-bold text-amber-900 mb-4">The Bottom Line</h3>
            <p className="text-amber-800 text-lg leading-relaxed">
              Use Never Break The Chain to build amazing habits. Be respectful to others. 
              We'll keep your data safe and the service running smoothly. 
              If you have questions, just ask! 🚀
            </p>
            <div className="mt-6">
              <a href="/contact" className="inline-flex items-center gap-2 bg-amber-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-amber-700 transition-colors">
                Questions? Contact Us
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}