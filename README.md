# 🌿 Taravadu Mane Family Portal

A modern, secure, role-based family community portal for managing announcements, events, contributions, expenses, documents and family directory for a traditional Taravadu Mane.

## 🎯 Features

###  Public Pages
- **Home** - Hero section with upcoming events
- **About** - Family values and heritage
- **History & Deity** - Ancestral home and deity information
- **Gallery** - Family photos and memories
- **Contact** - Get in touch with the committee
- **Login** - Secure member authentication

### 🔐 Members Area
- **Dashboard** - Personalized overview with 4-card layout
  - Next Event
  - Pending Contributions
  - Recent Announcements
  - Expense Summary
- **Announcements** - Family updates and notices
- **Events** - Calendar and list of rituals, celebrations
- **Contributions** - Yearly contribution tracking
- **Expenses** - Transparent expense management
- **Documents Vault** - Secure document storage (Land, Temple, Minutes, Photos)
- **Family Directory** - Member contacts and profiles
- **Profile** - Personal information management

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui
- **Backend**: Next.js API Routes (for financial operations)
- **Authentication**: Firebase Authentication
- **Database**: Firestore
- **Storage**: Firebase Storage
- **Hosting**: Firebase Hosting

## 🏗️ Architecture Highlights

- **Multi-Role RBAC**: Users have `roles[]` array (admin, treasurer, member, etc.)
- **Secure Financial Operations**: All financial writes go through API routes, not direct Firestore
- **Audit Logging**: Transparent tracking of all critical actions
- **Transactions Ledger**: Accounting-ready financial records
- **Future-Ready**: Architected for payments, notifications, mobile app

## 📦 Installation

1. **Clone the repository**
   ```bash
   cd taravadu-mane
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   - Copy `.env.local.example` to `.env.local`
   - Fill in your Firebase credentials (see Firebase Setup below)

4. **Run development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   - Visit [http://localhost:3000](http://localhost:3000)

## 🔥 Firebase Setup

### 1. Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project: "Taravadu Mane Portal"
3. Enable Google Analytics (optional)

### 2. Enable Firebase Authentication
1. Go to **Authentication** → **Sign-in method**
2. Enable **Email/Password**

### 3. Create Firestore Database
1. Go to **Firestore Database**
2. Click **Create database**
3. Start in **production mode**
4. Choose a location

### 4. Create Firebase Storage
1. Go to **Storage**
2. Click **Get started**
3. Start in **production mode**

### 5. Get Firebase Config
1. Go to **Project Settings** → **General**
2. Scroll to **Your apps** → **Web app**
3. Click **Add app** (or use existing)
4. Copy the config values
5. Paste into `.env.local`:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 6. Deploy Security Rules
```bash
npm install -g firebase-tools
firebase login
firebase init
# Select Firestore and Storage
firebase deploy --only firestore:rules,storage:rules
```

### 7. Create First Admin User
1. Go to **Firebase Authentication**
2. Click **Add user**
3. Enter email and password
4. Note the UID
5. Go to **Firestore Database**
6. Create collection `users`
7. Add document with the UID:
   ```json
   {
     "name": "Your Name",
     "email": "your.email@example.com",
     "roles": ["admin"],
     "created_at": [Timestamp - Now]
   }
   ```

## 📝 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## 📁 Project Structure

```
taravadu-mane/
├── src/
│   ├── app/
│   │   ├── (public)/          # Public pages
│   │   │   ├── page.tsx       # Home
│   │   │   ├── about/
│   │   │   ├── history/
│   │   │   ├── gallery/
│   │   │   ├── contact/
│   │   │   └── login/
│   │   ├── (protected)/       # Members-only pages
│   │   │   ├── dashboard/
│   │   │   ├── announcements/
│   │   │   ├── events/
│   │   │   ├── contributions/
│   │   │   ├── expenses/
│   │   │   ├── documents/
│   │   │   ├── directory/
│   │   │   └── profile/
│   │   ├── api/               # Backend API routes (future)
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/                # shadcn/ui components
│   │   ├── auth/              # Auth components
│   │   ├── public/            # Public components
│   │   └── protected/         # Protected components
│   └── lib/
│       ├── firebase/          # Firebase config & helpers
│       ├── types/             # TypeScript types
│       └── utils.ts
├── firestore.rules            # Firestore security rules
├── storage.rules              # Storage security rules
├── firebase.json
└── package.json
```

## 🔐 Security

- **Authentication Required**: All member pages require login
- **Role-Based Access**: Multi-role system (admin, treasurer, member)
- **Firestore Rules**: Authenticated reads, admin-only or API-only writes
- **Financial Protection**: Contributions, expenses, transactions via API only
- **Audit Logging**: All critical actions logged

## 🎨 Design

- **Spiritual Theme**: Saffron (#F97316), Forest Green (#10B981), Gold (#F59E0B)
- **Clean & Minimal**: Community-focused aesthetics
- **Fully Responsive**: Mobile-first design
- **shadcn/ui**: Modern, accessible components

## 🚀 Deployment

### Deploy to Firebase Hosting

1. **Build the production bundle**
   ```bash
   npm run build
   npm run export  # If using static export
   ```

2. **Deploy to Firebase**
   ```bash
   firebase deploy
   ```

3. **Your site will be live at**
   - `https://your-project.web.app`

## 📚 Future Enhancements

The V1 architecture supports:
- ✅ Payment Integration (Razorpay/UPI)
- ✅ Email Notifications (Resend/SendGrid)
- ✅ WhatsApp Notifications
- ✅ Mobile App (React Native)
- ✅ Family Tree Visualization
- ✅ Automated Backups
- ✅ Analytics Dashboard

## 💡 Usage Tips

### For Members
- Login with credentials provided by admin
- View dashboard for quick overview
- Check announcements for updates
- View contributions and expenses for transparency
- Access documents from the vault
- Update your profile information

### For Admins
- Manage user roles in Firebase Console
- Create announcements and events
- Record contributions and expenses
- Upload documents
- View audit logs

## 🤝 Contributing

This is a private family portal. For updates or bug reports, contact the admin team.

## 📄 License

Private - Family Use Only

## 📧 Support

For technical support, contact: admin@taravadumane.family

---

**Built with 💚 for the Taravadu Mane Family**
