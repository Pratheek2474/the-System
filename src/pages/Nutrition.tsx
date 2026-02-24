import { useMemo, useState } from "react";
import { format, subDays } from "date-fns";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { useApp } from "@/context/AppContext";
import { foodDatabase } from "@/data/foods";
import { getToday, getWeekDates, formatDate } from "@/lib/dateUtils";
import CalorieRing from "@/components/CalorieRing";

type ViewMode = "daily" | "weekly" | "monthly";

const Nutrition = () => {
  const { meals, water, workouts, profile } = useApp();
  const [mode, setMode] = useState<ViewMode>("daily");
  const today = getToday();
  const weekDates = getWeekDates();

  const getDayTotals = (date: string) => {
    const dayMeals = meals.filter(m => m.date === date);
    let cal = 0, prot = 0, carbs = 0, fat = 0, fiber = 0;
    dayMeals.forEach(m => {
      const food = foodDatabase.find(f => f.id === m.foodId);
      if (food) {
        cal += food.calories * m.servings;
        prot += food.protein * m.servings;
        carbs += food.carbs * m.servings;
        fat += food.fat * m.servings;
        fiber += food.fiber * m.servings;
      }
    });
    const burned = workouts.filter(w => w.date === date).reduce((s, w) => s + w.caloriesBurned, 0);
    const waterGlasses = water.find(w => w.date === date)?.glasses || 0;
    return { cal: Math.round(cal), prot: Math.round(prot), carbs: Math.round(carbs), fat: Math.round(fat), fiber: Math.round(fiber), burned, water: waterGlasses };
  };

  const todayData = getDayTotals(today);

  const chartData = useMemo(() => {
    return Array.from({ length: 7 }).map((_, i) => {
      const d = subDays(new Date(), 6 - i);
      const ds = formatDate(d);
      const t = getDayTotals(ds);
      return { name: format(d, "EEE"), calories: t.cal, burned: t.burned };
    });
  }, [meals, workouts]);

  const macros = [
    { label: "Calories", current: todayData.cal, goal: profile.dailyCalorieGoal, color: "hsl(18, 100%, 54%)", unit: "kcal" },
    { label: "Protein", current: todayData.prot, goal: profile.proteinGoal, color: "hsl(153, 52%, 52%)", unit: "g" },
    { label: "Carbs", current: todayData.carbs, goal: profile.carbsGoal, color: "hsl(59, 88%, 71%)", unit: "g" },
    { label: "Fat", current: todayData.fat, goal: profile.fatGoal, color: "hsl(270, 100%, 87%)", unit: "g" },
  ];

  return (
    <div className="flex flex-col min-h-screen pb-24 max-w-md mx-auto">
      <div className="px-5 pt-12 pb-4">
        <h1 className="text-2xl font-extrabold">Nutrition</h1>
      </div>

      {/* Status Rings */}
      <div className="px-5 mb-4">
        <div className="card-green rounded-2xl p-4">
          <h3 className="text-base font-bold mb-1">Your Nutrition Analysis</h3>
          <p className="text-xs opacity-70 mb-3">Track trends. Spot patterns. Crush your goals.</p>
          <div className="flex justify-center gap-4">
            {macros.map(m => (
              <CalorieRing key={m.label} consumed={m.current} goal={m.goal} size={70} strokeWidth={6} color={m.color} label={m.label} showLabel={false} />
            ))}
          </div>
          <div className="flex justify-center gap-4 mt-2">
            {macros.map(m => (
              <div key={m.label} className="text-center w-[70px]">
                <p className="text-[10px] font-bold">{m.current}{m.unit}</p>
                <p className="text-[9px] opacity-60">{m.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* View Mode Tabs */}
      <div className="px-5 mb-4">
        <div className="bg-card rounded-full p-1 flex">
          {(["daily", "weekly", "monthly"] as ViewMode[]).map(v => (
            <button key={v} onClick={() => setMode(v)} className={`flex-1 py-2 rounded-full text-xs font-semibold capitalize transition-colors ${mode === v ? "card-yellow" : "text-muted-foreground"}`}>{v}</button>
          ))}
        </div>
      </div>

      <div className="px-5 space-y-4">
        {/* Calorie Trends Chart */}
        <div className="card-lavender rounded-2xl p-4">
          <h3 className="text-base font-bold mb-3">Calorie Trends</h3>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: "hsl(270, 40%, 25%)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "hsl(270, 40%, 25%)" }} axisLine={false} tickLine={false} width={30} />
                <Tooltip contentStyle={{ background: "hsl(0, 0%, 12%)", border: "none", borderRadius: 8, color: "#fff", fontSize: 12 }} />
                <Line type="monotone" dataKey="calories" stroke="hsl(18, 100%, 54%)" strokeWidth={2} dot={{ r: 3, fill: "hsl(18, 100%, 54%)" }} />
                <Line type="monotone" dataKey="burned" stroke="hsl(153, 52%, 52%)" strokeWidth={2} dot={{ r: 3, fill: "hsl(153, 52%, 52%)" }} strokeDasharray="5 5" />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="flex gap-4 mt-2">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full" style={{ background: "hsl(18, 100%, 54%)" }} />
              <span className="text-[10px] font-medium">Consumed</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full" style={{ background: "hsl(153, 52%, 52%)" }} />
              <span className="text-[10px] font-medium">Burned</span>
            </div>
          </div>
        </div>

        {/* Macro Distribution */}
        <div className="card-yellow rounded-2xl p-4">
          <h3 className="text-base font-bold mb-1">Macro Distribution</h3>
          <div className="grid grid-cols-3 gap-2 mt-3">
            <div className="bg-accent-yellow/30 rounded-xl p-3 text-center">
              <p className="text-lg font-extrabold">{todayData.fat}g</p>
              <p className="text-xs font-medium opacity-70">Fats</p>
            </div>
            <div className="card-primary rounded-xl p-3 text-center">
              <p className="text-lg font-extrabold">{todayData.carbs}g</p>
              <p className="text-xs font-medium">Carbs</p>
            </div>
            <div className="card-orange rounded-xl p-3 text-center">
              <p className="text-lg font-extrabold">{todayData.prot}g</p>
              <p className="text-xs font-medium">Protein</p>
            </div>
          </div>
        </div>

        {/* Water Intake */}
        <div className="bg-card rounded-2xl p-4">
          <h3 className="text-base font-bold mb-2">Water Today</h3>
          <div className="flex items-center gap-3">
            <div className="flex gap-1.5 flex-wrap">
              {Array.from({ length: profile.dailyWaterGoal }).map((_, i) => (
                <span key={i} className={`text-xl ${i < todayData.water ? "" : "opacity-20"}`}>💧</span>
              ))}
            </div>
            <span className="text-sm font-bold ml-auto">{todayData.water}/{profile.dailyWaterGoal}</span>
          </div>
        </div>

        {/* Calories In vs Out */}
        <div className="bg-card rounded-2xl p-4">
          <h3 className="text-base font-bold mb-3">Calories Balance</h3>
          <div className="flex justify-between items-end">
            <div className="text-center">
              <div className="w-16 rounded-t-lg card-primary" style={{ height: Math.max(20, (todayData.cal / profile.dailyCalorieGoal) * 100) }} />
              <p className="text-xs font-bold mt-1">{todayData.cal}</p>
              <p className="text-[10px] text-muted-foreground">In</p>
            </div>
            <div className="text-center">
              <div className="w-16 rounded-t-lg card-green" style={{ height: Math.max(20, (todayData.burned / profile.dailyCalorieGoal) * 100) }} />
              <p className="text-xs font-bold mt-1">{todayData.burned}</p>
              <p className="text-[10px] text-muted-foreground">Burned</p>
            </div>
            <div className="text-center">
              <div className={`w-16 rounded-t-lg ${todayData.cal - todayData.burned > 0 ? "card-orange" : "card-green"}`} style={{ height: Math.max(20, Math.abs(todayData.cal - todayData.burned) / profile.dailyCalorieGoal * 100) }} />
              <p className="text-xs font-bold mt-1">{todayData.cal - todayData.burned}</p>
              <p className="text-[10px] text-muted-foreground">Net</p>
            </div>
          </div>
        </div>

        {/* Fiber */}
        <div className="bg-card rounded-2xl p-4">
          <h3 className="text-sm font-bold">Fiber: {todayData.fiber}g</h3>
          <div className="w-full h-1.5 bg-border rounded-full mt-2">
            <div className="h-full bg-accent-green rounded-full" style={{ width: `${Math.min((todayData.fiber / 30) * 100, 100)}%` }} />
          </div>
          <p className="text-[10px] text-muted-foreground mt-1">{todayData.fiber}/30g daily goal</p>
        </div>
      </div>
    </div>
  );
};

export default Nutrition;
