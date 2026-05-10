# AIUI - Mobile: Implementation Tasks

## Phase 1: Dark Mode & Global UI
- [x] Update globals.css — dark mode variables, Stitch-style
- [x] Update layout.tsx — dark class, dark header, rename to AIUI

## Phase 2: Project Form & Schema
- [x] Update prisma schema — add name, remove budget, rename clientRequest→description, slug ID
- [x] Run prisma migrate
- [x] Update validators/project.ts
- [x] Update ProjectForm.tsx — dark mode, new fields, dual buttons
- [x] Update projects/new/page.tsx — dark mode
- [x] Create lib/reference-scanner.ts
- [x] Update API POST /projects — slug generation, ref scanning

## Phase 3: Project Pages
- [x] Update ProjectCard.tsx — dark mode, use name (with fallback)
- [x] Update projects/page.tsx — dark mode
- [x] Update projects/[id]/page.tsx — dark mode, use name (with fallback), analyze button

## Phase 4: Workspace Canvas
- [x] Update WorkspaceView.tsx — dark canvas, Stitch dots, 50 image limit, fixed UI flow
- [x] Update WebsiteDirectionCard — compact, dark
- [x] Update UxReasoningCard — compact, dark
- [x] Update VisualDirectionCard — editable palette, copy hex, dark
- [x] Update ComplexityCard — dark
- [x] Update RiskFactorCard — dark
- [x] Update FeatureScopeTable — dark
- [x] Update BuilderPromptCard — dark

## Phase 5: LLM & Image Generation
- [x] Update generate-image/route.ts — HuggingFace fal-ai provider
- [x] Update imageGeneration.ts prompts — mobile UI focus
- [x] Update validate-design/route.ts — optimize tokens, add fixed UI generation
- [x] Update validation.ts prompt — mobile UI focus
- [x] Update analysis.ts prompt — mobile UI, no budget
- [x] Update discovery.ts prompt — mobile UI, no budget
- [x] Update analyze/route.ts — remove budget
- [x] Update discovery/route.ts — remove budget

## Phase 6: Home & Auth
- [x] Update home page.tsx — dark mode, AIUI branding
- [x] Update auth pages — dark mode

## Verification
- [x] prisma generate & push
- [x] code verification
- [x] Fallback logic for old data verified
