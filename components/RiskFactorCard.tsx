import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle } from "lucide-react";

interface RiskFactorProps {
  risks: Array<{
    risk: string;
    severity: "low" | "medium" | "high";
  }>;
}

export function RiskFactorCard({ risks }: RiskFactorProps) {
  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "low":
        return "bg-emerald-100 text-emerald-800";
      case "medium":
        return "bg-amber-100 text-amber-800";
      case "high":
        return "bg-rose-100 text-rose-800";
      default:
        return "bg-slate-100 text-slate-800";
    }
  };

  return (
    <Card className="border-slate-200 shadow-sm overflow-hidden">
      <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
        <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-slate-600" />
          Faktor Risiko
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        {risks.length === 0 ? (
          <p className="text-sm text-slate-500 italic text-center py-4">Tidak ada risiko signifikan yang terdeteksi.</p>
        ) : (
          <ul className="space-y-4">
            {risks.map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <Badge className={`mt-0.5 shrink-0 shadow-none uppercase text-[10px] ${getSeverityColor(item.severity)}`}>
                  {item.severity}
                </Badge>
                <span className="text-sm text-slate-700 leading-relaxed">{item.risk}</span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
