# 🔗 Never Break The Chain

A production-ready journey tracking app built with Next.js that helps you maintain consistency in your daily habits using the "Don't Break the Chain" methodology.

## 🚨 SECURITY NOTICE
**Before deploying to production, please read [SECURITY.md](./SECURITY.md) for critical security configurations.**

## ✨ Features

### 🎯 **MNZD System**
Track 4 essential daily tasks:
- **M**editation
- **N**utrition  
- **Z**one (Exercise)
- **D**iscipline

### 📊 **Multiple Views**
- **Calendar View**: Interactive monthly calendar with color-coded progress
- **Progress Analytics**: Comprehensive charts and insights with multiple visualization types
- **Year Heatmap**: GitHub-style contribution heatmap
- **Journey Graph**: Visual progress tracking with Area, Bar, Line, Scatter, and Mixed chart types

### 🔐 **Secure Authentication**
- Custom JWT-based authentication system
- **Email verification required for new accounts**
- **OTP-based password reset with 60-second cooldown**
- **Contact support system for email delivery issues**
- Secure user registration and onboarding flow
- Password setup during welcome process
- Session management with automatic token refresh
- MongoDB integration for user data
- Password encryption with bcrypt (12 rounds)
- **Rate limiting and brute force protection**
- **Input validation and NoSQL injection prevention**

### 📱 **Responsive Design**
- Mobile-optimized interface
- Desktop-first progress analytics
- Smooth animations and transitions
- Real-time data updates

### 🚀 **Production Features**
- Database-first data architecture
- Real-time progress tracking
- Comprehensive analytics showing actual hours worked
- Secure API routes with JWT middleware
- Cache management and cleanup
- Error handling and validation

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- MongoDB Atlas account
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/AnshTank/Never-Break-The-Chain.git
   cd Never-Break-The-Chain
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   MONGODB_URL="your_mongodb_connection_string"
   JWT_SECRET="your-super-secret-jwt-key-change-in-production"
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🛠️ Tech Stack

- **Framework**: Next.js 16 with App Router
- **Styling**: Tailwind CSS + shadcn/ui
- **Database**: MongoDB with Mongoose
- **Authentication**: Custom JWT-based authentication
- **Charts**: Recharts with multiple visualization types
- **Icons**: Lucide React
- **TypeScript**: Full type safety
- **Middleware**: Custom JWT verification and session management

## 📁 Project Structure

```
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   ├── auth/          # Authentication endpoints
│   │   │   ├── login/     # User login
│   │   │   ├── signup/    # User registration
│   │   │   ├── setup-password/ # Password setup during onboarding
│   │   │   ├── logout/    # User logout
│   │   │   └── cleanup/   # Session cleanup
│   │   ├── user/          # User management
│   │   ├── progress/      # Progress tracking
│   │   ├── analytics/     # Analytics data
│   │   └── settings/      # User settings
│   ├── login/             # Login page
│   ├── signup/            # Signup page
│   ├── welcome/           # 4-phase onboarding flow
│   ├── timer/             # Focus timer
│   └── page.tsx           # Main dashboard
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── auth-provider.tsx # Authentication context
│   ├── password-setup-modal.tsx # Password setup during onboarding
│   ├── journey-graph.tsx # Advanced analytics charts
│   ├── year-heatmap.tsx  # GitHub-style heatmap
│   ├── progress-view.tsx # Analytics dashboard
│   └── ...
├── lib/                  # Utilities and configurations
│   ├── jwt.ts            # JWT token management
│   ├── auth-utils.ts     # Authentication utilities
│   ├── database.ts       # Database service layer
│   ├── global-state.tsx  # Global state management
│   ├── session-manager.ts # Session management
│   ├── cache-utils.ts    # Cache management
│   └── ...
├── hooks/                # Custom React hooks
├── middleware.ts         # JWT authentication middleware
└── styles/               # Global styles
```

## 🎨 Color System

The app uses a dynamic color system based on actual hours worked:

- 🔴 **Red (< 0.5h)**: Very Low activity
- 🟠 **Orange (0.5-1h)**: Low activity  
- 🟡 **Yellow (1-2h)**: Moderate activity
- 🟢 **Lime (2-3h)**: Good progress
- 🔵 **Green (3-4h)**: Very Good progress
- 🟢 **Emerald (4-6h)**: Excellent progress
- 🔵 **Teal (6-8h)**: Outstanding progress
- 🔵 **Cyan (8h+)**: Exceptional progress

## 🔄 Authentication Flow

1. **Signup**: User creates account with email and name
2. **Email Verification**: Modal popup with OTP verification (required)
3. **Welcome Flow**: 4-phase onboarding process after email verification
   - Phase 1: Hero welcome and motivation
   - Phase 2: Philosophy and methodology explanation
   - Phase 3: MNZD system deep dive
   - Phase 4: Customization and setup
4. **Password Setup**: Secure password creation with strength validation
5. **Main App**: Full access to tracking and analytics

### 🔑 Password Reset Flow

1. **Email Entry**: User enters email, system validates existence
2. **OTP Verification**: 6-digit code sent via email with 60s cooldown
3. **Password Reset**: Strong password creation with real-time validation
4. **Contact Support**: Fallback form for email delivery issues

## 📊 Analytics Features

- **Real-time Progress Tracking**: Shows actual hours worked, not just minimum requirements
- **Multiple Chart Types**: Area, Bar, Line, Scatter, and Mixed visualizations
- **Year Heatmap**: GitHub-style contribution view
- **Monthly Analytics**: Detailed breakdown of daily progress
- **Streak Tracking**: Current and longest streaks
- **Success Rate**: Completion percentage calculations

## 🔒 Security Features

- **Email Verification**: Required for all new accounts
- **OTP-Based Password Reset**: 6-digit codes with 5-minute expiration
- **Rate Limiting**: Comprehensive protection against brute force attacks
- **Input Validation**: Zod schemas prevent injection attacks
- **Password Security**: Strong requirements with real-time strength meter
- **JWT Authentication**: Secure HTTP-only cookies with refresh tokens
- **Contact Support**: Fallback system for email delivery issues
- **Session Management**: Automatic timeout and cleanup
- **NoSQL Injection Prevention**: Comprehensive input sanitization
- **CSRF Protection**: SameSite cookie attributes

## 🚀 Production Deployment

**⚠️ IMPORTANT: Read [SECURITY.md](./SECURITY.md) and [DEPLOYMENT.md](./DEPLOYMENT.md) before deploying to production.**

### Quick Start
1. **Security Setup**
   ```bash
   # Generate new production secrets
   openssl rand -base64 32  # For JWT_SECRET
   ```

2. **Environment Configuration**
   ```bash
   # Copy production template
   cp .env.production.example .env.production
   # Fill in your production values
   ```

3. **Build and Deploy**
   ```bash
   npm run build
   # Deploy to your preferred platform
   ```

### Supported Platforms
- **Vercel** (recommended)
- **Railway** 
- **Netlify**
- **AWS/Digital Ocean**

### Production Features
- Professional email templates with branding
- Enhanced security with rate limiting
- Comprehensive error handling
- Performance optimizations
- Monitoring and logging ready

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Inspired by Jerry Seinfeld's "Don't Break the Chain" productivity method
- Built with modern web technologies and production-ready architecture
- Designed for scalability, security, and user experience

---

**Start your journey today and never break the chain! 🔗**