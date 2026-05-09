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
    clientRequest: string;
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
        return "bg-slate-100 text-slate-700 hover:bg-slate-100";
      case "DISCOVERY":
        return "bg-blue-100 text-blue-700 hover:bg-blue-100";
      case "ANALYZED":
        return "bg-emerald-100 text-emerald-700 hover:bg-emerald-100";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "DRAFT":
        return "Draft";
      case "DISCOVERY":
        return "Discovery";
      case "ANALYZED":
        return "Selesai Analisis";
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

  const truncatedRequest = 
    project.clientRequest.length > 100 
      ? project.clientRequest.substring(0, 100) + "..." 
      : project.clientRequest;

  return (
    <Card className="flex flex-col overflow-hidden transition-all hover:shadow-md border-slate-200">
      <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
        <div className="flex justify-between items-start">
          <Badge className={`font-medium shadow-none ${getStatusColor(project.status)}`}>
            {getStatusText(project.status)}
          </Badge>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger 
              render={<Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-500 hover:bg-red-50 -mt-2 -mr-2" />}
            >
              <Trash2 className="h-4 w-4" />
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Hapus Project?</DialogTitle>
                <DialogDescription>
                  Tindakan ini tidak dapat dibatalkan. Semua data analisis dan discovery dari project ini akan dihapus permanen.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)} disabled={isDeleting}>
                  Batal
                </Button>
                <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
                  {isDeleting ? "Menghapus..." : "Hapus Project"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        <CardTitle className="text-lg font-bold text-slate-900 mt-2 truncate">
          {project.businessType || "Project Tanpa Nama Bisnis"}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 pt-4">
        <p className="text-sm text-slate-600 line-clamp-3">
          "{truncatedRequest}"
        </p>
      </CardContent>
      <CardFooter className="flex items-center justify-between border-t border-slate-100 bg-slate-50/50 pt-4 pb-4">
        <span className="text-xs text-slate-500 font-medium">
          {formatDistanceToNow(new Date(project.createdAt), { addSuffix: true, locale: id })}
        </span>
        <Button asChild size="sm" variant="default" className="shadow-sm">
          <Link href={`/projects/${project.id}`}>
            Lihat Detail
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
