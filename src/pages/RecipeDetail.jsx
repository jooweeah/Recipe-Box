import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import StarRating from "../components/StarRating";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";

// ── Scaling helpers ───────────────────────────────────────────────────────────

function parseAmount(str) {
  if (!str || str.trim() === "") return null;
  const s = str.trim();
  const mixed = s.match(/^(\d+)\s+(\d+)\/(\d+)$/);
  if (mixed) return parseInt(mixed[1]) + parseInt(mixed[2]) / parseInt(mixed[3]);
  const frac = s.match(/^(\d+)\/(\d+)$/);
  if (frac) return parseInt(frac[1]) / parseInt(frac[2]);
  const n = parseFloat(s);
  return isNaN(n) ? null : n;
}

function formatAmount(n) {
  if (n === null) return "";
  const rounded = Math.round(n * 100) / 100;
  return rounded % 1 === 0
    ? String(Math.round(rounded))
    : rounded.toFixed(2).replace(/0+$/, "");
}

function scaleAmount(amountStr, factor) {
  const n = parseAmount(amountStr);
  if (n === null) return amountStr; // non-numeric (e.g. "a handful") — return as-is
  return formatAmount(n * factor);
}

// ─────────────────────────────────────────────────────────────────────────────

const CATEGORY_COLORS = {
  breakfast: "bg-yellow-100 text-yellow-800",
  lunch:     "bg-green-100 text-green-800",
  dinner:    "bg-blue-100 text-blue-800",
  dessert:   "bg-pink-100 text-pink-800",
  snack:     "bg-purple-100 text-purple-800",
};

export default function RecipeDetail() {
  const { id } = useParams();
  const user = useAuth();
  const navigate = useNavigate();

  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [fetchError, setFetchError] = useState(false);
  const [scaledServings, setScaledServings] = useState(null);
  const [actionError, setActionError] = useState("");
  const actionErrorTimerRef = useRef(null);

  function showActionError(msg) {
    setActionError(msg);
    clearTimeout(actionErrorTimerRef.current);
    actionErrorTimerRef.current = setTimeout(() => setActionError(""), 4000);
  }

  useEffect(() => {
    async function fetchRecipe() {
      try {
        const snap = await getDoc(doc(db, "users", user.uid, "recipes", id));
        if (!snap.exists()) {
          setNotFound(true);
        } else {
          const data = { id: snap.id, ...snap.data() };
          setRecipe(data);
          setScaledServings(data.servings ?? null);
        }
      } catch (err) {
        console.error(err);
        setFetchError(true);
      } finally {
        setLoading(false);
      }
    }
    fetchRecipe();
  }, [id, user.uid]);

  async function handleRate(newRating) {
    setRecipe((r) => ({ ...r, rating: newRating }));
    try {
      await updateDoc(doc(db, "users", user.uid, "recipes", id), { rating: newRating });
    } catch (err) {
      console.error("Failed to save rating:", err);
      setRecipe((r) => ({ ...r, rating: recipe?.rating ?? 0 }));
      showActionError("Rating couldn't be saved. Please try again.");
    }
  }

  async function handleToggleTried() {
    const newVal = !recipe?.triedIt;
    setRecipe((r) => ({ ...r, triedIt: newVal }));
    try {
      await updateDoc(doc(db, "users", user.uid, "recipes", id), { triedIt: newVal });
    } catch (err) {
      console.error("Failed to update tried status:", err);
      setRecipe((r) => ({ ...r, triedIt: !newVal }));
      showActionError("Couldn't update status. Please try again.");
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-amber-50 flex items-center justify-center">
        <p className="text-amber-500">Loading…</p>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="min-h-screen bg-amber-50 flex flex-col items-center justify-center gap-4">
        <p className="text-red-600 text-lg font-medium">Couldn't load this recipe.</p>
        <p className="text-sm text-gray-500">Check your connection and try again.</p>
        <button onClick={() => navigate("/")} className="text-sm text-amber-600 underline">
          Back to dashboard
        </button>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-amber-50 flex flex-col items-center justify-center gap-4">
        <p className="text-amber-700 text-lg font-medium">Recipe not found.</p>
        <button
          onClick={() => navigate("/")}
          className="text-sm text-amber-600 underline"
        >
          Back to dashboard
        </button>
      </div>
    );
  }

  const {
    title,
    category,
    cookTime,
    servings,
    ingredients = [],
    steps = [],
    notes,
    rating = 0,
    triedIt = false,
  } = recipe;

  const badgeCls = CATEGORY_COLORS[category] ?? "bg-gray-100 text-gray-700";
  const factor = servings && scaledServings ? scaledServings / servings : 1;

  return (
    <div className="min-h-screen bg-amber-50">
      {/* Header */}
      <header className="bg-white shadow-sm px-6 py-4 flex items-center gap-4">
        <button
          onClick={() => navigate("/")}
          className="text-amber-600 hover:text-amber-800 text-sm font-medium transition-colors"
        >
          ← Back
        </button>
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 hover:opacity-75 transition-opacity"
        >
          <span className="text-xl">🍳</span>
          <span className="text-lg font-bold text-amber-800">Recipe Box</span>
        </button>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-10">
        {actionError && (
          <div className="mb-6 px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg flex items-center justify-between gap-3">
            <span>{actionError}</span>
            <button onClick={() => setActionError("")} className="text-red-400 hover:text-red-600 font-bold leading-none">✕</button>
          </div>
        )}

        {/* Title + badge */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <h1 className="text-3xl font-bold text-amber-900 leading-tight">{title}</h1>
          {category && (
            <span className={`shrink-0 mt-1 text-sm font-medium px-3 py-1 rounded-full capitalize ${badgeCls}`}>
              {category}
            </span>
          )}
        </div>

        {/* Meta */}
        {cookTime && (
          <div className="flex gap-6 text-sm text-amber-600 mb-6">
            <span>⏱ {cookTime} min</span>
          </div>
        )}

        {/* Serving scaler + Rating + Tried It */}
        <div className="flex items-center flex-wrap gap-4 mb-8">
          {servings && scaledServings !== null && (
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-amber-800">Servings</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setScaledServings((s) => Math.max(1, s - 1))}
                  className="w-7 h-7 rounded-full bg-amber-100 hover:bg-amber-200 text-amber-800 font-bold text-base flex items-center justify-center transition-colors"
                  aria-label="Decrease servings"
                >
                  −
                </button>
                <span className="w-6 text-center text-sm font-semibold text-amber-900">
                  {scaledServings}
                </span>
                <button
                  onClick={() => setScaledServings((s) => s + 1)}
                  className="w-7 h-7 rounded-full bg-amber-100 hover:bg-amber-200 text-amber-800 font-bold text-base flex items-center justify-center transition-colors"
                  aria-label="Increase servings"
                >
                  +
                </button>
              </div>
              {scaledServings !== servings && (
                <button
                  onClick={() => setScaledServings(servings)}
                  className="text-xs text-amber-500 hover:text-amber-700 underline transition-colors"
                >
                  Reset
                </button>
              )}
            </div>
          )}

          <div className="flex items-center gap-3 ml-auto">
            <StarRating rating={rating} onRate={handleRate} />
            <button
              onClick={handleToggleTried}
              className={`text-sm font-medium px-4 py-1.5 rounded-full transition-colors ${
                triedIt
                  ? "bg-green-100 text-green-700 hover:bg-green-200"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              }`}
            >
              {triedIt ? "✓ Tried It" : "Want to Try"}
            </button>
          </div>
        </div>

        {/* Ingredients */}
        {ingredients.length > 0 && (
          <section className="mb-8">
            <h2 className="text-lg font-bold text-amber-800 mb-3">Ingredients</h2>
            <ul className="bg-white rounded-2xl border border-amber-100 divide-y divide-amber-50">
              {ingredients.map((ing, i) => (
                <li key={i} className="flex items-center justify-between px-4 py-3">
                  <span className="text-gray-800 font-medium text-base">{ing.name}</span>
                  {(ing.amount || ing.unit) && (
                    <span className="text-gray-500 text-sm">
                      {[scaleAmount(ing.amount, factor), ing.unit].filter(Boolean).join(" ")}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Steps */}
        {steps.length > 0 && (
          <section className="mb-8">
            <h2 className="text-lg font-bold text-amber-800 mb-3">Steps</h2>
            <ol className="space-y-3">
              {steps.map((step, i) => (
                <li key={i} className="flex gap-4">
                  <span className="shrink-0 w-7 h-7 rounded-full bg-amber-600 text-white text-xs font-bold flex items-center justify-center mt-0.5">
                    {i + 1}
                  </span>
                  <p className="text-sm text-gray-700 leading-relaxed pt-1">{step}</p>
                </li>
              ))}
            </ol>
          </section>
        )}

        {/* Notes */}
        {notes && (
          <section>
            <h2 className="text-lg font-bold text-amber-800 mb-3">Notes</h2>
            <p className="text-sm text-gray-600 bg-white rounded-2xl border border-amber-100 px-4 py-3 leading-relaxed whitespace-pre-line">
              {notes}
            </p>
          </section>
        )}
      </main>
    </div>
  );
}
