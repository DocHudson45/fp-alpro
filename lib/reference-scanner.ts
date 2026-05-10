import OpenAI from "openai";

/**
 * Fetches a reference URL's content and uses LLM to summarize the design patterns.
 * Returns a short summary focusing on layout, colors, UI components, and visual style.
 */
export async function scanReferenceUrl(url: string): Promise<string> {
  try {
    // Fetch the page HTML
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; AIUI-Bot/1.0)",
      },
    });
    clearTimeout(timeout);

    if (!response.ok) {
      return `[Could not fetch: ${url} — HTTP ${response.status}]`;
    }

    const html = await response.text();
    
    // Extract meaningful text (strip scripts, styles, keep structure hints)
    const textContent = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 3000); // Limit to avoid token explosion

    const client = new OpenAI({
      baseURL: "https://router.huggingface.co/v1",
      apiKey: process.env.HF_TOKEN,
    });

    const completion = await client.chat.completions.create({
      model: "Qwen/Qwen2.5-7B-Instruct",
      messages: [
        {
          role: "user",
          content: `Analyze this website content from ${url} and describe its design patterns for a mobile UI designer. Focus on:
- Layout structure (grid, sections, navigation pattern)
- Visual style (colors, typography mood, spacing)
- Key UI components used (cards, hero, forms, etc.)
- Overall design aesthetic

Keep your response to 3-4 concise sentences. Website content:
${textContent}`,
        },
      ],
      temperature: 0.3,
      max_tokens: 300,
    });

    const summary = completion.choices[0]?.message?.content?.trim();
    return summary || `[No summary generated for ${url}]`;
  } catch (error: any) {
    if (error.name === "AbortError") {
      return `[Timeout fetching: ${url}]`;
    }
    return `[Error scanning: ${url} — ${error.message}]`;
  }
}

/**
 * Scan multiple reference URLs in parallel (max 5).
 */
export async function scanReferences(urls: string[]): Promise<string[]> {
  const validUrls = urls
    .filter((u) => u.trim())
    .filter((u) => {
      try { new URL(u); return true; } catch { return false; }
    })
    .slice(0, 5);

  if (validUrls.length === 0) return [];

  const summaries = await Promise.allSettled(
    validUrls.map((url) => scanReferenceUrl(url))
  );

  return summaries.map((result, i) =>
    result.status === "fulfilled"
      ? `[${validUrls[i]}]: ${result.value}`
      : `[${validUrls[i]}]: [Scan failed]`
  );
}
