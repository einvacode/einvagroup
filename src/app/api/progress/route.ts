import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { z } from "zod"

const progressSchema = z.object({
  projectId: z.string().min(1, "Proyek harus dipilih"),
  percentage: z.number().min(0).max(100),
  note: z.string().optional(),
  photos: z.string().optional() // JSON string array
})

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')

    const where: any = {}
    if (projectId) where.projectId = projectId

    const progress = await prisma.progressUpdate.findMany({
      where,
      include: {
        user: { select: { id: true, name: true } },
        project: { select: { id: true, name: true, progress: true } }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(progress)
  } catch (error) {
    console.error("GET /api/progress error:", error)
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
    const result = progressSchema.safeParse(body)
    
    if (!result.success) {
      return NextResponse.json({ error: result.error.errors[0].message }, { status: 400 })
    }
    
    const data = result.data

    // Use Prisma transaction to create progress update and update project progress
    const [progressUpdate, project] = await prisma.$transaction([
      prisma.progressUpdate.create({
        data: {
          projectId: data.projectId,
          userId: session.user.id,
          percentage: data.percentage,
          note: data.note || null,
          photos: data.photos || "[]"
        }
      }),
      prisma.project.update({
        where: { id: data.projectId },
        data: { progress: data.percentage }
      })
    ])

    return NextResponse.json(progressUpdate, { status: 201 })
  } catch (error) {
    console.error("POST /api/progress error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
