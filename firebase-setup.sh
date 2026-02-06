#!/bin/bash

# Taravadu Mane Portal - Quick Setup Script
# This script helps you setup Firebase quickly

echo "🌿 Taravadu Mane Family Portal - Firebase Setup"
echo "================================================"
echo ""

# Check if firebase-tools is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI not found. Installing..."
    npm install -g firebase-tools
    if [ $? -ne 0 ]; then
        echo "⚠️  Installation failed. Try: sudo npm install -g firebase-tools"
        exit 1
    fi
    echo "✅ Firebase CLI installed!"
else
    echo "✅ Firebase CLI is already installed"
fi

echo ""
echo "🔐 Step 1: Login to Firebase"
echo "----------------------------"
firebase login

if [ $? -ne 0 ]; then
    echo "❌ Login failed. Please try again."
    exit 1
fi

echo ""
echo "✅ Login successful!"
echo ""

echo "🔥 Step 2: Initialize Firebase Project"
echo "--------------------------------------"
echo "When prompted:"
echo "  - Select: Firestore, Storage, Hosting"
echo "  - Choose: Use an existing project"
echo "  - Select your project from the list"
echo "  - Accept defaults for file names"
echo "  - Public directory: type 'out'"
echo "  - Single-page app: y"
echo "  - Overwrite: N (keep our custom files)"
echo ""
read -p "Press Enter to continue..."

firebase init

if [ $? -ne 0 ]; then
    echo "❌ Initialization failed."
    exit 1
fi

echo ""
echo "🚀 Step 3: Deploy Security Rules"
echo "--------------------------------"
firebase deploy --only firestore:rules,storage:rules

if [ $? -ne 0 ]; then
    echo "❌ Deployment failed."
    exit 1
fi

echo ""
echo "✅ Security rules deployed successfully!"
echo ""
echo "================================================"
echo "🎉 Firebase Setup Complete!"
echo "================================================"
echo ""
echo "📋 What's done:"
echo "  ✅ Firebase CLI installed"
echo "  ✅ Logged in to Firebase"
echo "  ✅ Project initialized"
echo "  ✅ Security rules deployed"
echo ""
echo "📋 Next steps:"
echo "  1. Add Firebase credentials to .env.local"
echo "     See: FIREBASE_CREDENTIALS.md"
echo ""
echo "  2. Create first admin user"
echo "     See: FIREBASE_ADMIN_USER.md"
echo ""
echo "  3. Start development server:"
echo "     npm run dev"
echo ""
echo "Happy coding! 🌿"
