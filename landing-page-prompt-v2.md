# Prompt untuk Agent Antigravity (Claude Opus 4.6) — AIUI Mobile Landing Page Extension

## Context Aplikasi

Aplikasi kita bernama **AIUI Mobile**, sebuah AI-Powered Mobile UI/UX Workspace. Stack: **Next.js (App Router), Prisma (PostgreSQL via Supabase), Tailwind, shadcn/ui, React Flow (`@xyflow/react`), Google Gemini Multimodal API**.

**Core fitur** ada di halaman Workspace (`components/workspace/WorkspaceView.tsx`) — kanvas interaktif React Flow tempat user bisa lihat:
- Kartu analisis AI (`UxReasoningCard`, `VisualDirectionCard`, `FeatureScopeTable`, `RiskFactorCard`, `ComplexityCard`, `BuilderPromptCard`)
- Moodboard images yang di-generate via Gemini Multimodal (`api/projects/[id]/generate-image/route.ts`)
- `ChatPanel` untuk iterasi desain secara real-time

Database punya model: `User`, `Project`, `DiscoveryQA`, `Analysis`, `GeneratedImage`, `DesignValidation`.

## Current State Landing Page (`app/page.tsx`)

Hero section sudah ada dengan elemen:
- Badge "AI-Powered Mobile UI/UX Workspace"
- Headline gradient: "Transform Brief into High-Definition Designs"
- Subheadline Bahasa Indonesia
- Primary CTA "Mulai Sekarang" (purple `#7c3aed`) → `/projects/new`
- Secondary CTA "Dashboard Project" (outlined) → `/projects`
- Mockup screenshot workspace (3-panel layout) di bawah CTAs

**Existing palette**: Background `#0a0a0a` (near-black), card `#1a1a1a`, primary purple `#7c3aed` to `#a855f7` gradient, accent indigo-to-purple-to-pink gradient untuk text highlight, muted gray untuk body text.

## Task

**JANGAN ubah hero section yang sudah ada.** Tambahkan section-section baru **DI BAWAH** hero, dengan urutan dan spec berikut. Reuse design tokens existing (warna, font, spacing, card style).

---

## Section yang Harus Ditambahkan

### Section 1: Problem Statement — "The Gap"

**Anchor section dengan `id="problem"`.**

- Eyebrow text kecil di atas heading: `THE GAP` (uppercase, tracking-widest, text-purple-400, text-sm)
- Heading utama: **"Brief Klien → Desain Valid. Kenapa Selalu Panjang dan Berdarah?"** (text-4xl md:text-6xl font-bold, putih, max-width center)
- Subheading paragraph (text-lg, text-muted/gray-400, max-w-3xl mx-auto, center):
  > "Proses mengubah client brief menjadi desain yang valid sering kali memakan waktu lama dan terjadi miskomunikasi antara desainer dan developer. Tiga akar masalah yang berulang:"

- Grid **3 kolom** (desktop) / **1 kolom** (mobile) berisi 3 pain point cards. Tiap card:
  - Background card sama seperti existing card style (subtle border, rounded-2xl, `bg-white/[0.02]`, border `border-white/10`, padding p-8)
  - Icon di atas (size 32–40px, di dalam rounded-lg container dengan tint warna sesuai severity)
  - Title (text-xl font-semibold)
  - Description (text-base text-gray-400 leading-relaxed)

  **Card 1** — Icon: `Eye` (lucide-react), tint icon container `bg-red-500/10 text-red-400`
  - Title: "Visualisasi Teknis yang Kabur"
  - Desc: "Kebutuhan teknis dan estetika klien sering tidak jelas di tahap brief. Desainer baru sadar masalah setelah revisi ketiga — saat budget dan waktu sudah tergerus."

  **Card 2** — Icon: `Palette` (lucide-react), tint `bg-amber-500/10 text-amber-400`
  - Title: "Moodboard Manual yang Meleset"
  - Desc: "Mengumpulkan referensi visual satu per satu tanpa kerangka analisis sering menghasilkan moodboard yang tidak selaras dengan target audiens. Hasilnya: revisi besar di tahap visual direction."

  **Card 3** — Icon: `Sparkles` (lucide-react), tint `bg-blue-500/10 text-blue-400`
  - Title: "Prompt AI Builder yang Generik"
  - Desc: "Membuat prompt akurat untuk v0, Lovable, atau Bolt butuh skill terpisah. Tanpa konteks analisis, hasil generate AI builder sering generik dan tidak match brief."

---

### Section 2: Solution — "The Solution"

**Anchor `id="solution"`.**

- Eyebrow: `THE SOLUTION` (text-purple-400)
- Heading: **"Satu Kanvas. Lima Pilar. Hasil yang Konsisten."** (text-4xl md:text-6xl font-bold)
- Subheading: 
  > "AIUI Mobile mempercepat transformasi brief menjadi desain high-definition melalui satu kanvas terpadu. Tidak ada lagi bolak-balik antara Figma, Notion, dan chat klien."

- Grid **5 pillar cards**. Layout responsive: 
  - Desktop (≥1024px): grid 3 kolom (3 pillar di atas, 2 pillar di bawah dengan justify-center atau `lg:grid-cols-5`)
  - Tablet: 2 kolom
  - Mobile: 1 kolom
- Tiap pillar card style sama seperti pain point card tapi dengan **purple accent** (icon container `bg-purple-500/10 text-purple-400`):

  1. **Project Discovery** — Icon `Compass`  
     "AI generate 5–7 pertanyaan kontekstual berdasarkan brief klien. Form discovery menggali kebutuhan yang biasanya terlewat."

  2. **AI Analysis** — Icon `BrainCircuit`  
     "Google Gemini menghasilkan UX Reasoning, Feature Scope, Complexity Estimate, Visual Direction, dan Risk Factor — semua disimpan di model `Analysis`."

  3. **Moodboard Generation** — Icon `ImageIcon`  
     "Visual direction (palette, typography, mood) dirender jadi moodboard image via Gemini Multimodal. Bisa di-iterate lewat ChatPanel real-time."

  4. **Unified Canvas** — Icon `LayoutGrid`  
     "Powered by React Flow. Tiga panel: analisis di kiri, kanvas interaktif di tengah, validasi per-image di kanan. Pan, zoom, drag — semua dalam satu layar."

  5. **Prompt Architect** — Icon `Code2`  
     "Auto-generate prompt siap-paste untuk Stitch, Framer, v0, Bolt, Lovable, Replit, atau Claude. Konteks analisis ikut di-inject otomatis."

- Di pojok card pillar **Unified Canvas**, tambahkan badge kecil `text-xs px-2 py-1 rounded-full bg-purple-500/20 text-purple-300` bertuliskan **"CORE"** — supaya jelas mana fitur unggulan.

---

### Section 3: System Workflow

**Anchor `id="workflow"`.**

- Eyebrow: `HOW IT WORKS` (text-purple-400)
- Heading: **"Dari Login Sampai Desain Tervalidasi, dalam 5 Langkah."**
- Subheading: "Alur kerja yang sudah dipikirkan supaya tidak ada langkah yang membuang waktu."

- **Visual diagram horizontal di desktop, vertical di mobile.** Implementasi pakai **HTML + Tailwind + lucide-react arrows**. **JANGAN install library diagram baru** (no Mermaid, no React Flow di sini, no D3).

- 5 step cards dengan connector arrow di antara mereka:

  **Step 01** — Icon `LogIn`, title "User Login", desc: "Auth via Supabase. Project list muncul di `/projects`."  
  **Step 02** — Icon `FileText`, title "Isi Form Discovery", desc: "Brief klien, business type, tech stack, complexity — semua tersimpan di model `Project`."  
  **Step 03** — Icon `Loader2`, title "Generating Analysis", desc: "Gemini memproses brief → menghasilkan UX Reasoning, Feature Scope, Visual Direction, dst."  
  **Step 04** — Icon `LayoutDashboard`, title "Analysis Result Page", desc: "6 kartu analisis muncul di sidebar kiri Workspace. Builder Prompt siap di-copy."  
  **Step 05** — Icon `Sparkles`, title "Generate & Validate", desc: "Generate moodboard via Gemini Multimodal, validasi per-image di sidebar kanan, iterate via ChatPanel."

- **Connector style**:
  - Desktop: `ChevronRight` icon di antara card, opacity-40
  - Mobile: `ChevronDown` icon di tengah, opacity-40
- **Card style** untuk step: smaller than pillar card (p-6), step number besar di atas (`text-5xl font-bold text-purple-500/30` di background atau corner), icon di tengah card, title, desc pendek.

---

### Section 4: Demo Section

**Anchor `id="demo"`.**

- Eyebrow: `LIVE DEMO`
- Heading: **"Studi Kasus: Dari Brief Café Aesthetic Sampai Moodboard Tervalidasi."**

- Layout **2 kolom di desktop** (text kiri, visual kanan), **stack di mobile**:

#### Kolom Kiri (text content, space-y-10):

**Sub-block 1: Brief**
- Mini-heading: "Brief" (text-sm uppercase tracking-wider text-purple-400)
- Card kecil (atau quote-style dengan border-left-4 border-purple-500 pl-4):
  > "Saya butuh aplikasi mobile pesan waffle dari kantin kampus ITS. Budget terbatas, target mahasiswa, harus simple tapi clean. Tech stack bebas, tapi prefer yang gampang maintenance."
- Caption kecil di bawah quote: "— Brief klien (contoh real dari user kami)"

**Sub-block 2: Tech Stack**
- Mini-heading: "Tech Stack"
- Grid badges (gunakan komponen `Badge` dari shadcn, variant outline atau secondary):
  - `Next.js 14 (App Router)`
  - `TypeScript`
  - `Tailwind CSS`
  - `shadcn/ui`
  - `Prisma`
  - `Supabase (PostgreSQL + Auth)`
  - `Google Gemini Multimodal`
  - `@xyflow/react (React Flow)`
  - `Vercel (Deploy)`

**Sub-block 3: Challenges & Solution**
- Mini-heading: "Challenges & Solution"
- 3 bullet point dalam card:
  - **Challenge**: "Canvas free-form yang ringan tanpa Pro license." → **Solution**: "React Flow free tier dengan custom nodes untuk image cards. Pan & zoom natively didukung."
  - **Challenge**: "Konsistensi prompt antara analysis, moodboard, dan builder export." → **Solution**: "Modular prompt files di `lib/prompts/` dengan shared context object yang di-inject ke setiap call Gemini."
  - **Challenge**: "Feedback validasi per-image tanpa overwhelm UI." → **Solution**: "Sidebar kanan reactive terhadap selected node di React Flow. Selected node = tampilkan validation, no node selected = empty state 'Belum divalidasi'."

  Pakai pattern: bold label "Challenge:" dan "Solution:" inline, atau dua baris dengan visual divider (→ atau garis).

#### Kolom Kanan (visual):

- **Placeholder mockup** dari Workspace dengan aspect ratio 4/3 atau 16/10.
- Pakai `<div>` dengan:
  - `bg-gradient-to-br from-purple-900/20 via-black to-black`
  - `border border-white/10`
  - `rounded-2xl`
  - `aspect-[4/3]`
  - Di dalamnya: 3 column flex showing simplified silhouette (sidebar kiri w-1/4 dengan beberapa skeleton bar, canvas tengah dengan 2-3 image placeholder, sidebar kanan w-1/4 dengan skeleton). Pure CSS, no real images.
- Sticky positioning kalau memungkinkan (`lg:sticky lg:top-24`) supaya saat user scroll di kolom kiri, visual stays.

---

### Section 5: Final CTA

- Background: subtle radial gradient atau dark purple tint (`bg-gradient-to-b from-purple-950/20 to-black`)
- Heading: **"Siap Mengubah Cara Kamu Mendesain?"**
- Subtext: "Mulai project pertama kamu. AIUI Mobile gratis selama MVP."
- Dua tombol berdampingan (sama style seperti hero CTAs):
  - Primary: `Mulai Project Baru` → `/projects/new` (purple solid)
  - Secondary: `Lihat Project Sebelumnya` → `/projects` (outlined)

---

### Section 6: Footer Minimal

- Border-top `border-white/10`
- Layout flex justify-between (desktop) / stacked (mobile):
  - Kiri: Logo "AIUI **Mobile**" (sama style seperti navbar) + tagline kecil "AI-Powered Mobile UI/UX Workspace"
  - Kanan: link "Projects" → `/projects`, "Dashboard" → `/projects`
- Copyright row di bawah: `© 2026 AIUI Mobile · Built with Next.js, Prisma, dan Gemini Multimodal`

---

## Design Constraints (WAJIB DIPATUHI)

1. **Reuse design tokens existing**. Buka `tailwind.config.ts` dan `app/globals.css` sebelum nulis kode. Pakai warna yang sudah didefinisikan (CSS variables seperti `--background`, `--foreground`, `--muted-foreground`, dll).
2. **Komponen shadcn**: `Button`, `Card` (kalau dipakai), `Badge`. Generate via `npx shadcn-ui@latest add <component>` kalau belum ada.
3. **Icons**: hanya dari `lucide-react`. Daftar: `Eye`, `Palette`, `Sparkles`, `Compass`, `BrainCircuit`, `ImageIcon`, `LayoutGrid`, `Code2`, `LogIn`, `FileText`, `Loader2`, `LayoutDashboard`, `ChevronRight`, `ChevronDown`.
4. **Responsive**: test mobile (≤640px), tablet (768–1024px), desktop (≥1024px). No horizontal scroll.
5. **Animasi**: minimal. Boleh fade-in saat scroll via `framer-motion` (kalau sudah ter-install) atau pure CSS `@keyframes`. Tidak ada parallax, no scroll-jacking, no auto-play video background.
6. **Typography hierarchy**:
   - Section heading: `text-4xl md:text-6xl font-bold tracking-tight`
   - Eyebrow: `text-sm font-semibold tracking-widest uppercase text-purple-400`
   - Card title: `text-xl font-semibold`
   - Body: `text-base text-gray-400 leading-relaxed`
   - Subheading paragraph: `text-lg text-gray-400`
7. **Spacing section**: `py-24 md:py-32` antar section. Container: `max-w-7xl mx-auto px-6`.
8. **Card hover effect**: subtle (e.g., `hover:border-purple-500/30 hover:bg-white/[0.04] transition-colors duration-200`).
9. **Smooth scroll**: tombol "Lihat Demo" di hero (kalau ada) harus smooth-scroll ke `#demo`. Pakai `<a href="#demo">` plus `scroll-smooth` di `<html>` di `app/layout.tsx` (cek dulu, jangan duplicate).

---

## Larangan (HARD NO)

- ❌ **JANGAN ubah hero section yang sudah ada**. Cek dulu existing `app/page.tsx`, identifikasi hero block-nya, dan **append** section baru di bawahnya.
- ❌ **JANGAN ubah halaman lain** selain `app/page.tsx` (kecuali `app/layout.tsx` kalau perlu tambah `scroll-smooth` di `<html>`, dan itu pun harus check dulu kalau belum ada).
- ❌ **JANGAN generate atau download image AI**. Mockup pakai pure CSS placeholder (skeleton-style).
- ❌ **JANGAN install library berat**: no GSAP, no Lottie, no three.js, no Mermaid, no D3.
- ❌ **JANGAN tambah section testimonials, pricing, atau team** — semua belum ada datanya.
- ❌ **JANGAN refactor komponen lain** di `components/`. Tugasmu cuma extend `app/page.tsx`.
- ❌ **JANGAN ganti palette atau font global**.
- ❌ **JANGAN bikin navbar baru**. Navbar sudah ada di layout (dari screenshot terlihat: "AIUI Mobile" + "Projects" + "Logout" — itu di `app/layout.tsx` atau component shared, jangan disentuh).
- ❌ **Copy text utama harus Bahasa Indonesia**. Istilah teknis (UX Reasoning, Visual Direction, Builder Prompt, Discovery, dll) boleh tetap English seperti yang sudah ada di app.

---

## Komponen Baru (Opsional, Recommended)

Kalau mau pisah supaya `app/page.tsx` ga jadi monster file, bikin di `components/landing/`:
- `ProblemSection.tsx`
- `SolutionSection.tsx`
- `WorkflowSection.tsx`
- `DemoSection.tsx`
- `FinalCtaSection.tsx`
- `LandingFooter.tsx`

Dan helper kecil kalau perlu:
- `components/landing/PillarCard.tsx` (reusable untuk pain point & pillar)
- `components/landing/WorkflowStep.tsx`

---

## Acceptance Criteria

- ✅ Hero section existing tetap **persis sama**, tidak berubah sedikit pun.
- ✅ Section Problem, Solution, Workflow, Demo, Final CTA, Footer terurut di bawah hero.
- ✅ Semua CTA link bekerja (`/projects/new`, `/projects`).
- ✅ Anchor links `#problem`, `#solution`, `#workflow`, `#demo` bekerja dan smooth-scroll.
- ✅ Responsive di mobile, tablet, desktop tanpa horizontal overflow.
- ✅ `npm run build` sukses tanpa error.
- ✅ Tidak ada error console saat browse.
- ✅ Konsisten dengan design existing (dark theme, purple accent, gradient text yang sudah dipakai).
- ✅ Semua icon dari `lucide-react`, tidak ada SVG inline yang ngarang.

---

## Output

1. File `app/page.tsx` yang updated (hero tetap, sections baru di-append).
2. (Opsional) File-file baru di `components/landing/`.
3. Brief summary di akhir: section apa saja yang dibuat, file baru apa, dan ada/tidaknya install package baru.

---

## Step Pertama (WAJIB)

Sebelum nulis kode apapun:
1. `view app/page.tsx` — identifikasi structure hero yang ada.
2. `view app/layout.tsx` — cek navbar dan apakah `scroll-smooth` sudah ada.
3. `view tailwind.config.ts` dan `app/globals.css` — pahami CSS variables dan color tokens.
4. `view components/ui/` (list folder) — pastikan `Button` dan `Badge` ada.
5. Baru mulai append section. Hero **JANGAN DISENTUH**.

Setelah selesai, jalankan `npm run build` untuk verifikasi.
