import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { visualDirection } = await req.json();

    if (!visualDirection) {
      return NextResponse.json({ error: "Missing data" }, { status: 400 });
    }

    const updatedAnalysis = await db.analysis.update({
      where: { projectId: id },
      data: {
        visualDirection: visualDirection,
      },
    });

    return NextResponse.json(updatedAnalysis);
  } catch (error) {
    console.error("[ANALYSIS_PATCH] Error:", error);
    return NextResponse.json({ error: "Failed to update analysis" }, { status: 500 });
  }
}
