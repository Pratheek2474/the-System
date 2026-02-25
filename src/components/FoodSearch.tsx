import { useState, useEffect, useCallback } from "react";
import { Search, X, Plus, ChevronLeft, Loader2 } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { getToday, generateId } from "@/lib/dateUtils";
import { MealEntry, FoodItem } from "@/types";
import { foodDatabase } from "@/data/foods";

// ── OpenFoodFacts API ─────────────────────────────────────────────────────────
interface OFFProduct {
  id: string;
  product_name: string;
  brands?: string;
  nutriments: {
    "energy-kcal_100g"?: number;
    "energy-kcal_serving"?: number;
    proteins_100g?: number;
    proteins_serving?: number;
    carbohydrates_100g?: number;
    carbohydrates_serving?: number;
    fat_100g?: number;
    fat_serving?: number;
    fiber_100g?: number;
  };
  serving_size?: string;
  serving_quantity?: number;
}

function offToFoodItem(p: OFFProduct): FoodItem {
  const n = p.nutriments;
  const useServing = !!n["energy-kcal_serving"];
  return {
    id: `off-${p.id}`,
    name: p.product_name || "Unknown",
    calories: Math.round(useServing ? (n["energy-kcal_serving"] ?? 0) : (n["energy-kcal_100g"] ?? 0)),
    protein: Math.round(useServing ? (n.proteins_serving ?? 0) : (n.proteins_100g ?? 0)),
    carbs: Math.round(useServing ? (n.carbohydrates_serving ?? 0) : (n.carbohydrates_100g ?? 0)),
    fat: Math.round(useServing ? (n.fat_serving ?? 0) : (n.fat_100g ?? 0)),
    fiber: Math.round(n.fiber_100g ?? 0),
    serving: p.serving_size ?? (useServing ? "1 serving" : "100g"),
    category: "searched",
  };
}

async function searchOFF(query: string): Promise<FoodItem[]> {
  if (!query.trim()) return [];
  const url =
    `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}` +
    `&search_simple=1&action=process&json=1&page_size=30` +
    `&lc=en&sort_by=unique_scans_n` +
    `&fields=id,product_name,brands,nutriments,serving_size,serving_quantity`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    if (!data.products) return [];
    return (data.products as OFFProduct[])
      .filter((p) => {
        if (!p.product_name?.trim()) return false;
        // Relaxed language filter: only exclude if it definitely contains CJK/Arabic
        if (/[\u0600-\u06FF\u4E00-\u9FFF\u3040-\u30FF]/.test(p.product_name)) return false;
        const n = p.nutriments;
        // Relaxed macro filter: show anything that has at least some data
        return (n["energy-kcal_100g"] ?? n["energy-kcal_serving"] ?? 0) >= 0;
      })
      .slice(0, 15)
      .map(offToFoodItem);
  } catch (e) {
    console.error("OFF search error:", e);
    return [];
  }
}

function searchLocal(query: string): FoodItem[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  return foodDatabase.filter(f =>
    f.name.toLowerCase().includes(q) ||
    f.category.toLowerCase().includes(q)
  );
}

// ── Meal type tabs ────────────────────────────────────────────────────────────
const MEAL_TYPES = ["breakfast", "lunch", "dinner", "snack"] as const;
type MealType = typeof MEAL_TYPES[number];

const MEAL_EMOJI: Record<MealType, string> = {
  breakfast: "B",
  lunch: "L",
  dinner: "D",
  snack: "S",
};

// ── Props ─────────────────────────────────────────────────────────────────────
interface FoodSearchProps {
  mealType?: MealType;
  onClose: () => void;
  date?: string;
}

// ── Component ─────────────────────────────────────────────────────────────────
const FoodSearch = ({ mealType: initialMealType = "breakfast", onClose, date }: FoodSearchProps) => {
  const { setMeals } = useApp();
  const [query, setQuery] = useState("");
  const [mealType, setMealType] = useState<MealType>(initialMealType);
  const [results, setResults] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [added, setAdded] = useState<Set<string>>(new Set());
  // servings per food item
  const [servings, setServings] = useState<Record<string, number>>({});

  // Debounced search
  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) { setResults([]); return; }
    setLoading(true);
    setError("");
    try {
      const local = searchLocal(q);
      const off = await searchOFF(q);

      // Merge results, removing duplicates (prioritizing local)
      const merged = [...local];
      off.forEach(item => {
        if (!merged.find(m => m.name.toLowerCase() === item.name.toLowerCase())) {
          merged.push(item);
        }
      });

      setResults(merged);
      if (merged.length === 0) setError("No results found. Try a different search term.");
    } catch {
      setError("Failed to load results. Check your connection.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => doSearch(query), 600);
    return () => clearTimeout(t);
  }, [query, doSearch]);

  const getServings = (id: string) => servings[id] ?? 1;

  const addFood = (food: FoodItem) => {
    const sv = getServings(food.id);
    const entry: MealEntry = {
      id: generateId(),
      foodId: food.id,
      mealType,
      servings: sv,
      date: date || getToday(),
    };
    // Store augmented food in localStorage so macros resolve correctly
    const stored = JSON.parse(localStorage.getItem("caltrack-searched-foods") || "{}");
    stored[food.id] = food;
    localStorage.setItem("caltrack-searched-foods", JSON.stringify(stored));

    setMeals((prev) => [...prev, entry]);
    setAdded((prev) => new Set(prev).add(food.id));
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[60]"
        style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(2px)", animation: "fadeInBackdrop 0.25s ease" }}
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        className="fixed bottom-0 left-1/2 -translate-x-1/2 z-[70] flex flex-col w-full"
        style={{
          maxWidth: 448,
          height: "80vh",
          background: "#1A1A1A",
          borderRadius: "28px 28px 0 0",
          boxShadow: "0 -8px 48px rgba(0,0,0,0.6)",
          animation: "slideUp 0.32s cubic-bezier(0.32,0.72,0,1)",
          color: "#fff",
        }}
      >
        {/* ── Header ── */}
        <div className="flex items-center gap-3 px-6 pt-5 pb-3">
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-full" style={{ background: "#232220" }}>
            <ChevronLeft size={20} color="#fff" />
          </button>
          <div className="flex-1 flex items-center gap-2 rounded-2xl px-4 py-3" style={{ background: "#232220" }}>
            <Search size={18} color="#9ca3af" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search foods, brands…"
              className="flex-1 bg-transparent text-sm text-white placeholder:text-gray-500 outline-none"
            />
            {query && (
              <button onClick={() => { setQuery(""); setResults([]); }}>
                <X size={16} color="#9ca3af" />
              </button>
            )}
          </div>
        </div>

        {/* ── Meal type tabs ── */}
        <div className="flex gap-2 px-6 pb-3 overflow-x-auto scrollbar-hide shrink-0">
          {MEAL_TYPES.map((type) => (
            <button
              key={type}
              onClick={() => setMealType(type)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all"
              style={{
                background: mealType === type ? "hsl(var(--primary))" : "#232220",
                color: mealType === type ? "hsl(var(--primary-foreground))" : "#9ca3af",
              }}
            >
              <span>{MEAL_EMOJI[type]}</span>
              <span className="capitalize">{type}</span>
            </button>
          ))}
        </div>

        {/* ── Results ── */}
        <div className="flex-1 overflow-y-auto px-6 space-y-3 pb-8">
          {/* Loading */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <Loader2 size={32} className="animate-spin text-primary" />
              <p className="text-sm text-gray-500">Searching OpenFoodFacts…</p>
            </div>
          )}

          {/* Error / empty */}
          {!loading && error && (
            <div className="flex flex-col items-center justify-center py-20 gap-2">
              <p className="text-4xl">🔍</p>
              <p className="text-sm text-gray-400 text-center">{error}</p>
            </div>
          )}

          {/* Placeholder */}
          {!loading && !error && results.length === 0 && !query && (
            <div className="flex flex-col items-center justify-center py-24 gap-3">
              <p className="text-5xl">🥗</p>
              <p className="text-base font-bold text-white">Search for food</p>
              <p className="text-sm text-gray-500 text-center">Type a food name, brand or barcode to search millions of products</p>
            </div>
          )}

          {/* Food cards */}
          {!loading && results.map((food) => {
            const sv = getServings(food.id);
            const isAdded = added.has(food.id);
            const scale = sv; // multiply per-serving macros by servings count
            return (
              <div
                key={food.id}
                className="rounded-2xl p-4"
                style={{ background: "#232220" }}
              >
                {/* Name + brand */}
                <p className="text-sm font-bold leading-snug line-clamp-2">{food.name}</p>
                <p className="text-xs mt-0.5 mb-3" style={{ color: "#9ca3af" }}>{food.serving}</p>

                {/* Macro chips */}
                <div className="flex gap-2 flex-wrap mb-3">
                  <span className="text-[11px] font-bold px-2 py-1 rounded-lg" style={{ background: "#DDC0FF22", color: "#DDC0FF" }}>
                    🔥 {Math.round(food.calories * scale)} kcal
                  </span>
                  <span className="text-[11px] font-bold px-2 py-1 rounded-lg" style={{ background: "#FF6F4322", color: "#FF6F43" }}>
                    P {Math.round(food.protein * scale)}g
                  </span>
                  <span className="text-[11px] font-bold px-2 py-1 rounded-lg" style={{ background: "#45C58822", color: "#45C588" }}>
                    C {Math.round(food.carbs * scale)}g
                  </span>
                  <span className="text-[11px] font-bold px-2 py-1 rounded-lg" style={{ background: "#F5F37822", color: "#F5F378" }}>
                    F {Math.round(food.fat * scale)}g
                  </span>
                </div>

                {/* Servings + Add */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center rounded-xl overflow-hidden" style={{ background: "#2F2F2F" }}>
                    <button
                      className="w-9 h-9 flex items-center justify-center text-lg font-bold"
                      style={{ color: "#9ca3af" }}
                      onClick={() => setServings((p) => ({ ...p, [food.id]: Math.max(0.5, (p[food.id] ?? 1) - 0.5) }))}
                    >−</button>
                    <span className="w-10 text-center text-sm font-bold">{sv}</span>
                    <button
                      className="w-9 h-9 flex items-center justify-center text-lg font-bold"
                      style={{ color: "#9ca3af" }}
                      onClick={() => setServings((p) => ({ ...p, [food.id]: (p[food.id] ?? 1) + 0.5 }))}
                    >+</button>
                  </div>
                  <span className="text-[11px] text-gray-500 flex-1">× serving</span>
                  <button
                    onClick={() => addFood(food)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-bold transition-all active:scale-95"
                    style={{
                      background: isAdded ? "#2F2F2F" : "hsl(var(--primary))",
                      color: isAdded ? "#9ca3af" : "hsl(var(--primary-foreground))",
                    }}
                  >
                    {isAdded ? (
                      <span>✓ Added</span>
                    ) : (
                      <><Plus size={15} /> Add to {mealType}</>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default FoodSearch;
