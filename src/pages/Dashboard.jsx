import { useState, useEffect, useRef } from "react";
import { signOut } from "firebase/auth";
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, serverTimestamp, query, orderBy } from "firebase/firestore";
import { auth, db } from "../firebase";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import RecipeForm from "../components/RecipeForm";
import RecipeCard from "../components/RecipeCard";

export default function Dashboard() {
  const user = useAuth();
  const navigate = useNavigate();

  const [recipes, setRecipes] = useState([]);
  const [loadingRecipes, setLoadingRecipes] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState(null); // null = add mode

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const successTimerRef = useRef(null);

  // ── Real-time listener ────────────────────────────────────────
  useEffect(() => {
    const recipesRef = collection(db, "users", user.uid, "recipes");
    const q = query(recipesRef, orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setRecipes(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoadingRecipes(false);
    }, (err) => {
      console.error("Failed to load recipes:", err);
      setLoadingRecipes(false);
    });
    return unsubscribe;
  }, [user.uid]);

  // ── Auth ──────────────────────────────────────────────────────
  async function handleLogout() {
    try {
      await signOut(auth);
      navigate("/login");
    } catch {
      alert("Logout failed. Please try again.");
    }
  }

  // ── Form open/close ───────────────────────────────────────────
  function openAddForm() {
    setEditingRecipe(null);
    setSaveError("");
    setShowForm(true);
  }

  function openEditForm(recipe) {
    setEditingRecipe(recipe);
    setSaveError("");
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingRecipe(null);
    setSaveError("");
  }

  // ── Save (add or update) ──────────────────────────────────────
  async function handleSaveRecipe(data) {
    setSaving(true);
    setSaveError("");
    try {
      if (editingRecipe) {
        await updateDoc(doc(db, "users", user.uid, "recipes", editingRecipe.id), {
          ...data,
          updatedAt: serverTimestamp(),
        });
        setSuccessMessage(`"${data.title}" updated!`);
      } else {
        await addDoc(collection(db, "users", user.uid, "recipes"), {
          ...data,
          createdAt: serverTimestamp(),
        });
        setSuccessMessage(`"${data.title}" saved!`);
      }
      closeForm();
      clearTimeout(successTimerRef.current);
      successTimerRef.current = setTimeout(() => setSuccessMessage(""), 4000);
    } catch (err) {
      setSaveError("Failed to save recipe. Please try again.");
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  // ── Delete ────────────────────────────────────────────────────
  async function handleDelete(recipe) {
    if (!window.confirm(`Delete "${recipe.title}"? This can't be undone.`)) return;
    setDeletingId(recipe.id);
    try {
      await deleteDoc(doc(db, "users", user.uid, "recipes", recipe.id));
    } catch (err) {
      alert("Failed to delete recipe. Please try again.");
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  }

  // ── Render ────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-amber-50">
      <header className="bg-white shadow-sm px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🍳</span>
          <span className="text-xl font-bold text-amber-800">Recipe Box</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-amber-700">{user?.email}</span>
          <button
            onClick={handleLogout}
            className="bg-amber-100 hover:bg-amber-200 text-amber-800 font-medium px-4 py-1.5 rounded-lg text-sm transition-colors duration-200"
          >
            Log out
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold text-amber-800">Your Recipes</h2>
          {!showForm && (
            <button
              onClick={openAddForm}
              className="bg-amber-600 hover:bg-amber-700 text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors duration-200"
            >
              + Add Recipe
            </button>
          )}
        </div>

        {successMessage && (
          <div className="mb-6 px-4 py-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg">
            {successMessage}
          </div>
        )}

        {showForm && (
          <div className="mb-8">
            <RecipeForm
              key={editingRecipe?.id ?? "new"}
              initialData={editingRecipe}
              onCancel={closeForm}
              onSubmit={handleSaveRecipe}
              saving={saving}
              saveError={saveError}
            />
          </div>
        )}

        {loadingRecipes ? (
          <p className="text-amber-500 text-center mt-16">Loading recipes…</p>
        ) : recipes.length === 0 && !showForm ? (
          <p className="text-amber-600 text-center mt-16">
            No recipes yet. Add your first one!
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recipes.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                onEdit={() => openEditForm(recipe)}
                onDelete={() => handleDelete(recipe)}
                deleting={deletingId === recipe.id}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
