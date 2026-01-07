import { connectToDatabase } from './mongodb'
import { UserSettings, DailyProgress, MNZDConfig, DEFAULT_MNZD_CONFIGS, TaskProgress } from './models-new'

export class DatabaseService {
  
  static async getUserSettings(userId: string): Promise<UserSettings | null> {
    const { db } = await connectToDatabase()
    
    // console.log('getUserSettings called for userId:', userId)
    
    // Ensure unique index exists
    try {
      await db.collection('userSettings').createIndex(
        { userId: 1 }, 
        { unique: true, background: true }
      )
    } catch (err) {
      // Index might already exist, ignore error
    }
    
    let settings = await db.collection<UserSettings>('userSettings').findOne({ userId })
    // console.log('Found existing settings:', !!settings)
    
    if (!settings) {
      // console.log('Creating new user settings for:', userId)
      const defaultSettings: UserSettings = {
        userId,
        mnzdConfigs: DEFAULT_MNZD_CONFIGS,
        newUser: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
      
      try {
        await db.collection<UserSettings>('userSettings').insertOne(defaultSettings)
        // console.log('Successfully created new user settings')
        return defaultSettings
      } catch (err: any) {
        // console.log('Error creating user settings:', err.code, err.message)
        // If duplicate key error, fetch the existing document
        if (err.code === 11000) {
          settings = await db.collection<UserSettings>('userSettings').findOne({ userId })
          // console.log('Retrieved existing settings after duplicate error')
          return settings
        } else {
          throw err
        }
      }
    }
    
    return settings
  }

  static async updateUserSettings(userId: string, updates: Partial<UserSettings>): Promise<void> {
    const { db } = await connectToDatabase()
    
    // console.log('updateUserSettings called for userId:', userId, 'with updates:', Object.keys(updates))
    
    // Use findOneAndUpdate to ensure atomic operation
    try {
      const result = await db.collection<UserSettings>('userSettings').findOneAndUpdate(
        { userId },
        [
          {
            $set: {
              userId: userId,
              mnzdConfigs: { $ifNull: ['$mnzdConfigs', DEFAULT_MNZD_CONFIGS] },
              newUser: { $ifNull: ['$newUser', true] },
              createdAt: { $ifNull: ['$createdAt', new Date()] },
              updatedAt: new Date(),
              ...Object.fromEntries(
                Object.entries(updates).map(([key, value]) => [
                  key,
                  value
                ])
              )
            }
          }
        ],
        { 
          upsert: true, 
          returnDocument: 'after'
        }
      )
      // console.log('updateUserSettings completed successfully')
    } catch (err: any) {
      // console.log('updateUserSettings error:', err.code, err.message)
      throw err
    }
  }

  static async getDailyProgress(userId: string, date: string): Promise<DailyProgress | null> {
    const { db } = await connectToDatabase()
    
    // Ensure unique compound index exists
    try {
      await db.collection('dailyProgress').createIndex(
        { userId: 1, date: 1 }, 
        { unique: true, background: true }
      )
    } catch (err) {
      // Index might already exist, ignore error
    }
    
    let progress = await db.collection<DailyProgress>('dailyProgress').findOne({ userId, date })
    const userSettings = await this.getUserSettings(userId)
    const currentConfigs = userSettings?.mnzdConfigs || []
    
    // If no progress exists for this date, create default entry
    if (!progress) {
      const defaultTasks = currentConfigs.map(config => ({
        id: config.id,
        name: config.name,
        completed: false,
        minutes: 0
      }))
      
      const defaultProgress: DailyProgress = {
        userId,
        date,
        tasks: defaultTasks,
        totalHours: 0,
        note: '',
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }
      
      try {
        await db.collection<DailyProgress>('dailyProgress').insertOne(defaultProgress)
        progress = defaultProgress
      } catch (err: any) {
        // If duplicate key error, fetch the existing document
        if (err.code === 11000) {
          progress = await db.collection<DailyProgress>('dailyProgress').findOne({ userId, date })
        } else {
          throw err
        }
      }
    } else {
      // Sync existing tasks with current MNZD configs
      const syncedTasks = currentConfigs.map(config => {
        const existingTask = progress!.tasks.find(task => task.id === config.id)
        return existingTask || {
          id: config.id,
          name: config.name,
          completed: false,
          minutes: 0
        }
      })
      
      // Update progress with synced tasks if they changed
      if (JSON.stringify(syncedTasks) !== JSON.stringify(progress.tasks)) {
        progress.tasks = syncedTasks
        await db.collection<DailyProgress>('dailyProgress').updateOne(
          { userId, date },
          { 
            $set: { 
              tasks: syncedTasks,
              updatedAt: new Date() 
            } 
          }
        )
      }
    }
    
    return progress
  }

  static async getProgressRange(userId: string, startDate: string, endDate: string): Promise<DailyProgress[]> {
    const { db } = await connectToDatabase()
    // console.log('getProgressRange called with:', { userId, startDate, endDate })
    
    const result = await db.collection<DailyProgress>('dailyProgress')
      .find({ 
        userId, 
        date: { $gte: startDate, $lte: endDate } 
      })
      .sort({ date: 1 })
      .toArray()
    
    // console.log('getProgressRange result:', result)
    return result
  }

  static async updateDailyProgress(userId: string, date: string, updates: Partial<DailyProgress>): Promise<void> {
    try {
      // console.log('DatabaseService.updateDailyProgress - Starting update:', { userId, date, updates })
      
      const { db } = await connectToDatabase()
      // console.log('DatabaseService.updateDailyProgress - Database connected successfully')
      
      // Remove _id from updates to prevent MongoDB error
      const { _id, ...updateData } = updates
      
      // console.log('DatabaseService.updateDailyProgress - Cleaned update data:', updateData)
      
      const result = await db.collection<DailyProgress>('dailyProgress').updateOne(
        { userId, date },
        { 
          $set: { 
            ...updateData, 
            updatedAt: new Date() 
          } 
        },
        { upsert: true }
      )
      
      // console.log('DatabaseService.updateDailyProgress - MongoDB Result:', {
        matchedCount: result.matchedCount,
        modifiedCount: result.modifiedCount,
        upsertedCount: result.upsertedCount,
        upsertedId: result.upsertedId
      })
      
      // Verify the update by reading back the data
      const updatedDoc = await db.collection<DailyProgress>('dailyProgress').findOne({ userId, date })
      // console.log('DatabaseService.updateDailyProgress - Updated document:', updatedDoc)
      
    } catch (error) {
      // console.error('DatabaseService.updateDailyProgress - Error:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        error
      })
      throw error
    }
  }
}