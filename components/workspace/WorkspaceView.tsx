"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  type Node,
  type NodeTypes,
  type NodeProps,
  Handle,
  Position,
} from "@xyflow/react";
import {
  Paperclip,
  Loader2,
  ChevronDown,
  Image as ImageIcon,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  MousePointerClick,
  GripVertical,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

import { WebsiteDirectionCard } from "../WebsiteDirectionCard";
import { UxReasoningCard } from "../UxReasoningCard";
import { VisualDirectionCard } from "../VisualDirectionCard";
import { FeatureScopeTable } from "../FeatureScopeTable";
import { ComplexityCard } from "../ComplexityCard";
import { RiskFactorCard } from "../RiskFactorCard";
import { BuilderPromptCard } from "../BuilderPromptCard";

// ─── Types ───────────────────────────────────────────────────────────────────

interface WorkspaceViewProps {
  project: any;
  onRefresh: () => Promise<void>;
}

interface ImageNodeData {
  imageUrl: string;
  label: string;
  imageType: string;
  validationId?: string;
  feedback?: any;
  [key: string]: unknown;
}

type ImageFlowNode = Node<ImageNodeData, "imageNode">;

// ─── Custom Image Node ──────────────────────────────────────────────────────

function ImageNode({ data, selected }: NodeProps<ImageFlowNode>) {
  return (
    <div
      className={`group relative rounded-xl overflow-hidden shadow-lg border-2 transition-all duration-200 bg-white ${
        selected
          ? "border-blue-500 ring-4 ring-blue-100 shadow-blue-200/50"
          : "border-slate-200 hover:border-slate-300 hover:shadow-xl"
      }`}
      style={{ maxWidth: 600, minWidth: 240 }}
    >
      <img
        src={data.imageUrl}
        alt={data.label}
        className="w-full h-auto block"
        draggable={false}
      />
      {/* Label overlay */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2.5">
        <span className="text-[10px] font-bold text-white uppercase tracking-wider">
          {data.label}
        </span>
      </div>
      {/* Validation indicator */}
      {data.feedback && (
        <div className="absolute top-2 right-2">
          <div className="h-7 w-7 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold shadow-lg">
            {data.feedback.alignmentScore ?? "✓"}
          </div>
        </div>
      )}
      {!data.feedback && data.imageType === "upload" && (
        <div className="absolute top-2 right-2">
          <div className="h-6 w-6 rounded-full bg-amber-400 text-white flex items-center justify-center shadow-lg">
            <AlertTriangle className="h-3 w-3" />
          </div>
        </div>
      )}
    </div>
  );
}

const nodeTypes: NodeTypes = {
  imageNode: ImageNode,
};

// ─── Resizable Divider ──────────────────────────────────────────────────────

function ResizeDivider({
  onMouseDown,
}: {
  onMouseDown: (e: React.MouseEvent) => void;
}) {
  return (
    <div
      className="w-1.5 bg-slate-100 hover:bg-blue-300 active:bg-blue-400 cursor-col-resize flex items-center justify-center transition-colors duration-150 shrink-0 group relative"
      onMouseDown={onMouseDown}
    >
      <div className="absolute inset-y-0 -left-1 -right-1 z-10" />
      <GripVertical className="h-4 w-4 text-slate-300 group-hover:text-blue-500 transition-colors" />
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────

export function WorkspaceView({ project, onRefresh }: WorkspaceViewProps) {
  const analysis = project.analysis;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Panel widths as percentages (of container)
  const [leftPct, setLeftPct] = useState(25);
  const [rightPct, setRightPct] = useState(25);
  const [isResizingLeft, setIsResizingLeft] = useState(false);
  const [isResizingRight, setIsResizingRight] = useState(false);

  const [chatInput, setChatInput] = useState("");
  const [isAnyLoading, setIsAnyLoading] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  // ReactFlow state
  const [nodes, setNodes, onNodesChange] = useNodesState<ImageFlowNode>([]);
  const [edges, , onEdgesChange] = useEdgesState([]);

  // Build nodes from project data
  useEffect(() => {
    if (!project) return;
    const newNodes: ImageFlowNode[] = [];
    let col = 0;
    let row = 0;
    const spacing = { x: 280, y: 220 };
    const cols = 3;

    // Generated images
    if (project.generatedImages) {
      for (const img of project.generatedImages) {
        newNodes.push({
          id: `img-${img.id}`,
          type: "imageNode",
          position: { x: col * spacing.x + 40, y: row * spacing.y + 40 },
          data: {
            imageUrl: img.imageUrl,
            label: img.imageType === "moodboard" ? "Moodboard" : "Concept",
            imageType: img.imageType,
          },
        });
        col++;
        if (col >= cols) {
          col = 0;
          row++;
        }
      }
    }

    // Uploaded images with their validations
    if (project.designValidations) {
      for (const v of project.designValidations) {
        newNodes.push({
          id: `val-${v.id}`,
          type: "imageNode",
          position: { x: col * spacing.x + 40, y: row * spacing.y + 40 },
          data: {
            imageUrl: v.imageUrl,
            label: "Uploaded Design",
            imageType: "upload",
            validationId: v.id,
            feedback: v.feedback,
          },
        });
        col++;
        if (col >= cols) {
          col = 0;
          row++;
        }
      }
    }

    setNodes(newNodes);
  }, [project, setNodes]);

  // Get selected node data for the right panel
  const selectedNode = useMemo(() => {
    if (!selectedNodeId) return null;
    return nodes.find((n) => n.id === selectedNodeId) ?? null;
  }, [selectedNodeId, nodes]);

  // ─── Panel Resize Logic ─────────────────────────────────────────

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const totalW = rect.width;

      if (isResizingLeft) {
        const newPct = Math.min(
          40,
          Math.max(15, ((e.clientX - rect.left) / totalW) * 100)
        );
        setLeftPct(newPct);
      }

      if (isResizingRight) {
        const newPct = Math.min(
          40,
          Math.max(15, ((rect.right - e.clientX) / totalW) * 100)
        );
        setRightPct(newPct);
      }
    };

    const handleMouseUp = () => {
      setIsResizingLeft(false);
      setIsResizingRight(false);
    };

    if (isResizingLeft || isResizingRight) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isResizingLeft, isResizingRight]);

  // ─── Handlers ───────────────────────────────────────────────────

  const handleAttachImage = () => fileInputRef.current?.click();

  const handleFileSelected = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);
    if (chatInput.trim()) formData.append("userRequest", chatInput.trim());

    setIsAnyLoading(true);
    try {
      const res = await fetch(
        `/api/projects/${project.id}/validate-design`,
        { method: "POST", body: formData }
      );
      if (!res.ok) throw new Error("Gagal validasi");
      toast.success("Desain divalidasi!");
      setChatInput("");
      await onRefresh();
    } catch {
      toast.error("Gagal validasi desain");
    } finally {
      setIsAnyLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleGenerate = async (type: "moodboard" | "concept", valId?: string) => {
    setIsAnyLoading(true);
    try {
      const res = await fetch(
        `/api/projects/${project.id}/generate-image`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            imageType: type, 
            validationId: valId,
            userRequest: chatInput.trim() 
          }),
        }
      );
      if (!res.ok) throw new Error("Gagal generate");
      toast.success(`${type === "moodboard" ? "Moodboard" : "Concept"} berhasil dibuat!`);
      setChatInput("");
      await onRefresh();
    } catch {
      toast.error("Gagal generate gambar");
    } finally {
      setIsAnyLoading(false);
    }
  };

  const handleValidateSelected = async () => {
    if (!selectedNode?.data?.imageUrl) return;
    setIsAnyLoading(true);
    try {
      // Fetch the image and re-validate it
      const imgRes = await fetch(selectedNode.data.imageUrl);
      const blob = await imgRes.blob();
      const formData = new FormData();
      formData.append("image", blob, "design.png");
      if (chatInput.trim()) formData.append("userRequest", chatInput.trim());

      const res = await fetch(
        `/api/projects/${project.id}/validate-design`,
        { method: "POST", body: formData }
      );
      if (!res.ok) throw new Error("Gagal validasi");
      toast.success("Desain divalidasi!");
      setChatInput("");
      await onRefresh();
    } catch {
      toast.error("Gagal validasi desain");
    } finally {
      setIsAnyLoading(false);
    }
  };

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: ImageFlowNode) => {
      setSelectedNodeId(node.id);
    },
    []
  );

  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null);
  }, []);

  // ─── Render ─────────────────────────────────────────────────────

  return (
    <div
      ref={containerRef}
      className="w-full flex"
      style={{ height: "calc(100vh - 56px)" }}
    >
      {/* ═══ LEFT PANEL: Analysis Cards ═══ */}
      <div
        className="shrink-0 overflow-y-auto bg-slate-50/80 border-r border-slate-200 custom-scrollbar"
        style={{ width: `${leftPct}%` }}
      >
        <div className="p-4 border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
          <h2 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-blue-500" />
            Analisis SRS
          </h2>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Hasil analisis dari brief klien
          </p>
        </div>
        <div className="p-4 space-y-4">
          {analysis.websiteDirection && (
            <WebsiteDirectionCard direction={analysis.websiteDirection} />
          )}
          {analysis.uxReasoning && (
            <UxReasoningCard reasoning={analysis.uxReasoning} />
          )}
          {analysis.visualDirection && (
            <VisualDirectionCard visual={analysis.visualDirection} />
          )}
          {analysis.featureScope && (
            <FeatureScopeTable features={analysis.featureScope} />
          )}
          {analysis.complexity && (
            <ComplexityCard
              complexity={analysis.complexity}
              reason={analysis.complexityReason}
              estimate={analysis.effortEstimate}
            />
          )}
          {analysis.riskFactors && (
            <RiskFactorCard risks={analysis.riskFactors} />
          )}
          <BuilderPromptCard
            projectId={project.id}
            existingPrompt={analysis.builderPrompt}
            existingTool={analysis.builderTargetTool}
          />
        </div>
      </div>

      {/* ═══ LEFT RESIZE DIVIDER ═══ */}
      <ResizeDivider onMouseDown={() => setIsResizingLeft(true)} />

      {/* ═══ CENTER PANEL: ReactFlow Canvas ═══ */}
      <div className="flex-1 flex flex-col min-w-0 relative bg-white">
        {/* Canvas */}
        <div className="flex-1 relative">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            nodeTypes={nodeTypes}
            fitView
            fitViewOptions={{ padding: 0.3 }}
            minZoom={0.2}
            maxZoom={2}
            proOptions={{ hideAttribution: true }}
          >
            <Background color="#e2e8f0" gap={24} size={1} />
            <Controls
              className="!shadow-lg !border-slate-200 !rounded-xl overflow-hidden"
              showInteractive={false}
            />
            <MiniMap
              className="!shadow-lg !border-slate-200 !rounded-xl !bg-white/90"
              maskColor="rgba(59, 130, 246, 0.08)"
              nodeColor="#3b82f6"
              style={{ width: 120, height: 80 }}
            />
          </ReactFlow>

          {/* Empty state */}
          {nodes.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <div className="h-16 w-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                  <ImageIcon className="h-8 w-8 text-slate-300" />
                </div>
                <p className="text-sm font-medium text-slate-400">
                  Belum ada gambar di canvas
                </p>
                <p className="text-xs text-slate-300 mt-1">
                  Upload desain atau generate moodboard/concept
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ═══ BOTTOM BAR ═══ */}
        <div className="border-t border-slate-200 bg-white/90 backdrop-blur-sm px-4 py-3 flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg"
            onChange={handleFileSelected}
            className="hidden"
          />

          {/* Paperclip upload */}
          <Button
            onClick={handleAttachImage}
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 shrink-0"
            disabled={isAnyLoading}
          >
            <Paperclip className="h-4 w-4" />
          </Button>

          {/* Text input */}
          <input
            type="text"
            className="flex-1 px-3 py-2 text-sm text-slate-800 bg-slate-50 rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            placeholder="Ketik request spesifik (contoh: pakai warna biru cerah)..."
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            disabled={isAnyLoading}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                // Can trigger standard generation if desired, but user relies on buttons
              }
            }}
          />

          {/* Generate dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-9 px-3 text-xs font-semibold rounded-lg border-slate-200 gap-1.5 shrink-0"
                disabled={isAnyLoading}
              >
                <Sparkles className="h-3.5 w-3.5 text-purple-500" />
                Generate
                <ChevronDown className="h-3 w-3 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem
                onClick={() => handleGenerate("moodboard")}
                className="cursor-pointer"
              >
                <ImageIcon className="h-4 w-4 text-purple-500 mr-2" />
                Moodboard
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleGenerate("concept")}
                className="cursor-pointer"
              >
                <Sparkles className="h-4 w-4 text-blue-500 mr-2" />
                Concept
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Validasi button */}
          <Button
            size="sm"
            className="h-9 px-4 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shrink-0"
            disabled={isAnyLoading || !selectedNode}
            onClick={handleValidateSelected}
          >
            <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
            Validasi
          </Button>
        </div>
      </div>

      {/* ═══ RIGHT RESIZE DIVIDER ═══ */}
      <ResizeDivider onMouseDown={() => setIsResizingRight(true)} />

      {/* ═══ RIGHT PANEL: Validation Feedback ═══ */}
      <div
        className="shrink-0 overflow-y-auto bg-slate-50/80 border-l border-slate-200 custom-scrollbar"
        style={{ width: `${rightPct}%` }}
      >
        <div className="p-4 border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
          <h2 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            Hasil Validasi
          </h2>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Feedback untuk gambar terpilih
          </p>
        </div>

        <div className="p-4">
          {!selectedNode ? (
            /* No image selected */
            <div className="text-center py-16">
              <div className="h-14 w-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                <MousePointerClick className="h-7 w-7 text-slate-300" />
              </div>
              <p className="text-sm font-medium text-slate-400">
                Pilih gambar di canvas
              </p>
              <p className="text-xs text-slate-300 mt-1">
                Klik gambar untuk melihat hasil validasi
              </p>
            </div>
          ) : !selectedNode.data.feedback ? (
            /* Selected but not validated */
            <div className="text-center py-12">
              <div className="h-14 w-14 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="h-7 w-7 text-amber-400" />
              </div>
              <p className="text-sm font-semibold text-slate-700 mb-1">
                Belum divalidasi
              </p>
              <p className="text-xs text-slate-400 mb-5 max-w-[200px] mx-auto">
                Gambar ini belum dianalisis oleh AI. Validasi sekarang untuk mendapatkan feedback.
              </p>
              <Button
                size="sm"
                className="rounded-lg bg-blue-600 hover:bg-blue-700 text-white px-5"
                onClick={handleValidateSelected}
                disabled={isAnyLoading}
              >
                {isAnyLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                )}
                Validasi Sekarang
              </Button>
            </div>
          ) : (
            /* Has validation feedback */
            <ValidationFeedbackPanel 
              feedback={selectedNode.data.feedback}
              validationId={selectedNode.data.validationId as string}
              isGenerating={isAnyLoading}
              onGenerateFromFeedback={(valId) => handleGenerate("concept", valId)}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Validation Feedback Sub-Component ──────────────────────────────────────

function ValidationFeedbackPanel({ 
  feedback, 
  validationId, 
  onGenerateFromFeedback, 
  isGenerating 
}: { 
  feedback: any;
  validationId?: string;
  onGenerateFromFeedback: (id: string) => void;
  isGenerating: boolean;
}) {
  return (
    <div className="space-y-5">
      {/* Score */}
      <div className="flex items-center gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div
          className={`h-14 w-14 rounded-xl flex items-center justify-center text-xl font-bold text-white shadow-lg ${
            (feedback.alignmentScore ?? 0) >= 7
              ? "bg-emerald-500"
              : (feedback.alignmentScore ?? 0) >= 4
              ? "bg-amber-500"
              : "bg-rose-500"
          }`}
        >
          {feedback.alignmentScore ?? "?"}
        </div>
        <div>
          <p className="text-sm font-bold text-slate-900">Alignment Score</p>
          <p className="text-[11px] text-slate-400">
            Kesesuaian desain dengan brief
          </p>
        </div>
      </div>

      {/* Strengths */}
      {feedback.strengths && feedback.strengths.length > 0 && (
        <div>
          <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
            Strengths
          </h4>
          <div className="space-y-2">
            {feedback.strengths.map((s: any, i: number) => (
              <div
                key={i}
                className="text-xs text-slate-700 bg-emerald-50 border border-emerald-100 rounded-lg p-3 leading-relaxed"
              >
                <span className="font-semibold text-emerald-900 block mb-1">
                  {typeof s === "string" ? s : s.point}
                </span>
                {typeof s === "object" && s.explanation && (
                  <span className="opacity-90">{s.explanation}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Issues */}
      {feedback.issues && feedback.issues.length > 0 && (
        <div>
          <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
            Issues
          </h4>
          <div className="space-y-2">
            {feedback.issues.map((issue: any, i: number) => (
              <div
                key={i}
                className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm"
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <p className="text-xs font-semibold text-slate-800">
                    {issue.issue}
                  </p>
                  <Badge
                    className={`shrink-0 text-[9px] uppercase shadow-none ${
                      issue.priority === "high"
                        ? "bg-rose-100 text-rose-700"
                        : issue.priority === "medium"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {issue.priority}
                  </Badge>
                </div>
                {issue.suggestion && (
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    💡 {issue.suggestion}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Summary */}
      {feedback.summary && (
        <div>
          <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
            Ringkasan
          </h4>
          <p className="text-xs text-slate-600 bg-slate-50 border border-slate-100 rounded-lg p-3 leading-relaxed">
            {feedback.summary}
          </p>
        </div>
      )}

      {/* Action Button */}
      {validationId && (
        <Button
          className="w-full mt-4 bg-purple-600 hover:bg-purple-700 text-white font-semibold shadow-sm"
          onClick={() => onGenerateFromFeedback(validationId)}
          disabled={isGenerating}
        >
          {isGenerating ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Sparkles className="h-4 w-4 mr-2" />
          )}
          Generate Concept dari Feedback
        </Button>
      )}
    </div>
  );
}
