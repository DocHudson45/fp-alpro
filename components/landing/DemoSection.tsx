import { Badge } from "@/components/ui/badge";

const techBadges = [
  "Next.js 14 (App Router)",
  "TypeScript",
  "Tailwind CSS",
  "shadcn/ui",
  "Prisma",
  "Supabase (PostgreSQL + Auth)",
  "Google Gemini Multimodal",
  "@xyflow/react (React Flow)",
  "Vercel (Deploy)",
];

const challenges = [
  {
    challenge: "Canvas free-form yang ringan tanpa Pro license.",
    solution:
      "React Flow free tier dengan custom nodes untuk image cards. Pan & zoom natively didukung.",
  },
  {
    challenge:
      "Konsistensi prompt antara analysis, moodboard, dan builder export.",
    solution:
      "Modular prompt files di `lib/prompts/` dengan shared context object yang di-inject ke setiap call Gemini.",
  },
  {
    challenge: "Feedback validasi per-image tanpa overwhelm UI.",
    solution:
      "Sidebar kanan reactive terhadap selected node di React Flow. Selected node = tampilkan validation, no node selected = empty state.",
  },
];

export function DemoSection() {
  return (
    <section id="demo" className="py-24 md:py-32">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <p className="text-sm font-semibold tracking-widest uppercase text-purple-400 mb-4">
            LIVE DEMO
          </p>
          <h2 className="text-4xl md:text-6xl font-bold tracking-tight text-neutral-100 max-w-5xl mx-auto mb-6">
            Studi Kasus: Dari{" "}
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Brief Café Aesthetic
            </span>{" "}
            Sampai Moodboard Tervalidasi.
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Left Column — Text Content */}
          <div className="space-y-10">
            {/* Sub-block 1: Brief */}
            <div>
              <p className="text-sm font-semibold tracking-widest uppercase text-purple-400 mb-3">
                Brief
              </p>
              <div className="border-l-4 border-purple-500 pl-4">
                <blockquote className="text-base text-gray-300 italic leading-relaxed">
                  &ldquo;Saya butuh aplikasi mobile pesan waffle dari kantin
                  kampus ITS. Budget terbatas, target mahasiswa, harus simple
                  tapi clean. Tech stack bebas, tapi prefer yang gampang
                  maintenance.&rdquo;
                </blockquote>
                <p className="text-sm text-gray-500 mt-2">
                  — Contoh brief klien
                </p>
              </div>
            </div>

            {/* Sub-block 2: Tech Stack */}
            <div>
              <p className="text-sm font-semibold tracking-widest uppercase text-purple-400 mb-3">
                Tech Stack
              </p>
              <div className="flex flex-wrap gap-2">
                {techBadges.map((tech) => (
                  <Badge
                    key={tech}
                    variant="outline"
                    className="border-white/10 text-gray-300 bg-white/[0.02] hover:bg-white/[0.06] transition-colors"
                  >
                    {tech}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Sub-block 3: Challenges & Solution */}
            <div>
              <p className="text-sm font-semibold tracking-widest uppercase text-purple-400 mb-3">
                Challenges &amp; Solution
              </p>
              <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 space-y-5">
                {challenges.map((item, i) => (
                  <div key={i} className={i > 0 ? "border-t border-white/[0.06] pt-5" : ""}>
                    <p className="text-base text-gray-300 leading-relaxed">
                      <span className="font-semibold text-red-400">
                        Challenge:
                      </span>{" "}
                      {item.challenge}
                    </p>
                    <p className="text-base text-gray-300 leading-relaxed mt-1">
                      <span className="font-semibold text-emerald-400">
                        Solution:
                      </span>{" "}
                      {item.solution}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column — Workspace Mockup (Pure CSS) */}
          <div className="lg:sticky lg:top-24">
            <div className="bg-gradient-to-br from-purple-900/20 via-black to-black border border-white/10 rounded-2xl aspect-[4/3] overflow-hidden p-4">
              <div className="flex h-full gap-3">
                {/* Left sidebar skeleton — enriched */}
                <div className="w-1/4 rounded-xl bg-white/[0.03] border border-white/[0.06] p-3 flex flex-col gap-2">
                  {/* Section header */}
                  <div className="h-3 w-3/4 rounded bg-purple-500/20" />
                  <div className="h-2 w-full rounded bg-white/[0.06]" />
                  <div className="h-2 w-5/6 rounded bg-white/[0.06]" />
                  <div className="h-2 w-2/3 rounded bg-white/[0.06]" />
                  <div className="h-2 w-4/5 rounded bg-white/[0.06]" />
                  {/* Section header 2 */}
                  <div className="mt-2 h-3 w-2/3 rounded bg-purple-500/20" />
                  <div className="h-2 w-full rounded bg-white/[0.06]" />
                  <div className="h-2 w-3/4 rounded bg-white/[0.06]" />
                  <div className="h-2 w-5/6 rounded bg-white/[0.06]" />
                  {/* Section header 3 */}
                  <div className="mt-2 h-3 w-1/2 rounded bg-purple-500/15" />
                  <div className="h-2 w-full rounded bg-white/[0.06]" />
                  <div className="h-2 w-2/3 rounded bg-white/[0.06]" />
                  <div className="h-2 w-4/5 rounded bg-white/[0.06]" />
                  <div className="h-2 w-3/5 rounded bg-white/[0.06]" />
                  <div className="flex-1" />
                  {/* Builder prompt button */}
                  <div className="h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                    <div className="h-2 w-3/5 rounded bg-purple-400/30" />
                  </div>
                </div>

                {/* Center canvas — enriched */}
                <div className="flex-1 rounded-xl bg-white/[0.02] border border-white/[0.06] p-3 flex flex-col gap-3">
                  {/* Dot grid background */}
                  <div className="flex-1 rounded-lg stitch-canvas relative overflow-hidden">
                    {/* Floating image placeholders — more cards, varied sizes */}
                    <div className="absolute top-3 left-3 w-[30%] h-[28%] rounded-lg bg-gradient-to-br from-purple-500/15 to-blue-500/15 border border-white/10">
                      <div className="absolute bottom-1 left-2 h-1.5 w-3/4 rounded bg-white/[0.08]" />
                    </div>
                    <div className="absolute top-4 left-[38%] w-[26%] h-[22%] rounded-lg bg-gradient-to-br from-fuchsia-500/15 to-purple-500/15 border border-white/10">
                      <div className="absolute bottom-1 left-2 h-1.5 w-1/2 rounded bg-white/[0.08]" />
                    </div>
                    <div className="absolute top-2 right-3 w-[22%] h-[32%] rounded-lg bg-gradient-to-br from-indigo-500/15 to-violet-500/15 border border-white/10">
                      <div className="absolute bottom-1 left-2 h-1.5 w-2/3 rounded bg-white/[0.08]" />
                    </div>
                    <div className="absolute top-[40%] left-[10%] w-[28%] h-[24%] rounded-lg bg-gradient-to-br from-violet-500/15 to-indigo-500/15 border border-purple-500/20">
                      <div className="absolute bottom-1 left-2 h-1.5 w-1/2 rounded bg-white/[0.08]" />
                    </div>
                    <div className="absolute top-[38%] right-[8%] w-[24%] h-[30%] rounded-lg bg-gradient-to-br from-pink-500/12 to-purple-500/12 border border-white/10">
                      <div className="absolute bottom-1 left-2 h-1.5 w-3/5 rounded bg-white/[0.08]" />
                    </div>
                    <div className="absolute bottom-4 left-[20%] w-[32%] h-[20%] rounded-lg bg-gradient-to-br from-blue-500/12 to-cyan-500/12 border border-white/10">
                      <div className="absolute bottom-1 left-2 h-1.5 w-2/3 rounded bg-white/[0.08]" />
                    </div>
                    <div className="absolute bottom-3 right-[12%] w-[20%] h-[18%] rounded-lg bg-gradient-to-br from-purple-500/10 to-fuchsia-500/10 border border-white/[0.08]" />
                  </div>
                  {/* Chat input bar */}
                  <div className="h-8 rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-center px-3 gap-2">
                    <div className="w-4 h-4 rounded bg-purple-500/20 shrink-0" />
                    <div className="h-2 w-2/5 rounded bg-white/[0.08]" />
                    <div className="flex-1" />
                    <div className="w-6 h-4 rounded bg-purple-500/15 shrink-0" />
                  </div>
                </div>

                {/* Right sidebar skeleton — enriched */}
                <div className="w-1/4 rounded-xl bg-white/[0.03] border border-white/[0.06] p-3 flex flex-col gap-2">
                  {/* Section label */}
                  <div className="h-3 w-2/3 rounded bg-purple-500/20" />
                  {/* Image preview */}
                  <div className="aspect-square rounded-lg bg-gradient-to-br from-purple-500/10 to-transparent border border-white/[0.06]" />
                  {/* Alignment score badge */}
                  <div className="flex items-center gap-1.5 mt-1">
                    <div className="h-5 w-12 rounded-full bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center">
                      <div className="h-1.5 w-6 rounded bg-emerald-400/40" />
                    </div>
                    <div className="h-2 w-1/2 rounded bg-white/[0.06]" />
                  </div>
                  {/* Paragraph skeletons */}
                  <div className="mt-1 h-2 w-full rounded bg-white/[0.06]" />
                  <div className="h-2 w-5/6 rounded bg-white/[0.06]" />
                  <div className="h-2 w-4/5 rounded bg-white/[0.06]" />
                  <div className="h-2 w-3/4 rounded bg-white/[0.06]" />
                  <div className="mt-1 h-2 w-full rounded bg-white/[0.06]" />
                  <div className="h-2 w-2/3 rounded bg-white/[0.06]" />
                  <div className="h-2 w-5/6 rounded bg-white/[0.06]" />
                  <div className="flex-1" />
                  {/* Action button */}
                  <div className="h-6 rounded bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                    <div className="h-1.5 w-2/3 rounded bg-emerald-400/30" />
                  </div>
                </div>
              </div>
            </div>
            <p className="text-center text-sm text-gray-500 mt-4">
              Tampilan 3-panel Workspace — analisis, canvas, dan validasi
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
