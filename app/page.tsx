import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Layout, Zap, Smartphone } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

import { ProblemSection } from "@/components/landing/ProblemSection";
import { SolutionSection } from "@/components/landing/SolutionSection";
import { WorkflowSection } from "@/components/landing/WorkflowSection";
import { FinalCtaSection } from "@/components/landing/FinalCtaSection";
import { LandingFooter } from "@/components/landing/LandingFooter";

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="flex flex-col min-h-[calc(100vh-3.5rem)] bg-[#0a0a0a]">
      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-start px-4 pt-12 pb-24 text-center md:pt-16 md:pb-32 relative overflow-hidden">
        {/* Glowing Background Effect */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-600/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="relative z-10 w-full mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-1 text-xs font-medium text-violet-400 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <Sparkles className="h-3 w-3" />
            <span>AI-Powered Mobile UI/UX Workspace</span>
          </div>

          <h1 className="text-5xl font-extrabold tracking-tight lg:text-7xl text-neutral-100 max-w-4xl mx-auto mb-8 leading-[1.1]">
            Transform Brief into <br />
            <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-blue-400 bg-clip-text text-transparent">
              High-Definition Designs
            </span>
          </h1>
          
          <p className="text-lg text-neutral-500 max-w-2xl mb-12 leading-relaxed mx-auto">
            AIUI - Mobile adalah workspace cerdas untuk desainer dan developer. Analisis kebutuhan user, generate moodboard, dan validasi desain mobile app kamu dalam satu canvas.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto justify-center mb-20">
            <Button asChild size="lg" className="rounded-xl px-10 h-14 bg-violet-600 hover:bg-violet-700 text-white shadow-xl shadow-violet-900/20 text-base font-semibold">
              <Link href={user ? "/projects" : "/login"}>
                Mulai Sekarang <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="rounded-xl px-10 h-14 border-white/[0.08] bg-white/[0.02] text-neutral-300 hover:bg-white/[0.06] text-base font-semibold">
              <Link href="/projects">Dashboard Project</Link>
            </Button>
          </div>

          {/* Demo Image Section */}
          <div className="max-w-6xl mx-auto px-4 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
            <div className="relative group">
              {/* Outer Glow */}
              <div className="absolute -inset-1 bg-gradient-to-r from-violet-500/20 to-blue-500/20 rounded-[2rem] blur-2xl opacity-50 group-hover:opacity-75 transition duration-1000" />
              
              <div className="relative rounded-[2rem] border border-white/[0.1] bg-[#111111] overflow-hidden shadow-2xl">
                <img 
                  src="/image.png" 
                  alt="AIUI Mobile Workspace Demo" 
                  className="w-full h-auto object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-500"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* New Landing Page Sections */}
      <ProblemSection />
      <SolutionSection />
      <WorkflowSection />

      <FinalCtaSection />
      <LandingFooter />

      {/* Version Label */}
      <div className="fixed bottom-4 left-4 text-xs font-mono text-neutral-600 z-50 pointer-events-none">
        v0.1.0
      </div>
    </div>
  );
}