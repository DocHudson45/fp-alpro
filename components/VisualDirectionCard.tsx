import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Palette } from "lucide-react";

interface VisualDirectionProps {
  visual: {
    palette: string[];
    typography: {
      heading: string;
      body: string;
      style: string;
    };
    mood: string[];
    layoutStyle: string;
    imageStyle: string;
  };
}

export function VisualDirectionCard({ visual }: VisualDirectionProps) {
  return (
    <Card className="border-purple-100 shadow-sm bg-purple-50/30 overflow-hidden">
      <CardHeader className="bg-purple-50/50 border-b border-purple-100 pb-4">
        <CardTitle className="text-lg font-bold text-purple-900 flex items-center gap-2">
          <Palette className="h-5 w-5 text-purple-600" />
          Arah Visual
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        <div>
          <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Palette Warna</h4>
          <div className="flex flex-wrap gap-3">
            {visual.palette.map((color, index) => (
              <div key={index} className="flex flex-col items-center gap-1.5">
                <div
                  className="h-12 w-12 rounded-full border border-slate-200 shadow-inner"
                  style={{ backgroundColor: color }}
                />
                <span className="text-xs text-slate-500 font-mono">{color}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Tipografi</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-3 rounded-lg border border-slate-100">
              <span className="text-xs text-slate-400 block mb-1">Heading</span>
              <span className="font-medium text-slate-800">{visual.typography.heading}</span>
            </div>
            <div className="bg-white p-3 rounded-lg border border-slate-100">
              <span className="text-xs text-slate-400 block mb-1">Body</span>
              <span className="font-medium text-slate-800">{visual.typography.body}</span>
            </div>
          </div>
          <p className="text-sm text-slate-600 mt-2 italic">{visual.typography.style}</p>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Mood & Style</h4>
          <div className="flex flex-wrap gap-2 mb-4">
            {visual.mood.map((m, i) => (
              <Badge key={i} variant="secondary" className="bg-purple-100 text-purple-800 hover:bg-purple-100 shadow-none font-medium">
                {m}
              </Badge>
            ))}
          </div>
          <div className="space-y-2 text-sm text-slate-700">
            <p><span className="font-medium">Layout:</span> {visual.layoutStyle}</p>
            <p><span className="font-medium">Image:</span> {visual.imageStyle}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
