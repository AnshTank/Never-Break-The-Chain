import { motion, useInView, type Variants } from 'framer-motion';
import { useRef } from 'react';
import { Users, Gauge, Lock, TrendingUp } from 'lucide-react';

interface Principle {
  title: string;
  description: string;
  icon: React.ElementType;
}

const principles: Principle[] = [
  {
    title: 'User-Centric Design',
    description: 'Every feature designed with the end user in mind, focusing on simplicity, effectiveness, and long-term engagement rather than superficial gamification.',
    icon: Users,
  },
  {
    title: 'Performance First',
    description: 'Built with performance as a primary concern, utilizing modern web technologies and best practices for fast loading times and smooth interactions.',
    icon: Gauge,
  },
  {
    title: 'Privacy & Security',
    description: 'User data protection is paramount, with comprehensive security measures including encryption, secure authentication, and minimal data collection.',
    icon: Lock,
  },
  {
    title: 'Scalability & Maintainability',
    description: 'Structured for long-term maintainability and scalability, with clean architecture patterns and comprehensive documentation.',
    icon: TrendingUp,
  },
];

const PhilosophySection = () => {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1] as const,
      },
    },
  };

  const quoteWords = "Design is not just what it looks like. Design is how it works.".split(' ');

  return (
    <section
      id="philosophy"
      ref={sectionRef}
      className="relative py-20 sm:py-28 lg:py-32 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-4xl mx-auto">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 font-mono text-sm text-[hsl(var(--pencil-gray))] mb-4">
            <span className="w-8 h-px bg-[hsl(var(--sketch-brown))]" />
            Core Values
            <span className="w-8 h-px bg-[hsl(var(--sketch-brown))]" />
          </span>
          <h2 className="font-handwritten text-4xl sm:text-5xl lg:text-6xl text-[hsl(var(--ink-blue))]">
            Development Philosophy
          </h2>
        </motion.div>

        {/* Quote block */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative mb-20 text-center"
        >
          {/* Large decorative quote marks */}
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-[120px] sm:text-[180px] font-serif text-[hsl(var(--ink-blue))] opacity-5 leading-none select-none">
            "
          </div>

          <blockquote className="relative z-10">
            <p className="font-handwritten text-2xl sm:text-3xl lg:text-4xl text-[hsl(var(--ink-blue))] leading-relaxed">
              {quoteWords.map((word, index) => (
                <motion.span
                  key={index}
                  initial={{ opacity: 0 }}
                  animate={isInView ? { opacity: 1 } : {}}
                  transition={{
                    duration: 0.3,
                    delay: 0.5 + index * 0.08,
                  }}
                  className="inline-block mr-2"
                >
                  {word}
                </motion.span>
              ))}
            </p>
          </blockquote>

          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 1.5 }}
            className="mt-6"
          >
            <div className="w-16 h-px bg-[hsl(var(--sketch-brown))] mx-auto" />
          </motion.div>
        </motion.div>

        {/* Principles grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid grid-cols-1 sm:grid-cols-2 gap-6"
        >
          {principles.map((principle, index) => {
            const Icon = principle.icon;
            return (
              <motion.div
                key={principle.title}
                variants={itemVariants}
                className="group"
              >
                <div className="sketch-card h-full bg-[hsl(var(--paper-cream))] hover:bg-[hsl(var(--paper-sepia))] transition-colors duration-300">
                  {/* Icon */}
                  <div className="mb-4">
                    <div className="w-10 h-10 rounded-lg bg-[hsl(var(--ink-blue))]/10 flex items-center justify-center group-hover:bg-[hsl(var(--ink-blue))]/20 transition-colors">
                      <Icon className="w-5 h-5 text-[hsl(var(--ink-blue))] group-hover:scale-110 transition-transform" />
                    </div>
                  </div>

                  {/* Content */}
                  <h3 className="font-handwritten text-xl sm:text-2xl text-[hsl(var(--ink-blue))] mb-2 group-hover:text-[hsl(var(--faded-blue))] transition-colors">
                    {principle.title}
                  </h3>
                  <p className="font-serif text-sm text-[hsl(var(--graphite))] leading-relaxed">
                    {principle.description}
                  </p>

                  {/* Decorative number */}
                  <div className="absolute bottom-3 right-3 font-handwritten text-4xl text-[hsl(var(--ink-blue))] opacity-10">
                    0{index + 1}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Bottom note */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 1 }}
          className="mt-16 text-center"
        >
          <div className="inline-block sketch-card py-4 px-8 bg-[hsl(var(--paper-sepia))]">
            <p className="font-handwritten text-lg text-[hsl(var(--ink-blue))]">
              "Guided by principles, driven by passion, built for impact."
            </p>
          </div>
        </motion.div>
      </div>

      {/* Background decorations */}
      <div className="absolute top-1/4 right-0 w-32 h-32 opacity-5 pointer-events-none">
        <svg viewBox="0 0 100 100" fill="hsl(var(--ink-blue))">
          <polygon points="50,10 90,90 10,90" />
        </svg>
      </div>
    </section>
  );
};

export default PhilosophySection;
