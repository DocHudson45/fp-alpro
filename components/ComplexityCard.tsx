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
    if (comp.toLowerCase().includes("simple")) return "bg-emerald-100 text-emerald-800";
    if (comp.toLowerCase().includes("medium")) return "bg-blue-100 text-blue-800";
    if (comp.toLowerCase().includes("advanced")) return "bg-amber-100 text-amber-800";
    return "bg-rose-100 text-rose-800";
  };

  return (
    <Card className="border-slate-200 shadow-sm overflow-hidden">
      <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Gauge className="h-5 w-5 text-slate-600" />
            Kompleksitas & Estimasi
          </CardTitle>
          <Badge className={`shadow-none font-medium ${getComplexityColor(complexity)}`}>
            {complexity}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        <div>
          <p className="text-sm text-slate-600 mb-4">{reason}</p>
          <div className="bg-slate-100/50 p-4 rounded-xl border border-slate-100 flex items-center justify-center">
            <span className="text-2xl font-bold text-slate-900">
              {estimate.min} - {estimate.max} Jam
            </span>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Breakdown Waktu</h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-600 font-medium">Desain UI/UX</span>
              <span className="text-slate-900">{estimate.breakdown.design}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-600 font-medium">Frontend</span>
              <span className="text-slate-900">{estimate.breakdown.frontend}</span>
            </div>
            {estimate.breakdown.backend && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-600 font-medium">Backend / CMS</span>
                <span className="text-slate-900">{estimate.breakdown.backend}</span>
              </div>
            )}
            <div className="flex justify-between items-center text-sm pt-2 border-t border-slate-100">
              <span className="text-slate-600 font-medium">Revisi & Finalisasi</span>
              <span className="text-slate-900">{estimate.breakdown.revision}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
