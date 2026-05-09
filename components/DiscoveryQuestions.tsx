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
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 mb-8 text-blue-900">
        <h3 className="font-semibold text-lg mb-2">Discovery Phase</h3>
        <p className="text-blue-700/80">
          AI telah menyiapkan beberapa pertanyaan tajam berdasarkan brief-mu. Jawab bersama klien (atau jawab sendiri jika kamu sudah tahu) untuk mendapatkan hasil analisis yang paling akurat. Kamu juga bisa melewati bagian ini jika informasi dirasa sudah cukup.
        </p>
      </div>

      <div className="space-y-8">
        {questions.map((q, i) => (
          <Card key={q.id} className="border-slate-200 shadow-sm overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
              <CardTitle className="text-base font-semibold text-slate-900 leading-relaxed flex gap-3">
                <span className="flex-shrink-0 flex items-center justify-center bg-white border border-slate-200 h-6 w-6 rounded-full text-xs text-slate-500 font-bold">
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
                className="min-h-[100px] bg-white resize-none focus-visible:ring-blue-500"
                value={answers[q.id] || ""}
                onChange={(e) => handleAnswerChange(q.id, e.target.value)}
              />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row justify-end gap-4 pt-8 mt-8 border-t border-slate-200">
        <Button
          variant="outline"
          size="lg"
          onClick={() => submitAnswers(true)}
          disabled={isSubmitting || isSkipping}
          className="rounded-full shadow-sm text-slate-600"
        >
          {isSkipping ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <SkipForward className="mr-2 h-4 w-4" />}
          Lewati & Generate Analisis
        </Button>
        <Button
          size="lg"
          onClick={() => submitAnswers(false)}
          disabled={isSubmitting || isSkipping}
          className="rounded-full shadow-sm px-8"
        >
          {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <SendHorizontal className="mr-2 h-4 w-4" />}
          Submit Jawaban & Generate
        </Button>
      </div>
    </div>
  );
}
