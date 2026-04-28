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
- Deployed on Netlify

## Setup
1. Clone the repo
2. Run `npm install`
3. Add Firebase config to `.env`
4. Run `npm run dev`

## Issues Fixed:
1. Duplicate CATEGORY_COLORS constant
Defined identically in both RecipeCard.jsx and RecipeDetail.jsx. Extract it to a shared src/constants.js file and import it in both places.

2. Hardcoded Firestore paths scattered across components
"users", user.uid, "recipes" appears in Dashboard.jsx, RecipeDetail.jsx, and Profile.jsx. Consolidate into helper functions in firebase.js so a database path change only requires one edit.

3. Unclear auth loading state
In AuthContext.jsx, undefined = loading, null = logged out, and an object = logged in. 

4. Delete App.css — it's empty and implies there's per-component CSS when there isn't.

5. Star ratings are easy to miss - Made stars larger with hover scale and brighter empty stars