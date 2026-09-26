"use client";

import { useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Database,
  GitBranch,
  HardDrive,
  Layers,
  RefreshCw,
  Terminal,
  X,
  Zap,
} from "lucide-react";

interface SystemUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SystemUpdateModal({ isOpen, onClose }: SystemUpdateModalProps) {
  const [status, setStatus] = useState<"idle" | "running" | "success" | "error">("idle");
  const [currentStep, setCurrentStep] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);

  const terminalRef = useRef<HTMLDivElement>(null);

  // Auto-scroll terminal logs
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [logs]);

  // Countdown timer for automatic page reload
  useEffect(() => {
    if (countdown === null) return;
    if (countdown <= 0) {
      window.location.reload();
      return;
    }
    const timer = setTimeout(() => {
      setCountdown((prev) => (prev !== null ? prev - 1 : null));
    }, 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  if (!isOpen) return null;

  const startUpdate = async () => {
    setStatus("running");
    setCurrentStep(1);
    setLogs(["[SISTEM] Memulai proses pembaruan aplikasi Einva Group...\n"]);
    setErrorMessage(null);
    setCountdown(null);

    try {
      const response = await fetch("/api/system/update", {
        method: "POST",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server merespon kode ${response.status}`);
      }

      if (!response.body) {
        throw new Error("Tidak dapat membaca data stream dari server.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const match = line.match(/^data:\s*(.*)$/);
          if (match) {
            try {
              const payload = JSON.parse(match[1]);
              if (payload.type === "step") {
                setCurrentStep(payload.step);
                setLogs((prev) => [...prev, `\n▶ [LANGKAH ${payload.step}/5] ${payload.message}\n`]);
              } else if (payload.type === "log") {
                setLogs((prev) => [...prev, payload.message]);
              } else if (payload.type === "done") {
                setStatus("success");
                setLogs((prev) => [...prev, `\n${payload.message}\n`]);
                setCountdown(5);
              } else if (payload.type === "error") {
                setStatus("error");
                setErrorMessage(payload.message);
                setLogs((prev) => [...prev, `\n❌ [ERROR] ${payload.message}\n`]);
              }
            } catch (e) {
              setLogs((prev) => [...prev, match[1]]);
            }
          }
        }
      }
    } catch (err: any) {
      setStatus("error");
      setErrorMessage(err.message || "Gagal menghubungi server");
      setLogs((prev) => [...prev, `\n❌ [ERROR] ${err.message || "Gagal menghubungi server"}\n`]);
    }
  };

  const steps = [
    { num: 1, label: "Backup Database", icon: Database },
    { num: 2, label: "Sinkronisasi Berkas", icon: GitBranch },
    { num: 3, label: "Install Dependensi", icon: Layers },
    { num: 4, label: "Skema Prisma", icon: HardDrive },
    { num: 5, label: "Build & Restart", icon: Zap },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm animate-in fade-in">
      <div className="relative flex max-h-[92vh] w-full max-w-2xl flex-col rounded-3xl border border-slate-200 bg-white shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600/10 text-blue-600 border border-blue-500/20">
              <RefreshCw className={`h-5 w-5 ${status === "running" ? "animate-spin text-blue-600" : ""}`} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Pembaruan Sistem & CT Lokal</h3>
              <p className="text-xs text-slate-500">Update aplikasi, sinkronisasi skema database & build otomatis</p>
            </div>
          </div>

          {status !== "running" && (
            <button
              onClick={onClose}
              className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Stepper Progress */}
          <div className="grid grid-cols-5 gap-2">
            {steps.map((s) => {
              const Icon = s.icon;
              const isCompleted = currentStep > s.num || status === "success";
              const isCurrent = currentStep === s.num && status === "running";

              return (
                <div key={s.num} className="flex flex-col items-center text-center">
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-xl border text-xs font-bold transition-all ${
                      isCompleted
                        ? "border-emerald-500 bg-emerald-50 text-emerald-600"
                        : isCurrent
                        ? "border-blue-600 bg-blue-600 text-white shadow-md shadow-blue-500/30 animate-pulse"
                        : "border-slate-200 bg-slate-50 text-slate-400"
                    }`}
                  >
                    {isCompleted ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <Icon className="h-4 w-4" />}
                  </div>
                  <span
                    className={`mt-1.5 text-[10px] font-semibold leading-tight line-clamp-1 ${
                      isCompleted ? "text-emerald-700" : isCurrent ? "text-blue-600" : "text-slate-400"
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Status Banners */}
          {status === "idle" && (
            <div className="rounded-2xl border border-blue-200 bg-blue-50/60 p-4 text-xs text-slate-700 space-y-2">
              <p className="font-bold text-blue-900 flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-blue-600" />
                <span>Siap Menjalankan Pembaruan Sistem</span>
              </p>
              <p className="leading-relaxed text-slate-600">
                Fitur ini akan mengeksekusi proses update menyeluruh di CT Proxmox lokal:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-slate-600">
                <li>Membuat backup database ke folder <code className="font-mono bg-white px-1 rounded">backups/</code> secara otomatis.</li>
                <li>Menyinkronkan perubahan berkas lokal atau git terbaru.</li>
                <li>Memeriksa dependensi paket & skema database Prisma.</li>
                <li>Mengompilasi build produksi Next.js.</li>
                <li>Me-restart service aplikasi di CT Proxmox secara mulus.</li>
              </ul>
            </div>
          )}

          {status === "success" && (
            <div className="rounded-2xl border border-emerald-300 bg-emerald-50 p-4 text-xs text-emerald-900 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-6 w-6 text-emerald-600 shrink-0" />
                <div>
                  <h4 className="font-bold text-sm text-emerald-950">Pembaruan Berhasil 100%!</h4>
                  <p className="text-emerald-700">Aplikasi telah diperbarui dan service telah di-restart.</p>
                </div>
              </div>
              {countdown !== null && (
                <div className="flex flex-col items-center bg-white px-3 py-1.5 rounded-xl border border-emerald-200 shadow-2xs">
                  <span className="text-[10px] text-slate-500 font-semibold">Memuat Ulang</span>
                  <span className="font-mono text-sm font-bold text-emerald-600">{countdown}s</span>
                </div>
              )}
            </div>
          )}

          {status === "error" && (
            <div className="rounded-2xl border border-rose-300 bg-rose-50 p-4 text-xs text-rose-900 flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-sm text-rose-950">Gagal Melakukan Pembaruan</h4>
                <p className="text-rose-700 mt-0.5">{errorMessage || "Periksa terminal log di bawah untuk detailnya."}</p>
              </div>
            </div>
          )}

          {/* Terminal Logs Output */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[10px]">
                <Terminal className="h-3.5 w-3.5 text-slate-700" />
                Konsol Log Pembaruan
              </span>
              {status === "running" && (
                <span className="text-blue-600 font-semibold flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-600 animate-pulse" />
                  Sedang Berjalan...
                </span>
              )}
            </div>

            <div
              ref={terminalRef}
              className="h-56 w-full overflow-y-auto rounded-2xl bg-slate-950 p-4 font-mono text-[11px] leading-relaxed text-emerald-400 border border-slate-800 shadow-inner select-text"
            >
              {logs.length === 0 ? (
                <span className="text-slate-600 italic">Klik tombol "Mulai Pembaruan" untuk memulai...</span>
              ) : (
                logs.map((log, idx) => (
                  <span key={idx} className="whitespace-pre-wrap">
                    {log}
                  </span>
                ))
              )}
              {status === "running" && <span className="inline-block w-2 h-4 bg-emerald-400 animate-pulse ml-1" />}
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/80 px-6 py-4">
          <button
            onClick={onClose}
            disabled={status === "running"}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition disabled:opacity-50"
          >
            {status === "success" ? "Tutup" : "Batal"}
          </button>

          {status === "idle" && (
            <button
              onClick={startUpdate}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-blue-700 transition active:scale-95"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Mulai Pembaruan Sekarang</span>
            </button>
          )}

          {status === "running" && (
            <button
              disabled
              className="inline-flex items-center gap-2 rounded-xl bg-blue-500 px-5 py-2.5 text-xs font-bold text-white cursor-not-allowed opacity-80"
            >
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span>Sedang Memperbarui...</span>
            </button>
          )}

          {status === "error" && (
            <button
              onClick={startUpdate}
              className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-rose-700 transition"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Coba Ulang</span>
            </button>
          )}

          {status === "success" && (
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-emerald-700 transition"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>Muat Ulang Sekarang</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
