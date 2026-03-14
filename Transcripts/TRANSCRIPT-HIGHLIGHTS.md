## 1. Planning Setup
> I'm building a recipe manager app called Recipe Box using React, Vite,        
Firebase Auth, and Firestore. Help me set up Firebase.
 
- Before writing any code, I reminded Claude of my full tech stack and asked it to help me set up Firebase Auth and Firestone together. This gave me a foundation to build every feature on top instead of wiring the backend later.

## 2. Auditing Claude's own output
>  Review your own work and check for: console errors, missing imports, broken  
routes, and any edge cases like empty states or unauthenticated access. Tell me if anything looks incomplete.

- I repeatedly asked Claude to review its own work and check for errors. This caught several issues I wouldn't have noticed until testing.

## 3. Changing UI fixes
> Review your work. The unit textbox does not fit in the container."
> Can you move the star rating and "want to try" to the right side of the       
servings scale when you open a recipe? and make the "Recipe Box" logo take you  
back to the home page dashboard?   

- After testing the app myself, I noticed some visual issues such as the textbox overflowing its container, the star rating palcement, and the logo not being clickable. I described each issue so Claude knew exactly what to fix.

## Debugging console errors
> explain these errors:                                                         
Login.jsx line 24 'err' is defined but never used.                              
AuthContent.jsx                                                                 
line 32 Fast refresh only works when a file only exports components. Use a new  
file to share constants or functions between components.                        
line 37 Fast refresh only works when a file only exports components. Use a new  
file to share constants or functions between components. 

- I found 3 errors, shared specific the file names and line numbers, and asked Claude to explain them before fixing them. This helped me understand what went wrong instead of applying a fix blindly.

## Adding FireStone Security Rules
> Write Firestore security rules so users can only read and write their own     
recipes. Show me where to paste them in the Firebase console.

- I asked Claude to write security rules so users can only access their own recipes, and asked Claude to help me where to put them in the FireBase console. This ensures the app is safe for users.

