"use client";

import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const router = useRouter();

  const logout = async () => {
    await fetch("/api/auth", { method: "DELETE" });
    router.replace("/login");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="max-w-lg mx-auto px-4 py-6">
        <h1 className="text-2xl font-black tracking-tight mb-6">Réglages</h1>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 text-center mb-4">
          <p className="text-4xl mb-3">⚙️</p>
          <p className="text-zinc-400 text-base">Bientôt : édition habitudes, thème, export data.</p>
        </div>

        <button
          onClick={logout}
          className="w-full bg-zinc-900 border border-zinc-800 text-red-400 font-semibold py-3 rounded-2xl min-h-11 active:scale-95 transition-all"
        >
          Se déconnecter
        </button>
      </div>
    </div>
  );
}
