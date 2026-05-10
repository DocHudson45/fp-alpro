import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createProjectSchema } from "@/lib/validators/project";
import { createClient } from "@/lib/supabase/server";
import { scanReferences } from "@/lib/reference-scanner";

/** Convert project name to URL-safe slug */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

/** Ensure slug is unique by appending -2, -3, etc. */
async function uniqueSlug(base: string): Promise<string> {
  let slug = base;
  let counter = 1;

  while (true) {
    const existing = await db.project.findUnique({ where: { id: slug } });
    if (!existing) return slug;
    counter++;
    slug = `${base}-${counter}`;
  }
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Ensure user exists in our DB (sync with Supabase Auth)
    await db.user.upsert({
      where: { id: user.id },
      update: { email: user.email! },
      create: {
        id: user.id,
        email: user.email!,
        name: user.user_metadata?.full_name || user.email?.split("@")[0] || "User",
      },
    });

    const body = await req.json();
    const parsed = createProjectSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { name, references, ...rest } = parsed.data;

    // Generate slug from project name
    const baseSlug = slugify(name);
    if (!baseSlug) {
      return NextResponse.json(
        { error: "Nama project tidak valid untuk URL" },
        { status: 400 }
      );
    }
    const slug = await uniqueSlug(baseSlug);

    // Scan reference URLs in background (don't block creation)
    let referenceSummaries: string[] = [];
    if (references && references.length > 0) {
      try {
        referenceSummaries = await scanReferences(references);
      } catch {
        // Non-critical: continue without summaries
      }
    }

    const project = await db.project.create({
      data: {
        id: slug,
        name,
        ...rest,
        references: references || [],
        referenceSummaries,
        status: "DRAFT",
        userId: user.id,
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

export async function GET(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const projects = await db.project.findMany({
      where: {
        userId: user.id,
      },
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
