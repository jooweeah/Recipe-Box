import { useState } from "react";

const CATEGORIES = ["breakfast", "lunch", "dinner", "dessert", "snack"];

const EMPTY_INGREDIENT = { name: "", amount: "", unit: "" };
const EMPTY_FORM = {
  title: "",
  category: "",
  cookTime: "",
  servings: "",
  notes: "",
};

export default function RecipeForm({ onSubmit, onCancel, saving = false, saveError = "", initialData = null }) {
  const [fields, setFields] = useState(() =>
    initialData
      ? { title: initialData.title ?? "", category: initialData.category ?? "", cookTime: initialData.cookTime ?? "", servings: initialData.servings ?? "", notes: initialData.notes ?? "" }
      : EMPTY_FORM
  );
  const [ingredients, setIngredients] = useState(() =>
    initialData?.ingredients?.length ? initialData.ingredients : [{ ...EMPTY_INGREDIENT }]
  );
  const [steps, setSteps] = useState(() =>
    initialData?.steps?.length ? initialData.steps : [""]
  );
  const [errors, setErrors] = useState({});

  // ── Basic fields ──────────────────────────────────────────────
  function handleChange(e) {
    const { name, value } = e.target;
    setFields((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  }

  // ── Ingredients ───────────────────────────────────────────────
  function handleIngredientChange(index, e) {
    const { name, value } = e.target;
    setIngredients((prev) =>
      prev.map((ing, i) => (i === index ? { ...ing, [name]: value } : ing))
    );
  }

  function addIngredient() {
    setIngredients((prev) => [...prev, { ...EMPTY_INGREDIENT }]);
  }

  function removeIngredient(index) {
    setIngredients((prev) => prev.filter((_, i) => i !== index));
  }

  // ── Steps ─────────────────────────────────────────────────────
  function handleStepChange(index, e) {
    const value = e.target.value;
    setSteps((prev) => prev.map((s, i) => (i === index ? value : s)));
  }

  function addStep() {
    setSteps((prev) => [...prev, ""]);
  }

  function removeStep(index) {
    setSteps((prev) => prev.filter((_, i) => i !== index));
  }

  // ── Validation ────────────────────────────────────────────────
  function validate() {
    const next = {};
    if (!fields.title.trim()) next.title = "Title is required.";
    if (!fields.category) next.category = "Please select a category.";
    if (fields.cookTime !== "" && (isNaN(fields.cookTime) || Number(fields.cookTime) <= 0))
      next.cookTime = "Enter a positive number.";
    if (fields.servings !== "" && (isNaN(fields.servings) || Number(fields.servings) <= 0))
      next.servings = "Enter a positive number.";
    return next;
  }

  // ── Submit ────────────────────────────────────────────────────
  function handleSubmit(e) {
    e.preventDefault();
    const next = validate();
    if (Object.keys(next).length > 0) {
      setErrors(next);
      return;
    }
    onSubmit?.({
      ...fields,
      cookTime: fields.cookTime === "" ? null : Number(fields.cookTime),
      servings: fields.servings === "" ? null : Number(fields.servings),
      ingredients: ingredients.filter((ing) => ing.name.trim() !== ""),
      steps: steps.filter((s) => s.trim() !== ""),
    });
  }

  // ── Shared styles ─────────────────────────────────────────────
  const inputCls = (hasError) =>
    `w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 ${
      hasError ? "border-red-400" : "border-amber-200"
    }`;

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="bg-white rounded-2xl shadow-md p-6 w-full max-w-lg"
    >
      <h2 className="text-xl font-bold text-amber-800 mb-5">{initialData ? "Edit Recipe" : "New Recipe"}</h2>

      {/* Title */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-amber-900 mb-1">
          Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="title"
          value={fields.title}
          onChange={handleChange}
          placeholder="e.g. Banana Pancakes"
          className={inputCls(errors.title)}
        />
        {errors.title && (
          <p className="text-red-500 text-xs mt-1">{errors.title}</p>
        )}
      </div>

      {/* Category */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-amber-900 mb-1">
          Category <span className="text-red-500">*</span>
        </label>
        <select
          name="category"
          value={fields.category}
          onChange={handleChange}
          className={`${inputCls(errors.category)} bg-white ${
            !fields.category ? "text-gray-400" : "text-gray-900"
          }`}
        >
          <option value="" disabled>
            Select a category
          </option>
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat} className="text-gray-900 capitalize">
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </option>
          ))}
        </select>
        {errors.category && (
          <p className="text-red-500 text-xs mt-1">{errors.category}</p>
        )}
      </div>

      {/* Cook Time + Servings */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-amber-900 mb-1">
            Cook Time (mins)
          </label>
          <input
            type="number"
            name="cookTime"
            value={fields.cookTime}
            onChange={handleChange}
            min="1"
            placeholder="e.g. 30"
            className={inputCls(errors.cookTime)}
          />
          {errors.cookTime && (
            <p className="text-red-500 text-xs mt-1">{errors.cookTime}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-amber-900 mb-1">
            Servings
          </label>
          <input
            type="number"
            name="servings"
            value={fields.servings}
            onChange={handleChange}
            min="1"
            placeholder="e.g. 4"
            className={inputCls(errors.servings)}
          />
          {errors.servings && (
            <p className="text-red-500 text-xs mt-1">{errors.servings}</p>
          )}
        </div>
      </div>

      {/* Ingredients */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-amber-900 mb-2">
          Ingredients
        </label>
        <div className="space-y-2">
          {ingredients.map((ing, index) => (
            <div key={index} className="flex flex-col gap-1.5 sm:flex-row sm:items-start sm:gap-2">
              <input
                type="text"
                name="name"
                value={ing.name}
                onChange={(e) => handleIngredientChange(index, e)}
                placeholder="Name"
                className="w-full sm:flex-[2] min-w-0 border border-amber-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
              <div className="flex gap-2 items-center">
                <input
                  type="text"
                  name="amount"
                  value={ing.amount}
                  onChange={(e) => handleIngredientChange(index, e)}
                  placeholder="Amount"
                  className="flex-1 min-w-0 border border-amber-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
                <input
                  type="text"
                  name="unit"
                  value={ing.unit}
                  onChange={(e) => handleIngredientChange(index, e)}
                  placeholder="Unit"
                  className="flex-1 min-w-0 border border-amber-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
                <button
                  type="button"
                  onClick={() => removeIngredient(index)}
                  disabled={ingredients.length === 1}
                  className="text-amber-400 hover:text-red-500 disabled:opacity-25 disabled:cursor-not-allowed text-lg leading-none px-1 transition-colors shrink-0"
                  aria-label="Remove ingredient"
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addIngredient}
          className="mt-2 text-sm text-amber-600 hover:text-amber-800 font-medium transition-colors"
        >
          + Add ingredient
        </button>
      </div>

      {/* Steps */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-amber-900 mb-2">
          Steps
        </label>
        <div className="space-y-2">
          {steps.map((step, index) => (
            <div key={index} className="flex gap-2 items-start">
              <span className="mt-2 text-xs font-semibold text-amber-400 w-5 shrink-0 text-right">
                {index + 1}.
              </span>
              <textarea
                value={step}
                onChange={(e) => handleStepChange(index, e)}
                rows={2}
                placeholder={`Step ${index + 1}`}
                className="flex-1 border border-amber-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
              />
              <button
                type="button"
                onClick={() => removeStep(index)}
                disabled={steps.length === 1}
                className="mt-1.5 text-amber-400 hover:text-red-500 disabled:opacity-25 disabled:cursor-not-allowed text-lg leading-none px-1 transition-colors"
                aria-label="Remove step"
              >
                ×
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addStep}
          className="mt-2 text-sm text-amber-600 hover:text-amber-800 font-medium transition-colors"
        >
          + Add step
        </button>
      </div>

      {/* Notes */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-amber-900 mb-1">
          Notes
        </label>
        <textarea
          name="notes"
          value={fields.notes}
          onChange={handleChange}
          rows={3}
          placeholder="Tips, substitutions, storage…"
          className="w-full border border-amber-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
        />
      </div>

      {/* Actions */}
      {saveError && (
        <p className="text-red-600 text-sm mb-4 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {saveError}
        </p>
      )}
      <div className="flex gap-3 justify-end">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            className="px-4 py-2 text-sm font-medium text-amber-700 bg-amber-100 hover:bg-amber-200 disabled:opacity-50 rounded-lg transition-colors duration-200"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={saving}
          className="px-5 py-2 text-sm font-semibold text-white bg-amber-600 hover:bg-amber-700 disabled:opacity-50 rounded-lg transition-colors duration-200"
        >
          {saving ? "Saving…" : "Save Recipe"}
        </button>
      </div>
    </form>
  );
}
