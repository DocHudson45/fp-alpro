import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import OpenAI from "openai";
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
      .replace("{name}", project.name || "not specified")
      .replace("{description}", project.description || (project as any).clientRequest || "not specified")
      .replace("{businessType}", project.businessType || "not specified")
      .replace("{targetUser}", project.targetUser || "not specified")
      .replace("{appGoal}", project.appGoal || (project as any).websiteGoal || "not specified")
      .replace("{desiredComplexity}", project.desiredComplexity || "not specified")
      .replace("{techStack}", project.techStack || "not specified");

    const client = new OpenAI({
      baseURL: "https://router.huggingface.co/v1",
      apiKey: process.env.HF_TOKEN,
    });

    let result: { questions: string[] } | null = null;
    let retries = 2;

    while (retries >= 0) {
      try {
        const completion = await client.chat.completions.create({
          model: "Qwen/Qwen2.5-7B-Instruct",
          messages: [
            {
              role: "user",
              content: prompt + "\n\nIMPORTANT: Return ONLY valid JSON.",
            }
          ],
          temperature: 0.7,
        });

        const textResponse = completion.choices[0].message.content || "{}";
        const cleanedText = textResponse.replace(/```json/g, "").replace(/```/g, "").trim();
        result = JSON.parse(cleanedText);
        break; // Success
      } catch (err) {
        if (retries === 0) throw err;
        retries--;
        await new Promise((r) => setTimeout(r, 1000));
      }
    }

    if (!result || !result.questions || !Array.isArray(result.questions)) {
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
