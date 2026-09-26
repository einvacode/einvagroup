import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const projectSchema = z.object({
  name: z.string().min(1, "Nama proyek wajib diisi"),
  clientId: z.string().min(1, "Klien wajib dipilih"),
  type: z.string().min(1, "Tipe pekerjaan wajib diisi"),
  description: z.string().optional().or(z.literal("")),
  location: z.string().optional().or(z.literal("")),
  budget: z.coerce.number().default(0).optional(),
  startDate: z.string().optional().or(z.literal("")),
  endDate: z.string().optional().or(z.literal("")),
});

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const type = searchParams.get("type");
    const search = searchParams.get("search");

    const where: any = {};
    if (status && status !== "Semua") where.status = status;
    if (type && type !== "Semua") where.type = type;
    if (search) where.name = { contains: search };

    const projects = await prisma.project.findMany({
      where,
      include: { client: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(projects);
  } catch (error) {
    console.error("GET Projects Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const data = projectSchema.parse(body);

    const project = await prisma.project.create({
      data: {
        name: data.name,
        clientId: data.clientId,
        type: data.type,
        description: data.description || null,
        location: data.location || null,
        budget: Number(data.budget ?? 0),
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.endDate ? new Date(data.endDate) : undefined,
        userId: session.user.id,
        status: "PLANNING",
        progress: 0,
      },
    });

    return NextResponse.json(project);
  } catch (error) {
    console.error("POST Projects Error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid data", details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
