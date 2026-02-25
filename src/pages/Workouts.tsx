import { useEffect, useMemo, useRef, useState } from "react";
import { Plus, Footprints, X } from "lucide-react";
import { format } from "date-fns";
import { useApp } from "@/context/AppContext";
import { exerciseDatabase, exerciseCategories } from "@/data/exercises";
import { getToday, getWeekDates, formatDate, generateId } from "@/lib/dateUtils";

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
  const weekDates = getWeekDates();

  // Workouts for selected date
  const selectedWorkouts = useMemo(
    () => workouts.filter((w) => w.date === selectedDate),
    [workouts, selectedDate]
  );
  const todaySteps = steps.find((s) => s.date === today)?.steps ?? 0;
  const totalBurned = selectedWorkouts.reduce((s, w) => s + w.caloriesBurned, 0);

  // Collect muscles worked on the selected date
  const workedMuscles = useMemo(() => {
    const set = new Set<string>();
    selectedWorkouts.forEach((w) => w.muscleGroups.forEach((mg) => set.add(mg)));
    return set;
  }, [selectedWorkouts]);

  const muscleSvgColors = useMemo(() => buildMuscleColors(workedMuscles), [workedMuscles]);



  return (
    <div className="flex flex-col min-h-screen pb-24 max-w-md mx-auto" style={{ background: "#121212", color: "#fff" }}>

      <div className="sticky top-0 z-50 bg-[#121212] pt-12 pb-1">
        {/* ── Header ── */}
        <div className="px-5 pb-4 flex items-center justify-between">
          <h1 className="text-2xl font-extrabold">Workouts</h1>
        </div>

        {/* ── Week Calendar (same layout as Dashboard) ── */}
        <div className="px-5 mb-4">
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
                    <span
                      className="text-[11px] font-semibold w-9 py-0.5 rounded-full"
                      style={{
                        color: isToday ? "#7c3aed" : "#9ca3af",
                        background: isToday ? "#ede9fe" : "transparent",
                      }}
                    >
                      {format(d, "EEE")}
                    </span>
                    <span
                      className="w-8 h-8 flex items-center justify-center rounded-full text-xs font-bold transition-all"
                      style={{
                        background: isToday ? "#121212" : isSel ? "#474747" : "transparent",
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
      </div>

      <div className="px-5 space-y-4">

        {/* Steps (always shows today) */}
        <div className="rounded-2xl p-4" style={{ background: "#232220" }}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Footprints className="w-5 h-5 text-accent-green" />
              <h3 className="text-base font-bold">Steps</h3>
            </div>
          </div>
          <p className="text-3xl font-extrabold">{todaySteps.toLocaleString()}</p>
          <div className="w-full h-2 bg-border rounded-full mt-2">
            <div
              className="h-full bg-accent-green rounded-full transition-all"
              style={{ width: `${Math.min((todaySteps / profile.dailyStepsGoal) * 100, 100)}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1">Goal: {profile.dailyStepsGoal.toLocaleString()}</p>
        </div>

        {/* Summary for selected date */}
        <div className="grid grid-cols-2 gap-3">
          <div className="card-primary rounded-2xl p-4 text-center">
            <p className="text-2xl font-extrabold">{totalBurned}</p>
            <p className="text-xs font-medium opacity-80">Calories Burned</p>
          </div>
          <div className="card-lavender rounded-2xl p-4 text-center">
            <p className="text-2xl font-extrabold">{selectedWorkouts.length}</p>
            <p className="text-xs font-medium opacity-70">Exercises</p>
          </div>
        </div>

        {/* Muscle Map — coloured by selected date's workouts */}
        <div className="rounded-2xl p-4" style={{ background: "#232220" }}>
          <h3 className="text-base font-bold mb-1">Muscle Activation</h3>
          <p className="text-xs mb-3" style={{ color: "#9ca3af" }}>
            {selectedWorkouts.length === 0
              ? "No workouts logged for this day"
              : <><span style={{ color: "#CE4849" }}>■</span> Muscles trained</>}
          </p>
          <MuscleSvgMap muscleColors={muscleSvgColors} />
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
                    <p className="text-sm font-semibold">{w.name}</p>
                    <p className="text-xs text-muted-foreground">{w.duration} min · {w.caloriesBurned} kcal</p>
                    <div className="flex gap-1 mt-1 flex-wrap">
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
