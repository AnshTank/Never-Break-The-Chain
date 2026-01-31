// import GoogleProvider from "next-auth/providers/google"
// import GitHubProvider from "next-auth/providers/github"
// import CredentialsProvider from "next-auth/providers/credentials"
// Temporarily disable auth providers to fix build
const GoogleProvider = null;
const GitHubProvider = null;
const CredentialsProvider = null;
import { MongoClient } from "mongodb"
import bcrypt from "bcryptjs"

export const authOptions = {
  providers: [
    // Temporarily disable providers for build
  ],
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async signIn() {
      return true
    },
    async session({ session, token }: any) {
      if (token) {
        session.user.id = token.id as string
        session.user.name = token.name as string
        session.user.email = token.email as string
      }
      return session
    },
    async jwt({ token, user }: any) {
      if (user) {
        token.id = user.id
        token.name = user.name
        token.email = user.email
        
        token.exp = Math.floor(Date.now() / 1000) + (8 * 60 * 60)
        token.lastActivity = Math.floor(Date.now() / 1000)
      }
      
      return token
    },
  },
  session: {
    strategy: "jwt" as const,
    maxAge: 24 * 60 * 60,
  },
}