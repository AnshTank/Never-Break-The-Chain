# Never Break The Chain

<div align="center">

![Never Break The Chain](https://img.shields.io/badge/Never%20Break%20The%20Chain-Habit%20Tracker-blue?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green?style=for-the-badge&logo=mongodb)
![Vercel](https://img.shields.io/badge/Vercel-Deploy-black?style=for-the-badge&logo=vercel)

**A production-ready habit tracking application built with Next.js that helps you maintain consistency in your daily habits using Jerry Seinfeld's "Don't Break the Chain" methodology.**

[**Live Demo**](https://never-break-the-chain-anshtank.vercel.app) • [**Report Bug**](https://github.com/AnshTank/Never-Break-The-Chain/issues) • [**Request Feature**](https://github.com/AnshTank/Never-Break-The-Chain/issues)

</div>

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Authentication System](#authentication-system)
- [Analytics & Visualization](#analytics--visualization)
- [Security Features](#security-features)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

---

## Features

### MNZD Habit Tracking System
Our core methodology focuses on four essential daily pillars:

- **Meditation** - Mindfulness, mental clarity, and emotional well-being
- **Nutrition** - Healthy eating habits, learning, and knowledge acquisition
- **Zone** - Physical exercise, movement, and fitness activities
- **Discipline** - Focused work, productivity, and skill development

### Advanced Analytics & Visualization
- **Interactive Calendar** - Monthly view with intuitive color-coded progress indicators
- **Multi-Chart Analytics** - Area, Bar, Line, and Scatter plot visualizations
- **GitHub-Style Heatmap** - Year-long contribution-style progress tracking
- **Real-Time Tracking** - Live progress updates with actual hours worked
- **Streak Management** - Current and longest streaks with detailed success rates
- **Progress Insights** - Detailed analytics with trend analysis and predictions

### Enterprise-Grade Authentication
- **Custom JWT System** - Secure token-based authentication with refresh tokens
- **Email Verification** - OTP-based account verification for enhanced security
- **Password Security** - bcrypt encryption with 12 rounds and strength validation
- **Rate Limiting** - Brute force protection with intelligent blocking
- **Session Management** - Automatic token refresh and secure session handling
- **Multi-Device Support** - Seamless authentication across all devices

### Modern User Experience
- **Responsive Design** - Optimized for desktop, tablet, and mobile devices
- **Performance Optimized** - Fast loading with Next.js 16 and Turbopack
- **Smooth Animations** - Framer Motion powered transitions and micro-interactions
- **Accessibility** - WCAG 2.1 compliant with keyboard navigation support
- **Real-Time Updates** - Live data synchronization across all components

### Smart Notification System
- **Morning Motivation** - Daily boost messages at 7 AM
- **Evening Check-ins** - Progress review at 8 PM with personalized insights
- **Pattern Recognition** - Learns your habits and sends targeted reminders
- **Adaptive Messaging** - Different messages based on streak length and completion rate
- **Browser Notifications** - Native notification support with permission management

---

## Tech Stack

### Frontend
- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript 5 with strict mode
- **Styling**: Tailwind CSS 4 with custom design system
- **Components**: Radix UI primitives with shadcn/ui
- **Animations**: Framer Motion for smooth transitions
- **Charts**: Recharts for data visualization
- **State Management**: Zustand with global state management
- **Forms**: React Hook Form with Zod validation

### Backend
- **Runtime**: Node.js with Edge Runtime support
- **Database**: MongoDB Atlas with connection pooling
- **Authentication**: Custom JWT with refresh token rotation
- **Email Service**: Nodemailer with Gmail SMTP
- **Rate Limiting**: Custom implementation with Redis-like caching
- **Validation**: Zod schemas for type-safe data validation
- **Security**: bcrypt, CSRF protection, input sanitization

### DevOps & Deployment
- **Hosting**: Vercel with automatic deployments
- **CI/CD**: GitHub Actions for automated testing and deployment
- **Monitoring**: Vercel Analytics and error tracking
- **Testing**: Jest with React Testing Library
- **Code Quality**: ESLint, Prettier, and TypeScript strict mode

---

## Quick Start

### Prerequisites
Ensure you have the following installed:
- **Node.js** 18.17.0 or later
- **npm** 9.0.0 or later
- **MongoDB Atlas** account
- **Gmail** account for email services

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

3. **Environment Configuration**
   ```bash
   cp .env.example .env
   ```
   
   Configure your environment variables in `.env`:
   ```env
   # Database Configuration
   MONGODB_URL="mongodb+srv://username:password@cluster.mongodb.net/database"
   
   # JWT Security
   JWT_SECRET="your-super-secure-jwt-secret-key-min-32-chars"
   
   # Email Service (Gmail SMTP)
   EMAIL_HOST="smtp.gmail.com"
   EMAIL_PORT=587
   EMAIL_USER="neverbreakthechain.anshtank@gmail.com"
   EMAIL_PASSWORD="your-gmail-app-password"
   EMAIL_FROM="Never Break The Chain <neverbreakthechain.anshtank@gmail.com>"
   ADMIN_EMAIL="anshtank9@gmail.com"
   ```

4. **Database Setup**
   - Create a MongoDB Atlas cluster
   - Whitelist your IP address
   - Create a database user with read/write permissions
   - Update the `MONGODB_URL` in your `.env` file

5. **Email Configuration**
   - Enable 2-factor authentication on your Gmail account
   - Generate an App Password for the application
   - Update email credentials in your `.env` file

6. **Development Server**
   ```bash
   npm run dev
   ```

7. **Open Application**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Build for Production
```bash
npm run build
npm start
```

---

## Project Structure

```
never-break-the-chain/
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes
│   │   ├── auth/                 # Authentication endpoints
│   │   ├── user/                 # User management
│   │   ├── progress/             # Progress tracking
│   │   ├── analytics/            # Analytics data
│   │   └── settings/             # App settings
│   ├── dashboard/                # Main dashboard
│   ├── login/                    # Authentication pages
│   ├── signup/
│   ├── welcome/                  # Onboarding flow
│   ├── timer/                    # Focus timer
│   └── analytics/                # Detailed analytics
├── components/                   # React Components
│   ├── ui/                       # Reusable UI components
│   ├── auth/                     # Authentication components
│   ├── dashboard/                # Dashboard components
│   ├── analytics/                # Chart components
│   └── common/                   # Shared components
├── lib/                          # Utility libraries
│   ├── auth-utils.ts             # Authentication helpers
│   ├── database.ts               # Database connections
│   ├── jwt.ts                    # JWT token management
│   ├── email-service.ts          # Email functionality
│   ├── validation.ts             # Zod schemas
│   └── utils.ts                  # General utilities
├── hooks/                        # Custom React hooks
├── public/                       # Static assets
└── middleware.ts                 # Next.js middleware
```

---

## Authentication System

### Flow Overview
1. **Registration** → Email verification → Welcome onboarding → Password setup → Dashboard access
2. **Login** → JWT token generation → Automatic refresh → Secure session management
3. **Security** → Rate limiting → Brute force protection → Session timeout

### Key Features
- **JWT Tokens**: Access tokens (15 minutes) + Refresh tokens (7-30 days)
- **Email Verification**: OTP-based verification with expiration
- **Password Security**: bcrypt with 12 rounds, strength validation
- **Session Management**: Automatic token refresh, remember me functionality
- **Rate Limiting**: 5 attempts per 15 minutes, progressive blocking

### API Endpoints
```typescript
POST /api/auth/signup          # User registration
POST /api/auth/login           # User authentication
POST /api/auth/refresh         # Token refresh
POST /api/auth/logout          # Session termination
POST /api/auth/forgot-password # Password reset
POST /api/auth/verify-otp      # Email verification
```

---

## Analytics & Visualization

### Progress Color System
Our intelligent color coding system provides instant visual feedback:

| Hours | Color | Meaning | Hex Code |
|-------|-------|---------|----------|
| < 0.5h | Red | Minimal activity | `#ef4444` |
| 0.5-1h | Orange | Low activity | `#f97316` |
| 1-2h | Yellow | Moderate activity | `#eab308` |
| 2-3h | Lime | Good progress | `#84cc16` |
| 3-4h | Green | Very good progress | `#22c55e` |
| 4-6h | Emerald | Excellent progress | `#10b981` |
| 6-8h | Teal | Outstanding progress | `#14b8a6` |
| 8h+ | Cyan | Exceptional progress | `#06b6d4` |

### Chart Types
- **Area Charts**: Trend analysis over time
- **Bar Charts**: Daily/weekly comparisons
- **Line Charts**: Progress trajectories
- **Heatmaps**: Year-long activity overview
- **Scatter Plots**: Correlation analysis

---

## Security Features

### Data Protection
- **Encryption**: All passwords encrypted with bcrypt (12 rounds)
- **JWT Security**: Signed tokens with secure secrets
- **HTTPS Only**: Secure cookie transmission
- **Input Validation**: Comprehensive Zod schema validation
- **NoSQL Injection**: MongoDB parameterized queries

### Authentication Security
- **Rate Limiting**: Progressive blocking for failed attempts
- **Session Management**: Secure token rotation
- **CSRF Protection**: SameSite cookie attributes
- **XSS Prevention**: Content Security Policy headers
- **Brute Force Protection**: IP-based blocking

### Privacy & Compliance
- **Data Minimization**: Only collect necessary data
- **User Control**: Account deletion and data export
- **Secure Storage**: Encrypted sensitive information
- **Audit Logging**: Security event tracking

---

## Deployment

### Vercel Deployment (Recommended)

1. **Connect Repository**
   - Import your GitHub repository to Vercel
   - Configure build settings (auto-detected)

2. **Environment Variables**
   Set the following in Vercel dashboard:
   ```env
   MONGODB_URL=your-production-mongodb-url
   JWT_SECRET=your-production-jwt-secret
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=neverbreakthechain.anshtank@gmail.com
   EMAIL_PASSWORD=your-production-app-password
   EMAIL_FROM=Never Break The Chain <neverbreakthechain.anshtank@gmail.com>
   ADMIN_EMAIL=anshtank9@gmail.com
   ```

3. **Domain Configuration**
   - Add custom domain in Vercel settings
   - Configure DNS records as instructed

4. **Monitoring**
   - Enable Vercel Analytics
   - Set up error tracking
   - Configure performance monitoring

### Alternative Deployment Options

#### Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

---

## Contributing

We welcome contributions from the community! Please read our contributing guidelines before submitting pull requests.

### Development Setup
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and add tests
4. Ensure all tests pass: `npm test`
5. Commit your changes: `git commit -m 'Add amazing feature'`
6. Push to the branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

### Code Standards
- **TypeScript**: Strict mode enabled
- **ESLint**: Airbnb configuration with custom rules
- **Prettier**: Consistent code formatting
- **Commit Messages**: Conventional commit format
- **Testing**: Minimum 80% code coverage

### Pull Request Process
1. Update documentation for any new features
2. Add tests for new functionality
3. Ensure CI/CD pipeline passes
4. Request review from maintainers
5. Address feedback and iterate

---

## License

This project is licensed under a Custom License - see the [LICENSE](LICENSE) file for details.

**Summary**: This software is copyrighted and proprietary. Contributions are welcome and encouraged, but commercial use, redistribution, or use in external projects requires explicit permission.

---

## Contact

**Project Maintainer**: Ansh Tank

- **Personal Email**: [anshtank9@gmail.com](mailto:anshtank9@gmail.com)
- **Project Email**: [neverbreakthechain.anshtank@gmail.com](mailto:neverbreakthechain.anshtank@gmail.com)
- **GitHub**: [@AnshTank](https://github.com/AnshTank)
- **Project Repository**: [Never-Break-The-Chain](https://github.com/AnshTank/Never-Break-The-Chain)

For bug reports and feature requests, please use the [GitHub Issues](https://github.com/AnshTank/Never-Break-The-Chain/issues) page.

---

## Acknowledgments

### Inspiration
- **Jerry Seinfeld**: For the "Don't Break the Chain" productivity methodology
- **James Clear**: Atomic Habits principles and habit formation research
- **BJ Fogg**: Behavior design and tiny habits methodology

### Technologies
- **Vercel Team**: For the amazing Next.js framework and deployment platform
- **MongoDB**: For the flexible and scalable database solution
- **Radix UI**: For accessible and customizable UI primitives
- **Tailwind CSS**: For the utility-first CSS framework

### Community
- **Open Source Contributors**: For the countless libraries and tools
- **Beta Testers**: For valuable feedback and bug reports
- **Design Community**: For inspiration and best practices

---

<div align="center">

**Built with ❤️ by [AnshTank](https://github.com/AnshTank)**

*Start your journey today and never break the chain!*

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/AnshTank/Never-Break-The-Chain)

</div>