"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, SendHorizontal, SkipForward } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface DiscoveryQA {
  id: string;
  question: string;
  answer: string | null;
  order: number;
}

interface DiscoveryQuestionsProps {
  projectId: string;
  questions: DiscoveryQA[];
  onAnalyzeStart: () => void;
  onAnalyzeComplete: () => void;
}

export function DiscoveryQuestions({ projectId, questions, onAnalyzeStart, onAnalyzeComplete }: DiscoveryQuestionsProps) {
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSkipping, setIsSkipping] = useState(false);

  const handleAnswerChange = (id: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  };

  const submitAnswers = async (skip: boolean) => {
    if (skip) setIsSkipping(true);
    else setIsSubmitting(true);
    
    onAnalyzeStart();

    try {
      const res = await fetch(`/api/projects/${projectId}/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: skip ? {} : answers }),
      });

      if (!res.ok) throw new Error("Gagal melakukan analisis");

      toast.success("Analisis berhasil dibuat!");
      onAnalyzeComplete();
    } catch (error) {
      toast.error("Terjadi kesalahan. Coba lagi nanti.");
    } finally {
      setIsSubmitting(false);
      setIsSkipping(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-violet-500/5 border border-violet-500/10 rounded-xl p-6 mb-8">
        <h3 className="font-semibold text-lg mb-2 text-violet-300">Discovery Phase</h3>
        <p className="text-neutral-400 text-sm">
          AI telah menyiapkan pertanyaan berdasarkan deskripsi projek. Jawab untuk mendapatkan analisis desain mobile UI/UX yang lebih akurat.
        </p>
      </div>

      <div className="space-y-6">
        {questions.map((q, i) => (
          <Card key={q.id} className="border-white/[0.06] bg-[#141414] overflow-hidden">
            <CardHeader className="bg-[#111111] border-b border-white/[0.04] pb-3">
              <CardTitle className="text-sm font-semibold text-neutral-200 leading-relaxed flex gap-3">
                <span className="flex-shrink-0 flex items-center justify-center bg-[#1a1a1a] border border-white/[0.06] h-6 w-6 rounded-full text-[10px] text-neutral-500 font-bold">
                  {i + 1}
                </span>
                {q.question}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <Label htmlFor={`answer-${q.id}`} className="sr-only">Jawaban</Label>
              <Textarea
                id={`answer-${q.id}`}
                placeholder="Ketik jawaban di sini..."
                className="min-h-[80px] bg-[#1a1a1a] border-white/[0.06] text-neutral-200 placeholder:text-neutral-600 resize-none focus-visible:ring-violet-500/50"
                value={answers[q.id] || ""}
                onChange={(e) => handleAnswerChange(q.id, e.target.value)}
              />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row justify-end gap-3 pt-8 mt-8 border-t border-white/[0.06]">
        <Button
          variant="outline"
          size="lg"
          onClick={() => submitAnswers(true)}
          disabled={isSubmitting || isSkipping}
          className="rounded-xl border-white/[0.08] bg-transparent text-neutral-400 hover:bg-white/[0.04] hover:text-neutral-200"
        >
          {isSkipping ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <SkipForward className="mr-2 h-4 w-4" />}
          Lewati & Analisis
        </Button>
        <Button
          size="lg"
          onClick={() => submitAnswers(false)}
          disabled={isSubmitting || isSkipping}
          className="rounded-xl bg-violet-600 hover:bg-violet-700 text-white shadow-lg shadow-violet-900/30 px-8"
        >
          {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <SendHorizontal className="mr-2 h-4 w-4" />}
          Submit & Analisis
        </Button>
      </div>
    </div>
  );
}
