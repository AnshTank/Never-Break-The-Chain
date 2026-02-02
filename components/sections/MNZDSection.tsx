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

  return (
    <section
      id="methodology"
      ref={sectionRef}
      className="relative py-20 sm:py-28 lg:py-32 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl lg:text-6xl text-slate-900 mb-4 font-bold">
            The MNZD Methodology
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Four pillars of personal transformation, designed to create lasting change 
            through balanced daily practice.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-8"
        >
          {pillars.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <motion.div
                key={pillar.letter}
                variants={cardVariants}
                className="group relative bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-all duration-300"
              >
                <div
                  className="absolute -top-4 -left-4 w-12 h-12 rounded-full flex items-center justify-center font-bold text-2xl text-white shadow-md"
                  style={{ backgroundColor: pillar.color }}
                >
                  {pillar.letter}
                </div>

                <div className="mb-4 pt-4">
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${pillar.color}20` }}
                  >
                    <Icon
                      className="w-6 h-6"
                      style={{ color: pillar.color }}
                    />
                  </div>
                </div>

                <h3 className="text-2xl sm:text-3xl text-slate-900 mb-1 font-bold">
                  {pillar.title}
                </h3>
                <p
                  className="text-xs uppercase tracking-wider mb-3 font-medium"
                  style={{ color: pillar.color }}
                >
                  {pillar.subtitle}
                </p>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {pillar.description}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};

export default MNZDSection;