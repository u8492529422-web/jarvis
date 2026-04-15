# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commandes

```bash
npm run dev          # Serveur de développement (localhost:3000)
npm run build        # Build production
npm run lint         # ESLint

npm run db:push      # Pousser le schéma vers Turso (sans migration)
npm run db:generate  # Générer les fichiers de migration Drizzle
npm run db:migrate   # Exécuter les migrations
```

## Variables d'environnement requises

Créer un fichier `.env.local` :
```
ANTHROPIC_API_KEY=sk-ant-...
TURSO_DATABASE_URL=libsql://your-db.turso.io
TURSO_AUTH_TOKEN=your-token
```

Pour créer une DB Turso : `turso db create jarvis` puis `turso db tokens create jarvis`

## Architecture

App Next.js 14 (App Router), Tailwind CSS, Drizzle ORM + Turso (SQLite cloud), Anthropic API.

**Base de données** (`lib/schema.ts`) :
- `habit_logs` — coches quotidiennes des 20 habitudes (habitKey, date, completed)
- `checkins` — check-ins matinaux (date unique, score auto, missedText, goals JSON, jarvisResponse)
- `chat_messages` — messages par session (sessionDate = YYYY-MM-DD)
- `memory` — mémoire Jarvis (type: `medium` | `long`, content text) — une seule ligne par type (upsert sur le type)

**Logique IA** (`lib/jarvis.ts`) :
- `JARVIS_SYSTEM_PROMPT` — personnalité Jarvis (coach brutal David Goggins style, français uniquement)
- `buildContext()` — injecte la mémoire long terme + bilan 7 jours dans le system prompt
- Le modèle utilisé est `claude-haiku-4-5-20251001` (coût ~1-3€/mois)

**Habitudes** (`lib/habits.ts`) : 20 habitudes fixes (constante `HABITS`), modifiables directement dans ce fichier.

**Utilitaires** (`lib/utils.ts`) : helpers de date — `todayStr()`, `yesterday()`, `nDaysAgo(n)`, `formatDateFR()`. Toutes les dates sont au format `YYYY-MM-DD`.

**DB client** (`lib/db.ts`) : instance Drizzle connectée à Turso via `TURSO_DATABASE_URL` + `TURSO_AUTH_TOKEN`.

**Pages** :
- `/` — Today : check-in matinal (si pas encore fait) + liste des 20 habitudes avec streaks
- `/chat` — Chat libre avec Jarvis en streaming SSE
- `/history` — Historique des check-ins (Server Component)

**API routes** :
- `GET/POST /api/habits` — logs des habitudes + calcul des streaks
- `GET/POST /api/checkin` — check-in quotidien (score auto = habitudes J-1 / 20)
- `POST /api/chat` — streaming SSE vers Anthropic, `GET` pour récupérer l'historique du jour
- `GET/POST /api/memory` — lire/générer la mémoire Jarvis à la demande

**Mémoire Jarvis** (déclenchée manuellement via boutons dans `/chat`) :
- `medium` : bilan des 7 derniers check-ins généré par Jarvis
- `long` : profil de Romain basé sur 30 jours de données (habitudes + check-ins)

**PWA** : `next-pwa` configuré dans `next.config.ts`, désactivé en dev. Manifest dans `public/manifest.json`. Icônes à placer en `public/icon-192.png` et `public/icon-512.png`.
