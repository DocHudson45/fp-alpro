"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Copy, Check, Wand2 } from "lucide-react";
import { toast } from "sonner";

interface BuilderPromptCardProps {
  projectId: string;
  existingPrompt?: string | null;
  existingTool?: string | null;
}

const TOOLS = [
  { value: "stitch", label: "Stitch" },
  { value: "framer", label: "Framer" },
  { value: "v0", label: "v0" },
  { value: "bolt", label: "Bolt" },
  { value: "webflow", label: "Webflow" },
  { value: "lovable", label: "Lovable" },
  { value: "replit", label: "Replit" },
  { value: "claude", label: "Claude" },
];

export function BuilderPromptCard({
  projectId,
  existingPrompt,
  existingTool,
}: BuilderPromptCardProps) {
  const [selectedTool, setSelectedTool] = useState(existingTool || "v0");
  const [prompt, setPrompt] = useState(existingPrompt || "");
  const [isLoading, setIsLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const handleGenerate = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/builder-prompt`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetTool: selectedTool }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Gagal generate prompt");
      }

      const data = await res.json();
      setPrompt(data.prompt);
      toast.success("Builder prompt berhasil dibuat!");
    } catch (error: any) {
      toast.error(error.message || "Gagal membuat prompt. Coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(prompt);
      setIsCopied(true);
      toast.success("Prompt berhasil disalin!");
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      toast.error("Gagal menyalin prompt");
    }
  };

  return (
    <Card className="border-indigo-100 shadow-sm bg-indigo-50/30 overflow-hidden">
      <CardHeader className="bg-indigo-50/50 border-b border-indigo-100 pb-4">
        <CardTitle className="text-lg font-bold text-indigo-900 flex items-center gap-2">
          <Wand2 className="h-5 w-5 text-indigo-600" />
          Builder Prompt
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        <p className="text-sm text-slate-600">
          Pilih tool AI builder, lalu generate prompt siap pakai untuk langsung
          di-copy-paste.
        </p>

        <div className="flex flex-wrap gap-2">
          {TOOLS.map((tool) => (
            <button
              key={tool.value}
              onClick={() => setSelectedTool(tool.value)}
              className={`px-3 py-1.5 text-sm rounded-full border transition-all ${
                selectedTool === tool.value
                  ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                  : "bg-white text-slate-600 border-slate-200 hover:border-indigo-300 hover:text-indigo-700"
              }`}
            >
              {tool.label}
            </button>
          ))}
        </div>

        <Button
          onClick={handleGenerate}
          disabled={isLoading}
          className="w-full rounded-lg"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Wand2 className="mr-2 h-4 w-4" />
              Generate Prompt untuk {TOOLS.find((t) => t.value === selectedTool)?.label}
            </>
          )}
        </Button>

        {prompt && (
          <div className="relative">
            <div className="bg-slate-900 text-slate-100 p-4 rounded-lg text-sm font-mono whitespace-pre-wrap max-h-80 overflow-y-auto leading-relaxed">
              {prompt}
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleCopy}
              className="absolute top-2 right-2 text-slate-400 hover:text-white hover:bg-slate-700"
            >
              {isCopied ? (
                <Check className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
