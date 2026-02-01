'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Mail, Send, Github, Linkedin, CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AboutContactPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    
    try {
      const response = await fetch('/api/about-contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setIsSuccess(true);
        setFormData({ name: '', email: '', subject: '', message: '' });
      } else {
        setError(data.error || 'Something went wrong. Please try again.');
      }
    } catch (error) {
      setError('Unable to connect. Please check your internet connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  if (isSuccess) {
    return (
      <main className="min-h-screen bg-[hsl(var(--paper-cream))] py-8 px-4 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md mx-auto text-center"
        >
          <div className="sketch-card bg-[hsl(var(--paper-cream))]">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h2 className="font-handwritten text-2xl text-[hsl(var(--ink-blue))] mb-4">
              Message Sent!
            </h2>
            <p className="font-serif text-[hsl(var(--graphite))] mb-6">
              Thank you for reaching out. I'll get back to you soon!
            </p>
            <button
              onClick={() => router.back()}
              className="sketch-button"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </button>
          </div>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[hsl(var(--paper-cream))] py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <motion.button
          onClick={() => router.back()}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2 mb-8 text-[hsl(var(--ink-blue))] hover:text-[hsl(var(--faded-blue))] transition-colors font-mono text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </motion.button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="font-handwritten text-4xl sm:text-5xl text-[hsl(var(--ink-blue))] mb-4">
            Get in Touch
          </h1>
          <p className="font-serif text-lg text-[hsl(var(--graphite))]">
            Let's start a conversation about Never Break The Chain
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="sketch-card bg-[hsl(var(--paper-cream))] mb-8"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block font-mono text-sm text-[hsl(var(--ink-blue))] mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border-2 border-[hsl(var(--ink-blue))]/20 bg-[hsl(var(--paper-sepia))] text-[hsl(var(--charcoal))] font-serif focus:border-[hsl(var(--ink-blue))] focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block font-mono text-sm text-[hsl(var(--ink-blue))] mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border-2 border-[hsl(var(--ink-blue))]/20 bg-[hsl(var(--paper-sepia))] text-[hsl(var(--charcoal))] font-serif focus:border-[hsl(var(--ink-blue))] focus:outline-none transition-colors"
                />
              </div>
            </div>
            
            <div>
              <label className="block font-mono text-sm text-[hsl(var(--ink-blue))] mb-2">
                Subject *
              </label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border-2 border-[hsl(var(--ink-blue))]/20 bg-[hsl(var(--paper-sepia))] text-[hsl(var(--charcoal))] font-serif focus:border-[hsl(var(--ink-blue))] focus:outline-none transition-colors"
              />
            </div>
            
            <div>
              <label className="block font-mono text-sm text-[hsl(var(--ink-blue))] mb-2">
                Message *
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows={6}
                className="w-full px-4 py-3 border-2 border-[hsl(var(--ink-blue))]/20 bg-[hsl(var(--paper-sepia))] text-[hsl(var(--charcoal))] font-serif focus:border-[hsl(var(--ink-blue))] focus:outline-none transition-colors resize-none"
              />
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg"
              >
                <p className="text-red-700 text-sm font-serif">{error}</p>
              </motion.div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sketch-button flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-5 h-5 border-2 border-[hsl(var(--paper-cream))] border-t-transparent rounded-full"
                  />
                  <span>Sending your message...</span>
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Send Message
                </>
              )}
            </button>
          </form>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-center"
        >
          <p className="font-serif text-[hsl(var(--graphite))] mb-4">
            Or reach out directly:
          </p>
          <div className="flex justify-center gap-6">
            <a
              href="mailto:anshtank9@gmail.com"
              className="flex items-center gap-2 text-[hsl(var(--ink-blue))] hover:text-[hsl(var(--faded-blue))] transition-colors font-mono text-sm"
            >
              <Mail className="w-4 h-4" />
              anshtank9@gmail.com
            </a>
            <a
              href="https://github.com/AnshTank"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-[hsl(var(--ink-blue))] hover:text-[hsl(var(--faded-blue))] transition-colors font-mono text-sm"
            >
              <Github className="w-4 h-4" />
              AnshTank
            </a>
            <a
              href="https://linkedin.com/in/anshtank9"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-[hsl(var(--ink-blue))] hover:text-[hsl(var(--faded-blue))] transition-colors font-mono text-sm"
            >
              <Linkedin className="w-4 h-4" />
              anshtank9
            </a>
          </div>
        </motion.div>
      </div>
    </main>
  );
}