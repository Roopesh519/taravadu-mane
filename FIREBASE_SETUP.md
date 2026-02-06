# 🔥 Firebase Setup Guide - Step by Step

Follow these steps exactly to get your Taravadu Mane Portal running!

---

## ⏱️ Total Time: ~27 minutes

---

## 📋 Step 1: Create Firebase Project (15 min)

### 1.1 Go to Firebase Console
🔗 Open in browser: https://console.firebase.google.com/

### 1.2 Create New Project
1. Click **"Add project"** or **"Create a project"**
2. **Project name**: `Taravadu Mane Portal`
3. Click **Continue**
4. **Google Analytics**: Choose as you prefer (recommended: Enable)
   - If enabled, select or create Analytics account
5. Click **Create project**
6. Wait ~30 seconds for setup to complete
7. Click **Continue**

---

## 🔐 Step 2: Enable Authentication (3 min)

### 2.1 Navigate to Authentication
1. In left sidebar, click **"Build"** → **"Authentication"**
2. Click **"Get started"**

### 2.2 Enable Email/Password
1. Click on **"Sign-in method"** tab
2. Click **"Email/Password"**
3. Toggle **"Enable"** to ON
4. Click **"Save"**

✅ Authentication is now enabled!

---

## 📊 Step 3: Create Firestore Database (3 min)

### 3.1 Navigate to Firestore
1. In left sidebar, click **"Build"** → **"Firestore Database"**
2. Click **"Create database"**

### 3.2 Select Database Edition
1. Choose **"Standard edition"** (recommended)
   - ✅ Simple query engine with automatic indexing
   - ✅ Supports core operations (perfect for family portal!)
   - ✅ Free on Spark plan
   - ❌ Enterprise edition is overkill (for pipelines, MongoDB operations)
2. Click **"Next"**

### 3.3 Configure Security
1. Choose **"Start in production mode"**
   - Don't worry, we'll deploy custom rules later!
2. Click **"Next"**

### 3.4 Choose Location
1. Select location closest to you or your users
   - For India: Choose `asia-south1 (Mumbai)`
   - For US: Choose `us-central1`
2. Click **"Enable"**
3. Wait ~1 minute for database to be created

✅ Firestore is ready!

---

## 📦 Step 4: Set Up Storage (Optional - Requires Blaze Plan)

⚠️ **Important**: Cloud Storage requires the Blaze (pay-as-you-go) plan. 

**Two Options:**
1. **Skip for now** - Portal works great without Storage! (Recommended to start)
2. **Upgrade to Blaze** - See `STORAGE_LIMITATION.md` for details

### If You're Upgrading to Blaze:

### 4.1 Navigate to Storage
1. In left sidebar, click **"Build"** → **"Storage"**
2. Click **"Get started"**

### 4.2 Configure Security
1. Choose **"Start in production mode"**
2. Click **"Next"**

### 4.3 Choose Location
1. Use the **same location** as your Firestore database
2. Click **"Done"**

✅ Storage is ready!

### If You're Skipping Storage:

✅ **That's fine!** Continue to Step 5. You can add Storage later in 5 minutes.

**What works without Storage:**
- All authentication
- Dashboard and all pages  
- Announcements, Events, Contributions, Expenses
- Family directory and profiles

**What you'll add later:**
- File uploads
- Photo gallery
- Document storage

---

## 🔑 Step 5: Get Firebase Configuration (5 min)

### 5.1 Register Web App
1. Go to **Project Settings** (gear icon ⚙️ in left sidebar)
2. Scroll down to **"Your apps"** section
3. Click the **Web icon** (`</>`)
4. **App nickname**: `Taravadu Portal Web`
5. ✅ **Check** "Also set up Firebase Hosting"
6. Click **"Register app"**

### 5.2 Copy Configuration
You'll see a code snippet like this:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "taravadu-mane-portal.firebaseapp.com",
  projectId: "taravadu-mane-portal",
  storageBucket: "taravadu-mane-portal.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abc123def456"
};
```

### 5.3 ⚠️ IMPORTANT: Copy These Values
Copy the values (not the whole code), you'll need them next!

---

## ✅ CHECKPOINT: You should now have:
- ✅ Firebase project created
- ✅ Authentication enabled (Email/Password)
- ✅ Firestore database created
- ⚪ Storage bucket created (optional - skip if on Spark plan)
- ✅ Web app registered
- ✅ Configuration values copied

---

## 🎯 Next Steps

Now you're ready to:
1. **Add credentials to `.env.local`** (I'll help you with this!)
2. **Deploy security rules**
3. **Create first admin user**

---

## 💡 Troubleshooting

**Q: Can't find "Build" menu?**  
A: Try the new Firebase Console UI - look for "Authentication", "Firestore Database", "Storage" directly in the left sidebar.

**Q: Location is greyed out?**  
A: Firebase automatically uses the same location for all services in a project.

**Q: Don't see the config snippet?**  
A: Go to Project Settings → General → Scroll to "Your apps" → Click on your web app → You'll see the config.

---

📍 **You are here**: Completed Firebase Console setup!  
📍 **Next**: Add credentials to your project
