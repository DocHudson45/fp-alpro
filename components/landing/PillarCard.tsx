import type { LucideIcon } from "lucide-react";

interface PillarCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  iconContainerClassName?: string;
  badge?: string;
  compact?: boolean;
}

export function PillarCard({
  icon: Icon,
  title,
  description,
  iconContainerClassName = "bg-purple-500/10 text-purple-400",
  badge,
  compact = false,
}: PillarCardProps) {
  return (
    <div
      className={`group relative rounded-2xl border border-white/10 bg-white/[0.02] hover:border-purple-500/30 hover:bg-white/[0.04] transition-colors duration-300 overflow-hidden ${
        compact ? "p-6" : "p-8"
      }`}
    >
      {badge && (
        <span className="absolute top-4 right-4 text-xs px-2 py-1 rounded-full bg-purple-500/20 text-purple-300 font-semibold">
          {badge}
        </span>
      )}
      <div
        className={`inline-flex items-center justify-center rounded-lg mb-5 ${iconContainerClassName} ${
          compact ? "w-10 h-10" : "w-12 h-12"
        }`}
      >
        <Icon className={compact ? "w-[28px] h-[28px]" : "w-6 h-6"} />
      </div>
      <h3
        className={`font-semibold text-neutral-100 mb-3 ${
          compact ? "text-lg" : "text-xl"
        }`}
      >
        {title}
      </h3>
      
      <div className="max-h-0 overflow-hidden transition-all duration-300 group-hover:max-h-[300px]">
        <p className="text-base text-gray-400 leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100 pt-2">
          {description}
        </p>
      </div>
    </div>
  );
}
