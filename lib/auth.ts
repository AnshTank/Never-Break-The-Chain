import GoogleProvider from "next-auth/providers/google"
import GitHubProvider from "next-auth/providers/github"
import CredentialsProvider from "next-auth/providers/credentials"
import { MongoClient } from "mongodb"
import bcrypt from "bcryptjs"

export const authOptions = {
  providers: [
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET ? [
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      })
    ] : []),
    ...(process.env.GITHUB_ID && process.env.GITHUB_SECRET ? [
      GitHubProvider({
        clientId: process.env.GITHUB_ID,
        clientSecret: process.env.GITHUB_SECRET,
      })
    ] : []),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          const client = new MongoClient(process.env.MONGODB_URL!)
          await client.connect()
          const db = client.db("journey-tracker")
          const users = db.collection("users")

          const user = await users.findOne({ email: credentials.email })
          if (!user) {
            await client.close()
            return null
          }

          const isPasswordValid = await bcrypt.compare(credentials.password, user.password)
          if (!isPasswordValid) {
            await client.close()
            return null
          }

          await client.close()
          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
          }
        } catch (error) {
          // console.error("Auth error:", error)
          return null
        }
      }
    })
  ],
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google" || account?.provider === "github") {
        try {
          const client = new MongoClient(process.env.MONGODB_URL!)
          await client.connect()
          const db = client.db("journey-tracker")
          const users = db.collection("users")

          const existingUser = await users.findOne({ email: user.email })
          
          if (!existingUser) {
            await users.insertOne({
              email: user.email,
              name: user.name,
              provider: account.provider,
              isNewUser: true,
              createdAt: new Date(),
              updatedAt: new Date()
            })
          }
          
          await client.close()
        } catch (error) {
          // console.error("OAuth user save error:", error)
        }
      }
      return true
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.name = token.name as string
        session.user.email = token.email as string
      }
      return session
    },
    async jwt({ token, user, account, trigger }) {
      if (user) {
        token.id = user.id
        token.name = user.name
        token.email = user.email
        
        // Default to session-based (8 hours) - remember me will be handled client-side
        token.exp = Math.floor(Date.now() / 1000) + (8 * 60 * 60) // 8 hours
        token.lastActivity = Math.floor(Date.now() / 1000)
      }
      
      // Update last activity on each request for session tracking
      if (token && trigger === 'update') {
        token.lastActivity = Math.floor(Date.now() / 1000)
      }
      
      return token
    },
  },
  session: {
    strategy: "jwt" as const,
    maxAge: 24 * 60 * 60, // 24 hours default, will be overridden by JWT callback
  },
}