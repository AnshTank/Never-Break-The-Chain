# Never Break The Chain - MNZD Habit Tracker

A production-ready habit tracking application built with Next.js, TypeScript, and MongoDB that helps users build consistent daily habits through the MNZD methodology (Meditation, Nutrition, Zone, Discipline).

## ✨ Features

- **📅 Interactive Calendar**: Monthly view with real-time progress indicators and optimized today's cell updates
- **📊 GitHub-Style Heatmap**: Year-long journey visualization with skeleton loading states
- **📈 Advanced Analytics**: Multiple chart types with comprehensive progress tracking
- **🔔 Smart Notifications**: Morning and evening reminders with milestone celebrations
- **🔐 Secure Authentication**: JWT-based auth with OTP verification and device management
- **📱 Responsive Design**: Mobile-first PWA with optimized loading states
- **⚡ Performance Optimized**: Skeleton loading, immediate UI updates, and efficient caching

## 🧘 MNZD Methodology

The application is built around four core pillars:

- 🧘 **Meditation**: Mindfulness and mental clarity
- 📚 **Nutrition**: Healthy eating and continuous learning  
- 💪 **Zone**: Physical exercise and movement
- 🎯 **Discipline**: Focused work and skill development

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS, Framer Motion
- **Backend**: Node.js, MongoDB Atlas, JWT Authentication
- **Deployment**: Vercel
- **Notifications**: Web Push API, Email (Nodemailer)
- **Testing**: Jest, React Testing Library

## 🚀 Quick Start

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

## 📁 Project Structure

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
├── global-state.tsx   # Global state management
└── utils.ts           # General utilities
```

## 🔔 Notification System

The app includes an advanced notification system with:

- **📧 Email Notifications**: Morning motivation and evening check-ins
- **🎉 Milestone Alerts**: Celebrations for streak achievements
- **⏰ Smart Scheduling**: Optimal timing based on user behavior
- **📱 Multi-Channel**: Web push and email notifications

### External Cron Setup

For reliable notifications, set up external cron jobs at [cron-job.org](https://cron-job.org):

- **Morning**: `0 7 * * *` (7 AM)
- **Evening**: `0 20 * * *` (8 PM)
- **Random Scheduler**: `0 6,18 * * *` (6 AM & 6 PM)
- **Milestones**: `0 9,15,21 * * *` (9 AM, 3 PM, 9 PM)

URL: `https://your-domain.vercel.app/api/cron/notifications`
Headers: `Authorization: Bearer your-cron-secret`

## 🚀 Deployment

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

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## 🔒 Security

This application implements enterprise-grade security measures:

- **🔐 Authentication**: JWT tokens with secure rotation
- **🛡️ Rate Limiting**: Progressive blocking system
- **✅ Input Validation**: Comprehensive Zod schemas
- **🔒 Data Encryption**: bcrypt password hashing
- **🌐 CSRF Protection**: SameSite cookie attributes
- **📝 Audit Logging**: Security event tracking

See [SECURITY.md](SECURITY.md) for detailed security information.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'feat: add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under a Custom License. See [LICENSE](LICENSE) for details.

## 👨‍💻 Author

**Ansh Tank**
- Portfolio: [anshtank.me](https://anshtank.me)
- Email: [anshtank9@gmail.com](mailto:anshtank9@gmail.com)
- LinkedIn: [linkedin.com/in/anshtank9](https://linkedin.com/in/anshtank9)
- GitHub: [github.com/AnshTank](https://github.com/AnshTank)

---

© 2025 Never Break The Chain. Built with ❤️ by Ansh Tank.
