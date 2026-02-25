import { useMemo, useState } from "react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, AreaChart, Area } from "recharts";
import { subDays, format } from "date-fns";
import { useApp } from "@/context/AppContext";
import { foodDatabase } from "@/data/foods";
import { formatDate, getToday } from "@/lib/dateUtils";
import LogWeightSheet from "@/components/LogWeightSheet";

const Profile = () => {
  const { profile, setProfile, weights, setWeights, meals, workouts, steps } = useApp();
  const [editing, setEditing] = useState(false);
  const [showLogWeight, setShowLogWeight] = useState(false);
  const { water } = useApp();
  const today = getToday();
  const [selectedDate, setSelectedDate] = useState<string>(today);

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
      const waterDay = water.find(w => w.date === ds)?.ml || 0;
      return {
        date: format(d, "EEE"),
        calories: Math.round(cal),
        netCalories: Math.round(cal - burned),
        burned,
        steps: stepsDay,
        water: waterDay
      };
    });
  }, [meals, workouts, steps, water]);

  const bmi = (profile.weight / ((profile.height / 100) ** 2)).toFixed(1);

  return (
    <div className="flex flex-col min-h-screen pb-28 max-w-md mx-auto" style={{ background: "#121212", color: "#fff" }}>
      <div className="fixed top-0 w-full max-w-md z-50 bg-[#121212] pt-6 pb-4">
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-lg" style={{ background: "#cc1111" }}>
              P
            </div>
            <p className="text-base font-semibold">Welcome Back, Player.</p>
          </div>
          <h3 className="text-sm font-bold text-gray-400">{format(new Date(selectedDate), "MMM d, yyyy")}</h3>
        </div>
      </div>

      {/* Spacer for fixed header (reduced since calendar is gone) */}
      <div className="h-[80px]" />

      <div className="px-5 space-y-4">
        <h2 className="text-2xl font-bold">Profile</h2>
        {/* Consolidated Profile Stats Card */}
        <div className="bg-card rounded-2xl p-5 mb-4">
          <div className="flex items-center gap-4 mb-4 pb-4 border-b border-white/5">
            <h2 className="text-xl font-extrabold flex-1 text-white">{profile.name}</h2>
            <button
              onClick={() => setEditing(!editing)}
              className="text-xs px-4 py-1.5 rounded-full font-bold transition-colors"
              style={{ background: "#2A2A2A", color: "#fff" }}
            >
              {editing ? "Cancel" : "Edit Profile"}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-5">
            <div className="flex flex-col items-center justify-center p-3 rounded-xl" style={{ background: "#1A1A1A" }}>
              <span className="text-2xl font-black text-white">{profile.weight}</span>
              <span className="text-[10px] font-bold text-muted-foreground uppercase mt-1 text-center">Actual Weight<br />(kg)</span>
            </div>
            <div className="flex flex-col items-center justify-center p-3 rounded-xl" style={{ background: "#1A1A1A" }}>
              <span className="text-2xl font-black text-white">{profile.goalWeight}</span>
              <span className="text-[10px] font-bold text-muted-foreground uppercase mt-1 text-center">Goal Weight<br />(kg)</span>
            </div>
          </div>

          <button
            onClick={() => setShowLogWeight(true)}
            className="w-full rounded-xl py-3 text-sm font-bold transition-all active:scale-[0.98]"
            style={{ border: "1px dashed #3F3F3F", color: "#fff" }}
          >
            + Log Today's Weight
          </button>
        </div>

        {/* Demographics Card */}
        <div className="bg-card rounded-2xl p-5 mb-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="flex flex-col items-center justify-center p-2 rounded-xl" style={{ background: "#1A1A1A" }}>
              <span className="text-lg font-black text-white">{profile.height}</span>
              <span className="text-[10px] font-bold text-muted-foreground uppercase mt-0.5">cm</span>
            </div>
            <div className="flex flex-col items-center justify-center p-2 rounded-xl" style={{ background: "#1A1A1A" }}>
              <span className="text-lg font-black text-white">{profile.age}</span>
              <span className="text-[10px] font-bold text-muted-foreground uppercase mt-0.5">Years</span>
            </div>
            <div className="flex flex-col items-center justify-center p-2 rounded-xl" style={{ background: "#1A1A1A" }}>
              <span className="text-lg font-black text-white">{bmi}</span>
              <span className="text-[10px] font-bold text-muted-foreground uppercase mt-0.5">BMI</span>
            </div>
          </div>
        </div>

        {editing && (
          <div className="bg-card rounded-2xl p-4 space-y-3 mb-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold text-muted-foreground mb-1 block">Name</label>
                <input value={profile.name} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))} className="w-full bg-[#1A1A1A] rounded-lg px-3 py-2 text-sm text-foreground outline-none focus:ring-1 focus:ring-primary" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-muted-foreground mb-1 block">Age</label>
                <input type="number" value={profile.age} onChange={e => setProfile(p => ({ ...p, age: Number(e.target.value) }))} className="w-full bg-[#1A1A1A] rounded-lg px-3 py-2 text-sm text-foreground outline-none focus:ring-1 focus:ring-primary" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-muted-foreground mb-1 block">Height (cm)</label>
                <input type="number" value={profile.height} onChange={e => setProfile(p => ({ ...p, height: Number(e.target.value) }))} className="w-full bg-[#1A1A1A] rounded-lg px-3 py-2 text-sm text-foreground outline-none focus:ring-1 focus:ring-primary" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-muted-foreground mb-1 block">Goal Weight (kg)</label>
                <input type="number" value={profile.goalWeight} onChange={e => setProfile(p => ({ ...p, goalWeight: Number(e.target.value) }))} className="w-full bg-[#1A1A1A] rounded-lg px-3 py-2 text-sm text-foreground outline-none focus:ring-1 focus:ring-primary" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-muted-foreground mb-1 block">Daily Cal Goal</label>
                <input type="number" value={profile.dailyCalorieGoal} onChange={e => setProfile(p => ({ ...p, dailyCalorieGoal: Number(e.target.value) }))} className="w-full bg-[#1A1A1A] rounded-lg px-3 py-2 text-sm text-foreground outline-none focus:ring-1 focus:ring-primary" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-muted-foreground mb-1 block">Steps Goal</label>
                <input type="number" value={profile.dailyStepsGoal} onChange={e => setProfile(p => ({ ...p, dailyStepsGoal: Number(e.target.value) }))} className="w-full bg-[#1A1A1A] rounded-lg px-3 py-2 text-sm text-foreground outline-none focus:ring-1 focus:ring-primary" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-muted-foreground mb-1 block">Protein Goal (g)</label>
                <input type="number" value={profile.proteinGoal} onChange={e => setProfile(p => ({ ...p, proteinGoal: Number(e.target.value) }))} className="w-full bg-[#1A1A1A] rounded-lg px-3 py-2 text-sm text-foreground outline-none focus:ring-1 focus:ring-primary" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-muted-foreground mb-1 block">Carbs Goal (g)</label>
                <input type="number" value={profile.carbsGoal} onChange={e => setProfile(p => ({ ...p, carbsGoal: Number(e.target.value) }))} className="w-full bg-[#1A1A1A] rounded-lg px-3 py-2 text-sm text-foreground outline-none focus:ring-1 focus:ring-primary" />
              </div>
            </div>
            <button onClick={() => setEditing(false)} className="w-full bg-primary text-white rounded-xl py-2 text-sm font-bold shadow-[0_4px_14px_rgba(124,58,237,0.4)]">Save Details</button>
          </div>
        )}

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

        {/* Water Drank Chart */}
        <div className="bg-card rounded-2xl p-4">
          <h3 className="text-base font-bold mb-3">Water Progress (ml)</h3>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={last7Days}>
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: "hsl(0, 0%, 60%)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "hsl(0, 0%, 60%)" }} axisLine={false} tickLine={false} width={35} />
                <Tooltip cursor={{ fill: "rgba(255,255,255,0.05)" }} contentStyle={{ background: "hsl(0, 0%, 12%)", border: "none", borderRadius: 8, color: "#fff", fontSize: 12 }} />
                <Bar dataKey="water" fill="#4FC3F7" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Net Calories Chart */}
        <div className="bg-card rounded-2xl p-4">
          <h3 className="text-base font-bold mb-3">Net Calories</h3>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={last7Days}>
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: "hsl(0, 0%, 60%)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "hsl(0, 0%, 60%)" }} axisLine={false} tickLine={false} width={35} />
                <Tooltip cursor={{ fill: "rgba(255,255,255,0.05)" }} contentStyle={{ background: "hsl(0, 0%, 12%)", border: "none", borderRadius: 8, color: "#fff", fontSize: 12 }} />
                <Bar dataKey="netCalories" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Steps Chart */}
        <div className="bg-card rounded-2xl p-4">
          <h3 className="text-base font-bold mb-3">Steps Taken</h3>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={last7Days}>
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: "hsl(0, 0%, 60%)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "hsl(0, 0%, 60%)" }} axisLine={false} tickLine={false} width={35} />
                <Tooltip cursor={{ fill: "rgba(255,255,255,0.05)" }} contentStyle={{ background: "hsl(0, 0%, 12%)", border: "none", borderRadius: 8, color: "#fff", fontSize: 12 }} />
                <Bar dataKey="steps" fill="#DDC0FF" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {showLogWeight && (
        <LogWeightSheet onClose={() => setShowLogWeight(false)} />
      )}
    </div>
  );
};

export default Profile;
