import { useMemo, useState } from "react";
import { ClipboardList, Trash2, ChevronRight, ChartBar } from "lucide-react";
import WeekCalendar from "@/components/WeekCalendar";
import MacroDetailsSheet from "@/components/MacroDetailsSheet";
import { useApp } from "@/context/AppContext";
import { foodDatabase } from "@/data/foods";
import { getToday } from "@/lib/dateUtils";

const Diary = () => {
    const { meals, setMeals } = useApp();
    const [selectedDate, setSelectedDate] = useState<string>(getToday());
    const [showMacroDetails, setShowMacroDetails] = useState(false);
    const today = getToday();

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
        let cal = 0, pro = 0, carb = 0, fat = 0, fiber = 0;
        selectedMeals.forEach((m) => {
            const food = foodDatabase.find((f) => f.id === m.foodId) || offCache[m.foodId];
            if (food) {
                cal += food.calories * m.servings;
                pro += food.protein * m.servings;
                carb += food.carbs * m.servings;
                fat += food.fat * m.servings;
                fiber += (food.fiber || 0) * m.servings;
            }
        });
        return { cal: Math.round(cal), pro: Math.round(pro), carb: Math.round(carb), fat: Math.round(fat), fiber: Math.round(fiber) };
    }, [selectedMeals, offCache]);

    const deleteEntry = (id: string) => {
        setMeals((prev) => prev.filter((m) => m.id !== id));
    };

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
                    <ClipboardList className="w-6 h-6 text-accent-orange" />
                </div>

                {/* ── Week Selector ── */}
                <WeekCalendar selectedDate={selectedDate} setSelectedDate={setSelectedDate} />
            </div>

            {/* Spacer for fixed header */}
            <div className="h-[170px]" />

            <div className="px-5 space-y-4">
                <h2 className="text-2xl font-bold flex justify-between items-center">
                    Food Diary
                </h2>
                {/* Daily Summary Card with Graph Button */}
                <div className="flex gap-2">
                    <div className="flex-1 rounded-2xl p-4 flex justify-around items-center" style={{ background: "linear-gradient(135deg, #232220 0%, #1a1a1a 100%)", border: "1px solid #2F2F2F" }}>
                        <div className="text-center">
                            <p className="text-xl font-bold text-primary">{totals.cal}</p>
                            <p className="text-[10px] uppercase tracking-wider opacity-60">Kcal</p>
                        </div>
                        <div className="w-[1px] h-8 bg-white/10" />
                        <div className="text-center">
                            <p className="text-base font-bold text-[#FF6F43]">{totals.pro}g</p>
                            <p className="text-[10px] uppercase tracking-wider opacity-60">Prot</p>
                        </div>
                        <div className="text-center">
                            <p className="text-base font-bold text-[#45C588]">{totals.carb}g</p>
                            <p className="text-[10px] uppercase tracking-wider opacity-60">Carb</p>
                        </div>
                        <div className="text-center">
                            <p className="text-base font-bold text-[#F5F378]">{totals.fat}g</p>
                            <p className="text-[10px] uppercase tracking-wider opacity-60">Fat</p>
                        </div>
                    </div>

                    <button
                        onClick={() => setShowMacroDetails(true)}
                        className="w-[64px] flex flex-col items-center justify-center rounded-2xl py-3 hover:bg-white/5 active:scale-[0.97] transition-all"
                        style={{ background: "#232220", border: "1px solid #2F2F2F" }}
                    >
                        <ChartBar />
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">Stats</span>
                    </button>
                </div>

                {/* Meal Sections */}
                {MEAL_ORDER.map((type) => {
                    const items = selectedMeals.filter((m) => m.mealType === type);
                    const mealCals = items.reduce((s, m) => {
                        const food = foodDatabase.find((f) => f.id === m.foodId) || offCache[m.foodId];
                        return s + (food ? food.calories * m.servings : 0);
                    }, 0);

                    return (
                        <div key={type} className="bg-card rounded-2xl overflow-hidden mb-4">
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

            {/* Macro Details Overlay */}
            {showMacroDetails && (
                <MacroDetailsSheet
                    onClose={() => setShowMacroDetails(false)}
                    totals={totals}
                />
            )}
        </div>
    );
};

export default Diary;
