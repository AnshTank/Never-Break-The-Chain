import { motion, useInView, type Variants } from 'framer-motion';
import { useRef } from 'react';
import { Github, Linkedin, Mail, Heart, ExternalLink } from 'lucide-react';

interface SocialLink {
  name: string;
  url: string;
  icon: React.ElementType;
}

const socialLinks: SocialLink[] = [
  {
    name: 'GitHub',
    url: 'https://github.com/AnshTank',
    icon: Github,
  },
  {
    name: 'LinkedIn',
    url: 'https://linkedin.com/in/anshtank9',
    icon: Linkedin,
  },
  {
    name: 'Email',
    url: 'mailto:anshtank9@gmail.com',
    icon: Mail,
  },
];

const AboutContactSection = () => {
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
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1] as const,
      },
    },
  };

  return (
    <section
      id="contact"
      ref={sectionRef}
      className="relative py-20 sm:py-28 lg:py-32 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-4xl mx-auto">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="inline-flex items-center gap-2 font-mono text-sm text-[hsl(var(--pencil-gray))] mb-4">
            <span className="w-8 h-px bg-[hsl(var(--sketch-brown))]" />
            Get in Touch
            <span className="w-8 h-px bg-[hsl(var(--sketch-brown))]" />
          </span>
          <h2 className="font-handwritten text-4xl sm:text-5xl lg:text-6xl text-[hsl(var(--ink-blue))] mb-4">
            Let's Connect
          </h2>
          <p className="font-serif text-lg text-[hsl(var(--graphite))] max-w-xl mx-auto">
            Interested in collaborating or have questions about Never Break The Chain? 
            I'd love to hear from you.
          </p>
        </motion.div>

        {/* Contact card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative mb-16"
        >
          <div className="sketch-card bg-[hsl(var(--paper-cream))] text-center max-w-2xl mx-auto">
            {/* Decorative elements */}
            <div className="absolute -top-4 -left-4 w-8 h-8">
              <svg viewBox="0 0 32 32" fill="none" className="w-full h-full">
                <path
                  d="M16 4 L 18 14 L 28 16 L 18 18 L 16 28 L 14 18 L 4 16 L 14 14 Z"
                  stroke="hsl(var(--ink-blue))"
                  strokeWidth="2"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div className="absolute -bottom-4 -right-4 w-8 h-8">
              <svg viewBox="0 0 32 32" fill="none" className="w-full h-full">
                <circle
                  cx="16"
                  cy="16"
                  r="10"
                  stroke="hsl(var(--sketch-brown))"
                  strokeWidth="2"
                  fill="none"
                />
              </svg>
            </div>

            <h3 className="font-handwritten text-2xl sm:text-3xl text-[hsl(var(--ink-blue))] mb-4">
              Start a Conversation
            </h3>
            <p className="font-serif text-[hsl(var(--graphite))] mb-8">
              Whether you're interested in collaboration, have feedback, or just want to say hello — 
              my inbox is always open.
            </p>

            {/* CTA Button */}
            <motion.a
              href="/about-contact"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center gap-2 sketch-button"
            >
              <Mail className="w-5 h-5" />
              Get in Touch
            </motion.a>
          </div>
        </motion.div>

        {/* Social links */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="flex justify-center gap-6 mb-16"
        >
          {socialLinks.map((link) => {
            const Icon = link.icon;
            return (
              <motion.a
                key={link.name}
                variants={itemVariants}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative"
                aria-label={link.name}
              >
                <div className="sketch-card p-4 bg-[hsl(var(--paper-cream))] hover:bg-[hsl(var(--paper-sepia))] transition-colors">
                  <Icon className="w-6 h-6 text-[hsl(var(--ink-blue))] group-hover:scale-110 transition-transform" />
                  <ExternalLink className="absolute top-1 right-1 w-3 h-3 text-[hsl(var(--pencil-gray))] opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 font-mono text-xs text-[hsl(var(--pencil-gray))] opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  {link.name}
                </span>
              </motion.a>
            );
          })}
        </motion.div>

        {/* Project link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-center mb-12"
        >
          <a
            href="https://github.com/AnshTank/Never-Break-The-Chain"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-[hsl(var(--ink-blue))] hover:text-[hsl(var(--faded-blue))] transition-colors font-mono text-sm"
          >
            <Github className="w-4 h-4" />
            View Project on GitHub
            <ExternalLink className="w-3 h-3" />
          </a>
        </motion.div>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center pt-8 border-t border-dashed border-[hsl(var(--sketch-brown))] opacity-60"
        >
          <p className="font-handwritten text-lg text-[hsl(var(--ink-blue))] mb-2">
            Never Break The Chain
          </p>
          <p className="font-mono text-xs text-[hsl(var(--pencil-gray))] flex items-center justify-center gap-1">
            Built with <Heart className="w-3 h-3 text-[hsl(var(--ruler-red))] fill-current" /> by Ansh Tank
          </p>
          <p className="font-mono text-[10px] text-[hsl(var(--pencil-gray))] mt-2">
            January 2026
          </p>
        </motion.footer>
      </div>

      {/* Background decorations */}
      <div className="absolute top-1/4 left-0 w-24 h-24 opacity-5 pointer-events-none">
        <svg viewBox="0 0 100 100" fill="hsl(var(--ink-blue))">
          <path d="M20 50 Q 50 20, 80 50 Q 50 80, 20 50" />
        </svg>
      </div>
      <div className="absolute bottom-1/4 right-0 w-32 h-32 opacity-5 pointer-events-none">
        <svg viewBox="0 0 100 100" fill="hsl(var(--ink-blue))">
          <polygon points="50,10 90,30 90,70 50,90 10,70 10,30" />
        </svg>
      </div>
    </section>
  );
};

export default AboutContactSection;