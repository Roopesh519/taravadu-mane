# 🔑 Adding Firebase Credentials - Step 2

## 📝 Creating .env.local File

Once you have your Firebase configuration from the Firebase Console, follow these steps:

---

## Step 1: Copy Your Firebase Config Values

From the Firebase Console, you should have values like:

```javascript
apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
authDomain: "your-project.firebaseapp.com"
projectId: "your-project-id"
storageBucket: "your-project.appspot.com"
messagingSenderId: "123456789012"
appId: "1:123456789012:web:abc123def456"
```

---

## Step 2: Create .env.local File

I'll create this file for you! Just replace the placeholder values with your actual Firebase config.

**File location**: `/home/user/projects/taravadu-mane/.env.local`

---

## Step 3: Format

Use this exact format (no quotes around values, except for the keys):

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_actual_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abc123def456
```

---

## 🎯 What to Do Next

### Option 1: I'll Create a Template (Recommended)
I can create the `.env.local` file with placeholder values. You just need to replace them with your actual Firebase values.

### Option 2: You Provide Values Now
Tell me your Firebase config values and I'll create the `.env.local` file for you immediately!

---

## ⚠️ IMPORTANT Security Notes

1. **Never commit `.env.local` to Git**
   - Already included in `.gitignore` ✅
   
2. **Keep these values private**
   - Don't share them publicly
   - Each environment should have its own values

3. **Restart dev server after adding**
   ```bash
   # Stop current server (Ctrl+C)
   npm run dev
   ```

---

## ✅ How to Verify It Worked

After adding credentials and restarting:

1. Go to http://localhost:3000
2. Page should load without Firebase errors
3. Try clicking "Member Login"
4. No error messages in browser console

---

📍 **You are here**: Ready to add Firebase credentials!  
📍 **Next**: Deploy security rules
