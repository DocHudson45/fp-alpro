import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createProjectSchema } from "@/lib/validators/project";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = createProjectSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const project = await db.project.create({
      data: {
        ...parsed.data,
        status: "DRAFT",
      },
    });

    return NextResponse.json({ id: project.id });
  } catch (error) {
    console.error("[PROJECTS_POST]", error);
    return NextResponse.json(
      { error: "Internal Error", retryable: true },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const projects = await db.project.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(projects);
  } catch (error) {
    console.error("[PROJECTS_GET]", error);
    return NextResponse.json(
      { error: "Internal Error", retryable: true },
      { status: 500 }
    );
  }
}
