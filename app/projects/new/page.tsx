import { ProjectForm } from "@/components/ProjectForm";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NewProjectPage() {
  return (
    <div className="container mx-auto px-4 py-10 max-w-3xl">
      <div className="mb-8">
        <Button asChild variant="ghost" className="mb-4 -ml-4 text-neutral-500 hover:text-neutral-200 hover:bg-white/[0.04]">
          <Link href="/projects">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight text-neutral-100">Project Baru</h1>
        <p className="text-neutral-500 mt-2 text-lg">
          Deskripsikan mobile app yang ingin kamu desain. AI akan menganalisis dan memberikan panduan UI/UX.
        </p>
      </div>

      <ProjectForm />
    </div>
  );
}
