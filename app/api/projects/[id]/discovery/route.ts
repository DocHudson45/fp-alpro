import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { genAI, callGeminiWithRetry } from "@/lib/gemini";
import { discoveryPromptTemplate } from "@/lib/prompts/discovery";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = (await params).id;
    const project = await db.project.findUnique({
      where: { id },
      include: { discoveryQAs: true },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    if (project.discoveryQAs && project.discoveryQAs.length > 0) {
      return NextResponse.json({ questions: project.discoveryQAs });
    }

    const prompt = discoveryPromptTemplate
      .replace("{clientRequest}", project.clientRequest)
      .replace("{businessType}", project.businessType || "not specified")
      .replace("{targetUser}", project.targetUser || "not specified")
      .replace("{websiteGoal}", project.websiteGoal || "not specified")
      .replace("{budget}", project.budget || "not specified")
      .replace("{desiredComplexity}", project.desiredComplexity || "not specified")
      .replace("{techStack}", project.techStack || "not specified");

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        temperature: 0.7,
        responseMimeType: "application/json",
      },
    });

    const result = await callGeminiWithRetry<{ questions: string[] }>(async () => {
      const response = await model.generateContent(prompt);
      return {
        responseMimeType: "application/json",
        text: response.response.text(),
      };
    });

    if (!result.questions || !Array.isArray(result.questions)) {
      throw new Error("Invalid format from AI");
    }

    // Save to DB
    const questions = await db.$transaction(
      result.questions.map((q, index) =>
        db.discoveryQA.create({
          data: {
            projectId: project.id,
            question: q,
            order: index + 1,
          },
        })
      )
    );

    // Update status
    await db.project.update({
      where: { id: project.id },
      data: { status: "DISCOVERY" },
    });

    return NextResponse.json({ questions });
  } catch (error) {
    console.error("[DISCOVERY_POST]", error);
    return NextResponse.json(
      { error: "AI Generation failed", retryable: true },
      { status: 503 }
    );
  }
}
