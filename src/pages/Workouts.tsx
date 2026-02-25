import { useEffect, useMemo, useRef, useState } from "react";
import { Plus, Footprints, X } from "lucide-react";
import { format } from "date-fns";
import { useApp } from "@/context/AppContext";
import WeekCalendar from "@/components/WeekCalendar";
import { exerciseDatabase, exerciseCategories } from "@/data/exercises";
import { getToday, generateId } from "@/lib/dateUtils";

// ── MuscleSvgMap ──────────────────────────────────────────────────────────────
const MuscleSvgMap = ({ muscleColors }: { muscleColors: Record<string, string> }) => {
  const [svgContent, setSvgContent] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/musclebody.svg").then((r) => r.text()).then(setSvgContent).catch(console.error);
  }, []);

  // Re-colour SVG paths by id every time muscleColors updates
  useEffect(() => {
    if (!containerRef.current || !svgContent) return;
    const svg = containerRef.current.querySelector("svg");
    if (!svg) return;
    Object.entries(muscleColors).forEach(([id, color]) => {
      svg.querySelectorAll(`[id="${id}"]`).forEach((el) => {
        (el as SVGElement).style.fill = color;
      });
    });
  }, [svgContent, muscleColors]);

  const injected = useMemo(() => {
    if (!svgContent) return "";
    return svgContent
      .replace(/width="\d+(\.\d+)?"/, 'width="100%"')
      .replace(/height="\d+(\.\d+)?"/, 'height="100%"');
  }, [svgContent]);

  return (
    <div
      ref={containerRef}
      className="w-44 mx-auto"
      style={{ aspectRatio: "587 / 1137" }}
      dangerouslySetInnerHTML={{ __html: injected }}
    />
  );
};

// ── Helpers ───────────────────────────────────────────────────────────────────
const ALIASES: Record<string, string> = {
  triceps: "tricep", tricep: "tricep",
  biceps: "bicep", bicep: "bicep",
  chest: "chest",
  shoulder: "shoulder", shoulders: "shoulder",
};
const SVG_IDS = ["shoulder", "chest", "tricep", "bicep"];

function buildMuscleColors(workedSet: Set<string>): Record<string, string> {
  const result: Record<string, string> = {};
  SVG_IDS.forEach((id) => {
    const active = [...workedSet].some(
      (mg) => (ALIASES[mg.toLowerCase()] ?? mg.toLowerCase()) === id
    );
    result[id] = active ? "#CE4849" : "#BDBDBD";
  });
  return result;
}

// ── Workouts Page ─────────────────────────────────────────────────────────────
const Workouts = () => {
  const { workouts, setWorkouts, steps, setSteps, profile } = useApp();
  const [selectedDate, setSelectedDate] = useState(getToday());
  const today = getToday();

  // Workouts for selected date
  const selectedWorkouts = useMemo(
    () => workouts.filter((w) => w.date === selectedDate),
    [workouts, selectedDate]
  );
  const todaySteps = steps.find((s) => s.date === today)?.steps ?? 0;
  const totalDuration = selectedWorkouts.reduce((s, w) => s + w.duration, 0);
  const totalBurned = selectedWorkouts.reduce((s, w) => s + w.caloriesBurned, 0);

  // Collect muscles worked on the selected date
  const workedMuscles = useMemo(() => {
    const set = new Set<string>();
    selectedWorkouts.forEach((w) => w.muscleGroups.forEach((mg) => set.add(mg)));
    return set;
  }, [selectedWorkouts]);

  const muscleSvgColors = useMemo(() => buildMuscleColors(workedMuscles), [workedMuscles]);



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

      {/* Spacer for fixed header */}
      <div className="h-[170px]" />

      <div className="px-5 space-y-4">
        <h2 className="text-2xl font-bold">Workouts</h2>

        {/* Muscle Map — coloured by selected date's workouts */}
        <div className="card-lavender rounded-2xl p-4 mb-4">
          <h3 className="text-base font-bold mb-1">Targeted Muscle</h3>

          <MuscleSvgMap muscleColors={muscleSvgColors} />
        </div>

        {/* Steps and Exercise Cards Grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* Steps Card */}
          <div className="card-lavender rounded-3xl p-4 flex flex-col justify-between" style={{ minHeight: 170 }}>
            <div>
              <p className="text-sm font-bold mb-1">Steps</p>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-foreground">{todaySteps.toLocaleString()}</span>
              </div>
              <p className="text-xs font-bold text-muted-foreground mb-2">/ {profile.dailyStepsGoal.toLocaleString()}</p>

              {/* Progress Bar */}
              <div className="w-full h-2 bg-muted/60 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-500"
                  style={{ width: `${Math.min((todaySteps / profile.dailyStepsGoal) * 100, 100)}%` }}
                />
              </div>
            </div>

            <div className="mt-auto">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">
                {todaySteps >= profile.dailyStepsGoal ? "Goal Hit!" : "Keep going"}
              </p>
            </div>
          </div>

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
                <span className="text-2xl font-black text-foreground">{totalBurned}</span>
                <span className="text-xs font-bold text-muted-foreground">kcal</span>
              </div>
            </div>
          </div>
        </div>

        {/* Workouts list for selected date */}
        {selectedWorkouts.length > 0 && (
          <div>
            <h3 className="text-base font-bold mb-2">
              {selectedDate === today
                ? "Today's Exercises"
                : `${format(new Date(selectedDate + "T00:00:00"), "MMM d")} Exercises`}
            </h3>
            <div className="space-y-2">
              {selectedWorkouts.map((w) => (
                <div key={w.id} className="rounded-xl p-3 flex items-center justify-between" style={{ background: "#232220" }}>
                  <div>
                    <div className="flex items-baseline gap-2">
                      <p className="text-sm font-semibold">{w.name}</p>
                      {w.sets && w.reps && <p className="text-xs text-muted-foreground">{w.sets} sets × {w.reps} reps</p>}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{w.duration} min · <span className="text-primary font-bold">{w.caloriesBurned} kcal</span></p>
                    <div className="flex gap-1 mt-1.5 flex-wrap">
                      {w.muscleGroups.map((mg) => (
                        <span key={mg} className="text-[9px] bg-secondary px-1.5 py-0.5 rounded capitalize">{mg}</span>
                      ))}
                    </div>
                  </div>
                  {selectedDate === today && (
                    <button
                      onClick={() => setWorkouts((prev) => prev.filter((x) => x.id !== w.id))}
                      className="text-muted-foreground hover:text-danger"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Workouts;
