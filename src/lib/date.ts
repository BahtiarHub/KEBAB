export function formatDateForReport(inputDate?: string) {
  const date = inputDate ? new Date(`${inputDate}T00:00:00`) : new Date();

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(date);
}

const reportMonthIndexes: Record<string, number> = {
  agu: 7,
  apr: 3,
  des: 11,
  feb: 1,
  jan: 0,
  jul: 6,
  jun: 5,
  mar: 2,
  mei: 4,
  nov: 10,
  okt: 9,
  sep: 8
};

export function parseReportDate(inputDate: string) {
  const isoDate = inputDate.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoDate) {
    return new Date(Date.UTC(Number(isoDate[1]), Number(isoDate[2]) - 1, Number(isoDate[3])));
  }

  const [day, month, year] = inputDate.trim().split(/\s+/);
  const monthIndex = reportMonthIndexes[month?.toLowerCase()];
  if (!day || monthIndex === undefined || !year) {
    return null;
  }

  const parsedDate = new Date(Date.UTC(Number(year), monthIndex, Number(day)));
  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
}
