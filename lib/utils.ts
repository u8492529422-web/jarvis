export function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

export function dateStr(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function yesterday(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return dateStr(d);
}

export function nDaysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return dateStr(d);
}

export function formatDateFR(dateStr: string): string {
  const [year, month, day] = dateStr.split("-");
  const d = new Date(Number(year), Number(month) - 1, Number(day));
  return d.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}
