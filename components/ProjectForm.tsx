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
import { Loader2 } from "lucide-react";
import { Card, CardContent } from "./ui/card";

export function ProjectForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof createProjectSchema>>({
    resolver: zodResolver(createProjectSchema) as any,
    defaultValues: {
      clientRequest: "",
      businessType: "",
      targetUser: "",
      websiteGoal: "",
      budget: "",
      desiredComplexity: "",
      techStack: "",
      freelancerRate: undefined,
      references: [],
    },
  });

  async function onSubmit(values: z.infer<typeof createProjectSchema>) {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error("Gagal membuat project");
      }

      const data = await response.json();
      toast.success("Project berhasil dibuat!");
      router.push(`/projects/${data.id}`);
    } catch (error) {
      toast.error("Terjadi kesalahan. Silakan coba lagi.");
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="border-0 shadow-none sm:border sm:border-slate-200 sm:shadow-sm bg-white overflow-hidden">
      <CardContent className="p-0 sm:p-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="clientRequest"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-900 font-semibold">Permintaan Klien <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Contoh: Saya butuh website untuk kedai kopi saya yang baru buka..."
                      className="resize-none h-32 bg-slate-50 focus-visible:ring-blue-500"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Masukkan brief atau catatan mentah dari klien. Semakin detail, AI akan semakin akurat.
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
                    <FormLabel className="text-slate-900">Jenis Bisnis (opsional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Contoh: FnB, Agency, SaaS" className="bg-slate-50 focus-visible:ring-blue-500" {...field} />
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
                    <FormLabel className="text-slate-900">Target Pengguna (opsional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Contoh: Mahasiswa, Ibu Rumah Tangga" className="bg-slate-50 focus-visible:ring-blue-500" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="websiteGoal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-900">Tujuan Website (opsional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Contoh: Leads, Penjualan, Company Profile" className="bg-slate-50 focus-visible:ring-blue-500" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="budget"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-900">Budget (opsional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Contoh: Rp 5 Juta" className="bg-slate-50 focus-visible:ring-blue-500" {...field} />
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
                    <FormLabel className="text-slate-900">Kompleksitas (opsional)</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-slate-50 focus-visible:ring-blue-500">
                          <SelectValue placeholder="Pilih kompleksitas" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
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
                    <FormLabel className="text-slate-900">Tech Stack (opsional)</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-slate-50 focus-visible:ring-blue-500">
                          <SelectValue placeholder="Pilih tech stack" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Framer">Framer</SelectItem>
                        <SelectItem value="Webflow">Webflow</SelectItem>
                        <SelectItem value="WordPress">WordPress</SelectItem>
                        <SelectItem value="Custom (React/Next.js)">Custom (React/Next.js)</SelectItem>
                        <SelectItem value="Custom (Vue/Nuxt)">Custom (Vue/Nuxt)</SelectItem>
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
                  <FormLabel className="text-slate-900">Referensi (URL, opsional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="https://contoh1.com&#10;https://contoh2.com"
                      className="bg-slate-50 focus-visible:ring-blue-500"
                      onChange={(e) => {
                        const urls = e.target.value.split("\\n").filter(Boolean);
                        field.onChange(urls);
                      }}
                      value={field.value?.join("\\n") || ""}
                    />
                  </FormControl>
                  <FormDescription>Satu URL per baris.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <Button type="submit" size="lg" disabled={isSubmitting} className="rounded-full shadow-sm px-8">
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  "Buat Project"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
