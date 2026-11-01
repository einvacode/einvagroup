"use client"

import Link from "next/link"
import { ArrowLeft, ShieldAlert } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function RegisterPage() {
  return (
    <div className="mx-auto w-full max-w-md space-y-6">
      <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-blue-600">
        <ArrowLeft className="h-4 w-4" />
        Kembali ke Beranda
      </Link>

      <Card className="w-full border-amber-200 bg-amber-50/50">
        <CardHeader className="space-y-2 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-700">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <CardTitle className="text-2xl font-bold text-amber-800">Pendaftaran Ditutup</CardTitle>
          <CardDescription className="text-amber-700">
            Akun pengguna baru hanya dapat dibuat oleh Administrator.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-slate-700">
          <p>Untuk mendaftar atau menambahkan akun karyawan, silakan hubungi admin sistem.</p>
          <div className="rounded-xl border border-amber-200 bg-white/80 p-3 text-center">
            <Link href="/login" className="font-semibold text-blue-600 hover:underline">
              Masuk ke halaman login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
