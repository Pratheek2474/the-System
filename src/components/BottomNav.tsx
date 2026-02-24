import { useState } from "react";
import { Home, Sparkles, ClipboardList, Settings, Plus } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { getToday, generateId } from "@/lib/dateUtils";
import { exerciseDatabase } from "@/data/exercises";
import QuickLogSheet from "@/components/QuickLogSheet";
import FoodSearch from "@/components/FoodSearch";

const LEFT_TABS = [
  { icon: Home, label: "Home", path: "/" },
  { icon: Sparkles, label: "Workouts", path: "/workouts" },
];
const RIGHT_TABS = [
  { icon: ClipboardList, label: "Diary", path: "/diary" },
  { icon: Settings, label: "Profile", path: "/profile" },
];

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { setWater, setWorkouts, setSteps, profile } = useApp();
  const [open, setOpen] = useState(false);
  const [showFoodSearch, setShowFoodSearch] = useState(false);

  const today = getToday();

  // ── Quick-log handlers ─────────────────────────────────────────────────────
  const handleLogWater = () => {
    setWater((prev) => {
      const existing = prev.find((w) => w.date === today);
      if (existing) return prev.map((w) => w.date === today ? { ...w, ml: Math.min(w.ml + 250, profile.dailyWaterGoal) } : w);
      return [...prev, { date: today, ml: 250 }];
    });
  };

  const handleLogFood = () => {
    setShowFoodSearch(true);
  };

  const handleLogExercise = () => {
    const name = prompt("Exercise name (or press Cancel):");
    if (!name) return;
    const dur = prompt("Duration in minutes?", "30");
    if (!dur || isNaN(Number(dur))) return;
    const duration = Number(dur);
    const matchedEx = exerciseDatabase.find((e) => e.name.toLowerCase().includes(name.toLowerCase()));
    const cpm = matchedEx?.caloriesPerMinute ?? 5;
    const muscleGroups = matchedEx?.muscleGroups ?? ["full body"];
    setWorkouts((prev) => [
      ...prev,
      {
        id: generateId(),
        name,
        muscleGroups,
        caloriesBurned: Math.round(cpm * duration),
        duration,
        date: today,
      },
    ]);
  };

  const handleLogSteps = () => {
    const val = prompt("Enter step count:");
    if (!val || isNaN(Number(val))) return;
    setSteps((prev) => {
      const existing = prev.find((s) => s.date === today);
      if (existing) return prev.map((s) => s.date === today ? { ...s, steps: Number(val) } : s);
      return [...prev, { date: today, steps: Number(val) }];
    });
  };

  const renderTab = (tab: { icon: React.ElementType; label: string; path: string }) => {
    const isActive = location.pathname === tab.path;
    return (
      <button
        key={tab.label}
        onClick={() => navigate(tab.path)}
        className="flex items-center justify-center transition-all"
        style={{
          width: 52,
          height: 52,
          borderRadius: "50%",
          background: isActive ? "#FF5A16" : "transparent",
          color: isActive ? "#FFFFFF" : "rgba(255,255,255,0.45)",
        }}
      >
        <tab.icon size={22} />
      </button>
    );
  };

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pb-6" style={{ pointerEvents: "none" }}>
        <div
          className="flex items-center gap-1 px-4 py-2 rounded-full"
          style={{
            background: "#232220",
            backdropFilter: "blur(16px)",
            pointerEvents: "all",
            boxShadow: "0 4px 32px rgba(0,0,0,0.5)",
          }}
        >
          {/* Left tabs */}
          {LEFT_TABS.map(renderTab)}

          {/* Center "+" button */}
          <button
            onClick={() => setOpen(true)}
            className="flex items-center justify-center transition-all active:scale-90 mx-1"
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #FF5A16 0%, #FF8C00 100%)",
              boxShadow: "0 4px 20px rgba(255,90,22,0.5)",
              color: "#fff",
            }}
          >
            <Plus size={26} strokeWidth={2.5} />
          </button>

          {/* Right tabs */}
          {RIGHT_TABS.map(renderTab)}
        </div>
      </div>

      {/* Quick Log Sheet */}
      {open && (
        <QuickLogSheet
          onClose={() => setOpen(false)}
          onLogWater={handleLogWater}
          onLogFood={handleLogFood}
          onLogExercise={handleLogExercise}
          onLogSteps={handleLogSteps}
        />
      )}

      {/* Food Search */}
      {showFoodSearch && (
        <FoodSearch onClose={() => setShowFoodSearch(false)} />
      )}
    </>
  );
};

export default BottomNav;
