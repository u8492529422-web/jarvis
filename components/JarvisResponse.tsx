"use client";

type Props = {
  response: string;
  score: number;
};

export default function JarvisResponse({ response, score }: Props) {
  return (
    <div className="bg-zinc-900 border border-orange-500/30 rounded-2xl p-5 mb-6">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl">🤖</span>
        <span className="text-sm font-bold text-orange-400">JARVIS</span>
        <span className={`ml-auto text-2xl font-black ${
          score >= 16 ? "text-green-400" :
          score >= 10 ? "text-orange-400" : "text-red-400"
        }`}>
          {score}/20
        </span>
      </div>
      <p className="text-zinc-200 text-base leading-relaxed whitespace-pre-wrap">{response}</p>
    </div>
  );
}
