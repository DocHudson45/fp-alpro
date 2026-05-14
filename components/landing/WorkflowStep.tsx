import type { LucideIcon } from "lucide-react";

interface WorkflowStepProps {
  stepNumber: string;
  icon: LucideIcon;
  title: string;
  description: string;
}

export function WorkflowStep({
  stepNumber,
  icon: Icon,
  title,
  description,
}: WorkflowStepProps) {
  return (
    <div className="group relative rounded-2xl border border-white/10 bg-white/[0.02] p-6 hover:border-purple-500/30 hover:bg-white/[0.04] transition-colors duration-300 flex flex-col items-center text-center overflow-hidden">
      <span className="absolute top-3 left-4 text-5xl font-bold text-purple-500/20 select-none pointer-events-none leading-none">
        {stepNumber}
      </span>
      <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-purple-500/10 text-purple-400 mb-4 mt-4">
        <Icon className="w-7 h-7" />
      </div>
      <h3 className="text-lg font-semibold text-neutral-100 mb-2">{title}</h3>
      
      <div className="max-h-0 overflow-hidden transition-all duration-300 group-hover:max-h-[200px] w-full">
        <p className="text-sm text-gray-400 leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100 pt-2">
          {description}
        </p>
      </div>
    </div>
  );
}
