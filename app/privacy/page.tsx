"use client"

import Link from "next/link"
import { ArrowLeft, Shield, Eye, Lock, Database, Heart, CheckCircle } from "lucide-react"

export default function PrivacyPolicy() {
  const dataTypes = [
    {
      icon: Eye,
      title: "What We See",
      items: [
        "Your email address (to log you in)",
        "Your name (if you choose to share it)",
        "Your habit tracking data (to show your progress)",
        "Basic usage info (to improve the app)"
      ],
      color: "text-blue-500 bg-blue-50 border-blue-200"
    },
    {
      icon: Heart,
      title: "What We Don't See",
      items: [
        "Your personal thoughts or journal entries",
        "Your location or where you use the app",
        "Your contacts or other apps on your device",
        "Anything you don't explicitly share with us"
      ],
      color: "text-green-500 bg-green-50 border-green-200"
    }
  ]

  const promises = [
    {
      icon: Lock,
      title: "We Never Sell Your Data",
      description: "Your information is not for sale. Period. We make money by creating great products, not by selling your data."
    },
    {
      icon: Shield,
      title: "Bank-Level Security",
      description: "Your data is encrypted and protected with the same security standards used by banks and financial institutions."
    },
    {
      icon: Database,
      title: "You Own Your Data",
      description: "Export your habit data anytime. Delete your account and all data with one click. No questions asked."
    },
    {
      icon: Eye,
      title: "Complete Transparency",
      description: "We're clear about what we collect, why we need it, and how we use it. No hidden surprises or fine print tricks."
    }
  ]

  const rights = [
    "✅ See exactly what data we have about you",
    "✅ Export all your data in a readable format",
    "✅ Delete your account and all data instantly",
    "✅ Update or correct any information",
    "✅ Ask us questions about your privacy anytime"
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-amber-600 hover:text-amber-800 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
          <div className="text-center mb-12">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-4xl font-bold text-slate-900 mb-4">Your Privacy Matters</h1>
            <p className="text-slate-600 text-lg">Simple, honest privacy practices. No confusing legal language.</p>
            <p className="text-sm text-slate-500 mt-2">Last updated: January 2026</p>
          </div>

          {/* Data Collection */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-8 text-center">What Data We Collect</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {dataTypes.map((type, index) => (
                <div key={index} className={`border-2 rounded-xl p-6 ${type.color}`}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-10 h-10 ${type.color.split(' ')[1]} rounded-lg flex items-center justify-center`}>
                      <type.icon className={`w-5 h-5 ${type.color.split(' ')[0]}`} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">{type.title}</h3>
                  </div>
                  <ul className="space-y-2">
                    {type.items.map((item, itemIndex) => (
                      <li key={itemIndex} className="text-slate-700 flex items-start gap-2">
                        <span className="text-slate-400 mt-1">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Our Promises */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-8 text-center">Our Promises to You</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {promises.map((promise, index) => (
                <div key={index} className="bg-slate-50 border border-slate-200 rounded-xl p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
                      <promise.icon className="w-6 h-6 text-slate-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 mb-2">{promise.title}</h3>
                      <p className="text-slate-600">{promise.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Your Rights */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-green-500" />
              Your Rights
            </h2>
            <div className="bg-green-50 border border-green-200 rounded-xl p-6">
              <div className="space-y-3">
                {rights.map((right, index) => (
                  <p key={index} className="text-green-800 font-medium">{right}</p>
                ))}
              </div>
            </div>
          </div>

          {/* Simple Summary */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-8 text-center">
            <h3 className="text-2xl font-bold text-blue-900 mb-4">The Simple Truth</h3>
            <p className="text-blue-800 text-lg leading-relaxed mb-6">
              We collect only what we need to make the app work great for you. 
              We protect your data like it's our own. You're always in control. 
              No surprises, no tricks, no selling your information. 🔒
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="/contact" className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                Privacy Questions?
              </a>
              <Link href="/dashboard" className="inline-flex items-center gap-2 bg-white text-blue-600 border border-blue-200 px-6 py-3 rounded-lg font-medium hover:bg-blue-50 transition-colors">
                Go to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}