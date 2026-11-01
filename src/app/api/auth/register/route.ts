import { NextResponse } from "next/server"

export async function POST() {
  return NextResponse.json(
    { message: "Pendaftaran akun baru dibatasi hanya oleh Administrator. Hubungi admin untuk membuat akun." },
    { status: 403 }
  )
}
