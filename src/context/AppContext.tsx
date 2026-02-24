import { createContext, useContext, ReactNode } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { MealEntry, WaterEntry, WorkoutEntry, StepsEntry, WeightEntry, UserProfile, Recipe, WeeklyMealPlan } from "@/types";
import { sampleRecipes } from "@/data/recipes";
import { getToday } from "@/lib/dateUtils";

interface AppState {
  meals: MealEntry[];
  setMeals: (v: MealEntry[] | ((p: MealEntry[]) => MealEntry[])) => void;
  water: WaterEntry[];
  setWater: (v: WaterEntry[] | ((p: WaterEntry[]) => WaterEntry[])) => void;
  workouts: WorkoutEntry[];
  setWorkouts: (v: WorkoutEntry[] | ((p: WorkoutEntry[]) => WorkoutEntry[])) => void;
  steps: StepsEntry[];
  setSteps: (v: StepsEntry[] | ((p: StepsEntry[]) => StepsEntry[])) => void;
  weights: WeightEntry[];
  setWeights: (v: WeightEntry[] | ((p: WeightEntry[]) => WeightEntry[])) => void;
  profile: UserProfile;
  setProfile: (v: UserProfile | ((p: UserProfile) => UserProfile)) => void;
  recipes: Recipe[];
  setRecipes: (v: Recipe[] | ((p: Recipe[]) => Recipe[])) => void;
  mealPlan: WeeklyMealPlan;
  setMealPlan: (v: WeeklyMealPlan | ((p: WeeklyMealPlan) => WeeklyMealPlan)) => void;
}

const defaultProfile: UserProfile = {
  name: "Alex",
  age: 28,
  height: 175,
  weight: 75,
  goalWeight: 70,
  dailyCalorieGoal: 2000,
  dailyWaterGoal: 2000,
  dailyStepsGoal: 10000,
  proteinGoal: 150,
  carbsGoal: 250,
  fatGoal: 65,
};

const today = getToday();

const defaultMeals: MealEntry[] = [
  { id: "m1", foodId: "f3", mealType: "breakfast", servings: 1, date: today },
  { id: "m2", foodId: "f23", mealType: "breakfast", servings: 1, date: today },
  { id: "m3", foodId: "f1", mealType: "lunch", servings: 1.5, date: today },
  { id: "m4", foodId: "f20", mealType: "lunch", servings: 1, date: today },
  { id: "m5", foodId: "f42", mealType: "lunch", servings: 1, date: today },
];

const defaultWater: WaterEntry[] = [{ date: today, ml: 800 }];
const defaultSteps: StepsEntry[] = [{ date: today, steps: 6500 }];
const defaultWorkouts: WorkoutEntry[] = [
  { id: "w1", name: "Bench Press", muscleGroups: ["chest", "triceps", "shoulders"], caloriesBurned: 240, duration: 30, date: today },
  { id: "w2", name: "Push-ups", muscleGroups: ["chest", "triceps", "shoulders"], caloriesBurned: 140, duration: 20, date: today },
];
const defaultWeights: WeightEntry[] = [
  { date: "2026-02-17", weight: 76 },
  { date: "2026-02-18", weight: 75.8 },
  { date: "2026-02-19", weight: 75.5 },
  { date: "2026-02-20", weight: 75.6 },
  { date: "2026-02-21", weight: 75.3 },
  { date: "2026-02-22", weight: 75.1 },
  { date: "2026-02-23", weight: 75.0 },
  { date: today, weight: 75 },
];

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [meals, setMeals] = useLocalStorage<MealEntry[]>("caltrack-meals", defaultMeals);
  const [water, setWater] = useLocalStorage<WaterEntry[]>("caltrack-water", defaultWater);
  const [workouts, setWorkouts] = useLocalStorage<WorkoutEntry[]>("caltrack-workouts", defaultWorkouts);
  const [steps, setSteps] = useLocalStorage<StepsEntry[]>("caltrack-steps", defaultSteps);
  const [weights, setWeights] = useLocalStorage<WeightEntry[]>("caltrack-weights", defaultWeights);
  const [profile, setProfile] = useLocalStorage<UserProfile>("caltrack-profile", defaultProfile);
  const [recipes, setRecipes] = useLocalStorage<Recipe[]>("caltrack-recipes", sampleRecipes);
  const [mealPlan, setMealPlan] = useLocalStorage<WeeklyMealPlan>("caltrack-mealplan", {});

  return (
    <AppContext.Provider value={{ meals, setMeals, water, setWater, workouts, setWorkouts, steps, setSteps, weights, setWeights, profile, setProfile, recipes, setRecipes, mealPlan, setMealPlan }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
