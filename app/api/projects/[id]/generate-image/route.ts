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
    const { imageType, validationId } = body;

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
        validation.feedback as any
      );
    } else {
      // Path 1: from analysis only
      prompt = buildImagePrompt(
        visualDirection,
        project.businessType || "business",
        imageType
      );
    }

    // Call gemini-2.5-flash-image (Nano Banana)
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash-image",
    });

    const response = await model.generateContent(prompt);
    const parts = response.response.candidates?.[0]?.content?.parts;

    if (!parts) {
      return NextResponse.json(
        { error: "Image generation returned no content", retryable: true },
        { status: 503 }
      );
    }

    // Find the inline image data part
    const imagePart = parts.find(
      (part: any) => part.inlineData?.mimeType?.startsWith("image/")
    );

    if (!imagePart?.inlineData) {
      return NextResponse.json(
        { error: "No image data in response", retryable: true },
        { status: 503 }
      );
    }

    // Decode base64 and upload to Supabase Storage
    const imageBuffer = Buffer.from(imagePart.inlineData.data, "base64");
    const fileId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const filePath = `${project.id}/${fileId}.png`;

    const imageUrl = await uploadToStorage(
      "generated-images",
      filePath,
      imageBuffer,
      imagePart.inlineData.mimeType || "image/png"
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
