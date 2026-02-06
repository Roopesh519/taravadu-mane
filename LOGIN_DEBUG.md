# 🔍 Login Troubleshooting Guide

## What I See From Your Screenshot

✅ **Good News**: Firebase Authentication is working!
- `accounts:signInWithPassword` - **200 OK**
- `accounts:lookup` - **200 OK**

❌ **Problem**: You're being redirected back to login

This means the issue is with **loading your user profile from Firestore**, not authentication.

---

## 🎯 Step-by-Step Debug

### Step 1: Check Browser Console for Errors

**Open Console Tab**:
1. In your browser DevTools (already open), click the **"Console"** tab (next to Network)
2. Look for **red error messages**
3. Take a screenshot and share it with me

**Common errors you might see**:
- `FirebaseError: Missing or insufficient permissions`
- `User document not found`
- `Cannot read property 'roles' of undefined`

---

### Step 2: Verify Firestore User Document Exists

Let's check if your user profile was created correctly:

**In Firebase Console**:
1. Go to **Firestore Database**
2. Look for `users` collection
3. Check if there's a document with your auth UID

**Screenshot what you see** or tell me:
- ✅ Do you see a `users` collection?
- ✅ Is there a document inside it?
- ✅ Does the document ID match your auth user UID?

---

### Step 3: Check Firestore Security Rules

The issue might be that Firestore rules aren't deployed yet!

**Quick Fix - Temporarily Allow All Reads**:

1. Go to Firebase Console → **Firestore Database** → **Rules** tab
2. Replace the rules with this **temporarily**:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;  // TEMPORARY - for testing only!
    }
  }
}
```

3. Click **"Publish"**
4. Try logging in again

⚠️ **Note**: This is just for testing! We'll fix the rules properly after.

---

### Step 4: Verify UID Match

**The #1 reason for login issues**: Document ID doesn't match auth UID

**Check this**:
1. Firebase Console → **Authentication** → Copy the **UID** of your user
2. Firebase Console → **Firestore Database** → `users` collection → Check document ID
3. **They must be EXACTLY the same**

---

## 🔧 Quick Fixes Based on Common Issues

### Fix 1: Missing User Document

If `users` collection is empty:

**Re-create the user document**:
1. Go to Firestore Database
2. Click **"Start collection"** → Collection ID: `users`
3. Document ID: **Paste your auth UID** (from Authentication tab)
4. Add fields:
   - `name` (string): "Your Name"
   - `email` (string): "admin@taravadumane.family"
   - `roles` (array): ["admin"]
   - `created_at` (timestamp): Now

### Fix 2: UID Mismatch

If document exists but UID doesn't match:
1. **Delete** the wrong document
2. Create new one with correct UID from Authentication

### Fix 3: Firestore Rules Not Deployed

If you get permission errors:
1. Use the temporary rules above (Step 3)
2. We'll deploy proper rules after login works

---

## 📸 What I Need From You

To help debug, please share:

1. **Console tab screenshot** - Any red errors?
2. **Firestore screenshot** - Show me the `users` collection
3. **Authentication UID** - What's the UID of your admin user?

Or just tell me what you see and I'll guide you through the fix!

---

## 🚀 Expected Flow When Working

When login works correctly:
1. Enter email/password → Click "Sign In"
2. Firebase authenticates (✅ you've got this!)
3. AuthProvider fetches user document from Firestore
4. Checks if user has `roles` array
5. Redirects to `/dashboard`
6. Shows: "Namaskara, Your Name 🙏"

We're stuck at step 3!

---

**Let me know what you find and I'll help you fix it!** 🔍
