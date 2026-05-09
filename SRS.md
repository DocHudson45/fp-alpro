# Software Requirements Specification (SRS)

## ClientFit AI

**Version:** 1.0
**Status:** Final for MVP Implementation
**Target Environment:** Antigravity AI Agent
**Estimated Implementation Time:** 10–24 hours

---

## 1. Project Overview

### 1.1 Purpose

ClientFit AI is an AI-powered discovery and design-validation assistant for freelance web designers and developers. It helps freelancers:

1. Turn vague client website requests into structured analyses (website direction, scope, complexity, effort estimate, risk factors, visual direction).
2. Validate their own design drafts against the AI-generated brief, getting concrete feedback on alignment.
3. Generate visual references (moodboards/concepts) on-demand to support their proposals.

### 1.2 Scope of This Document

This SRS defines the complete system to be built: tech stack, data model, API contracts, AI prompt strategies, page-by-page UI specs, file structure, and implementation order. The agent should treat this as the single source of truth and follow it strictly.

### 1.3 Language Convention

- **Code, comments, variable names, API responses (raw):** English.
- **AI-generated content (analysis, feedback, etc.):** English.
- **Frontend UI text (labels, buttons, helper text, error messages displayed to user):** Indonesian.

This separation allows Gemini to perform best with English prompts while delivering an Indonesian UX.

---

## 2. Tech Stack

| Layer               | Technology               | Notes                                         |
| ------------------- | ------------------------ | --------------------------------------------- |
| Frontend Framework  | Next.js 14+ (App Router) | TypeScript                                    |
| UI Components       | shadcn/ui                | Pre-installed components only                 |
| Styling             | Tailwind CSS             | Comes with shadcn                             |
| Backend             | Next.js API Routes       | Server-side logic in `/app/api`               |
| ORM                 | Prisma                   | Type-safe DB access                           |
| Database            | PostgreSQL via Supabase  | Free tier                                     |
| File Storage        | Supabase Storage         | For uploaded design images & generated images |
| AI Text Provider    | Google Gemini API        | Model: `gemini-2.0-flash`                     |
| AI Vision Provider  | Google Gemini API        | Model: `gemini-2.0-flash` (multimodal)        |
| AI Image Generation | Google Gemini API        | Model: `gemini-2.0-flash-image` (Nano Banana) |
| Form Validation     | react-hook-form + zod    |                                               |
| Deployment          | Vercel                   | Auto-deploy from main branch                  |

### 2.1 Required Environment Variables

```
DATABASE_URL=                 # Supabase Postgres connection string
DIRECT_URL=                   # Supabase direct connection (for Prisma migrations)
GEMINI_API_KEY=               # Google AI Studio API key
SUPABASE_URL=                 # Supabase project URL
SUPABASE_ANON_KEY=            # Supabase anonymous public key
SUPABASE_SERVICE_ROLE_KEY=    # For server-side storage uploads

```

---

## 3. System Architecture

### 3.1 High-Level Architecture

```
┌──────────────────┐
│  Browser (User)  │
└────────┬─────────┘
         │ HTTP
         ▼
┌──────────────────────────────────────┐
│   Next.js (Vercel)                   │
│   ┌────────────────┐  ┌────────────┐ │
│   │  Pages (RSC)   │  │ API Routes │ │
│   │  shadcn UI     │  │ (Server)   │ │
│   └────────────────┘  └─────┬──────┘ │
└─────────────────────────────┼────────┘
                              │
        ┌─────────────────────┼──────────────────┐
        ▼                     ▼                  ▼
┌───────────────┐    ┌────────────────┐  ┌──────────────┐
│ Supabase      │    │ Google Gemini  │  │ Supabase     │
│ (Postgres)    │    │ (Text/Vision/  │  │ Storage      │
│ via Prisma    │    │  Image Gen)    │  │ (Images)     │
└───────────────┘    └────────────────┘  └──────────────┘
```

### 3.2 Folder Structure

```
clientfit-ai/
├── app/
│   ├── page.tsx                              # Landing page
│   ├── layout.tsx                            # Root layout
│   ├── globals.css
│   ├── projects/
│   │   ├── page.tsx                          # Project list
│   │   ├── new/
│   │   │   └── page.tsx                      # Create new project form
│   │   └── [id]/
│   │       └── page.tsx                      # Project detail (discovery + result)
│   └── api/
│       └── projects/
│           ├── route.ts                      # GET, POST
│           └── [id]/
│               ├── route.ts                  # GET, DELETE
│               ├── discovery/route.ts        # POST
│               ├── analyze/route.ts          # POST
│               ├── builder-prompt/route.ts   # POST
│               ├── generate-image/route.ts   # POST
│               └── validate-design/route.ts  # POST
├── components/
│   ├── ui/                                   # shadcn components (auto-generated)
│   ├── ProjectForm.tsx
│   ├── ProjectCard.tsx
│   ├── DiscoveryQuestions.tsx
│   ├── AnalysisResult.tsx
│   ├── WebsiteDirectionCard.tsx
│   ├── UxReasoningCard.tsx
│   ├── VisualDirectionCard.tsx
│   ├── FeatureScopeTable.tsx
│   ├── ComplexityCard.tsx
│   ├── RiskFactorCard.tsx
│   ├── BuilderPromptCard.tsx
│   ├── ImageGenerationCard.tsx
│   ├── DesignValidationCard.tsx
│   └── LoadingSpinner.tsx
├── lib/
│   ├── db.ts                                 # Prisma client singleton
│   ├── gemini.ts                             # Gemini API wrapper
│   ├── supabase.ts                           # Supabase client (storage)
│   ├── prompts/
│   │   ├── discovery.ts
│   │   ├── analysis.ts
│   │   ├── builder.ts
│   │   ├── validation.ts
│   │   └── imageGeneration.ts
│   └── validators/
│       └── project.ts                        # zod schemas
├── prisma/
│   └── schema.prisma
├── .env.local
├── .env.example
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

---

## 4. Data Model (Prisma Schema)

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

enum ProjectStatus {
  DRAFT
  DISCOVERY
  ANALYZED
}

model Project {
  id                 String        @id @default(cuid())

  // User input fields
  clientRequest      String        @db.Text
  businessType       String?
  targetUser         String?
  websiteGoal        String?
  budget             String?
  desiredComplexity  String?
  techStack          String?
  freelancerRate     Int?
  references         String[]

  status             ProjectStatus @default(DRAFT)
  createdAt          DateTime      @default(now())
  updatedAt          DateTime      @updatedAt

  discoveryQAs       DiscoveryQA[]
  analysis           Analysis?
  designValidations  DesignValidation[]
  generatedImages    GeneratedImage[]
}

model DiscoveryQA {
  id          String   @id @default(cuid())
  projectId   String
  project     Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)

  question    String   @db.Text
  answer      String?  @db.Text
  order       Int

  createdAt   DateTime @default(now())

  @@index([projectId])
}

model Analysis {
  id                 String   @id @default(cuid())
  projectId          String   @unique
  project            Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)

  websiteDirection   String   @db.Text
  uxReasoning        String   @db.Text
  featureScope       Json
  complexity         String
  complexityReason   String   @db.Text
  effortEstimate     Json
  riskFactors        Json
  visualDirection    Json

  builderPrompt      String?  @db.Text
  builderTargetTool  String?

  createdAt          DateTime @default(now())
  updatedAt          DateTime @updatedAt
}

model DesignValidation {
  id          String   @id @default(cuid())
  projectId   String
  project     Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)

  imageUrl    String
  feedback    Json

  createdAt   DateTime @default(now())

  @@index([projectId])
}

model GeneratedImage {
  id          String   @id @default(cuid())
  projectId   String
  project     Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)

  prompt      String   @db.Text
  imageUrl    String
  imageType   String   // "moodboard" | "concept"

  createdAt   DateTime @default(now())

  @@index([projectId])
}
```

### 4.1 JSON Field Shapes

**`Analysis.featureScope`:**

```typescript
{
  mustHave: string[];
  niceToHave: string[];
  notRecommended: string[];
}
```

**`Analysis.effortEstimate`:**

```typescript
{
  min: number;
  max: number;
  breakdown: {
    design: string; // e.g. "8-12 hours"
    frontend: string;
    backend: string | null;
    revision: string;
  }
}
```

**`Analysis.riskFactors`:**

```typescript
Array<{
  risk: string;
  severity: "low" | "medium" | "high";
}>;
```

**`Analysis.visualDirection`:**

```typescript
{
  palette: string[];               // 5 hex codes
  typography: {
    heading: string;
    body: string;
    style: string;
  };
  mood: string[];
  layoutStyle: string;
  imageStyle: string;
}
```

**`DesignValidation.feedback`:**

```typescript
{
  alignmentScore: number; // 1-10
  strengths: Array<{
    point: string;
    explanation: string;
  }>;
  issues: Array<{
    issue: string;
    suggestion: string;
    priority: "low" | "medium" | "high";
  }>;
  summary: string;
}
```

---

## 5. API Specification

All endpoints return JSON. Errors follow this shape:

```typescript
{ error: string; retryable?: boolean }
```

### 5.1 `POST /api/projects`

**Purpose:** Create a new project.

**Request body:**

```typescript
{
  clientRequest: string;           // required, min 10 chars
  businessType?: string;
  targetUser?: string;
  websiteGoal?: string;
  budget?: string;
  desiredComplexity?: string;
  techStack?: string;
  freelancerRate?: number;
  references?: string[];
}
```

**Response (200):**

```typescript
{
  id: string;
}
```

**Logic:**

1. Validate body with zod.
2. Create Project with `status = DRAFT`.
3. Return id.

---

### 5.2 `GET /api/projects`

**Purpose:** List all projects.

**Response (200):** `Project[]` (most recent first, ordered by `createdAt desc`).

---

### 5.3 `GET /api/projects/[id]`

**Purpose:** Get full project data including all relations.

**Response (200):**

```typescript
Project & {
  discoveryQAs: DiscoveryQA[];
  analysis: Analysis | null;
  designValidations: DesignValidation[];
  generatedImages: GeneratedImage[];
}
```

**Errors:** 404 if not found.

---

### 5.4 `DELETE /api/projects/[id]`

**Purpose:** Delete project and all related data (cascade).

**Response (200):** `{ success: true }`

---

### 5.5 `POST /api/projects/[id]/discovery`

**Purpose:** Generate discovery questions using Gemini.

**Logic:**

1. Fetch project from DB.
2. If discoveryQAs already exist, return them (no re-generation).
3. Call Gemini with discovery prompt (see §6.1).
4. Parse JSON response.
5. Save each question to `DiscoveryQA` with incremental `order`.
6. Update project `status = DISCOVERY`.
7. Return `{ questions: DiscoveryQA[] }`.

**Errors:** 503 if Gemini fails (retryable: true).

---

### 5.6 `POST /api/projects/[id]/analyze`

**Purpose:** Generate the main analysis.

**Request body:**

```typescript
{
  answers: { [discoveryQaId: string]: string };  // optional, can be {}
}
```

**Logic:**

1. Update DiscoveryQA records with provided answers.
2. Fetch project + QAs.
3. Call Gemini with analysis prompt (see §6.2). Use `responseMimeType: "application/json"`.
4. Parse JSON response.
5. Upsert `Analysis` record.
6. Update project `status = ANALYZED`.
7. Return full Analysis object.

**Errors:** 503 if Gemini fails. 400 if JSON malformed (retry once internally).

---

### 5.7 `POST /api/projects/[id]/builder-prompt`

**Purpose:** Generate AI builder prompt on-demand.

**Request body:**

```typescript
{
  targetTool: "stitch" |
    "framer" |
    "v0" |
    "bolt" |
    "webflow" |
    "lovable" |
    "replit" |
    "claude";
}
```

**Logic:**

1. Fetch project + analysis.
2. If analysis missing, return 400.
3. Call Gemini with builder prompt template (see §6.3). Plain text output.
4. Update `Analysis.builderPrompt` and `builderTargetTool`.
5. Return `{ prompt: string }`.

---

### 5.8 `POST /api/projects/[id]/generate-image`

**Purpose:** Generate moodboard/concept image on-demand using Nano Banana. Supports two paths: from analysis only (Path 1), or from analysis + validation feedback (Path 2).

**Request body:**

```typescript
{
  imageType: "moodboard" | "concept";
  validationId?: string; // optional — if provided, triggers Path 2
}
```

**Logic:**

1. Fetch project + analysis. If analysis missing, return 400.
2. If validationId provided → fetch DesignValidation by id. If not found, return 404.
3. Build image prompt:
   No validationId → use buildImagePrompt() (Path 1, see §6.5)
   With validationId → use buildImagePromptFromValidation() (Path 2, see §6.5)

4. Call Gemini gemini-2.0-flash-image model.
5. Receive image binary (base64), decode, upload to Supabase Storage at generated-images/{projectId}/{cuid}.png.
6. Save GeneratedImage record with imageType and prompt used.
7. Return { imageUrl: string, id: string }.

**Errors:** 503 if generation fails. Display fallback message in UI.

---

### 5.9 `POST /api/projects/[id]/validate-design`

**Purpose:** Validate user's uploaded design against the AI brief.

**Request body:** `multipart/form-data` with `image` file (PNG/JPG, max 5MB).

**Logic:**

1. Fetch project + analysis.
2. If analysis missing, return 400.
3. Upload image to Supabase Storage at `design-uploads/{projectId}/{cuid}.png`.
4. Get public URL of uploaded image.
5. Call Gemini multimodal with image + validation prompt (see §6.4). Use `responseMimeType: "application/json"`.
6. Parse JSON feedback.
7. Save `DesignValidation` record.
8. Return `{ feedback, imageUrl, id }`.

**Errors:** 413 if file too large. 415 if not image. 503 if Gemini fails.

---

## 6. AI Prompt Strategy

All prompts are written in English. All Gemini calls should set `temperature` and `responseMimeType` as specified. Prompts are stored as exported template strings in `lib/prompts/`.

### 6.1 Discovery Prompt (`lib/prompts/discovery.ts`)

**Model:** `gemini-2.0-flash`
**Config:** `temperature: 0.7`, `responseMimeType: "application/json"`

```
You are an experienced website consultant who helps freelancers conduct effective client discovery sessions. Your job is to generate sharp, specific follow-up questions that clarify ambiguities in a client's website request.

RULES:
- Generate between 5 and 7 questions.
- Each question must be ACTIONABLE: the answer must directly impact scope, design, or feasibility.
- AVOID generic questions like "what is your goal?" or "who is your audience?" unless context is missing.
- Questions should help the freelancer make better decisions about features, scope, complexity, and pricing.
- Output strictly valid JSON. No markdown, no commentary.

CONTEXT:
Client Request: {clientRequest}
Business Type: {businessType || "not specified"}
Target User: {targetUser || "not specified"}
Website Goal: {websiteGoal || "not specified"}
Budget: {budget || "not specified"}
Desired Complexity: {desiredComplexity || "not specified"}
Tech Stack: {techStack || "not specified"}

OUTPUT FORMAT (JSON):
{
  "questions": [
    "First question...",
    "Second question...",
    ...
  ]
}
```

### 6.2 Analysis Prompt (`lib/prompts/analysis.ts`)

**Model:** `gemini-2.0-flash`
**Config:** `temperature: 0.5`, `responseMimeType: "application/json"`

```
You are a senior website strategist with 10+ years of experience helping freelancers scope and propose web projects. Your job is to analyze a project request and generate complete, actionable guidance.

RULES:
- Be SPECIFIC. Avoid generic advice like "make it look good".
- Every recommendation must include reasoning.
- Effort estimates must account for the chosen tech stack:
  - Framer / Webflow / no-code: 30-50% less time than custom code
  - WordPress / Shopify: moderate effort
  - Custom code (React, Next.js, etc.): full effort
- Visual direction must be CONCRETE: real hex codes, real font names, specific moods.
- Risk factors should reflect realistic project pitfalls.
- Output strictly valid JSON. No markdown, no commentary.

CONTEXT:
Client Request: {clientRequest}
Business Type: {businessType || "not specified"}
Target User: {targetUser || "not specified"}
Website Goal: {websiteGoal || "not specified"}
Budget: {budget || "not specified"}
Desired Complexity: {desiredComplexity || "not specified"}
Tech Stack: {techStack || "not specified"}
References: {references || "none"}

DISCOVERY Q&A:
{qaPairs OR "User skipped discovery; make reasonable assumptions and note them."}

OUTPUT SCHEMA (JSON):
{
  "websiteDirection": "2-3 sentence recommendation of what type of website to build",
  "uxReasoning": "3-5 sentences explaining WHY this direction fits the business, audience, and goal",
  "featureScope": {
    "mustHave": ["feature 1", "feature 2", ...],
    "niceToHave": ["feature 1", ...],
    "notRecommended": ["feature 1 with brief reason", ...]
  },
  "complexity": "Simple" | "Medium" | "Advanced" | "HighEnd",
  "complexityReason": "Brief explanation of why this complexity level was chosen",
  "effortEstimate": {
    "min": <number>,
    "max": <number>,
    "breakdown": {
      "design": "X-Y hours",
      "frontend": "X-Y hours",
      "backend": "X-Y hours" or null,
      "revision": "X-Y hours"
    }
  },
  "riskFactors": [
    { "risk": "description", "severity": "low" | "medium" | "high" }
  ],
  "visualDirection": {
    "palette": ["#hex1", "#hex2", "#hex3", "#hex4", "#hex5"],
    "typography": {
      "heading": "specific font name (e.g. 'Inter', 'Playfair Display')",
      "body": "specific font name",
      "style": "short description (e.g. 'modern sans-serif')"
    },
    "mood": ["keyword1", "keyword2", "keyword3"],
    "layoutStyle": "brief description of recommended layout",
    "imageStyle": "brief description of recommended image style"
  }
}
```

### 6.3 Builder Prompt Template (`lib/prompts/builder.ts`)

**Model:** `gemini-2.0-flash`
**Config:** `temperature: 0.7`, plain text output

```
Generate a copy-paste-ready prompt for the AI website builder: {targetTool}.

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

OUTPUT: Plain text prompt only. No JSON, no markdown fences. Begin directly with the prompt content.
```

### 6.4 Design Validation Prompt (`lib/prompts/validation.ts`)

**Model:** `gemini-2.0-flash` (multimodal — accepts image input)
**Config:** `temperature: 0.4`, `responseMimeType: "application/json"`

```
You are an expert UI/UX design reviewer. You will be given:
1. An image of a design mockup created by a freelancer.
2. The AI-generated brief for the project (website direction, visual direction, UX reasoning, feature scope).

Your task: compare the mockup against the brief. Provide concrete, actionable feedback.

RULES:
- Identify 2-4 strengths the design already nails.
- Identify 2-5 specific issues with concrete suggestions.
- AVOID vague feedback like "the colors are off". Be SPECIFIC: "The primary CTA button at top-right appears to be ~32px tall — for mobile usability, increase to a minimum of 48px."
- Score the design's alignment with the brief on a 1-10 scale.
- Be supportive in tone. The freelancer is iterating, not being judged.
- Output strictly valid JSON.

PROJECT BRIEF:
Website Direction: {websiteDirection}
UX Reasoning: {uxReasoning}
Visual Direction: {visualDirection}
Must-Have Features: {mustHaveFeatures}
Mood: {mood}

OUTPUT SCHEMA (JSON):
{
  "alignmentScore": <number 1-10>,
  "strengths": [
    { "point": "short title", "explanation": "1-2 sentences" }
  ],
  "issues": [
    {
      "issue": "specific problem",
      "suggestion": "specific fix",
      "priority": "low" | "medium" | "high"
    }
  ],
  "summary": "1-2 sentence overall assessment"
}
```

### 6.5 Image Generation Prompt (`lib/prompts/imageGeneration.ts`)

**Model:** `gemini-2.0-flash-image` (Nano Banana)
**Config:** Default. Single image output.

The prompt is constructed programmatically from `Analysis.visualDirection`:

```typescript
function buildImagePrompt(visualDirection, businessType, imageType) {
  const { palette, mood, layoutStyle, imageStyle, typography } =
    visualDirection;

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
function buildImagePromptFromValidation(
  visualDirection,
  businessType,
  feedback,
) {
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
```

### 6.6 Error Handling for AI Calls

All AI calls must be wrapped with this pattern:

```typescript
async function callGeminiWithRetry(fn, maxRetries = 1) {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const result = await fn();
      // For JSON responses, validate parseability
      if (result.responseMimeType === "application/json") {
        JSON.parse(result.text); // throws if malformed
      }
      return result;
    } catch (err) {
      if (attempt === maxRetries) throw err;
      await new Promise((r) => setTimeout(r, 1000));
    }
  }
}
```

---

## 7. Frontend Specification

### 7.1 Global UX Rules

- All UI text in **Indonesian**.
- All buttons triggering AI calls must show a loading state with shadcn `Skeleton` or `Spinner`.
- Error states must show a retry button when `retryable: true`.
- Toast notifications via shadcn `Sonner` for success/error confirmations.
- Use shadcn `Card`, `Button`, `Input`, `Textarea`, `Select`, `Dialog`, `Badge`, `Skeleton`, `Sonner`, `Tabs`.

### 7.2 Pages

#### Page: `/` (Landing)

- Hero section with product name "ClientFit AI" and one-liner: "Ubah brief klien yang vague jadi panduan website yang jelas."
- Primary CTA: "Mulai Project Baru" → links to `/projects/new`.
- Secondary CTA: "Lihat Project Sebelumnya" → links to `/projects`.
- Brief feature highlights (3 cards: Discovery, Analysis, Validasi Desain).

#### Page: `/projects`

- Header: "Project Kamu" + button "Project Baru" (top-right).
- If empty: empty state with message "Belum ada project. Mulai yang pertama!"
- Otherwise: grid of `ProjectCard` components showing:
  - First 100 chars of `clientRequest`
  - `businessType`
  - Status badge (color-coded: gray for DRAFT, blue for DISCOVERY, green for ANALYZED)
  - `createdAt` (relative time, e.g., "2 jam yang lalu")
  - Click → navigate to `/projects/[id]`
  - Delete button (with confirmation dialog)

#### Page: `/projects/new`

- Form (`ProjectForm` component) with fields:

| Field             | Type                        | Required | Indonesian Label                  |
| ----------------- | --------------------------- | -------- | --------------------------------- |
| clientRequest     | Textarea                    | ✅       | "Permintaan Klien"                |
| businessType      | Input                       | ❌       | "Jenis Bisnis"                    |
| targetUser        | Input                       | ❌       | "Target Pengguna"                 |
| websiteGoal       | Input                       | ❌       | "Tujuan Website"                  |
| budget            | Input                       | ❌       | "Budget (opsional)"               |
| desiredComplexity | Select                      | ❌       | "Kompleksitas yang Diinginkan"    |
| techStack         | Select                      | ❌       | "Tech Stack"                      |
| freelancerRate    | Number Input                | ❌       | "Rate per Jam (opsional)"         |
| references        | Textarea (one URL per line) | ❌       | "Referensi (URL, satu per baris)" |

- Select options for `desiredComplexity`: "Simple & Functional", "Clean & Professional", "Modern & Interactive", "Premium / High-End", "Experimental / Creative".
- Select options for `techStack`: "Framer", "Webflow", "WordPress", "Custom (React/Next.js)", "Custom (Vue/Nuxt)", "Other".
- Submit button: "Buat Project".
- On submit: POST `/api/projects` → redirect to `/projects/[id]`.

#### Page: `/projects/[id]`

This page handles **three states** based on `project.status`:

**State 1: `DRAFT`**

- Show project info summary at top.
- Show button: "Mulai Discovery" → calls POST `/api/projects/[id]/discovery`.
- After success, page transitions to State 2.

**State 2: `DISCOVERY`**

- Show project info summary.
- Show `DiscoveryQuestions` component:
  - List 5-7 questions, each with a Textarea for answer.
  - "Jawab semua atau lewati" hint.
  - Two buttons: "Lewati & Generate Analisis" and "Submit Jawaban & Generate Analisis".
  - On submit: POST `/api/projects/[id]/analyze` with `{ answers: {...} }`.

**State 3: `ANALYZED`**

- Show project info summary at top (collapsed/expandable).
- Show `AnalysisResult` component containing all cards:

| Card Component         | Content                                                                              | Trigger                          |
| ---------------------- | ------------------------------------------------------------------------------------ | -------------------------------- |
| `WebsiteDirectionCard` | `analysis.websiteDirection`                                                          | Auto-displayed                   |
| `UxReasoningCard`      | `analysis.uxReasoning`                                                               | Auto-displayed                   |
| `VisualDirectionCard`  | Palette swatches + typography + mood badges + button "Generate Moodboard"            | Auto-displayed; button on-demand |
| `FeatureScopeTable`    | 3 columns: Must-have / Nice-to-have / Not Recommended                                | Auto-displayed                   |
| `ComplexityCard`       | Complexity badge + reason + effort estimate breakdown                                | Auto-displayed                   |
| `RiskFactorCard`       | List of risks with severity badges                                                   | Auto-displayed                   |
| `BuilderPromptCard`    | Select target tool + button "Generate Prompt" → shows generated prompt + Copy button | On-demand                        |
| `ImageGenerationCard`  | Buttons "Generate Moodboard" and "Generate Concept" → shows image gallery            | On-demand                        |
| `DesignValidationCard` | Upload area + after upload shows feedback (score, strengths, issues, summary)        | On-demand                        |

### 7.3 Component Notes

**`VisualDirectionCard`:**

- Render palette as 5 colored squares with hex labels.
- Render typography as text samples in those font names (use `next/font` or fallback if not loaded).
- Render mood as `Badge` components.

**`FeatureScopeTable`:**

- 3-column responsive table (or stacked on mobile).
- Each item has a colored bullet (green for must, blue for nice, red for not-recommended).

**`DesignValidationCard`:**

- Drag-and-drop upload area or file picker.
- After upload: show uploaded image preview + feedback panel with:
  - Big alignment score (e.g., "7.5/10") with circular progress indicator.
  - "Yang Sudah Bagus" section: list of strengths.
  - "Yang Bisa Diperbaiki" section: list of issues with priority badges.
  - "Ringkasan" section: summary text.

**`ImageGenerationCard`:**

- Two buttons triggering `imageType: "moodboard"` and `imageType: "concept"`.
- Display all generated images in a gallery (grid).
- Each image has a download button.

---

## 8. Implementation Order (Recommended for Agent)

The agent should implement in this order to minimize blocking dependencies:

### Phase 1: Foundation (target: 1.5 hours)

1. Initialize Next.js with TypeScript + Tailwind.
2. Install shadcn/ui and required components: `card button input textarea select dialog badge skeleton sonner tabs form label`.
3. Install Prisma, generate Prisma client, set up Supabase.
4. Create `prisma/schema.prisma` per §4.
5. Run `prisma migrate dev`.
6. Create `lib/db.ts` (Prisma singleton), `lib/gemini.ts` (Gemini wrapper), `lib/supabase.ts`.

### Phase 2: Core Backend (target: 2.5 hours)

7. Implement `/api/projects` (POST, GET).
8. Implement `/api/projects/[id]` (GET, DELETE).
9. Implement `/api/projects/[id]/discovery` (POST) + discovery prompt.
10. Implement `/api/projects/[id]/analyze` (POST) + analysis prompt.

### Phase 3: Core Frontend (target: 2.5 hours)

11. Build landing page `/`.
12. Build `/projects` (list page).
13. Build `/projects/new` (form).
14. Build `/projects/[id]` with all 3 state handlers.
15. Build all `AnalysisResult` sub-cards (text-only ones first).

### Phase 4: On-Demand Features (target: 2.5 hours)

16. Implement `/api/projects/[id]/builder-prompt` + `BuilderPromptCard`.
17. Implement `/api/projects/[id]/generate-image` + `ImageGenerationCard`.
18. Implement `/api/projects/[id]/validate-design` + `DesignValidationCard`.

### Phase 5: Polish (target: 1 hour)

19. Loading states, error handling, toast notifications.
20. Responsive checks.
21. README with setup instructions and demo screenshots.
22. Deploy to Vercel.

---

## 9. Non-Functional Requirements

### 9.1 Performance

- Page navigation should feel snappy; use Next.js loading states.
- AI calls may take 5–30 seconds; UI must show loading state with skeleton or spinner.
- Don't block page render on AI calls — fetch in client components or with streaming where possible.

### 9.2 Reliability

- All AI calls retry once internally on JSON parse failure or 5xx.
- All write operations use Prisma transactions where multiple records change atomically.
- Failed operations must show user-friendly error messages in Indonesian (e.g., "AI sedang sibuk, coba lagi sebentar").

### 9.3 Security

- Validate all inputs server-side with zod.
- File uploads: enforce MIME type allowlist (image/png, image/jpeg) and size limit (5MB).
- Never expose `GEMINI_API_KEY` or `SUPABASE_SERVICE_ROLE_KEY` to the client.
- Supabase Storage public URLs are acceptable for this MVP (no PII).

### 9.4 Accessibility

- All inputs must have proper labels.
- Buttons must have text or aria-label.
- Color contrast must meet WCAG AA for all UI elements.

### 9.5 Code Quality

- TypeScript strict mode enabled.
- Prefer server components for data fetching; client components only when interactivity required.
- Follow shadcn conventions for component composition.
- Comments in English, brief and meaningful.

---

## 10. Out of Scope (For This MVP)

The following are explicitly **NOT** part of this MVP. Do not implement:

- Payment / subscription / credits.
- PDF export.
- Proposal generation (per agreement, removed from scope).
- Team/multi-user features.
- Analytics or tracking.
- Email notifications.
- Localization beyond UI strings (only Indonesian UI; no i18n framework).
- Tests (out of scope for time-constrained MVP; can be added post-MVP).

---

## 11. Acceptance Criteria

The MVP is considered complete when:

1. ✅ A user can create a new project from `/projects/new` with at least the `clientRequest` field.
2. ✅ The project appears in `/projects` list immediately after creation.
3. ✅ Clicking into a project triggers the discovery flow if `status === DRAFT`.
4. ✅ The user can answer or skip discovery questions and proceed to analysis.
5. ✅ The analysis page displays all 6 auto-displayed cards with non-empty, sensible content.
6. ✅ Clicking "Generate Builder Prompt" with a selected tool returns a usable prompt.
7. ✅ Clicking "Generate Moodboard" or "Generate Concept" returns and displays an image.
8. ✅ Uploading a design image returns feedback with alignment score, strengths, and issues.
9. ✅ All AI calls show appropriate loading and error states.
10. ✅ The application is deployed on Vercel and publicly accessible.
11. ✅ A `README.md` documents setup, env vars, and how to run locally.

---

## 12. Demo Walkthrough (For Asistant Lab Review)

To showcase the app, run this scenario:

1. Open the deployed URL.
2. Click "Mulai Project Baru".
3. Fill the form with the café example:
   - Client Request: "I want a modern aesthetic café website. Limited budget but need it to look beautiful."
   - Business Type: "Café"
   - Target User: "Local young professionals and students"
   - Website Goal: "Increase dine-in visits and brand awareness"
   - Tech Stack: "Framer"
   - Desired Complexity: "Clean & Professional"
4. Submit, navigate to project page.
5. Click "Mulai Discovery" → see 5–7 questions in Indonesian-friendly English.
6. Skip or answer 2–3 questions, then "Generate Analisis".
7. Show the result page: walk through each card.
8. Click "Generate Builder Prompt" with target "v0".
9. Click "Generate Moodboard" — wait for image.
10. Upload a sample mockup → show validation feedback.

---

**End of SRS.**
