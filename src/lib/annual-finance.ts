import { parseReportDate } from "./date";

export const financeMonthNames = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
] as const;

type FinanceTransaction = {
  date: string;
  type: string;
  total: number;
  details: Array<{ item: string; qty: number; price: number }>;
};
type FinanceParameter = { key: string; type: "cost" | "income"; amount: number };
type FinanceParameterValue = { parameterKey: string; month: string; amount: number };
type FinanceTotals = { omset: number; salary: number; grossIncome: number; costs: number };

export function getAnnualFinanceYears(reports: FinanceTransaction[], values: FinanceParameterValue[], currentYear: number) {
  const years = new Set([currentYear]);
  for (const report of reports) {
    const parsed = parseReportDate(report.date);
    if (parsed) years.add(parsed.getUTCFullYear());
  }
  for (const value of values) {
    const match = value.month.match(/ (\d{4})$/);
    if (match) years.add(Number(match[1]));
  }
  return [...years].sort((first, second) => second - first);
}

export function getAnnualFinance(reports: FinanceTransaction[], parameters: FinanceParameter[], values: FinanceParameterValue[], year: number) {
  const dated = reports.flatMap((report) => {
    const date = parseReportDate(report.date);
    return date && date.getUTCFullYear() === year ? [{ report, month: date.getUTCMonth() }] : [];
  });
  const rows = financeMonthNames.map((month, monthIndex) => {
    const period = `${month} ${year}`;
    const transactions = dated.filter((row) => row.month === monthIndex).map((row) => row.report);
    const saved = values.filter((value) => value.month === period);
    const hasActivity = transactions.length > 0 || saved.length > 0;
    const sales = transactions.filter((row) => row.type === "Penjualan" || row.type === "Kupat Tahu Penjualan");
    const detailTotal = (report: FinanceTransaction, name: string) => report.details
      .filter((detail) => detail.item === name).reduce((sum, detail) => sum + detail.qty * detail.price, 0);
    const omset = sales.reduce((sum, report) => sum + report.total, 0);
    const modal = sales.reduce((sum, report) => sum + detailTotal(report, report.type === "Penjualan" ? "Modal Penjualan" : "Modal Kupat Tahu"), 0);
    const salary = sales.reduce((sum, report) => sum + detailTotal(report, report.type === "Penjualan" ? "Gaji Karyawan" : "Gaji Kupat Tahu"), 0);
    const salesOtherCosts = sales.reduce((sum, report) => sum + detailTotal(report, report.type === "Penjualan" ? "Lain lain" : "Lain lain Kupat Tahu"), 0);
    const transactionCosts = transactions.filter((report) => report.type === "Biaya Lain Lain").reduce((sum, report) => sum + report.total, 0);
    // Match monthly balance-sheet defaults only for periods with recorded activity.
    const parameterCosts = hasActivity ? parameters.filter((parameter) => parameter.type === "cost").reduce(
      (sum, parameter) => sum + (saved.find((value) => value.parameterKey === parameter.key)?.amount ?? parameter.amount), 0
    ) : 0;
    return { month, monthIndex, omset, salary, grossIncome: omset - modal,
      costs: parameterCosts + transactionCosts + salesOtherCosts, hasActivity };
  });
  const totals = rows.reduce<FinanceTotals>((sum, row) => ({ omset: sum.omset + row.omset,
    salary: sum.salary + row.salary, grossIncome: sum.grossIncome + row.grossIncome, costs: sum.costs + row.costs
  }), { omset: 0, salary: 0, grossIncome: 0, costs: 0 });
  return { rows, totals };
}
