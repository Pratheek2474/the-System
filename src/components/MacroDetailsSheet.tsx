import { useEffect } from "react";
import { ChevronLeft, X } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { useApp } from "@/context/AppContext";

interface MacroDetailsSheetProps {
    onClose: () => void;
    totals: { cal: number; pro: number; carb: number; fat: number; fiber: number };
}

const MacroDetailsSheet = ({ onClose, totals }: MacroDetailsSheetProps) => {
    const { profile } = useApp();

    // Close on Escape key
    useEffect(() => {
        const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [onClose]);

    const calsFromPro = totals.pro * 4;
    const calsFromCarb = totals.carb * 4;
    const calsFromFat = totals.fat * 9;
    const totalMacroCals = calsFromPro + calsFromCarb + calsFromFat;

    const pieData = totalMacroCals > 0 ? [
        { name: "Carbs", value: calsFromCarb, color: "#45C588", grams: totals.carb },
        { name: "Protein", value: calsFromPro, color: "#FF6F43", grams: totals.pro },
        { name: "Fat", value: calsFromFat, color: "#F5F378", grams: totals.fat },
    ] : [
        { name: "Empty", value: 1, color: "#2F2F2F", grams: 0 }
    ];

    const fiberGoal = 30; // standard recommendation

    const ProgressBar = ({ label, current, goal, color, unit = "g" }: any) => {
        const pct = Math.min((current / Math.max(goal, 1)) * 100, 100);
        return (
            <div className="mb-4">
                <div className="flex justify-between items-baseline mb-1.5">
                    <span className="text-sm font-bold text-white">{label}</span>
                    <span className="text-xs font-semibold text-muted-foreground">
                        <span className="text-white">{current}</span>{unit} / {goal}{unit}
                    </span>
                </div>
                <div className="w-full h-3 rounded-full bg-[#2F2F2F] overflow-hidden">
                    <div
                        className="h-full rounded-full transition-all duration-700 ease-out"
                        style={{ width: `${pct}%`, background: color }}
                    />
                </div>
            </div>
        );
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 z-[60]"
                style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(2px)", animation: "fadeInBackdrop 0.25s ease" }}
                onClick={onClose}
            />

            {/* Sheet */}
            <div
                className="fixed bottom-0 left-1/2 -translate-x-1/2 z-[70] flex flex-col w-full"
                style={{
                    maxWidth: 448,
                    height: "85vh",
                    background: "#1A1A1A",
                    borderRadius: "28px 28px 0 0",
                    boxShadow: "0 -8px 48px rgba(0,0,0,0.6)",
                    animation: "slideUp 0.32s cubic-bezier(0.32,0.72,0,1)",
                    color: "#fff",
                }}
            >
                {/* ── Header ── */}
                <div className="flex items-center justify-between px-6 pt-5 pb-3">
                    <div className="flex items-center gap-3">
                        <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-full" style={{ background: "#232220" }}>
                            <ChevronLeft size={20} color="#fff" />
                        </button>
                        <span className="text-xl font-bold text-white">Daily Macros</span>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto px-6 pb-12 pt-4">

                    {/* Pie Chart Section */}
                    <div className="rounded-3xl p-6 mb-6 flex flex-col items-center" style={{ background: "#232220" }}>
                        <h3 className="text-sm font-bold text-muted-foreground mb-4 uppercase tracking-wider text-center w-full">Macro Distribution</h3>

                        <div className="w-full h-[220px] relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        dataKey="value"
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={65}
                                        outerRadius={90}
                                        stroke="transparent"
                                        paddingAngle={4}
                                        cornerRadius={5}
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ background: "#1A1A1A", border: "1px solid #2F2F2F", borderRadius: "12px", color: "#fff" }}
                                        itemStyle={{ color: "#fff", fontWeight: "bold" }}
                                        formatter={(val: number, name: string, props: any) => {
                                            if (name === "Empty") return ["No data", ""];
                                            const pct = ((val / totalMacroCals) * 100).toFixed(1);
                                            return [`${val} kcal (${pct}%)`, `${name} (${props.payload.grams}g)`];
                                        }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>

                            {/* Center Text */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <span className="text-xs font-bold text-muted-foreground">Total</span>
                                <span className="text-2xl font-black text-white">{totals.cal}</span>
                                <span className="text-[10px] text-muted-foreground uppercase">kcal</span>
                            </div>
                        </div>

                        {/* Legend */}
                        <div className="flex justify-center gap-6 mt-2 w-full">
                            <div className="flex flex-col items-center gap-1">
                                <div className="w-3 h-3 rounded-full" style={{ background: "#45C588" }} />
                                <span className="text-xs font-bold text-white">Carbs</span>
                                <span className="text-[10px] text-muted-foreground">{totalMacroCals > 0 ? ((calsFromCarb / totalMacroCals) * 100).toFixed(0) : 0}%</span>
                            </div>
                            <div className="flex flex-col items-center gap-1">
                                <div className="w-3 h-3 rounded-full" style={{ background: "#FF6F43" }} />
                                <span className="text-xs font-bold text-white">Protein</span>
                                <span className="text-[10px] text-muted-foreground">{totalMacroCals > 0 ? ((calsFromPro / totalMacroCals) * 100).toFixed(0) : 0}%</span>
                            </div>
                            <div className="flex flex-col items-center gap-1">
                                <div className="w-3 h-3 rounded-full" style={{ background: "#F5F378" }} />
                                <span className="text-xs font-bold text-white">Fat</span>
                                <span className="text-[10px] text-muted-foreground">{totalMacroCals > 0 ? ((calsFromFat / totalMacroCals) * 100).toFixed(0) : 0}%</span>
                            </div>
                        </div>
                    </div>

                    {/* Progress Bars Section */}
                    <div className="rounded-3xl p-6 mb-6" style={{ background: "#232220" }}>
                        <h3 className="text-sm font-bold text-muted-foreground mb-5 uppercase tracking-wider">Targets Progress</h3>

                        <ProgressBar label="Calories" current={totals.cal} goal={profile.dailyCalorieGoal} color="hsl(var(--primary))" unit="kcal" />
                        <ProgressBar label="Protein" current={totals.pro} goal={profile.proteinGoal} color="#FF6F43" />
                        <ProgressBar label="Carbs" current={totals.carb} goal={profile.carbsGoal} color="#45C588" />
                        <ProgressBar label="Fat" current={totals.fat} goal={profile.fatGoal} color="#F5F378" />
                        <ProgressBar label="Fiber" current={totals.fiber} goal={fiberGoal} color="#9ca3af" />
                    </div>

                </div>
            </div>
        </>
    );
};

export default MacroDetailsSheet;
