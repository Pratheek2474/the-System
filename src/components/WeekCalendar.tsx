import { format } from "date-fns";
import { CircleCheck } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { getToday, getWeekDates, formatDate } from "@/lib/dateUtils";

interface WeekCalendarProps {
    selectedDate: string;
    setSelectedDate: (date: string) => void;
}

const WeekCalendar = ({ selectedDate, setSelectedDate }: WeekCalendarProps) => {
    const { meals, workouts } = useApp();
    const today = getToday();
    const weekDates = getWeekDates();

    return (
        <div className="px-5 mb-4">
            <div className="flex items-center justify-between mb-3 px-1">
                <h3 className="text-lg font-bold text-white">{format(new Date(selectedDate), "MMMM d, yyyy")}</h3>
            </div>
            <div className="rounded-3xl p-3" style={{ background: "#ffffff" }}>
                <div className="grid grid-cols-7 gap-1 text-center">
                    {weekDates.map((d) => {
                        const dateStr = formatDate(d);
                        const isToday = dateStr === today;
                        const isSel = dateStr === selectedDate;
                        const hasFood = meals.some(m => m.date === dateStr);
                        const hasExercise = workouts && workouts.some(ex => ex.date === dateStr);

                        return (
                            <button
                                key={dateStr}
                                onClick={() => setSelectedDate(dateStr)}
                                className="flex flex-col items-center gap-1"
                            >
                                {/* day label — * on today */}
                                <div className="relative flex flex-col items-center gap-1">
                                    <span
                                        className="text-[12px] font-bold transition-colors"
                                        style={{
                                            color: isSel ? "#121212" : "#9ca3af",
                                        }}
                                    >
                                        {format(d, "EEE")}
                                    </span>

                                    {/* date indicators (circle check) */}
                                    <div className="w-8 h-8 flex items-center justify-center cursor-pointer mt-1">
                                        {(hasFood && hasExercise) ? (
                                            <div className="transition-all hover:scale-110">
                                                {/* Violet for both */}
                                                <CircleCheck size={30} fill="#7c3aed" color="#ffffff" strokeWidth={1.5} />
                                            </div>
                                        ) : hasExercise ? (
                                            <div className="transition-all hover:scale-110">
                                                {/* Orange for exercise only */}
                                                <CircleCheck size={30} fill="#f97316" color="#ffffff" strokeWidth={1.5} />
                                            </div>
                                        ) : hasFood ? (
                                            <div className="transition-all hover:scale-110">
                                                {/* Green for food only */}
                                                {/* Green for food only */}
                                                <CircleCheck size={30} fill="#45C588" color="#ffffff" strokeWidth={1.5} />
                                            </div>
                                        ) : (
                                            <div className="w-[25px] h-[25px] rounded-full transition-all hover:scale-105" style={{ border: "2px solid #e5e7eb", background: isSel ? "#f9fafb" : "transparent" }} />
                                        )}
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default WeekCalendar;
