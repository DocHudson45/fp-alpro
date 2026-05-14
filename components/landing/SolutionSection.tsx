import { Compass, BrainCircuit, ImageIcon, LayoutGrid, Code2 } from "lucide-react";
import { PillarCard } from "./PillarCard";

export function SolutionSection() {
  return (
    <section id="solution" className="py-24 md:py-32">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <p className="text-sm font-semibold tracking-widest uppercase text-purple-400 mb-4">
            THE SOLUTION
          </p>
          <h2 className="text-4xl md:text-6xl font-bold tracking-tight text-neutral-100 max-w-5xl mx-auto mb-6">
            Satu Kanvas.{" "}
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Lima Pilar.
            </span>{" "}
            Hasil yang Konsisten.
          </h2>
          <p className="text-lg text-gray-400 max-w-3xl mx-auto leading-relaxed">
            AIUI Mobile mempercepat transformasi brief menjadi desain
            high-definition melalui satu kanvas terpadu. Tidak ada lagi
            bolak-balik antara Figma, Notion, dan chat klien.
          </p>
        </div>

        {/* 5 pillars in one grid — compact cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-start">
          <PillarCard
            icon={Compass}
            title="Project Discovery"
            description="AI generate 5–7 pertanyaan kontekstual berdasarkan brief klien. Form discovery menggali kebutuhan yang biasanya terlewat."
            compact
          />
          <PillarCard
            icon={BrainCircuit}
            title="AI Analysis"
            description="Google Gemini menghasilkan UX Reasoning, Feature Scope, Complexity Estimate, Visual Direction, dan Risk Factor — semua disimpan di model Analysis."
            compact
          />
          <PillarCard
            icon={ImageIcon}
            title="Moodboard Generation"
            description="Visual direction (palette, typography, mood) dirender jadi moodboard image via Gemini Multimodal. Bisa di-iterate lewat ChatPanel real-time."
            compact
          />
          <PillarCard
            icon={LayoutGrid}
            title="Unified Canvas"
            description="Powered by React Flow. Tiga panel: analisis di kiri, kanvas interaktif di tengah, validasi per-image di kanan. Pan, zoom, drag — semua dalam satu layar."
            badge="CORE"
            compact
          />
          <PillarCard
            icon={Code2}
            title="Prompt Architect"
            description="Auto-generate prompt siap-paste untuk Stitch, Framer, v0, Bolt, Lovable, Replit, atau Claude. Konteks analisis ikut di-inject otomatis."
            compact
          />
        </div>
      </div>
    </section>
  );
}
