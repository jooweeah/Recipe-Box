# 🍳 Recipe Box

A personal recipe manager where you can save, organize, and rate your favorite recipes. Each user has their own private collection that syncs across devices.

## Features

- **Add, edit, and delete** recipes with ingredients, steps, and notes
- **Serving size scaler** — adjust ingredient amounts on the fly
- **Star ratings** and a Tried It toggle
- **Search** by title or ingredient, **filter** by category
- **User accounts** — private per-user data, synced via the cloud
- **Editable profile** with display name

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + Vite (SWC) |
| Styling | Tailwind CSS 4 |
| Auth & Database | Firebase (Auth + Firestore) |
| Hosting | Netlify |

## Getting Started

### 1. Clone and install

```bash
git clone https://github.com/jooweeah/Recipe-Box.git
cd Recipe-Box
npm install
```

### 2. Configure Firebase

Create a `.env` file in the project root with your Firebase project credentials:

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

You can find these values in your [Firebase console](https://console.firebase.google.com/) under **Project Settings → Your apps**.

### 3. Run locally

```bash
npm run dev
```

## Project Structure

```
src/
├── components/      # Reusable UI (RecipeCard, RecipeForm, StarRating, …)
├── context/         # Auth state (AuthContext)
├── pages/           # Route-level views (Dashboard, RecipeDetail, Profile, …)
├── constants.js     # Shared UI constants (category colors)
└── firebase.js      # Firebase init + Firestore path helpers
```
