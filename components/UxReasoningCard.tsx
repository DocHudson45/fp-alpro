import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lightbulb } from "lucide-react";

export function UxReasoningCard({ reasoning }: { reasoning: string }) {
  return (
    <Card className="border-amber-100 shadow-sm bg-amber-50/30 overflow-hidden">
      <CardHeader className="bg-amber-50/50 border-b border-amber-100 pb-4">
        <CardTitle className="text-lg font-bold text-amber-900 flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-amber-600" />
          UX Reasoning
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <p className="text-slate-700 leading-relaxed">{reasoning}</p>
      </CardContent>
    </Card>
  );
}
