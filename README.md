# Recipe Box

A personal recipe manager where users can save, organize, and rate their favorite recipes. Each user 
has their own private recipe collection that syncs across devices.

## Features
1. Add, edit, and delete recipes
2. Search by title or ingredient
3. Filter by category
4. Serving size scaler
5. Star rating + Tried It toggle
6. User authentication
7. User profile with editable display name
8. Cloud database with user-specific data

## Tech Stack
- React (Vite, JavaScript + SWC)
- Firebase Auth + Firestore
- Tailwind CSS
- Deployed on [Netlify/Vercel]

## Setup
1. Clone the repo
2. Run `npm install`
3. Add Firebase config to `.env`
4. Run `npm run dev`

## Known Bugs / Limitations
- Avatar image upload not implemented.
- No recipe images. Recipes have no photo field.
- No recipe sharing. All recipes are private to the logged-in user.
- No email/password change on the profile page. Firebase requires re-authentication for these, which wasn't implemented.

## What I Learned
Building Recipe Box taught me how specific prompts can greatly assist with getting exactly what I want in an application. What was harder than I expected was working with Firestone for the first time and figuring out how to set it up. I had to use Claude to assist me with the steps, and it was extremely helpful guiding me through that. However, I wish Claude still was more helpful in finding bugs in its own code. I wish that next time I would have more testing, maybe with the help of other people, to help me identify bugs that both me and Claude couldn't find initally.


## Architecture Overview

### Frontend
- React (Vite) single-page application
- React Router for navigation and protected routes
- Components: Login, Signup, Dashboard, RecipeForm,  RecipeDetail, Profile
- Firebase SDK handles auth state and Firestore queries

### Backend (Firebase)
- **Firebase Auth** — email/password authentication, 
  session persistence
- **Firestore Database** — cloud storage for recipes 
  and user profiles

### Database Structure
users/{userId}
  - displayName: string
  - createdAt: timestamp

recipes/{recipeId}
  - userId: string
  - title: string
  - category: string
  - cookTime: string
  - servings: number
  - ingredients: [{ name, amount, unit }]
  - steps: [string]
  - rating: number
  - triedIt: boolean
  - notes: string
  - createdAt: timestamp

### Security
- Firestore rules restrict all reads/writes to the 
  authenticated user who owns the data
- Protected routes redirect unauthenticated users to login