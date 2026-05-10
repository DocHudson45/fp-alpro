"use client";

import { useEffect, useState } from "react";
import { ProjectCard } from "@/components/ProjectCard";
import { Button } from "@/components/ui/button";
import { PlusCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await fetch("/api/projects");
      if (!res.ok) throw new Error("Gagal mengambil data project");
      const data = await res.json();
      setProjects(data);
    } catch (error) {
      toast.error("Gagal memuat daftar project");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = (id: string) => {
    setProjects(projects.filter((p) => p.id !== id));
  };

  return (
    <div className="container mx-auto px-4 py-10 max-w-6xl">
      <div className="flex flex-col sm:flex-row items-center justify-between mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-neutral-100">Projects</h1>
          <p className="text-neutral-500 mt-1">Kelola semua project desain mobile UI/UX kamu.</p>
        </div>
        <Button asChild className="rounded-xl bg-violet-600 hover:bg-violet-700 text-white shadow-lg shadow-violet-900/30">
          <Link href="/projects/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Project Baru
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 text-neutral-500">
          <Loader2 className="h-8 w-8 animate-spin mb-4 text-violet-500" />
          <p>Memuat project...</p>
        </div>
      ) : projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 px-4 text-center border border-dashed border-white/[0.08] rounded-2xl bg-[#111111]">
          <div className="h-20 w-20 bg-violet-500/10 text-violet-400 rounded-full flex items-center justify-center mb-6">
            <PlusCircle className="h-10 w-10" />
          </div>
          <h3 className="text-xl font-bold text-neutral-200 mb-2">Belum ada project</h3>
          <p className="text-neutral-500 max-w-md mb-8">
            Mulai project pertamamu untuk menganalisis dan mendesain mobile UI/UX dengan AI.
          </p>
          <Button asChild size="lg" className="rounded-xl bg-violet-600 hover:bg-violet-700 text-white shadow-lg shadow-violet-900/30">
            <Link href="/projects/new">Buat Project Pertama</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}
