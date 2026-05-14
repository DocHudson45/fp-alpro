import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function FinalCtaSection() {
  return (
    <section className="py-24 md:py-32 bg-gradient-to-b from-purple-950/20 to-black">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <h2 className="text-4xl md:text-6xl font-bold tracking-tight text-neutral-100 mb-6">
          Siap Mengubah Cara Kamu{" "}
          <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-blue-400 bg-clip-text text-transparent">
            Mendesain?
          </span>
        </h2>
        <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          Mulai project pertama kamu. AIUI Mobile gratis selama MVP.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            asChild
            size="lg"
            className="rounded-xl px-10 h-14 bg-violet-600 hover:bg-violet-700 text-white shadow-xl shadow-violet-900/20 text-base font-semibold"
          >
            <Link href="/projects/new">
              Mulai Project Baru <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="rounded-xl px-10 h-14 border-white/[0.08] bg-white/[0.02] text-neutral-300 hover:bg-white/[0.06] text-base font-semibold"
          >
            <Link href="/projects">Lihat Project Sebelumnya</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
