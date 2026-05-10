import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lightbulb } from "lucide-react";

export function UxReasoningCard({ reasoning }: { reasoning: string }) {
  const points = reasoning
    .split(/(?<=[.!?])\s+/)
    .filter((s) => s.trim().length > 0);

  return (
    <Card className="border-white/[0.06] bg-[#141414] overflow-hidden">
      <CardHeader className="bg-[#111111] border-b border-white/[0.04] pb-3">
        <CardTitle className="text-sm font-bold text-neutral-200 flex items-center gap-2">
          <Lightbulb className="h-4 w-4 text-amber-400" />
          UX Reasoning
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4 pb-4">
        {points.length > 1 ? (
          <ul className="space-y-2">
            {points.map((p, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-neutral-400 leading-relaxed">
                <span className="text-amber-400 mt-0.5 shrink-0">•</span>
                {p.trim()}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-neutral-400 leading-relaxed">{reasoning}</p>
        )}
      </CardContent>
    </Card>
  );
}
