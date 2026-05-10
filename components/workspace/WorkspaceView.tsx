"use client";

import { useState, useRef, useEffect } from "react";
import { 
  LayoutDashboard, 
  Sparkles, 
  Info, 
  CheckCircle2, 
  AlertTriangle, 
  ImagePlus, 
  Paperclip,
  ChevronRight,
  Maximize2,
  Download,
  Loader2,
  Menu,
  X,
  Palette,
  Layout,
  Layers,
  Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { WebsiteDirectionCard } from "../WebsiteDirectionCard";
import { UxReasoningCard } from "../UxReasoningCard";
import { VisualDirectionCard } from "../VisualDirectionCard";
import { FeatureScopeTable } from "../FeatureScopeTable";
import { ComplexityCard } from "../ComplexityCard";
import { RiskFactorCard } from "../RiskFactorCard";
import { BuilderPromptCard } from "../BuilderPromptCard";

interface WorkspaceViewProps {
  project: any;
  onRefresh: () => Promise<void>;
}

export function WorkspaceView({ project, onRefresh }: WorkspaceViewProps) {
  const [activeSection, setActiveSection] = useState("overview");
  const [messages, setMessages] = useState<any[]>([]);
  const [isAnyLoading, setIsAnyLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const analysis = project.analysis;

  // Sync messages from project data (validations and images)
  useEffect(() => {
    if (!project) return;
    const existingMessages: any[] = [];
    
    if (project.designValidations) {
      for (const v of project.designValidations) {
        existingMessages.push({
          id: `val-user-${v.id}`,
          type: "user-image",
          timestamp: new Date(v.createdAt),
          content: { imageUrl: v.imageUrl },
        });
        existingMessages.push({
          id: `val-ai-${v.id}`,
          type: "ai-validation",
          timestamp: new Date(v.createdAt),
          content: { feedback: v.feedback, validationId: v.id },
        });
      }
    }

    if (project.generatedImages) {
      for (const img of project.generatedImages) {
        existingMessages.push({
          id: `img-${img.id}`,
          type: "ai-image",
          timestamp: new Date(img.createdAt),
          content: { imageUrl: img.imageUrl, imageType: img.imageType },
        });
      }
    }

    existingMessages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    setMessages(existingMessages);
  }, [project]);

  // Handle image upload and generation logic (mirrored from ChatPanel)
  const handleAttachImage = () => fileInputRef.current?.click();

  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const formData = new FormData();
    formData.append("image", file);

    setIsAnyLoading(true);
    const loadingId = `loading-${Date.now()}`;
    setMessages(prev => [...prev, { id: loadingId, type: "loading", content: { text: "Menganalisis..." } }]);

    try {
      const res = await fetch(`/api/projects/${project.id}/validate-design`, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Gagal validasi");
      const data = await res.json();
      
      setMessages(prev => prev.filter(m => m.id !== loadingId));
      toast.success("Desain divalidasi!");
      await onRefresh();
    } catch (err) {
      setMessages(prev => prev.filter(m => m.id !== loadingId));
      toast.error("Gagal validasi");
    } finally {
      setIsAnyLoading(false);
    }
  };

  const handleGenerate = async (type: "moodboard" | "concept") => {
    setIsAnyLoading(true);
    const loadingId = `loading-${Date.now()}`;
    setMessages(prev => [...prev, { id: loadingId, type: "loading", content: { text: `Generating ${type}...` } }]);

    try {
      const res = await fetch(`/api/projects/${project.id}/generate-image`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageType: type }),
      });
      if (!res.ok) throw new Error("Gagal generate");
      
      setMessages(prev => prev.filter(m => m.id !== loadingId));
      toast.success(`${type} berhasil dibuat!`);
      await onRefresh();
    } catch (err) {
      setMessages(prev => prev.filter(m => m.id !== loadingId));
      toast.error("Gagal generate");
    } finally {
      setIsAnyLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 top-[56px] bg-[#FAFBFD] flex overflow-hidden font-sans">
      {/* LEFT SIDEBAR: Analysis Navigation */}
      <aside className={`bg-white border-r border-slate-200/60 flex flex-col transition-all duration-300 z-30 shadow-[4px_0_24px_rgba(0,0,0,0.02)] ${isSidebarOpen ? "w-72" : "w-0 -translate-x-full"}`}>
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <span className="font-extrabold text-slate-900 tracking-tighter text-sm flex items-center gap-2">
            <div className="bg-blue-600 rounded-lg p-1.5 shadow-lg shadow-blue-200">
              <LayoutDashboard className="h-3.5 w-3.5 text-white" />
            </div>
            STRATEGY WORKSPACE
          </span>
          <Button variant="ghost" size="icon" className="h-8 w-8 lg:hidden text-slate-400 hover:text-slate-900" onClick={() => setIsSidebarOpen(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <nav className="flex-1 overflow-y-auto p-3 space-y-1.5 custom-scrollbar">
          <div className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-1">Foundations</div>
          <SidebarItem 
            icon={<Sparkles className="h-4 w-4" />} 
            label="Dashboard Overview" 
            active={activeSection === "overview"} 
            onClick={() => setActiveSection("overview")} 
          />
          
          <div className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-6 mb-1">Visual & Brand</div>
          <SidebarItem 
            icon={<Palette className="h-4 w-4" />} 
            label="Visual Studio" 
            active={activeSection === "visual"} 
            onClick={() => setActiveSection("visual")} 
          />
          <SidebarItem 
            icon={<Layout className="h-4 w-4" />} 
            label="Website Blueprint" 
            active={activeSection === "website"} 
            onClick={() => setActiveSection("website")} 
          />
          <SidebarItem 
            icon={<Layers className="h-4 w-4" />} 
            label="UX Strategy" 
            active={activeSection === "ux"} 
            onClick={() => setActiveSection("ux")} 
          />
          
          <div className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-6 mb-1">Execution</div>
          <SidebarItem 
            icon={<CheckCircle2 className="h-4 w-4" />} 
            label="Core Features" 
            active={activeSection === "features"} 
            onClick={() => setActiveSection("features")} 
          />
          <SidebarItem 
            icon={<Zap className="h-4 w-4" />} 
            label="Technical Scope" 
            active={activeSection === "complexity"} 
            onClick={() => setActiveSection("complexity")} 
          />
          <SidebarItem 
            icon={<Info className="h-4 w-4" />} 
            label="AI Builder Prompt" 
            active={activeSection === "builder"} 
            onClick={() => setActiveSection("builder")} 
          />
        </nav>

        <div className="p-5 border-t border-slate-100 bg-slate-50/30">
          <div className="bg-white p-3 rounded-2xl border border-slate-200/60 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-black shadow-lg shadow-blue-100">
                {project.businessType?.[0] || "P"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-black text-slate-900 truncate tracking-tight">{project.businessType}</p>
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">v1.0.2 Draft</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* CENTER: Infinite-style Canvas */}
      <main className="flex-1 relative overflow-hidden flex flex-col">
        {/* Canvas Background Grid */}
        <div className="absolute inset-0 z-0 opacity-[0.04] pointer-events-none" 
          style={{ backgroundImage: "radial-gradient(#2563eb 0.5px, transparent 0)", backgroundSize: "32px 32px" }} 
        />

        {/* Toolbar */}
        <header className="h-16 border-b border-slate-200/60 bg-white/40 backdrop-blur-xl flex items-center justify-between px-8 z-20">
          <div className="flex items-center gap-5">
            {!isSidebarOpen && (
              <Button variant="ghost" size="icon" className="hover:bg-blue-50 text-blue-600" onClick={() => setIsSidebarOpen(true)}>
                <Menu className="h-5 w-5" />
              </Button>
            )}
            <div className="flex items-center gap-2 text-slate-400">
              <span className="text-[11px] font-bold uppercase tracking-widest opacity-50">Projects</span>
              <ChevronRight className="h-3 w-3" />
              <span className="text-[11px] font-bold uppercase tracking-widest text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">{activeSection}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2 mr-4">
              {[1,2].map(i => (
                <div key={i} className="h-7 w-7 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-500 ring-1 ring-slate-100">AI</div>
              ))}
              <div className="h-7 w-7 rounded-full border-2 border-white bg-blue-100 flex items-center justify-center text-[10px] font-bold text-blue-600 ring-1 ring-slate-100">ST</div>
            </div>
            <Button variant="outline" size="sm" className="h-9 px-4 text-xs font-bold rounded-xl bg-white border-slate-200 hover:bg-slate-50 shadow-sm transition-all">
              <Download className="h-3.5 w-3.5 mr-2 opacity-50" />
              Export Brief
            </Button>
            <Button size="sm" className="h-9 px-5 text-xs font-bold rounded-xl shadow-lg shadow-blue-200 bg-blue-600 hover:bg-blue-700 transition-all">
              Share Workspace
            </Button>
          </div>
        </header>

        {/* Scrollable Canvas Content */}
        <div className="flex-1 overflow-auto p-12 relative z-0 scroll-smooth custom-scrollbar bg-transparent">
          <div className="max-w-6xl mx-auto pb-48">
            <div className="mb-12">
              <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2 flex items-center gap-3">
                {activeSection === "overview" ? "Strategic Foundation" : 
                 activeSection === "visual" ? "Visual Language & Identity" :
                 activeSection === "website" ? "Website Architecture" :
                 activeSection === "ux" ? "User Experience Strategy" :
                 activeSection === "features" ? "Product Requirements" :
                 activeSection === "complexity" ? "Technical Feasibility" : "AI Execution Prompt"}
                <Badge className="bg-blue-100 text-blue-600 border-none px-2 py-0 text-[10px] font-black tracking-tighter uppercase">Verified</Badge>
              </h1>
              <p className="text-slate-500 text-sm max-w-2xl font-medium leading-relaxed">
                {activeSection === "overview" ? "Comprehensive strategy generated from your project brief and discovery questions." : 
                 "In-depth analysis focused on " + activeSection + " to ensure project success and alignment."}
              </p>
            </div>

            {activeSection === "visual" && <VisualDirectionCard visual={analysis.visualDirection} />}
            {activeSection === "website" && <WebsiteDirectionCard direction={analysis.websiteDirection} />}
            {activeSection === "ux" && <UxReasoningCard reasoning={analysis.uxReasoning} />}
            {activeSection === "features" && <FeatureScopeTable features={analysis.featureScope} />}
            {activeSection === "complexity" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ComplexityCard 
                  complexity={analysis.complexity} 
                  reason={analysis.complexityReason} 
                  estimate={analysis.effortEstimate} 
                />
                <RiskFactorCard risks={analysis.riskFactors} />
              </div>
            )}
            {activeSection === "builder" && (
              <BuilderPromptCard 
                projectId={project.id} 
                existingPrompt={analysis.builderPrompt} 
                existingTool={analysis.builderTargetTool} 
              />
            )}

            {/* Visual Assets Gallery (Always visible at bottom or in specific view) */}
            {(messages.some(m => m.type === "ai-image" || m.type === "user-image")) && (
              <div className="pt-12 mt-12 border-t border-slate-200">
                <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <Layout className="h-5 w-5 text-purple-500" />
                  Visual Exploration Assets
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {messages.filter(m => m.type === "ai-image" || m.type === "user-image").map((msg, i) => (
                    <div key={i} className="group relative bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                      <div className="aspect-video relative overflow-hidden bg-slate-100">
                        <img src={msg.content.imageUrl} alt="Asset" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full" onClick={() => window.open(msg.content.imageUrl, "_blank")}>
                            <Maximize2 className="h-4 w-4" />
                          </Button>
                          <a href={msg.content.imageUrl} download className="h-8 w-8 bg-white text-slate-900 rounded-full flex items-center justify-center hover:bg-slate-100 transition-colors">
                            <Download className="h-4 w-4" />
                          </a>
                        </div>
                      </div>
                      <div className="p-3 flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                          {msg.type === "user-image" ? "Uploaded Design" : msg.content.imageType}
                        </span>
                        <Badge variant="outline" className="text-[9px] font-medium border-slate-100 bg-slate-50">
                          {new Date(msg.timestamp).toLocaleDateString()}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* BOTTOM FLOATING ACTION BAR: Chat/Studio */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-full max-w-2xl px-6 z-20">
          <div className="bg-white/80 backdrop-blur-xl border border-white shadow-[0_8px_32px_rgba(0,0,0,0.12)] rounded-full p-2 flex items-center gap-2">
            <input 
              ref={fileInputRef} 
              type="file" 
              accept="image/png,image/jpeg" 
              onChange={handleFileSelected} 
              className="hidden" 
            />
            <Button 
              onClick={handleAttachImage} 
              variant="ghost" 
              size="icon" 
              className="rounded-full h-10 w-10 text-slate-500 hover:text-blue-600 hover:bg-blue-50"
              disabled={isAnyLoading}
            >
              <Paperclip className="h-5 w-5" />
            </Button>
            
            <div className="flex-1 px-4 py-2 text-sm text-slate-400 font-medium">
              {isAnyLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>AI is working...</span>
                </div>
              ) : (
                "Upload a design for validation or explore visual concepts..."
              )}
            </div>

            <div className="flex items-center gap-1">
              <Button 
                onClick={() => handleGenerate("moodboard")} 
                variant="ghost" 
                size="sm" 
                className="rounded-full text-xs font-bold text-slate-600 hover:text-purple-600 hover:bg-purple-50"
                disabled={isAnyLoading}
              >
                Moodboard
              </Button>
              <Button 
                onClick={() => handleGenerate("concept")} 
                className="rounded-full text-xs font-bold bg-slate-900 hover:bg-black text-white px-4 h-9 shadow-lg"
                disabled={isAnyLoading}
              >
                <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                Generate Concept
              </Button>
            </div>
          </div>
        </div>
      </main>

      {/* RIGHT SIDEBAR: Project Details & Insights */}
      <aside className="w-80 bg-white border-l border-slate-200 hidden xl:flex flex-col overflow-hidden">
        <div className="p-4 border-b border-slate-100 font-bold text-slate-900 tracking-tight text-xs uppercase flex items-center gap-2">
          <Info className="h-4 w-4 text-slate-400" />
          Project Insights
        </div>
        
        <div className="flex-1 overflow-y-auto p-5 space-y-8">
          {/* Project Summary */}
          <div>
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Brief Summary</h4>
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
              <p className="text-xs text-slate-700 leading-relaxed italic">
                "{project.clientRequest.substring(0, 150)}..."
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                <Badge variant="outline" className="bg-white border-slate-200 text-[9px]">{project.targetUser}</Badge>
                <Badge variant="outline" className="bg-white border-slate-200 text-[9px]">{project.budget}</Badge>
              </div>
            </div>
          </div>

          {/* AI Validation Insights (Latest) */}
          {messages.filter(m => m.type === "ai-validation").length > 0 && (
            <div>
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Latest AI Feedback</h4>
              {messages.filter(m => m.type === "ai-validation").slice(-1).map((msg, i) => (
                <div key={i} className="space-y-4">
                  <div className="flex items-center gap-3 bg-emerald-50 rounded-2xl p-3 border border-emerald-100">
                    <div className="h-10 w-10 bg-emerald-500 text-white rounded-xl flex items-center justify-center font-bold text-lg">
                      {msg.content.feedback.alignmentScore}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-emerald-900">Alignment Score</p>
                      <p className="text-[10px] text-emerald-700 opacity-70">Design to Brief Match</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold text-slate-500 flex items-center gap-1 uppercase">
                      <AlertTriangle className="h-3 w-3 text-amber-500" />
                      Critical Issues
                    </p>
                    {msg.content.feedback.issues?.filter((iss: any) => iss.priority === "high").slice(0, 3).map((issue: any, idx: number) => (
                      <div key={idx} className="p-3 bg-white border border-slate-100 rounded-xl shadow-sm">
                        <p className="text-xs font-bold text-slate-800 mb-1">{issue.issue}</p>
                        <p className="text-[10px] text-slate-500 leading-tight">{issue.suggestion}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Complexity Indicator */}
          <div className="pt-6 border-t border-slate-100">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Technical Feasibility</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] font-medium text-slate-500">Complexity</span>
                <span className="text-[10px] font-bold text-slate-900 capitalize">{analysis.complexity}</span>
              </div>
              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className={`h-full transition-all duration-1000 ${
                  analysis.complexity === "low" ? "bg-emerald-400 w-1/3" :
                  analysis.complexity === "medium" ? "bg-amber-400 w-2/3" :
                  "bg-red-400 w-full"
                }`} />
              </div>
              <p className="text-[10px] text-slate-400 leading-tight">
                Estimated effort: <span className="text-slate-700 font-bold">{analysis.effortEstimate.min} - {analysis.effortEstimate.max} Hours</span>
              </p>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}

function SidebarItem({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active?: boolean, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
        active 
          ? "bg-blue-50 text-blue-700 shadow-sm" 
          : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
      }`}
    >
      <span className={`${active ? "text-blue-600" : "text-slate-400"}`}>
        {icon}
      </span>
      {label}
      {active && <ChevronRight className="ml-auto h-3 w-3 opacity-50" />}
    </button>
  );
}
