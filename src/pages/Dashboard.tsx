import { useMemo, useState } from "react";
import { Plus, Minus, Droplets } from "lucide-react";
import WeekCalendar from "@/components/WeekCalendar";
import { useApp } from "@/context/AppContext";
import { foodDatabase } from "@/data/foods";
import { getToday } from "@/lib/dateUtils";
import CalorieRing from "@/components/CalorieRing";

// ── Exact Figma ring path (218×218 viewBox) ───────────────────────────────────
const RING_PATH_D =
  "M189.372 108.626C193.619 108.626 197.097 105.176 196.729 100.944C194.93 80.304 185.925 60.8554 171.159 46.0902C154.574 29.5047 132.079 20.1871 108.624 20.1871C85.1684 20.1871 62.6737 29.5047 46.0882 46.0902C31.3229 60.8554 22.3178 80.304 20.519 100.944C20.1503 105.176 23.6281 108.626 27.8754 108.626L40.3649 108.626C44.6121 108.626 48.0048 105.169 48.5426 100.956C50.2319 87.7209 56.2597 75.333 65.7953 65.7973C77.1542 54.4385 92.56 48.0572 108.624 48.0572C124.688 48.0572 140.093 54.4385 151.452 65.7973C160.988 75.333 167.016 87.7209 168.705 100.956C169.243 105.169 172.635 108.626 176.883 108.626H189.372Z";

const VB = 218;
const CX_VB = 108.626;
const CY_VB = 108.626;
const CLIP_R = 140;
const toRad = (d: number) => (d * Math.PI) / 180;

function sectorCW(fromDeg: number, toDeg: number): string {
  const span = toDeg - fromDeg;
  if (span <= 0.01) return "M 0 0";
  const ax = CX_VB + CLIP_R * Math.cos(toRad(fromDeg));
  const ay = CY_VB + CLIP_R * Math.sin(toRad(fromDeg));
  const bx = CX_VB + CLIP_R * Math.cos(toRad(toDeg));
  const by = CY_VB + CLIP_R * Math.sin(toRad(toDeg));
  const large: 0 | 1 = span > 180 ? 1 : 0;
  return `M ${CX_VB} ${CY_VB} L ${ax} ${ay} A ${CLIP_R} ${CLIP_R} 0 ${large} 1 ${bx} ${by} Z`;
}

// ── Macro gauge (same Figma path, scaled down) ───────────────────────────────
let _gid = 0;

const MacroGauge = ({
  current,
  goal,
  color,
  bgColor,
  size = 130,
}: {
  current: number;
  goal: number;
  color: string;
  bgColor: string;
  size?: number;
}) => {
  const id = `mg-${++_gid}`;
  const pct = Math.min(current / Math.max(goal, 1), 1);
  const eatEnd = 180 + pct * 180;
  const cropH = 118;

  return (
    <svg
      width={size}
      height={size * (cropH / VB)}
      viewBox={`0 0 ${VB} ${cropH}`}
      fill="none"
      style={{ display: "block" }}
    >
      <defs>
        <clipPath id={id}>
          <path d={sectorCW(180, eatEnd)} />
        </clipPath>
      </defs>
      {/* track — card colour at low opacity to match CalorieRing */}
      <path d={RING_PATH_D} fill={bgColor} />
      {/* consumed — dark fill */}
      {pct > 0.001 && (
        <path d={RING_PATH_D} fill={color} clipPath={`url(#${id})`} />
      )}
    </svg>
  );
};

// ── Macro card ────────────────────────────────────────────────────────────────
const MacroCard = ({
  label,
  current,
  goal,
  cardClass,
  arcColor,
  arcBg,
  noData = false,
  unit = "g",
}: {
  label: string;
  current: number;
  goal: number;
  cardClass: string;
  arcColor: string;
  arcBg: string;
  noData?: boolean;
  unit?: string;
}) => {
  // Allow negative remaining
  const left = goal - current;

  return (
    <div className={`${cardClass} rounded-3xl p-4 flex flex-col`} style={{ minHeight: 170 }}>
      <p className="text-sm font-bold mb-1">{label}</p>
      <div className="flex justify-center mt-1">
        <MacroGauge current={current} goal={goal} color={arcColor} bgColor={arcBg} size={130} />
      </div>
      <div className="flex items-end justify-between mt-auto px-1">
        <div className="flex flex-col">
          <span className="text-[11px] font-semibold opacity-60">{current}{unit}</span>
          <span className="text-[9px] font-semibold opacity-40">Taken</span>
        </div>

        <div className="flex flex-col items-center leading-none">
          <span className="text-xl font-extrabold">{left}{unit}</span>
          <span className="text-[10px] font-semibold opacity-60 mt-0.5">Left</span>
        </div>

        <div className="flex flex-col items-end">
          <span className="text-[11px] font-semibold opacity-60">{goal}{unit}</span>
          <span className="text-[9px] font-semibold opacity-40">Target</span>
        </div>
      </div>
    </div>
  );
};

const WaterCard = ({
  current,
  goal,
  onUpdate,
}: {
  current: number;
  goal: number;
  onUpdate: (amount: number) => void;
}) => {
  const pct = Math.min((current / goal) * 100, 100);

  return (
    <div className="card-lavender rounded-3xl p-4 flex flex-col justify-between" style={{ minHeight: 170 }}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Droplets className="w-5 h-5 text-foreground" />
          <p className="text-sm font-bold text-foreground">Water</p>
        </div>
        <div className="flex items-center gap-1 bg-muted/30 rounded-xl p-0.5">
          <button
            onClick={() => onUpdate(-100)}
            className="w-7 h-7 flex items-center justify-center hover:bg-muted/50 rounded-lg transition-colors"
          >
            <Minus size={14} className="text-foreground" strokeWidth={3} />
          </button>
          <button
            onClick={() => onUpdate(100)}
            className="w-7 h-7 flex items-center justify-center hover:bg-muted/50 rounded-lg transition-colors"
          >
            <Plus size={14} className="text-foreground" strokeWidth={3} />
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center">
        <div className="flex items-baseline gap-1 mb-2">
          <span className="text-2xl font-black text-foreground">{current}</span>
          <span className="text-xs font-bold text-muted-foreground">/ {goal} ml</span>
        </div>

        <div className="w-full h-3 bg-muted/60 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <p className="text-[10px] font-bold text-[#121212]/50 mt-2 uppercase tracking-wider">
        {pct >= 100 ? "Goal reached! 🚀" : `${goal - current}ml remaining`}
      </p>
    </div>
  );
};


// ── Dashboard ─────────────────────────────────────────────────────────────────
const Dashboard = () => {
  const { meals, water, workouts, profile, setWater, steps } = useApp();
  const [selectedDate, setSelectedDate] = useState<string>(getToday());
  const today = getToday();

  const selectedMeals = useMemo(() => meals.filter((m) => m.date === selectedDate), [meals, selectedDate]);
  const selectedWorkouts = useMemo(() => workouts.filter((w) => w.date === selectedDate), [workouts, selectedDate]);

  const totals = useMemo(() => {
    const offCache: Record<string, typeof foodDatabase[0]> = JSON.parse(
      localStorage.getItem("caltrack-searched-foods") || "{}"
    );
    let calories = 0, protein = 0, carbs = 0, fat = 0;
    selectedMeals.forEach((m) => {
      const food = foodDatabase.find((f) => f.id === m.foodId) ?? offCache[m.foodId];
      if (food) {
        calories += food.calories * m.servings;
        protein += food.protein * m.servings;
        carbs += food.carbs * m.servings;
        fat += food.fat * m.servings;
      }
    });
    return {
      calories: Math.round(calories),
      protein: Math.round(protein),
      carbs: Math.round(carbs),
      fat: Math.round(fat),
    };
  }, [selectedMeals]);

  const caloriesBurned = useMemo(
    () => selectedWorkouts.reduce((s, w) => s + w.caloriesBurned, 0),
    [selectedWorkouts],
  );

  const selectedWater = water.find((w) => w.date === selectedDate)?.ml ?? 0;

  // Calculate total workout duration
  const totalDuration = useMemo(
    () => selectedWorkouts.reduce((s, w) => s + w.duration, 0),
    [selectedWorkouts]
  );

  // Steps for selected date (defaults to 0 if not today/logged)
  const selectedSteps = steps.find((s) => s.date === selectedDate)?.steps ?? 0;


  // Has any data been logged for the selected date?
  const hasData = selectedMeals.length > 0 || selectedWorkouts.length > 0 || selectedWater > 0;



  return (
    <div className="flex flex-col min-h-screen pb-28 max-w-md mx-auto" style={{ background: "#121212", color: "#fff" }}>

      <div className="fixed top-0 w-full max-w-md z-50 bg-[#121212] pt-6 pb-1">
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-5 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-lg" style={{ background: "#cc1111" }}>
              P
            </div>
            <p className="text-base font-semibold">Welcome Back, Player.</p>
          </div>

        </div>

        {/* ── Week Selector ── */}
        <WeekCalendar selectedDate={selectedDate} setSelectedDate={setSelectedDate} />
      </div>

      {/* ── Content ── */}
      <div className="h-[170px]" />
      <div className="px-5 space-y-4">
        <h2 className="text-2xl font-bold">Dashboard</h2>
        {/* Calories — redesigned layout */}
        <div className="card-lavender rounded-3xl p-4 flex flex-col gap-2">
          {/* Top Formula */}
          <p className="text-[10px] font-bold text-muted-foreground text-center w-full uppercase tracking-wider">
            Remaining = Goal - Food + Exercise
          </p>

          <div className="flex flex-col items-center justify-center gap-6 mt-2">
            {/* Top: Ring */}
            <div className="flex-shrink-0">
              <CalorieRing
                consumed={hasData ? totals.calories : 0}
                goal={profile.dailyCalorieGoal}
                burned={hasData ? caloriesBurned : 0}
                size={190}
                color="hsl(var(--primary))"
                bgColor="#212020"
                showLabel
                label="Left"
              />
            </div>

            {/* Bottom: Details Row */}
            <div className="w-full flex flex-row items-center justify-around px-2">
              {/* Column 1: Base Goal */}
              <div className="flex flex-col items-center">
                <p className="text-xs font-bold text-muted-foreground mb-1">Base Goal</p>
                <p className="text-xl font-extrabold text-foreground leading-none">{profile.dailyCalorieGoal}</p>
              </div>

              <div className="w-[1px] h-8 bg-border mx-2" />

              {/* Column 2: Food */}
              <div className="flex flex-col items-center">
                <p className="text-xs font-bold text-muted-foreground mb-1">Food</p>
                <p className="text-xl font-extrabold text-foreground leading-none">{hasData ? totals.calories : 0}</p>
              </div>

              <div className="w-[1px] h-8 bg-border mx-2" />

              {/* Column 3: Exercise */}
              <div className="flex flex-col items-center">
                <p className="text-xs font-bold text-muted-foreground mb-1">Exercise</p>
                <p className="text-xl font-extrabold text-foreground leading-none">{hasData ? caloriesBurned : 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Macro cards — responsive auto grid, equal size */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 12 }}>
          <MacroCard
            label="Carbs"
            current={hasData ? totals.carbs : 0}
            goal={profile.carbsGoal}
            cardClass="card-lavender"
            arcColor="#45C588"
            arcBg="#212020"
            noData={!hasData}
          />
          <MacroCard
            label="Protein"
            current={hasData ? totals.protein : 0}
            goal={profile.proteinGoal}
            cardClass="card-lavender"
            arcColor="#FF6F43"
            arcBg="#212020"
            noData={!hasData}
          />
          <MacroCard
            label="Fats"
            current={hasData ? totals.fat : 0}
            goal={profile.fatGoal}
            cardClass="card-lavender"
            arcColor="#F5F378"
            arcBg="#212020"
            noData={!hasData}
          />
          <WaterCard
            current={hasData ? selectedWater : 0}
            goal={profile.dailyWaterGoal}
            onUpdate={(amt) => {
              setWater((prev) => {
                const existing = prev.find((w) => w.date === selectedDate);
                if (existing) {
                  return prev.map((w) =>
                    w.date === selectedDate
                      ? { ...w, ml: Math.max(0, w.ml + amt) }
                      : w
                  );
                }
                return [...prev, { date: selectedDate, ml: Math.max(0, amt) }];
              });
            }}
          />

          {/* Exercise Card */}
          <div className="card-lavender rounded-3xl p-4 flex flex-col justify-between" style={{ minHeight: 170 }}>
            <div>
              <p className="text-sm font-bold mb-1">Exercise</p>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-foreground">{totalDuration}</span>
                <span className="text-xs font-bold text-muted-foreground">mins</span>
              </div>
            </div>

            <div className="mt-auto">
              <p className="text-xs font-bold text-muted-foreground mb-0.5">Burned</p>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-foreground">{caloriesBurned}</span>
                <span className="text-xs font-bold text-muted-foreground">kcal</span>
              </div>
            </div>
          </div>

          {/* Steps Card */}
          <div className="card-lavender rounded-3xl p-4 flex flex-col justify-between" style={{ minHeight: 170 }}>
            <div>
              <p className="text-sm font-bold mb-1">Steps</p>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-foreground">{selectedSteps.toLocaleString()}</span>
              </div>
              <p className="text-xs font-bold text-muted-foreground mb-2">/ {profile.dailyStepsGoal.toLocaleString()}</p>

              {/* Progress Bar */}
              <div className="w-full h-2 bg-muted/60 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full"
                  style={{ width: `${Math.min((selectedSteps / profile.dailyStepsGoal) * 100, 100)}%` }}
                />
              </div>
            </div>

            <div className="mt-auto">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">
                {selectedSteps >= profile.dailyStepsGoal ? "Goal Hit!" : "Keep going"}
              </p>
            </div>
          </div>
        </div>




      </div>
    </div>
  );
};

export default Dashboard;
