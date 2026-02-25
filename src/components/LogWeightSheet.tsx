import { useState, useEffect } from "react";
import { ChevronLeft, X, Scale } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { getToday } from "@/lib/dateUtils";

interface LogWeightSheetProps {
    onClose: () => void;
}

const LogWeightSheet = ({ onClose }: LogWeightSheetProps) => {
    const { profile, setProfile, setWeights } = useApp();
    const [weightInput, setWeightInput] = useState<string>(String(profile.weight));
    const today = getToday();

    // Close on Escape key
    useEffect(() => {
        const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [onClose]);

    const handleLogWeight = () => {
        const w = Number(weightInput);
        if (w > 0 && !isNaN(w)) {
            setWeights(prev => {
                const existing = prev.find(x => x.date === today);
                if (existing) return prev.map(x => x.date === today ? { ...x, weight: w } : x);
                return [...prev, { date: today, weight: w }];
            });
            setProfile(prev => ({ ...prev, weight: w }));
            onClose();
        }
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 z-[80]"
                style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(2px)", animation: "fadeInBackdrop 0.25s ease" }}
                onClick={onClose}
            />

            {/* Sheet */}
            <div
                className="fixed bottom-0 left-1/2 -translate-x-1/2 z-[90] flex flex-col w-full"
                style={{
                    maxWidth: 448,
                    height: "45vh",
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
                        <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-secondary">
                            <ChevronLeft size={20} color="#fff" />
                        </button>
                        <span className="text-lg font-extrabold text-white">Log Weight</span>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-9 h-9 flex items-center justify-center rounded-full"
                        style={{ background: "#2A2A2A" }}
                    >
                        <X size={18} color="#9ca3af" />
                    </button>
                </div>

                <div className="flex flex-col items-center justify-center px-6 py-6 h-full">
                    <div className="w-16 h-16 rounded-3xl bg-primary/10 flex items-center justify-center mb-6">
                        <Scale size={32} className="text-primary" />
                    </div>

                    <p className="text-sm font-bold text-muted-foreground mb-6">Enter your weight for today</p>

                    <div className="flex items-baseline gap-2 mb-8">
                        <input
                            type="number"
                            autoFocus
                            value={weightInput}
                            onChange={(e) => setWeightInput(e.target.value)}
                            className="bg-transparent text-5xl font-black text-center text-white outline-none w-[140px] border-b-2 border-primary/30 focus:border-primary transition-colors pb-2"
                        />
                        <span className="text-xl font-bold text-muted-foreground uppercase">kg</span>
                    </div>

                    <button
                        onClick={handleLogWeight}
                        disabled={!weightInput || Number(weightInput) <= 0}
                        className="w-full bg-primary text-primary-foreground rounded-2xl py-4 text-sm font-bold active:scale-[0.98] transition-transform shadow-[0_4px_14px_rgba(124,58,237,0.4)] disabled:opacity-50 disabled:shadow-none"
                    >
                        Log Weight
                    </button>
                </div>
            </div>
        </>
    );
};

export default LogWeightSheet;
