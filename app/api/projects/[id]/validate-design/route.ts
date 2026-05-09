import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import OpenAI from "openai";
import { uploadToStorage } from "@/lib/supabase-storage";
import { validationPromptTemplate } from "@/lib/prompts/validation";

const ALLOWED_MIME_TYPES = ["image/png", "image/jpeg", "image/jpg"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = (await params).id;

    const formData = await req.formData();
    const imageFile = formData.get("image") as File | null;

    if (!imageFile) {
      return NextResponse.json(
        { error: "No image file provided" },
        { status: 400 }
      );
    }

    // Validate MIME type
    if (!ALLOWED_MIME_TYPES.includes(imageFile.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only PNG and JPEG are allowed." },
        { status: 415 }
      );
    }

    // Validate file size
    if (imageFile.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 5MB." },
        { status: 413 }
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

    // Upload image to Supabase Storage
    const arrayBuffer = await imageFile.arrayBuffer();
    const imageBuffer = Buffer.from(arrayBuffer);
    const fileId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const ext = imageFile.type === "image/png" ? "png" : "jpg";
    const filePath = `${project.id}/${fileId}.${ext}`;

    const imageUrl = await uploadToStorage(
      "design-uploads",
      filePath,
      imageBuffer,
      imageFile.type
    );

    // Build validation prompt
    const prompt = validationPromptTemplate
      .replace("{websiteDirection}", analysis.websiteDirection)
      .replace("{uxReasoning}", analysis.uxReasoning)
      .replace("{visualDirection}", JSON.stringify(visualDirection))
      .replace("{mustHaveFeatures}", (featureScope.mustHave || []).join(", "))
      .replace("{mood}", (visualDirection.mood || []).join(", "));

    const client = new OpenAI({
      baseURL: "https://router.huggingface.co/v1",
      apiKey: process.env.HF_TOKEN,
    });

    const base64Image = `data:${imageFile.type};base64,${imageBuffer.toString("base64")}`;
    
    let feedback: any = null;
    let retries = 2;

    while (retries >= 0) {
      try {
        const completion = await client.chat.completions.create({
          model: "Qwen/Qwen2.5-VL-72B-Instruct",
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: prompt + "\n\nIMPORTANT: You must return ONLY valid JSON. Do not include markdown blocks like ```json.",
                },
                {
                  type: "image_url",
                  image_url: {
                    url: base64Image,
                  },
                },
              ],
            },
          ],
          temperature: 0.4,
        });

        const textResponse = completion.choices[0].message.content || "{}";
        const cleanedText = textResponse.replace(/```json/g, "").replace(/```/g, "").trim();
        feedback = JSON.parse(cleanedText);
        break; // Success
      } catch (err) {
        if (retries === 0) throw err;
        retries--;
        await new Promise((r) => setTimeout(r, 1000));
      }
    }

    if (!feedback) {
      throw new Error("Invalid format from AI");
    }

    // Save DesignValidation record
    const validation = await db.designValidation.create({
      data: {
        projectId: project.id,
        imageUrl,
        feedback,
      },
    });

    return NextResponse.json({
      feedback,
      imageUrl,
      id: validation.id,
    });
  } catch (error) {
    console.error("[VALIDATE_DESIGN_POST]", error);
    return NextResponse.json(
      { error: "Design validation failed", retryable: true },
      { status: 503 }
    );
  }
}
