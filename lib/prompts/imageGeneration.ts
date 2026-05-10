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

// Helper to format palette for the prompt
const formatPalette = (palette: string[]) => {
  return palette.map(color => `Hex ${color}`).join(", ");
};

// PATH 1 — from Analysis only
export function buildImagePrompt(
  visualDirection: VisualDirection,
  businessType: string,
  imageType: "moodboard" | "concept" | "fixed",
  userRequest?: string
): string {
  const { palette, mood, imageStyle, typography, layoutStyle } = visualDirection;
  const paletteStr = formatPalette(palette);

  if (imageType === "moodboard") {
    let prompt = `Mobile UI design moodboard for a ${businessType} app. 
MANDATORY COLORS: ${paletteStr}. 
Visual Mood: ${mood.join(", ")}. 
Typography: ${typography.style} (${typography.heading} and ${typography.body}). 
Design Aesthetic: ${imageStyle}. 
Composition: High-quality professional mobile UI kit components, button sets, iconography, and color swatches. Clean dark/light theme balance.`;
    if (userRequest) prompt += ` User Specific Requirement: ${userRequest}`;
    return prompt;
  }

  // imageType === "concept" or "fixed"
  let prompt = `Full High-Fidelity Mobile App UI Screen for a ${businessType} app. 
STRICT COLOR PALETTE: ${paletteStr}. Use these colors for backgrounds, buttons, and accents.
Layout Style: ${layoutStyle}.
Mood & Atmosphere: ${mood.join(", ")}.
Visual Style: ${imageStyle}.
Details: Professional mobile app interface, sharp UI elements, modern typography using ${typography.body}, high contrast, premium mobile UX.`;
  if (userRequest) prompt += ` Additional Detail: ${userRequest}`;
  return prompt;
}

// PATH 2 — from Analysis + Validation feedback (Fixed UI)
export function buildImagePromptFromValidation(
  visualDirection: VisualDirection,
  businessType: string,
  feedback: ValidationFeedback,
  userRequest?: string
): string {
  const { palette, mood, imageStyle, layoutStyle } = visualDirection;
  const paletteStr = formatPalette(palette);

  const fixes = feedback.issues
    .map((i) => i.suggestion)
    .join(". ");

  let prompt = `Revised and corrected High-Fidelity Mobile App UI for a ${businessType} app. 
REQUIRED IMPROVEMENTS: ${fixes}. 
STRICT COLOR PALETTE: ${paletteStr}. 
Visual Direction: ${mood.join(", ")}, ${imageStyle}. 
Layout: ${layoutStyle}. 
Focus: Fixing all previous UI/UX flaws while strictly maintaining the brand colors ${paletteStr}. High-quality mobile mockup.`;
  if (userRequest) prompt += ` Extra Request: ${userRequest}`;
  return prompt;
}
