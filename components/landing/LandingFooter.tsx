import Link from "next/link";

export function LandingFooter() {
  return (
    <footer className="border-t border-white/10">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          {/* Left: Logo + Tagline */}
          <div>
            <div className="font-bold text-lg tracking-tight flex items-center gap-2 mb-1">
              <span className="bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent">
                AIUI
              </span>
              <span className="text-sm font-medium text-neutral-500">
                Mobile
              </span>
            </div>
            <p className="text-sm text-gray-500">
              AI-Powered Mobile UI/UX Workspace
            </p>
          </div>

          {/* Right: Navigation Links */}
          <nav className="flex items-center gap-6 text-sm">
            <Link
              href="/projects"
              className="text-gray-400 hover:text-neutral-200 transition-colors"
            >
              Projects
            </Link>
            <Link
              href="/projects"
              className="text-gray-400 hover:text-neutral-200 transition-colors"
            >
              Dashboard
            </Link>
          </nav>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-6 border-t border-white/[0.06] text-center">
          <p className="text-xs text-gray-600">
            © 2026 AIUI Mobile · Built with Next.js, Prisma, dan Gemini
            Multimodal
          </p>
        </div>
      </div>
    </footer>
  );
}
