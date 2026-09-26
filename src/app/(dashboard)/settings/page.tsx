"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  Globe,
  Plus,
  Trash2,
  Edit2,
  ExternalLink,
  Layers,
  Briefcase,
  ShieldCheck,
  CheckCircle2,
  Save,
  RotateCcw,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import { SystemUpdateModal } from "@/components/system-update-modal";

// Default Services / Layanan
const defaultServices = [
  {
    iconName: "Camera",
    title: "Instalasi CCTV & Surveillance System",
    description:
      "Solusi pemasangan kamera pengawas IP Cam & HD-CVI berkualitas tinggi, integrasi NVR/DVR, pemantauan realtime via ponsel, dan rekaman terenkripsi untuk keamanan optimal.",
    badge: "Security System",
  },
  {
    iconName: "Network",
    title: "Infrastruktur Jaringan & Fiber Optic",
    description:
      "Pembangunan jaringan kabel LAN Cat6/Cat7, penarikan & splicing kabel Fiber Optic (FO) antar gedung, perapian rack server, serta konfigurasi router & switch enterprise.",
    badge: "Network Infrastructure",
  },
  {
    iconName: "Lock",
    title: "Access Control & Sistem Keamanan Gedung",
    description:
      "Pemasangan kunci pintu digital magnetik (EM Lock / Drop Bolt), absensi biometric fingerprint & RFID card, barrier gate kendaraan, serta sistem alarm peringatan dini.",
    badge: "Access & Control",
  },
  {
    iconName: "Zap",
    title: "Instalasi Kelistrikan & Grounding Proteksi",
    description:
      "Penataan jalur instalasi kelistrikan gedung komersial, perakitan panel MCB daya, sistem grounding penangkal petir, serta integrasi UPS cadangan untuk proteksi aset elektronik.",
    badge: "Electrical Engineering",
  },
  {
    iconName: "Wrench",
    title: "Perawatan & Maintenance Rutin (SLA)",
    description:
      "Layanan inspeksi berkala, audit performa jaringan, pembersihan fisik perangkat, penanganan kendala darurat, dan jaminan purna jual dengan response time cepat.",
    badge: "Maintenance & Support",
  },
  {
    iconName: "Layers",
    title: "Pengadaan Hardware & Solusi IT",
    description:
      "Penyediaan perangkat keras komputasi, rack server standar industri, access point WiFi berkepadatan tinggi, serta material instalasi bersertifikasi resmi.",
    badge: "Procurement",
  },
];

// Default Portfolio / Portofolio Proyek
const defaultPortfolio = [
  {
    title: "Sistem Surveillance Terpadu 50+ Titik",
    category: "Commercial & Retail",
    location: "Pusat Perbelanjaan & Kawasan Niaga",
    scope: "Pemasangan IP CCTV Resolusi 4MP, Ruang Kontrol Sentral, & Kabel UTP Cat6 Eksterior",
    highlight: "Monitoring 24/7 dengan ruang kendali sentral dan sistem backup penyimpanan.",
    tag: "CCTV & Keamanan",
  },
  {
    title: "Backbone Fiber Optic Antar Gedung 10G",
    category: "Corporate Office",
    location: "Kawasan Perkantoran Multigedung",
    scope: "Penarikan Kabel FO Armored Outdoor 300m, Fusion Splicing, OTB & Switch Layer-3",
    highlight: "Konektivitas data latensi rendah dan stabilitas koneksi antar divisi kerja.",
    tag: "Fiber Optic",
  },
  {
    title: "Access Control & Presensi Biometrik Terpusat",
    category: "Logistics & Warehousing",
    location: "Fasilitas Pergudangan Modern",
    scope: "Sistem Access Door EM-Lock, Fingerprint & RFID Scanner, Integrasi Cloud Database",
    highlight: "Pencatatan keluar-masuk karyawan otomatis dengan tingkat keamanan ganda.",
    tag: "Access Control",
  },
  {
    title: "Instalasi Kelistrikan Gedung Komersial 3 Lantai",
    category: "Commercial Building",
    location: "Kompleks Ruko & Perkantoran",
    scope: "Pemasangan Jalur Kelistrikan Baru, Panel Distribusi Daya, & Grounding Proteksi",
    highlight: "Standar instalasi rapi memenuhi sertifikasi kelaikan teknis dan keamanan beban.",
    tag: "Kelistrikan",
  },
  {
    title: "Peremajaan Rack Server & Kabel Terstruktur",
    category: "Enterprise Data Center",
    location: "Ruang Server Kantor Pusat",
    scope: "Cable Management, Patch Panel Cat6, Labeling Jalur, Penggantian Switch 48-Port",
    highlight: "Mengeliminasi kabel semrawut dan memudahkan pemeliharaan jangka panjang.",
    tag: "Server & IT",
  },
  {
    title: "WiFi Enterprise Kepadatan Tinggi (High Density)",
    category: "Hospitality & Commercial",
    location: "Ruang Publik & Area Pertemuan",
    scope: "Setup 12 Access Point WiFi-6, Seamless Roaming, Bandwidth Management Controller",
    highlight: "Konektivitas stabil untuk ratusan perangkat sekaligus tanpa buffering.",
    tag: "Wireless Network",
  },
];

const defaultProfile = {
  name: "Einva Group",
  tagline: "Installed Right, Serviced Better",
  address: "",
  city: "",
  phone: "",
  email: "",
  website: "",
  npwp: "",
  bankName: "",
  bankAccount: "",
  bankHolder: "",
  directorName: "",
  notes: "",
  logo: "",
  aboutText: "",
  servicesJson: "",
  portfolioJson: "",
  strengthsJson: "",
};

export default function CompanySettingsPage() {
  const [activeTab, setActiveTab] = useState<"profile" | "portal">("profile");
  const [profile, setProfile] = useState(defaultProfile);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [restoring, setRestoring] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [resettingDemo, setResettingDemo] = useState(false);

  // State untuk Portofolio
  const [portfolioList, setPortfolioList] = useState(defaultPortfolio);
  const [editingPortfolioIdx, setEditingPortfolioIdx] = useState<number | null>(null);
  const [portfolioForm, setPortfolioForm] = useState({
    title: "",
    category: "",
    location: "",
    scope: "",
    highlight: "",
    tag: "",
  });
  const [isAddingPortfolio, setIsAddingPortfolio] = useState(false);

  // State untuk Layanan
  const [servicesList, setServicesList] = useState(defaultServices);
  const [editingServiceIdx, setEditingServiceIdx] = useState<number | null>(null);
  const [serviceForm, setServiceForm] = useState({
    iconName: "Camera",
    title: "",
    description: "",
    badge: "",
  });
  const [isAddingService, setIsAddingService] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/company");
        if (!res.ok) return;
        const data = await res.json();
        const sanitized = {
          ...defaultProfile,
          ...data,
          name: data.name || defaultProfile.name,
          tagline: data.tagline ?? "",
          address: data.address ?? "",
          city: data.city ?? "",
          phone: data.phone ?? "",
          email: data.email ?? "",
          website: data.website ?? "",
          npwp: data.npwp ?? "",
          bankName: data.bankName ?? "",
          bankAccount: data.bankAccount ?? "",
          bankHolder: data.bankHolder ?? "",
          directorName: data.directorName ?? "",
          notes: data.notes ?? "",
          logo: data.logo ?? "",
          aboutText: data.aboutText ?? "",
        };
        setProfile(sanitized);

        // Parse servicesJson jika ada
        if (data.servicesJson) {
          try {
            const parsed = JSON.parse(data.servicesJson);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setServicesList(parsed);
            }
          } catch (e) {
            console.error("Gagal parse servicesJson", e);
          }
        }

        // Parse portfolioJson jika ada
        if (data.portfolioJson) {
          try {
            const parsed = JSON.parse(data.portfolioJson);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setPortfolioList(parsed);
            }
          } catch (e) {
            console.error("Gagal parse portfolioJson", e);
          }
        }
      } catch (error) {
        console.error("Gagal mengambil profil perusahaan", error);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (field: string, value: string) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const saveProfile = async (customPayload?: any) => {
    setSaving(true);
    setStatusMessage(null);

    const merged = { ...profile, ...(customPayload || {}) };
    const payload = {
      ...merged,
      servicesJson: JSON.stringify(servicesList),
      portfolioJson: JSON.stringify(portfolioList),
    };

    try {
      const res = await fetch("/api/company", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || "Gagal menyimpan data ke database");
      }

      const updated = await res.json();
      setProfile((prev) => ({ ...prev, ...updated }));
      setStatusMessage({ type: "success", text: "Perubahan profil berhasil disimpan!" });
      router.refresh();
      
      // Dispatch custom event to notify layout
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('profile-updated'));
      }
      return true;
    } catch (error: any) {
      setStatusMessage({ type: "error", text: error.message || "Gagal menyimpan perubahan. Periksa koneksi server." });
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleResetDemoData = async () => {
    const confirmation = prompt(
      'PERINGATAN: Tindakan ini akan MENGHAPUS SEMUA data sampel (Klien, Proyek, Invoice, Penawaran, Jadwal, Keuangan).\nAkun login Admin dan Profil Perusahaan Einva Group tetap aman.\n\nKetik "HAPUS" untuk mengonfirmasi:'
    );

    if (confirmation !== "HAPUS") {
      if (confirmation !== null) {
        alert("Penghapusan dibatalkan (kata konfirmasi tidak cocok).");
      }
      return;
    }

    setResettingDemo(true);
    setStatusMessage(null);

    try {
      const res = await fetch("/api/system/reset-demo", { method: "POST" });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Gagal membersihkan data sampel");
      }

      setStatusMessage({
        type: "success",
        text: "Semua data sampel berhasil dihapus! Database sekarang bersih untuk operasional riil.",
      });
      alert("Sukses: Seluruh data sampel berhasil dibersihkan!");
    } catch (error: any) {
      setStatusMessage({
        type: "error",
        text: error.message || "Gagal membersihkan data sampel.",
      });
    } finally {
      setResettingDemo(false);
    }
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingLogo(true);
    setStatusMessage(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.error || "Upload logo gagal");
      }

      const data = await res.json();
      const updatedProfile = { ...profile, logo: data.url };
      setProfile(updatedProfile);
      await saveProfile(updatedProfile);
      setStatusMessage({ type: "success", text: "Logo perusahaan berhasil diunggah dan disimpan!" });
    } catch (error) {
      setStatusMessage({ type: "error", text: error instanceof Error ? error.message : "Upload logo gagal." });
    } finally {
      setUploadingLogo(false);
      event.target.value = "";
    }
  };

  // Portfolio Handlers
  const handleSavePortfolioItem = () => {
    if (!portfolioForm.title.trim()) {
      alert("Judul portofolio wajib diisi!");
      return;
    }

    if (editingPortfolioIdx !== null) {
      const updated = [...portfolioList];
      updated[editingPortfolioIdx] = portfolioForm;
      setPortfolioList(updated);
      setEditingPortfolioIdx(null);
    } else {
      setPortfolioList([portfolioForm, ...portfolioList]);
      setIsAddingPortfolio(false);
    }

    setPortfolioForm({ title: "", category: "", location: "", scope: "", highlight: "", tag: "" });
  };

  const handleDeletePortfolioItem = (idx: number) => {
    if (confirm("Apakah Anda yakin ingin menghapus portofolio ini?")) {
      const updated = portfolioList.filter((_, i) => i !== idx);
      setPortfolioList(updated);
    }
  };

  const handleStartEditPortfolio = (idx: number) => {
    setEditingPortfolioIdx(idx);
    setPortfolioForm(portfolioList[idx]);
    setIsAddingPortfolio(true);
  };

  // Service Handlers
  const handleSaveServiceItem = () => {
    if (!serviceForm.title.trim()) {
      alert("Judul layanan wajib diisi!");
      return;
    }

    if (editingServiceIdx !== null) {
      const updated = [...servicesList];
      updated[editingServiceIdx] = serviceForm;
      setServicesList(updated);
      setEditingServiceIdx(null);
    } else {
      setServicesList([...servicesList, serviceForm]);
      setIsAddingService(false);
    }

    setServiceForm({ iconName: "Camera", title: "", description: "", badge: "" });
  };

  const handleDeleteServiceItem = (idx: number) => {
    if (confirm("Apakah Anda yakin ingin menghapus layanan ini?")) {
      const updated = servicesList.filter((_, i) => i !== idx);
      setServicesList(updated);
    }
  };

  const handleStartEditService = (idx: number) => {
    setEditingServiceIdx(idx);
    setServiceForm(servicesList[idx]);
    setIsAddingService(true);
  };

  const handleBackup = async () => {
    setStatusMessage({ type: "success", text: "Menyiapkan file backup database..." });

    try {
      const res = await fetch("/api/backup?download=1");
      if (!res.ok) throw new Error("Backup gagal");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const contentDisposition = res.headers.get("Content-Disposition") || "";
      const match = contentDisposition.match(/filename\s*=\s*"?([^";]+)"?/i);
      const filename = match?.[1] || "backup.db";

      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      setStatusMessage({ type: "success", text: `Database berhasil diunduh: ${filename}` });
    } catch (error) {
      setStatusMessage({ type: "error", text: "Gagal membuat backup database." });
    }
  };

  const handleRestore = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setRestoring(true);
    setStatusMessage({ type: "success", text: "Sedang memulihkan database..." });

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/backup", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      setStatusMessage({ type: "error", text: "Restore gagal dilakukan." });
      setRestoring(false);
      return;
    }

    setStatusMessage({ type: "success", text: "Restore database berhasil! Silakan muat ulang halaman." });
    setRestoring(false);
    event.target.value = "";
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="rounded-3xl border border-slate-200 bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 p-6 text-white shadow-xl flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/30 bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-200 mb-2">
            <Building2 className="h-3.5 w-3.5" />
            <span>Pengaturan Pusat</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Manajemen Informasi Perusahaan</h1>
          <p className="text-sm text-slate-300 mt-1">
            Kelola profil bisnis, surat resmi (SPH & Invoice), serta semua informasi portofolio di Web Portal.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2.5 text-xs font-bold text-slate-200 transition hover:bg-slate-800 hover:text-white"
          >
            <ExternalLink className="h-4 w-4 text-blue-400" />
            <span>Lihat Web Portal</span>
          </a>
          <button
            onClick={() => saveProfile()}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-md transition hover:bg-blue-500 disabled:opacity-60"
          >
            <Save className="h-4 w-4" />
            <span>{saving ? "Menyimpan..." : "Simpan Perubahan"}</span>
          </button>
        </div>
      </div>

      {/* Pesan Notifikasi Sukses / Gagal */}
      {statusMessage && (
        <div
          className={`flex items-center gap-3 rounded-2xl p-4 text-sm font-semibold border ${
            statusMessage.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-rose-50 text-rose-800 border-rose-200"
          }`}
        >
          {statusMessage.type === "success" ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
          ) : (
            <Sparkles className="h-5 w-5 text-rose-600 shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* TAB NAVIGATION */}
      <div className="flex border-b border-slate-200 gap-2">
        <button
          onClick={() => setActiveTab("profile")}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition -mb-px ${
            activeTab === "profile"
              ? "border-blue-600 text-blue-600 bg-white rounded-t-xl"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Building2 className="h-4 w-4" />
          <span>Profil & Dokumen Resmi</span>
        </button>

        <button
          onClick={() => setActiveTab("portal")}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition -mb-px ${
            activeTab === "portal"
              ? "border-blue-600 text-blue-600 bg-white rounded-t-xl"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Globe className="h-4 w-4" />
          <span>Web Portal & Portofolio Karya</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: PROFIL & DOKUMEN RESMI                                            */}
      {/* ========================================================================= */}
      {activeTab === "profile" && (
        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-5 gap-3">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Identitas Resmi Badan Usaha</h2>
                <p className="text-xs text-slate-500">
                  Data ini dipakai pada kop surat resmi Surat Penawaran Harga (SPH), Invoice, dan profil portal.
                </p>
              </div>
            </div>

            {/* Upload Logo Perusahaan */}
            <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-slate-50/70 p-5 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
                  {profile.logo ? (
                    <img src={profile.logo} alt="Logo perusahaan" className="h-full w-full object-contain p-2" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-600 text-2xl font-black text-white">
                      {profile.name?.slice(0, 1).toUpperCase() || "P"}
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">Logo Perusahaan</p>
                  <p className="text-xs text-slate-500">
                    Akan ditampilkan di header Web Portal, SPH PDF, dan Invoice resmi.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {profile.logo && (
                  <button
                    type="button"
                    onClick={async () => {
                      if (confirm("Hapus logo perusahaan saat ini?")) {
                        const updated = { ...profile, logo: "" };
                        setProfile(updated);
                        await saveProfile(updated);
                      }
                    }}
                    className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs font-bold text-rose-600 hover:bg-rose-100 transition cursor-pointer"
                  >
                    Hapus Logo
                  </button>
                )}
                <label className="inline-flex cursor-pointer items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white hover:bg-slate-800 transition cursor-pointer">
                  <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                  {uploadingLogo ? "Mengunggah..." : profile.logo ? "Ganti Logo" : "Upload Logo Baru"}
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <label className="space-y-1.5">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Nama Perusahaan</span>
                <input
                  value={profile.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="PT. Contoh Nama Perusahaan"
                />
              </label>

              <label className="space-y-1.5">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Motto / Tagline</span>
                <input
                  value={profile.tagline || ""}
                  onChange={(e) => handleChange("tagline", e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="Installed Right, Serviced Better"
                />
              </label>

              <label className="space-y-1.5 md:col-span-2">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Alamat Kantor Resmi</span>
                <textarea
                  value={profile.address || ""}
                  onChange={(e) => handleChange("address", e.target.value)}
                  className="min-h-20 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="Jl. Raya No. 123, Kecamatan, Kabupaten/Kota"
                />
              </label>

              <label className="space-y-1.5">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Kota / Provinsi</span>
                <input
                  value={profile.city || ""}
                  onChange={(e) => handleChange("city", e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-blue-500"
                  placeholder="Contoh: Jawa Tengah"
                />
              </label>

              <label className="space-y-1.5">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  No. Telepon / WhatsApp
                </span>
                <input
                  value={profile.phone || ""}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-blue-500"
                  placeholder="081234567890 (Otomatis jadi tombol chat WA)"
                />
              </label>

              <label className="space-y-1.5">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Email Resmi</span>
                <input
                  type="email"
                  value={profile.email || ""}
                  onChange={(e) => handleChange("email", e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-blue-500"
                  placeholder="info@perusahaan.com"
                />
              </label>

              <label className="space-y-1.5">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Website</span>
                <input
                  type="url"
                  value={profile.website || ""}
                  onChange={(e) => handleChange("website", e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-blue-500"
                  placeholder="https://perusahaan.com"
                />
              </label>

              <label className="space-y-1.5">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Nomor NPWP</span>
                <input
                  value={profile.npwp || ""}
                  onChange={(e) => handleChange("npwp", e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-blue-500"
                  placeholder="00.000.000.0-000.000"
                />
              </label>

              <label className="space-y-1.5">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Nama Direktur / Pimpinan</span>
                <input
                  value={profile.directorName || ""}
                  onChange={(e) => handleChange("directorName", e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-blue-500"
                  placeholder="Nama Penandatangan SPH"
                />
              </label>
            </div>

            <div className="border-t border-slate-100 pt-6">
              <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                <span>Informasi Rekening Bank Resmi Perusahaan</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <label className="space-y-1.5">
                  <span className="text-xs font-medium text-slate-600">Nama Bank</span>
                  <input
                    value={profile.bankName || ""}
                    onChange={(e) => handleChange("bankName", e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-500"
                    placeholder="Contoh: Bank BRI / Mandiri"
                  />
                </label>
                <label className="space-y-1.5">
                  <span className="text-xs font-medium text-slate-600">Nomor Rekening</span>
                  <input
                    value={profile.bankAccount || ""}
                    onChange={(e) => handleChange("bankAccount", e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-mono outline-none transition focus:border-blue-500"
                    placeholder="1234-5678-9000"
                  />
                </label>
                <label className="space-y-1.5">
                  <span className="text-xs font-medium text-slate-600">Atas Nama (Pemilik)</span>
                  <input
                    value={profile.bankHolder || ""}
                    onChange={(e) => handleChange("bankHolder", e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-500"
                    placeholder="PT. NAMA PERUSAHAAN"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Backup & Restore Database */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs">
            <h2 className="text-lg font-bold text-slate-900">Backup & Restore Database SQLite</h2>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              Unduh salinan berkas database atau pulihkan data dari file backup cadangan.
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleBackup}
                className="rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 transition"
              >
                Unduh Backup Database (.db)
              </button>

              <label className="inline-flex cursor-pointer items-center rounded-xl border border-slate-300 bg-slate-50 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-100 transition">
                <input type="file" accept=".db,.sqlite,.sql" className="hidden" onChange={handleRestore} />
                {restoring ? "Sedang Memulihkan..." : "Pilih File Restore Database"}
              </label>
            </div>
          </div>

          {/* Pembaruan Aplikasi & Sinkronisasi Sistem */}
          <div className="rounded-3xl border border-blue-200 bg-gradient-to-br from-blue-50/60 via-white to-cyan-50/40 p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <RefreshCw className="h-5 w-5 text-blue-600" />
                  <span>Pembaruan Aplikasi & Sinkronisasi Sistem (1-Click Update)</span>
                </h2>
                <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
                  Jalankan proses pembaruan otomatis setelah Anda mengunggah atau memodifikasi file aplikasi pada Container Proxmox (CT) lokal.
                  Sistem akan otomatis mencadangkan database, memperbarui dependensi, sinkronisasi skema database, melakukan build Next.js, dan me-restart service sistem.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsUpdateModalOpen(true)}
                className="shrink-0 flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-xs font-bold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 transition cursor-pointer"
              >
                <RefreshCw className="h-4 w-4" />
                Mulai Pembaruan Sistem
              </button>
            </div>
          </div>

          {/* Pembersihan Data Sampel / Demo */}
          <div className="rounded-3xl border border-rose-200 bg-rose-50/50 p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-rose-900 flex items-center gap-2">
                  <Trash2 className="h-5 w-5 text-rose-600" />
                  <span>Pembersihan Data Sampel / Data Eksisting (Clean Slate)</span>
                </h2>
                <p className="text-xs text-rose-700 mt-1 max-w-2xl leading-relaxed">
                  Hapus seluruh data sampel/dummy bawaan (Klien, Proyek, Penawaran SPH, Invoice, Jadwal, dan Keuangan) agar database bersih dan siap digunakan untuk data operasional riil Einva Group. Akun login Admin dan Profil Perusahaan tetap aman.
                </p>
              </div>
              <button
                type="button"
                onClick={handleResetDemoData}
                disabled={resettingDemo}
                className="shrink-0 flex items-center gap-2 rounded-xl bg-rose-600 px-5 py-3 text-xs font-bold text-white shadow-md shadow-rose-500/20 hover:bg-rose-700 transition cursor-pointer disabled:opacity-50"
              >
                <Trash2 className="h-4 w-4" />
                {resettingDemo ? "Sedang Membersihkan..." : "Hapus Data Sampel"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: PENGATURAN WEB PORTAL & PORTOFOLIO                                */}
      {/* ========================================================================= */}
      {activeTab === "portal" && (
        <div className="space-y-8">
          {/* Section A: Deskripsi Tentang Perusahaan */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-blue-600" />
                  <span>Deskripsi Profil "Tentang Perusahaan"</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Teks ini ditampilkan di bagian Tentang Kami pada halaman Web Portal publik.
                </p>
              </div>
            </div>

            <label className="block space-y-2">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Teks Sambutan / Narasi Profil Perusahaan
              </span>
              <textarea
                value={profile.aboutText || ""}
                onChange={(e) => handleChange("aboutText", e.target.value)}
                rows={4}
                className="w-full rounded-2xl border border-slate-200 bg-white p-4 text-sm leading-relaxed outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="Kosongkan jika ingin menggunakan narasi standar otomatis."
              />
            </label>
          </div>

          {/* Section B: Pengelolaan Portofolio Proyek */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4 gap-3">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-indigo-600" />
                  <span>Daftar Portofolio Proyek Karya ({portfolioList.length} Item)</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Portofolio ini ditampilkan di section "Portofolio Pengerjaan" pada web portal untuk calon klien.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    if (confirm("Kembalikan daftar portofolio ke contoh bawaan?")) {
                      setPortfolioList(defaultPortfolio);
                    }
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 transition"
                  title="Reset ke contoh portofolio standar"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Reset Bawaan</span>
                </button>
                <button
                  onClick={() => {
                    setEditingPortfolioIdx(null);
                    setPortfolioForm({ title: "", category: "", location: "", scope: "", highlight: "", tag: "" });
                    setIsAddingPortfolio(true);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-700 transition"
                >
                  <Plus className="h-4 w-4" />
                  <span>Tambah Portofolio</span>
                </button>
              </div>
            </div>

            {/* Form Tambah / Edit Portofolio */}
            {isAddingPortfolio && (
              <div className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-indigo-900">
                    {editingPortfolioIdx !== null ? "Edit Portofolio Proyek" : "Tambah Portofolio Proyek Baru"}
                  </h3>
                  <button
                    onClick={() => setIsAddingPortfolio(false)}
                    className="text-xs font-semibold text-slate-400 hover:text-slate-600"
                  >
                    Batal
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <label className="space-y-1">
                    <span className="font-semibold text-slate-700">Nama Proyek *</span>
                    <input
                      value={portfolioForm.title}
                      onChange={(e) => setPortfolioForm({ ...portfolioForm, title: e.target.value })}
                      placeholder="Contoh: Instalasi CCTV Mall Central"
                      className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs outline-none focus:border-indigo-500"
                    />
                  </label>

                  <label className="space-y-1">
                    <span className="font-semibold text-slate-700">Tag / Kategori Singkat</span>
                    <input
                      value={portfolioForm.tag}
                      onChange={(e) => setPortfolioForm({ ...portfolioForm, tag: e.target.value })}
                      placeholder="Contoh: CCTV & Keamanan / Fiber Optic"
                      className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs outline-none focus:border-indigo-500"
                    />
                  </label>

                  <label className="space-y-1">
                    <span className="font-semibold text-slate-700">Sektor / Tipe Klien</span>
                    <input
                      value={portfolioForm.category}
                      onChange={(e) => setPortfolioForm({ ...portfolioForm, category: e.target.value })}
                      placeholder="Contoh: Commercial & Retail"
                      className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs outline-none focus:border-indigo-500"
                    />
                  </label>

                  <label className="space-y-1">
                    <span className="font-semibold text-slate-700">Lokasi Proyek</span>
                    <input
                      value={portfolioForm.location}
                      onChange={(e) => setPortfolioForm({ ...portfolioForm, location: e.target.value })}
                      placeholder="Contoh: Pusat Perbelanjaan & Kawasan Niaga"
                      className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs outline-none focus:border-indigo-500"
                    />
                  </label>

                  <label className="space-y-1 sm:col-span-2">
                    <span className="font-semibold text-slate-700">Lingkup Pekerjaan</span>
                    <input
                      value={portfolioForm.scope}
                      onChange={(e) => setPortfolioForm({ ...portfolioForm, scope: e.target.value })}
                      placeholder="Contoh: Pemasangan IP CCTV 50 Titik, Ruang Kontrol Sentral & Kabel UTP Cat6"
                      className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs outline-none focus:border-indigo-500"
                    />
                  </label>

                  <label className="space-y-1 sm:col-span-2">
                    <span className="font-semibold text-slate-700">Hasil Pengerjaan / Highlight</span>
                    <input
                      value={portfolioForm.highlight}
                      onChange={(e) => setPortfolioForm({ ...portfolioForm, highlight: e.target.value })}
                      placeholder="Contoh: Monitoring 24/7 dengan ruang kendali sentral dan sistem backup penyimpanan."
                      className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs outline-none focus:border-indigo-500"
                    />
                  </label>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => setIsAddingPortfolio(false)}
                    className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleSavePortfolioItem}
                    className="rounded-xl bg-indigo-600 px-5 py-2 text-xs font-bold text-white hover:bg-indigo-700"
                  >
                    Simpan Item
                  </button>
                </div>
              </div>
            )}

            {/* List Portofolio */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {portfolioList.map((item, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs hover:border-slate-300 flex flex-col justify-between"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700 border border-blue-100">
                        {item.tag || "Portofolio"}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleStartEditPortfolio(idx)}
                          className="p-1 text-slate-400 hover:text-blue-600 transition"
                          title="Edit Portofolio"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeletePortfolioItem(idx)}
                          className="p-1 text-slate-400 hover:text-rose-600 transition"
                          title="Hapus Portofolio"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900">{item.title}</h4>
                    <p className="text-[11px] text-slate-500">
                      {item.category} • {item.location}
                    </p>
                    <p className="text-xs text-slate-600 pt-1 line-clamp-2">{item.scope}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section C: Pengelolaan Layanan & Solusi */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4 gap-3">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Layers className="h-5 w-5 text-blue-600" />
                  <span>Daftar Layanan & Solusi Unggulan ({servicesList.length} Layanan)</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Layanan yang ditampilkan di bagian "Layanan & Solusi" pada Web Portal.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    if (confirm("Kembalikan daftar layanan ke contoh bawaan?")) {
                      setServicesList(defaultServices);
                    }
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 transition"
                  title="Reset ke contoh layanan standar"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Reset Bawaan</span>
                </button>
                <button
                  onClick={() => {
                    setEditingServiceIdx(null);
                    setServiceForm({ iconName: "Camera", title: "", description: "", badge: "" });
                    setIsAddingService(true);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 transition"
                >
                  <Plus className="h-4 w-4" />
                  <span>Tambah Layanan</span>
                </button>
              </div>
            </div>

            {/* Form Tambah / Edit Layanan */}
            {isAddingService && (
              <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-blue-900">
                    {editingServiceIdx !== null ? "Edit Layanan" : "Tambah Layanan Baru"}
                  </h3>
                  <button
                    onClick={() => setIsAddingService(false)}
                    className="text-xs font-semibold text-slate-400 hover:text-slate-600"
                  >
                    Batal
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <label className="space-y-1">
                    <span className="font-semibold text-slate-700">Nama Layanan *</span>
                    <input
                      value={serviceForm.title}
                      onChange={(e) => setServiceForm({ ...serviceForm, title: e.target.value })}
                      placeholder="Contoh: Instalasi CCTV & Keamanan"
                      className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs outline-none focus:border-blue-500"
                    />
                  </label>

                  <label className="space-y-1">
                    <span className="font-semibold text-slate-700">Badge Kategori</span>
                    <input
                      value={serviceForm.badge}
                      onChange={(e) => setServiceForm({ ...serviceForm, badge: e.target.value })}
                      placeholder="Contoh: Security System"
                      className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs outline-none focus:border-blue-500"
                    />
                  </label>

                  <label className="space-y-1">
                    <span className="font-semibold text-slate-700">Pilihan Ikon</span>
                    <select
                      value={serviceForm.iconName}
                      onChange={(e) => setServiceForm({ ...serviceForm, iconName: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs outline-none focus:border-blue-500"
                    >
                      <option value="Camera">Kamera / CCTV</option>
                      <option value="Network">Jaringan / LAN</option>
                      <option value="Lock">Kunci / Access Door</option>
                      <option value="Zap">Listrik / Petir</option>
                      <option value="Wrench">Perbaikan / Maintenance</option>
                      <option value="Layers">Hardware / Server</option>
                    </select>
                  </label>

                  <label className="space-y-1 sm:col-span-2">
                    <span className="font-semibold text-slate-700">Deskripsi Lengkap Layanan</span>
                    <textarea
                      value={serviceForm.description}
                      onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                      rows={3}
                      placeholder="Jelaskan spesifikasi dan kelebihan layanan ini untuk calon klien..."
                      className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs outline-none focus:border-blue-500"
                    />
                  </label>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => setIsAddingService(false)}
                    className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleSaveServiceItem}
                    className="rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white hover:bg-blue-700"
                  >
                    Simpan Layanan
                  </button>
                </div>
              </div>
            )}

            {/* List Layanan */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {servicesList.map((item, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs hover:border-slate-300 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700">
                        {item.badge || "Layanan"}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleStartEditService(idx)}
                          className="p-1 text-slate-400 hover:text-blue-600 transition"
                          title="Edit Layanan"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteServiceItem(idx)}
                          className="p-1 text-slate-400 hover:text-rose-600 transition"
                          title="Hapus Layanan"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900">{item.title}</h4>
                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <SystemUpdateModal isOpen={isUpdateModalOpen} onClose={() => setIsUpdateModalOpen(false)} />
    </div>
  );
}
