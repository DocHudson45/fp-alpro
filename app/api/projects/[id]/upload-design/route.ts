import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { uploadToStorage } from "@/lib/supabase-storage";

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
      return NextResponse.json({ error: "No image file provided" }, { status: 400 });
    }

    if (!ALLOWED_MIME_TYPES.includes(imageFile.type)) {
      return NextResponse.json({ error: "Invalid file type" }, { status: 415 });
    }

    if (imageFile.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "File too large" }, { status: 413 });
    }

    // Upload to Storage
    const arrayBuffer = await imageFile.arrayBuffer();
    const imageBuffer = Buffer.from(arrayBuffer);
    const fileId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const ext = imageFile.type === "image/png" ? "png" : "jpg";
    const filePath = `${id}/${fileId}.${ext}`;

    const imageUrl = await uploadToStorage(
      "design-uploads",
      filePath,
      imageBuffer,
      imageFile.type
    );

    // Save Record (feedback is null/optional now)
    const validation = await db.designValidation.create({
      data: {
        projectId: id,
        imageUrl,
        feedback: null,
      },
    });

    return NextResponse.json({ id: validation.id, imageUrl });
  } catch (error) {
    console.error("[UPLOAD_DESIGN_POST]", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
