"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Mail, MessageSquare, User, Send, CheckCircle, AlertCircle } from "lucide-react"

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [submittedEmail, setSubmittedEmail] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        setSubmittedEmail(formData.email) // Store email before clearing form
        setSubmitted(true)
        setFormData({ name: "", email: "", subject: "", message: "" })
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to send message')
      }
    } catch (error) {
      setError('Failed to send message. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const quickTopics = [
    { title: "Bug Report", desc: "Something isn't working correctly" },
    { title: "Feature Request", desc: "Suggest a new feature or improvement" },
    { title: "Account Help", desc: "Issues with login, password, or account" },
    { title: "General Question", desc: "Ask anything about the app" }
  ]

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Message Sent!</h1>
            <p className="text-slate-600 mb-6">
              Thanks for reaching out! We'll get back to you within 24 hours at <strong>{submittedEmail}</strong>
            </p>
            <div className="flex gap-3">
              <Link href="/" className="flex-1">
                <Button variant="outline" className="w-full">
                  Back to Home
                </Button>
              </Link>
              <Button onClick={() => setSubmitted(false)} className="flex-1">
                Send Another
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-amber-600 hover:text-amber-800 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Contact Info */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-blue-600" />
              </div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">Get in Touch</h1>
              <p className="text-slate-600">
                Have a question, suggestion, or need help? We'd love to hear from you!
              </p>
            </div>

            {/* Quick Topics */}
            <div className="space-y-4 mb-8">
              <h3 className="font-semibold text-slate-900 mb-4">Common Topics:</h3>
              {quickTopics.map((topic, index) => (
                <button
                  key={index}
                  onClick={() => setFormData(prev => ({ ...prev, subject: topic.title }))}
                  className="w-full text-left p-4 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors"
                >
                  <div className="font-medium text-slate-900">{topic.title}</div>
                  <div className="text-sm text-slate-600">{topic.desc}</div>
                </button>
              ))}
            </div>

            {/* Contact Info */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-6">
              <h3 className="font-semibold text-blue-900 mb-3">Direct Contact</h3>
              <div className="space-y-2 text-sm">
                <p className="text-blue-800">
                  <strong>Email:</strong> anshtank9@gmail.com
                </p>
                <p className="text-blue-800">
                  <strong>Response Time:</strong> Within 24 hours
                </p>
                <p className="text-blue-700">
                  We read every message personally and respond as quickly as possible!
                </p>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Send us a Message</h2>
                <p className="text-slate-600">Fill out the form below and we'll get back to you soon</p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Your Name
                  </label>
                  <Input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your name"
                    required
                    className="border-slate-200 focus:border-blue-400 focus:ring-blue-400/20"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email Address
                  </label>
                  <Input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="your@email.com"
                    required
                    className="border-slate-200 focus:border-blue-400 focus:ring-blue-400/20"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Subject
                </label>
                <Input
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="What's this about?"
                  required
                  className="border-slate-200 focus:border-blue-400 focus:ring-blue-400/20"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Message
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Tell us more about your question, issue, or suggestion..."
                  required
                  rows={6}
                  className="w-full p-3 border border-slate-200 rounded-lg focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-colors resize-none"
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-medium rounded-xl transition-all duration-300 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Sending...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Send className="w-4 h-4" />
                    Send Message
                  </div>
                )}
              </Button>

              <p className="text-xs text-slate-500 text-center">
                We typically respond within 24 hours. Your email will be handled with care and privacy.
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}