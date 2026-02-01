import { motion, useInView, type Variants } from 'framer-motion';
import { useRef } from 'react';
import { Quote } from 'lucide-react';

const StorySection = () => {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
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

  return (
    <section
      id="story"
      ref={sectionRef}
      className="relative py-20 sm:py-28 lg:py-32 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-6xl mx-auto">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center"
        >
          {/* Text content */}
          <div className="order-2 lg:order-1">
            <motion.div variants={itemVariants} className="mb-6">
              <span className="inline-flex items-center gap-2 font-mono text-sm text-[hsl(var(--pencil-gray))]">
                <span className="w-8 h-px bg-[hsl(var(--sketch-brown))]" />
                The Journey Begins
              </span>
            </motion.div>

            <motion.h2
              variants={itemVariants}
              className="font-handwritten text-4xl sm:text-5xl lg:text-6xl text-[hsl(var(--ink-blue))] mb-8"
            >
              The Story Behind
              <br />
              <span className="text-[hsl(var(--faded-blue))]">the Chain</span>
            </motion.h2>

            <motion.div variants={itemVariants} className="space-y-4 font-serif text-[hsl(var(--charcoal))] leading-relaxed">
              <p>
                As someone who struggled with maintaining consistency in personal development habits, 
                I recognized the need for a more intelligent and engaging approach to habit tracking. 
                Traditional habit trackers felt mechanical and failed to provide the motivation and 
                insights needed for long-term success.
              </p>
              <p>
                The breakthrough came with the development of the{' '}
                <span className="font-handwritten text-xl text-[hsl(var(--ink-blue))]">MNZD Methodology</span>
                {' '}— a holistic approach to personal development that focuses on four essential pillars 
                of daily growth and transformation.
              </p>
            </motion.div>

            {/* Quote block */}
            <motion.div
              variants={itemVariants}
              className="mt-8 relative"
            >
              <div className="sketch-card bg-[hsl(var(--paper-sepia))]">
                <Quote className="absolute -top-3 -left-3 w-8 h-8 text-[hsl(var(--ink-blue))] opacity-50" />
                <blockquote className="font-handwritten text-xl sm:text-2xl text-[hsl(var(--ink-blue))] italic pl-4">
                  "Traditional habit trackers felt mechanical and failed to provide 
                  the motivation needed for long-term success."
                </blockquote>
                <cite className="block mt-4 font-mono text-sm text-[hsl(var(--pencil-gray))] not-italic">
                  — Ansh Tank, Creator
                </cite>
              </div>
            </motion.div>
          </div>

          {/* Illustration */}
          <motion.div
            variants={itemVariants}
            className="order-1 lg:order-2 relative"
          >
            <div className="relative">
              {/* Main image */}
              <div className="relative z-10">
                <img
                  src="/images/story-illustration-about.jpg"
                  alt="Person reflecting on habits"
                  className="w-full h-auto rounded-sm shadow-sketch-lg"
                />
              </div>

              {/* Decorative elements */}
              <div className="absolute -top-4 -right-4 w-full h-full border-2 border-[hsl(var(--sketch-brown))] opacity-30 rounded-sm -z-0" />
              
              {/* Corner doodles */}
              <div className="absolute -bottom-6 -left-6 w-16 h-16">
                <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
                  <path
                    d="M32 8 L 36 28 L 56 32 L 36 36 L 32 56 L 28 36 L 8 32 L 28 28 Z"
                    stroke="hsl(var(--ink-blue))"
                    strokeWidth="2"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              {/* Small note */}
              <motion.div
                initial={{ opacity: 0, rotate: -5 }}
                animate={isInView ? { opacity: 1, rotate: -3 } : {}}
                transition={{ duration: 0.6, delay: 0.8 }}
                className="absolute -bottom-4 -right-4 bg-[hsl(var(--paper-cream))] border border-[hsl(var(--sketch-brown))] p-3 shadow-md rotate-3"
              >
                <p className="font-handwritten text-sm text-[hsl(var(--ink-blue))]">
                  "Every chain starts with a single link..."
                </p>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Background decoration */}
      <div className="absolute top-1/2 left-0 w-px h-32 bg-gradient-to-b from-transparent via-[hsl(var(--sketch-brown))] to-transparent opacity-20" />
    </section>
  );
};

export default StorySection;
