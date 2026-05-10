"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
    <Card className="border-white/[0.06] bg-[#141414] overflow-hidden">
      <CardHeader className="bg-[#111111] border-b border-white/[0.04] pb-3">
        <CardTitle className="text-sm font-bold text-neutral-200 flex items-center gap-2">
          <Wand2 className="h-4 w-4 text-indigo-400" />
          Builder Prompt
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4 pb-4 space-y-4">
        <p className="text-xs text-neutral-500">
          Pilih tool AI, lalu generate prompt siap copy-paste.
        </p>

        <div className="flex flex-wrap gap-1.5">
          {TOOLS.map((tool) => (
            <button
              key={tool.value}
              onClick={() => setSelectedTool(tool.value)}
              className={`px-2.5 py-1 text-[11px] rounded-lg border transition-all ${
                selectedTool === tool.value
                  ? "bg-violet-600 text-white border-violet-600"
                  : "bg-[#1a1a1a] text-neutral-400 border-white/[0.06] hover:border-violet-500/30 hover:text-violet-400"
              }`}
            >
              {tool.label}
            </button>
          ))}
        </div>

        <Button
          onClick={handleGenerate}
          disabled={isLoading}
          size="sm"
          className="w-full rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-xs"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Wand2 className="mr-2 h-3.5 w-3.5" />
              Generate untuk {TOOLS.find((t) => t.value === selectedTool)?.label}
            </>
          )}
        </Button>

        {prompt && (
          <div className="relative">
            <div className="bg-[#0a0a0a] text-neutral-300 p-3 rounded-lg text-[11px] font-mono whitespace-pre-wrap max-h-60 overflow-y-auto leading-relaxed border border-white/[0.04] custom-scrollbar">
              {prompt}
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleCopy}
              className="absolute top-1.5 right-1.5 h-7 w-7 p-0 text-neutral-500 hover:text-white hover:bg-white/[0.1]"
            >
              {isCopied ? (
                <Check className="h-3.5 w-3.5" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
