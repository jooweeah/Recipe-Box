import { useState, useEffect, useRef } from "react";
import { signOut } from "firebase/auth";
import { addDoc, updateDoc, deleteDoc, onSnapshot, serverTimestamp, query, orderBy } from "firebase/firestore";
import { auth, userRecipesRef, userRecipeRef } from "../firebase";
import { fetchRecipeImage } from "../utils/unsplash";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import RecipeForm from "../components/RecipeForm";
import RecipeCard from "../components/RecipeCard";
import ConfirmDialog from "../components/ConfirmDialog";

export default function Dashboard() {
  const { user } = useAuth();
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
  const [dialog, setDialog] = useState(null);

  const [loadError, setLoadError] = useState(false);
  const [actionError, setActionError] = useState("");
  const actionErrorTimerRef = useRef(null);

  function showActionError(msg) {
    setActionError(msg);
    clearTimeout(actionErrorTimerRef.current);
    actionErrorTimerRef.current = setTimeout(() => setActionError(""), 4000);
  } // { title, message, confirmLabel, onConfirm, onCancel? }

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // ── Real-time listener ────────────────────────────────────────
  useEffect(() => {
    const q = query(userRecipesRef(user.uid), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setRecipes(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoadingRecipes(false);
    }, (err) => {
      console.error("Failed to load recipes:", err);
      setLoadingRecipes(false);
      setLoadError(true);
    });
    return unsubscribe;
  }, [user.uid]);

  // ── Auth ──────────────────────────────────────────────────────
  async function handleLogout() {
    try {
      await signOut(auth);
      navigate("/login");
    } catch {
      setDialog({
        title: "Logout Failed",
        message: "Something went wrong. Please try again.",
        confirmLabel: "OK",
        onConfirm: () => setDialog(null),
      });
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
    window.scrollTo({ top: 0, behavior: "smooth" });
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
        await updateDoc(userRecipeRef(user.uid, editingRecipe.id), {
          ...data,
          updatedAt: serverTimestamp(),
        });
        setSuccessMessage(`"${data.title}" updated!`);
        const titleChanged = data.title !== editingRecipe.title;
        if (titleChanged || !editingRecipe.imageUrl) {
          fetchRecipeImage(data.title)
            .then((imageUrl) => { if (imageUrl) updateDoc(userRecipeRef(user.uid, editingRecipe.id), { imageUrl }); })
            .catch(() => {});
        }
      } else {
        const docRef = await addDoc(userRecipesRef(user.uid), {
          ...data,
          createdAt: serverTimestamp(),
        });
        setSuccessMessage(`"${data.title}" saved!`);
        fetchRecipeImage(data.title)
          .then((imageUrl) => { if (imageUrl) updateDoc(docRef, { imageUrl }); })
          .catch(() => {});
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

  // ── Rating + Tried It ─────────────────────────────────────────
  async function handleRate(recipe, rating) {
    try {
      await updateDoc(userRecipeRef(user.uid, recipe.id), { rating });
    } catch (err) {
      console.error("Failed to save rating:", err);
      showActionError("Rating couldn't be saved. Please try again.");
    }
  }

  async function handleToggleTried(recipe) {
    try {
      await updateDoc(userRecipeRef(user.uid, recipe.id), { triedIt: !recipe.triedIt });
    } catch (err) {
      console.error("Failed to update tried status:", err);
      showActionError("Couldn't update status. Please try again.");
    }
  }

  // ── Delete ────────────────────────────────────────────────────
  function handleDelete(recipe) {
    setDialog({
      title: "Delete Recipe",
      message: `"${recipe.title}" will be permanently deleted. This can't be undone.`,
      confirmLabel: "Delete",
      onConfirm: () => { setDialog(null); confirmDelete(recipe); },
      onCancel: () => setDialog(null),
    });
  }

  async function confirmDelete(recipe) {
    setDeletingId(recipe.id);
    try {
      await deleteDoc(userRecipeRef(user.uid, recipe.id));
    } catch (err) {
      console.error(err);
      setDialog({
        title: "Delete Failed",
        message: "Something went wrong. Please try again.",
        confirmLabel: "OK",
        onConfirm: () => setDialog(null),
      });
    } finally {
      setDeletingId(null);
    }
  }

  // ── Filtering ─────────────────────────────────────────────────
  const needle = search.trim().toLowerCase();
  const filteredRecipes = recipes.filter((r) => {
    const matchesCategory = categoryFilter === "all" || r.category === categoryFilter;
    const matchesSearch =
      needle === "" ||
      r.title.toLowerCase().includes(needle) ||
      (r.ingredients ?? []).some((ing) => ing.name.toLowerCase().includes(needle));
    return matchesCategory && matchesSearch;
  });

  // ── Render ────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-amber-100">
      <header className="bg-white shadow px-6 py-4 flex items-center justify-between">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 hover:opacity-75 transition-opacity"
        >
          <span className="text-2xl">🍳</span>
          <span className="text-xl font-bold text-amber-800">Recipe Box</span>
        </button>
        <div className="flex items-center gap-3 min-w-0">
          <Link
            to="/profile"
            className="text-sm text-amber-700 hover:text-amber-900 hover:underline transition-colors truncate max-w-[120px] sm:max-w-xs"
          >
            {user?.displayName || user?.email}
          </Link>
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

        {actionError && (
          <div className="mb-6 px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg flex items-center justify-between gap-3">
            <span>{actionError}</span>
            <button onClick={() => setActionError("")} className="text-red-400 hover:text-red-600 font-bold leading-none">✕</button>
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
        ) : loadError ? (
          <div className="mt-16 text-center space-y-2">
            <p className="text-red-600 font-medium">Couldn't load your recipes.</p>
            <p className="text-sm text-gray-500">Check your connection and try refreshing the page.</p>
          </div>
        ) : recipes.length === 0 && !showForm ? (
          <p className="text-amber-600 text-center mt-16">
            No recipes yet. Add your first one!
          </p>
        ) : !loadingRecipes && recipes.length > 0 ? (
          <>
            {/* Search + filter toolbar */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by title or ingredient…"
                className="flex-1 border border-amber-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white"
              />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="border border-amber-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white text-gray-700"
              >
                <option value="all">All categories</option>
                <option value="breakfast">Breakfast</option>
                <option value="lunch">Lunch</option>
                <option value="dinner">Dinner</option>
                <option value="dessert">Dessert</option>
                <option value="snack">Snack</option>
              </select>
            </div>

            {filteredRecipes.length === 0 ? (
              <p className="text-amber-500 text-center mt-16">
                No recipes match your search.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredRecipes.map((recipe) => (
                  <RecipeCard
                    key={recipe.id}
                    recipe={recipe}
                    onEdit={() => openEditForm(recipe)}
                    onDelete={() => handleDelete(recipe)}
                    onRate={(rating) => handleRate(recipe, rating)}
                    onToggleTried={() => handleToggleTried(recipe)}
                    deleting={deletingId === recipe.id}
                  />
                ))}
              </div>
            )}
          </>
        ) : null}
      </main>

      {dialog && (
        <ConfirmDialog
          title={dialog.title}
          message={dialog.message}
          confirmLabel={dialog.confirmLabel}
          onConfirm={dialog.onConfirm}
          onCancel={dialog.onCancel}
          variant={dialog.onCancel ? "danger" : "primary"}
        />
      )}
    </div>
  );
}
