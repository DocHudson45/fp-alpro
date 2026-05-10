import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { OpenAI } from "openai";
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
    const validationId = formData.get("validationId") as string | null;
    const userRequest = formData.get("userRequest") as string | null;

    const project = await db.project.findUnique({
      where: { id },
      include: { analysis: true },
    });

    if (!project || !project.analysis) {
      return NextResponse.json({ error: "Project or Analysis not found" }, { status: 400 });
    }

    let imageUrl = "";
    let imageBuffer: Buffer | null = null;
    let mimeType = "";

    if (validationId) {
      const existing = await db.designValidation.findUnique({ where: { id: validationId } });
      if (!existing) return NextResponse.json({ error: "Validation record not found" }, { status: 404 });
      imageUrl = existing.imageUrl;
      // Fetch image to send to AI
      const res = await fetch(imageUrl);
      const arrayBuffer = await res.arrayBuffer();
      imageBuffer = Buffer.from(arrayBuffer);
      mimeType = res.headers.get("content-type") || "image/png";
    } else if (imageFile) {
      if (!ALLOWED_MIME_TYPES.includes(imageFile.type)) return NextResponse.json({ error: "Invalid type" }, { status: 415 });
      const arrayBuffer = await imageFile.arrayBuffer();
      imageBuffer = Buffer.from(arrayBuffer);
      mimeType = imageFile.type;
      const fileId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const ext = mimeType === "image/png" ? "png" : "jpg";
      imageUrl = await uploadToStorage("design-uploads", `${id}/${fileId}.${ext}`, imageBuffer, mimeType);
    } else {
      return NextResponse.json({ error: "No image source" }, { status: 400 });
    }

    // AI Analysis
    const visualDirection = (project.analysis.visualDirection as any) || {};
    const featureScope = (project.analysis.featureScope as any) || {};
    let prompt = validationPromptTemplate
      .replace("{designDirection}", project.analysis.designDirection || "Not specified")
      .replace("{mood}", (visualDirection.mood || []).join(", "))
      .replace("{palette}", (visualDirection.palette || []).join(", "))
      .replace("{mustHaveFeatures}", (featureScope.mustHave || []).slice(0, 5).join(", "));

    if (userRequest) prompt += `\n\nUSER REQUEST: "${userRequest}"`;

    const client = new OpenAI({ baseURL: "https://router.huggingface.co/v1", apiKey: process.env.HF_TOKEN });
    const base64Image = `data:${mimeType};base64,${imageBuffer!.toString("base64")}`;

    let feedback: any = null;
    let retries = 2;
    while (retries >= 0) {
      try {
        const completion = await client.chat.completions.create({
          model: "Qwen/Qwen2.5-VL-72B-Instruct",
          messages: [{ role: "user", content: [{ type: "text", text: prompt + "\n\nReturn JSON only." }, { type: "image_url", image_url: { url: base64Image } }] }],
        });
        feedback = JSON.parse(completion.choices[0]?.message?.content?.replace(/```json|```/g, "").trim() || "{}");
        break;
      } catch {
        if (retries-- === 0) throw new Error("AI fail");
        await new Promise(r => setTimeout(r, 1000));
      }
    }

    const validation = validationId 
      ? await db.designValidation.update({ where: { id: validationId }, data: { feedback } })
      : await db.designValidation.create({ data: { projectId: id, imageUrl, feedback } });

    return NextResponse.json({ id: validation.id, imageUrl, feedback });
  } catch (error) {
    console.error("[VALIDATE_DESIGN_POST]", error);
    return NextResponse.json({ error: "Validation failed" }, { status: 500 });
  }
}
