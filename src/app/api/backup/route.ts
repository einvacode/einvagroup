import { promises as fs } from "fs";
import path from "path";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";

function resolveDbPath(): string {
  const databaseUrl = process.env.DATABASE_URL || "file:./dev.db";

  if (!databaseUrl.startsWith("file:")) {
    return path.resolve(/* turbopackIgnore: true */ process.cwd(), databaseUrl);
  }

  const sqlitePath = databaseUrl.replace(/^file:/, "");
  return path.isAbsolute(sqlitePath)
    ? sqlitePath
    : path.resolve(/* turbopackIgnore: true */ process.cwd(), sqlitePath);
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return new NextResponse("Unauthorized", { status: 401 });

    const { searchParams } = new URL(request.url);
    const download = searchParams.get("download") === "1";

    const dbPath = resolveDbPath();
    const backupDir = path.resolve(process.cwd(), "backups");
    await fs.mkdir(backupDir, { recursive: true });

    const backupName = `backup-${new Date().toISOString().replace(/[:.]/g, "-")}.db`;
    const backupPath = path.join(backupDir, backupName);

    await fs.copyFile(dbPath, backupPath);

    if (download) {
      const file = await fs.readFile(backupPath);
      return new NextResponse(file, {
        headers: {
          "Content-Type": "application/octet-stream",
          "Content-Disposition": `attachment; filename="${backupName}"`,
        },
      });
    }

    return NextResponse.json({
      ok: true,
      fileName: backupName,
      backupPath,
    });
  } catch (error) {
    console.error("Backup database error", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return new NextResponse("Unauthorized", { status: 401 });

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return new NextResponse("File restore tidak ditemukan", { status: 400 });
    }

    const fileName = file.name.toLowerCase();
    if (!fileName.endsWith(".db") && !fileName.endsWith(".sqlite") && !fileName.endsWith(".sql")) {
      return new NextResponse("Format file backup tidak valid", { status: 400 });
    }

    const dbPath = resolveDbPath();
    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.mkdir(path.dirname(dbPath), { recursive: true });
    await fs.writeFile(dbPath, buffer);

    return NextResponse.json({
      ok: true,
      restored: file.name,
      databasePath: dbPath,
    });
  } catch (error) {
    console.error("Restore database error", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
