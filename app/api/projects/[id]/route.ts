import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = (await params).id;
    const project = await db.project.findUnique({
      where: {
        id,
      },
      include: {
        discoveryQAs: {
          orderBy: {
            order: "asc",
          },
        },
        analysis: true,
        designValidations: true,
        generatedImages: true,
      },
    });

    if (!project) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(project);
  } catch (error) {
    console.error("[PROJECT_GET]", error);
    return NextResponse.json(
      { error: "Internal Error", retryable: true },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = (await params).id;
    const project = await db.project.findUnique({
      where: {
        id,
      },
    });

    if (!project) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await db.project.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[PROJECT_DELETE]", error);
    return NextResponse.json(
      { error: "Internal Error", retryable: true },
      { status: 500 }
    );
  }
}
