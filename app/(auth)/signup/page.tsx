import Link from 'next/link'
import { signup } from '../actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Sparkles, UserPlus } from 'lucide-react'

export default async function SignupPage({ searchParams }: { searchParams: Promise<{ message: string, type?: string }> }) {
  const params = await searchParams;
  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 stitch-canvas relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/10 blur-[100px] rounded-full pointer-events-none" />

      <Card className="w-full max-w-md bg-[#141414] border-white/[0.08] shadow-2xl relative z-10 rounded-2xl overflow-hidden backdrop-blur-sm">
        <CardHeader className="space-y-3 pb-8 pt-8">
          <div className="flex justify-center mb-2">
            <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
              <UserPlus className="h-6 w-6 text-blue-400" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-center text-neutral-100">Buat Akun AIUI</CardTitle>
          <CardDescription className="text-center text-neutral-500">
            Daftar untuk mulai mendesain mobile UI secara cerdas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-5" action={signup}>
            <div className="space-y-2">
              <Label htmlFor="name" className="text-neutral-400 text-xs font-semibold uppercase tracking-wider">Nama Lengkap</Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="Budi Santoso"
                required
                className="w-full bg-[#1a1a1a] border-white/[0.08] text-neutral-200 placeholder:text-neutral-600 h-11 focus:ring-blue-500/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-neutral-400 text-xs font-semibold uppercase tracking-wider">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="nama@email.com"
                required
                className="w-full bg-[#1a1a1a] border-white/[0.08] text-neutral-200 placeholder:text-neutral-600 h-11 focus:ring-blue-500/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-neutral-400 text-xs font-semibold uppercase tracking-wider">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                className="w-full bg-[#1a1a1a] border-white/[0.08] text-neutral-200 h-11 focus:ring-blue-500/50"
              />
            </div>

            {params?.message && (
              <div className={`border rounded-lg p-3 ${params.type === 'success' ? 'bg-green-500/10 border-green-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
                <p className={`text-xs font-medium text-center ${params.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                  {params.message}
                </p>
              </div>
            )}

            <Button type="submit" className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 text-white h-11 font-bold shadow-lg shadow-blue-900/20 transition-all active:scale-[0.98]">
              Daftar Sekarang
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 items-center pb-8 pt-4">
          <div className="text-sm text-neutral-500">
            Sudah punya akun?{' '}
            <Link href="/login" className="text-blue-400 hover:text-blue-300 font-bold transition-colors">
              Masuk di sini
            </Link>
          </div>
        </CardFooter>
      </Card>

      <p className="mt-8 text-neutral-600 text-xs tracking-widest uppercase font-medium relative z-10">
        AI-Powered UI/UX Workflow
      </p>
    </div>
  )
}
