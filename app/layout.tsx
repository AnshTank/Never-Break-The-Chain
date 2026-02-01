import type React from "react";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Toaster } from "sonner";
import AuthProvider from "../components/auth-provider";
import ConditionalFooter from "../components/conditional-footer";
import "./globals.css";
import { Caveat, Merriweather, Space_Mono } from "next/font/google";

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

export const metadata: Metadata = {
  title: {
    default: "Never Break The Chain - MNZD Habit Tracker by Ansh Tank",
    template: "%s | Never Break The Chain - Ansh Tank",
  },
  description:
    "Transform your life with MNZD methodology by Ansh Tank - Meditation, Nutrition, Zone (Exercise), and Discipline. Professional habit tracker and consistency tracker built with Next.js, TypeScript, and MongoDB. Track daily habits, build streaks, and never break the chain of success.",
  keywords: [
    "Ansh Tank",
    "habit tracker",
    "consistency tracker",
    "MNZD methodology",
    "meditation app",
    "nutrition tracker",
    "exercise tracker",
    "discipline habits",
    "productivity app",
    "streak tracker",
    "daily habits",
    "personal development",
    "Next.js app",
    "TypeScript",
    "MongoDB",
    "habit formation",
    "behavioral change",
    "self improvement",
    "goal tracking",
    "routine builder",
    "consistency tracker",
    "habit chain",
    "daily consistency",
    "progress tracking",
    "Jerry Seinfeld method",
    "don't break the chain",
    "habit building app",
    "daily routine tracker",
    "mindfulness app",
    "fitness tracker",
    "productivity system",
    "habit analytics",
    "streak counter",
    "behavioral psychology",
    "atomic habits",
    "habit stacking",
    "routine optimization",
    "personal growth",
    "life transformation",
    "wellness tracker",
    "success habits",
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
      "Never Break The Chain - MNZD Habit & Consistency Tracker by Ansh Tank",
    description:
      "Professional habit and consistency tracking app by Ansh Tank. Transform your life with MNZD methodology - Meditation, Nutrition, Zone (Exercise), and Discipline. Built with Next.js, TypeScript, and MongoDB for optimal performance.",
    url: "https://never-break-the-chain.vercel.app",
    siteName: "Never Break The Chain by Ansh Tank",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Never Break The Chain - MNZD Habit & Consistency Tracker by Ansh Tank - Professional habit tracking application",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title:
      "Never Break The Chain - MNZD Habit & Consistency Tracker by Ansh Tank",
    description:
      "Professional habit and consistency tracking app by Ansh Tank. Transform your life with MNZD methodology. Built with Next.js & TypeScript.",
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
  classification: "Productivity & Personal Development App by Ansh Tank",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geist.variable} ${geistMono.variable} ${caveat.variable} ${merriweather.variable} ${spaceMono.variable}`}
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
          content="MNZD Habit Tracker by Ansh Tank"
        />
        <meta name="msapplication-starturl" content="/" />
        <meta name="msapplication-navbutton-color" content="#0070A0" />
        <meta name="msapplication-window" content="width=1024;height=768" />
        <meta name="HandheldFriendly" content="true" />
        <meta name="MobileOptimized" content="320" />
        <meta name="format-detection" content="telephone=no" />
      </head>
      <body className={`font-sans antialiased m-0 p-0`}>
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
              name: "Never Break The Chain - MNZD Habit Tracker",
              description:
                "Professional habit tracking application by Ansh Tank. Transform your life with MNZD methodology - Meditation, Nutrition, Zone (Exercise), and Discipline. Built with Next.js, TypeScript, and MongoDB.",
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
                  "Full Stack Developer specializing in Next.js, TypeScript, and MongoDB. Creator of Never Break The Chain habit tracking application.",
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
                "Ansh Tank, habit tracker, MNZD methodology, meditation app, nutrition tracker, exercise tracker, discipline habits, productivity app, Next.js, TypeScript, MongoDB, consistency tracker, daily habits, streak tracker, Jerry Seinfeld method, don't break the chain, habit formation, behavioral change, personal development, routine builder, atomic habits, habit stacking, mindfulness app, fitness tracker, wellness tracker, success habits, life transformation",
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
