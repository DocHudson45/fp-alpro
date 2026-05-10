"use client";

import { useEffect, useState, use } from "react";
import { DiscoveryQuestions } from "@/components/DiscoveryQuestions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Loader2, Sparkles } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";

import { WorkspaceView } from "@/components/workspace/WorkspaceView";

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
        <Loader2 className="h-8 w-8 animate-spin text-violet-500 mb-4" />
        <p className="text-neutral-500">Memuat detail project...</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="container mx-auto px-4 py-20 text-center max-w-xl">
        <h2 className="text-2xl font-bold text-neutral-100 mb-2">Project Tidak Ditemukan</h2>
        <p className="text-neutral-500 mb-6">Mungkin project sudah dihapus atau URL tidak valid.</p>
        <Button asChild className="rounded-xl bg-violet-600 hover:bg-violet-700 text-white">
          <Link href="/projects">Kembali ke Projects</Link>
        </Button>
      </div>
    );
  }

  const isAnalyzed = project.status === "ANALYZED" && project.analysis;

  // Use WorkspaceView for ANALYZED state
  if (isAnalyzed) {
    return <WorkspaceView project={project} onRefresh={fetchProject} />;
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-4xl">
      <Button asChild variant="ghost" className="mb-6 -ml-4 text-neutral-500 hover:text-neutral-200 hover:bg-white/[0.04]">
        <Link href="/projects">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Kembali
        </Link>
      </Button>

      {/* Project Info Summary */}
      <div className="bg-[#141414] border border-white/[0.06] rounded-2xl p-6 md:p-8 mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 pb-6 border-b border-white/[0.06]">
          <div>
            <h1 className="text-2xl font-bold text-neutral-100 mb-1">
              {project.name || project.businessType || "Untitled Project"}
            </h1>
            <p className="text-sm text-neutral-500">
              Dibuat pada {format(new Date(project.createdAt), "d MMMM yyyy", { locale: localeId })}
            </p>
          </div>
          <Badge className={`shadow-none font-medium text-sm px-3 py-1 border-0 ${
            project.status === "DRAFT" ? "bg-neutral-800 text-neutral-400" :
            project.status === "DISCOVERY" ? "bg-violet-500/10 text-violet-400" :
            "bg-emerald-500/10 text-emerald-400"
          }`}>
            {project.status === "DRAFT" ? "Draft" : 
             project.status === "DISCOVERY" ? "Discovery Phase" : "Analyzed"}
          </Badge>
        </div>

        <div className="space-y-4 text-neutral-300">
          <div>
            <h4 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider mb-2">Deskripsi Projek</h4>
            <p className="whitespace-pre-wrap leading-relaxed">{project.description || project.clientRequest}</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 mt-4 border-t border-white/[0.06]">
            {project.targetUser && (
              <div>
                <span className="text-xs text-neutral-600 block mb-1">Target User</span>
                <span className="font-medium text-neutral-300">{project.targetUser}</span>
              </div>
            )}
            {project.appGoal && (
              <div>
                <span className="text-xs text-neutral-600 block mb-1">Tujuan App</span>
                <span className="font-medium text-neutral-300">{project.appGoal}</span>
              </div>
            )}
            {project.techStack && (
              <div>
                <span className="text-xs text-neutral-600 block mb-1">Tech Stack</span>
                <span className="font-medium text-neutral-300">{project.techStack}</span>
              </div>
            )}
            {project.businessType && (
              <div>
                <span className="text-xs text-neutral-600 block mb-1">Jenis Bisnis</span>
                <span className="font-medium text-neutral-300">{project.businessType}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* DRAFT State */}
      {project.status === "DRAFT" && (
        <div className="text-center py-16 bg-[#111111] rounded-2xl border border-dashed border-white/[0.08]">
          <div className="mx-auto w-16 h-16 bg-violet-500/10 text-violet-400 rounded-full flex items-center justify-center mb-6">
            <Sparkles className="h-8 w-8" />
          </div>
          <h3 className="text-xl font-bold text-neutral-100 mb-3">Mulai Analisis Project</h3>
          <p className="text-neutral-500 max-w-md mx-auto mb-8 leading-relaxed">
            AI akan membaca deskripsi kamu dan menghasilkan pertanyaan discovery untuk menggali kebutuhan desain mobile UI/UX lebih dalam.
          </p>
          <Button 
            size="lg" 
            className="rounded-xl bg-violet-600 hover:bg-violet-700 text-white shadow-lg shadow-violet-900/30 px-8"
            onClick={handleStartDiscovery}
            disabled={isGeneratingDiscovery}
          >
            {isGeneratingDiscovery ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Memproses...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Mulai Discovery
              </>
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
            toast.info("Sedang menganalisis dan membuat panduan desain...");
          }}
          onAnalyzeComplete={() => {
            fetchProject();
          }}
        />
      )}
    </div>
  );
}
