import { useMemo, useState } from "react";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, AreaChart, Area } from "recharts";
import { subDays, format } from "date-fns";
import { useApp } from "@/context/AppContext";
import { foodDatabase } from "@/data/foods";
import { formatDate, getToday, generateId } from "@/lib/dateUtils";
import CalorieRing from "@/components/CalorieRing";

const Profile = () => {
  const { profile, setProfile, weights, setWeights, meals, workouts, steps } = useApp();
  const [editing, setEditing] = useState(false);
  const today = getToday();

  const weightData = useMemo(() => {
    return weights.slice(-14).map(w => ({
      date: format(new Date(w.date), "MM/dd"),
      weight: w.weight,
    }));
  }, [weights]);

  const last7Days = useMemo(() => {
    return Array.from({ length: 7 }).map((_, i) => {
      const d = subDays(new Date(), 6 - i);
      const ds = formatDate(d);
      const dayMeals = meals.filter(m => m.date === ds);
      let cal = 0;
      dayMeals.forEach(m => {
        const food = foodDatabase.find(f => f.id === m.foodId);
        if (food) cal += food.calories * m.servings;
      });
      const burned = workouts.filter(w => w.date === ds).reduce((s, w) => s + w.caloriesBurned, 0);
      const stepsDay = steps.find(s => s.date === ds)?.steps || 0;
      return { date: format(d, "EEE"), calories: Math.round(cal), burned, steps: stepsDay };
    });
  }, [meals, workouts, steps]);

  const totalCalories7d = last7Days.reduce((s, d) => s + d.calories, 0);
  const totalBurned7d = last7Days.reduce((s, d) => s + d.burned, 0);
  const avgSteps = Math.round(last7Days.reduce((s, d) => s + d.steps, 0) / 7);

  const logWeight = () => {
    const w = prompt("Enter today's weight (kg):", String(profile.weight));
    if (w && !isNaN(Number(w))) {
      setWeights(prev => {
        const existing = prev.find(x => x.date === today);
        if (existing) return prev.map(x => x.date === today ? { ...x, weight: Number(w) } : x);
        return [...prev, { date: today, weight: Number(w) }];
      });
      setProfile(prev => ({ ...prev, weight: Number(w) }));
    }
  };

  const bmi = (profile.weight / ((profile.height / 100) ** 2)).toFixed(1);

  return (
    <div className="flex flex-col min-h-screen pb-24 max-w-md mx-auto">
      <div className="px-5 pt-12 pb-4">
        <h1 className="text-2xl font-extrabold">Profile</h1>
      </div>

      <div className="px-5 space-y-4">
        {/* Profile Card */}
        <div className="bg-card rounded-2xl p-5">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-2xl">👤</div>
            <div className="flex-1">
              <h2 className="text-lg font-extrabold">{profile.name}</h2>
              <p className="text-sm text-muted-foreground">Age {profile.age} · {profile.height}cm</p>
            </div>
            <button onClick={() => setEditing(!editing)} className="text-xs card-primary px-3 py-1 rounded-full font-semibold">Edit</button>
          </div>
        </div>

        {editing && (
          <div className="bg-card rounded-2xl p-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-muted-foreground">Name</label>
                <input value={profile.name} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))} className="w-full bg-secondary rounded-lg px-3 py-2 text-sm text-foreground outline-none" />
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground">Age</label>
                <input type="number" value={profile.age} onChange={e => setProfile(p => ({ ...p, age: Number(e.target.value) }))} className="w-full bg-secondary rounded-lg px-3 py-2 text-sm text-foreground outline-none" />
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground">Height (cm)</label>
                <input type="number" value={profile.height} onChange={e => setProfile(p => ({ ...p, height: Number(e.target.value) }))} className="w-full bg-secondary rounded-lg px-3 py-2 text-sm text-foreground outline-none" />
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground">Goal Weight (kg)</label>
                <input type="number" value={profile.goalWeight} onChange={e => setProfile(p => ({ ...p, goalWeight: Number(e.target.value) }))} className="w-full bg-secondary rounded-lg px-3 py-2 text-sm text-foreground outline-none" />
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground">Daily Cal Goal</label>
                <input type="number" value={profile.dailyCalorieGoal} onChange={e => setProfile(p => ({ ...p, dailyCalorieGoal: Number(e.target.value) }))} className="w-full bg-secondary rounded-lg px-3 py-2 text-sm text-foreground outline-none" />
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground">Steps Goal</label>
                <input type="number" value={profile.dailyStepsGoal} onChange={e => setProfile(p => ({ ...p, dailyStepsGoal: Number(e.target.value) }))} className="w-full bg-secondary rounded-lg px-3 py-2 text-sm text-foreground outline-none" />
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground">Protein Goal (g)</label>
                <input type="number" value={profile.proteinGoal} onChange={e => setProfile(p => ({ ...p, proteinGoal: Number(e.target.value) }))} className="w-full bg-secondary rounded-lg px-3 py-2 text-sm text-foreground outline-none" />
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground">Carbs Goal (g)</label>
                <input type="number" value={profile.carbsGoal} onChange={e => setProfile(p => ({ ...p, carbsGoal: Number(e.target.value) }))} className="w-full bg-secondary rounded-lg px-3 py-2 text-sm text-foreground outline-none" />
              </div>
            </div>
            <button onClick={() => setEditing(false)} className="w-full card-primary rounded-xl py-2 text-sm font-bold">Save</button>
          </div>
        )}

        {/* Body Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="card-green rounded-2xl p-3 text-center">
            <p className="text-xl font-extrabold">{profile.weight}</p>
            <p className="text-[10px] font-medium opacity-70">kg</p>
          </div>
          <div className="card-yellow rounded-2xl p-3 text-center">
            <p className="text-xl font-extrabold">{bmi}</p>
            <p className="text-[10px] font-medium opacity-70">BMI</p>
          </div>
          <div className="card-lavender rounded-2xl p-3 text-center">
            <p className="text-xl font-extrabold">{profile.goalWeight}</p>
            <p className="text-[10px] font-medium opacity-70">Goal kg</p>
          </div>
        </div>

        <button onClick={logWeight} className="w-full bg-card rounded-2xl p-3 text-center text-sm font-bold text-primary">
          + Log Today's Weight
        </button>

        {/* Weight Progress Chart */}
        <div className="bg-card rounded-2xl p-4">
          <h3 className="text-base font-bold mb-3">Weight Progress</h3>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weightData}>
                <defs>
                  <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(153, 52%, 52%)" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="hsl(153, 52%, 52%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: "hsl(0, 0%, 60%)" }} axisLine={false} tickLine={false} />
                <YAxis domain={["dataMin - 1", "dataMax + 1"]} tick={{ fontSize: 10, fill: "hsl(0, 0%, 60%)" }} axisLine={false} tickLine={false} width={35} />
                <Tooltip contentStyle={{ background: "hsl(0, 0%, 12%)", border: "none", borderRadius: 8, color: "#fff", fontSize: 12 }} />
                <Area type="monotone" dataKey="weight" stroke="hsl(153, 52%, 52%)" fill="url(#weightGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Weekly Summary */}
        <div className="bg-card rounded-2xl p-4">
          <h3 className="text-base font-bold mb-3">7-Day Summary</h3>
          <div className="h-32">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={last7Days}>
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: "hsl(0, 0%, 60%)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "hsl(0, 0%, 60%)" }} axisLine={false} tickLine={false} width={35} />
                <Tooltip contentStyle={{ background: "hsl(0, 0%, 12%)", border: "none", borderRadius: 8, color: "#fff", fontSize: 12 }} />
                <Line type="monotone" dataKey="calories" stroke="hsl(18, 100%, 54%)" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="burned" stroke="hsl(153, 52%, 52%)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="card-primary rounded-2xl p-4 text-center">
            <p className="text-2xl font-extrabold">{totalCalories7d.toLocaleString()}</p>
            <p className="text-xs opacity-80">Calories (7d)</p>
          </div>
          <div className="card-green rounded-2xl p-4 text-center">
            <p className="text-2xl font-extrabold">{totalBurned7d.toLocaleString()}</p>
            <p className="text-xs opacity-80">Burned (7d)</p>
          </div>
          <div className="card-orange rounded-2xl p-4 text-center col-span-2">
            <p className="text-2xl font-extrabold">{avgSteps.toLocaleString()}</p>
            <p className="text-xs opacity-70">Avg Daily Steps</p>
          </div>
        </div>

        {/* Progress toward goal */}
        <div className="bg-card rounded-2xl p-4">
          <h3 className="text-sm font-bold mb-2">Weight Goal Progress</h3>
          <div className="flex items-center gap-3">
            <CalorieRing
              consumed={Math.abs(weights[0]?.weight - profile.weight)}
              goal={Math.abs(weights[0]?.weight - profile.goalWeight) || 1}
              size={80}
              strokeWidth={8}
              color="hsl(18, 100%, 54%)"
              label="lost"
            />
            <div>
              <p className="text-sm font-bold">{(profile.weight - profile.goalWeight).toFixed(1)} kg to go</p>
              <p className="text-xs text-muted-foreground">Started at {weights[0]?.weight || profile.weight} kg</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
