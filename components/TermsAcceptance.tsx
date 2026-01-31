"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Shield, Heart, Lock, Eye, Users, Zap } from "lucide-react";

interface TermsAcceptanceProps {
  onAccept: () => void;
  isLoading?: boolean;
}

export default function TermsAcceptance({
  onAccept,
  isLoading = false,
}: TermsAcceptanceProps) {
  const [accepted, setAccepted] = useState(false);

  const promises = [
    {
      icon: Heart,
      title: "We respect you",
      description: "Your data belongs to you. We never sell it to anyone.",
      color: "text-red-500",
    },
    {
      icon: Lock,
      title: "Your privacy is safe",
      description: "Bank-level encryption keeps your information secure.",
      color: "text-green-500",
    },
    {
      icon: Eye,
      title: "Complete transparency",
      description: "We're clear about what we collect and why we need it.",
      color: "text-blue-500",
    },
    {
      icon: Users,
      title: "You're in control",
      description: "Delete your account and data anytime with one click.",
      color: "text-purple-500",
    },
    {
      icon: Zap,
      title: "No surprises",
      description: "Free forever. No hidden fees. No credit card required.",
      color: "text-amber-500",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Shield className="w-8 h-8 text-amber-600" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">
          Our Promise to You
        </h2>
        <p className="text-slate-600">
          Simple, honest terms that protect both of us
        </p>
      </div>

      {/* Visual Promises */}
      <div className="grid gap-4">
        {promises.map((promise, index) => (
          <div
            key={index}
            className="flex items-start gap-4 p-4 bg-white border border-slate-200 rounded-xl hover:border-slate-300 transition-colors"
          >
            <div
              className={`w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center flex-shrink-0`}
            >
              <promise.icon className={`w-5 h-5 ${promise.color}`} />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 mb-1">
                {promise.title}
              </h3>
              <p className="text-sm text-slate-600">{promise.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Simple Agreement */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <Checkbox
            id="agreement"
            checked={accepted}
            onCheckedChange={(checked) => setAccepted(checked as boolean)}
            className="mt-1 data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500"
          />
          <div className="flex-1">
            <label
              htmlFor="agreement"
              className="block text-sm font-medium text-slate-900 mb-2 cursor-pointer"
            >
              I understand and agree to these terms
            </label>
            <div className="text-xs text-slate-600 space-y-1">
              <p>
                ✓ I can use this app to track my habits and build consistency
              </p>
              <p>✓ My data is private and secure - I can delete it anytime</p>
              <p>✓ This service is free and I won't be charged anything</p>
              <p>✓ I'll be respectful and won't misuse the platform</p>
            </div>
          </div>
        </div>
      </div>

      <Button
        onClick={onAccept}
        disabled={!accepted || isLoading}
        className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-medium rounded-xl transition-all duration-300 disabled:opacity-50"
      >
        {isLoading
          ? "Setting up your account..."
          : "Let's Start Building Habits!"}
      </Button>

      <p className="text-xs text-slate-500 text-center leading-relaxed">
        By continuing, you're agreeing to use Never Break The Chain responsibly.
        <br />
        We're here to help you build amazing habits, not to complicate your life
        with legal jargon.
      </p>
    </div>
  );
}
