import AboutPageClient from '@/components/AboutPageClient';

export const metadata = {
  title: 'About Never Break The Chain | Ansh Tank - Consistency Tracker Creator',
  description: 'Discover the story behind Never Break The Chain, a revolutionary habit tracking app by Ansh Tank. Built with Next.js, TypeScript, and the innovative MNZD methodology for personal transformation through consistent daily habits.',
  keywords: 'Ansh Tank, Never Break The Chain, MNZD methodology, habit tracker creator, consistency tracker, personal development, Next.js developer, TypeScript, MongoDB, habit formation, behavioral psychology, productivity system',
  openGraph: {
    title: 'About Never Break The Chain | Ansh Tank - Habit Tracker Creator',
    description: 'Meet Ansh Tank, creator of Never Break The Chain - a revolutionary habit tracking app built with the MNZD methodology for personal transformation.',
    type: 'website',
    url: 'https://never-break-the-chain-anshtank.vercel.app/about',
    images: [{
      url: '/og-image.png',
      width: 1200,
      height: 630,
      alt: 'About Never Break The Chain by Ansh Tank - MNZD Habit Tracker Creator'
    }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About Never Break The Chain | Ansh Tank',
    description: 'Meet the creator of the revolutionary MNZD habit tracking methodology.',
    images: ['/og-image.png']
  },
  alternates: {
    canonical: '/about'
  }
};

export default function AboutPage() {
  return <AboutPageClient />;
}