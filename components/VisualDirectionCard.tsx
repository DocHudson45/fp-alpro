"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Palette, Copy, Check } from "lucide-react";
import { useState, useCallback } from "react";
import { toast } from "sonner";

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
  onPaletteChange?: (newPalette: string[]) => void;
}

export function VisualDirectionCard({ visual, onPaletteChange }: VisualDirectionProps) {
  const [palette, setPalette] = useState(visual.palette);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopyColor = useCallback((color: string, index: number) => {
    navigator.clipboard.writeText(color).then(() => {
      setCopiedIndex(index);
      toast.success(`${color} disalin!`);
      setTimeout(() => setCopiedIndex(null), 1500);
    });
  }, []);

  const handleColorChange = useCallback((index: number, newColor: string) => {
    const newPalette = [...palette];
    newPalette[index] = newColor;
    setPalette(newPalette);
    onPaletteChange?.(newPalette);
  }, [palette, onPaletteChange]);

  return (
    <Card className="border-white/[0.06] bg-[#141414] overflow-hidden">
      <CardHeader className="bg-[#111111] border-b border-white/[0.04] pb-3">
        <CardTitle className="text-sm font-bold text-neutral-200 flex items-center gap-2">
          <Palette className="h-4 w-4 text-violet-400" />
          Arah Visual
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4 pb-4 space-y-5">
        {/* Color Palette — editable & copyable */}
        <div>
          <h4 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3">Palette Warna</h4>
          <div className="flex flex-wrap gap-3">
            {palette.map((color, index) => (
              <div key={index} className="flex flex-col items-center gap-1.5 group">
                <div className="relative">
                  {/* Hidden color input for editing */}
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => handleColorChange(index, e.target.value)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    title="Klik untuk ganti warna"
                  />
                  <div
                    className="h-10 w-10 rounded-lg border border-white/[0.1] shadow-inner transition-transform group-hover:scale-110 cursor-pointer"
                    style={{ backgroundColor: color }}
                  />
                </div>
                <button
                  onClick={() => handleCopyColor(color, index)}
                  className="flex items-center gap-1 text-[10px] text-neutral-500 hover:text-violet-400 font-mono transition-colors cursor-pointer"
                  title="Klik untuk copy"
                >
                  {copiedIndex === index ? (
                    <Check className="h-2.5 w-2.5 text-emerald-400" />
                  ) : (
                    <Copy className="h-2.5 w-2.5" />
                  )}
                  {color}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Typography */}
        <div>
          <h4 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">Tipografi</h4>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-[#1a1a1a] p-2.5 rounded-lg border border-white/[0.04]">
              <span className="text-[10px] text-neutral-600 block">Heading</span>
              <span className="text-xs font-medium text-neutral-300">{visual.typography.heading}</span>
            </div>
            <div className="bg-[#1a1a1a] p-2.5 rounded-lg border border-white/[0.04]">
              <span className="text-[10px] text-neutral-600 block">Body</span>
              <span className="text-xs font-medium text-neutral-300">{visual.typography.body}</span>
            </div>
          </div>
        </div>

        {/* Mood & Style */}
        <div>
          <h4 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">Mood</h4>
          <div className="flex flex-wrap gap-1.5 mb-3">
            {visual.mood.map((m, i) => (
              <Badge key={i} className="bg-violet-500/10 text-violet-400 hover:bg-violet-500/15 shadow-none border-0 text-[10px] font-medium">
                {m}
              </Badge>
            ))}
          </div>
          <div className="space-y-1 text-xs text-neutral-500">
            <p><span className="text-neutral-400">Layout:</span> {visual.layoutStyle}</p>
            <p><span className="text-neutral-400">Image:</span> {visual.imageStyle}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
