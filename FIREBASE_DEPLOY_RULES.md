# 🚀 Deploying Firebase Security Rules - Step 3

## Prerequisites
- Firebase project created ✅
- Firebase credentials added to `.env.local` ✅

---

## Option 1: Quick Deploy (Recommended)

I've created security rules files for you:
- `firestore.rules` - Database security rules
- `storage.rules` - File storage security rules

### Steps:

**1. Install Firebase CLI (if not already installed)**
```bash
npm install -g firebase-tools
```

**2. Login to Firebase**
```bash
firebase login
```
- This will open a browser window
- Login with the same Google account you used for Firebase Console
- Allow permissions

**3. Initialize Firebase**
```bash
cd /home/user/projects/taravadu-mane
firebase init
```

When prompted:
- **Which Firebase features?** 
  - Select: `Firestore` (press Space to select)
  - Select: `Storage` (press Space to select)
  - Select: `Hosting` (press Space to select)
  - Press Enter
  
- **Use an existing project?** → Yes

- **Select your project** → Choose "taravadu-mane-portal" (or whatever you named it)

- **Firestore rules file?** → Press Enter (keep default: `firestore.rules`)

- **Firestore indexes file?** → Press Enter (keep default: `firestore.indexes.json`)

- **Storage rules file?** → Press Enter (keep default: `storage.rules`)

- **Public directory?** → Type: `out` and Press Enter

- **Configure as single-page app?** → `y` (yes)

- **Set up automatic builds?** → `N` (no)

- **Overwrite files?** → `N` (no) for all - we want to keep our custom rules!

**4. Deploy Security Rules**
```bash
firebase deploy --only firestore:rules,storage:rules
```

Wait ~10 seconds. You should see:
```
✔  Deploy complete!
```

✅ **Done!** Your security rules are now active.

---

## Option 2: Manual Deploy (Firebase Console)

If you prefer not to use CLI:

### Firestore Rules:
1. Go to Firebase Console → Firestore Database → Rules tab
2. Copy contents from `firestore.rules` file
3. Paste into the editor
4. Click "Publish"

### Storage Rules:
1. Go to Firebase Console → Storage → Rules tab
2. Copy contents from `storage.rules` file
3. Paste into the editor
4. Click "Publish"

---

## 🛡️ What These Rules Do

### Firestore Rules:
- ✅ Authenticated users can read announcements, events, documents
- ✅ Only admins can create/edit content
- ✅ Financial data (contributions, expenses) is **API-only** (extra secure!)
- ✅ Audit logs visible only to admins
- ✅ Multi-role support (admin, treasurer, member)

### Storage Rules:
- ✅ Authenticated users can read files
- ✅ Users can upload to their own folders
- ✅ Expense receipts are API-only (secure upload)

---

## ✅ How to Verify

1. **Check Firebase Console**
   - Firestore Database → Rules tab
   - Should see your custom rules

2. **Test in App**
   - Try accessing the portal
   - No unauthorized access errors

---

## 💡 Troubleshooting

**Q: firebase command not found?**
```bash
npm install -g firebase-tools
# or
sudo npm install -g firebase-tools
```

**Q: Permission denied?**
```bash
sudo npm install -g firebase-tools
```

**Q: Already initialized Firebase?**
- Skip `firebase init`
- Go straight to `firebase deploy --only firestore:rules,storage:rules`

---

📍 **You are here**: Security rules deployed!  
📍 **Next**: Create first admin user
