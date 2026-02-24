import { useEffect } from "react";
import { Droplets, UtensilsCrossed, Dumbbell, Footprints, X } from "lucide-react";

interface QuickLogSheetProps {
    onClose: () => void;
    onLogFood: () => void;
    onLogWater: () => void;
    onLogExercise: () => void;
    onLogSteps: () => void;
}

const ITEMS = [
    {
        id: "water",
        label: "Log Water",
        sub: "Track your hydration",
        icon: Droplets,
        color: "#4FC3F7",
        bg: "rgba(79,195,247,0.15)",
    },
    {
        id: "food",
        label: "Log Food",
        sub: "Add a meal or snack",
        icon: UtensilsCrossed,
        color: "#45C588",
        bg: "rgba(69,197,136,0.15)",
    },
    {
        id: "exercise",
        label: "Log Exercise",
        sub: "Record a workout",
        icon: Dumbbell,
        color: "#FF6F43",
        bg: "rgba(255,111,67,0.15)",
    },
    {
        id: "steps",
        label: "Log Steps",
        sub: "Update your step count",
        icon: Footprints,
        color: "#DDC0FF",
        bg: "rgba(221,192,255,0.15)",
    },
] as const;

const QuickLogSheet = ({
    onClose,
    onLogFood,
    onLogWater,
    onLogExercise,
    onLogSteps,
}: QuickLogSheetProps) => {
    // Close on Escape key
    useEffect(() => {
        const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [onClose]);

    const handlers: Record<typeof ITEMS[number]["id"], () => void> = {
        water: onLogWater,
        food: onLogFood,
        exercise: onLogExercise,
        steps: onLogSteps,
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
                    height: "52vh",
                    background: "#1A1A1A",
                    borderRadius: "28px 28px 0 0",
                    boxShadow: "0 -8px 48px rgba(0,0,0,0.6)",
                    animation: "slideUp 0.32s cubic-bezier(0.32,0.72,0,1)",
                }}
            >
                {/* Handle + header */}
                <div className="flex items-center justify-between px-6 pt-4 pb-3">
                    <div className="flex flex-col">
                        <span className="text-lg font-extrabold text-white">Quick Log</span>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-9 h-9 flex items-center justify-center rounded-full"
                        style={{ background: "#2A2A2A" }}
                    >
                        <X size={18} color="#9ca3af" />
                    </button>
                </div>


                {/* Options */}
                <div className="flex-1 overflow-y-auto px-5 pb-8 space-y-3">
                    {ITEMS.map(({ id, label, sub, icon: Icon, color, bg }) => (
                        <button
                            key={id}
                            onClick={() => { handlers[id](); onClose(); }}
                            className="w-full flex items-center gap-4 p-4 rounded-2xl text-left transition-all active:scale-[0.97]"
                            style={{ background: "#232220" }}
                        >
                            <div
                                className="w-12 h-12 flex items-center justify-center rounded-2xl flex-shrink-0"
                                style={{ background: bg }}
                            >
                                <Icon size={24} color={color} />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-white">{label}</p>
                                <p className="text-xs mt-0.5" style={{ color: "#9ca3af" }}>{sub}</p>
                            </div>
                            <div className="ml-auto w-7 h-7 rounded-full flex items-center justify-center" style={{ background: "#2F2F2F" }}>
                                <span style={{ color: color, fontSize: 18, lineHeight: 1, fontWeight: 700 }}>+</span>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </>
    );
};

export default QuickLogSheet;
