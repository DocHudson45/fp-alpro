"use client";

import { WebsiteDirectionCard } from "./WebsiteDirectionCard";
import { UxReasoningCard } from "./UxReasoningCard";
import { VisualDirectionCard } from "./VisualDirectionCard";
import { FeatureScopeTable } from "./FeatureScopeTable";
import { ComplexityCard } from "./ComplexityCard";
import { RiskFactorCard } from "./RiskFactorCard";
import { BuilderPromptCard } from "./BuilderPromptCard";

interface AnalysisResultProps {
  analysis: any;
  projectId: string;
}

export function AnalysisResult({ analysis, projectId }: AnalysisResultProps) {
  if (!analysis) return null;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-5 text-emerald-900">
        <h3 className="font-semibold text-base mb-1">Analisis Selesai!</h3>
        <p className="text-emerald-700/80 text-sm">
          Gunakan hasil ini untuk membuat proposal atau berdiskusi dengan klien.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <WebsiteDirectionCard direction={analysis.websiteDirection} />
        <UxReasoningCard reasoning={analysis.uxReasoning} />
      </div>

      <VisualDirectionCard visual={analysis.visualDirection} />

      <FeatureScopeTable features={analysis.featureScope} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ComplexityCard
          complexity={analysis.complexity}
          reason={analysis.complexityReason}
          estimate={analysis.effortEstimate}
        />
        <RiskFactorCard risks={analysis.riskFactors} />
      </div>

      <BuilderPromptCard
        projectId={projectId}
        existingPrompt={analysis.builderPrompt}
        existingTool={analysis.builderTargetTool}
      />
    </div>
  );
}
