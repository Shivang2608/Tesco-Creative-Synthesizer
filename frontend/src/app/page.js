"use client";
import { Layout } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#050B14] text-white font-sans flex flex-col">
      <header className="h-20 px-8 flex items-center border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 text-white font-bold px-3 py-1 rounded text-xs tracking-widest">TCS</div>
          <h1 className="text-sm font-semibold text-slate-200 uppercase">Tesco Creative Synthesizer</h1>
        </div>
      </header>
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center text-slate-500">
          <Layout size={48} className="mx-auto mb-4 opacity-50"/>
          <p>System Initialized.</p>
        </div>
      </div>
    </main>
  );
}