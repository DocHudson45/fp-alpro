import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Compass } from "lucide-react";

export function WebsiteDirectionCard({ direction }: { direction: string }) {
  return (
    <Card className="border-blue-100 shadow-sm bg-blue-50/30 overflow-hidden">
      <CardHeader className="bg-blue-50/50 border-b border-blue-100 pb-4">
        <CardTitle className="text-lg font-bold text-blue-900 flex items-center gap-2">
          <Compass className="h-5 w-5 text-blue-600" />
          Arah Website
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <p className="text-slate-700 leading-relaxed text-lg">{direction}</p>
      </CardContent>
    </Card>
  );
}
