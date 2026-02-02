import type React from "react";
import type { Metadata } from "next";
// import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Toaster } from "sonner";
import AuthProvider from "../components/auth-provider";
import ConditionalFooter from "../components/conditional-footer";
import "./globals.css";
// import { Caveat, Merriweather, Space_Mono } from "next/font/google";

// Initialize enterprise features
if (typeof window === 'undefined') {
  import('@/lib/enterprise-init');
}

// Temporarily disabled Google Fonts for build
/*
const caveat = Caveat({
  subsets: ["latin"],
  variable: "--font-caveat",
});

const merriweather = Merriweather({
  weight: ["300", "400", "700", "900"],
  subsets: ["latin"],
  variable: "--font-merriweather",
});

const spaceMono = Space_Mono({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-space-mono",
});

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
  display: "swap",
});
const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
});
*/

export const metadata: Metadata = {
  title: {
    default: "Habit Tracker - Never Break The Chain by Ansh Tank | Best Free Habit Tracking App",
    template: "%s | Habit Tracker by Ansh Tank - Never Break The Chain",
  },
  description:
    "Best free habit tracker app by Ansh Tank from Parul University. Track daily habits, build streaks, and transform your life with MNZD methodology. Professional habit tracking application built with Next.js, TypeScript, and MongoDB. Never break the chain of success with this powerful productivity tool.",
  keywords: [
    // Primary Keywords
    "habit tracker",
    "habit tracker app",
    "free habit tracker",
    "best habit tracker",
    "daily habit tracker",
    "habit tracking app",
    "habit tracker online",
    "habit tracker web app",
    "habit tracker free",
    "habit tracker 2025",
    
    // Ansh Tank Keywords
    "Ansh Tank",
    "Ansh Tank habit tracker",
    "Ansh Tank Parul University",
    "Ansh Tank project",
    "Ansh Tank github",
    "Ansh Tank developer",
    "Ansh Tank portfolio",
    "Ansh Tank full stack developer",
    "Ansh Tank Next.js",
    "Ansh Tank TypeScript",
    "Ansh Tank MongoDB",
    "Ansh Tank web developer",
    "Ansh Tank software engineer",
    "Ansh Tank applications",
    "Ansh Tank coding projects",
    
    // University & Location
    "Parul University",
    "Parul University student",
    "Parul University project",
    "Parul University developer",
    "Gujarat developer",
    "India developer",
    
    // App-specific Keywords
    "Never Break The Chain",
    "MNZD methodology",
    "MNZD habit tracker",
    "consistency tracker",
    "streak tracker",
    "daily habits",
    "habit formation",
    "habit building",
    "habit chain",
    "don't break the chain",
    "Jerry Seinfeld method",
    "productivity tracker",
    "routine tracker",
    "goal tracker",
    "progress tracker",
    
    // Methodology Keywords
    "meditation tracker",
    "nutrition tracker",
    "exercise tracker",
    "discipline tracker",
    "mindfulness app",
    "fitness tracker",
    "wellness tracker",
    "health tracker",
    "lifestyle tracker",
    
    // Technical Keywords
    "Next.js app",
    "TypeScript application",
    "MongoDB app",
    "React habit tracker",
    "web application",
    "progressive web app",
    "PWA habit tracker",
    "responsive web app",
    
    // Behavioral & Psychology
    "behavioral change",
    "habit psychology",
    "atomic habits",
    "habit stacking",
    "behavioral psychology",
    "personal development",
    "self improvement",
    "life transformation",
    "success habits",
    "positive habits",
    "habit formation science",
    
    // Productivity Keywords
    "productivity app",
    "productivity system",
    "productivity tool",
    "time management",
    "goal achievement",
    "personal growth",
    "routine builder",
    "habit analytics",
    "streak counter",
    "daily routine",
    "morning routine",
    "evening routine",
    
    // Competitive Keywords
    "habitica alternative",
    "streaks app alternative",
    "way of life alternative",
    "productive alternative",
    "habit bull alternative",
    "loop habit tracker alternative",
    "strides alternative",
    "coach.me alternative",
    
    // Long-tail Keywords
    "how to track habits",
    "best way to build habits",
    "habit tracking for students",
    "free online habit tracker",
    "simple habit tracker",
    "effective habit tracker",
    "habit tracker with analytics",
    "habit tracker with streaks",
    "habit tracker with reminders",
    "habit tracker for productivity",
    "habit tracker for health",
    "habit tracker for fitness",
    "habit tracker for meditation",
    "habit tracker for learning",
  ],
  authors: [{ name: "Ansh Tank", url: "https://github.com/AnshTank" }],
  creator: "Ansh Tank - Full Stack Developer",
  publisher: "Ansh Tank",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://never-break-the-chain.vercel.app"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title:
      "Best Free Habit Tracker App - Never Break The Chain by Ansh Tank",
    description:
      "Professional habit tracker app by Ansh Tank from Parul University. Track daily habits, build streaks, and transform your life with MNZD methodology. Free online habit tracking application built with Next.js, TypeScript, and MongoDB.",
    url: "https://never-break-the-chain.vercel.app",
    siteName: "Habit Tracker by Ansh Tank - Never Break The Chain",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Best Free Habit Tracker App - Never Break The Chain by Ansh Tank from Parul University - Professional habit tracking application",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title:
      "Best Free Habit Tracker App - Never Break The Chain by Ansh Tank",
    description:
      "Professional habit tracker app by Ansh Tank from Parul University. Track daily habits, build streaks with MNZD methodology. Built with Next.js & TypeScript.",
    images: ["/og-image.png"],
    creator: "@AnshTank9",
    site: "@AnshTank9",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.json",
  verification: {
    google: "Aqx9NXcmzkZC__Sk0ldLYzihHFtIKKjokQtp7GWwHes",
  },
  category: "productivity",
  classification: "Best Free Habit Tracker App by Ansh Tank from Parul University",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="font-sans"
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link rel="dns-prefetch" href="https://vercel-insights.com" />
        <meta name="theme-color" content="#ffffff" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta
          name="apple-mobile-web-app-title"
          content="Never Break The Chain"
        />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#ffffff" />
        <meta name="msapplication-tap-highlight" content="no" />
        <meta
          name="application-name"
          content="Never Break The Chain by Ansh Tank"
        />
        <meta
          name="msapplication-tooltip"
          content="Best Free Habit Tracker by Ansh Tank"
        />
        <meta name="msapplication-starturl" content="/" />
        <meta name="msapplication-navbutton-color" content="#0070A0" />
        <meta name="msapplication-window" content="width=1024;height=768" />
        <meta name="HandheldFriendly" content="true" />
        <meta name="MobileOptimized" content="320" />
        <meta name="format-detection" content="telephone=no" />
      </head>
      <body className={`font-sans antialiased m-0 p-0`} suppressHydrationWarning>
        <AuthProvider>
          <div className="min-h-screen">
            <main className="w-full">{children}</main>
            <ConditionalFooter />
          </div>
        </AuthProvider>
        <Toaster richColors position="top-center" />
        <Analytics />
        <SpeedInsights />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "Habit Tracker - Never Break The Chain by Ansh Tank",
              description:
                "Best free habit tracker application by Ansh Tank from Parul University. Transform your life with MNZD methodology - Meditation, Nutrition, Zone (Exercise), and Discipline. Professional habit tracking app built with Next.js, TypeScript, and MongoDB for optimal performance and user experience.",
              url: "https://never-break-the-chain.vercel.app",
              applicationCategory: "HealthApplication",
              operatingSystem: "Web",
              browserRequirements: "Requires JavaScript. Requires HTML5.",
              softwareVersion: "1.0.0",
              datePublished: "2025-01-27",
              dateModified: "2025-01-27",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "USD",
                availability: "https://schema.org/InStock",
              },
              author: {
                "@type": "Person",
                name: "Ansh Tank",
                url: "https://github.com/AnshTank",
                sameAs: [
                  "https://github.com/AnshTank",
                  "https://linkedin.com/in/anshtank9",
                ],
                jobTitle: "Full Stack Developer",
                description:
                  "Full Stack Developer from Parul University specializing in Next.js, TypeScript, and MongoDB. Creator of Never Break The Chain habit tracking application and multiple web development projects.",
                affiliation: {
                  "@type": "EducationalOrganization",
                  name: "Parul University"
                }
              },
              creator: {
                "@type": "Person",
                name: "Ansh Tank",
                url: "https://github.com/AnshTank",
              },
              publisher: {
                "@type": "Person",
                name: "Ansh Tank",
                url: "https://github.com/AnshTank",
              },
              mainEntity: {
                "@type": "SoftwareApplication",
                name: "MNZD Methodology",
                description:
                  "A comprehensive approach to personal development focusing on four key pillars: Meditation (mindfulness), Nutrition (learning), Zone (exercise), and Discipline (focused work).",
              },
              keywords:
                "habit tracker, Ansh Tank, Ansh Tank Parul University, Ansh Tank project, Ansh Tank github, best habit tracker, free habit tracker, daily habit tracker, habit tracking app, MNZD methodology, Parul University, Parul University student, Parul University project, meditation tracker, nutrition tracker, exercise tracker, discipline habits, productivity app, Next.js, TypeScript, MongoDB, consistency tracker, streak tracker, Jerry Seinfeld method, don't break the chain, habit formation, behavioral change, personal development, routine builder, atomic habits, habit stacking, mindfulness app, fitness tracker, wellness tracker, success habits, life transformation, habit tracker online, habit tracker web app, habit tracker 2025, Ansh Tank developer, Ansh Tank portfolio, Ansh Tank full stack developer, Gujarat developer, India developer",
              inLanguage: "en-US",
              copyrightHolder: {
                "@type": "Person",
                name: "Ansh Tank",
              },
              copyrightYear: "2025",
              license: "https://never-break-the-chain.vercel.app/license",
            }),
          }}
        />
      </body>
    </html>
  );
}
