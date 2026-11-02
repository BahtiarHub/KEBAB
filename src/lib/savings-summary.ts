import { parseReportDate } from "./date";

type SavingsEntry = {
  id: number;
  date: string;
  category: string;
  amount: number;
  direction: "credit" | "debit";
};

export function getSavingsPeriodSummary<T extends SavingsEntry>(
  entries: T[], categories: readonly string[], year: number, monthIndex: number | null
) {
  const start = Date.UTC(year, monthIndex ?? 0, 1);
  const end = monthIndex === null ? Date.UTC(year + 1, 0, 1) : Date.UTC(year, monthIndex + 1, 1);
  const sorted = entries.flatMap((entry) => {
    const date = parseReportDate(entry.date);
    return date ? [{ entry, date: date.getTime() }] : [];
  }).sort((first, second) => first.date - second.date || first.entry.id - second.entry.id);
  const visibleCategories = [...new Set([...categories, ...sorted.map(({ entry }) => entry.category)])];
  const summarize = (category?: string) => {
    const selected = sorted.filter(({ entry }) => category === undefined || entry.category === category);
    const openingBalance = selected.filter(({ date }) => date < start).reduce(
      (sum, { entry }) => sum + (entry.direction === "credit" ? entry.amount : -entry.amount), 0
    );
    let balance = openingBalance;
    let credit = 0;
    let debit = 0;
    const transactions = selected.filter(({ date }) => date >= start && date < end).map(({ entry }) => {
      if (entry.direction === "credit") credit += entry.amount;
      else debit += entry.amount;
      balance += entry.direction === "credit" ? entry.amount : -entry.amount;
      return { ...entry, balance };
    });
    return { openingBalance, credit, debit, balance, transactions };
  };
  return {
    ...summarize(),
    categories: visibleCategories.map((category) => ({ category, ...summarize(category) }))
  };
}
