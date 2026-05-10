import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Compass } from "lucide-react";

export function WebsiteDirectionCard({ direction }: { direction: string }) {
  // Split into bullet points if there are sentences
  const points = direction
    .split(/(?<=[.!?])\s+/)
    .filter((s) => s.trim().length > 0);

  return (
    <Card className="border-white/[0.06] bg-[#141414] overflow-hidden">
      <CardHeader className="bg-[#111111] border-b border-white/[0.04] pb-3">
        <CardTitle className="text-sm font-bold text-neutral-200 flex items-center gap-2">
          <Compass className="h-4 w-4 text-blue-400" />
          Arah Desain
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4 pb-4">
        {points.length > 1 ? (
          <ul className="space-y-2">
            {points.map((p, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-neutral-400 leading-relaxed">
                <span className="text-blue-400 mt-0.5 shrink-0">•</span>
                {p.trim()}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-neutral-400 leading-relaxed">{direction}</p>
        )}
      </CardContent>
    </Card>
  );
}
