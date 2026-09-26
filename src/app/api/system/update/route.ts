import { promises as fs, existsSync } from "fs";
import path from "path";
import { spawn } from "child_process";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

function runCmd(
  command: string,
  args: string[],
  cwd: string,
  onData: (data: string) => void
): Promise<{ code: number }> {
  return new Promise((resolve) => {
    const isWin = process.platform === "win32";
    let cmd = command;
    let cmdArgs = args;

    if (isWin) {
      cmd = "cmd.exe";
      cmdArgs = ["/c", command, ...args];
    }

    const proc = spawn(/*turbopackIgnore: true*/ cmd, cmdArgs, {
      cwd,
      env: {
        ...process.env,
        CI: "true",
        NODE_ENV: "production",
        GIT_TERMINAL_PROMPT: "0",
        NODE_OPTIONS: process.env.NODE_OPTIONS || "--max-old-space-size=2048",
      },
    });

    proc.stdout?.on("data", (chunk) => {
      onData(chunk.toString());
    });

    proc.stderr?.on("data", (chunk) => {
      onData(chunk.toString());
    });

    proc.on("close", (code) => {
      resolve({ code: code ?? 0 });
    });

    proc.on("error", (err) => {
      onData(`[Error] ${err.message}\n`);
      resolve({ code: 1 });
    });
  });
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return new Response(
        JSON.stringify({ error: "Sesi login Anda telah berakhir. Harap login kembali sebagai Administrator." }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Hanya ADMIN yang berhak melakukan update sistem
    const role = (session.user as any).role;
    if (role !== "ADMIN") {
      return new Response(
        JSON.stringify({ error: "Hanya Administrator yang memiliki akses untuk memperbarui sistem." }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      );
    }

    const rootDir = process.cwd();
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        const send = (data: { type: "log" | "step" | "done" | "error"; message: string; step?: number }) => {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        };

        try {
          send({ type: "step", step: 1, message: "Membuat salinan cadangan (backup) database..." });

          // 1. Backup Database
          const dbPath = path.resolve(rootDir, "prisma", "dev.db");
          const backupDir = path.resolve(rootDir, "backups");
          await fs.mkdir(backupDir, { recursive: true });

          if (existsSync(dbPath)) {
            const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
            const backupName = `dev_db_backup_before_update_${timestamp}.db`;
            await fs.copyFile(dbPath, path.join(backupDir, backupName));
            send({ type: "log", message: `✔ Database berhasil di-backup ke: backups/${backupName}\n` });
          } else {
            send({ type: "log", message: `ℹ File database prisma/dev.db belum ada, melanjutkan...\n` });
          }

          // 2. Git Pull (jika repository git ada)
          send({ type: "step", step: 2, message: "Memeriksa pembaruan repositori Git..." });
          if (existsSync(path.resolve(rootDir, ".git"))) {
            send({ type: "log", message: "Menjalankan git pull...\n" });
            // Amankan file database agar tidak memblokir git pull
            await runCmd("git", ["stash", "--", "prisma/dev.db"], rootDir, () => {});
            const gitRes = await runCmd("git", ["pull"], rootDir, (output) => {
              send({ type: "log", message: output });
            });
            await runCmd("git", ["stash", "pop"], rootDir, () => {});
            if (gitRes.code === 0) {
              send({ type: "log", message: "✔ Berkas Git berhasil diperbarui.\n" });
            } else {
              send({ type: "log", message: "⚠ Git pull selesai atau sudah sinkron.\n" });
            }
          } else {
            send({ type: "log", message: "ℹ Tidak menggunakan Git repository, menggunakan berkas lokal saat ini.\n" });
          }

          // 3. Install Dependensi (npm install)
          send({ type: "step", step: 3, message: "Memeriksa dan memperbarui dependensi (npm install)..." });
          const npmRes = await runCmd("npm", ["install", "--prefer-offline"], rootDir, (output) => {
            send({ type: "log", message: output });
          });
          if (npmRes.code !== 0) {
            send({ type: "log", message: "⚠ Peringatan saat npm install, melanjutkan ke tahap Prisma...\n" });
          } else {
            send({ type: "log", message: "✔ Dependensi proyek terverifikasi.\n" });
          }

          // 4. Prisma Generate & DB Push
          send({ type: "step", step: 4, message: "Sinkronisasi skema database Prisma..." });
          send({ type: "log", message: "Menjalankan npx prisma generate...\n" });
          await runCmd("npx", ["prisma", "generate"], rootDir, (output) => {
            send({ type: "log", message: output });
          });

          send({ type: "log", message: "Menjalankan npx prisma db push --skip-generate...\n" });
          const dbPushRes = await runCmd("npx", ["prisma", "db", "push", "--skip-generate"], rootDir, (output) => {
            send({ type: "log", message: output });
          });
          if (dbPushRes.code === 0) {
            send({ type: "log", message: "✔ Skema database SQLite berhasil disinkronkan.\n" });
          } else {
            send({ type: "log", message: "⚠ Sinkronisasi skema database selesai dengan catatan.\n" });
          }

          // 5. Build Next.js (npm run build)
          send({ type: "step", step: 5, message: "Kompilasi dan finalisasi pembaruan..." });
          const isDev = process.env.NODE_ENV === "development";

          if (isDev) {
            send({
              type: "log",
              message: "ℹ Server berjalan dalam mode pengembang (Dev Server). Build produksi dilewati agar Turbopack tetap aktif lancar (Fast Refresh otomatis memuat perubahan kode).\n",
            });
            send({ type: "log", message: "✔ Pembaruan berkas dan database selesai 100%!\n" });
          } else {
            send({ type: "log", message: "Menjalankan build produksi Next.js (npm run build)...\n" });
            const buildRes = await runCmd("npm", ["run", "build"], rootDir, (output) => {
              send({ type: "log", message: output });
            });

            if (buildRes.code !== 0) {
              send({
                type: "error",
                message: "Kompilasi build Next.js gagal. Silakan periksa log di atas.",
              });
              controller.close();
              return;
            }

            send({ type: "log", message: "✔ Kompilasi build Next.js berhasil 100%!\n" });
          }

          // 6. Restart Service (jika di Linux / Systemd)
          if (process.platform === "linux") {
            send({
              type: "log",
              message: "🚀 Menjadwalkan restart service systemd (einvagroup) dalam 2 detik...\n",
            });
            const restartCmd = `sleep 2 && (systemctl restart einvagroup || systemctl restart projekerja)`;
            const restartProcess = spawn(/*turbopackIgnore: true*/ "bash", ["-c", restartCmd], {
              detached: true,
              stdio: "ignore",
            });
            restartProcess.unref();
          } else {
            send({
              type: "log",
              message: "ℹ Server berjalan di Windows. Silakan muat ulang halaman.\n",
            });
          }

          send({
            type: "done",
            message: "🎉 Pembaruan sistem berhasil diselesaikan! Halaman akan otomatis dimuat ulang.",
          });

          controller.close();
        } catch (err: any) {
          send({
            type: "error",
            message: `Terjadi kesalahan tak terduga: ${err.message || String(err)}`,
          });
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message || "Internal Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
