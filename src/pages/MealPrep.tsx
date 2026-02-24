import { useMemo, useState } from "react";
import { Plus, X, Clock, Flame } from "lucide-react";
import { format } from "date-fns";
import { useApp } from "@/context/AppContext";
import { foodDatabase } from "@/data/foods";
import { mealEmojis } from "@/data/recipes";
import { getWeekDates, formatDate, generateId } from "@/lib/dateUtils";
import { Recipe } from "@/types";
import FoodSearch from "@/components/FoodSearch";

const MealPrep = () => {
  const { recipes, setRecipes, mealPlan, setMealPlan } = useApp();
  const [showAddRecipe, setShowAddRecipe] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [showFoodSearch, setShowFoodSearch] = useState<{ type: "breakfast" | "lunch" | "dinner" | "snack"; date: string } | null>(null);
  const weekDates = getWeekDates();

  const getRecipeNutrition = (recipe: Recipe) => {
    let cal = 0, prot = 0, carbs = 0, fat = 0;
    recipe.ingredients.forEach(ing => {
      const food = foodDatabase.find(f => f.id === ing.foodId);
      if (food) {
        cal += food.calories * ing.servings;
        prot += food.protein * ing.servings;
        carbs += food.carbs * ing.servings;
        fat += food.fat * ing.servings;
      }
    });
    return { cal: Math.round(cal), prot: Math.round(prot), carbs: Math.round(carbs), fat: Math.round(fat) };
  };

  const assignRecipe = (date: string, mealType: "breakfast" | "lunch" | "dinner", recipeId: string) => {
    setMealPlan(prev => ({
      ...prev,
      [date]: { ...prev[date], [mealType]: recipeId },
    }));
  };

  return (
    <div className="flex flex-col min-h-screen pb-24 max-w-md mx-auto">
      <div className="px-5 pt-12 pb-4 flex items-center justify-between">
        <h1 className="text-2xl font-extrabold">Meal Prep</h1>
        <button onClick={() => setShowAddRecipe(true)} className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
          <Plus className="w-5 h-5 text-primary-foreground" />
        </button>
      </div>

      <div className="px-5 space-y-4">
        {/* Weekly Calendar */}
        <div className="bg-card rounded-2xl p-4">
          <h3 className="text-base font-bold mb-3">This Week's Plan</h3>
          <div className="overflow-x-auto scrollbar-hide">
            <div className="flex gap-3 min-w-max">
              {weekDates.map(d => {
                const ds = formatDate(d);
                const plan = mealPlan[ds];
                return (
                  <div key={ds} className="w-28 flex-shrink-0">
                    <p className="text-xs font-bold text-center mb-2">{format(d, "EEE dd")}</p>
                    {(["breakfast", "lunch", "dinner"] as const).map(type => {
                      const recipeId = plan?.[type];
                      const recipe = recipeId ? recipes.find(r => r.id === recipeId) : null;
                      return (
                        <button
                          key={type}
                          onClick={() => {
                            if (recipes.length > 0) {
                              const rid = prompt(`Assign recipe to ${type}:\n${recipes.map((r, i) => `${i + 1}. ${r.name}`).join("\n")}\nEnter number:`);
                              if (rid && Number(rid) > 0 && Number(rid) <= recipes.length) {
                                assignRecipe(ds, type, recipes[Number(rid) - 1].id);
                              }
                            }
                          }}
                          className="w-full bg-secondary rounded-lg p-2 mb-1 text-left"
                        >
                          <span className="text-[10px]">{mealEmojis[type]}</span>
                          <p className="text-[9px] font-medium truncate">{recipe ? recipe.name : `+ ${type}`}</p>
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Recipes */}
        <h3 className="text-base font-bold">Recipes</h3>
        <div className="grid grid-cols-1 gap-3">
          {recipes.map(recipe => {
            const nutr = getRecipeNutrition(recipe);
            return (
              <button key={recipe.id} onClick={() => setSelectedRecipe(recipe)} className="bg-card rounded-2xl p-4 text-left">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{mealEmojis[recipe.mealType]}</span>
                      <h4 className="text-sm font-bold">{recipe.name}</h4>
                    </div>
                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{recipe.prepTime + recipe.cookTime}m</span>
                      <span className="flex items-center gap-1"><Flame className="w-3 h-3" />{nutr.cal} kcal</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 mt-2">
                  <span className="text-[10px] card-primary px-2 py-0.5 rounded-full font-medium">P {nutr.prot}g</span>
                  <span className="text-[10px] card-yellow px-2 py-0.5 rounded-full font-medium">C {nutr.carbs}g</span>
                  <span className="text-[10px] card-lavender px-2 py-0.5 rounded-full font-medium">F {nutr.fat}g</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Quick Log Button */}
        <div className="bg-card rounded-2xl p-4">
          <h3 className="text-base font-bold mb-2">Quick Log Meal</h3>
          <div className="grid grid-cols-4 gap-2">
            {(["breakfast", "lunch", "dinner", "snack"] as const).map(type => (
              <button key={type} onClick={() => setShowFoodSearch({ type, date: formatDate(new Date()) })} className="flex flex-col items-center gap-1 p-3 bg-secondary rounded-xl">
                <span className="text-lg">{mealEmojis[type]}</span>
                <span className="text-[10px] font-medium capitalize text-muted-foreground">{type}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {selectedRecipe && <RecipeDetail recipe={selectedRecipe} onClose={() => setSelectedRecipe(null)} />}
      {showAddRecipe && <AddRecipeForm onClose={() => setShowAddRecipe(false)} />}
      {showFoodSearch && <FoodSearch mealType={showFoodSearch.type} date={showFoodSearch.date} onClose={() => setShowFoodSearch(null)} />}
    </div>
  );
};

const RecipeDetail = ({ recipe, onClose }: { recipe: Recipe; onClose: () => void }) => {
  const getRecipeNutrition = (recipe: Recipe) => {
    let cal = 0, prot = 0, carbs = 0, fat = 0, fiber = 0;
    recipe.ingredients.forEach(ing => {
      const food = foodDatabase.find(f => f.id === ing.foodId);
      if (food) {
        cal += food.calories * ing.servings;
        prot += food.protein * ing.servings;
        carbs += food.carbs * ing.servings;
        fat += food.fat * ing.servings;
        fiber += food.fiber * ing.servings;
      }
    });
    return { cal: Math.round(cal), prot: Math.round(prot), carbs: Math.round(carbs), fat: Math.round(fat), fiber: Math.round(fiber) };
  };

  const nutr = getRecipeNutrition(recipe);

  return (
    <div className="fixed inset-0 z-[60] bg-background flex flex-col overflow-y-auto">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h2 className="text-lg font-bold">{recipe.name}</h2>
        <button onClick={onClose}><X className="w-6 h-6 text-muted-foreground" /></button>
      </div>
      <div className="p-5 space-y-4">
        <div className="grid grid-cols-4 gap-2">
          <div className="card-primary rounded-xl p-3 text-center"><p className="text-lg font-bold">{nutr.cal}</p><p className="text-[10px]">kcal</p></div>
          <div className="card-green rounded-xl p-3 text-center"><p className="text-lg font-bold">{nutr.prot}g</p><p className="text-[10px]">Protein</p></div>
          <div className="card-yellow rounded-xl p-3 text-center"><p className="text-lg font-bold">{nutr.carbs}g</p><p className="text-[10px]">Carbs</p></div>
          <div className="card-lavender rounded-xl p-3 text-center"><p className="text-lg font-bold">{nutr.fat}g</p><p className="text-[10px]">Fat</p></div>
        </div>

        <div>
          <h3 className="text-base font-bold mb-2">Ingredients</h3>
          {recipe.ingredients.map((ing, i) => {
            const food = foodDatabase.find(f => f.id === ing.foodId);
            return food ? (
              <div key={i} className="bg-card rounded-lg p-2 mb-1 flex justify-between">
                <span className="text-sm">{food.name}</span>
                <span className="text-xs text-muted-foreground">{ing.servings}x · {Math.round(food.calories * ing.servings)} kcal</span>
              </div>
            ) : null;
          })}
        </div>

        <div>
          <h3 className="text-base font-bold mb-2">Instructions</h3>
          {recipe.instructions.map((step, i) => (
            <div key={i} className="flex gap-3 mb-2">
              <span className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-primary-foreground flex-shrink-0">{i + 1}</span>
              <p className="text-sm text-muted-foreground">{step}</p>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span><Clock className="w-4 h-4 inline mr-1" />Prep: {recipe.prepTime}m</span>
          <span><Clock className="w-4 h-4 inline mr-1" />Cook: {recipe.cookTime}m</span>
          <span>Serves: {recipe.servings}</span>
        </div>
      </div>
    </div>
  );
};

const AddRecipeForm = ({ onClose }: { onClose: () => void }) => {
  const { setRecipes } = useApp();
  const [name, setName] = useState("");
  const [mealType, setMealType] = useState<"breakfast" | "lunch" | "dinner" | "snack">("lunch");
  const [prepTime, setPrepTime] = useState("10");
  const [cookTime, setCookTime] = useState("15");
  const [ingredients, setIngredients] = useState<{ foodId: string; servings: number }[]>([]);
  const [instructions, setInstructions] = useState("");
  const [showFoodPicker, setShowFoodPicker] = useState(false);

  const save = () => {
    if (!name.trim()) return;
    const recipe: Recipe = {
      id: generateId(),
      name,
      ingredients,
      instructions: instructions.split("\n").filter(Boolean),
      mealType,
      prepTime: Number(prepTime),
      cookTime: Number(cookTime),
      servings: 1,
    };
    setRecipes(prev => [...prev, recipe]);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] bg-background flex flex-col overflow-y-auto">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h2 className="text-lg font-bold">New Recipe</h2>
        <button onClick={onClose}><X className="w-6 h-6 text-muted-foreground" /></button>
      </div>
      <div className="p-5 space-y-4">
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Recipe name" className="w-full bg-secondary rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none" />

        <div className="flex gap-2">
          {(["breakfast", "lunch", "dinner", "snack"] as const).map(t => (
            <button key={t} onClick={() => setMealType(t)} className={`px-3 py-2 rounded-full text-xs font-semibold capitalize ${mealType === t ? "card-primary" : "bg-secondary text-foreground"}`}>{t}</button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-muted-foreground">Prep (min)</label>
            <input value={prepTime} onChange={e => setPrepTime(e.target.value)} className="w-full bg-secondary rounded-xl px-3 py-2 text-sm text-foreground outline-none" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Cook (min)</label>
            <input value={cookTime} onChange={e => setCookTime(e.target.value)} className="w-full bg-secondary rounded-xl px-3 py-2 text-sm text-foreground outline-none" />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-bold">Ingredients</label>
            <button onClick={() => setShowFoodPicker(true)} className="text-xs card-green px-3 py-1 rounded-full font-semibold">+ Add</button>
          </div>
          {ingredients.map((ing, i) => {
            const food = foodDatabase.find(f => f.id === ing.foodId);
            return (
              <div key={i} className="bg-card rounded-lg p-2 mb-1 flex justify-between items-center">
                <span className="text-sm">{food?.name}</span>
                <button onClick={() => setIngredients(prev => prev.filter((_, j) => j !== i))} className="text-danger"><X className="w-4 h-4" /></button>
              </div>
            );
          })}
        </div>

        <div>
          <label className="text-sm font-bold">Instructions (one per line)</label>
          <textarea value={instructions} onChange={e => setInstructions(e.target.value)} rows={4} className="w-full bg-secondary rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none mt-1" placeholder="Step 1&#10;Step 2" />
        </div>

        <button onClick={save} className="w-full card-primary rounded-xl py-3 text-base font-bold">Save Recipe</button>
      </div>

      {showFoodPicker && (
        <IngredientPicker onSelect={(foodId) => { setIngredients(prev => [...prev, { foodId, servings: 1 }]); setShowFoodPicker(false); }} onClose={() => setShowFoodPicker(false)} />
      )}
    </div>
  );
};

const IngredientPicker = ({ onSelect, onClose }: { onSelect: (foodId: string) => void; onClose: () => void }) => {
  const [query, setQuery] = useState("");
  const results = useMemo(() => {
    const q = query.toLowerCase();
    if (!q) return foodDatabase.slice(0, 20);
    return foodDatabase.filter(f => f.name.toLowerCase().includes(q));
  }, [query]);

  return (
    <div className="fixed inset-0 z-[70] bg-background flex flex-col">
      <div className="flex items-center gap-3 p-4 border-b border-border">
        <button onClick={onClose}><X className="w-6 h-6 text-muted-foreground" /></button>
        <input autoFocus value={query} onChange={e => setQuery(e.target.value)} placeholder="Search ingredient..." className="flex-1 bg-secondary rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none" />
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {results.map(food => (
          <button key={food.id} onClick={() => onSelect(food.id)} className="w-full bg-card rounded-xl p-3 text-left">
            <p className="text-sm font-semibold">{food.name}</p>
            <p className="text-xs text-muted-foreground">{food.serving} · {food.calories} kcal</p>
          </button>
        ))}
      </div>
    </div>
  );
};

export default MealPrep;
