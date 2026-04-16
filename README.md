# Recipe Box

A personal recipe manager to save, organize, and rate your favorite recipes. Each account has its own private collection that syncs across devices.

## Features

- Add, edit, and delete recipes
- Search by title or ingredient
- Filter by category
- Serving size scaler
- Star rating and "Tried It" toggle
- **AI Auto Fill** — type a title and let a local AI suggest the rest (optional, requires Ollama)

## Getting Started

**Prerequisites:** [Node.js](https://nodejs.org/) v18+ and a free [Firebase](https://firebase.google.com/) account.

### 1. Clone and install

```bash
git clone https://github.com/jooweeah/Recipe-Box.git
cd Recipe-Box
npm install
```

### 2. Set up Firebase

1. Create a project at [console.firebase.google.com](https://console.firebase.google.com/)
2. Enable **Email/Password** under **Build → Authentication**
3. Create a **Firestore Database** and set the security rules to:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /recipes/{recipeId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
  }
}
```

4. Go to **Project Settings → Your apps**, register a Web app, and copy the config

### 3. Add environment variables

Create a `.env` file in the project root and fill in your Firebase config values:

```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

### 4. Run

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## AI Auto Fill

Install [Ollama](https://ollama.com/), then run:

```bash
ollama pull gemma4:e2b
ollama serve
```

The **Auto Fill** button on the new recipe form will suggest ingredients, steps, and more based on the title. If Ollama isn't running, the button shows an error and the rest of the app works normally.

## Tech Stack

React + Vite · Firebase Auth + Firestore · Tailwind CSS · React Router
