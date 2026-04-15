export type Habit = {
  key: string;
  label: string;
  emoji: string;
};

export const HABITS: Habit[] = [
  { key: "reveil",        label: "Réveil 6:50",                  emoji: "⏰" },
  { key: "sport",         label: "Sport / Cardio",               emoji: "💪" },
  { key: "visu",          label: "Visu objectifs",               emoji: "🎯" },
  { key: "meditation",    label: "5 min méditation",             emoji: "🧘" },
  { key: "ranger",        label: "Ranger chambre",               emoji: "🧹" },
  { key: "cold_shower",   label: "Douche froide",                emoji: "🚿" },
  { key: "no_dopamine",   label: "0 dopamines avant 12h",        emoji: "🚫" },
  { key: "no_screen",     label: "<1h écran non-prod",           emoji: "📵" },
  { key: "francais",      label: "20 min Français",              emoji: "🇫🇷" },
  { key: "maths",         label: "20 min Maths",                 emoji: "🔢" },
  { key: "anglais",       label: "10 min Anglais",               emoji: "🇬🇧" },
  { key: "lecture",       label: "10 min Lecture",               emoji: "📚" },
  { key: "business",      label: "30 min Business",              emoji: "💼" },
  { key: "pompes",        label: "30 pompes + 30 abdos",         emoji: "🏋️" },
  { key: "inconfort",     label: "Inconfort volontaire",         emoji: "🔥" },
  { key: "skincare",      label: "Skin care",                    emoji: "✨" },
  { key: "lumiere",       label: "Lumière calme -21h + 0 écran", emoji: "🌙" },
  { key: "planifier",     label: "Planifier le lendemain",       emoji: "📋" },
  { key: "bilan",         label: "Bilan journée (papier)",       emoji: "✍️" },
  { key: "lit",           label: "Lit + lumière off 22:10",      emoji: "😴" },
];

export function getHabit(key: string): Habit | undefined {
  return HABITS.find((h) => h.key === key);
}
