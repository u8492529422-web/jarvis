const TZ = "Europe/Paris";

/** Retourne "YYYY-MM-DD" pour aujourd'hui en heure de Paris */
export function todayStr(): string {
  return new Intl.DateTimeFormat("sv-SE", { timeZone: TZ }).format(new Date());
}

/** Formatte un objet Date en "YYYY-MM-DD" selon le fuseau Paris */
export function dateStr(date: Date): string {
  return new Intl.DateTimeFormat("sv-SE", { timeZone: TZ }).format(date);
}

/** Retourne "YYYY-MM-DD" pour hier en heure de Paris */
export function yesterday(): string {
  return nDaysAgo(1);
}

/** Retourne "YYYY-MM-DD" pour il y a n jours en heure de Paris */
export function nDaysAgo(n: number): string {
  const [y, m, d] = todayStr().split("-").map(Number);
  const date = new Date(y, m - 1, d - n);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
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
