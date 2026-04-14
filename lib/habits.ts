export type Habit = {
  key: string;
  label: string;
  emoji: string;
};

export const HABITS: Habit[] = [
  { key: "sport", label: "Sport / Entraînement", emoji: "💪" },
  { key: "nutrition", label: "Nutrition propre", emoji: "🥗" },
  { key: "hydration", label: "2L d'eau minimum", emoji: "💧" },
  { key: "sleep_early", label: "Couché avant minuit", emoji: "😴" },
  { key: "wake_early", label: "Levé avant 7h", emoji: "⏰" },
  { key: "reading", label: "Lecture (20 min)", emoji: "📚" },
  { key: "meditation", label: "Méditation / Respiration", emoji: "🧘" },
  { key: "no_social", label: "Pas de réseaux sociaux inutiles", emoji: "📵" },
  { key: "cold_shower", label: "Douche froide", emoji: "🚿" },
  { key: "journaling", label: "Journal / Réflexion", emoji: "✍️" },
  { key: "no_alcool", label: "Zéro alcool", emoji: "🚫" },
  { key: "walk", label: "Marche / Mouvement quotidien", emoji: "🚶" },
  { key: "work_focus", label: "Bloc de travail profond (2h+)", emoji: "🎯" },
  { key: "learning", label: "Apprentissage / Formation", emoji: "🧠" },
  { key: "no_procra", label: "Zéro procrastination sur priorité #1", emoji: "⚡" },
  { key: "gratitude", label: "3 gratitudes du jour", emoji: "🙏" },
  { key: "social_off", label: "Temps de qualité (famille/amis)", emoji: "❤️" },
  { key: "clean_space", label: "Espace de travail rangé", emoji: "🧹" },
  { key: "no_sugar", label: "Zéro sucre ajouté", emoji: "🍬" },
  { key: "review", label: "Revue du jour (soir)", emoji: "📋" },
];

export function getHabit(key: string): Habit | undefined {
  return HABITS.find((h) => h.key === key);
}
