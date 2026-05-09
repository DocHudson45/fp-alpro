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
    <Card className="border-slate-200 shadow-sm overflow-hidden col-span-1 lg:col-span-2">
      <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
        <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <ListChecks className="h-5 w-5 text-slate-600" />
          Ruang Lingkup Fitur
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-100">
          <div className="p-6">
            <h4 className="text-sm font-semibold text-emerald-600 uppercase tracking-wider mb-4 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" /> Must Have
            </h4>
            <ul className="space-y-3">
              {features.mustHave.map((item, i) => (
                <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
                  <span className="text-emerald-500 mt-0.5">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="p-6">
            <h4 className="text-sm font-semibold text-blue-600 uppercase tracking-wider mb-4 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" /> Nice to Have
            </h4>
            <ul className="space-y-3">
              {features.niceToHave.map((item, i) => (
                <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
                  <span className="text-blue-500 mt-0.5">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-6">
            <h4 className="text-sm font-semibold text-rose-600 uppercase tracking-wider mb-4 flex items-center gap-2">
              <XCircle className="h-4 w-4" /> Not Recommended
            </h4>
            <ul className="space-y-3">
              {features.notRecommended.map((item, i) => (
                <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
                  <span className="text-rose-500 mt-0.5">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
