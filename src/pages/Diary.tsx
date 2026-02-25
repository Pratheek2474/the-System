import { useMemo, useState } from "react";
import { format } from "date-fns";
import { ClipboardList, Trash2, ChevronRight } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { foodDatabase } from "@/data/foods";
import { getToday, getWeekDates, formatDate } from "@/lib/dateUtils";

const Diary = () => {
    const { meals, setMeals } = useApp();
    const [selectedDate, setSelectedDate] = useState<string>(getToday());
    const today = getToday();
    const weekDates = getWeekDates();

    const selectedMeals = useMemo(() => meals.filter((m) => m.date === selectedDate), [meals, selectedDate]);

    const offCache: Record<string, any> = useMemo(() => {
        try {
            return JSON.parse(localStorage.getItem("caltrack-searched-foods") || "{}");
        } catch {
            return {};
        }
    }, []);

    const MEAL_ORDER = ["breakfast", "lunch", "snack", "dinner"] as const;

    const totals = useMemo(() => {
        let cal = 0, pro = 0, carb = 0, fat = 0;
        selectedMeals.forEach((m) => {
            const food = foodDatabase.find((f) => f.id === m.foodId) || offCache[m.foodId];
            if (food) {
                cal += food.calories * m.servings;
                pro += food.protein * m.servings;
                carb += food.carbs * m.servings;
                fat += food.fat * m.servings;
            }
        });
        return { cal: Math.round(cal), pro: Math.round(pro), carb: Math.round(carb), fat: Math.round(fat) };
    }, [selectedMeals, offCache]);

    const deleteEntry = (id: string) => {
        setMeals((prev) => prev.filter((m) => m.id !== id));
    };

    return (
        <div className="flex flex-col min-h-screen pb-24 max-w-md mx-auto bg-background text-foreground">
            <div className="sticky top-0 z-50 bg-background pt-12 pb-1">
                {/* ── Header ── */}
                <div className="px-5 pb-4 flex items-center justify-between">
                    <h1 className="text-2xl font-extrabold">Food Diary</h1>
                    <ClipboardList className="w-6 h-6 text-accent-orange" />
                </div>

                {/* ── Week Calendar ── */}
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
                                                background: isToday ? "hsl(var(--primary))" : isSel ? "hsl(var(--muted))" : "transparent",
                                                color: (isToday || isSel) ? "hsl(var(--primary-foreground))" : "hsl(var(--muted-foreground))",
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
                {/* Daily Summary Card */}
                <div className="rounded-2xl p-4 flex justify-around items-center" style={{ background: "linear-gradient(135deg, #232220 0%, #1a1a1a 100%)", border: "1px solid #2F2F2F" }}>
                    <div className="text-center">
                        <p className="text-xl font-bold text-accent-orange">{totals.cal}</p>
                        <p className="text-[10px] uppercase tracking-wider opacity-60">Kcal</p>
                    </div>
                    <div className="w-[1px] h-8 bg-white/10" />
                    <div className="text-center">
                        <p className="text-base font-bold text-accent-green">{totals.pro}g</p>
                        <p className="text-[10px] uppercase tracking-wider opacity-60">Prot</p>
                    </div>
                    <div className="text-center">
                        <p className="text-base font-bold text-accent-yellow">{totals.carb}g</p>
                        <p className="text-[10px] uppercase tracking-wider opacity-60">Carb</p>
                    </div>
                    <div className="text-center">
                        <p className="text-base font-bold text-accent-lavender">{totals.fat}g</p>
                        <p className="text-[10px] uppercase tracking-wider opacity-60">Fat</p>
                    </div>
                </div>

                {/* Meal Sections */}
                {MEAL_ORDER.map((type) => {
                    const items = selectedMeals.filter((m) => m.mealType === type);
                    const mealCals = items.reduce((s, m) => {
                        const food = foodDatabase.find((f) => f.id === m.foodId) || offCache[m.foodId];
                        return s + (food ? food.calories * m.servings : 0);
                    }, 0);

                    return (
                        <div key={type} className="rounded-2xl overflow-hidden" style={{ background: "#232220" }}>
                            <div className="flex items-center gap-2 px-4 py-3" style={{ borderBottom: "1px solid #1a1a1a" }}>
                                <span className="text-sm font-bold capitalize">{type}</span>
                                <span className="ml-auto text-xs font-semibold" style={{ color: "#9ca3af" }}>{Math.round(mealCals)} kcal</span>
                            </div>

                            {items.length > 0 ? (
                                <div className="divide-y divide-white/5">
                                    {items.map((m) => {
                                        const food = foodDatabase.find((f) => f.id === m.foodId) || offCache[m.foodId];
                                        if (!food) return null;
                                        return (
                                            <div key={m.id} className="group flex items-center px-4 py-3 gap-3 hover:bg-white/5 transition-colors">
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-semibold truncate">{food.name}</p>
                                                    <p className="text-xs opacity-50">{m.servings} × {food.serving}</p>
                                                </div>
                                                <div className="text-right flex items-center gap-3">
                                                    <div className="flex flex-col items-end">
                                                        <span className="text-sm font-bold">{Math.round(food.calories * m.servings)}</span>
                                                        <span className="text-[10px] opacity-40">kcal</span>
                                                    </div>
                                                    <button
                                                        onClick={() => deleteEntry(m.id)}
                                                        className="p-2 -mr-2 text-white/20 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="px-4 py-4 text-center">
                                    <p className="text-[11px] opacity-30 italic">No items logged</p>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Diary;
