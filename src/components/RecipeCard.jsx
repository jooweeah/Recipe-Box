import { useNavigate } from "react-router-dom";
import StarRating from "./StarRating";
import { CATEGORY_COLORS } from "../constants";

export default function RecipeCard({ recipe, onEdit, onDelete, onRate, onToggleTried, deleting }) {
  const { title, category, cookTime, servings, ingredients = [], steps = [], notes, rating = 0, triedIt = false } = recipe;
  const badgeCls = CATEGORY_COLORS[category] ?? "bg-gray-100 text-gray-700";
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/recipes/${recipe.id}`)}
      className="bg-white rounded-2xl shadow-sm border border-amber-100 p-5 flex flex-col gap-3 cursor-pointer hover:shadow-md hover:border-amber-200 transition-shadow duration-150"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-base font-bold text-amber-900 leading-snug">{title}</h3>
        {category && (
          <span className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded-full capitalize ${badgeCls}`}>
            {category}
          </span>
        )}
      </div>

      {/* Meta */}
      {(cookTime || servings) && (
        <div className="flex gap-4 text-xs text-amber-600">
          {cookTime && <span>⏱ {cookTime} min</span>}
          {servings && <span>🍽 {servings} serving{servings !== 1 ? "s" : ""}</span>}
        </div>
      )}

      {/* Counts */}
      {(ingredients.length > 0 || steps.length > 0) && (
        <div className="flex gap-3 text-xs text-gray-500">
          {ingredients.length > 0 && (
            <span>{ingredients.length} ingredient{ingredients.length !== 1 ? "s" : ""}</span>
          )}
          {steps.length > 0 && (
            <span>{steps.length} step{steps.length !== 1 ? "s" : ""}</span>
          )}
        </div>
      )}

      {/* Notes preview */}
      {notes && (
        <p className="text-xs text-gray-500 line-clamp-2">{notes}</p>
      )}

      {/* Rating + Tried It */}
      <div className="flex items-center justify-between pt-1">
        <StarRating rating={rating} onRate={onRate} />
        <button
          onClick={(e) => { e.stopPropagation(); onToggleTried(); }}
          className={`text-xs font-medium px-2.5 py-1 rounded-full transition-colors ${
            triedIt
              ? "bg-green-100 text-green-700 hover:bg-green-200"
              : "bg-gray-100 text-gray-500 hover:bg-gray-200"
          }`}
        >
          {triedIt ? "✓ Tried It" : "Want to Try"}
        </button>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-2 border-t border-amber-50">
        <button
          onClick={(e) => { e.stopPropagation(); onEdit(); }}
          className="flex-1 text-xs font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 py-1.5 rounded-lg transition-colors"
        >
          Edit
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          disabled={deleting}
          className="flex-1 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 disabled:opacity-50 py-1.5 rounded-lg transition-colors"
        >
          {deleting ? "Deleting…" : "Delete"}
        </button>
      </div>
    </div>
  );
}
