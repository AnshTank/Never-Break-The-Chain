"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useInView, useAnimation, type Variants } from "framer-motion";
import Link from "next/link";
import {
  Calendar,
  BarChart3,
  Check,
  ArrowRight,
  Zap,
  Target,
  TrendingUp,
  Users,
  Star,
  Shield,
  Clock,
  Award,
  Sparkles,
  Link2,
  Timer,
  CheckCircle,
} from "lucide-react";

// Animation variants
const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: "easeOut" },
  },
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.1 },
  },
};

const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.4, ease: "easeOut" },
  },
};

// Animated Section Component
const AnimatedSection = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const controls = useAnimation();

  useEffect(() => {
    if (isInView) {
      controls.start("visible");
    }
  }, [isInView, controls]);

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={fadeInUp}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// Hero Section
const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
      {/* Animated Background Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            x: [0, 50, 0],
            y: [0, -30, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-20 -left-20 w-96 h-96 bg-[#0070A0]/10 rounded-full blur-[100px]"
        />
        <motion.div
          animate={{
            x: [0, -30, 0],
            y: [0, 50, 0],
            scale: [1, 1.05, 1],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-20 right-0 w-80 h-80 bg-[#1B9CCA]/10 rounded-full blur-[80px]"
        />
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#F2B124]/5 rounded-full blur-[120px]"
        />
      </div>

      <div className="container-max section-padding relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Content */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="text-center lg:text-left"
          >
            <motion.div
              variants={fadeInUp}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#0070A0]/10 rounded-full mb-6"
            >
              <Sparkles className="w-4 h-4 text-[#0070A0]" />
              <span className="text-sm font-medium text-[#0070A0]">
                The Chain Method Reimagined
              </span>
            </motion.div>

            <motion.h1
              variants={fadeInUp}
              className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight mb-6"
            >
              Never Break <span className="text-gradient">The Chain</span>
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              className="text-lg sm:text-xl text-gray-600 max-w-xl mx-auto lg:mx-0 mb-8 leading-relaxed"
            >
              Transform your daily consistency into extraordinary results. The
              simple system that turns small actions into unstoppable momentum.
            </motion.p>

            <motion.div
              variants={fadeInUp}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8"
            >
              <motion.div
                whileHover={{
                  scale: 1.05,
                  rotateX: 5,
                  rotateY: -5,
                }}
                whileTap={{ scale: 0.95 }}
                className="relative group perspective-1000"
              >
                <Link href="/signup" className="relative overflow-hidden">
                  {/* Main button */}
                  <div className="relative px-5 md:px-6 py-2.5 md:py-3 bg-gradient-to-r from-[#0070A0] to-[#1B9CCA] text-white font-semibold rounded-full shadow-2xl flex items-center gap-2 text-sm transition-all duration-300 group-hover:shadow-[#0070A0]/50 group-hover:shadow-2xl">
                    {/* Animated background layers */}
                    <div className="absolute inset-0 bg-gradient-to-r from-[#1B9CCA] to-[#0070A0] opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-full" />

                    {/* Ripple effect */}
                    <div className="absolute inset-0 rounded-full">
                      <div className="absolute inset-0 bg-white/20 rounded-full scale-0 group-hover:scale-150 transition-transform duration-700 ease-out" />
                      <div className="absolute inset-0 bg-white/10 rounded-full scale-0 group-hover:scale-125 transition-transform duration-500 ease-out delay-100" />
                    </div>

                    {/* Sparkle particles */}
                    <div className="absolute inset-0 pointer-events-none">
                      {Array.from({ length: 8 }).map((_, i) => (
                        <motion.div
                          key={i}
                          className="absolute w-1 h-1 bg-white rounded-full"
                          style={{
                            left: `${20 + i * 10}%`,
                            top: `${30 + (i % 2) * 40}%`,
                          }}
                          animate={{
                            scale: [0, 1, 0],
                            opacity: [0, 1, 0],
                            rotate: [0, 180, 360],
                          }}
                          transition={{
                            duration: 1.5,
                            delay: i * 0.1,
                            repeat: Infinity,
                            repeatDelay: 2,
                          }}
                        />
                      ))}
                    </div>

                    {/* Content */}
                    <motion.div
                      className="relative z-10 flex items-center gap-2"
                      whileHover={{ x: 2 }}
                      transition={{ type: "spring", stiffness: 400 }}
                    >
                      <motion.div
                        animate={{ rotate: [0, 15, -15, 0] }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      >
                        <Zap className="w-4 h-4" />
                      </motion.div>
                      <span>Start Your Chain</span>
                      <motion.div
                        className="group-hover:translate-x-1 transition-transform duration-300"
                        animate={{ x: [0, 3, 0] }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      >
                        <ArrowRight className="w-4 h-4" />
                      </motion.div>
                    </motion.div>
                  </div>

                  {/* Glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-[#0070A0] to-[#1B9CCA] rounded-full blur-xl opacity-0 group-hover:opacity-50 transition-opacity duration-500 scale-110" />

                  {/* Border animation */}
                  <div className="absolute inset-0 rounded-full border-2 border-transparent group-hover:border-white/30 transition-all duration-300" />
                </Link>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link
                  href="/login"
                  className="px-5 md:px-6 py-2.5 md:py-3 bg-white/10 hover:bg-white/20 text-gray-700 font-semibold rounded-full border border-gray-200 hover:border-gray-300 flex items-center gap-2 text-sm transition-all"
                >
                  Already have an account? Sign In
                </Link>
              </motion.div>
            </motion.div>

            <motion.div
              variants={fadeInUp}
              className="flex items-center justify-center lg:justify-start gap-4 text-sm text-gray-500"
            >
              <div className="flex -space-x-2">
                {[1, 2, 3].map((i) => (
                  <img
                    key={i}
                    src={`/images/avatar-${i}.jpg`}
                    alt={`User ${i}`}
                    className="w-8 h-8 rounded-full border-2 border-white object-cover"
                  />
                ))}
              </div>
              <span>
                Join <strong className="text-gray-900">50,000+</strong> people
                building better habits
              </span>
            </motion.div>
          </motion.div>

          {/* Hero Image */}
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
            className="relative"
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="relative"
            >
              <img
                src="/images/hero-sketch.jpg"
                alt="Person tracking their daily chain"
                className="w-full max-w-lg mx-auto rounded-2xl shadow-2xl"
              />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

// Features Section
const FeaturesSection = () => {
  const features = [
    {
      icon: Calendar,
      title: "Interactive Calendar",
      description:
        "Visual monthly calendar with color-coded progress. See your streaks and patterns at a glance.",
      color: "bg-blue-100 text-blue-600",
      accent: "text-blue-600",
      feature: "✓ Color-coded daily progress",
    },
    {
      icon: BarChart3,
      title: "Advanced Analytics",
      description:
        "Comprehensive charts showing actual hours worked, not just minimum requirements.",
      color: "bg-green-100 text-green-600",
      accent: "text-green-600",
      feature: "✓ Multiple chart types",
    },
    {
      icon: Target,
      title: "Streak Tracking",
      description:
        "Never break your chain with powerful streak monitoring and milestone celebrations.",
      color: "bg-purple-100 text-purple-600",
      accent: "text-purple-600",
      feature: "✓ Current & longest streaks",
    },
    {
      icon: Timer,
      title: "Focus Timer",
      description:
        "Built-in Pomodoro timer with beautiful themes and ambient sounds for focused work sessions.",
      color: "bg-orange-100 text-orange-600",
      accent: "text-orange-600",
      feature: "✓ Multiple themes & sounds",
    },
    {
      icon: TrendingUp,
      title: "Year Heatmap",
      description:
        "GitHub-style contribution heatmap showing your consistency over the entire year.",
      color: "bg-red-100 text-red-600",
      accent: "text-red-600",
      feature: "✓ Long-term visualization",
    },
    {
      icon: CheckCircle,
      title: "Success Metrics",
      description:
        "Detailed completion rates, success percentages, and performance insights.",
      color: "bg-emerald-100 text-emerald-600",
      accent: "text-emerald-600",
      feature: "✓ Real-time progress tracking",
    },
  ];

  return (
    <section
      id="features"
      className="py-24 bg-gradient-to-b from-[#F7F9FA] to-white"
    >
      <div className="container-max section-padding">
        <AnimatedSection className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#0070A0]/10 rounded-full mb-6"
          >
            <Sparkles className="w-4 h-4 text-[#0070A0]" />
            <span className="text-sm font-medium text-[#0070A0]">
              Powerful Progress Tracking
            </span>
          </motion.div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            Everything you need to build{" "}
            <span className="text-gradient">unbreakable habits</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Advanced tools designed to help you maintain consistency and achieve
            your goals with precision tracking.
          </p>
        </AnimatedSection>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={staggerContainer}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              variants={scaleIn}
              whileHover={{
                y: -8,
                scale: 1.02,
                transition: { duration: 0.3, ease: "easeOut" },
              }}
              className="group bg-white rounded-2xl p-8 shadow-sm hover:shadow-2xl transition-shadow duration-300 border border-gray-100 hover:border-gray-200 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-gray-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              <div className="relative z-10">
                <motion.div
                  className={`w-14 h-14 ${feature.color} rounded-xl flex items-center justify-center mb-6`}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  <feature.icon className="w-7 h-7" />
                </motion.div>

                <h3 className="text-xl font-bold mb-3 group-hover:text-gray-900 transition-colors">
                  {feature.title}
                </h3>

                <p className="text-gray-600 leading-relaxed mb-4 group-hover:text-gray-700 transition-colors">
                  {feature.description}
                </p>

                <div
                  className={`text-sm font-medium ${feature.accent} flex items-center gap-2`}
                >
                  <div className="w-1.5 h-1.5 bg-current rounded-full" />
                  {feature.feature}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Social Proof Stats */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-20 bg-gradient-to-r from-[#0070A0]/5 via-[#1B9CCA]/5 to-[#0070A0]/5 rounded-3xl p-8 md:p-12 border border-[#0070A0]/10"
        >
          <div className="text-center mb-8">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              Join the Consistency Revolution
            </h3>
            <p className="text-gray-600">
              Thousands are already building better habits
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                value: "10,000+",
                label: "Hours tracked by users",
                color: "text-blue-600",
              },
              {
                value: "85%",
                label: "Users maintain 30+ day streaks",
                color: "text-green-600",
              },
              {
                value: "47",
                label: "Average streak length",
                color: "text-purple-600",
              },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 + 0.5, duration: 0.6 }}
                className="text-center"
              >
                <motion.div
                  className={`text-3xl md:text-4xl font-bold ${stat.color} mb-2`}
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{
                    delay: index * 0.1 + 0.7,
                    duration: 0.5,
                    type: "spring",
                    stiffness: 200,
                  }}
                >
                  {stat.value}
                </motion.div>
                <p className="text-gray-600">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};
// How It Works Section
const HowItWorksSection = () => {
  const steps = [
    {
      title: "Set Your Goals",
      description:
        "Define your daily targets for each pillar of growth. Start small and build up.",
      icon: Target,
    },
    {
      title: "Track Daily",
      description:
        "Check off your tasks each day and watch your chain grow longer and stronger.",
      icon: Check,
    },
    {
      title: "Never Break The Chain",
      description:
        "The visual reminder of your streak becomes your greatest motivation.",
      icon: Shield,
    },
  ];

  return (
    <section id="how-it-works" className="py-24">
      <div className="container-max section-padding">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: -60 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative order-2 lg:order-1"
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            >
              <img
                src="/images/story-philosophy.jpg"
                alt="Chain reaction concept"
                className="w-full rounded-2xl shadow-xl"
              />
            </motion.div>

            {/* Floating Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="absolute -bottom-6 -right-6 bg-white rounded-xl shadow-xl p-4 border border-gray-100"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-[#0070A0] rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">180+</p>
                  <p className="text-sm text-gray-500">hours of growth/year</p>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Content */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="order-1 lg:order-2"
          >
            <motion.h2
              variants={fadeInUp}
              className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6"
            >
              Stay on track,{" "}
              <span className="text-gradient">every single day</span>
            </motion.h2>

            <motion.p
              variants={fadeInUp}
              className="text-lg text-gray-600 mb-8 leading-relaxed"
            >
              Smart notifications learn your patterns and send perfectly-timed motivational messages. 
              Morning boosts at 7 AM, evening check-ins at 8 PM, and funny reminders that actually work.
            </motion.p>

            <motion.div variants={staggerContainer} className="space-y-6">
              {steps.map((step) => (
                <motion.div
                  key={step.title}
                  variants={fadeInUp}
                  className="flex items-start gap-4"
                >
                  <div className="w-10 h-10 bg-[#0070A0]/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <step.icon className="w-5 h-5 text-[#0070A0]" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg mb-1">{step.title}</h4>
                    <p className="text-gray-600">{step.description}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            <motion.div variants={fadeInUp} className="mt-8">
              <Link
                href="/welcome"
                className="inline-flex items-center gap-2 text-[#0070A0] font-medium hover:gap-3 transition-all"
              >
                Explore Features
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

// MNZD Section
const MNZDSection = () => {
  const pillars = [
    {
      letter: "M",
      name: "Move",
      desc: "Physical activity and health",
      color: "bg-emerald-500",
    },
    {
      letter: "N",
      name: "Nourish",
      desc: "Learning and mental growth",
      color: "bg-purple-500",
    },
    {
      letter: "Z",
      name: "Zone",
      desc: "Deep focus and flow state",
      color: "bg-blue-500",
    },
    {
      letter: "D",
      name: "Document",
      desc: "Capture wisdom and insights",
      color: "bg-orange-500",
    },
  ];

  return (
    <section className="py-24 bg-[#F7F5F0]">
      <div className="container-max section-padding">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Content */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.h2
              variants={fadeInUp}
              className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6"
            >
              Set goals. Achieve them.{" "}
              <span className="text-gradient">Repeat.</span>
            </motion.h2>

            <motion.p
              variants={fadeInUp}
              className="text-lg text-gray-600 mb-8 leading-relaxed"
            >
              Start with small, manageable daily commitments. Watch as they
              compound into massive transformation. The chain method makes
              success inevitable.
            </motion.p>

            <motion.div
              variants={staggerContainer}
              className="grid grid-cols-2 gap-4 mb-8"
            >
              {pillars.map((pillar) => (
                <motion.div
                  key={pillar.letter}
                  variants={scaleIn}
                  whileHover={{ scale: 1.02 }}
                  className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
                >
                  <div
                    className={`w-10 h-10 ${pillar.color} rounded-lg flex items-center justify-center text-white font-bold text-lg mb-3`}
                  >
                    {pillar.letter}
                  </div>
                  <h4 className="font-semibold mb-1">{pillar.name}</h4>
                  <p className="text-sm text-gray-500">{pillar.desc}</p>
                </motion.div>
              ))}
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Link
                href="/signup"
                className="btn-primary inline-flex items-center gap-2"
              >
                Start Building
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </motion.div>

          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: 60 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative"
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            >
              <img
                src="/images/story-mnzd.jpg"
                alt="MNZD Framework"
                className="w-full rounded-2xl shadow-xl"
              />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

// Testimonials Section
const TestimonialsSection = () => {
  const testimonials = [
    {
      name: "Khushbu Tank",
      role: "Marketing Manager",
      image: "/images/avatar-1.jpg",
      quote:
        "I was struggling to maintain any routine until I found this app. Now I've completed 127 days of coding practice and morning workouts. The visual chain is incredibly motivating!",
      rating: 5,
    },
    {
      name: "Samarth Tiwari",
      role: "Software Engineer",
      image: "/images/avatar-2.jpg",
      quote:
        "As someone who tried every productivity app, this one actually works. I've maintained my reading habit for 8 months straight. The streak tracking keeps me accountable every single day.",
      rating: 5,
    },
    {
      name: "Priya Sharma",
      role: "Content Creator",
      image: "/images/avatar-3.jpg",
      quote:
        "Finally hit my daily writing goal consistently! 6 months, 180+ articles published. This app turned my scattered creative energy into a disciplined writing practice.",
      rating: 5,
    },
  ];

  return (
    <section id="testimonials" className="py-24">
      <div className="container-max section-padding">
        <AnimatedSection className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            Loved by thousands building{" "}
            <span className="text-gradient">better habits</span>
          </h2>
        </AnimatedSection>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "0px" }}
          variants={staggerContainer}
          className="grid md:grid-cols-3 gap-8"
        >
          {testimonials.map((testimonial, idx) => (
            <motion.div
              key={testimonial.name}
              variants={scaleIn}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className={`bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-200 border border-gray-100 ${
                idx === 1 ? "md:-translate-y-4" : ""
              }`}
            >
              <div className="flex items-center gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-5 h-5 fill-[#F2B124] text-[#F2B124]"
                  />
                ))}
              </div>

              <p className="text-gray-700 mb-6 leading-relaxed text-lg">
                &ldquo;{testimonial.quote}&rdquo;
              </p>

              <div className="flex items-center gap-4">
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <p className="font-semibold">{testimonial.name}</p>
                  <p className="text-sm text-gray-500">{testimonial.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

// Motivational CTA Section
const MotivationalSection = () => {
  const sparkleArray = Array.from({ length: 8 });
  const stats = [
    {
      value: "37×",
      label: "Better in 365 days",
      icon: TrendingUp,
      description: "Compound growth effect",
      color: "from-emerald-400 to-teal-400",
    },
    {
      value: "90%",
      label: "See results in 30 days",
      icon: Target,
      description: "Proven success rate",
      color: "from-blue-400 to-indigo-400",
    },
    {
      value: "180+",
      label: "Hours of growth yearly",
      icon: Clock,
      description: "Just 30 min daily",
      color: "from-purple-400 to-pink-400",
    },
  ];
  return (
    <section id="start-today" className="relative py-20 overflow-hidden">
      {/* Creative Background */}
      <div className="absolute inset-0">
        {/* Mesh Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0070A0] via-[#1B9CCA] to-[#0070A0] opacity-90" />

        {/* Animated Geometric Shapes */}
        <motion.div
          animate={{
            rotate: [0, 360],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-20 -right-20 w-96 h-96 border border-white/20 rounded-full"
        />
        <motion.div
          animate={{
            rotate: [360, 0],
            scale: [1, 0.9, 1],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-32 -left-32 w-80 h-80 border-2 border-white/10 rounded-full"
        />

        {/* Floating Dots Pattern */}
        <div className="absolute inset-0">
          {Array.from({ length: 50 }).map((_, i) => {
            // Use deterministic positioning based on index to avoid hydration mismatch
            const left = (i * 37) % 100;
            const top = (i * 23) % 100;
            const delay = (i * 0.1) % 5;

            return (
              <motion.div
                key={i}
                animate={{
                  y: [0, -20, 0],
                  opacity: [0.3, 0.8, 0.3],
                }}
                transition={{
                  duration: 3 + (i % 3),
                  delay: delay,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute w-1 h-1 bg-white/40 rounded-full"
                style={{
                  left: `${left}%`,
                  top: `${top}%`,
                }}
              />
            );
          })}
        </div>
      </div>

      <div className="container-max section-padding relative z-10">
        <div className="max-w-5xl mx-auto">
          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            {/* Badge */}
            <motion.div
              initial={{ scale: 0, rotate: -10 }}
              whileInView={{ scale: 1, rotate: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.6, type: "spring" }}
              className="inline-block mb-8"
            >
              <div className="relative">
                <div className="px-8 py-4 bg-white/20 backdrop-blur-xl rounded-full border border-white/30 shadow-2xl">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-[#F2B124] rounded-full animate-pulse" />
                    <span className="text-white font-semibold text-lg">
                      50,000+ Lives Transformed
                    </span>
                    <Sparkles className="w-5 h-5 text-[#F2B124]" />
                  </div>
                </div>
                {/* Glow effect */}
                <div className="absolute inset-0 bg-white/10 rounded-full blur-xl scale-110" />
              </div>
            </motion.div>

            {/* Headline */}
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-6 leading-tight"
            >
              Stop Waiting.
              <br />
              <span className="relative inline-block">
                <span className="text-[#F2B124]">Start Building.</span>
                <motion.div
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 1, duration: 0.8 }}
                  className="absolute -bottom-2 left-0 right-0 h-2 bg-[#F2B124]/30 rounded-full"
                />
              </span>
            </motion.h2>

            {/* Subheading */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="text-xl text-white/90 mb-8 max-w-3xl mx-auto font-light leading-relaxed"
            >
              Every moment you hesitate is a moment your dreams drift further
              away.
              <span className="font-semibold text-white">
                Your transformation starts with a single click.
              </span>
            </motion.p>
          </motion.div>

          {/* CTA Section */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="text-center mb-16"
          >
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-8">
              <motion.div
                whileHover={{
                  x: [0, -1, 1, -1, 1, 0],
                }}
                whileTap={{ scale: 0.95 }}
                transition={{
                  x: { duration: 0.4, ease: "easeInOut" },
                }}
                className="relative group"
              >
                <Link href="/signup" className="relative">
                  {/* Main button */}
                  <div className="relative px-8 py-4 bg-white text-[#0070A0] font-black text-lg rounded-2xl shadow-2xl flex items-center gap-3 transition-all duration-300 group-hover:shadow-xl overflow-hidden">
                    {/* Particle effects on hover */}
                    <div className="absolute inset-0 pointer-events-none">
                      {sparkleArray.map((_, i) => (
                        <motion.div
                          key={i}
                          className="absolute w-2 h-2 bg-[#0070A0] rounded-full opacity-0 group-hover:opacity-100"
                          style={{
                            left: `${15 + i * 8}%`,
                            top: `${20 + (i % 3) * 20}%`,
                          }}
                          variants={{
                            hover: {
                              scale: [0, 1.2, 0],
                              y: [0, -20, -40],
                              opacity: [0, 1, 0],
                            }
                          }}
                          animate="hover"
                          transition={{
                            duration: 0.8,
                            delay: i * 0.1,
                            repeat: Infinity,
                            repeatDelay: 1.5,
                          }}
                        />
                      ))}
                    </div>

                    {/* Content */}
                    <motion.div
                      className="relative z-10 flex items-center gap-3"
                      whileHover={{ scale: 1.02 }}
                      transition={{ type: "spring", stiffness: 400 }}
                    >
                      <Zap className="w-6 h-6" />
                      <span>Start Your Chain Now</span>
                      <ArrowRight className="w-6 h-6" />
                    </motion.div>
                  </div>
                </Link>
              </motion.div>

              <div className="text-white/80 text-center sm:text-left">
                <div className="font-bold text-lg mb-1">100% Free Forever</div>
                <div className="text-sm opacity-75">
                  No credit card • No hidden fees
                </div>
              </div>
            </div>
          </motion.div>

          {/* Stats Grid */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.9 + index * 0.1, duration: 0.6 }}
                whileHover={{ y: -10, scale: 1.02 }}
                className="group relative"
              >
                {/* Card */}
                <div className="relative bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-2xl overflow-hidden">
                  {/* Gradient overlay */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}
                  />

                  {/* Icon */}
                  <div className="relative mb-4">
                    <div
                      className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center shadow-lg`}
                    >
                      <stat.icon className="w-6 h-6 text-white" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="relative">
                    <div className="text-3xl font-black text-white mb-2">
                      {stat.value}
                    </div>
                    <div className="text-white/90 font-semibold text-base mb-1">
                      {stat.label}
                    </div>
                    <div className="text-white/60 text-sm">
                      {stat.description}
                    </div>
                  </div>

                  {/* Shine effect */}
                  <motion.div
                    initial={{ x: "-100%", opacity: 0 }}
                    whileInView={{ x: "100%", opacity: [0, 1, 0] }}
                    viewport={{ once: true }}
                    transition={{ delay: 1.2 + index * 0.2, duration: 1.5 }}
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"
                  />
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

const Footer = () => {
  return <></>;
};

export default function HomePage() {
  return (
    <div className="home-page-container w-full">
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <MNZDSection />
      <TestimonialsSection />
      <MotivationalSection />
      <Footer />
    </div>
  );
}
