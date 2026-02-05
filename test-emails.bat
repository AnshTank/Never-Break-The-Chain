@echo off
echo 🚀 Starting Email Testing Suite...
echo.

REM Check if Node.js is available
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js not found. Please install Node.js first.
    pause
    exit /b 1
)

echo ✅ Node.js found
echo.

REM Check if the Next.js dev server is running
echo 🔍 Checking if development server is running...
curl -s http://localhost:3000 >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Development server not running on localhost:3000
    echo 💡 Please start your Next.js dev server first with: npm run dev
    pause
    exit /b 1
)

echo ✅ Development server is running
echo.

REM Run the email tests
echo 📧 Running email tests...
echo.
node test-emails.js

echo.
echo 🏁 Email testing complete!
echo 💡 Check your email inbox and server console logs for results
pause