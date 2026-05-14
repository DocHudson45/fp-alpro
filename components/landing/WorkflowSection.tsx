import {
  LogIn,
  FileText,
  Loader2,
  LayoutDashboard,
  Sparkles,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import { WorkflowStep } from "./WorkflowStep";

const steps = [
  {
    stepNumber: "01",
    icon: LogIn,
    title: "User Login",
    description:
      'Auth via Supabase. Project list muncul di `/projects`.',
  },
  {
    stepNumber: "02",
    icon: FileText,
    title: "Isi Form Discovery",
    description:
      "Brief klien, business type, tech stack, complexity — semua tersimpan di model Project.",
  },
  {
    stepNumber: "03",
    icon: Loader2,
    title: "Generating Analysis",
    description:
      "Gemini memproses brief → menghasilkan UX Reasoning, Feature Scope, Visual Direction, dst.",
  },
  {
    stepNumber: "04",
    icon: LayoutDashboard,
    title: "Analysis Result Page",
    description:
      "6 kartu analisis muncul di sidebar kiri Workspace. Builder Prompt siap di-copy.",
  },
  {
    stepNumber: "05",
    icon: Sparkles,
    title: "Generate & Validate",
    description:
      "Generate moodboard via Gemini Multimodal, validasi per-image di sidebar kanan, iterate via ChatPanel.",
  },
];

export function WorkflowSection() {
  return (
    <section id="workflow" className="py-24 md:py-32">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <p className="text-sm font-semibold tracking-widest uppercase text-purple-400 mb-4">
            HOW IT WORKS
          </p>
          <h2 className="text-4xl md:text-6xl font-bold tracking-tight text-neutral-100 max-w-5xl mx-auto mb-6">
            Dari Login Sampai Desain Tervalidasi, dalam{" "}
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              5 Langkah.
            </span>
          </h2>
          <p className="text-lg text-gray-400 max-w-3xl mx-auto leading-relaxed">
            Alur kerja yang sudah dipikirkan supaya tidak ada langkah yang
            membuang waktu.
          </p>
        </div>

        {/* Desktop: horizontal flow with arrows */}
        <div className="hidden lg:flex items-start justify-center gap-2">
          {steps.map((step, i) => (
            <div key={step.stepNumber} className="flex items-start">
              <div className="w-52">
                <WorkflowStep
                  stepNumber={step.stepNumber}
                  icon={step.icon}
                  title={step.title}
                  description={step.description}
                />
              </div>
              {i < steps.length - 1 && (
                <div className="flex items-center pt-16 px-1">
                  <ChevronRight className="w-5 h-5 text-purple-500/40 shrink-0" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Mobile / Tablet: vertical flow with down arrows */}
        <div className="flex lg:hidden flex-col items-center gap-3">
          {steps.map((step, i) => (
            <div key={step.stepNumber} className="w-full max-w-sm flex flex-col items-center">
              <WorkflowStep
                stepNumber={step.stepNumber}
                icon={step.icon}
                title={step.title}
                description={step.description}
              />
              {i < steps.length - 1 && (
                <ChevronDown className="w-5 h-5 text-purple-500/40 my-2" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
