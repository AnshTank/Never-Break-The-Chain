# Never Break The Chain - MNZD Habit Tracker

A modern habit tracking application built with Next.js, TypeScript, and MongoDB that helps users build consistent daily habits through the MNZD methodology (Meditation, Nutrition, Zone, Discipline).

## Features

- **Interactive Progress Calendar**: Monthly view with visual progress indicators
- **GitHub-Style Heatmap**: Year-long journey visualization
- **Advanced Analytics**: Multiple chart types for progress tracking
- **Smart Notifications**: Morning and evening reminders with milestone alerts
- **Secure Authentication**: JWT-based auth with OTP verification
- **Responsive Design**: Mobile-first design with PWA capabilities

## MNZD Methodology

The application is built around four core pillars:

- 🧘 **Meditation**: Mindfulness and mental clarity
- 📚 **Nutrition**: Healthy eating and continuous learning
- 💪 **Zone**: Physical exercise and movement
- 🎯 **Discipline**: Focused work and skill development

## Tech Stack

- **Frontend**: Next.js 16, TypeScript, Tailwind CSS, Framer Motion
- **Backend**: Node.js, MongoDB Atlas, JWT Authentication
- **Deployment**: Vercel
- **Notifications**: Web Push API, Email (Nodemailer)

## Quick Start

### Prerequisites

- Node.js >= 18.17.0
- npm >= 9.0.0
- MongoDB Atlas account
- Gmail account (for email services)

### Installation

```bash
# Clone the repository
git clone https://github.com/AnshTank/Never-Break-The-Chain.git
cd Never-Break-The-Chain

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with your configuration

# Start development server
npm run dev
```

### Environment Variables

```env
# Database
MONGODB_URL="mongodb+srv://username:password@cluster.mongodb.net/database"

# Authentication
JWT_SECRET="your-jwt-secret-key"

# Email Service
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT=587
EMAIL_USER="your-email@gmail.com"
EMAIL_PASSWORD="your-app-password"
EMAIL_FROM="Your App <your-email@gmail.com>"

# Push Notifications
VAPID_PUBLIC_KEY="your-vapid-public-key"
VAPID_PRIVATE_KEY="your-vapid-private-key"
VAPID_EMAIL="your-email@gmail.com"

# Cron Security
CRON_SECRET="your-cron-secret"
```

## Project Structure

```
app/
├── api/                 # API routes
├── dashboard/           # Main dashboard
├── (auth)/             # Authentication pages
└── globals.css         # Global styles

components/
├── ui/                 # Reusable UI components
├── dashboard/          # Dashboard-specific components
└── auth/              # Authentication components

lib/
├── auth-utils.ts      # Authentication utilities
├── database.ts        # Database connection
├── notification-scheduler.ts  # Notification system
└── utils.ts           # General utilities
```

## Notification System

The app includes an advanced notification system with:

- **Random Timing**: 2-3 motivational messages per day
- **Milestone Alerts**: Celebrations for streak achievements
- **Smart Scheduling**: Optimal timing based on user behavior
- **Multiple Channels**: Web push and email notifications

### External Cron Setup

For reliable notifications, set up external cron jobs at [cron-job.org](https://cron-job.org):

- **Morning**: `0 7 * * *` (7 AM)
- **Midday**: `0 12 * * *` (12 PM)
- **Afternoon**: `0 15 * * *` (3 PM)
- **Evening**: `0 20 * * *` (8 PM)
- **Random Scheduler**: `0 6,18 * * *` (6 AM & 6 PM)
- **Milestones**: `0 9,15,21 * * *` (9 AM, 3 PM, 9 PM)

URL: `https://your-domain.vercel.app/api/cron/notifications`
Headers: `Authorization: Bearer your-cron-secret`

## Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Manual Deployment

```bash
# Build the application
npm run build

# Start production server
npm start
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## License

This project is licensed under a Custom License. See [LICENSE](LICENSE) for details.

## Author

**Ansh Tank**
- Portfolio: [anshtank.me](https://anshtank.me)
- Email: [anshtank9@gmail.com](mailto:anshtank9@gmail.com)
- LinkedIn: [linkedin.com/in/anshtank9](https://linkedin.com/in/anshtank9)
- GitHub: [github.com/AnshTank](https://github.com/AnshTank)

---

© 2026 Never Break The Chain. Built with ❤️ by Ansh Tank. Configuration
MONGODB_URL="mongodb+srv://username:password@cluster.mongodb.net/database"

# 🔐 Security Configuration
JWT_SECRET="your-super-secure-jwt-secret-key-min-32-chars"

# 📧 Email Service Configuration
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT=587
EMAIL_USER="neverbreakthechain.anshtank@gmail.com"
EMAIL_PASSWORD="your-gmail-app-password"
EMAIL_FROM="Never Break The Chain <neverbreakthechain.anshtank@gmail.com>"
ADMIN_EMAIL="anshtank9@gmail.com"
```

---

## 🏛️ **Project Architecture: A Work of Art**

```
🏗️ never-break-the-chain/
├── 📱 app/                          # Next.js App Router Magic
│   ├── 🔌 api/                      # Backend API Endpoints
│   │   ├── 🔐 auth/                 # Authentication System
│   │   ├── 👤 user/                 # User Management
│   │   ├── 📊 progress/             # Progress Tracking
│   │   ├── 📈 analytics/            # Data Analytics
│   │   └── ⚙️ settings/             # Application Settings
│   ├── 🎛️ dashboard/                # Main Control Center
│   ├── 🔑 (auth)/                   # Authentication Pages
│   ├── 🎉 welcome/                  # Onboarding Experience
│   ├── ⏱️ timer/                    # Focus Timer
│   ├── 📖 about/                    # Story & Philosophy
│   └── 📊 analytics/                # Detailed Analytics
├── 🧩 components/                   # React Component Library
│   ├── 🎨 ui/                       # Reusable UI Components
│   ├── 🔐 auth/                     # Authentication Components
│   ├── 🎛️ dashboard/                # Dashboard Components
│   ├── 📊 analytics/                # Chart Components
│   └── 🌐 common/                   # Shared Components
├── 📚 lib/                          # Utility Library
│   ├── 🔐 auth-utils.ts             # Authentication Helpers
│   ├── 🗄️ database.ts               # Database Connection
│   ├── 🎫 jwt.ts                    # JWT Token Management
│   ├── 📧 email-service.ts          # Email Functionality
│   ├── ✅ validation.ts             # Zod Schemas
│   └── 🛠️ utils.ts                  # General Utilities
├── 🎣 hooks/                        # Custom React Hooks
├── 🎭 public/                       # Static Assets
└── 🛡️ middleware.ts                 # Next.js Middleware
```

---

## 🛡️ **Security: Fort Knox for Your Data**

### 🔐 **Authentication Arsenal**

```typescript
// Security Layers
const securityFeatures = {
  passwordEncryption: "bcrypt with 12 rounds",
  tokenSecurity: "JWT with secure secrets & rotation",
  rateLimiting: "Progressive blocking system",
  inputValidation: "Comprehensive Zod schemas",
  csrfProtection: "SameSite cookie attributes",
  xssPreventtion: "Content Security Policy headers",
  bruteForceProtection: "IP-based intelligent blocking",
};
```

### 🛡️ **Privacy & Compliance**

- 🔒 **Data Minimization**: Only collect what's necessary
- 👤 **User Control**: Complete account deletion & data export
- 🔐 **Secure Storage**: Encrypted sensitive information
- 📝 **Audit Logging**: Comprehensive security event tracking
- 🌍 **GDPR Compliant**: European privacy standards

---

## 🚀 **Deployment: From Code to Cloud**

### 🌐 **Vercel Deployment (Recommended)**

```bash
# 1. Connect Repository to Vercel
# 2. Configure Environment Variables
# 3. Deploy with Zero Configuration
# 4. Enjoy Global Edge Network Performance
```

### 🐳 **Docker Deployment**

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

## 🤝 **Contributing: Join the Revolution**

_Every great project is built by a community of passionate individuals._

### 🌟 **How to Contribute**

1. **🍴 Fork** the repository
2. **🌿 Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **✨ Make** your changes and add tests
4. **📝 Commit** with conventional messages: `git commit -m 'feat: add amazing feature'`
5. **🚀 Push** to your branch: `git push origin feature/amazing-feature`
6. **🎯 Open** a Pull Request

### 📏 **Code Standards**

```typescript
// Our Quality Standards
const codeStandards = {
  typescript: "Strict mode enabled",
  linting: "ESLint + Prettier",
  commits: "Conventional commit messages",
  testing: "80%+ code coverage",
  documentation: "Comprehensive & up-to-date",
};
```

---

## 📄 **License: Custom & Collaborative**

**This project operates under a Custom License** - see [LICENSE](LICENSE) for complete details.

**🎯 Summary**: This software is copyrighted and proprietary. Contributions are welcomed and celebrated, but commercial use requires explicit permission. We believe in collaborative innovation while protecting intellectual property.

---

## 👨💻 **Meet the Creator: Ansh Tank**

<div align="center">

```ascii
╔══════════════════════════════════════════════════════════════════════════════╗
║                                                                              ║
║    🚀 Full Stack Developer • 🎯 Problem Solver • 💡 Innovation Catalyst      ║
║                                                                              ║
║    "Code is poetry written in logic, and every application tells a story     ║
║     of human ambition, creativity, and the relentless pursuit of             ║
║     excellence."                                                             ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
```

**Specializing in Next.js, TypeScript, and MongoDB**

### 🌐 **Connect & Collaborate**

[**🎯 Portfolio**](https://anshtank.me) • [**📧 Email**](mailto:anshtank9@gmail.com) • [**💼 LinkedIn**](https://linkedin.com/in/anshtank9) • [**🐙 GitHub**](https://github.com/AnshTank)

### 📬 **Project Communication**

- **📧 Project Email**: [neverbreakthechain.anshtank@gmail.com](mailto:neverbreakthechain.anshtank@gmail.com)
- **🔗 Repository**: [Never-Break-The-Chain](https://github.com/AnshTank/Never-Break-The-Chain)
- **🐛 Issues & Features**: [GitHub Issues](https://github.com/AnshTank/Never-Break-The-Chain/issues)

</div>

---

## 🙏 **Acknowledgments: Standing on the Shoulders of Giants**

### 💡 **Philosophical Inspiration**

- **Jerry Seinfeld** - The "Don't Break the Chain" methodology that started it all
- **James Clear** - Atomic Habits principles and the science of habit formation
- **BJ Fogg** - Behavior design methodology and tiny habits research
- **Aristotle** - The philosophical foundation: "Excellence is a habit"

### 🛠️ **Technical Excellence**

- **Vercel Team** - Next.js framework and deployment platform
- **MongoDB** - Flexible and scalable database solution
- **Radix UI** - Accessible component primitives
- **Tailwind CSS** - Utility-first styling framework
- **Framer Motion** - Animation library for React

### 🌟 **Community & Support**

- **Open Source Contributors** - The countless developers who make innovation possible
- **Beta Testers** - Early adopters who provided invaluable feedback
- **Design Community** - Inspiration and best practices from around the world
- **Stack Overflow** - The collective knowledge that solves problems

---

<div align="center">

```ascii
╔══════════════════════════════════════════════════════════════════════════════╗
║                                                                              ║
║    🌟 STAR THIS REPOSITORY IF IT INSPIRES YOU! 🌟                           ║
║                                                                              ║
║    Every star is a vote of confidence, a spark of motivation,               ║
║    and a testament to the power of consistent daily habits.                 ║
║                                                                              ║
║    Built with ❤️, ☕, and countless hours of dedication                      ║
║    by Ansh Tank                                                              ║
║                                                                              ║
║    🔗 Transform your habits, transform your life - Never break the chain!   ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
```

**"The journey of a thousand miles begins with a single step, but the journey of transformation begins with a single habit."**

_Start your transformation today. Your future self will thank you._

---

![Footer](https://img.shields.io/badge/Made%20with-❤️%20%26%20TypeScript-red?style=for-the-badge)
![Ansh Tank](https://img.shields.io/badge/Created%20by-Ansh%20Tank-blue?style=for-the-badge&logo=github)
![Never Break The Chain](https://img.shields.io/badge/Never%20Break-The%20Chain-green?style=for-the-badge)

</div>
