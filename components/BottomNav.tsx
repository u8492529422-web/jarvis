"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export type NavItem = {
  key: string;
  label: string;
  icon: string;
  href: string;
  center?: boolean;
};

export const NAV_ITEMS: NavItem[] = [
  { key: "history",  label: "Historique", icon: "📜", href: "/history" },
  { key: "stats",    label: "Stats",      icon: "📊", href: "/stats" },
  { key: "today",    label: "Today",      icon: "🏠", href: "/", center: true },
  { key: "chat",     label: "Chat",       icon: "💬", href: "/chat" },
  { key: "settings", label: "Réglages",   icon: "⚙️", href: "/settings" },
];

const HIDE_ON = ["/login"];

export default function BottomNav() {
  const pathname = usePathname();

  if (HIDE_ON.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
    return null;
  }

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-40 bg-zinc-950/95 backdrop-blur border-t border-zinc-800"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="max-w-lg mx-auto flex items-end justify-around px-2 pt-2 pb-1">
        {NAV_ITEMS.map((item) => {
          const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          if (item.center) {
            return (
              <li key={item.key} className="flex-1 flex justify-center -mt-5">
                <Link
                  href={item.href}
                  className={`w-16 h-16 rounded-full flex flex-col items-center justify-center shadow-lg transition-transform active:scale-95 ${
                    active
                      ? "bg-orange-500 text-white"
                      : "bg-zinc-800 text-zinc-300"
                  }`}
                >
                  <span className="text-2xl leading-none">{item.icon}</span>
                  <span className="text-[10px] font-semibold mt-0.5">{item.label}</span>
                </Link>
              </li>
            );
          }
          return (
            <li key={item.key} className="flex-1">
              <Link
                href={item.href}
                className={`flex flex-col items-center justify-center py-1.5 transition-colors ${
                  active ? "text-orange-400" : "text-zinc-500"
                }`}
              >
                <span className="text-xl leading-none">{item.icon}</span>
                <span className="text-[10px] font-medium mt-0.5">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
