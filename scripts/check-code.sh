#!/bin/bash

# Local development script for code quality checks
# Run this before committing changes

echo "🔍 Running code quality checks..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Please run this script from the repository root"
    exit 1
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Run Prettier check
echo "✨ Checking code formatting with Prettier..."
if npm run format:check; then
    echo "✅ Code formatting is correct"
else
    echo "❌ Code formatting issues found"
    echo "💡 Run 'npm run format' to fix formatting"
    exit 1
fi

# Run ESLint
echo "🔍 Running ESLint..."
if npm run lint; then
    echo "✅ Linting passed"
else
    echo "❌ Linting issues found"
    echo "💡 Run 'npm run lint:fix' to fix auto-fixable issues"
    exit 1
fi

# Type checking
echo "🔷 Running TypeScript type checking..."
cd package
if npx tsc --noEmit; then
    echo "✅ Type checking passed"
else
    echo "❌ Type checking failed"
    exit 1
fi
cd ..

# Build check
echo "🏗️  Running build check..."
if npm run build:package; then
    echo "✅ Build succeeded"
else
    echo "❌ Build failed"
    exit 1
fi

echo ""
echo "🎉 All checks passed! Your code is ready for commit."
echo ""
echo "Next steps:"
echo "  git add ."
echo "  git commit -m 'Your commit message'"
echo "  git push"