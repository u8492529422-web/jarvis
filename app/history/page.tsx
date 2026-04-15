import { db } from "@/lib/db";
import { checkins } from "@/lib/schema";
import { desc } from "drizzle-orm";
import HistoryView from "@/components/HistoryView";

export const dynamic = "force-dynamic";

export default async function HistoryPage() {
  const allCheckins = await db.select().from(checkins).orderBy(desc(checkins.date));
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <HistoryView checkins={allCheckins} />
    </div>
  );
}
