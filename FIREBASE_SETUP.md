# Firebase + Vercel setup for Flowline

Flowline saves data **locally first** (browser cache). When someone signs in with Google, local flows merge into their cloud account and sync across devices.

---

## 1. Create a Firebase project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. **Add project** (e.g. `flowline-app`)
3. Disable Google Analytics if you don't need it (optional)

---

## 2. Enable Google sign-in

1. Firebase Console → **Build** → **Authentication**
2. **Get started** → **Sign-in method**
3. Enable **Google**
4. Set a support email → **Save**

---

## 3. Create Firestore

1. Firebase Console → **Build** → **Firestore Database**
2. **Create database**
3. Start in **production mode** (we'll add rules next)
4. Pick a region close to your users (e.g. `us-central1`)

### Security rules

Firebase Console → Firestore → **Rules**, paste:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

Or deploy `firestore.rules` from this repo with the Firebase CLI.

**Publish** the rules.

### Data shape

Each user gets one document:

```
users/{firebaseAuthUid}
  projects: [...]
  sessions: [...]
  stats: {...}
  pomodoro: {...}
  preferences: {...}
  updatedAt: "2026-05-30T..."
  email, displayName, photoURL (optional profile fields)
```

---

## 4. Register the web app

1. Firebase Console → **Project settings** (gear) → **General**
2. Under **Your apps** → **Web** (`</>`)
3. App nickname: `Flowline Web`
4. Copy the `firebaseConfig` values

---

## 5. Local environment variables

Copy the example file and fill in values from Firebase:

```bash
cp .env.example .env.local
```

`.env.local`:

```env
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
```

Restart the dev server after changing env vars:

```bash
npm run dev
```

---

## 6. Authorized domains (required for production)

Firebase Console → **Authentication** → **Settings** → **Authorized domains**

Add:

- `localhost` (usually already there)
- `flowline-alpha.vercel.app` (or your Vercel URL)
- Custom domain if you add one later

---

## 7. Deploy to Vercel

### Push to GitHub

```bash
git add .
git commit -m "Add Firebase auth and cloud sync"
git push origin main
```

### Import in Vercel

1. [vercel.com](https://vercel.com) → **Add New Project**
2. Import your GitHub repo
3. Framework preset: **Vite**
4. Build command: `npm run build`
5. Output directory: `dist`

### Add environment variables in Vercel

Project → **Settings** → **Environment Variables**

Add all six `VITE_FIREBASE_*` variables (same values as `.env.local`).

Apply to **Production**, **Preview**, and **Development**.

Redeploy after adding env vars.

---

## 8. How sync works

| Scenario | Behavior |
|----------|----------|
| Guest uses app | Data saved to `localStorage` only |
| Guest signs in, has local flows | Local + cloud **merged**, then uploaded |
| Guest signs in, no local data | Cloud data downloaded |
| Signed-in user edits | Saves locally + debounced cloud save (~2s) |
| Same account, new device | Cloud data loads; can merge with any local data there |
| Sign out | Local data stays on that browser |

---

## 9. Troubleshooting

**Sign-in popup blocked** — Allow popups for your domain.

**`auth/unauthorized-domain`** — Add the domain under Firebase → Authentication → Authorized domains.

**Sync error** — Check Firestore rules are published and the user is authenticated.

**Sign-in button missing** — Firebase env vars are not set. Copy `.env.example` → `.env.local` and restart dev.

**Data not merging** — Open DevTools → Application → Local Storage → `flowline-app-state-v4`. Local data should still be there until sign-in merges it.

---

## 10. Optional: Firebase CLI deploy rules

```bash
npm install -g firebase-tools
firebase login
firebase init firestore   # select existing project, use firestore.rules
firebase deploy --only firestore:rules
```
