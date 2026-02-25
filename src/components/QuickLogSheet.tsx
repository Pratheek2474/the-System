import { useEffect, useState } from "react";
import { Droplets, UtensilsCrossed, Dumbbell, Footprints, Scale, X, ChevronLeft } from "lucide-react";
import { format } from "date-fns";
import { useApp } from "@/context/AppContext";
import { exerciseDatabase } from "@/data/exercises";
import { getToday, generateId } from "@/lib/dateUtils";

interface QuickLogSheetProps {
    onClose: () => void;
    onLogWater: (amount?: number) => void;
    onLogFood: () => void;
    onLogExercise: () => void;
    onLogSteps: () => void;
    onLogWeight?: () => void;
}

const ITEMS = [
    {
        id: "water",
        label: "Log Water",
        sub: "Track your hydration",
        icon: Droplets,
        color: "hsl(var(--primary))",
        bg: "hsl(var(--primary) / 0.15)",
    },
    {
        id: "food",
        label: "Log Food",
        sub: "Add a meal or snack",
        icon: UtensilsCrossed,
        color: "hsl(var(--primary))",
        bg: "hsl(var(--primary) / 0.15)",
    },
    {
        id: "exercise",
        label: "Log Exercise",
        sub: "Record a workout",
        icon: Dumbbell,
        color: "hsl(var(--primary))",
        bg: "hsl(var(--primary) / 0.15)",
    },
    {
        id: "steps",
        label: "Log Steps",
        sub: "Update your step count",
        icon: Footprints,
        color: "hsl(var(--primary))",
        bg: "hsl(var(--primary) / 0.15)",
    },
    {
        id: "weight",
        label: "Log Weight",
        sub: "Track your body weight",
        icon: Scale,
        color: "hsl(var(--primary))",
        bg: "hsl(var(--primary) / 0.15)",
    },
] as const;

type ViewState = "main" | "water" | "exercise";

const QuickLogSheet = ({
    onClose,
    onLogFood,
    onLogSteps,
    onLogWeight
}: QuickLogSheetProps) => {
    const { workouts, setWorkouts, water, setWater, profile } = useApp();
    const [view, setView] = useState<ViewState>("main");

    // Exercise state
    const [selectedExercise, setSelectedExercise] = useState(exerciseDatabase[0].id);
    const [duration, setDuration] = useState(30);
    const [sets, setSets] = useState(3);
    const [reps, setReps] = useState(10);

    // Water state
    const [waterAmount, setWaterAmount] = useState<number | "">("");

    const today = getToday();
    // Close on Escape key
    useEffect(() => {
        const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [onClose]);

    const handleLogExercise = () => {
        const ex = exerciseDatabase.find(e => e.id === selectedExercise);
        if (!ex) return;

        const burned = Math.round(ex.caloriesPerMinute * duration * (profile.weight / 70));

        setWorkouts(prev => [
            ...prev,
            {
                id: generateId(),
                name: ex.name,
                muscleGroups: ex.muscleGroups,
                caloriesBurned: burned,
                duration,
                sets,
                reps,
                date: today
            }
        ]);
        onClose();
    };

    const handleLogWater = (amount: number) => {
        setWater(prev => {
            const existing = prev.find(w => w.date === today);
            if (existing) {
                return prev.map(w => w.date === today ? { ...w, ml: w.ml + amount } : w);
            }
            return [...prev, { date: today, ml: amount }];
        });
        onClose();
    };

    const handleWaterSubmit = () => {
        if (typeof waterAmount === "number" && waterAmount > 0) {
            handleLogWater(waterAmount);
            onClose();
        }
    };

    const handlers: Record<typeof ITEMS[number]["id"], () => void> = {
        water: () => setView("water"),
        food: () => { onLogFood(); onClose(); },
        exercise: () => setView("exercise"),
        steps: () => { onLogSteps(); onClose(); },
        weight: () => { if (onLogWeight) onLogWeight(); onClose(); }
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 z-[70]"
                style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(2px)", animation: "fadeInBackdrop 0.25s ease" }}
                onClick={onClose}
            />

            {/* Sheet — constrained to dashboard width */}
            <div
                className="fixed bottom-0 left-1/2 -translate-x-1/2 z-[80] flex flex-col w-full"
                style={{
                    maxWidth: 448,
                    height: view === "main" ? "auto" : "45vh",
                    background: "#1A1A1A",
                    borderRadius: "28px 28px 0 0",
                    boxShadow: "0 -8px 48px rgba(0,0,0,0.6)",
                    animation: "slideUp 0.32s cubic-bezier(0.32,0.72,0,1)",
                }}
            >
                {/* Handle + header */}
                <div className="flex items-center justify-between px-6 pt-4 pb-3">
                    <div className="flex items-center gap-3">
                        {view !== "main" && (
                            <button onClick={() => setView("main")} className="w-8 h-8 flex items-center justify-center rounded-full bg-secondary">
                                <ChevronLeft size={20} color="#fff" />
                            </button>
                        )}
                        <span className="text-lg font-extrabold text-white">
                            {view === "main" ? "Quick Log" : view === "water" ? "Log Water" : "Log Exercise"}
                        </span>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-9 h-9 flex items-center justify-center rounded-full"
                        style={{ background: "#2A2A2A" }}
                    >
                        <X size={18} color="#9ca3af" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto px-5 pb-8">
                    {view === "main" && (
                        <div className="grid grid-cols-3 gap-3 mt-2">
                            {ITEMS.map(({ id, label, icon: Icon, color, bg }) => (
                                <button
                                    key={id}
                                    onClick={() => handlers[id]()}
                                    className="aspect-square flex flex-col items-center justify-center p-3 rounded-2xl text-center transition-all active:scale-[0.97]"
                                    style={{ background: "#232220" }}
                                >
                                    <div
                                        className="w-10 h-10 flex items-center justify-center rounded-full mb-2"
                                        style={{ background: bg }}
                                    >
                                        <Icon size={20} color={color} />
                                    </div>
                                    <p className="text-[11px] font-bold text-white leading-tight w-full truncate px-1">{label}</p>
                                </button>
                            ))}
                        </div>
                    )}

                    {view === "exercise" && (
                        <div className="space-y-4 pt-2">
                            <div>
                                <label className="text-xs font-bold text-muted-foreground mb-1.5 block">Select Exercise</label>
                                <select
                                    className="w-full bg-[#232220] rounded-xl px-4 py-3 text-sm text-foreground outline-none border-none focus:ring-1 focus:ring-primary transition-all"
                                    value={selectedExercise}
                                    onChange={(e) => setSelectedExercise(e.target.value)}
                                >
                                    {exerciseDatabase.map(ex => (
                                        <option key={ex.id} value={ex.id}>{ex.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                                <div>
                                    <label className="text-xs font-bold text-muted-foreground mb-1.5 block">Duration (min)</label>
                                    <input type="number" value={duration} onChange={(e) => setDuration(Number(e.target.value))} className="w-full bg-[#232220] rounded-xl px-4 py-3 text-sm text-center outline-none focus:ring-1 focus:ring-primary transition-all" />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-muted-foreground mb-1.5 block">Sets</label>
                                    <input type="number" value={sets} onChange={(e) => setSets(Number(e.target.value))} className="w-full bg-[#232220] rounded-xl px-4 py-3 text-sm text-center outline-none focus:ring-1 focus:ring-primary transition-all" />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-muted-foreground mb-1.5 block">Reps</label>
                                    <input type="number" value={reps} onChange={(e) => setReps(Number(e.target.value))} className="w-full bg-[#232220] rounded-xl px-4 py-3 text-sm text-center outline-none focus:ring-1 focus:ring-primary transition-all" />
                                </div>
                            </div>

                            <button onClick={handleLogExercise} className="w-full mt-4 bg-primary text-primary-foreground rounded-xl py-3 text-sm font-bold active:scale-[0.98] transition-transform shadow-[0_4px_14px_rgba(124,58,237,0.4)]">
                                Log Exercise
                            </button>
                        </div>
                    )}

                    {view === "water" && (
                        <div className="flex flex-col items-center justify-center py-4">
                            <div className="w-24 h-24 rounded-full bg-blue-500/10 flex items-center justify-center mb-6">
                                <Droplets size={48} className="text-blue-400" />
                            </div>

                            <div className="w-full grid grid-cols-3 gap-3 mb-6">
                                <button onClick={() => handleLogWater(250)} className="bg-[#232220] hover:bg-[#2A2A2A] rounded-2xl py-3 flex flex-col items-center justify-center transition-colors">
                                    <span className="text-lg font-bold text-blue-400">+250</span>
                                    <span className="text-xs text-muted-foreground">ml</span>
                                </button>
                                <button onClick={() => handleLogWater(500)} className="bg-[#232220] hover:bg-[#2A2A2A] rounded-2xl py-3 flex flex-col items-center justify-center transition-colors">
                                    <span className="text-lg font-bold text-blue-400">+500</span>
                                    <span className="text-xs text-muted-foreground">ml</span>
                                </button>
                                <button onClick={() => handleLogWater(1000)} className="bg-[#232220] hover:bg-[#2A2A2A] rounded-2xl py-3 flex flex-col items-center justify-center transition-colors">
                                    <span className="text-lg font-bold text-blue-400">+1000</span>
                                    <span className="text-xs text-muted-foreground">ml</span>
                                </button>
                            </div>

                            <div className="w-full border-t border-white/5 my-2 pt-6">
                                <label className="text-xs font-bold text-muted-foreground mb-2 block text-center">Or enter custom amount (ml)</label>
                                <div className="flex gap-2">
                                    <input
                                        type="number"
                                        value={waterAmount}
                                        onChange={(e) => setWaterAmount(e.target.value ? Number(e.target.value) : "")}
                                        placeholder="0"
                                        className="flex-1 bg-[#232220] rounded-xl px-4 py-3 text-center text-lg font-bold outline-none"
                                    />
                                    <button
                                        onClick={handleWaterSubmit}
                                        disabled={!waterAmount || waterAmount <= 0}
                                        className=" bg-primary px-6 rounded-xl font-bold disabled:opacity-50 transition-opacity"
                                    >
                                        Log
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default QuickLogSheet;
