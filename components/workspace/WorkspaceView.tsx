"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import {
  ReactFlow, Background, Controls, MiniMap,
  useNodesState, useEdgesState, useReactFlow, ReactFlowProvider,
  type Node, type NodeTypes, type NodeProps,
} from "@xyflow/react";
import {
  Paperclip, Loader2, ChevronDown, Image as ImageIcon, Sparkles,
  CheckCircle2, AlertTriangle, XCircle, MousePointerClick, GripVertical, Wrench,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { WebsiteDirectionCard } from "../WebsiteDirectionCard";
import { UxReasoningCard } from "../UxReasoningCard";
import { VisualDirectionCard } from "../VisualDirectionCard";
import { FeatureScopeTable } from "../FeatureScopeTable";
import { ComplexityCard } from "../ComplexityCard";
import { RiskFactorCard } from "../RiskFactorCard";
import { BuilderPromptCard } from "../BuilderPromptCard";

const MAX_IMAGES = 50;

interface WorkspaceViewProps { project: any; onRefresh: () => Promise<void>; }
interface ImageNodeData { imageUrl: string; label: string; imageType: string; validationId?: string; feedback?: any; isPending?: boolean; [key: string]: unknown; }
type ImageFlowNode = Node<ImageNodeData, "imageNode">;

function ImageNode({ data, selected }: NodeProps<ImageFlowNode>) {
  const isUpload = data.imageType === "upload";
  const showLabel = !isUpload || data.isPending;
  
  return (
    <div className={`group relative rounded-xl overflow-hidden shadow-lg border-2 transition-all duration-200 bg-[#141414] ${
      selected ? "border-violet-500 ring-4 ring-violet-500/20 shadow-violet-500/10"
      : data.isPending ? "border-dashed border-amber-500/50 hover:border-amber-400"
      : "border-white/[0.06] hover:border-white/[0.12] hover:shadow-xl"
    }`} style={{ width: 480 }}>
      <img src={data.imageUrl} alt={data.label} className="w-full h-auto block" draggable={false} loading="eager"
        style={{ imageRendering: "auto", maxHeight: 800, objectFit: "contain" }} />
      
      {showLabel && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="text-[10px] font-bold text-white uppercase tracking-wider">{data.label}</span>
          {data.isPending && <span className="text-[9px] bg-amber-500 text-black px-1.5 py-0.5 rounded font-bold">Belum Divalidasi</span>}
        </div>
      )}

      {data.feedback && (
        <div className="absolute top-3 right-3">
          <div className="h-8 w-8 rounded-full bg-emerald-500/90 backdrop-blur-sm text-white flex items-center justify-center text-[11px] font-bold shadow-lg border border-white/20">
            {data.feedback.alignmentScore ?? "✓"}
          </div>
        </div>
      )}
    </div>
  );
}

const nodeTypes: NodeTypes = { imageNode: ImageNode };

function ResizeDivider({ onMouseDown }: { onMouseDown: (e: React.MouseEvent) => void }) {
  return (
    <div className="w-1 bg-white/[0.04] hover:bg-violet-500/30 active:bg-violet-500/50 cursor-col-resize flex items-center justify-center transition-colors duration-150 shrink-0 group relative" onMouseDown={onMouseDown}>
      <div className="absolute inset-y-0 -left-1 -right-1 z-10" />
      <GripVertical className="h-4 w-4 text-neutral-700 group-hover:text-violet-400 transition-colors" />
    </div>
  );
}

function WorkspaceInner({ project, onRefresh }: WorkspaceViewProps) {
  const analysis = project.analysis;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { screenToFlowPosition } = useReactFlow();
  const pendingFiles = useRef<Map<string, File>>(new Map());
  const STORAGE_KEY = `canvas-positions-${project.id}`;
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [leftPct, setLeftPct] = useState(25);
  const [rightPct, setRightPct] = useState(25);
  const [isResizingLeft, setIsResizingLeft] = useState(false);
  const [isResizingRight, setIsResizingRight] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [isAnyLoading, setIsAnyLoading] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState<ImageFlowNode>([]);
  const [edges, , onEdgesChange] = useEdgesState([]);

  const totalImageCount = useMemo(() => {
    const dbCount = (project.generatedImages?.length || 0) + (project.designValidations?.length || 0);
    const pendingCount = pendingFiles.current.size;
    return dbCount + pendingCount;
  }, [project, nodes]);

  useEffect(() => {
    if (!project) return;
    const dbLayout = (project.canvasLayout as Record<string, {x:number,y:number}>) ?? {};
    const localLayout: Record<string, {x:number,y:number}> = (() => { try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}"); } catch { return {}; } })();
    
    setNodes(curr => {
      const saved = { ...localLayout, ...dbLayout };
      // Preserve current positions from state for nodes already on canvas
      const currentPosMap: Record<string, {x:number,y:number}> = {};
      curr.forEach(n => { currentPosMap[n.id] = n.position; });
      
      const newNodes: ImageFlowNode[] = [];
      let col = 0, row = 0;
      const spacing = { x: 520, y: 420 }, cols = 2;

      const processNode = (id: string, type: string, data: any) => {
        // Priority: 1. Current state position, 2. Saved layout position, 3. Calculated grid
        const position = currentPosMap[id] || saved[id] || { x: col * spacing.x + 40, y: row * spacing.y + 40 };
        newNodes.push({ id, type: "imageNode", position, data });
        if (!currentPosMap[id] && !saved[id]) {
          col++; if (col >= cols) { col = 0; row++; }
        }
      };

      if (project.generatedImages) {
        for (const img of project.generatedImages) {
          processNode(`img-${img.id}`, "imageNode", { 
            imageUrl: img.imageUrl, 
            label: img.imageType === "moodboard" ? "Moodboard" : img.imageType === "fixed" ? "Fixed UI" : "Concept", 
            imageType: img.imageType 
          });
        }
      }
      if (project.designValidations) {
        for (const v of project.designValidations) {
          processNode(`val-${v.id}`, "imageNode", { 
            imageUrl: v.imageUrl, 
            label: "Uploaded Design", 
            imageType: "upload", 
            validationId: v.id, 
            feedback: v.feedback,
            isPending: !v.feedback // Mark as pending if no feedback yet
          });
        }
      }
      return newNodes;
    });
  }, [project, setNodes, STORAGE_KEY]);

  const onNodesChangeWithSave = useCallback((changes: any) => {
    onNodesChange(changes);
    setTimeout(() => {
      setNodes(curr => {
        const positions: Record<string, {x:number,y:number}> = {};
        curr.forEach(n => { positions[n.id] = n.position; });
        localStorage.setItem(STORAGE_KEY, JSON.stringify(positions));
        if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
        saveTimerRef.current = setTimeout(async () => {
          try { await fetch(`/api/projects/${project.id}/canvas-layout`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ canvasLayout: positions }) }); } catch {}
        }, 1500);
        return curr;
      });
    }, 100);
  }, [onNodesChange, setNodes, STORAGE_KEY, project.id]);

  useEffect(() => {
    const handler = async (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "c" && selectedNodeId) {
        const node = nodes.find(n => n.id === selectedNodeId);
        if (node?.data?.imageUrl) { 
          try {
            const response = await fetch(node.data.imageUrl);
            const blob = await response.blob();
            await navigator.clipboard.write([
              new ClipboardItem({ [blob.type]: blob })
            ]);
            toast.success("Gambar berhasil disalin ke clipboard!");
          } catch (err) {
            // Fallback to URL if blob copy fails
            navigator.clipboard.writeText(node.data.imageUrl);
            toast.success("URL gambar disalin!");
          }
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [selectedNodeId, nodes]);

  const selectedNode = useMemo(() => { if (!selectedNodeId) return null; return nodes.find(n => n.id === selectedNodeId) ?? null; }, [selectedNodeId, nodes]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const totalW = rect.width;
      if (isResizingLeft) setLeftPct(Math.min(40, Math.max(15, ((e.clientX - rect.left) / totalW) * 100)));
      if (isResizingRight) setRightPct(Math.min(40, Math.max(15, ((rect.right - e.clientX) / totalW) * 100)));
    };
    const handleMouseUp = () => { setIsResizingLeft(false); setIsResizingRight(false); };
    if (isResizingLeft || isResizingRight) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "col-resize"; document.body.style.userSelect = "none";
    }
    return () => { document.removeEventListener("mousemove", handleMouseMove); document.removeEventListener("mouseup", handleMouseUp); document.body.style.cursor = ""; document.body.style.userSelect = ""; };
  }, [isResizingLeft, isResizingRight]);

  const handleAttachImage = () => {
    if (totalImageCount >= MAX_IMAGES) { toast.error(`Maksimum ${MAX_IMAGES} gambar per project.`); return; }
    fileInputRef.current?.click();
  };

  const addPreviewNode = useCallback(async (file: File, position?: {x:number,y:number}) => {
    if (totalImageCount >= MAX_IMAGES) { toast.error(`Maksimum ${MAX_IMAGES} gambar per project.`); return; }
    
    const previewUrl = URL.createObjectURL(file);
    const tempId = `temp-${Date.now()}`;
    const pos = position ?? { x: 100 + nodes.length * 40, y: 100 + nodes.length * 40 };
    
    // Add temporary loading node
    setNodes(prev => [...prev, { 
      id: tempId, 
      type: "imageNode", 
      position: pos, 
      data: { imageUrl: previewUrl, label: "Uploading...", imageType: "upload", isPending: true, isUploading: true } 
    }]);

    try {
      const formData = new FormData();
      formData.append("image", file);
      const res = await fetch(`/api/projects/${project.id}/upload-design`, { method: "POST", body: formData });
      if (!res.ok) throw new Error("Upload failed");
      
      const result = await res.json();
      // Update local storage layout for the new real ID
      const layout = (() => { try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}"); } catch { return {}; } })();
      layout[`val-${result.id}`] = pos;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(layout));

      toast.success(`"${file.name}" berhasil di-upload.`);
      await onRefresh();
    } catch (err) {
      toast.error("Gagal mengupload gambar.");
      setNodes(prev => prev.filter(n => n.id !== tempId));
    }
  }, [nodes.length, setNodes, totalImageCount, project.id, onRefresh, STORAGE_KEY]);

  const onDragOver = useCallback((e: React.DragEvent) => { e.preventDefault(); e.dataTransfer.dropEffect = "copy"; }, []);
  const onDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith("image/"));
    if (files.length === 0) return;
    for (const file of files) { const pos = screenToFlowPosition({ x: e.clientX, y: e.clientY }); addPreviewNode(file, pos); }
  }, [screenToFlowPosition, addPreviewNode]);

  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    addPreviewNode(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleGenerate = async (type: "moodboard" | "concept" | "fixed", valId?: string) => {
    setIsAnyLoading(true);
    try {
      const res = await fetch(`/api/projects/${project.id}/generate-image`, { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageType: type, validationId: valId, userRequest: chatInput.trim() }) });
      if (!res.ok) throw new Error("Gagal generate");
      const label = type === "moodboard" ? "Moodboard" : type === "fixed" ? "Fixed UI" : "Concept";
      toast.success(`${label} berhasil dibuat!`);
      setChatInput(""); await onRefresh();
    } catch { toast.error("Gagal generate gambar"); } finally { setIsAnyLoading(false); }
  };

  const handleValidateSelected = async () => {
    if (!selectedNode?.data?.imageUrl) return;
    if (selectedNode.data.isUploading) { toast.error("Tunggu upload selesai"); return; }
    
    setIsAnyLoading(true);
    try {
      const formData = new FormData();
      
      // If it has a validationId, it's already in the DB, so we just trigger validation on it
      // Otherwise it's a fallback (shouldn't happen with new logic but good for safety)
      if (selectedNode.data.validationId) {
        formData.append("validationId", selectedNode.data.validationId as string);
      } else {
        const imgRes = await fetch(selectedNode.data.imageUrl); 
        const blob = await imgRes.blob(); 
        formData.append("image", blob, "design.png");
      }
      
      if (chatInput.trim()) formData.append("userRequest", chatInput.trim());
      
      const res = await fetch(`/api/projects/${project.id}/validate-design`, { method: "POST", body: formData });
      if (!res.ok) throw new Error("Gagal validasi");
      
      toast.success("Desain berhasil divalidasi!"); 
      setChatInput(""); 
      await onRefresh();
    } catch { 
      toast.error("Gagal validasi desain"); 
    } finally { 
      setIsAnyLoading(false); 
    }
  };

  const onNodeClick = useCallback((_: React.MouseEvent, node: ImageFlowNode) => { setSelectedNodeId(node.id); }, []);
  const onPaneClick = useCallback(() => { setSelectedNodeId(null); }, []);

  return (
    <div ref={containerRef} className="w-full flex" style={{ height: "calc(100vh - 56px)" }}>
      {/* LEFT PANEL */}
      <div className="shrink-0 overflow-y-auto bg-[#111111] border-r border-white/[0.04] custom-scrollbar" style={{ width: `${leftPct}%` }}>
        <div className="p-4 space-y-4">
          {analysis.designDirection && <WebsiteDirectionCard direction={analysis.designDirection} />}
          {analysis.websiteDirection && !analysis.designDirection && <WebsiteDirectionCard direction={analysis.websiteDirection} />}
          {analysis.uxReasoning && <UxReasoningCard reasoning={analysis.uxReasoning} />}
          {analysis.visualDirection && (
            <VisualDirectionCard 
              visual={analysis.visualDirection} 
              onPaletteChange={async (newPalette) => {
                try {
                  const updatedVisual = { ...analysis.visualDirection, palette: newPalette };
                  const res = await fetch(`/api/projects/${project.id}/analysis`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ visualDirection: updatedVisual }),
                  });
                  if (!res.ok) throw new Error("Failed to save");
                  toast.success("Palette warna diperbarui!");
                  await onRefresh();
                } catch {
                  toast.error("Gagal menyimpan palette warna.");
                }
              }}
            />
          )}
          {analysis.featureScope && <FeatureScopeTable features={analysis.featureScope} />}
          {analysis.complexity && <ComplexityCard complexity={analysis.complexity} reason={analysis.complexityReason} estimate={analysis.effortEstimate} />}
          {analysis.riskFactors && <RiskFactorCard risks={analysis.riskFactors} />}
          <BuilderPromptCard projectId={project.id} existingPrompt={analysis.builderPrompt} existingTool={analysis.builderTargetTool} />
        </div>
      </div>

      <ResizeDivider onMouseDown={() => setIsResizingLeft(true)} />

      {/* CENTER: Canvas */}
      <div className="flex-1 flex flex-col min-w-0 relative bg-[#0a0a0a]">
        <div className="flex-1 relative">
          <ReactFlow nodes={nodes} edges={edges} onNodesChange={onNodesChangeWithSave} onEdgesChange={onEdgesChange}
            onNodeClick={onNodeClick} onPaneClick={onPaneClick} nodeTypes={nodeTypes} onDragOver={onDragOver} onDrop={onDrop}
            fitView={nodes.length === 0} fitViewOptions={{ padding: 0.3 }} minZoom={0.1} maxZoom={3} proOptions={{ hideAttribution: true }}>
            <Background color="#333333" gap={24} size={1.2} />
            <Controls className="!shadow-lg !border-white/[0.06] !rounded-xl overflow-hidden !bg-[#141414]" showInteractive={false} />
            <MiniMap className="!shadow-lg !border-white/[0.06] !rounded-xl !bg-[#141414]/90" maskColor="rgba(167,139,250,0.08)" nodeColor="#a78bfa" style={{ width: 120, height: 80 }} />
          </ReactFlow>
          {nodes.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <div className="h-16 w-16 rounded-2xl bg-[#1a1a1a] border border-white/[0.06] flex items-center justify-center mx-auto mb-4">
                  <ImageIcon className="h-8 w-8 text-neutral-700" />
                </div>
                <p className="text-sm font-medium text-neutral-500">Belum ada gambar di canvas</p>
                <p className="text-xs text-neutral-700 mt-1">Upload desain atau generate moodboard/concept</p>
              </div>
            </div>
          )}
        </div>

        {/* BOTTOM BAR */}
        <div className="border-t border-white/[0.04] glass px-4 py-3 flex items-center gap-2">
          <input ref={fileInputRef} type="file" accept="image/png,image/jpeg" onChange={handleFileSelected} className="hidden" multiple />
          <Button onClick={handleAttachImage} variant="ghost" size="icon" className="h-9 w-9 rounded-lg text-neutral-500 hover:text-violet-400 hover:bg-violet-500/10 shrink-0" disabled={isAnyLoading}>
            <Paperclip className="h-4 w-4" />
          </Button>
          <input type="text" className="flex-1 px-3 py-2 text-sm text-neutral-200 bg-[#1a1a1a] rounded-lg border border-white/[0.06] outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500/30 transition-all placeholder:text-neutral-600"
            placeholder="Ketik request spesifik..." value={chatInput} onChange={e => setChatInput(e.target.value)} disabled={isAnyLoading} />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 px-3 text-xs font-semibold rounded-lg border-white/[0.06] bg-transparent text-neutral-300 hover:bg-white/[0.04] gap-1.5 shrink-0" disabled={isAnyLoading}>
                <Sparkles className="h-3.5 w-3.5 text-violet-400" /> Generate <ChevronDown className="h-3 w-3 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44 bg-[#1a1a1a] border-white/[0.08]">
              <DropdownMenuItem onClick={() => handleGenerate("moodboard")} className="cursor-pointer text-neutral-300 focus:bg-white/[0.04] focus:text-neutral-100">
                <ImageIcon className="h-4 w-4 text-violet-400 mr-2" /> Moodboard
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleGenerate("concept")} className="cursor-pointer text-neutral-300 focus:bg-white/[0.04] focus:text-neutral-100">
                <Sparkles className="h-4 w-4 text-blue-400 mr-2" /> Concept
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button size="sm" className="h-9 px-4 text-xs font-semibold rounded-lg bg-violet-600 hover:bg-violet-700 text-white shrink-0"
            disabled={isAnyLoading || !selectedNode} onClick={handleValidateSelected}>
            <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" /> Validasi
          </Button>
        </div>
      </div>

      <ResizeDivider onMouseDown={() => setIsResizingRight(true)} />

      {/* RIGHT PANEL */}
      <div className="shrink-0 overflow-y-auto bg-[#111111] border-l border-white/[0.04] custom-scrollbar" style={{ width: `${rightPct}%` }}>
        <div className="p-4">
          {!selectedNode ? (
            <div className="min-h-[calc(100vh-8rem)] flex flex-col items-center justify-center text-center">
              <div className="h-14 w-14 rounded-2xl bg-[#1a1a1a] border border-white/[0.06] flex items-center justify-center mx-auto mb-4">
                <MousePointerClick className="h-7 w-7 text-neutral-700" />
              </div>
              <p className="text-sm font-medium text-neutral-500">Pilih gambar di canvas</p>
              <p className="text-xs text-neutral-700 mt-1">Klik gambar untuk melihat hasil validasi</p>
            </div>
          ) : !selectedNode.data.feedback ? (
            <div className="text-center py-12">
              <div className="h-14 w-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="h-7 w-7 text-amber-400" />
              </div>
              <p className="text-sm font-semibold text-neutral-300 mb-1">Belum divalidasi</p>
              <p className="text-xs text-neutral-600 mb-5 max-w-[200px] mx-auto">Validasi untuk mendapatkan feedback AI.</p>
              <Button size="sm" className="rounded-lg bg-violet-600 hover:bg-violet-700 text-white px-5" onClick={handleValidateSelected} disabled={isAnyLoading}>
                {isAnyLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle2 className="h-4 w-4 mr-2" />} Validasi Sekarang
              </Button>
            </div>
          ) : (
            <ValidationFeedbackPanel feedback={selectedNode.data.feedback} validationId={selectedNode.data.validationId as string}
              isGenerating={isAnyLoading} onGenerateFixedUI={(valId) => handleGenerate("fixed", valId)} />
          )}
        </div>
      </div>
    </div>
  );
}

export function WorkspaceView(props: WorkspaceViewProps) {
  return <ReactFlowProvider><WorkspaceInner {...props} /></ReactFlowProvider>;
}

function ValidationFeedbackPanel({ feedback, validationId, onGenerateFixedUI, isGenerating }: { feedback: any; validationId?: string; onGenerateFixedUI: (id: string) => void; isGenerating: boolean; }) {
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 bg-[#141414] p-4 rounded-xl border border-white/[0.06]">
        <div className={`h-14 w-14 rounded-xl flex items-center justify-center text-xl font-bold text-white shadow-lg ${
          (feedback.alignmentScore ?? 0) >= 7 ? "bg-emerald-500" : (feedback.alignmentScore ?? 0) >= 4 ? "bg-amber-500" : "bg-rose-500"
        }`}>{feedback.alignmentScore ?? "?"}</div>
        <div>
          <p className="text-sm font-bold text-neutral-200">Alignment Score</p>
          <p className="text-[11px] text-neutral-600">Kesesuaian desain dengan brief</p>
        </div>
      </div>

      {feedback.strengths?.length > 0 && (
        <div>
          <h4 className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> Strengths
          </h4>
          <div className="space-y-2">
            {feedback.strengths.map((s: any, i: number) => (
              <div key={i} className="text-xs text-neutral-400 bg-emerald-500/5 border border-emerald-500/10 rounded-lg p-3 leading-relaxed">
                <span className="font-semibold text-emerald-400 block mb-1">{typeof s === "string" ? s : s.point}</span>
                {typeof s === "object" && s.explanation && <span className="opacity-80">{s.explanation}</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {feedback.issues?.length > 0 && (
        <div>
          <h4 className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <AlertTriangle className="h-3.5 w-3.5 text-amber-400" /> Issues
          </h4>
          <div className="space-y-2">
            {feedback.issues.map((issue: any, i: number) => (
              <div key={i} className="bg-[#141414] border border-white/[0.06] rounded-lg p-3">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <p className="text-xs font-semibold text-neutral-300">{issue.issue}</p>
                  <Badge className={`shrink-0 text-[9px] uppercase shadow-none border-0 ${
                    issue.priority === "high" ? "bg-rose-500/10 text-rose-400" : issue.priority === "medium" ? "bg-amber-500/10 text-amber-400" : "bg-neutral-800 text-neutral-500"
                  }`}>{issue.priority}</Badge>
                </div>
                {issue.suggestion && <p className="text-[11px] text-neutral-500 leading-relaxed">Saran: {issue.suggestion}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {feedback.summary && (
        <div>
          <h4 className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-2">Ringkasan</h4>
          <p className="text-xs text-neutral-400 bg-[#141414] border border-white/[0.06] rounded-lg p-3 leading-relaxed">{feedback.summary}</p>
        </div>
      )}

      {validationId && (
        <Button className="w-full mt-4 bg-violet-600 hover:bg-violet-700 text-white font-semibold shadow-lg shadow-violet-900/30"
          onClick={() => onGenerateFixedUI(validationId)} disabled={isGenerating}>
          {isGenerating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Wrench className="h-4 w-4 mr-2" />}
          Generate Fixed UI
        </Button>
      )}
    </div>
  );
}
