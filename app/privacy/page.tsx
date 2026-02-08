"use client";

import Link from "next/link";

export default function PrivacyPolicy() {
  const dataTypes = [
    {
      title: "What We See",
      items: [
        "Your email address (to log you in)",
        "Your name (if you choose to share it)",
        "Your habit tracking data (to show your progress)",
        "Basic usage info (to improve the app)",
      ],
    },
    {
      title: "What We Don't See",
      items: [
        "Your personal thoughts or journal entries",
        "Your location or where you use the app",
        "Your contacts or other apps on your device",
        "Anything you don't explicitly share with us",
      ],
    },
  ];

  const promises = [
    {
      title: "We Never Sell Your Data",
      description:
        "Your information is not for sale. Period. We make money by creating great products, not by selling your data.",
    },
    {
      title: "Bank-Level Security",
      description:
        "Your data is encrypted and protected with the same security standards used by banks and financial institutions.",
    },
    {
      title: "You Own Your Data",
      description:
        "Export your habit data anytime. Delete your account and all data with one click. No questions asked.",
    },
    {
      title: "Complete Transparency",
      description:
        "We're clear about what we collect, why we need it, and how we use it. No hidden surprises or fine print tricks.",
    },
  ];

  const rights = [
    "See exactly what data we have about you",
    "Export all your data in a readable format",
    "Delete your account and all data instantly",
    "Update or correct any information",
    "Ask us questions about your privacy anytime",
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
              Your Privacy Matters
            </h1>
            <p className="text-[hsl(var(--faded-blue))] text-lg">
              Simple, honest privacy practices. No confusing legal language.
            </p>
            <p className="text-sm text-[hsl(var(--faded-blue))]/70 mt-2">
              Last updated: January 2026
            </p>
          </div>

          {/* Data Collection */}
          <div className="mb-12">
            <h2 className="font-handwritten text-3xl text-[hsl(var(--ink-blue))] mb-8 text-center">
              What Data We Collect
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {dataTypes.map((type, index) => (
                <div
                  key={index}
                  className="sketch-card p-6 bg-[hsl(var(--paper-sepia))]/30"
                >
                  <h3 className="font-handwritten text-2xl text-[hsl(var(--ink-blue))] mb-4">
                    {type.title}
                  </h3>
                  <ul className="space-y-2">
                    {type.items.map((item, itemIndex) => (
                      <li
                        key={itemIndex}
                        className="text-[hsl(var(--faded-blue))] flex items-start gap-2"
                      >
                        <span className="text-[hsl(var(--vintage-gold))] mt-1">
                          •
                        </span>
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
            <h2 className="font-handwritten text-3xl text-[hsl(var(--ink-blue))] mb-8 text-center">
              Our Promises to You
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {promises.map((promise, index) => (
                <div
                  key={index}
                  className="sketch-card p-6 bg-[hsl(var(--paper-sepia))]/20"
                >
                  <h3 className="font-handwritten text-xl text-[hsl(var(--ink-blue))] mb-2">
                    {promise.title}
                  </h3>
                  <p className="text-[hsl(var(--faded-blue))]">
                    {promise.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Your Rights */}
          <div className="mb-12">
            <h2 className="font-handwritten text-3xl text-[hsl(var(--ink-blue))] mb-6">
              Your Rights
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

          {/* Simple Summary */}
          <div className="sketch-card p-8 bg-[hsl(var(--vintage-gold))]/10 text-center">
            <h3 className="font-handwritten text-3xl text-[hsl(var(--ink-blue))] mb-4">
              The Simple Truth
            </h3>
            <p className="text-[hsl(var(--faded-blue))] text-lg leading-relaxed mb-6">
              We collect only what we need to make the app work great for you.
              We protect your data like it's our own. You're always in control.
              No surprises, no tricks, no selling your information.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/contact"
                className="inline-block sketch-card px-6 py-3 bg-[hsl(var(--vintage-gold))] hover:bg-[hsl(var(--vintage-copper))] text-[hsl(var(--faded-blue))] font-handwritten text-lg transition-colors"
              >
                Privacy Questions?
              </Link>
              <button
                onClick={() => (window.location.href = "/dashboard")}
                className="inline-block sketch-card px-6 py-3 bg-[hsl(var(--paper-sepia))] hover:bg-[hsl(var(--paper-cream))] text-[hsl(var(--ink-blue))] font-handwritten text-lg transition-colors"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
