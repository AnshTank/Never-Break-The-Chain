# High-Level Design (HLD) - Never Break The Chain

## 🏗️ System Architecture Overview

Never Break The Chain is a full-stack habit tracking application built with modern web technologies, following microservices-inspired architecture patterns with serverless functions.

---

## 📊 Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                             │
├─────────────────────────────────────────────────────────────────┤
│  Next.js 15 App Router  │  React 18  │  TypeScript  │  Tailwind │
│  ─────────────────────────────────────────────────────────────  │
│  • Progressive Web App (PWA)                                     │
│  • Service Worker for offline support                            │
│  • Client-side state management (React Context)                  │
│  • Real-time UI updates with optimistic rendering                │
└─────────────────────────────────────────────────────────────────┘
                              ↕ HTTPS/TLS 1.3
┌─────────────────────────────────────────────────────────────────┐
│                      API GATEWAY LAYER                           │
├─────────────────────────────────────────────────────────────────┤
│  Next.js API Routes (Serverless Functions on Vercel)             │
│  ─────────────────────────────────────────────────────────────  │
│  • Rate Limiting Middleware                                      │
│  • JWT Authentication Middleware                                 │
│  • Request Validation (Zod schemas)                              │
│  • CORS & Security Headers                                       │
│  • Error Handling & Logging                                      │
└─────────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────────┐
│                     BUSINESS LOGIC LAYER                         │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Auth       │  │   Progress   │  │  Analytics   │          │
│  │   Service    │  │   Service    │  │   Service    │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ Notification │  │   Device     │  │     AI       │          │
│  │   Service    │  │   Manager    │  │   Service    │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────────┐
│                      DATA ACCESS LAYER                           │
├─────────────────────────────────────────────────────────────────┤
│  Database Abstraction  │  Cache Layer  │  External APIs          │
│  ─────────────────────────────────────────────────────────────  │
│  • MongoDB Connection Pool                                       │
│  • Query Optimization & Indexing                                 │
│  • Data Validation & Sanitization                                │
│  • Transaction Management                                        │
└─────────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────────┐
│                      PERSISTENCE LAYER                           │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────────┐  ┌──────────────────┐                     │
│  │  MongoDB Atlas   │  │  Vercel Edge     │                     │
│  │  (Primary DB)    │  │  (Static Assets) │                     │
│  └──────────────────┘  └──────────────────┘                     │
└─────────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────────┐
│                    EXTERNAL SERVICES LAYER                       │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Gmail      │  │  Gemini AI   │  │  Cron-job    │          │
│  │   SMTP       │  │   (Google)   │  │   .org       │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🎯 Core Components

### 1. **Client Layer**
- **Technology**: Next.js 15 with App Router, React 18, TypeScript
- **Responsibilities**:
  - User interface rendering (SSR + CSR)
  - Client-side routing and navigation
  - State management (React Context API)
  - Form handling and validation
  - Real-time UI updates
  - PWA capabilities (offline support, installability)

### 2. **API Gateway Layer**
- **Technology**: Next.js API Routes (Serverless Functions)
- **Responsibilities**:
  - Request routing and load balancing
  - Authentication and authorization
  - Rate limiting and DDoS protection
  - Input validation and sanitization
  - CORS policy enforcement
  - Security headers injection
  - Error handling and logging

### 3. **Business Logic Layer**
- **Services**:
  - **Auth Service**: User authentication, JWT management, OTP verification
  - **Progress Service**: Habit tracking, streak calculation, data persistence
  - **Analytics Service**: Data aggregation, trend analysis, insights generation
  - **Notification Service**: Email scheduling, push notifications, AI content generation
  - **Device Manager**: Multi-device session management, device registration
  - **AI Service**: Dynamic content generation using Gemini AI

### 4. **Data Access Layer**
- **Technology**: MongoDB Node.js Driver
- **Responsibilities**:
  - Database connection pooling
  - Query optimization and indexing
  - Data validation and sanitization
  - Transaction management
  - Error handling and retry logic

### 5. **Persistence Layer**
- **MongoDB Atlas**: Primary database for user data, progress tracking, analytics
- **Vercel Edge Network**: Static asset delivery, CDN caching

### 6. **External Services**
- **Gmail SMTP**: Email delivery for notifications
- **Gemini AI**: Dynamic content generation for personalized emails
- **Cron-job.org**: Scheduled task execution for notifications

---

## 🔄 Data Flow Architecture

### User Authentication Flow
```
User → Login Page → API (/api/auth/login)
  → Validate Credentials (bcrypt)
  → Generate JWT Token
  → Create Session
  → Register Device
  → Return Token + User Data
  → Redirect to Dashboard
```

### Progress Tracking Flow
```
User → Daily Check-in → API (/api/progress)
  → Validate Input (Zod)
  → Sanitize Data (XSS Protection)
  → Calculate Streak
  → Update MongoDB
  → Invalidate Cache
  → Return Updated Progress
  → Update UI (Optimistic)
```

### Notification Flow
```
Cron Job → API (/api/cron/notifications)
  → Authenticate Request (CRON_SECRET)
  → Fetch Users (Time Window)
  → Load User Data (Progress, Streaks)
  → Generate AI Content (Gemini)
  → Send Emails (Nodemailer)
  → Log Results
  → Return Status
```

### Analytics Flow
```
User → Dashboard → API (/api/analytics?month=2025-01)
  → Validate Month Parameter
  → Fetch Progress Data (Last 365 days)
  → Calculate Metrics (Streaks, Completion %)
  → Aggregate by Month/Week
  → Return JSON (force-dynamic)
  → Render Charts (Recharts)
```

---

## 🔐 Security Architecture

### Multi-Layer Security Model

```
┌─────────────────────────────────────────────────────────────┐
│  Layer 1: Network Security                                   │
│  • HTTPS/TLS 1.3 encryption                                  │
│  • Vercel DDoS protection                                    │
│  • MongoDB Atlas network isolation                           │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│  Layer 2: Application Security                               │
│  • JWT authentication with rotation                          │
│  • Rate limiting (progressive blocking)                      │
│  • CORS policy enforcement                                   │
│  • Security headers (CSP, X-Frame-Options)                   │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│  Layer 3: Input Validation                                   │
│  • Zod schema validation                                     │
│  • XSS protection (HTML sanitization)                        │
│  • SQL/NoSQL injection prevention                            │
│  • CSRF protection (SameSite cookies)                        │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│  Layer 4: Data Security                                      │
│  • bcrypt password hashing (12 rounds)                       │
│  • JWT secret rotation                                       │
│  • Sensitive data encryption                                 │
│  • Secure session management                                 │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 Database Schema Design

### Collections Overview

```
┌─────────────────────────────────────────────────────────────┐
│  users                                                       │
├─────────────────────────────────────────────────────────────┤
│  _id: ObjectId                                               │
│  email: string (unique, indexed)                             │
│  password: string (bcrypt hashed)                            │
│  name: string                                                │
│  mnzdConfig: object                                          │
│  createdAt: Date                                             │
│  lastLogin: Date                                             │
│  emailVerified: boolean                                      │
│  notificationSettings: object                                │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  progress                                                    │
├─────────────────────────────────────────────────────────────┤
│  _id: ObjectId                                               │
│  userId: ObjectId (indexed)                                  │
│  date: Date (indexed, compound with userId)                  │
│  meditation: number                                          │
│  nutrition: number                                           │
│  zone: number                                                │
│  discipline: number                                          │
│  completed: boolean                                          │
│  streak: number                                              │
│  createdAt: Date                                             │
│  updatedAt: Date                                             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  devices                                                     │
├─────────────────────────────────────────────────────────────┤
│  _id: ObjectId                                               │
│  userId: ObjectId (indexed)                                  │
│  deviceId: string (unique)                                   │
│  deviceName: string                                          │
│  lastActive: Date                                            │
│  userAgent: string                                           │
│  ipAddress: string                                           │
│  trusted: boolean                                            │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  sessions                                                    │
├─────────────────────────────────────────────────────────────┤
│  _id: ObjectId                                               │
│  userId: ObjectId (indexed)                                  │
│  deviceId: string                                            │
│  token: string (hashed)                                      │
│  expiresAt: Date (TTL index)                                 │
│  createdAt: Date                                             │
└─────────────────────────────────────────────────────────────┘
```

### Indexing Strategy
- **users**: `email` (unique), `createdAt`
- **progress**: `userId + date` (compound, unique), `date`, `userId`
- **devices**: `userId`, `deviceId` (unique)
- **sessions**: `userId`, `token`, `expiresAt` (TTL)

---

## ⚡ Performance Optimization

### 1. **Caching Strategy**
- **Client-side**: React Context for global state
- **Server-side**: Force-dynamic for real-time data
- **CDN**: Vercel Edge Network for static assets
- **Database**: Connection pooling, query optimization

### 2. **Code Splitting**
- Dynamic imports for heavy components
- Route-based code splitting (Next.js automatic)
- Lazy loading for images and charts

### 3. **Database Optimization**
- Compound indexes for frequent queries
- Projection to fetch only required fields
- Aggregation pipelines for analytics
- TTL indexes for session cleanup

### 4. **API Optimization**
- Serverless functions (auto-scaling)
- Response compression (gzip/brotli)
- Minimal payload sizes
- Parallel data fetching

---

## 🔄 Scalability Design

### Horizontal Scalability
- **Serverless Functions**: Auto-scaling based on demand (Vercel)
- **Database**: MongoDB Atlas auto-scaling clusters
- **CDN**: Global edge network distribution

### Vertical Scalability
- **Database**: Upgrade cluster tier as needed
- **Compute**: Vercel Pro/Enterprise plans
- **Storage**: MongoDB Atlas storage auto-expansion

### Load Balancing
- **Vercel Edge Network**: Automatic load distribution
- **MongoDB Atlas**: Built-in replica sets
- **API Routes**: Stateless design for horizontal scaling

---

## 🛡️ Disaster Recovery & High Availability

### Backup Strategy
- **MongoDB Atlas**: Automated daily backups (7-day retention)
- **Point-in-time Recovery**: Available for critical data
- **Code Repository**: GitHub with version control

### High Availability
- **Uptime Target**: 99.9% SLA
- **MongoDB Atlas**: Multi-region replica sets
- **Vercel**: Global edge network with automatic failover
- **Monitoring**: Real-time error tracking and alerts

### Incident Response
- **Detection**: Automated monitoring and alerting
- **Response**: 24-hour response time for critical issues
- **Recovery**: Automated rollback and failover procedures

---

## 📈 Monitoring & Observability

### Application Monitoring
- **Error Tracking**: Console logging, error boundaries
- **Performance**: Core Web Vitals tracking
- **User Analytics**: Engagement metrics, retention rates

### Infrastructure Monitoring
- **Vercel**: Built-in analytics and logs
- **MongoDB Atlas**: Performance advisor, slow query logs
- **Uptime**: External monitoring services

### Security Monitoring
- **Rate Limiting**: Track and block suspicious IPs
- **Failed Logins**: Alert on brute force attempts
- **Audit Logs**: Track security-critical events

---

## 🌍 Deployment Architecture

### Production Environment
```
GitHub Repository
      ↓
  Git Push (main branch)
      ↓
Vercel CI/CD Pipeline
      ↓
  • Build Next.js app
  • Run type checking
  • Run linting
  • Deploy to Edge Network
      ↓
Production (https://never-break-the-chain.vercel.app)
```

### Environment Configuration
- **Development**: Local MongoDB, local SMTP testing
- **Staging**: MongoDB Atlas (dev cluster), test email accounts
- **Production**: MongoDB Atlas (prod cluster), production email service

---

## 🔮 Future Architecture Enhancements

### Phase 1 (Q1 2025)
- **Redis Cache**: Implement distributed caching layer
- **WebSocket**: Real-time notifications and updates
- **CDN**: Optimize image delivery with Cloudinary/Imgix

### Phase 2 (Q2 2025)
- **Microservices**: Split into independent services
- **Message Queue**: RabbitMQ/SQS for async processing
- **GraphQL**: Implement GraphQL API layer

### Phase 3 (Q3 2025)
- **Mobile Apps**: React Native with shared backend
- **Analytics Pipeline**: Dedicated analytics infrastructure
- **AI/ML**: Advanced insights and predictions

---

## 📊 Technology Stack Summary

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | Next.js 15, React 18, TypeScript | UI rendering, routing |
| **Styling** | Tailwind CSS, Framer Motion | Responsive design, animations |
| **Backend** | Next.js API Routes, Node.js | Serverless functions |
| **Database** | MongoDB Atlas | Data persistence |
| **Authentication** | JWT, bcrypt | Secure auth |
| **Email** | Nodemailer, Gmail SMTP | Notifications |
| **AI** | Google Gemini | Content generation |
| **Deployment** | Vercel | Hosting, CI/CD |
| **Monitoring** | Vercel Analytics | Performance tracking |

---

## 📞 Architecture Review & Feedback

For architecture discussions, improvements, or questions:
- **Email**: anshtank9@gmail.com
- **GitHub**: [github.com/AnshTank](https://github.com/AnshTank)
- **LinkedIn**: [linkedin.com/in/anshtank9](https://linkedin.com/in/anshtank9)

---

<div align="center">

**🏗️ Built with Modern Architecture Principles**

*Designed by [Ansh Tank](https://anshtank.me) | © 2025 Never Break The Chain*

</div>
