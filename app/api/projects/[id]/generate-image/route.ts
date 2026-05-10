import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { uploadToStorage } from "@/lib/supabase-storage";
import { HfInference } from "@huggingface/inference";
import {
  buildImagePrompt,
  buildImagePromptFromValidation,
} from "@/lib/prompts/imageGeneration";

const hf = new HfInference(process.env.HF_TOKEN);

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = (await params).id;
    const body = await req.json();
    const { imageType, validationId, userRequest } = body;

    // Allowed types: moodboard, concept, fixed
    const allowedTypes = ["moodboard", "concept", "fixed"];
    if (!imageType || !allowedTypes.includes(imageType)) {
      return NextResponse.json(
        { error: "Invalid imageType." },
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

    let prompt: string;
    let finalImageType = imageType;

    if (validationId) {
      // Path 2: Fixed UI (from analysis + validation feedback)
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
      finalImageType = "fixed";
    } else {
      // Path 1: Initial (moodboard or concept)
      prompt = buildImagePrompt(
        visualDirection,
        project.businessType || "business",
        imageType as any,
        userRequest
      );
    }

    // Call HuggingFace with fal-ai provider
    // Model: ayrisdev/mobile-ui-design
    const imageBlob = await hf.textToImage({
      model: "ayrisdev/mobile-ui-design",
      inputs: prompt,
      provider: "fal-ai",
    });

    if (!imageBlob || imageBlob.size === 0) {
      return NextResponse.json(
        { error: "Image generation failed", retryable: true },
        { status: 503 }
      );
    }

    const arrayBuffer = await imageBlob.arrayBuffer();
    const imageBuffer = Buffer.from(arrayBuffer);
    const mimeType = imageBlob.type || "image/png";

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
        imageType: finalImageType,
      },
    });

    return NextResponse.json({ imageUrl, id: generatedImage.id });
  } catch (error: any) {
    console.error("[GENERATE_IMAGE_POST]", error);
    return NextResponse.json(
      { error: error.message || "Image generation failed", retryable: true },
      { status: 503 }
    );
  }
}

