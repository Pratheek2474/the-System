import { FoodItem } from "@/types";

export const foodDatabase: FoodItem[] = [
  // Proteins
  { id: "f1", name: "Chicken Breast (grilled)", calories: 165, protein: 31, carbs: 0, fat: 3.6, fiber: 0, serving: "100g", category: "Protein" },
  { id: "f2", name: "Salmon (baked)", calories: 208, protein: 20, carbs: 0, fat: 13, fiber: 0, serving: "100g", category: "Protein" },
  { id: "f3", name: "Eggs (whole)", calories: 155, protein: 13, carbs: 1.1, fat: 11, fiber: 0, serving: "2 large", category: "Protein" },
  { id: "f4", name: "Greek Yogurt", calories: 100, protein: 17, carbs: 6, fat: 0.7, fiber: 0, serving: "170g", category: "Protein" },
  { id: "f5", name: "Tuna (canned)", calories: 116, protein: 26, carbs: 0, fat: 1, fiber: 0, serving: "100g", category: "Protein" },
  { id: "f6", name: "Turkey Breast", calories: 135, protein: 30, carbs: 0, fat: 1, fiber: 0, serving: "100g", category: "Protein" },
  { id: "f7", name: "Tofu (firm)", calories: 144, protein: 17, carbs: 3, fat: 8, fiber: 2, serving: "150g", category: "Protein" },
  { id: "f8", name: "Shrimp", calories: 99, protein: 24, carbs: 0.2, fat: 0.3, fiber: 0, serving: "100g", category: "Protein" },
  { id: "f9", name: "Beef (lean ground)", calories: 250, protein: 26, carbs: 0, fat: 15, fiber: 0, serving: "100g", category: "Protein" },
  { id: "f10", name: "Cottage Cheese", calories: 98, protein: 11, carbs: 3.4, fat: 4.3, fiber: 0, serving: "100g", category: "Protein" },
  { id: "f11", name: "Whey Protein Shake", calories: 120, protein: 24, carbs: 3, fat: 1.5, fiber: 0, serving: "1 scoop", category: "Protein" },
  { id: "f12", name: "Pork Tenderloin", calories: 143, protein: 26, carbs: 0, fat: 3.5, fiber: 0, serving: "100g", category: "Protein" },

  // Carbs
  { id: "f20", name: "Brown Rice (cooked)", calories: 216, protein: 5, carbs: 45, fat: 1.8, fiber: 3.5, serving: "1 cup", category: "Carbs" },
  { id: "f21", name: "Oatmeal", calories: 154, protein: 5, carbs: 27, fat: 2.6, fiber: 4, serving: "1 cup cooked", category: "Carbs" },
  { id: "f22", name: "Sweet Potato", calories: 103, protein: 2.3, carbs: 24, fat: 0.1, fiber: 3.8, serving: "1 medium", category: "Carbs" },
  { id: "f23", name: "Whole Wheat Bread", calories: 128, protein: 5, carbs: 24, fat: 2, fiber: 3, serving: "2 slices", category: "Carbs" },
  { id: "f24", name: "Quinoa (cooked)", calories: 222, protein: 8, carbs: 39, fat: 3.6, fiber: 5, serving: "1 cup", category: "Carbs" },
  { id: "f25", name: "Banana", calories: 105, protein: 1.3, carbs: 27, fat: 0.4, fiber: 3.1, serving: "1 medium", category: "Carbs" },
  { id: "f26", name: "White Rice (cooked)", calories: 206, protein: 4.3, carbs: 45, fat: 0.4, fiber: 0.6, serving: "1 cup", category: "Carbs" },
  { id: "f27", name: "Pasta (cooked)", calories: 220, protein: 8, carbs: 43, fat: 1.3, fiber: 2.5, serving: "1 cup", category: "Carbs" },
  { id: "f28", name: "Apple", calories: 95, protein: 0.5, carbs: 25, fat: 0.3, fiber: 4.4, serving: "1 medium", category: "Carbs" },
  { id: "f29", name: "Blueberries", calories: 84, protein: 1.1, carbs: 21, fat: 0.5, fiber: 3.6, serving: "1 cup", category: "Carbs" },

  // Fats
  { id: "f30", name: "Avocado", calories: 240, protein: 3, carbs: 12, fat: 22, fiber: 10, serving: "1 whole", category: "Fats" },
  { id: "f31", name: "Almonds", calories: 164, protein: 6, carbs: 6, fat: 14, fiber: 3.5, serving: "28g", category: "Fats" },
  { id: "f32", name: "Olive Oil", calories: 119, protein: 0, carbs: 0, fat: 14, fiber: 0, serving: "1 tbsp", category: "Fats" },
  { id: "f33", name: "Peanut Butter", calories: 188, protein: 8, carbs: 6, fat: 16, fiber: 2, serving: "2 tbsp", category: "Fats" },
  { id: "f34", name: "Walnuts", calories: 185, protein: 4.3, carbs: 3.9, fat: 18.5, fiber: 1.9, serving: "28g", category: "Fats" },
  { id: "f35", name: "Chia Seeds", calories: 137, protein: 4.7, carbs: 12, fat: 8.7, fiber: 10, serving: "28g", category: "Fats" },

  // Vegetables
  { id: "f40", name: "Broccoli (steamed)", calories: 55, protein: 3.7, carbs: 11, fat: 0.6, fiber: 5, serving: "1 cup", category: "Vegetables" },
  { id: "f41", name: "Spinach (raw)", calories: 7, protein: 0.9, carbs: 1.1, fat: 0.1, fiber: 0.7, serving: "1 cup", category: "Vegetables" },
  { id: "f42", name: "Mixed Salad", calories: 20, protein: 1.5, carbs: 3.5, fat: 0.2, fiber: 2, serving: "2 cups", category: "Vegetables" },
  { id: "f43", name: "Bell Pepper", calories: 31, protein: 1, carbs: 6, fat: 0.3, fiber: 2.1, serving: "1 medium", category: "Vegetables" },
  { id: "f44", name: "Cucumber", calories: 16, protein: 0.7, carbs: 3.6, fat: 0.1, fiber: 0.5, serving: "1 cup", category: "Vegetables" },
  { id: "f45", name: "Carrots", calories: 52, protein: 1.2, carbs: 12, fat: 0.3, fiber: 3.6, serving: "1 cup", category: "Vegetables" },
  { id: "f46", name: "Tomato", calories: 22, protein: 1.1, carbs: 4.8, fat: 0.2, fiber: 1.5, serving: "1 medium", category: "Vegetables" },

  // Dairy
  { id: "f50", name: "Whole Milk", calories: 149, protein: 8, carbs: 12, fat: 8, fiber: 0, serving: "1 cup", category: "Dairy" },
  { id: "f51", name: "Cheddar Cheese", calories: 113, protein: 7, carbs: 0.4, fat: 9.3, fiber: 0, serving: "28g", category: "Dairy" },
  { id: "f52", name: "Mozzarella", calories: 85, protein: 6.3, carbs: 0.7, fat: 6.3, fiber: 0, serving: "28g", category: "Dairy" },

  // Snacks/Other
  { id: "f60", name: "Protein Bar", calories: 210, protein: 20, carbs: 25, fat: 7, fiber: 3, serving: "1 bar", category: "Snacks" },
  { id: "f61", name: "Trail Mix", calories: 175, protein: 5, carbs: 15, fat: 11, fiber: 2, serving: "28g", category: "Snacks" },
  { id: "f62", name: "Dark Chocolate", calories: 170, protein: 2.2, carbs: 13, fat: 12, fiber: 3, serving: "28g", category: "Snacks" },
  { id: "f63", name: "Hummus", calories: 70, protein: 2, carbs: 6, fat: 5, fiber: 1.5, serving: "2 tbsp", category: "Snacks" },
  { id: "f64", name: "Rice Cakes", calories: 70, protein: 1.4, carbs: 15, fat: 0.4, fiber: 0.4, serving: "2 cakes", category: "Snacks" },
  { id: "f65", name: "Orange Juice", calories: 112, protein: 1.7, carbs: 26, fat: 0.5, fiber: 0.5, serving: "1 cup", category: "Beverages" },
  { id: "f66", name: "Coffee (black)", calories: 2, protein: 0.3, carbs: 0, fat: 0, fiber: 0, serving: "1 cup", category: "Beverages" },
  { id: "f67", name: "Green Smoothie", calories: 150, protein: 5, carbs: 30, fat: 2, fiber: 5, serving: "1 cup", category: "Beverages" },
];

export const foodCategories = [...new Set(foodDatabase.map(f => f.category))];

export function searchFoods(query: string): FoodItem[] {
  const q = query.toLowerCase().trim();
  if (!q) return foodDatabase.slice(0, 20);
  return foodDatabase.filter(f =>
    f.name.toLowerCase().includes(q) || f.category.toLowerCase().includes(q)
  );
}
