export const builderPromptTemplate = `Generate a copy-paste-ready prompt for the AI website builder: {targetTool}.

The output prompt must be detailed, structured, and immediately usable without edits. Match the conventions and tone preferred by {targetTool}:
- Stitch: visual-first, descriptive of UI sections and feel
- Framer: component-based, mention layout breakpoints
- v0 / Bolt: code-oriented, mention React + Tailwind explicitly
- Webflow: CMS-aware, mention collections if relevant
- Lovable / Replit: full-stack oriented if backend features exist
- Claude: structured, with sections for goals, pages, components, features

CONTEXT:
Website Direction: {websiteDirection}
Visual Direction: {visualDirection}
Must-Have Features: {mustHaveFeatures}
Nice-to-Have Features: {niceToHaveFeatures}
Target User: {targetUser}
Mood: {mood}

OUTPUT: Plain text prompt only. No JSON, no markdown fences. Begin directly with the prompt content.`;
