import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import OpenAI from "openai";
import { builderPromptTemplate } from "@/lib/prompts/builder";

const VALID_TOOLS = [
  "stitch", "framer", "v0", "bolt", "webflow", "lovable", "replit", "claude",
] as const;

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = (await params).id;
    const body = await req.json();
    const { targetTool } = body;

    if (!targetTool || !VALID_TOOLS.includes(targetTool)) {
      return NextResponse.json(
        { error: "Invalid targetTool", retryable: false },
        { status: 400 }
      );
    }

    const project = await db.project.findUnique({
      where: { id },
      include: { analysis: true },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    if (!project.analysis) {
      return NextResponse.json(
        { error: "Analysis not found. Run analysis first." },
        { status: 400 }
      );
    }

    const analysis = project.analysis;
    const visualDirection = analysis.visualDirection as any;
    const featureScope = analysis.featureScope as any;

    const prompt = builderPromptTemplate
      .replace("{targetTool}", targetTool)
      .replace("{targetTool}", targetTool)
      .replace("{websiteDirection}", analysis.websiteDirection)
      .replace("{visualDirection}", JSON.stringify(visualDirection))
      .replace("{mustHaveFeatures}", (featureScope.mustHave || []).join(", "))
      .replace("{niceToHaveFeatures}", (featureScope.niceToHave || []).join(", "))
      .replace("{targetUser}", project.targetUser || "not specified")
      .replace("{mood}", (visualDirection.mood || []).join(", "));

    const client = new OpenAI({
      baseURL: "https://router.huggingface.co/v1",
      apiKey: process.env.HF_TOKEN,
    });

    const completion = await client.chat.completions.create({
      model: "Qwen/Qwen2.5-7B-Instruct",
      messages: [
        {
          role: "user",
          content: prompt,
        }
      ],
      temperature: 0.7,
    });

    const generatedPrompt = completion.choices[0].message.content || "";

    // Save to analysis record
    await db.analysis.update({
      where: { id: analysis.id },
      data: {
        builderPrompt: generatedPrompt,
        builderTargetTool: targetTool,
      },
    });

    return NextResponse.json({ prompt: generatedPrompt });
  } catch (error) {
    console.error("[BUILDER_PROMPT_POST]", error);
    return NextResponse.json(
      { error: "AI Generation failed", retryable: true },
      { status: 503 }
    );
  }
}
{ error: "AI Generation failed", retryable: true },
{ status: 503 }
    );
  }
}
