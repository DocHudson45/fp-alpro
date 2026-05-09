import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import OpenAI from "openai";
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

    const client = new OpenAI({
      baseURL: "https://router.huggingface.co/v1",
      apiKey: process.env.HF_TOKEN,
    });

    let analysisData;
    let retries = 2;
    
    while (retries >= 0) {
      try {
        const completion = await client.chat.completions.create({
          model: "Qwen/Qwen2.5-7B-Instruct",
          messages: [
            {
              role: "user",
              content: prompt + "\n\nIMPORTANT: You must return ONLY valid JSON. Do not include markdown blocks like ```json or any other text.",
            }
          ],
          temperature: 0.5,
        });

        const textResponse = completion.choices[0].message.content || "{}";
        const cleanedText = textResponse.replace(/```json/g, "").replace(/```/g, "").trim();
        analysisData = JSON.parse(cleanedText);
        break; // Success
      } catch (err) {
        if (retries === 0) throw err;
        retries--;
        await new Promise((r) => setTimeout(r, 1000));
      }
    }

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
