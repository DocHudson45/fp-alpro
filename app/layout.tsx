import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ClientFit AI",
  description: "Ubah brief klien yang vague jadi panduan website yang jelas.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={`${inter.className} min-h-screen bg-slate-50 flex flex-col`}>
        <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
          <div className="container mx-auto flex h-14 items-center px-4 md:px-8">
            <Link href="/" className="font-bold text-lg text-primary tracking-tight">
              ClientFit AI
            </Link>
            <div className="flex-1" />
            <nav className="flex items-center space-x-6 text-sm font-medium">
              <Link
                href="/projects"
                className="transition-colors hover:text-foreground/80 text-foreground/60"
              >
                Project
              </Link>
            </nav>
          </div>
        </header>
        <main className="flex-1">{children}</main>
        <Toaster />
      </body>
    </html>
  );
}
