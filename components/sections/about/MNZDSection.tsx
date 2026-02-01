import { motion, useInView, type Variants } from 'framer-motion';
import { useRef } from 'react';
import { Brain, Apple, Dumbbell, Target } from 'lucide-react';

interface Pillar {
  letter: string;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ElementType;
  color: string;
}

const pillars: Pillar[] = [
  {
    letter: 'M',
    title: 'Meditation',
    subtitle: 'Mindfulness & Clarity',
    description: 'Cultivate mental clarity, emotional well-being, and present-moment awareness through daily mindfulness practice.',
    icon: Brain,
    color: 'hsl(var(--faded-blue))',
  },
  {
    letter: 'N',
    title: 'Nutrition',
    subtitle: 'Learning & Growth',
    description: 'Nourish your body with healthy habits and feed your mind with continuous learning and knowledge acquisition.',
    icon: Apple,
    color: 'hsl(var(--sketch-brown))',
  },
  {
    letter: 'Z',
    title: 'Zone',
    subtitle: 'Movement & Fitness',
    description: 'Enter the flow state through physical exercise, movement, and activities that energize your body.',
    icon: Dumbbell,
    color: 'hsl(var(--highlight-blue))',
  },
  {
    letter: 'D',
    title: 'Discipline',
    subtitle: 'Focus & Productivity',
    description: 'Build unwavering discipline through focused work, productivity systems, and consistent skill development.',
    icon: Target,
    color: 'hsl(var(--ink-blue))',
  },
];

const MNZDSection = () => {
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

  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 40, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1] as const,
      },
    },
  };

  const lineVariants: Variants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: {
      pathLength: 1,
      opacity: 1,
      transition: {
        duration: 1.5,
        ease: "easeInOut" as const,
      },
    },
  };

  return (
    <section
      id="methodology"
      ref={sectionRef}
      className="relative py-20 sm:py-28 lg:py-32 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 font-mono text-sm text-[hsl(var(--pencil-gray))] mb-4">
            <span className="w-8 h-px bg-[hsl(var(--sketch-brown))]" />
            The Framework
            <span className="w-8 h-px bg-[hsl(var(--sketch-brown))]" />
          </span>
          <h2 className="font-handwritten text-4xl sm:text-5xl lg:text-6xl text-[hsl(var(--ink-blue))] mb-4">
            The MNZD Methodology
          </h2>
          <p className="font-serif text-lg text-[hsl(var(--graphite))] max-w-2xl mx-auto">
            Four pillars of personal transformation, designed to create lasting change 
            through balanced daily practice.
          </p>
        </motion.div>

        {/* Pillar illustration */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-16 relative max-w-lg mx-auto"
        >
          <img
            src="/images/mnzd-icons-about.jpg"
            alt="MNZD Methodology Icons"
            className="w-full h-auto rounded-sm shadow-sketch"
          />
          {/* Decorative border */}
          <div className="absolute -inset-3 border-2 border-dashed border-[hsl(var(--sketch-brown))] opacity-30 rounded-sm" />
        </motion.div>

        {/* Pillar cards grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-8"
        >
          {pillars.map((pillar, index) => {
            const Icon = pillar.icon;
            return (
              <motion.div
                key={pillar.letter}
                variants={cardVariants}
                className="group relative"
              >
                <div className="sketch-card h-full bg-[hsl(var(--paper-cream))] hover:bg-[hsl(var(--paper-sepia))] transition-colors duration-300">
                  {/* Letter badge */}
                  <div
                    className="absolute -top-4 -left-4 w-12 h-12 rounded-full flex items-center justify-center font-handwritten text-2xl font-bold text-white shadow-md"
                    style={{ backgroundColor: pillar.color }}
                  >
                    {pillar.letter}
                  </div>

                  {/* Icon */}
                  <div className="mb-4 pt-4">
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:rotate-6"
                      style={{ backgroundColor: `${pillar.color}20` }}
                    >
                      <Icon
                        className="w-6 h-6"
                        style={{ color: pillar.color }}
                      />
                    </div>
                  </div>

                  {/* Content */}
                  <h3 className="font-handwritten text-2xl sm:text-3xl text-[hsl(var(--ink-blue))] mb-1">
                    {pillar.title}
                  </h3>
                  <p
                    className="font-mono text-xs uppercase tracking-wider mb-3"
                    style={{ color: pillar.color }}
                  >
                    {pillar.subtitle}
                  </p>
                  <p className="font-serif text-sm text-[hsl(var(--graphite))] leading-relaxed">
                    {pillar.description}
                  </p>

                  {/* Corner decoration */}
                  <div className="absolute bottom-3 right-3 w-6 h-6 opacity-20 group-hover:opacity-40 transition-opacity">
                    <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
                      <path
                        d="M12 4 L 14 10 L 20 12 L 14 14 L 12 20 L 10 14 L 4 12 L 10 10 Z"
                        stroke={pillar.color}
                        strokeWidth="1.5"
                        fill="none"
                      />
                    </svg>
                  </div>
                </div>

                {/* Connection line (for first 3 cards) */}
                {index < 3 && (
                  <svg
                    className="hidden lg:block absolute -right-4 top-1/2 w-8 h-px"
                    viewBox="0 0 32 2"
                    preserveAspectRatio="none"
                  >
                    <motion.path
                      d="M0 1 L 32 1"
                      stroke="hsl(var(--sketch-brown))"
                      strokeWidth="1"
                      strokeDasharray="4 4"
                      fill="none"
                      variants={lineVariants}
                      initial="hidden"
                      animate={isInView ? "visible" : "hidden"}
                      style={{ transitionDelay: `${0.5 + index * 0.2}s` }}
                    />
                  </svg>
                )}
              </motion.div>
            );
          })}
        </motion.div>

        {/* Bottom note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 1 }}
          className="mt-12 text-center"
        >
          <p className="font-handwritten text-xl text-[hsl(var(--ink-blue))]">
            "Balance across all four pillars creates unstoppable momentum."
          </p>
        </motion.div>
      </div>

      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-64 h-64 opacity-5 pointer-events-none">
        <svg viewBox="0 0 200 200" fill="hsl(var(--ink-blue))">
          <circle cx="100" cy="100" r="80" />
        </svg>
      </div>
    </section>
  );
};

export default MNZDSection;
