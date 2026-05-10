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
        return "bg-emerald-500/10 text-emerald-400";
      case "medium":
        return "bg-amber-500/10 text-amber-400";
      case "high":
        return "bg-rose-500/10 text-rose-400";
      default:
        return "bg-neutral-800 text-neutral-400";
    }
  };

  return (
    <Card className="border-white/[0.06] bg-[#141414] overflow-hidden">
      <CardHeader className="bg-[#111111] border-b border-white/[0.04] pb-3">
        <CardTitle className="text-sm font-bold text-neutral-200 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-400" />
          Risiko
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4 pb-4">
        {risks.length === 0 ? (
          <p className="text-xs text-neutral-600 italic text-center py-3">Tidak ada risiko signifikan.</p>
        ) : (
          <ul className="space-y-2">
            {risks.map((item, i) => (
              <li key={i} className="flex items-start gap-2">
                <Badge className={`mt-0.5 shrink-0 shadow-none border-0 uppercase text-[9px] ${getSeverityColor(item.severity)}`}>
                  {item.severity}
                </Badge>
                <span className="text-xs text-neutral-400 leading-relaxed">{item.risk}</span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
