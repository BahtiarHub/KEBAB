export function formatDateForReport(inputDate?: string) {
  const date = inputDate ? new Date(`${inputDate}T00:00:00`) : new Date();

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(date);
}
