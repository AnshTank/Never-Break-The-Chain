import { motion, useInView, useMotionValue, useTransform, animate, type Variants } from 'framer-motion';
import { useRef, useEffect } from 'react';
import { Rocket, Users, Sparkles, Smartphone } from 'lucide-react';

interface RoadmapItem {
  title: string;
  description: string;
  icon: React.ElementType;
  status: 'planned' | 'in-progress' | 'completed';
}

const roadmap: RoadmapItem[] = [
  {
    title: 'AI-Powered Recommendations',
    description: 'Smart habit suggestions based on your patterns and goals.',
    icon: Sparkles,
    status: 'planned',
  },
  {
    title: 'Social Accountability',
    description: 'Connect with accountability partners and build together.',
    icon: Users,
    status: 'planned',
  },
  {
    title: 'Wearable Integration',
    description: 'Sync with fitness trackers and health apps seamlessly.',
    icon: Smartphone,
    status: 'planned',
  },
  {
    title: 'Mobile Applications',
    description: 'Native iOS and Android apps for on-the-go tracking.',
    icon: Rocket,
    status: 'planned',
  },
];

interface CounterProps {
  value: number;
  suffix?: string;
  label: string;
}

const Counter = ({ value, suffix = '', label }: CounterProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest));

  useEffect(() => {
    if (isInView) {
      const controls = animate(count, value, {
        duration: 2,
        ease: 'easeOut',
      });
      return controls.stop;
    }
  }, [isInView, value, count]);

  return (
    <div ref={ref} className="text-center">
      <div className="font-handwritten text-4xl sm:text-5xl text-[hsl(var(--ink-blue))]">
        <motion.span>{rounded}</motion.span>
        {suffix}
      </div>
      <div className="font-mono text-xs text-[hsl(var(--pencil-gray))] uppercase tracking-wider mt-1">
        {label}
      </div>
    </div>
  );
};

const ImpactSection = () => {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, x: -30 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1] as const,
      },
    },
  };

  return (
    <section
      id="impact"
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
            Looking Ahead
            <span className="w-8 h-px bg-[hsl(var(--sketch-brown))]" />
          </span>
          <h2 className="font-handwritten text-4xl sm:text-5xl lg:text-6xl text-[hsl(var(--ink-blue))] mb-4">
            Impact & Future Vision
          </h2>
          <p className="font-serif text-lg text-[hsl(var(--graphite))] max-w-2xl mx-auto">
            Building momentum today for an even brighter tomorrow.
          </p>
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20"
        >
          <div className="sketch-card py-6 bg-[hsl(var(--paper-cream))]">
            <Counter value={4} suffix="" label="Core Pillars" />
          </div>
          <div className="sketch-card py-6 bg-[hsl(var(--paper-cream))]">
            <Counter value={100} suffix="%" label="TypeScript" />
          </div>
          <div className="sketch-card py-6 bg-[hsl(var(--paper-cream))]">
            <Counter value={6} suffix="+" label="Tech Stack" />
          </div>
          <div className="sketch-card py-6 bg-[hsl(var(--paper-cream))]">
            <Counter value={2026} suffix="" label="Launch Year" />
          </div>
        </motion.div>

        {/* Impact statement */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-20"
        >
          <div className="sketch-card bg-[hsl(var(--paper-sepia))] text-center max-w-3xl mx-auto">
            <h3 className="font-handwritten text-2xl sm:text-3xl text-[hsl(var(--ink-blue))] mb-4">
              The Impact So Far
            </h3>
            <p className="font-serif text-[hsl(var(--charcoal))] leading-relaxed">
              Never Break The Chain has helped users build consistent daily habits across all four MNZD pillars, 
              achieve longer streaks through intelligent motivation systems, gain insights into their behavior patterns, 
              and develop a sustainable approach to personal development.
            </p>
          </div>
        </motion.div>

        {/* Roadmap */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mb-8"
        >
          <h3 className="font-handwritten text-2xl sm:text-3xl text-[hsl(var(--ink-blue))] text-center mb-8">
            Future Roadmap
          </h3>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="relative"
        >
          {/* Timeline line - separated from cards */}
          <div className="hidden md:block absolute left-1/2 top-8 bottom-8 w-0.5 bg-gradient-to-b from-[hsl(var(--sketch-brown))]/20 via-[hsl(var(--ink-blue))]/40 to-[hsl(var(--sketch-brown))]/20 -translate-x-1/2" />

          <div className="space-y-12">
            {roadmap.map((item, index) => {
              const Icon = item.icon;
              const isLeft = index % 2 === 0;

              return (
                <motion.div
                  key={item.title}
                  variants={itemVariants}
                  className={`relative md:grid md:grid-cols-2 md:gap-16 ${
                    isLeft ? '' : 'md:text-right'
                  }`}
                >
                  {/* Content */}
                  <div className={`${isLeft ? 'md:pr-8' : 'md:col-start-2 md:pl-8'}`}>
                    <div className="sketch-card bg-[hsl(var(--paper-cream))] hover:bg-[hsl(var(--paper-sepia))] transition-colors relative">
                      {/* Connector line to dot */}
                      <div className={`hidden md:block absolute top-1/2 -translate-y-1/2 w-8 h-0.5 bg-[hsl(var(--ink-blue))]/30 ${
                        isLeft ? '-right-8' : '-left-8'
                      }`} />
                      
                      <div className={`flex items-start gap-4 ${isLeft ? '' : 'md:flex-row-reverse'}`}>
                        <div className="w-12 h-12 rounded-xl bg-[hsl(var(--ink-blue))]/10 flex items-center justify-center flex-shrink-0 border border-[hsl(var(--ink-blue))]/20">
                          <Icon className="w-6 h-6 text-[hsl(var(--ink-blue))]" />
                        </div>
                        <div className={`${isLeft ? '' : 'md:text-right'}`}>
                          <h4 className="font-handwritten text-xl text-[hsl(var(--ink-blue))] mb-2">
                            {item.title}
                          </h4>
                          <p className="font-serif text-sm text-[hsl(var(--graphite))] leading-relaxed">
                            {item.description}
                          </p>
                          <span className="inline-block mt-3 px-3 py-1 text-[10px] font-mono uppercase tracking-wider bg-[hsl(var(--sketch-brown))]/10 text-[hsl(var(--sketch-brown))] rounded-full border border-[hsl(var(--sketch-brown))]/20">
                            {item.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Timeline dot - enhanced */}
                  <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-[hsl(var(--ink-blue))] rounded-full border-4 border-[hsl(var(--paper-cream))] shadow-lg">
                    <div className="w-2 h-2 bg-[hsl(var(--paper-cream))] rounded-full m-auto" />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Closing statement */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 1.2 }}
          className="mt-16 text-center"
        >
          <p className="font-handwritten text-xl text-[hsl(var(--ink-blue))]">
            "The best time to start was yesterday. The second best time is now."
          </p>
        </motion.div>
      </div>

      {/* Background decorations */}
      <div className="absolute bottom-0 right-0 w-48 h-48 opacity-5 pointer-events-none">
        <svg viewBox="0 0 100 100" fill="hsl(var(--ink-blue))">
          <circle cx="50" cy="50" r="40" />
        </svg>
      </div>
    </section>
  );
};

export default ImpactSection;
