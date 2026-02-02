import { MongoClient } from 'mongodb'

if (!process.env.MONGODB_URL) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URL"')
}

const uri = process.env.MONGODB_URL
const options = {
  maxPoolSize: 50, // Maintain up to 50 socket connections
  serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
  maxIdleTimeMS: 30000, // Close connections after 30 seconds of inactivity
  minPoolSize: 5, // Maintain minimum 5 connections
}

let client: MongoClient
let clientPromise: Promise<MongoClient>

if (process.env.NODE_ENV === 'development') {
  let globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>
  }

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options)
    globalWithMongo._mongoClientPromise = client.connect()
  }
  clientPromise = globalWithMongo._mongoClientPromise
} else {
  client = new MongoClient(uri, options)
  clientPromise = client.connect()
}

// Connection pool monitoring
let isConnected = false

export async function connectToDatabase() {
  try {
    const client = await clientPromise
    if (!isConnected) {
      isConnected = true
      console.log('MongoDB connected with optimized pool')
    }
    const db = client.db('journey-tracker')
    return { client, db }
  } catch (error) {
    console.error('MongoDB connection failed:', error)
    throw error
  }
}

export default clientPromise