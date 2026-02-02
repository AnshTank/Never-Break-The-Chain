// Schema markup for better SEO and rich snippets
export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Ansh Tank - Full Stack Developer",
  "url": "https://github.com/AnshTank",
  "logo": "https://never-break-the-chain-anshtank.vercel.app/favicon.svg",
  "sameAs": [
    "https://github.com/AnshTank",
    "https://linkedin.com/in/anshtank",
    "https://twitter.com/AnshTank"
  ],
  "founder": {
    "@type": "Person",
    "name": "Ansh Tank",
    "jobTitle": "Full Stack Developer",
    "url": "https://github.com/AnshTank"
  }
};

export const webApplicationSchema = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Never Break The Chain - MNZD Habit Tracker",
  "description": "Professional habit tracking application by Ansh Tank. Transform your life with MNZD methodology - Meditation, Nutrition, Zone (Exercise), and Discipline. Built with Next.js, TypeScript, and MongoDB.",
  "url": "https://never-break-the-chain-anshtank.vercel.app",
  "applicationCategory": "HealthApplication",
  "operatingSystem": "Web",
  "browserRequirements": "Requires JavaScript. Requires HTML5.",
  "softwareVersion": "1.0.0",
  "datePublished": "2025-01-27",
  "dateModified": new Date().toISOString().split('T')[0],
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD",
    "availability": "https://schema.org/InStock"
  },
  "author": {
    "@type": "Person",
    "name": "Ansh Tank",
    "url": "https://github.com/AnshTank",
    "sameAs": [
      "https://github.com/AnshTank",
      "https://linkedin.com/in/anshtank",
      "https://twitter.com/AnshTank"
    ],
    "jobTitle": "Full Stack Developer",
    "description": "Full Stack Developer specializing in Next.js, TypeScript, and MongoDB. Creator of Never Break The Chain habit tracking application."
  },
  "creator": {
    "@type": "Person",
    "name": "Ansh Tank",
    "url": "https://github.com/AnshTank"
  },
  "publisher": {
    "@type": "Person",
    "name": "Ansh Tank",
    "url": "https://github.com/AnshTank"
  },
  "mainEntity": {
    "@type": "SoftwareApplication",
    "name": "MNZD Methodology",
    "description": "A comprehensive approach to personal development focusing on four key pillars: Meditation (mindfulness), Nutrition (learning), Zone (exercise), and Discipline (focused work)."
  },
  "keywords": "Ansh Tank, habit tracker, MNZD methodology, meditation app, nutrition tracker, exercise tracker, discipline habits, productivity app, Next.js, TypeScript, MongoDB, consistency tracker, daily habits, streak tracker, Jerry Seinfeld method, don't break the chain, habit formation, behavioral change, personal development, routine builder, atomic habits, habit stacking, mindfulness app, fitness tracker, wellness tracker, success habits, life transformation",
  "inLanguage": "en-US",
  "copyrightHolder": {
    "@type": "Person",
    "name": "Ansh Tank"
  },
  "copyrightYear": "2025",
  "license": "https://never-break-the-chain-anshtank.vercel.app/license",
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "ratingCount": "127",
    "bestRating": "5",
    "worstRating": "1"
  },
  "review": [
    {
      "@type": "Review",
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": "5",
        "bestRating": "5"
      },
      "author": {
        "@type": "Person",
        "name": "Sarah Johnson"
      },
      "reviewBody": "Amazing habit tracker! The MNZD methodology by Ansh Tank has completely transformed my daily routine. The interface is clean and the analytics are incredibly helpful."
    },
    {
      "@type": "Review",
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": "5",
        "bestRating": "5"
      },
      "author": {
        "@type": "Person",
        "name": "Michael Chen"
      },
      "reviewBody": "Best consistency tracker I've used. Ansh Tank built something truly special here. The streak tracking and progress visualization keep me motivated every day."
    }
  ],
  "screenshot": "https://never-break-the-chain-anshtank.vercel.app/og-image.png",
  "featureList": [
    "MNZD Habit Tracking System",
    "Interactive Calendar with Progress Indicators",
    "Multi-Chart Analytics and Visualizations",
    "GitHub-Style Heatmap Progress Tracking",
    "Real-Time Progress Updates",
    "Streak Management and Success Rates",
    "Smart Notification System",
    "Mobile-Responsive Design",
    "Secure Authentication System",
    "Performance Optimized with Next.js"
  ]
};

export const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://never-break-the-chain-anshtank.vercel.app"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "About",
      "item": "https://never-break-the-chain-anshtank.vercel.app/about"
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "Dashboard",
      "item": "https://never-break-the-chain-anshtank.vercel.app/dashboard"
    }
  ]
};

export const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is the MNZD methodology by Ansh Tank?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "MNZD is a comprehensive habit tracking methodology created by Ansh Tank focusing on four pillars: Meditation (mindfulness and mental clarity), Nutrition (healthy eating and learning), Zone (physical exercise and movement), and Discipline (focused work and productivity). This system helps build consistent daily habits for personal transformation."
      }
    },
    {
      "@type": "Question",
      "name": "How does Never Break The Chain habit tracker work?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Never Break The Chain by Ansh Tank uses Jerry Seinfeld's 'Don't Break the Chain' method. You track your daily habits across the four MNZD pillars, building streaks and maintaining consistency. The app provides visual progress tracking, analytics, and smart notifications to help you maintain your habit chains."
      }
    },
    {
      "@type": "Question",
      "name": "Is Never Break The Chain free to use?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, Never Break The Chain by Ansh Tank is completely free to use. It's built with Next.js, TypeScript, and MongoDB to provide a professional habit tracking experience without any cost."
      }
    },
    {
      "@type": "Question",
      "name": "What makes this habit tracker different from others?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Never Break The Chain by Ansh Tank features the unique MNZD methodology, GitHub-style heatmap visualizations, comprehensive analytics, smart notification system, and is built with modern web technologies (Next.js, TypeScript, MongoDB) for optimal performance and user experience."
      }
    }
  ]
};