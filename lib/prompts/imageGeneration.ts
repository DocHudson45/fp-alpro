interface VisualDirection {
  palette: string[];
  mood: string[];
  layoutStyle: string;
  imageStyle: string;
  typography: {
    heading: string;
    body: string;
    style: string;
  };
}

interface ValidationFeedback {
  issues: Array<{
    issue: string;
    suggestion: string;
    priority: "low" | "medium" | "high";
  }>;
}

// PATH 1 — from Analysis only
export function buildImagePrompt(
  visualDirection: VisualDirection,
  businessType: string,
  imageType: "moodboard" | "concept"
): string {
  const { palette, mood, layoutStyle, imageStyle, typography } = visualDirection;

  if (imageType === "moodboard") {
    return `A professional design moodboard for a ${businessType} website.
Color palette featuring ${palette.join(", ")}.
Visual mood: ${mood.join(", ")}.
Typography style: ${typography.style}.
Image style: ${imageStyle}.
High-quality design reference, clean composition, modern aesthetic, suitable for a freelance designer's pitch deck.`;
  }

  // imageType === "concept"
  return `A concept mockup of a ${businessType} website homepage.
Layout: ${layoutStyle}.
Color palette: ${palette.join(", ")}.
Visual mood: ${mood.join(", ")}.
Image style: ${imageStyle}.
Modern web design, clean UI, high quality, professional reference.`;
}

// PATH 2 — from Analysis + Validation feedback
export function buildImagePromptFromValidation(
  visualDirection: VisualDirection,
  businessType: string,
  feedback: ValidationFeedback
): string {
  const { palette, mood, layoutStyle, imageStyle } = visualDirection;

  const fixes = feedback.issues
    .filter((i) => i.priority === "high" || i.priority === "medium")
    .map((i) => i.suggestion)
    .join(". ");

  return `A revised concept mockup of a ${businessType} website homepage.
Apply these specific design improvements: ${fixes}.
Color palette: ${palette.join(", ")}.
Visual mood: ${mood.join(", ")}.
Layout: ${layoutStyle}.
Image style: ${imageStyle}.
Modern web design, clean UI, high quality, professional reference.`;
}
