import { useMemo, useState } from "react";
import { format } from "date-fns";
import { Plus, Minus, Droplets } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { foodDatabase } from "@/data/foods";
import { getToday, getWeekDates, formatDate } from "@/lib/dateUtils";
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
  color,    // filled arc colour (#121212)
  bgColor,  // track colour (the card's own colour, rendered at 25% opacity)
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
      {/* track — card colour at low opacity */}
      <path d={RING_PATH_D} fill={bgColor} opacity={0.3} />
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
  const left = Math.max(goal - current, 0);
  const minLabel = Math.round(goal * 0.56);

  return (
    <div className={`${cardClass} rounded-3xl p-4 flex flex-col`} style={{ minHeight: 170 }}>
      <p className="text-sm font-bold mb-1">{label}</p>
      <div className="flex justify-center mt-1">
        <MacroGauge current={current} goal={goal} color={arcColor} bgColor={arcBg} size={130} />
      </div>
      <div className="flex items-end justify-between mt-auto px-1">
        <span className="text-[11px] font-semibold opacity-60">{minLabel}{unit}</span>
        <div className="flex flex-col items-center leading-none">
          <span className="text-xl font-extrabold">{noData ? "—" : `${left}${unit}`}</span>
          <span className="text-[10px] font-semibold opacity-60 mt-0.5">{noData ? "No data" : "Left"}</span>
        </div>
        <span className="text-[11px] font-semibold opacity-60">{goal}{unit}</span>
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
    <div className="card-blue rounded-3xl p-4 flex flex-col justify-between" style={{ minHeight: 170 }}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Droplets className="w-5 h-5 text-[#121212]" />
          <p className="text-sm font-bold text-[#121212]">Water</p>
        </div>
        <div className="flex items-center gap-1 bg-white/20 rounded-xl p-0.5">
          <button
            onClick={() => onUpdate(-100)}
            className="w-7 h-7 flex items-center justify-center hover:bg-white/20 rounded-lg transition-colors"
          >
            <Minus size={14} color="#121212" strokeWidth={3} />
          </button>
          <button
            onClick={() => onUpdate(100)}
            className="w-7 h-7 flex items-center justify-center hover:bg-white/20 rounded-lg transition-colors"
          >
            <Plus size={14} color="#121212" strokeWidth={3} />
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center">
        <div className="flex items-baseline gap-1 mb-2">
          <span className="text-2xl font-black text-[#121212]">{current}</span>
          <span className="text-xs font-bold text-[#121212]/60">/ {goal} ml</span>
        </div>

        <div className="w-full h-3 bg-white/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#121212] rounded-full transition-all duration-500"
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
  const { meals, water, workouts, profile, setWater } = useApp();
  const [selectedDate, setSelectedDate] = useState<string>(getToday());
  const today = getToday();
  const weekDates = getWeekDates();

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


  // Has any data been logged for the selected date?
  const hasData = selectedMeals.length > 0 || selectedWorkouts.length > 0 || selectedWater > 0;



  return (
    <div className="flex flex-col min-h-screen pb-28 max-w-md mx-auto" style={{ background: "#121212", color: "#fff" }}>

      {/* ── Header ── */}
      <div className="flex items-center justify-between px-5 pt-6 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-lg" style={{ background: "#cc1111" }}>
            P
          </div>
          <p className="text-base font-semibold">Welcome Back, Player.</p>
        </div>

      </div>

      {/* ── Week Selector ── */}
      <div className="px-5 mb-5">
        <div className="rounded-3xl p-3" style={{ background: "#ffffff" }}>
          <div className="grid grid-cols-7 gap-1 text-center">
            {weekDates.map((d) => {
              const dateStr = formatDate(d);
              const isToday = dateStr === today;
              const isSel = dateStr === selectedDate;
              return (
                <button
                  key={dateStr}
                  onClick={() => setSelectedDate(dateStr)}
                  className="flex flex-col items-center gap-1"
                >
                  {/* day label — purple pill on today */}
                  <span
                    className="text-[11px] font-semibold w-9 py-0.5 rounded-full"
                    style={{
                      color: isToday ? "#7c3aed" : "#9ca3af",
                      background: isToday ? "#ede9fe" : "transparent",
                    }}
                  >
                    {format(d, "EEE")}
                  </span>
                  {/* date number — black fill for today, white ring for other selected */}
                  <span
                    className="w-8 h-8 flex items-center justify-center rounded-full text-xs font-bold transition-all"
                    style={{
                      background: isToday && isSel ? "#121212"
                        : isToday ? "#121212"
                          : isSel ? "#474747"
                            : "transparent",
                      color: (isToday || isSel) ? "#fff" : "#9ca3af",
                    }}
                  >
                    {format(d, "dd")}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="px-5 space-y-4">
        <h2 className="text-2xl font-bold">Dashboard</h2>

        {/* Calories — lavender #DDC0FF */}
        <div className="card-lavender rounded-3xl p-5 flex flex-col items-center">
          <h3 className="self-start text-base font-bold mb-2">Calories</h3>
          <div className="flex justify-center w-full">
            <CalorieRing
              consumed={hasData ? totals.calories : 0}
              goal={profile.dailyCalorieGoal}
              burned={hasData ? caloriesBurned : 0}
              size={230}
              color="#121212"
              burnedColor="rgba(255,255,255,0.92)"
              bgColor="#121212"
              showLabel
              label={hasData ? "Left" : ""}
            />
          </div>
          <div className="flex justify-between w-full px-6 -mt-2">
            <span className="text-xs font-semibold opacity-60">0</span>
            <span className="text-xs font-semibold opacity-60">{profile.dailyCalorieGoal}</span>
          </div>
        </div>

        {/* Macro cards — responsive auto grid, equal size */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 12 }}>
          <MacroCard
            label="Carbs"
            current={hasData ? totals.carbs : 0}
            goal={profile.carbsGoal}
            cardClass="card-green"
            arcColor="#121212"
            arcBg="#45C588"
            noData={!hasData}
          />
          <MacroCard
            label="Protein"
            current={hasData ? totals.protein : 0}
            goal={profile.proteinGoal}
            cardClass="card-orange"
            arcColor="#121212"
            arcBg="#FF6F43"
            noData={!hasData}
          />
          <MacroCard
            label="Fats"
            current={hasData ? totals.fat : 0}
            goal={profile.fatGoal}
            cardClass="card-yellow"
            arcColor="#121212"
            arcBg="#F5F378"
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
        </div>




      </div>
    </div>
  );
};

export default Dashboard;
