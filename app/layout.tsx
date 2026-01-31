import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Toaster } from "sonner"
import AuthProvider from "../components/auth-provider"
import ConditionalFooter from "../components/conditional-footer"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Never Break the Chain",
  description: "Showing up daily, even on bad days.",
  icons: {
    icon: "/favicon.svg",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased m-0 p-0`}>
        <AuthProvider>
          <div className="min-h-screen">
            <main className="w-full">
              {children}
            </main>
            <ConditionalFooter />
          </div>
        </AuthProvider>
        <Toaster richColors position="top-center" />
        <Analytics />
      </body>
    </html>
  )
}
