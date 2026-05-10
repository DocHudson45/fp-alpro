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
  imageType: "moodboard" | "concept",
  userRequest?: string
): string {
  const { palette, mood, layoutStyle, imageStyle, typography } = visualDirection;

  if (imageType === "moodboard") {
    let prompt = `A professional design moodboard for a ${businessType} website.
Color palette featuring ${palette.join(", ")}.
Visual mood: ${mood.join(", ")}.
Typography style: ${typography.style}.
Image style: ${imageStyle}.
High-quality design reference, clean composition, modern aesthetic, suitable for a freelance designer's pitch deck.`;
    if (userRequest) prompt += `\nInclude these specific user requests: ${userRequest}`;
    return prompt;
  }

  // imageType === "concept"
  let prompt = `A concept mockup of a ${businessType} website homepage.
Layout: ${layoutStyle}.
Color palette: ${palette.join(", ")}.
Visual mood: ${mood.join(", ")}.
Image style: ${imageStyle}.
Modern web design, clean UI, high quality, professional reference.`;
  if (userRequest) prompt += `\nInclude these specific user requests: ${userRequest}`;
  return prompt;
}

// PATH 2 — from Analysis + Validation feedback
export function buildImagePromptFromValidation(
  visualDirection: VisualDirection,
  businessType: string,
  feedback: ValidationFeedback,
  userRequest?: string
): string {
  const { palette, mood, layoutStyle, imageStyle } = visualDirection;

  const fixes = feedback.issues
    .filter((i) => i.priority === "high" || i.priority === "medium")
    .map((i) => i.suggestion)
    .join(". ");

  let prompt = `A revised concept mockup of a ${businessType} website homepage.
Apply these specific design improvements: ${fixes}.
Color palette: ${palette.join(", ")}.
Visual mood: ${mood.join(", ")}.
Layout: ${layoutStyle}.
Image style: ${imageStyle}.
Modern web design, clean UI, high quality, professional reference.`;
  if (userRequest) prompt += `\nInclude these specific user requests: ${userRequest}`;
  return prompt;
}
