const CATEGORY_COLORS = {
  breakfast: "bg-yellow-100 text-yellow-800",
  lunch:     "bg-green-100 text-green-800",
  dinner:    "bg-blue-100 text-blue-800",
  dessert:   "bg-pink-100 text-pink-800",
  snack:     "bg-purple-100 text-purple-800",
};

export default function RecipeCard({ recipe, onEdit, onDelete, deleting }) {
  const { title, category, cookTime, servings, ingredients = [], steps = [], notes } = recipe;
  const badgeCls = CATEGORY_COLORS[category] ?? "bg-gray-100 text-gray-700";

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-amber-100 p-5 flex flex-col gap-3">

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

      {/* Actions */}
      <div className="flex gap-2 mt-auto pt-2 border-t border-amber-50">
        <button
          onClick={onEdit}
          className="flex-1 text-xs font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 py-1.5 rounded-lg transition-colors"
        >
          Edit
        </button>
        <button
          onClick={onDelete}
          disabled={deleting}
          className="flex-1 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 disabled:opacity-50 py-1.5 rounded-lg transition-colors"
        >
          {deleting ? "Deleting…" : "Delete"}
        </button>
      </div>
    </div>
  );
}
