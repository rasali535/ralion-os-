# Ralion Platform — Deployment & Environment Setup Guide

**Ras Ali Labs | Enterprise AI-Powered Business Operating System**

---

## 1. Prerequisites

- **Node.js**: v20.x or higher
- **npm**: v10.x or higher
- **Firebase CLI**: `npm install -g firebase-tools`

---

## 2. Environment Variables Setup

Create `apps/web/.env.local`:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

AIML_API_KEY=37d9bb3553feb58ff0ec6ed0b8e86975
```

---

## 3. Local Development

Run the web application locally:

```bash
npm run web:dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

Run the Electron desktop app:

```bash
npm run desktop:dev
```

---

## 4. Building Production Packages

### Web Build
```bash
npm run web:build
```

### Desktop App Packaging
Target Windows (`.exe`/`.msi`), macOS (`.dmg`), and Linux (`.AppImage`):

```bash
npm run desktop:build
```

Executables will be saved to `apps/desktop/release/`.

---

## 5. Deploying Firebase Backend

Deploy Security Rules, Indexes, and Cloud Functions:

```bash
cd firebase
firebase deploy --only firestore,storage,functions
```
