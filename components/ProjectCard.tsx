"use client";

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface ProjectCardProps {
  project: {
    id: string;
    name: string;
    description: string;
    businessType: string | null;
    status: "DRAFT" | "DISCOVERY" | "ANALYZED";
    createdAt: Date;
  };
  onDelete: (id: string) => void;
}

export function ProjectCard({ project, onDelete }: ProjectCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [open, setOpen] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "DRAFT":
        return "bg-neutral-800 text-neutral-400 hover:bg-neutral-800";
      case "DISCOVERY":
        return "bg-violet-500/10 text-violet-400 hover:bg-violet-500/10";
      case "ANALYZED":
        return "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/10";
      default:
        return "bg-neutral-800 text-neutral-400";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "DRAFT":
        return "Draft";
      case "DISCOVERY":
        return "Discovery";
      case "ANALYZED":
        return "Analyzed";
      default:
        return status;
    }
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      const res = await fetch(`/api/projects/${project.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Gagal menghapus project");
      
      toast.success("Project berhasil dihapus");
      onDelete(project.id);
    } catch (error) {
      toast.error("Gagal menghapus project. Silakan coba lagi.");
    } finally {
      setIsDeleting(false);
      setOpen(false);
    }
  };

  const desc = project.description || (project as any).clientRequest || "";
  const truncatedDesc = 
    desc.length > 100 
      ? desc.substring(0, 100) + "..." 
      : desc;

  return (
    <Card className="flex flex-col overflow-hidden transition-all border-white/[0.06] bg-[#141414] hover:bg-[#1a1a1a] hover:border-white/[0.1]">
      <CardHeader className="bg-[#111111] border-b border-white/[0.04] pb-4">
        <div className="flex justify-between items-start">
          <Badge className={`font-medium shadow-none border-0 ${getStatusColor(project.status)}`}>
            {getStatusText(project.status)}
          </Badge>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger
              render={<Button variant="ghost" size="icon" className="h-8 w-8 text-neutral-600 hover:text-red-400 hover:bg-red-500/10 -mt-2 -mr-2" />}
            >
              <Trash2 className="h-4 w-4" />
            </DialogTrigger>
            <DialogContent className="bg-[#1a1a1a] border-white/[0.08]">
              <DialogHeader>
                <DialogTitle className="text-neutral-100">Hapus Project?</DialogTitle>
                <DialogDescription className="text-neutral-400">
                  Tindakan ini tidak dapat dibatalkan. Semua data analisis dan discovery dari project ini akan dihapus permanen.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)} disabled={isDeleting} className="border-white/[0.08] text-neutral-300 hover:bg-white/[0.04]">
                  Batal
                </Button>
                <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
                  {isDeleting ? "Menghapus..." : "Hapus Project"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        <CardTitle className="text-lg font-bold text-neutral-100 mt-2 truncate">
          {project.name || project.businessType || "Untitled Project"}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 pt-4">
        <p className="text-sm text-neutral-500 line-clamp-3">
          {truncatedDesc}
        </p>
      </CardContent>
      <CardFooter className="flex items-center justify-between border-t border-white/[0.04] bg-[#111111]/50 pt-4 pb-4">
        <span className="text-xs text-neutral-600 font-medium">
          {formatDistanceToNow(new Date(project.createdAt), { addSuffix: true, locale: id })}
        </span>
        <Button asChild size="sm" className="bg-violet-600 hover:bg-violet-700 text-white shadow-sm">
          <Link href={`/projects/${project.id}`}>
            Buka
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
