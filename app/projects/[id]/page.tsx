"use client";

import { useEffect, useState, use } from "react";
import { DiscoveryQuestions } from "@/components/DiscoveryQuestions";
import { AnalysisResult } from "@/components/AnalysisResult";
import { ChatPanel } from "@/components/ChatPanel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Loader2, Sparkles } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const { id } = unwrappedParams;
  
  const [project, setProject] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGeneratingDiscovery, setIsGeneratingDiscovery] = useState(false);

  const fetchProject = async () => {
    try {
      const res = await fetch(`/api/projects/${id}`);
      if (!res.ok) {
        if (res.status === 404) {
          toast.error("Project tidak ditemukan");
        } else {
          throw new Error("Gagal mengambil data project");
        }
        return;
      }
      const data = await res.json();
      setProject(data);
    } catch (error) {
      toast.error("Terjadi kesalahan saat memuat data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProject();
  }, [id]);

  const handleStartDiscovery = async () => {
    setIsGeneratingDiscovery(true);
    try {
      const res = await fetch(`/api/projects/${id}/discovery`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Gagal generate discovery");
      
      toast.success("Pertanyaan discovery berhasil dibuat!");
      await fetchProject();
    } catch (error) {
      toast.error("Gagal membuat pertanyaan. Coba lagi.");
    } finally {
      setIsGeneratingDiscovery(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-4" />
        <p className="text-slate-500">Memuat detail project...</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="container mx-auto px-4 py-20 text-center max-w-xl">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Project Tidak Ditemukan</h2>
        <p className="text-slate-500 mb-6">Mungkin project sudah dihapus atau URL tidak valid.</p>
        <Button asChild className="rounded-full">
          <Link href="/projects">Kembali ke Daftar Project</Link>
        </Button>
      </div>
    );
  }

  const isAnalyzed = project.status === "ANALYZED" && project.analysis;

  return (
    <div className={`container mx-auto px-4 py-10 ${isAnalyzed ? "max-w-[1400px]" : "max-w-4xl"}`}>
      <Button asChild variant="ghost" className="mb-6 -ml-4 text-slate-500 hover:text-slate-900">
        <Link href="/projects">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Kembali
        </Link>
      </Button>

      {/* Project Info Summary */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 mb-8 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 pb-6 border-b border-slate-100">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 mb-1">
              {project.businessType || "Project Tanpa Nama"}
            </h1>
            <p className="text-sm text-slate-500">
              Dibuat pada {format(new Date(project.createdAt), "d MMMM yyyy", { locale: localeId })}
            </p>
          </div>
          <Badge className={`shadow-none font-medium text-sm px-3 py-1 ${
            project.status === "DRAFT" ? "bg-slate-100 text-slate-700" :
            project.status === "DISCOVERY" ? "bg-blue-100 text-blue-700" :
            "bg-emerald-100 text-emerald-700"
          }`}>
            {project.status === "DRAFT" ? "Draft" : 
             project.status === "DISCOVERY" ? "Discovery Phase" : "Analyzed"}
          </Badge>
        </div>

        <div className="space-y-4 text-slate-700">
          <div>
            <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Permintaan Klien</h4>
            <p className="whitespace-pre-wrap leading-relaxed">{project.clientRequest}</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 mt-4 border-t border-slate-100">
            {project.targetUser && (
              <div>
                <span className="text-xs text-slate-400 block mb-1">Target User</span>
                <span className="font-medium">{project.targetUser}</span>
              </div>
            )}
            {project.websiteGoal && (
              <div>
                <span className="text-xs text-slate-400 block mb-1">Tujuan</span>
                <span className="font-medium">{project.websiteGoal}</span>
              </div>
            )}
            {project.budget && (
              <div>
                <span className="text-xs text-slate-400 block mb-1">Budget</span>
                <span className="font-medium">{project.budget}</span>
              </div>
            )}
            {project.techStack && (
              <div>
                <span className="text-xs text-slate-400 block mb-1">Tech Stack</span>
                <span className="font-medium">{project.techStack}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* DRAFT State */}
      {project.status === "DRAFT" && (
        <div className="text-center py-16 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
          <div className="mx-auto w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-6">
            <Sparkles className="h-8 w-8" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-3">Mulai Analisis Project</h3>
          <p className="text-slate-500 max-w-md mx-auto mb-8 leading-relaxed">
            AI akan membaca brief kamu dan menghasilkan pertanyaan discovery yang tajam untuk menggali kebutuhan klien lebih dalam.
          </p>
          <Button 
            size="lg" 
            className="rounded-full shadow-sm px-8"
            onClick={handleStartDiscovery}
            disabled={isGeneratingDiscovery}
          >
            {isGeneratingDiscovery ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Memproses Brief...
              </>
            ) : (
              "Mulai Discovery"
            )}
          </Button>
        </div>
      )}

      {/* DISCOVERY State */}
      {project.status === "DISCOVERY" && project.discoveryQAs && (
        <DiscoveryQuestions 
          projectId={project.id} 
          questions={project.discoveryQAs} 
          onAnalyzeStart={() => {
            toast.info("Sedang menganalisis jawaban dan membuat panduan...");
          }}
          onAnalyzeComplete={() => {
            fetchProject();
          }}
        />
      )}

      {/* ANALYZED State — Two Column Layout */}
      {isAnalyzed && (
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Column: Analysis Cards (40%) */}
          <div className="w-full lg:w-2/5 shrink-0">
            <AnalysisResult analysis={project.analysis} projectId={project.id} />
          </div>

          {/* Right Column: Chat Panel (60%) */}
          <div className="w-full lg:w-3/5 lg:sticky lg:top-6 lg:self-start" style={{ height: "calc(100vh - 6rem)" }}>
            <ChatPanel
              projectId={project.id}
              existingValidations={project.designValidations}
              existingImages={project.generatedImages}
            />
          </div>
        </div>
      )}
    </div>
  );
}

