# Low-Level Design (LLD) - Never Break The Chain

## 🔧 Detailed Component Design

This document provides in-depth technical specifications for each component of the Never Break The Chain application.

---

## 📁 Module Architecture

### 1. Authentication Module

#### 1.1 User Registration Flow
```typescript
// File: app/api/auth/signup/route.ts

POST /api/auth/signup
Request Body: {
  email: string,
  password: string,
  name: string
}

Flow:
1. Validate input using Zod schema (validation.ts)
2. Sanitize input to prevent XSS attacks
3. Check if email already exists in database
4. Hash password using bcrypt (12 rounds)
5. Generate OTP (6 digits, 5-minute expiry)
6. Create user document in MongoDB
7. Send verification email via Nodemailer
8. Return success response (no sensitive data)

Response: {
  success: true,
  message: "Verification email sent"
}
```

#### 1.2 JWT Token Management
```typescript
// File: lib/jwt.ts

Token Structure:
{
  userId: string,
  email: string,
  deviceId: string,
  iat: number,
  exp: number
}

Token Lifecycle:
- Generation: HS256 algorithm with JWT_SECRET
- Expiration: 1 hour (normal), 180 days (remember me)
- Storage: HttpOnly cookie with SameSite=Strict
- Refresh: Automatic rotation on API calls
- Revocation: Token blacklist in sessions collection
```

#### 1.3 OTP Verification System
```typescript
// File: lib/otp-manager.ts

Class: OTPManager
Methods:
- generateOTP(): string
  • Generates 6-digit random number
  • Stores in memory with 5-minute TTL
  • Returns OTP string

- verifyOTP(email: string, otp: string): boolean
  • Checks OTP against stored value
  • Validates expiration time
  • Implements rate limiting (3 attempts/15 min)
  • Clears OTP after successful verification

- cleanupExpired(): void
  • Runs every 1 minute
  • Removes expired OTPs from memory
```

---

### 2. Progress Tracking Module

#### 2.1 Daily Check-in API
```typescript
// File: app/api/progress/route.ts

POST /api/progress
Headers: { Authorization: "Bearer <token>" }
Request Body: {
  date: "2025-01-15",
  meditation: 35,
  nutrition: 25,
  zone: 50,
  discipline: 20
}

Processing Steps:
1. Authenticate user via JWT middleware
2. Validate date format (YYYY-MM-DD)
3. Sanitize numeric inputs (remove HTML/scripts)
4. Check if entry exists for date
5. Calculate completion status (all tasks >= target)
6. Update or insert progress document
7. Recalculate streak (consecutive completed days)
8. Invalidate analytics cache
9. Return updated progress with streak

Response: {
  success: true,
  progress: { ...progressData },
  streak: 15
}
```

#### 2.2 Streak Calculation Algorithm
```typescript
// File: lib/database.ts

Function: calculateStreak(userId: string): Promise<number>

Algorithm:
1. Fetch all completed progress entries for user
2. Sort by date descending
3. Initialize streak = 0, currentDate = today
4. Iterate through entries:
   - If entry.date === currentDate: streak++
   - If entry.date === currentDate - 1: streak++, currentDate--
   - Else: break (streak broken)
5. Return streak count

Time Complexity: O(n) where n = number of entries
Space Complexity: O(1)
```

#### 2.3 Progress Data Model
```typescript
// File: lib/types.ts

interface Progress {
  _id: ObjectId;
  userId: ObjectId;
  date: Date;
  meditation: number;    // minutes
  nutrition: number;     // minutes
  zone: number;          // minutes
  discipline: number;    // minutes
  completed: boolean;    // all tasks >= target
  streak: number;        // consecutive days
  createdAt: Date;
  updatedAt: Date;
}

Indexes:
- { userId: 1, date: 1 } (unique, compound)
- { date: 1 }
- { userId: 1, completed: 1 }
```

---

### 3. Analytics Module

#### 3.1 Analytics API Design
```typescript
// File: app/api/analytics/route.ts

GET /api/analytics?month=2025-01
Headers: { Authorization: "Bearer <token>" }

Processing:
1. Authenticate user
2. Validate month parameter (YYYY-MM-DD format)
3. Prevent future dates beyond 1 year
4. Calculate date range (last 365 days from month)
5. Fetch progress data with projection
6. Aggregate metrics:
   - Total days tracked
   - Completion percentage
   - Current streak
   - Longest streak
   - Task-wise averages
7. Group by month/week for charts
8. Return JSON with cache-control headers

Response: {
  totalDays: 120,
  completionRate: 85.5,
  currentStreak: 15,
  longestStreak: 42,
  taskAverages: { meditation: 32, ... },
  monthlyData: [...],
  weeklyData: [...]
}
```

#### 3.2 Data Aggregation Pipeline
```typescript
// MongoDB Aggregation Pipeline

db.progress.aggregate([
  { $match: { 
      userId: ObjectId(userId),
      date: { $gte: startDate, $lte: endDate }
    }
  },
  { $group: {
      _id: { 
        year: { $year: "$date" },
        month: { $month: "$date" }
      },
      totalDays: { $sum: 1 },
      completedDays: { 
        $sum: { $cond: ["$completed", 1, 0] }
      },
      avgMeditation: { $avg: "$meditation" },
      avgNutrition: { $avg: "$nutrition" },
      avgZone: { $avg: "$zone" },
      avgDiscipline: { $avg: "$discipline" }
    }
  },
  { $sort: { "_id.year": 1, "_id.month": 1 } }
])
```

#### 3.3 Timezone Handling
```typescript
// File: lib/date-utils.ts

Problem: Localhost (IST UTC+5:30) vs Vercel (UTC)

Solution:
- Always use UTC methods for date parsing
- Convert user input to UTC before storage
- Return dates in ISO format
- Client handles timezone display

Example:
// ❌ Wrong (causes month offset)
new Date("2025-01-15").toISOString()

// ✅ Correct
new Date(Date.UTC(2025, 0, 15)).toISOString()
```

---

### 4. Notification Module

#### 4.1 Dynamic Notification Scheduler
```typescript
// File: lib/dynamic-notification-scheduler.ts

Class: NotificationScheduler

Method: scheduleNotifications(window: string)
Windows: "morning" | "evening" | "weekly"

Morning (7 AM IST = 1-2 UTC):
- Fetch users with morning notifications enabled
- Load last 7 days progress data
- Calculate current streak status
- Generate AI content via Gemini
- Send personalized motivation email
- Log delivery status

Evening (6 PM IST = 12-13 UTC):
- Fetch users with evening notifications enabled
- Check if today's tasks completed
- Load weekly progress summary
- Generate AI reflection content
- Send check-in email
- Track engagement metrics

Weekly (Monday 9 AM IST):
- Fetch all active users
- Load last 7 days progress (28 tasks total)
- Calculate completion rate (x/28 format)
- Generate AI weekly summary
- Send comprehensive report
- Include streak milestones
```

#### 4.2 AI Content Generation
```typescript
// AI Content Service

Class: AIContentService

Method: generateDynamicContent(context: ContentContext)

Context: {
  userName: string,
  currentStreak: number,
  longestStreak: number,
  recentProgress: Progress[],
  dayOfWeek: string,
  timeOfDay: string,
  randomSeed: number
}

Prompt Engineering:
- Include date/day context for relevance
- Add random seed for variation
- Specify streak status (broken/maintaining/new record)
- Request different tone based on performance
- Limit length (150-200 words)
- Avoid repetitive phrases

Configuration:
- Temperature: 0.9 (high creativity)
- Max Tokens: 300
- Model: AI service provider
```

#### 4.3 Email Template System
```typescript
// File: lib/email-templates.ts

Templates:
1. Morning Motivation
   - Personalized greeting
   - AI-generated inspiration
   - Today's task checklist
   - Streak display
   - CTA: "Start Your Day"

2. Evening Check-in
   - Progress summary
   - AI-generated reflection
   - Incomplete tasks reminder
   - Weekly preview
   - CTA: "Complete Tasks"

3. Weekly Summary
   - 7-day overview (x/28 tasks)
   - Completion percentage
   - Streak status
   - AI-generated insights
   - Next week goals
   - CTA: "View Dashboard"

4. Milestone Celebration
   - Streak achievement (7, 30, 100 days)
   - Congratulatory message
   - Progress visualization
   - Encouragement to continue
   - CTA: "Share Achievement"
```

---

### 5. Security Module

#### 5.1 Input Validation & Sanitization
```typescript
// File: lib/validation.ts

Function: sanitizeString(input: string): string

Steps:
1. Remove HTML tags: /<[^>]*>/g
2. Remove script content: /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi
3. Remove javascript: protocols: /javascript:/gi
4. Remove event handlers: /on\w+\s*=/gi
5. Trim whitespace
6. Limit length (max 1000 chars)

Applied to:
- User names
- MNZD config descriptions
- Contact form messages
- Feedback submissions
```

#### 5.2 Rate Limiting Implementation
```typescript
// File: lib/advanced-rate-limit.ts

Class: RateLimiter

Strategy: Progressive Blocking
- 1st violation: 1-minute block
- 2nd violation: 5-minute block
- 3rd+ violation: 15-minute block

Storage: In-memory Map
Key: IP address or user ID
Value: { count, lastAttempt, blockUntil }

Limits by Endpoint:
- /api/auth/login: 5 requests/15 min
- /api/auth/signup: 3 requests/hour
- /api/progress: 60 requests/min
- /api/analytics: 30 requests/min
- /api/cron/*: Requires CRON_SECRET header
```

#### 5.3 CSRF Protection
```typescript
// Cookie Configuration

Set-Cookie: token=<jwt>; 
  HttpOnly; 
  Secure; 
  SameSite=Strict; 
  Path=/; 
  Max-Age=3600

Attributes:
- HttpOnly: Prevents JavaScript access
- Secure: HTTPS only
- SameSite=Strict: No cross-site requests
- Path=/: Available to all routes
- Max-Age: 1 hour (or 180 days with remember me)
```

---

### 6. Database Module

#### 6.1 Connection Management
```typescript
// Database Connection

Singleton Pattern:
- Single connection instance per serverless function
- Connection pooling (max 10 connections)
- Automatic reconnection on failure
- Graceful shutdown handling

Connection Configuration:
- Retry writes enabled
- Write concern: majority
- Max pool size: 10
- Min pool size: 2
```

#### 6.2 Query Optimization
```typescript
// Optimized Queries

// ❌ Bad: Fetches all fields
db.progress.find({ userId })

// ✅ Good: Projection for required fields only
db.progress.find(
  { userId },
  { projection: { meditation: 1, nutrition: 1, zone: 1, discipline: 1, date: 1 } }
)

// ❌ Bad: Multiple queries
const user = await db.users.findOne({ _id: userId })
const progress = await db.progress.find({ userId })

// ✅ Good: Aggregation pipeline
const result = await db.users.aggregate([
  { $match: { _id: userId } },
  { $lookup: {
      from: "progress",
      localField: "_id",
      foreignField: "userId",
      as: "progressData"
    }
  }
])
```

#### 6.3 Index Strategy
```typescript
// File: Database initialization

Indexes Created:
1. users.email (unique, sparse)
2. progress.userId_date (compound, unique)
3. progress.date (ascending)
4. progress.userId_completed (compound)
5. devices.userId (ascending)
6. devices.deviceId (unique)
7. sessions.userId (ascending)
8. sessions.expiresAt (TTL, 180 days)

Index Usage Analysis:
- Query: { userId, date } → Uses userId_date compound
- Query: { userId, completed: true } → Uses userId_completed
- Query: { date: { $gte, $lte } } → Uses date index
```

---

### 7. State Management Module

#### 7.1 Global State Architecture
```typescript
// File: lib/global-state.tsx

Context: GlobalStateContext

State Structure:
{
  user: User | null,
  isAuthenticated: boolean,
  progress: Progress[],
  analytics: AnalyticsData | null,
  loading: boolean,
  error: string | null
}

Actions:
- setUser(user: User)
- setProgress(progress: Progress[])
- setAnalytics(data: AnalyticsData)
- logout()
- refreshData()

Optimization:
- Memoized context value
- Selective re-renders with useMemo
- Debounced API calls
- Optimistic UI updates
```

#### 7.2 Data Fetching Hooks
```typescript
// File: hooks/use-data.ts

Hook: useProgressData()

Features:
- Automatic data fetching on mount
- Polling for real-time updates (optional)
- Error handling with retry logic
- Loading states
- Cache invalidation
- Optimistic updates

Usage:
const { progress, loading, error, refetch } = useProgressData()

Implementation:
- useEffect for initial fetch
- useState for local state
- useCallback for memoized functions
- Error boundaries for error handling
```

---

### 8. Cron Job Module

#### 8.1 Scheduled Task Security
```typescript
// Notification Scheduler

POST /api/notifications/schedule?window=morning
Headers: { Authorization: "Bearer <SECRET>" }

Security Checks:
1. Verify Authorization header
2. Compare with environment secret
3. Validate window parameter
4. Check request origin
5. Rate limit by IP

Response:
{
  success: true,
  processed: 150,
  sent: 148,
  failed: 2,
  errors: [...]
}
```

#### 8.2 Task Schedule Configuration
```bash
# Automated Task Scheduling

Morning Notifications:
Schedule: Configurable based on user timezone
Endpoint: Internal notification service
Authentication: Secure token-based

Evening Notifications:
Schedule: Configurable based on user timezone
Endpoint: Internal notification service
Authentication: Secure token-based

Weekly Summary:
Schedule: Configurable (typically Monday mornings)
Endpoint: Internal notification service
Authentication: Secure token-based
```

---

## 🧪 Testing Strategy

### Unit Tests
```typescript
// File: __tests__/auth.test.ts

describe("Authentication", () => {
  test("should hash password correctly", async () => {
    const password = "Test@1234"
    const hashed = await bcrypt.hash(password, 12)
    expect(await bcrypt.compare(password, hashed)).toBe(true)
  })

  test("should generate valid JWT", () => {
    const token = generateToken({ userId: "123", email: "test@example.com" })
    const decoded = verifyToken(token)
    expect(decoded.userId).toBe("123")
  })
})
```

### Integration Tests
```typescript
// File: __tests__/api/progress.test.ts

describe("Progress API", () => {
  test("POST /api/progress should create entry", async () => {
    const response = await fetch("/api/progress", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ date: "2025-01-15", meditation: 30, ... })
    })
    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.success).toBe(true)
  })
})
```

---

## 📊 Performance Benchmarks

### API Response Times
- Authentication: < 200ms
- Progress Update: < 150ms
- Analytics Fetch: < 300ms
- Notification Send: < 500ms

### Database Query Times
- User Lookup: < 10ms
- Progress Fetch (30 days): < 50ms
- Analytics Aggregation: < 100ms
- Streak Calculation: < 30ms

### Frontend Metrics
- First Contentful Paint: < 1.5s
- Time to Interactive: < 3s
- Largest Contentful Paint: < 2.5s
- Cumulative Layout Shift: < 0.1

---

## 🔧 Development Tools

### Code Quality
- **ESLint**: Linting with TypeScript rules
- **Prettier**: Code formatting
- **TypeScript**: Type checking
- **Husky**: Pre-commit hooks

### Testing
- **Jest**: Unit testing framework
- **React Testing Library**: Component testing
- **Supertest**: API testing

### Monitoring
- **Console Logging**: Development debugging
- **Error Boundaries**: React error handling
- **Vercel Analytics**: Production monitoring

---

<div align="center">

**🔧 Detailed Technical Implementation**

*Engineered by [Ansh Tank](https://anshtank.me) | © 2026 Never Break The Chain*

</div>
