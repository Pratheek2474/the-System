import { format, startOfWeek, addDays } from "date-fns";

export function getToday(): string {
  return format(new Date(), "yyyy-MM-dd");
}

export function getWeekDates(date: Date = new Date()): Date[] {
  const start = startOfWeek(date, { weekStartsOn: 1 });
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

export function formatDate(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}
