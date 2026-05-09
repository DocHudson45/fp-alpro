import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Lightbulb, FileSearch, CheckCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return (
    <div className="flex flex-col min-h-[calc(100vh-3.5rem)] bg-white">
      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center px-4 py-24 text-center md:py-32 bg-gradient-to-b from-blue-50 to-white">
        <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-blue-100 text-blue-800 mb-6">
          Kini Lebih Pintar dengan AI
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-6xl text-slate-900 max-w-3xl mb-6">
          Ubah brief klien yang vague jadi panduan website yang jelas.
        </h1>
        <p className="text-xl text-slate-600 max-w-2xl mb-10 leading-relaxed">
          ClientFit AI membantu freelancer web developer menganalisis permintaan klien, menggali kebutuhan tersembunyi, dan memberikan estimasi yang akurat dalam hitungan menit.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Button asChild size="lg" className="rounded-full px-8 shadow-sm">
            <Link href={user ? "/projects/new" : "/login"}>
              Mulai Project Baru <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="rounded-full px-8 bg-white hover:bg-slate-50">
            <Link href="/projects">Lihat Project Sebelumnya</Link>
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 py-24 bg-white">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-3xl font-bold text-center mb-16 text-slate-900">Cara Kerja ClientFit AI</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-slate-50 border border-slate-100 shadow-sm transition-all hover:shadow-md">
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mb-6">
                <FileSearch className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-slate-900">1. Analisis Permintaan</h3>
              <p className="text-slate-600 leading-relaxed">
                Masukkan brief awal klien yang singkat. AI akan mengidentifikasi celah dan membuat pertanyaan discovery yang tajam.
              </p>
            </div>
            
            <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-slate-50 border border-slate-100 shadow-sm transition-all hover:shadow-md">
              <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center mb-6">
                <Lightbulb className="h-6 w-6 text-amber-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-slate-900">2. Discovery Terarah</h3>
              <p className="text-slate-600 leading-relaxed">
                Jawab pertanyaan yang dihasilkan AI bersama klienmu untuk mendapatkan gambaran project yang jauh lebih solid.
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-slate-50 border border-slate-100 shadow-sm transition-all hover:shadow-md">
              <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center mb-6">
                <CheckCircle className="h-6 w-6 text-emerald-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-slate-900">3. Hasil Komprehensif</h3>
              <p className="text-slate-600 leading-relaxed">
                Dapatkan panduan arah desain, UX reasoning, fitur, serta estimasi effort yang siap diajukan ke klien.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
