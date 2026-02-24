export interface ExerciseTemplate {
  id: string;
  name: string;
  muscleGroups: string[];
  caloriesPerMinute: number;
  category: string;
}

export const exerciseDatabase: ExerciseTemplate[] = [
  // Chest
  { id: "e1", name: "Bench Press", muscleGroups: ["chest", "triceps", "shoulders"], caloriesPerMinute: 8, category: "Chest" },
  { id: "e2", name: "Push-ups", muscleGroups: ["chest", "triceps", "shoulders"], caloriesPerMinute: 7, category: "Chest" },
  { id: "e3", name: "Chest Fly", muscleGroups: ["chest"], caloriesPerMinute: 6, category: "Chest" },
  { id: "e4", name: "Incline Bench Press", muscleGroups: ["chest", "shoulders", "triceps"], caloriesPerMinute: 8, category: "Chest" },

  // Back
  { id: "e5", name: "Pull-ups", muscleGroups: ["lats", "biceps", "back"], caloriesPerMinute: 9, category: "Back" },
  { id: "e6", name: "Barbell Row", muscleGroups: ["back", "lats", "biceps"], caloriesPerMinute: 7, category: "Back" },
  { id: "e7", name: "Lat Pulldown", muscleGroups: ["lats", "biceps"], caloriesPerMinute: 6, category: "Back" },
  { id: "e8", name: "Deadlift", muscleGroups: ["back", "hamstrings", "glutes", "traps"], caloriesPerMinute: 10, category: "Back" },

  // Shoulders
  { id: "e9", name: "Overhead Press", muscleGroups: ["shoulders", "triceps"], caloriesPerMinute: 7, category: "Shoulders" },
  { id: "e10", name: "Lateral Raises", muscleGroups: ["shoulders"], caloriesPerMinute: 5, category: "Shoulders" },
  { id: "e11", name: "Face Pulls", muscleGroups: ["shoulders", "traps"], caloriesPerMinute: 5, category: "Shoulders" },

  // Arms
  { id: "e12", name: "Bicep Curls", muscleGroups: ["biceps"], caloriesPerMinute: 5, category: "Arms" },
  { id: "e13", name: "Tricep Dips", muscleGroups: ["triceps", "chest"], caloriesPerMinute: 7, category: "Arms" },
  { id: "e14", name: "Hammer Curls", muscleGroups: ["biceps", "forearms"], caloriesPerMinute: 5, category: "Arms" },
  { id: "e15", name: "Skull Crushers", muscleGroups: ["triceps"], caloriesPerMinute: 5, category: "Arms" },

  // Legs
  { id: "e16", name: "Squats", muscleGroups: ["quads", "glutes", "hamstrings"], caloriesPerMinute: 9, category: "Legs" },
  { id: "e17", name: "Lunges", muscleGroups: ["quads", "glutes", "hamstrings"], caloriesPerMinute: 8, category: "Legs" },
  { id: "e18", name: "Leg Press", muscleGroups: ["quads", "glutes"], caloriesPerMinute: 7, category: "Legs" },
  { id: "e19", name: "Calf Raises", muscleGroups: ["calves"], caloriesPerMinute: 4, category: "Legs" },
  { id: "e20", name: "Romanian Deadlift", muscleGroups: ["hamstrings", "glutes", "back"], caloriesPerMinute: 8, category: "Legs" },
  { id: "e21", name: "Leg Curls", muscleGroups: ["hamstrings"], caloriesPerMinute: 5, category: "Legs" },
  { id: "e22", name: "Leg Extensions", muscleGroups: ["quads"], caloriesPerMinute: 5, category: "Legs" },

  // Core
  { id: "e23", name: "Crunches", muscleGroups: ["abs"], caloriesPerMinute: 5, category: "Core" },
  { id: "e24", name: "Plank", muscleGroups: ["abs", "obliques"], caloriesPerMinute: 4, category: "Core" },
  { id: "e25", name: "Russian Twists", muscleGroups: ["obliques", "abs"], caloriesPerMinute: 6, category: "Core" },
  { id: "e26", name: "Hanging Leg Raises", muscleGroups: ["abs"], caloriesPerMinute: 6, category: "Core" },

  // Cardio
  { id: "e27", name: "Running", muscleGroups: ["quads", "hamstrings", "calves", "glutes"], caloriesPerMinute: 11, category: "Cardio" },
  { id: "e28", name: "Cycling", muscleGroups: ["quads", "hamstrings", "calves"], caloriesPerMinute: 8, category: "Cardio" },
  { id: "e29", name: "Jump Rope", muscleGroups: ["calves", "quads", "shoulders"], caloriesPerMinute: 12, category: "Cardio" },
  { id: "e30", name: "Swimming", muscleGroups: ["lats", "shoulders", "chest", "back"], caloriesPerMinute: 10, category: "Cardio" },
];

export const exerciseCategories = [...new Set(exerciseDatabase.map(e => e.category))];
