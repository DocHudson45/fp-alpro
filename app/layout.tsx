import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "@xyflow/react/dist/style.css";
import Link from "next/link";
import { Toaster } from "@/components/ui/sonner";
import { createClient } from "@/lib/supabase/server";
import { logout } from "@/app/(auth)/actions";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AIUI — Mobile UI/UX Design Assistant",
  description: "Analisis & generate desain mobile UI/UX dengan bantuan AI. Dari brief jadi panduan visual.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return (
    <html lang="id" className="dark">
      <body className={`${inter.className} min-h-screen bg-[#0a0a0a] flex flex-col`}>
        <header className="sticky top-0 z-50 w-full glass glass-border">
          <div className="container mx-auto flex h-14 items-center px-4 md:px-8">
            <Link href="/" className="font-bold text-lg tracking-tight flex items-center gap-2">
              <span className="bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent">
                AIUI
              </span>
              <span className="text-xs font-medium text-neutral-500 hidden sm:inline">Mobile</span>
            </Link>
            <div className="flex-1" />
            <nav className="flex items-center space-x-6 text-sm font-medium">
              <Link
                href="/projects"
                className="transition-colors text-neutral-400 hover:text-neutral-200"
              >
                Projects
              </Link>
              {user ? (
                <form action={logout}>
                  <button type="submit" className="transition-colors text-neutral-400 hover:text-neutral-200">
                    Logout
                  </button>
                </form>
              ) : (
                <Link
                  href="/login"
                  className="transition-colors text-neutral-400 hover:text-neutral-200"
                >
                  Login
                </Link>
              )}
            </nav>
          </div>
        </header>
        <main className="flex-1">{children}</main>
        <Toaster />
      </body>
    </html>
  );
}
