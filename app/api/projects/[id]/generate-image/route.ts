import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { genAI } from "@/lib/gemini";
import { uploadToStorage } from "@/lib/supabase-storage";
import {
  buildImagePrompt,
  buildImagePromptFromValidation,
} from "@/lib/prompts/imageGeneration";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = (await params).id;
    const body = await req.json();
    const { imageType, validationId, userRequest } = body;

    if (!imageType || !["moodboard", "concept"].includes(imageType)) {
      return NextResponse.json(
        { error: "Invalid imageType. Must be 'moodboard' or 'concept'." },
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

    // Build prompt based on path
    let prompt: string;

    if (validationId) {
      // Path 2: from analysis + validation feedback
      const validation = await db.designValidation.findUnique({
        where: { id: validationId },
      });

      if (!validation) {
        return NextResponse.json(
          { error: "Validation not found" },
          { status: 404 }
        );
      }

      prompt = buildImagePromptFromValidation(
        visualDirection,
        project.businessType || "business",
        validation.feedback as any,
        userRequest
      );
    } else {
      // Path 1: from analysis only
      prompt = buildImagePrompt(
        visualDirection,
        project.businessType || "business",
        imageType,
        userRequest
      );
    }

    // Call Pollinations AI for free, fast image generation
    const encodedPrompt = encodeURIComponent(prompt);
    const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&nologo=true`;
    
    const imageResponse = await fetch(pollinationsUrl);

    if (!imageResponse.ok) {
      return NextResponse.json(
        { error: "Image generation returned no content", retryable: true },
        { status: 503 }
      );
    }

    const arrayBuffer = await imageResponse.arrayBuffer();
    const imageBuffer = Buffer.from(arrayBuffer);
    const mimeType = imageResponse.headers.get("content-type") || "image/jpeg";

    const fileId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const ext = mimeType === "image/jpeg" ? "jpg" : "png";
    const filePath = `${project.id}/${fileId}.${ext}`;

    const imageUrl = await uploadToStorage(
      "generated-images",
      filePath,
      imageBuffer,
      mimeType
    );

    // Save GeneratedImage record
    const generatedImage = await db.generatedImage.create({
      data: {
        projectId: project.id,
        prompt,
        imageUrl,
        imageType,
      },
    });

    return NextResponse.json({ imageUrl, id: generatedImage.id });
  } catch (error) {
    console.error("[GENERATE_IMAGE_POST]", error);
    return NextResponse.json(
      { error: "Image generation failed", retryable: true },
      { status: 503 }
    );
  }
}
