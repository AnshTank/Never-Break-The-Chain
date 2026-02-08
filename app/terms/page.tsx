"use client";

import Link from "next/link";

export default function TermsOfService() {
  const terms = [
    {
      title: "Be Respectful",
      description:
        "Use our app to build positive habits. Don't spam, harass, or misuse the platform.",
    },
    {
      title: "Keep Your Account Safe",
      description:
        "You're responsible for your password and account security. Let us know if something seems wrong.",
    },
    {
      title: "Your Data, Your Control",
      description:
        "You own your habit data. Export it anytime. Delete your account whenever you want.",
    },
    {
      title: "Free Forever",
      description:
        "Never Break The Chain is free to use. No hidden fees, no credit card required, ever.",
    },
  ];

  const rights = [
    "Use the app to track your habits and build consistency",
    "Export your data anytime in a readable format",
    "Delete your account and all data with one click",
    "Contact support if you need help or have questions",
    "Expect the service to work as described",
  ];

  const responsibilities = [
    "Don't create fake accounts or spam the system",
    "Don't try to hack or break our security",
    "Don't use the app for anything illegal or harmful",
    "Don't share your account with others",
    "Don't abuse our support team",
  ];

  return (
    <div className="min-h-screen bg-[hsl(var(--paper-cream))] py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <button
            onClick={() => (window.location.href = "/dashboard")}
            className="font-handwritten text-[hsl(var(--vintage-gold))] hover:text-[hsl(var(--vintage-copper))] transition-colors flex items-center gap-2"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Dashboard
          </button>
        </div>

        <div className="sketch-card bg-[hsl(var(--paper-cream))] p-8 md:p-12">
          <div className="text-center mb-12">
            <h1 className="font-handwritten text-5xl md:text-6xl text-[hsl(var(--ink-blue))] mb-4">
              Simple Terms
            </h1>
            <p className="text-[hsl(var(--faded-blue))] text-lg">
              No legal jargon. Just honest rules that protect everyone.
            </p>
            <p className="text-sm text-[hsl(var(--faded-blue))]/70 mt-2">
              Last updated: January 2026
            </p>
          </div>

          {/* Main Terms */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {terms.map((term, index) => (
              <div
                key={index}
                className="sketch-card p-6 bg-[hsl(var(--paper-sepia))]/30"
              >
                <h3 className="font-handwritten text-2xl text-[hsl(var(--ink-blue))] mb-3">
                  {term.title}
                </h3>
                <p className="text-[hsl(var(--faded-blue))]">
                  {term.description}
                </p>
              </div>
            ))}
          </div>

          {/* Your Rights */}
          <div className="mb-12">
            <h2 className="font-handwritten text-3xl text-[hsl(var(--ink-blue))] mb-6">
              What You Can Do
            </h2>
            <div className="sketch-card p-6 bg-[hsl(var(--paper-sepia))]/20">
              <div className="space-y-3">
                {rights.map((right, index) => (
                  <p
                    key={index}
                    className="text-[hsl(var(--faded-blue))] flex items-start gap-2"
                  >
                    <span className="text-[hsl(var(--vintage-gold))] mt-1">
                      ✓
                    </span>
                    {right}
                  </p>
                ))}
              </div>
            </div>
          </div>

          {/* Responsibilities */}
          <div className="mb-12">
            <h2 className="font-handwritten text-3xl text-[hsl(var(--ink-blue))] mb-6">
              What's Not Allowed
            </h2>
            <div className="sketch-card p-6 bg-[hsl(var(--paper-sepia))]/20">
              <div className="space-y-3">
                {responsibilities.map((responsibility, index) => (
                  <p
                    key={index}
                    className="text-[hsl(var(--faded-blue))] flex items-start gap-2"
                  >
                    <span className="text-[hsl(var(--vintage-copper))] mt-1">
                      ✗
                    </span>
                    {responsibility}
                  </p>
                ))}
              </div>
            </div>
          </div>

          {/* Simple Summary */}
          <div className="sketch-card p-8 bg-[hsl(var(--vintage-gold))]/10 text-center">
            <h3 className="font-handwritten text-3xl text-[hsl(var(--ink-blue))] mb-4">
              The Bottom Line
            </h3>
            <p className="text-[hsl(var(--faded-blue))] text-lg leading-relaxed mb-6">
              Use Never Break The Chain to build amazing habits. Be respectful
              to others. We'll keep your data safe and the service running
              smoothly. If you have questions, just ask!
            </p>
            <Link
              href="/contact"
              className="inline-block sketch-card px-6 py-3 bg-[hsl(var(--vintage-gold))] hover:bg-[hsl(var(--vintage-copper))] text-[hsl(var(--faded-blue))] font-handwritten text-lg transition-colors"
            >
              Questions? Contact Us
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
