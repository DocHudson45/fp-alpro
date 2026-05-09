import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { genAI, callGeminiWithRetry } from "@/lib/gemini";
import { analysisPromptTemplate } from "@/lib/prompts/analysis";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = (await params).id;
    const body = await req.json();
    const answers: Record<string, string> = body.answers || {};

    const project = await db.project.findUnique({
      where: { id },
      include: { discoveryQAs: true },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Save answers
    if (Object.keys(answers).length > 0) {
      await db.$transaction(
        Object.entries(answers).map(([qaId, answer]) =>
          db.discoveryQA.update({
            where: { id: qaId },
            data: { answer },
          })
        )
      );
    }

    // Refetch QAs to ensure we have the latest
    const qas = await db.discoveryQA.findMany({
      where: { projectId: project.id },
      orderBy: { order: "asc" },
    });

    const qaPairsText = qas.length > 0 
      ? qas.map((qa) => `Q: ${qa.question}\nA: ${qa.answer || "No answer provided."}`).join("\n\n")
      : "User skipped discovery; make reasonable assumptions and note them.";

    const prompt = analysisPromptTemplate
      .replace("{clientRequest}", project.clientRequest)
      .replace("{businessType}", project.businessType || "not specified")
      .replace("{targetUser}", project.targetUser || "not specified")
      .replace("{websiteGoal}", project.websiteGoal || "not specified")
      .replace("{budget}", project.budget || "not specified")
      .replace("{desiredComplexity}", project.desiredComplexity || "not specified")
      .replace("{techStack}", project.techStack || "not specified")
      .replace("{references}", project.references.join(", ") || "none")
      .replace("{qaPairs}", qaPairsText);

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        temperature: 0.5,
        responseMimeType: "application/json",
      },
    });

    const analysisData = await callGeminiWithRetry<any>(async () => {
      const response = await model.generateContent(prompt);
      return {
        responseMimeType: "application/json",
        text: response.response.text(),
      };
    });

    const upsertedAnalysis = await db.analysis.upsert({
      where: { projectId: project.id },
      create: {
        projectId: project.id,
        websiteDirection: analysisData.websiteDirection,
        uxReasoning: analysisData.uxReasoning,
        featureScope: analysisData.featureScope,
        complexity: analysisData.complexity,
        complexityReason: analysisData.complexityReason,
        effortEstimate: analysisData.effortEstimate,
        riskFactors: analysisData.riskFactors,
        visualDirection: analysisData.visualDirection,
      },
      update: {
        websiteDirection: analysisData.websiteDirection,
        uxReasoning: analysisData.uxReasoning,
        featureScope: analysisData.featureScope,
        complexity: analysisData.complexity,
        complexityReason: analysisData.complexityReason,
        effortEstimate: analysisData.effortEstimate,
        riskFactors: analysisData.riskFactors,
        visualDirection: analysisData.visualDirection,
      },
    });

    await db.project.update({
      where: { id: project.id },
      data: { status: "ANALYZED" },
    });

    return NextResponse.json(upsertedAnalysis);
  } catch (error) {
    console.error("[ANALYZE_POST]", error);
    return NextResponse.json(
      { error: "AI Generation failed", retryable: true },
      { status: 503 }
    );
  }
}
