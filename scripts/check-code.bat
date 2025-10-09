@echo off
REM Local development script for code quality checks
REM Run this before committing changes

echo 🔍 Running code quality checks...

REM Check if we're in the right directory
if not exist "package.json" (
    echo ❌ Please run this script from the repository root
    exit /b 1
)

REM Install dependencies if needed
if not exist "node_modules" (
    echo 📦 Installing dependencies...
    npm install
)

REM Run Prettier check
echo ✨ Checking code formatting with Prettier...
npm run format:check
if %errorlevel% neq 0 (
    echo ❌ Code formatting issues found
    echo 💡 Run 'npm run format' to fix formatting
    exit /b 1
)
echo ✅ Code formatting is correct

REM Run ESLint
echo 🔍 Running ESLint...
npm run lint
if %errorlevel% neq 0 (
    echo ❌ Linting issues found
    echo 💡 Run 'npm run lint:fix' to fix auto-fixable issues
    exit /b 1
)
echo ✅ Linting passed

REM Type checking
echo 🔷 Running TypeScript type checking...
cd package
npx tsc --noEmit
if %errorlevel% neq 0 (
    echo ❌ Type checking failed
    cd ..
    exit /b 1
)
echo ✅ Type checking passed
cd ..

REM Build check
echo 🏗️  Running build check...
npm run build:package
if %errorlevel% neq 0 (
    echo ❌ Build failed
    exit /b 1
)
echo ✅ Build succeeded

echo.
echo 🎉 All checks passed! Your code is ready for commit.
echo.
echo Next steps:
echo   git add .
echo   git commit -m "Your commit message"
echo   git push