import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, ListChecks, XCircle } from "lucide-react";

interface FeatureScopeProps {
  features: {
    mustHave: string[];
    niceToHave: string[];
    notRecommended: string[];
  };
}

export function FeatureScopeTable({ features }: FeatureScopeProps) {
  return (
    <Card className="border-white/[0.06] bg-[#141414] overflow-hidden">
      <CardHeader className="bg-[#111111] border-b border-white/[0.04] pb-3">
        <CardTitle className="text-sm font-bold text-neutral-200 flex items-center gap-2">
          <ListChecks className="h-4 w-4 text-blue-400" />
          Fitur
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-white/[0.04]">
          <div className="p-4">
            <h4 className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <CheckCircle2 className="h-3 w-3" /> Must Have
            </h4>
            <ul className="space-y-1.5">
              {features.mustHave.map((item, i) => (
                <li key={i} className="text-xs text-neutral-400 flex items-start gap-1.5">
                  <span className="text-emerald-500 mt-0.5">•</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          
          <div className="p-4">
            <h4 className="text-[10px] font-semibold text-blue-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <CheckCircle2 className="h-3 w-3" /> Nice to Have
            </h4>
            <ul className="space-y-1.5">
              {features.niceToHave.map((item, i) => (
                <li key={i} className="text-xs text-neutral-400 flex items-start gap-1.5">
                  <span className="text-blue-500 mt-0.5">•</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="p-4">
            <h4 className="text-[10px] font-semibold text-rose-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <XCircle className="h-3 w-3" /> Not Recommended
            </h4>
            <ul className="space-y-1.5">
              {features.notRecommended.map((item, i) => (
                <li key={i} className="text-xs text-neutral-400 flex items-start gap-1.5">
                  <span className="text-rose-500 mt-0.5">•</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
