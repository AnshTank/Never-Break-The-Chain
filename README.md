# 🔗 Never Break The Chain

A beautiful, modern journey tracking app built with Next.js that helps you maintain consistency in your daily habits using the "Don't Break the Chain" methodology.

## ✨ Features

### 🎯 **MNZD System**
Track 4 essential daily tasks:
- **M**editation
- **N**utrition  
- **Z**one (Exercise)
- **D**iscipline

### 📊 **Multiple Views**
- **Calendar View**: Interactive monthly calendar with color-coded progress
- **Progress View**: Comprehensive analytics and insights
- **Year Heatmap**: GitHub-style contribution heatmap
- **Journey Graph**: Visual progress tracking with multiple chart types

### 🔐 **Authentication**
- Secure user registration and login
- MongoDB integration for user data
- Password encryption with bcrypt

### 📱 **Responsive Design**
- Mobile-optimized interface
- Desktop-first progress analytics
- Smooth animations and transitions

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
- **Authentication**: Custom JWT-based auth
- **Charts**: Recharts
- **Icons**: Lucide React
- **TypeScript**: Full type safety

## 📁 Project Structure

```
├── app/                    # Next.js app directory
│   ├── api/auth/          # Authentication API routes
│   ├── login/             # Login page
│   ├── signup/            # Signup page
│   └── page.tsx           # Main dashboard
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── day-cell.tsx      # Calendar day component
│   ├── progress-view.tsx # Analytics dashboard
│   └── ...
├── lib/                  # Utilities and configurations
│   ├── mongodb.ts        # Database connection
│   ├── dummy-data.ts     # Sample data generator
│   └── utils.ts          # Helper functions
└── styles/               # Global styles
```

## 🎨 Color System

The app uses a 5-color gradient system based on task completion:

- 🔴 **Red (0 tasks)**: Missed day
- 🟠 **Orange (1 task)**: Minimal progress  
- 🟡 **Yellow (2 tasks)**: Partial completion
- 🔵 **Blue (3 tasks)**: Good progress
- 🟢 **Green (4 tasks)**: Perfect day

## 🔮 Upcoming Features

- [ ] Database integration for real user data
- [ ] Advanced analytics and insights
- [ ] Goal setting and streaks
- [ ] Social features and sharing
- [ ] Mobile app (React Native)
- [ ] Data export functionality

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Inspired by Jerry Seinfeld's "Don't Break the Chain" productivity method
- Built with modern web technologies and best practices
- Designed for simplicity and effectiveness

---

**Start your journey today and never break the chain! 🔗**