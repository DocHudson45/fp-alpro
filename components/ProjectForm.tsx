"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createProjectSchema } from "@/lib/validators/project";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Sparkles, Save } from "lucide-react";

export function ProjectForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);

  const form = useForm<z.infer<typeof createProjectSchema>>({
    resolver: zodResolver(createProjectSchema) as any,
    defaultValues: {
      name: "",
      description: "",
      businessType: "",
      targetUser: "",
      appGoal: "",
      desiredComplexity: "",
      techStack: "",
      freelancerRate: undefined,
      references: [],
    },
  });

  async function createProject(values: z.infer<typeof createProjectSchema>) {
    const response = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    if (!response.ok) {
      throw new Error("Gagal membuat project");
    }

    return response.json();
  }

  async function onAnalyze(values: z.infer<typeof createProjectSchema>) {
    setIsSubmitting(true);
    try {
      const data = await createProject(values);
      toast.success("Project dibuat! Memulai analisis...");

      // Trigger discovery immediately
      const discoveryRes = await fetch(`/api/projects/${data.id}/discovery`, {
        method: "POST",
      });
      if (!discoveryRes.ok) throw new Error("Gagal memulai discovery");

      router.push(`/projects/${data.id}`);
    } catch (error) {
      toast.error("Terjadi kesalahan. Silakan coba lagi.");
      setIsSubmitting(false);
    }
  }

  async function onSaveDraft(values: z.infer<typeof createProjectSchema>) {
    setIsSavingDraft(true);
    try {
      const data = await createProject(values);
      toast.success("Draft berhasil disimpan!");
      router.push(`/projects/${data.id}`);
    } catch (error) {
      toast.error("Terjadi kesalahan. Silakan coba lagi.");
      setIsSavingDraft(false);
    }
  }

  const isLoading = isSubmitting || isSavingDraft;

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-[#141414] overflow-hidden">
      <div className="p-6 sm:p-8">
        <Form {...form}>
          <form onSubmit={(e) => e.preventDefault()} className="space-y-8">
            {/* Project Name — prominent */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-neutral-200 font-semibold text-base">
                    Nama Project <span className="text-violet-400">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Contoh: Kopi Kenangan Redesign"
                      className="bg-[#1a1a1a] border-white/[0.06] text-neutral-200 placeholder:text-neutral-600 focus-visible:ring-violet-500/50 h-12 text-base"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription className="text-neutral-500">
                    Nama ini akan digunakan sebagai URL project.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-neutral-200 font-semibold">
                    Deskripsi Projek <span className="text-violet-400">*</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Jelaskan tentang app mobile yang ingin didesain. Contoh: Aplikasi delivery makanan untuk UMKM lokal, fitur utama tracking pesanan real-time..."
                      className="resize-none h-32 bg-[#1a1a1a] border-white/[0.06] text-neutral-200 placeholder:text-neutral-600 focus-visible:ring-violet-500/50"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription className="text-neutral-500">
                    Deskripsikan app mobile yang ingin didesain. Semakin detail, AI semakin akurat.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="businessType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-neutral-300">Jenis Bisnis (opsional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Contoh: FnB, Fintech, E-commerce"
                        className="bg-[#1a1a1a] border-white/[0.06] text-neutral-200 placeholder:text-neutral-600 focus-visible:ring-violet-500/50"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="targetUser"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-neutral-300">Target Pengguna (opsional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Contoh: Gen Z, Mahasiswa, Ibu Rumah Tangga"
                        className="bg-[#1a1a1a] border-white/[0.06] text-neutral-200 placeholder:text-neutral-600 focus-visible:ring-violet-500/50"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="appGoal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-neutral-300">Tujuan Aplikasi (opsional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Contoh: Increase engagement, Monetization"
                        className="bg-[#1a1a1a] border-white/[0.06] text-neutral-200 placeholder:text-neutral-600 focus-visible:ring-violet-500/50"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="desiredComplexity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-neutral-300">Kompleksitas (opsional)</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-[#1a1a1a] border-white/[0.06] text-neutral-200 focus-visible:ring-violet-500/50">
                          <SelectValue placeholder="Pilih kompleksitas" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-[#1a1a1a] border-white/[0.06]">
                        <SelectItem value="Simple & Functional">Simple & Functional</SelectItem>
                        <SelectItem value="Clean & Professional">Clean & Professional</SelectItem>
                        <SelectItem value="Modern & Interactive">Modern & Interactive</SelectItem>
                        <SelectItem value="Premium / High-End">Premium / High-End</SelectItem>
                        <SelectItem value="Experimental / Creative">Experimental / Creative</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="techStack"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-neutral-300">Tech Stack (opsional)</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-[#1a1a1a] border-white/[0.06] text-neutral-200 focus-visible:ring-violet-500/50">
                          <SelectValue placeholder="Pilih tech stack" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-[#1a1a1a] border-white/[0.06]">
                        <SelectItem value="Flutter">Flutter</SelectItem>
                        <SelectItem value="React Native">React Native</SelectItem>
                        <SelectItem value="Swift (iOS)">Swift (iOS)</SelectItem>
                        <SelectItem value="Kotlin (Android)">Kotlin (Android)</SelectItem>
                        <SelectItem value="Figma Prototype">Figma Prototype</SelectItem>
                        <SelectItem value="Other">Lainnya</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="references"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-neutral-300">Referensi Desain (URL, opsional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={"https://dribbble.com/shots/contoh\nhttps://apps.apple.com/contoh"}
                      className="bg-[#1a1a1a] border-white/[0.06] text-neutral-200 placeholder:text-neutral-600 focus-visible:ring-violet-500/50"
                      onChange={(e) => {
                        const urls = e.target.value.split("\n").filter(Boolean);
                        field.onChange(urls);
                      }}
                      value={field.value?.join("\n") || ""}
                    />
                  </FormControl>
                  <FormDescription className="text-neutral-500">
                    Satu URL per baris. AI akan scan & analisis layout dari referensi ini.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Action Buttons */}
            <div className="pt-6 border-t border-white/[0.06] flex flex-col sm:flex-row justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                size="lg"
                disabled={isLoading}
                onClick={form.handleSubmit(onSaveDraft)}
                className="rounded-xl border-white/[0.08] bg-transparent text-neutral-300 hover:bg-white/[0.04] hover:text-neutral-100"
              >
                {isSavingDraft ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Save Draft
              </Button>
              <Button
                type="button"
                size="lg"
                disabled={isLoading}
                onClick={form.handleSubmit(onAnalyze)}
                className="rounded-xl bg-violet-600 hover:bg-violet-700 text-white shadow-lg shadow-violet-900/30 px-8"
              >
                {isSubmitting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="mr-2 h-4 w-4" />
                )}
                Analisis Langsung
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
