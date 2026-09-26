import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { z } from "zod"

const scheduleSchema = z.object({
  projectId: z.string().min(1, "Proyek harus dipilih"),
  name: z.string().min(1, "Nama tugas harus diisi"),
  startDate: z.string().min(1, "Tanggal mulai harus diisi"),
  endDate: z.string().min(1, "Tanggal selesai harus diisi"),
  assigneeId: z.string().optional(),
  notes: z.string().optional(),
}).refine(data => new Date(data.endDate) >= new Date(data.startDate), {
  message: "Tanggal selesai tidak boleh lebih awal dari tanggal mulai",
  path: ["endDate"]
})

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')
    const assigneeId = searchParams.get('assigneeId')
    const status = searchParams.get('status')

    const where: any = {}
    if (projectId) where.projectId = projectId
    if (assigneeId) where.assigneeId = assigneeId
    if (status) where.status = status

    const schedules = await prisma.schedule.findMany({
      where,
      include: {
        project: { select: { id: true, name: true } },
        assignee: { select: { id: true, name: true } }
      },
      orderBy: { startDate: 'asc' }
    })

    return NextResponse.json(schedules)
  } catch (error) {
    console.error("GET /api/schedules error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const result = scheduleSchema.safeParse(body)
    
    if (!result.success) {
      return NextResponse.json({ error: result.error.errors[0].message }, { status: 400 })
    }
    
    const data = result.data

    const schedule = await prisma.schedule.create({
      data: {
        projectId: data.projectId,
        name: data.name,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        assigneeId: data.assigneeId || null,
        notes: data.notes || null,
        status: "PENDING"
      }
    })

    return NextResponse.json(schedule, { status: 201 })
  } catch (error) {
    console.error("POST /api/schedules error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
