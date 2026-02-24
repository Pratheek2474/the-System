export interface FoodItem {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  serving: string;
  category: string;
}

export interface MealEntry {
  id: string;
  foodId: string;
  mealType: "breakfast" | "lunch" | "dinner" | "snack";
  servings: number;
  date: string; // YYYY-MM-DD
}

export interface WaterEntry {
  date: string;
  ml: number;
}

export interface WorkoutEntry {
  id: string;
  name: string;
  muscleGroups: string[];
  caloriesBurned: number;
  duration: number; // minutes
  date: string;
}

export interface StepsEntry {
  date: string;
  steps: number;
}

export interface Recipe {
  id: string;
  name: string;
  ingredients: { foodId: string; servings: number }[];
  instructions: string[];
  mealType: "breakfast" | "lunch" | "dinner" | "snack";
  prepTime: number;
  cookTime: number;
  servings: number;
  image?: string;
}

export interface WeeklyMealPlan {
  [date: string]: {
    breakfast?: string; // recipe id
    lunch?: string;
    dinner?: string;
    snacks?: string[];
  };
}

export interface UserProfile {
  name: string;
  age: number;
  height: number; // cm
  weight: number; // kg
  goalWeight: number;
  dailyCalorieGoal: number;
  dailyWaterGoal: number; // ml
  dailyStepsGoal: number;
  proteinGoal: number;
  carbsGoal: number;
  fatGoal: number;
}

export interface WeightEntry {
  date: string;
  weight: number;
}

export type MuscleGroup =
  | "chest"
  | "back"
  | "shoulders"
  | "biceps"
  | "triceps"
  | "forearms"
  | "abs"
  | "obliques"
  | "quads"
  | "hamstrings"
  | "glutes"
  | "calves"
  | "traps"
  | "lats";
