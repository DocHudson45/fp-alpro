"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  Paperclip,
  ImagePlus,
  ChevronDown,
  Download,
  CheckCircle2,
  AlertTriangle,
  Info,
} from "lucide-react";
import { toast } from "sonner";

// --- Types ---

type MessageType =
  | "user-image"
  | "ai-validation"
  | "ai-image"
  | "loading";

interface ChatMessage {
  id: string;
  type: MessageType;
  timestamp: Date;
  content: any;
}

interface ChatPanelProps {
  projectId: string;
  existingValidations?: any[];
  existingImages?: any[];
}

// --- Component ---

export function ChatPanel({
  projectId,
  existingValidations = [],
  existingImages = [],
}: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Pre-populate with existing data on mount
  useEffect(() => {
    const existingMessages: ChatMessage[] = [];

    // Add existing validations
    for (const v of existingValidations) {
      existingMessages.push({
        id: `existing-user-${v.id}`,
        type: "user-image",
        timestamp: new Date(v.createdAt),
        content: { imageUrl: v.imageUrl },
      });
      existingMessages.push({
        id: `existing-ai-${v.id}`,
        type: "ai-validation",
        timestamp: new Date(v.createdAt),
        content: { feedback: v.feedback, validationId: v.id },
      });
    }

    // Add existing generated images
    for (const img of existingImages) {
      existingMessages.push({
        id: `existing-img-${img.id}`,
        type: "ai-image",
        timestamp: new Date(img.createdAt),
        content: {
          imageUrl: img.imageUrl,
          imageType: img.imageType,
        },
      });
    }

    // Sort by timestamp
    existingMessages.sort(
      (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
    );

    setMessages(existingMessages);
  }, [existingValidations, existingImages]);

  // Auto-scroll on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const addMessage = (msg: ChatMessage) => {
    setMessages((prev) => [...prev, msg]);
  };

  const removeMessage = (id: string) => {
    setMessages((prev) => prev.filter((m) => m.id !== id));
  };

  // --- Handlers ---

  const handleAttachImage = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate
    if (!["image/png", "image/jpeg"].includes(file.type)) {
      toast.error("Hanya file PNG dan JPEG yang didukung.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ukuran file maksimal 5MB.");
      return;
    }

    // Show user message with local preview
    const previewUrl = URL.createObjectURL(file);
    const userMsgId = `user-${Date.now()}`;
    addMessage({
      id: userMsgId,
      type: "user-image",
      timestamp: new Date(),
      content: { imageUrl: previewUrl, fileName: file.name },
    });

    // Show loading
    const loadingId = `loading-${Date.now()}`;
    addMessage({
      id: loadingId,
      type: "loading",
      timestamp: new Date(),
      content: { text: "Menganalisis desain..." },
    });

    try {
      const formData = new FormData();
      formData.append("image", file);

      const res = await fetch(`/api/projects/${projectId}/validate-design`, {
        method: "POST",
        body: formData,
      });

      removeMessage(loadingId);

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Validasi gagal");
      }

      const data = await res.json();

      addMessage({
        id: `ai-val-${Date.now()}`,
        type: "ai-validation",
        timestamp: new Date(),
        content: { feedback: data.feedback, validationId: data.id },
      });
    } catch (error: any) {
      removeMessage(loadingId);
      toast.error(error.message || "Gagal memvalidasi desain. Coba lagi.");
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleGenerateImage = async (
    imageType: "moodboard" | "concept",
    validationId?: string
  ) => {
    setIsDropdownOpen(false);

    const loadingId = `loading-${Date.now()}`;
    addMessage({
      id: loadingId,
      type: "loading",
      timestamp: new Date(),
      content: {
        text:
          imageType === "moodboard"
            ? "Membuat moodboard..."
            : "Membuat konsep desain...",
      },
    });

    try {
      const body: any = { imageType };
      if (validationId) body.validationId = validationId;

      const res = await fetch(`/api/projects/${projectId}/generate-image`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      removeMessage(loadingId);

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Gagal generate gambar");
      }

      const data = await res.json();

      addMessage({
        id: `ai-img-${Date.now()}`,
        type: "ai-image",
        timestamp: new Date(),
        content: {
          imageUrl: data.imageUrl,
          imageType,
        },
      });
    } catch (error: any) {
      removeMessage(loadingId);
      toast.error(error.message || "Gagal membuat gambar. Coba lagi.");
    }
  };

  // --- Render Helpers ---

  const renderMessage = (msg: ChatMessage) => {
    switch (msg.type) {
      case "user-image":
        return (
          <div key={msg.id} className="flex justify-end mb-4">
            <div className="max-w-[80%] bg-blue-50 border border-blue-100 rounded-2xl rounded-br-md p-3">
              <p className="text-xs text-blue-500 font-medium mb-2">
                 Desain yang diunggah
              </p>
              <img
                src={msg.content.imageUrl}
                alt="Uploaded design"
                className="rounded-lg max-h-64 w-full object-cover"
              />
            </div>
          </div>
        );

      case "ai-validation":
        return (
          <div key={msg.id} className="flex justify-start mb-4">
            <div className="max-w-[90%] bg-white border border-slate-200 rounded-2xl rounded-bl-md p-4 shadow-sm space-y-3">
              {/* Score */}
              <div className="flex items-center gap-3">
                <div className="bg-emerald-100 text-emerald-700 font-bold text-xl px-4 py-2 rounded-xl">
                  {msg.content.feedback.alignmentScore}/10
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    Skor Alignment
                  </p>
                  <p className="text-xs text-slate-500">
                    Kesesuaian desain dengan brief
                  </p>
                </div>
              </div>

              {/* Strengths */}
              {msg.content.feedback.strengths?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Kelebihan
                  </p>
                  <ul className="space-y-1">
                    {msg.content.feedback.strengths.map(
                      (s: any, i: number) => (
                        <li
                          key={i}
                          className="text-sm text-slate-700 bg-emerald-50 rounded-lg px-3 py-2"
                        >
                          <span className="font-medium">{s.point}</span>
                          {s.explanation && (
                            <span className="text-slate-500">
                              {" "}— {s.explanation}
                            </span>
                          )}
                        </li>
                      )
                    )}
                  </ul>
                </div>
              )}

              {/* Issues */}
              {msg.content.feedback.issues?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-amber-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    Perlu Diperbaiki
                  </p>
                  <ul className="space-y-1">
                    {msg.content.feedback.issues.map(
                      (issue: any, i: number) => (
                        <li
                          key={i}
                          className="text-sm text-slate-700 bg-amber-50 rounded-lg px-3 py-2"
                        >
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="font-medium">{issue.issue}</span>
                            <Badge
                              className={`text-[10px] px-1.5 py-0 shadow-none ${
                                issue.priority === "high"
                                  ? "bg-red-100 text-red-700"
                                  : issue.priority === "medium"
                                  ? "bg-amber-100 text-amber-700"
                                  : "bg-slate-100 text-slate-600"
                              }`}
                            >
                              {issue.priority}
                            </Badge>
                          </div>
                          <p className="text-slate-500 text-xs">
                            Saran: {issue.suggestion}
                          </p>
                        </li>
                      )
                    )}
                  </ul>
                </div>
              )}

              {/* Summary */}
              {msg.content.feedback.summary && (
                <div className="bg-slate-50 rounded-lg px-3 py-2 text-sm text-slate-600 flex items-start gap-2">
                  <Info className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                  {msg.content.feedback.summary}
                </div>
              )}

              {/* Generate revised concept button */}
              {msg.content.validationId && (
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-lg text-xs"
                  onClick={() =>
                    handleGenerateImage("concept", msg.content.validationId)
                  }
                >
                  <ImagePlus className="h-3.5 w-3.5 mr-1.5" />
                  Generate Revisi Konsep
                </Button>
              )}
            </div>
          </div>
        );

      case "ai-image":
        return (
          <div key={msg.id} className="flex justify-start mb-4">
            <div className="max-w-[85%] bg-white border border-slate-200 rounded-2xl rounded-bl-md p-3 shadow-sm">
              <p className="text-xs text-purple-600 font-medium mb-2">
                {" "}
                {msg.content.imageType === "moodboard"
                  ? "Moodboard"
                  : "Konsep Desain"}{" "}
                — AI Generated
              </p>
              <img
                src={msg.content.imageUrl}
                alt={`Generated ${msg.content.imageType}`}
                className="rounded-lg max-h-96 w-full object-cover"
              />
              <div className="mt-2 flex justify-end">
                <a
                  href={msg.content.imageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                >
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-xs text-slate-500"
                  >
                    <Download className="h-3.5 w-3.5 mr-1" />
                    Download
                  </Button>
                </a>
              </div>
            </div>
          </div>
        );

      case "loading":
        return (
          <div key={msg.id} className="flex justify-start mb-4">
            <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm flex items-center gap-3">
              <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
              <span className="text-sm text-slate-500">
                {msg.content.text}
              </span>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const isAnyLoading = messages.some((m) => m.type === "loading");

  return (
    <div className="flex flex-col h-full bg-slate-50/50 rounded-2xl border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="px-5 py-3 bg-white border-b border-slate-100 shrink-0">
        <h3 className="font-semibold text-slate-800 text-sm">
          Visual Studio
        </h3>
        <p className="text-xs text-slate-500">
          Validasi desain & generate referensi visual
        </p>
      </div>

      {/* Messages Area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-4 space-y-0"
      >
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center py-16">
            <div className="w-16 h-16 bg-purple-100 text-purple-500 rounded-full flex items-center justify-center mb-4">
              <ImagePlus className="h-7 w-7" />
            </div>
            <h4 className="font-semibold text-slate-700 mb-1">
              Mulai Eksplorasi Visual
            </h4>
            <p className="text-sm text-slate-500 max-w-xs">
              Upload desain untuk divalidasi AI, atau generate moodboard &
              konsep langsung dari brief.
            </p>
          </div>
        )}

        {messages.map(renderMessage)}
      </div>

      {/* Input Bar */}
      <div className="px-4 py-3 bg-white border-t border-slate-100 shrink-0">
        <div className="flex items-center gap-2">
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg"
            onChange={handleFileSelected}
            className="hidden"
          />

          {/* Attach Image Button */}
          <Button
            size="sm"
            variant="outline"
            onClick={handleAttachImage}
            disabled={isAnyLoading}
            className="rounded-lg shrink-0"
            title="Upload desain untuk divalidasi"
          >
            <Paperclip className="h-4 w-4 mr-1.5" />
            Validasi Desain
          </Button>

          {/* Generate Image Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              disabled={isAnyLoading}
              className="rounded-lg shrink-0"
            >
              <ImagePlus className="h-4 w-4 mr-1.5" />
              Generate
              <ChevronDown className="h-3.5 w-3.5 ml-1" />
            </Button>

            {isDropdownOpen && (
              <div className="absolute bottom-full mb-1 left-0 bg-white border border-slate-200 rounded-lg shadow-lg py-1 w-44 z-10">
                <button
                  onClick={() => handleGenerateImage("moodboard")}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50 transition-colors text-slate-700"
                >
                  Moodboard
                </button>
                <button
                  onClick={() => handleGenerateImage("concept")}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50 transition-colors text-slate-700"
                >
                   Konsep Desain
                </button>
              </div>
            )}
          </div>

          {/* Spacer to push info to right */}
          <div className="flex-1" />

          {isAnyLoading && (
            <span className="text-xs text-slate-400 shrink-0">
              AI sedang bekerja...
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
