import { Eye, Palette, Sparkles } from "lucide-react";
import { PillarCard } from "./PillarCard";

export function ProblemSection() {
  return (
    <section id="problem" className="py-24 md:py-32">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <p className="text-sm font-semibold tracking-widest uppercase text-purple-400 mb-4">
            THE GAP
          </p>
          <h2 className="text-4xl md:text-6xl font-bold tracking-tight text-neutral-100 max-w-5xl mx-auto mb-6">
            Brief Klien Jadi Desain Valid.{" "}
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Selalu Lebih Lama dari yang Kamu Kira
            </span>
          </h2>
          <p className="text-lg text-gray-400 max-w-3xl mx-auto leading-relaxed">
            Proses mengubah client brief menjadi desain yang valid sering kali
            memakan waktu lama dan terjadi miskomunikasi antara desainer dan
            developer. Tiga akar masalah yang berulang:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          <PillarCard
            icon={Eye}
            title="Visualisasi Teknis yang Kabur"
            description="Kebutuhan teknis dan estetika klien sering tidak jelas di tahap brief. Desainer baru sadar masalah setelah revisi ketiga — saat budget dan waktu sudah tergerus."
            iconContainerClassName="bg-red-500/10 text-red-400"
          />
          <PillarCard
            icon={Palette}
            title="Moodboard Manual yang Meleset"
            description="Mengumpulkan referensi visual satu per satu tanpa kerangka analisis sering menghasilkan moodboard yang tidak selaras dengan target audiens. Hasilnya: revisi besar di tahap visual direction."
            iconContainerClassName="bg-amber-500/10 text-amber-400"
          />
          <PillarCard
            icon={Sparkles}
            title="Prompt AI Builder yang Generik"
            description="Membuat prompt akurat untuk v0, Lovable, atau Bolt butuh skill terpisah. Tanpa konteks analisis, hasil generate AI builder sering generik dan tidak match brief."
            iconContainerClassName="bg-blue-500/10 text-blue-400"
          />
        </div>
      </div>
    </section>
  );
}
