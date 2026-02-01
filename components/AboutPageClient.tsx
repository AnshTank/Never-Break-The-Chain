'use client'

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import HeroSection from '@/components/sections/about/HeroSection';
import StorySection from '@/components/sections/about/StorySection';
import MNZDSection from '@/components/sections/about/MNZDSection';
import TechSection from '@/components/sections/about/TechSection';
import PhilosophySection from '@/components/sections/about/PhilosophySection';
import ImpactSection from '@/components/sections/about/ImpactSection';
import AboutContactSection from '@/components/sections/about/AboutContactSection';

// Navigation component
const Navigation = () => {

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMobileMenuOpen(false); // Close mobile menu after navigation
  };

  const navItems = [
    { id: 'story', label: 'Story' },
    { id: 'methodology', label: 'MNZD' },
    { id: 'technology', label: 'Tech' },
    { id: 'philosophy', label: 'Philosophy' },
    { id: 'impact', label: 'Impact' },
    { id: 'contact', label: 'Contact' },
  ];

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 1.5 }}
      className="fixed top-0 left-0 right-0 z-50 px-4 py-4"
    >
      <div className="max-w-4xl mx-auto">
        <div className="sketch-card py-2 px-4 bg-[hsl(var(--paper-cream))]/90 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            {/* Back to Home Button */}
            <button
              onClick={() => window.location.href = '/'}
              className="flex items-center gap-2 font-handwritten text-sm sm:text-base text-[hsl(var(--vintage-gold))] hover:text-[hsl(var(--vintage-copper))] transition-colors font-bold"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="hidden sm:inline">Back to Home</span>
              <span className="sm:hidden">Home</span>
            </button>
            
            {/* Navigation Items - Desktop horizontal, Mobile 2-row grid */}
            <div className="flex-1 flex justify-center">
              <div className="hidden md:block">
                <ul className="flex gap-6">
                  {navItems.map((item) => (
                    <li key={item.id}>
                      <button
                        onClick={() => scrollToSection(item.id)}
                        className="font-handwritten text-base text-[hsl(var(--ink-blue))] hover:text-[hsl(var(--faded-blue))] transition-colors relative group"
                      >
                        {item.label}
                        <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[hsl(var(--ink-blue))] transition-all group-hover:w-full" />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
              
              {/* Mobile compact 2-row navigation */}
              <div className="md:hidden">
                <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 max-w-xs">
                  {navItems.map((item, index) => (
                    <div key={item.id} className="flex items-center">
                      <button
                        onClick={() => scrollToSection(item.id)}
                        className="font-handwritten text-base text-[hsl(var(--ink-blue))] hover:text-[hsl(var(--faded-blue))] transition-colors relative group px-1 py-0.5"
                      >
                        {item.label}
                        <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-[hsl(var(--ink-blue))] transition-all group-hover:w-full" />
                      </button>
                      {index < navItems.length - 1 && index % 3 === 2 && (
                        <span className="text-[hsl(var(--ink-blue))]/30 mx-1 text-xs">•</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Spacer for balance */}
            <div className="w-20 sm:w-24"></div>
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

// Progress indicator
const ScrollProgress = () => {
  useEffect(() => {
    const progressBar = document.getElementById('scroll-progress');
    
    const updateProgress = () => {
      if (progressBar) {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = (scrollTop / docHeight) * 100;
        progressBar.style.width = `${progress}%`;
      }
    };

    window.addEventListener('scroll', updateProgress);
    return () => window.removeEventListener('scroll', updateProgress);
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 z-[60] h-1 bg-transparent">
      <div
        id="scroll-progress"
        className="h-full bg-[hsl(var(--ink-blue))] transition-all duration-100"
        style={{ width: '0%' }}
      />
    </div>
  );
};

// Back to top button component
const BackToTop = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.2 }}
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-50 sketch-card p-3 bg-[hsl(var(--paper-cream))] hover:bg-[hsl(var(--paper-sepia))] transition-colors shadow-lg"
          aria-label="Back to top"
        >
          <svg
            className="w-5 h-5 text-[hsl(var(--ink-blue))]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 10l7-7m0 0l7 7m-7-7v18"
            />
          </svg>
        </motion.button>
      )}
    </AnimatePresence>
  );
};

export default function AboutPageClient() {
  // SEO meta tags update
  useEffect(() => {
    // Update document title
    document.title = 'About Never Break The Chain | Ansh Tank - Consistency Tracker';
    
    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 
        'Discover the story behind Never Break The Chain, a revolutionary habit tracking app by Ansh Tank. ' +
        'Built with Next.js, TypeScript, and the MNZD methodology for consistent personal growth.'
      );
    }

    // Add Open Graph tags
    const ogTags = [
      { property: 'og:title', content: 'About Never Break The Chain | Ansh Tank' },
      { property: 'og:description', content: 'A revolutionary habit tracking app built with the MNZD methodology.' },
      { property: 'og:type', content: 'website' },
    ];

    ogTags.forEach(({ property, content }) => {
      let tag = document.querySelector(`meta[property="${property}"]`);
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute('property', property);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', content);
    });

    // Add structured data
    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'Never Break The Chain',
      applicationCategory: 'HealthApplication',
      operatingSystem: 'Web',
      author: {
        '@type': 'Person',
        name: 'Ansh Tank',
        url: 'https://github.com/AnshTank',
        email: 'anshtank9@gmail.com',
      },
      description: 'A habit tracking application using the MNZD methodology for consistent personal growth.',
      datePublished: '2025-01-27',
      softwareVersion: '1.0.0',
    };

    let scriptTag = document.getElementById('structured-data') as HTMLScriptElement | null;
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.id = 'structured-data';
      scriptTag.type = 'application/ld+json';
      document.head.appendChild(scriptTag);
    }
    if (scriptTag) {
      scriptTag.textContent = JSON.stringify(structuredData);
    }
  }, []);

  return (
    <div className="min-h-screen bg-[hsl(var(--paper-cream))]">
      {/* Scroll progress bar */}
      <ScrollProgress />
      
      {/* Navigation */}
      <Navigation />
      
      {/* Main content */}
      <main className="pt-20">
        <HeroSection />
        <StorySection />
        <MNZDSection />
        <TechSection />
        <PhilosophySection />
        <ImpactSection />
        <AboutContactSection />
      </main>

      {/* Back to top button */}
      <BackToTop />
    </div>
  );
}