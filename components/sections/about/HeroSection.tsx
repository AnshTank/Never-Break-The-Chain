import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const HeroSection = () => {
  const scrollToStory = () => {
    const storySection = document.getElementById('story');
    if (storySection) {
      storySection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Decorative corner doodles */}
      <div className="absolute top-8 left-8 w-16 h-16 opacity-30">
        <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
          <path
            d="M8 8 Q 32 4, 56 8 Q 60 32, 56 56 Q 32 60, 8 56 Q 4 32, 8 8"
            stroke="hsl(var(--ink-blue))"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />
          <circle cx="16" cy="16" r="3" fill="hsl(var(--ink-blue))" opacity="0.5" />
          <circle cx="48" cy="48" r="2" fill="hsl(var(--ink-blue))" opacity="0.3" />
        </svg>
      </div>
      <div className="absolute top-12 right-12 w-12 h-12 opacity-20">
        <svg viewBox="0 0 48 48" fill="none" className="w-full h-full">
          <path
            d="M24 4 L 28 20 L 44 24 L 28 28 L 24 44 L 20 28 L 4 24 L 20 20 Z"
            stroke="hsl(var(--ink-blue))"
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <div className="absolute bottom-20 left-16 w-10 h-10 opacity-25">
        <svg viewBox="0 0 40 40" fill="none" className="w-full h-full">
          <path
            d="M20 4 L 24 16 L 36 20 L 24 24 L 20 36 L 16 24 L 4 20 L 16 16 Z"
            stroke="hsl(var(--sketch-brown))"
            strokeWidth="1.5"
            fill="none"
          />
        </svg>
      </div>

      {/* Main content */}
      <div className="relative z-10 text-center max-w-4xl mx-auto">
        {/* Date badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-6"
        >
          <span className="inline-block px-4 py-1 border border-[hsl(var(--sketch-brown))] rounded-full text-sm font-mono text-[hsl(var(--pencil-gray))]">
            January 2026
          </span>
        </motion.div>

        {/* Main title with sketch animation */}
        <motion.h1
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="font-handwritten text-6xl sm:text-7xl md:text-8xl lg:text-9xl text-[hsl(var(--ink-blue))] leading-none mb-4"
        >
          Never Break
          <br />
          <span className="relative inline-block">
            The Chain
            <motion.svg
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1, delay: 1 }}
              className="absolute -bottom-2 left-0 w-full h-4"
              viewBox="0 0 200 16"
              preserveAspectRatio="none"
            >
              <motion.path
                d="M0 8 Q 50 2, 100 8 T 200 8"
                stroke="hsl(var(--ink-blue))"
                strokeWidth="3"
                fill="none"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.8, delay: 1.2 }}
              />
            </motion.svg>
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="font-serif text-lg sm:text-xl md:text-2xl text-[hsl(var(--graphite))] mt-8 mb-4"
        >
          A habit tracking journey by{' '}
          <span className="font-handwritten text-2xl sm:text-3xl text-[hsl(var(--ink-blue))]">
            Ansh Tank
          </span>
        </motion.p>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1 }}
          className="font-mono text-sm text-[hsl(var(--pencil-gray))] tracking-wider"
        >
          Consistency Tracker &middot; MNZD Methodology
        </motion.p>

        {/* Hero illustration */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="mt-12 relative"
        >
          <div className="relative max-w-2xl mx-auto">
            <img
              src="/images/hero-sketch-about.jpg"
              alt="Chain illustration"
              className="w-full h-auto rounded-sm shadow-sketch"
            />
            {/* Decorative frame */}
            <div className="absolute -inset-3 border-2 border-[hsl(var(--ink-blue))] opacity-20 rounded-sm pointer-events-none" />
          </div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.button
        onClick={scrollToStory}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-[hsl(var(--pencil-gray))] hover:text-[hsl(var(--ink-blue))] transition-colors cursor-pointer"
      >
        <span className="font-mono text-xs tracking-wider">Explore the story</span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronDown className="w-5 h-5" />
        </motion.div>
      </motion.button>

      {/* Background decorative elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Ink splatter decorations */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.1 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="absolute top-1/4 right-1/4 w-32 h-32"
        >
          <svg viewBox="0 0 100 100" fill="hsl(var(--ink-blue))">
            <circle cx="50" cy="50" r="8" />
            <circle cx="35" cy="45" r="4" />
            <circle cx="60" cy="40" r="5" />
            <circle cx="55" cy="60" r="3" />
            <circle cx="40" cy="55" r="2" />
          </svg>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.08 }}
          transition={{ duration: 1, delay: 0.7 }}
          className="absolute bottom-1/3 left-1/5 w-24 h-24"
        >
          <svg viewBox="0 0 100 100" fill="hsl(var(--sketch-brown))">
            <circle cx="50" cy="50" r="6" />
            <circle cx="30" cy="50" r="3" />
            <circle cx="65" cy="35" r="4" />
            <circle cx="55" cy="70" r="2" />
          </svg>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
