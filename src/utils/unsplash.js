const ACCESS_KEY = import.meta.env.VITE_UNSPLASH_ACCESS_KEY;

export async function fetchRecipeImage(title) {
  const res = await fetch(
    `https://api.unsplash.com/search/photos?query=${encodeURIComponent(title)}&per_page=1&orientation=landscape&client_id=${ACCESS_KEY}`
  );
  if (!res.ok) throw new Error(`Unsplash error: ${res.status}`);
  const data = await res.json();
  return data.results[0]?.urls?.small ?? null;
}
