'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { db } from '@/lib/db'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    let errorMessage = error.message;
    if (error.message.includes("Invalid login credentials")) {
      errorMessage = "Email belum terdaftar atau password salah, mohon registrasi terlebih dahulu.";
    }
    redirect(`/login?message=${encodeURIComponent(errorMessage)}`)
  }

  revalidatePath('/', 'layout')
  redirect('/projects')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const name = formData.get('name') as string

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })

  if (error) {
    let errorMessage = error.message;
    if (error.message.includes("User already registered")) {
      errorMessage = "Email telah terdaftar. Silakan login atau gunakan email lain.";
    }
    return redirect(`/signup?message=${encodeURIComponent(errorMessage)}`)
  }

  // Ensure the user exists in Prisma
  if (data.user) {
    await db.user.upsert({
      where: { id: data.user.id },
      update: { name },
      create: {
        id: data.user.id,
        email: data.user.email!,
        name,
      },
    })
  }

  return redirect(`/signup?message=${encodeURIComponent("Registrasi berhasil! Silakan periksa kotak masuk/spam email Anda untuk verifikasi.")}&type=success`)
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
