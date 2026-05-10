import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Gauge } from "lucide-react";

interface ComplexityProps {
  complexity: string;
  reason: string;
  estimate: {
    min: number;
    max: number;
    breakdown: {
      design: string;
      frontend: string;
      backend: string | null;
      revision: string;
    };
  };
}

export function ComplexityCard({ complexity, reason, estimate }: ComplexityProps) {
  const getComplexityColor = (comp: string) => {
    if (comp.toLowerCase().includes("simple")) return "bg-emerald-500/10 text-emerald-400";
    if (comp.toLowerCase().includes("medium")) return "bg-blue-500/10 text-blue-400";
    if (comp.toLowerCase().includes("advanced")) return "bg-amber-500/10 text-amber-400";
    return "bg-rose-500/10 text-rose-400";
  };

  return (
    <Card className="border-white/[0.06] bg-[#141414] overflow-hidden">
      <CardHeader className="bg-[#111111] border-b border-white/[0.04] pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-sm font-bold text-neutral-200 flex items-center gap-2">
            <Gauge className="h-4 w-4 text-neutral-400" />
            Kompleksitas
          </CardTitle>
          <Badge className={`shadow-none font-medium border-0 text-[10px] ${getComplexityColor(complexity)}`}>
            {complexity}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-4 pb-4 space-y-4">
        <p className="text-xs text-neutral-500 leading-relaxed">{reason}</p>
        <div className="bg-[#1a1a1a] p-3 rounded-lg border border-white/[0.04] text-center">
          <span className="text-lg font-bold text-neutral-200">
            {estimate.min} – {estimate.max}
          </span>
          <span className="text-xs text-neutral-500 ml-1">jam</span>
        </div>
        <div className="space-y-2">
          {[
            { label: "Desain UI/UX", value: estimate.breakdown.design },
            { label: "Frontend", value: estimate.breakdown.frontend },
            ...(estimate.breakdown.backend ? [{ label: "Backend", value: estimate.breakdown.backend }] : []),
            { label: "Revisi", value: estimate.breakdown.revision },
          ].map((item, i) => (
            <div key={i} className="flex justify-between items-center text-xs">
              <span className="text-neutral-500">{item.label}</span>
              <span className="text-neutral-300 font-medium">{item.value}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
