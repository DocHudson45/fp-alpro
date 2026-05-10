import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { canvasLayout } = await req.json();

    if (!canvasLayout || typeof canvasLayout !== "object") {
      return NextResponse.json({ error: "Invalid canvasLayout" }, { status: 400 });
    }

    await db.project.update({
      where: { id },
      data: { canvasLayout },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[CANVAS_LAYOUT_PATCH] Error:", error);
    return NextResponse.json({ error: "Failed to save canvas layout" }, { status: 500 });
  }
}
