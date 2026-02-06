# 🚀 Quick Start Guide

All the guides you need to get your portal running!

## 📚 Setup Documentation

1. **[FIREBASE_SETUP.md](./FIREBASE_SETUP.md)** - Step 1: Create Firebase Project (15 min)
   - Create Firebase project
   - Enable Authentication
   - Set up Firestore  
   - Set up Storage
   - Get configuration values

2. **[FIREBASE_CREDENTIALS.md](./FIREBASE_CREDENTIALS.md)** - Step 2: Add Credentials (5 min)
   - Create `.env.local` file
   - Add Firebase config values
   - Verify setup

3. **[FIREBASE_DEPLOY_RULES.md](./FIREBASE_DEPLOY_RULES.md)** - Step 3: Deploy Security Rules (2 min)
   - Install Firebase CLI
   - Initialize project
   - Deploy Firestore and Storage rules

4. **[FIREBASE_ADMIN_USER.md](./FIREBASE_ADMIN_USER.md)** - Step 4: Create Admin User (5 min)
   - Create authentication user
   - Add user profile to Firestore
   - Test login

---

## ⚡ Quick Setup Script

Want to automate steps 3? Run this:

```bash
./firebase-setup.sh
```

This script will:
- Install Firebase CLI
- Login to Firebase
- Initialize your project
- Deploy security rules

---

## 📝 Manual Steps Required

You'll still need to do these manually:

1. **Firebase Console Setup** (Steps 1)
   - Follow: `FIREBASE_SETUP.md`

2. **Add Credentials** (Step 2)
   - Follow: `FIREBASE_CREDENTIALS.md`

3. **Create Admin User** (Step 4)  
   - Follow: `FIREBASE_ADMIN_USER.md`

---

## ⏱️ Total Time: ~27 minutes

- Step 1: 15 min (Firebase Console)
- Step 2: 5 min (Add credentials)
- Step 3: 2 min (Deploy rules - or use script!)
- Step 4: 5 min (Create admin user)

---

## 🆘 Need Help?

Check the troubleshooting sections in each guide or refer to:
- [Firebase Documentation](https://firebase.google.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)

---

## ✅ Checklist

Go through this in order:

- [ ] 1. Create Firebase project (`FIREBASE_SETUP.md`)
- [ ] 2. Add credentials to `.env.local` (`FIREBASE_CREDENTIALS.md`)
- [ ] 3. Deploy security rules (`FIREBASE_DEPLOY_RULES.md` or run `./firebase-setup.sh`)
- [ ] 4. Create first admin user (`FIREBASE_ADMIN_USER.md`)
- [ ] 5. Test login at http://localhost:3000
- [ ] 6. Explore the portal! 🎉

---

**Ready to start?** Open `FIREBASE_SETUP.md` and follow step 1!
