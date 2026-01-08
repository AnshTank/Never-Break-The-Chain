"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Loader2, CheckCircle, AlertCircle } from "lucide-react";

interface FeedbackData {
  name: string;
  email: string;
  subject: string;
  message: string;
  type: 'feedback' | 'bug' | 'feature' | 'other';
}

export default function FeedbackForm() {
  const [formData, setFormData] = useState<FeedbackData>({
    name: '',
    email: '',
    subject: '',
    message: '',
    type: 'feedback'
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [charCount, setCharCount] = useState(0);
  const formRef = useRef<HTMLFormElement>(null);

  const feedbackTypes = [
    { id: 'feedback', label: 'General Feedback', emoji: '💬' },
    { id: 'bug', label: 'Bug Report', emoji: '🐛' },
    { id: 'feature', label: 'Feature Request', emoji: '✨' },
    { id: 'other', label: 'Other', emoji: '📝' }
  ];

  useEffect(() => {
    setCharCount(formData.message.length);
  }, [formData.message]);

  const handleInputChange = (field: keyof FeedbackData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setSubmitStatus('success');
        setFormData({ name: '', email: '', subject: '', message: '', type: 'feedback' });
        setTimeout(() => setSubmitStatus('idle'), 5000);
      } else {
        setSubmitStatus('error');
      }
    } catch (error) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = formData.name.trim() && formData.email.trim() && formData.message.trim();

  return (
    <div className="max-w-2xl mx-auto">
      {/* Success Message */}
      {submitStatus === 'success' && (
        <div className="mb-8 p-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-2xl animate-in slide-in-from-top-5 duration-500">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
            <div>
              <h3 className="font-semibold text-green-900 dark:text-green-100">Message Sent Successfully!</h3>
              <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                Thank you for your feedback. I'll get back to you within 24 hours.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {submitStatus === 'error' && (
        <div className="mb-8 p-6 bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border border-red-200 dark:border-red-800 rounded-2xl animate-in slide-in-from-top-5 duration-500">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
            <div>
              <h3 className="font-semibold text-red-900 dark:text-red-100">Something went wrong</h3>
              <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                Please try again or reach out directly via email.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Form */}
      <form 
        ref={formRef}
        onSubmit={handleSubmit}
        className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl border border-slate-200/50 dark:border-slate-700/50 p-8 shadow-2xl shadow-slate-900/5 dark:shadow-slate-900/20"
      >
        {/* Form Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100/50 dark:bg-slate-700/50 rounded-full mb-4">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Your Voice Matters</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            Let's Start a Conversation
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            Every message is read personally by me
          </p>
        </div>

        {/* Feedback Type Selection */}
        <div className="mb-8">
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">
            What would you like to share?
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {feedbackTypes.map((type) => (
              <button
                key={type.id}
                type="button"
                onClick={() => handleInputChange('type', type.id as any)}
                className={`p-4 rounded-xl border-2 transition-all duration-300 group hover:scale-105 ${
                  formData.type === type.id
                    ? 'border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 shadow-lg'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                }`}
              >
                <div className="text-2xl mb-2 group-hover:scale-110 transition-transform duration-300">
                  {type.emoji}
                </div>
                <div className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  {type.label}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Name and Email Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Your Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              onFocus={() => setFocusedField('name')}
              onBlur={() => setFocusedField(null)}
              className="w-full px-4 py-3 bg-slate-50/50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-300 dark:focus:ring-slate-500 focus:border-transparent transition-all duration-300 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
              placeholder="Enter your name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Email Address *
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              onFocus={() => setFocusedField('email')}
              onBlur={() => setFocusedField(null)}
              className="w-full px-4 py-3 bg-slate-50/50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-300 dark:focus:ring-slate-500 focus:border-transparent transition-all duration-300 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
              placeholder="your@email.com"
              required
            />
          </div>
        </div>

        {/* Subject Field */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Subject (Optional)
          </label>
          <input
            type="text"
            value={formData.subject}
            onChange={(e) => handleInputChange('subject', e.target.value)}
            className="w-full px-4 py-3 bg-slate-50/50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-300 dark:focus:ring-slate-500 focus:border-transparent transition-all duration-300 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
            placeholder="Brief subject line"
          />
        </div>

        {/* Message Field */}
        <div className="mb-8">
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Your Message *
          </label>
          <textarea
            value={formData.message}
            onChange={(e) => handleInputChange('message', e.target.value)}
            onFocus={() => setFocusedField('message')}
            onBlur={() => setFocusedField(null)}
            rows={6}
            className="w-full px-4 py-3 bg-slate-50/50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-300 dark:focus:ring-slate-500 focus:border-transparent transition-all duration-300 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 resize-none"
            placeholder="Share your thoughts, ideas, or feedback..."
            required
            maxLength={1000}
          />
          <div className="flex justify-between items-center mt-2">
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Be as detailed as you'd like
            </div>
            <div className={`text-xs font-medium ${
              charCount > 900 ? 'text-orange-500' : 'text-slate-500 dark:text-slate-400'
            }`}>
              {charCount}/1000
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!isFormValid || isSubmitting}
          className={`w-full py-4 px-6 rounded-xl font-semibold text-white transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] ${
            isFormValid && !isSubmitting
              ? 'bg-gradient-to-r from-slate-700 to-slate-900 hover:from-slate-800 hover:to-slate-950 shadow-lg hover:shadow-xl'
              : 'bg-slate-300 dark:bg-slate-600 cursor-not-allowed'
          }`}
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center gap-3">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Sending your message...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-3">
              <Send className="w-5 h-5" />
              <span>Send Message</span>
            </div>
          )}
        </button>

        {/* Footer Note */}
        <div className="mt-6 text-center">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Your information is secure and will never be shared with third parties.
          </p>
        </div>
      </form>
    </div>
  );
}