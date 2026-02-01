import { motion, useInView, type Variants } from 'framer-motion';
import { useRef } from 'react';
import { Code2, Database, Palette, Zap, Layers, Shield } from 'lucide-react';

interface TechItem {
  name: string;
  icon: React.ElementType;
  description: string;
}

const techStack: TechItem[] = [
  { name: 'Next.js', icon: Layers, description: 'React framework for production' },
  { name: 'TypeScript', icon: Code2, description: 'Type-safe development' },
  { name: 'MongoDB', icon: Database, description: 'Flexible document database' },
  { name: 'Tailwind CSS', icon: Palette, description: 'Utility-first styling' },
  { name: 'Framer Motion', icon: Zap, description: 'Smooth animations' },
  { name: 'JWT Auth', icon: Shield, description: 'Secure authentication' },
];

interface Feature {
  title: string;
  description: string;
}

const features: Feature[] = [
  {
    title: 'Advanced Notification System',
    description: 'Smart inactivity detection with contextual messaging and time-based notifications for morning motivation and evening check-ins.',
  },
  {
    title: 'Interactive Analytics Dashboard',
    description: 'GitHub-style contribution heatmaps, multi-chart visualizations, and real-time progress tracking with streak management.',
  },
  {
    title: 'Secure Authentication System',
    description: 'JWT-based authentication with automatic refresh, email verification with OTP, and multi-device session management.',
  },
  {
    title: 'Intelligent Progress Tracking',
    description: 'Color-coded progress indicators, streak calculation, pattern analysis, and export capabilities for data portability.',
  },
];

const TechSection = () => {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1] as const,
      },
    },
  };

  const featureVariants: Variants = {
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
      id="technology"
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
            Under the Hood
            <span className="w-8 h-px bg-[hsl(var(--sketch-brown))]" />
          </span>
          <h2 className="font-handwritten text-4xl sm:text-5xl lg:text-6xl text-[hsl(var(--ink-blue))] mb-4">
            Built with Technical
            <br />
            <span className="text-[hsl(var(--faded-blue))]">Excellence</span>
          </h2>
          <p className="font-serif text-lg text-[hsl(var(--graphite))] max-w-2xl mx-auto">
            Every line of code crafted with performance, security, and scalability in mind.
          </p>
        </motion.div>

        {/* Tech illustration */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-16 relative"
        >
          <div className="relative max-w-3xl mx-auto">
            <img
              src="/images/tech-illustration-about.jpg"
              alt="Technical illustration"
              className="w-full h-auto rounded-sm shadow-sketch"
            />
            {/* Code-like doodles overlay */}
            <div className="absolute top-4 left-4 font-mono text-xs text-[hsl(var(--ink-blue))] opacity-20">
              {'<'}Code{' />'}
            </div>
            <div className="absolute bottom-4 right-4 font-mono text-xs text-[hsl(var(--ink-blue))] opacity-20">
              {'{'} stack: 'modern' {'}'}
            </div>
          </div>
        </motion.div>

        {/* Tech stack badges */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="flex flex-wrap justify-center gap-4 mb-16"
        >
          {techStack.map((tech) => {
            const Icon = tech.icon;
            return (
              <motion.div
                key={tech.name}
                variants={itemVariants}
                className="group"
              >
                <div className="sketch-card py-3 px-5 bg-[hsl(var(--paper-cream))] hover:bg-[hsl(var(--paper-sepia))] flex items-center gap-3">
                  <Icon className="w-5 h-5 text-[hsl(var(--ink-blue))] group-hover:scale-110 transition-transform" />
                  <div>
                    <span className="font-handwritten text-lg text-[hsl(var(--ink-blue))]">
                      {tech.name}
                    </span>
                    <span className="block font-mono text-[10px] text-[hsl(var(--pencil-gray))]">
                      {tech.description}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Features grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              variants={featureVariants}
              custom={index}
              className="group"
            >
              <div className="sketch-card h-full bg-[hsl(var(--paper-cream))] hover:bg-[hsl(var(--paper-sepia))] transition-colors duration-300">
                {/* Feature number */}
                <div className="absolute -top-3 -right-3 w-8 h-8 bg-[hsl(var(--ink-blue))] text-[hsl(var(--paper-cream))] rounded-full flex items-center justify-center font-handwritten text-lg">
                  {index + 1}
                </div>

                <h3 className="font-handwritten text-xl sm:text-2xl text-[hsl(var(--ink-blue))] mb-3 group-hover:text-[hsl(var(--faded-blue))] transition-colors">
                  {feature.title}
                </h3>
                <p className="font-serif text-sm text-[hsl(var(--graphite))] leading-relaxed">
                  {feature.description}
                </p>

                {/* Decorative line */}
                <div className="mt-4 h-px bg-gradient-to-r from-[hsl(var(--sketch-brown))] to-transparent opacity-30" />
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6"
        >
          {[
            { value: '100%', label: 'TypeScript' },
            { value: 'PWA', label: 'Ready' },
            { value: 'WCAG', label: '2.1 Compliant' },
            { value: 'SEO', label: 'Optimized' },
          ].map((stat) => (
            <div
              key={stat.label}
              className="text-center p-4 border border-dashed border-[hsl(var(--sketch-brown))] opacity-60 hover:opacity-100 transition-opacity"
            >
              <div className="font-handwritten text-2xl sm:text-3xl text-[hsl(var(--ink-blue))]">
                {stat.value}
              </div>
              <div className="font-mono text-xs text-[hsl(var(--pencil-gray))] uppercase tracking-wider">
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Background decorations */}
      <div className="absolute bottom-0 left-0 w-48 h-48 opacity-5 pointer-events-none">
        <svg viewBox="0 0 100 100" fill="hsl(var(--ink-blue))">
          <rect x="10" y="10" width="80" height="80" rx="4" />
        </svg>
      </div>
    </section>
  );
};

export default TechSection;
