import Link from 'next/link';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';
import {
  ArrowRight,
  Award,
  Briefcase,
  Building2,
  Camera,
  CheckCircle2,
  Clock,
  ExternalLink,
  Layers,
  Lock,
  LogIn,
  Mail,
  MapPin,
  Network,
  Phone,
  ShieldCheck,
  Users,
  Wrench,
  Zap,
} from 'lucide-react';

const iconMap: Record<string, any> = {
  Camera,
  Network,
  Lock,
  Zap,
  Wrench,
  Layers,
  Award,
  ShieldCheck,
  Users,
  Clock,
  Building2,
  Briefcase,
};

const serviceColorMap: Record<string, string> = {
  Camera: 'from-blue-500/20 to-blue-600/10 text-blue-600',
  Network: 'from-indigo-500/20 to-indigo-600/10 text-indigo-600',
  Lock: 'from-cyan-500/20 to-cyan-600/10 text-cyan-600',
  Zap: 'from-amber-500/20 to-amber-600/10 text-amber-600',
  Wrench: 'from-emerald-500/20 to-emerald-600/10 text-emerald-600',
  Layers: 'from-rose-500/20 to-rose-600/10 text-rose-600',
};

// Layanan Unggulan Perusahaan
const services = [
  {
    icon: Camera,
    title: 'Instalasi CCTV & Surveillance System',
    description:
      'Solusi pemasangan kamera pengawas IP Cam & HD-CVI berkualitas tinggi, integrasi NVR/DVR, pemantauan realtime via ponsel, dan rekaman terenkripsi untuk keamanan optimal.',
    badge: 'Security System',
    color: 'from-blue-500/20 to-blue-600/10 text-blue-600',
    iconColor: 'text-blue-600',
  },
  {
    icon: Network,
    title: 'Infrastruktur Jaringan & Fiber Optic',
    description:
      'Pembangunan jaringan kabel LAN Cat6/Cat7, penarikan & splicing kabel Fiber Optic (FO) antar gedung, perapian rack server, serta konfigurasi router & switch enterprise.',
    badge: 'Network Infrastructure',
    color: 'from-indigo-500/20 to-indigo-600/10 text-indigo-600',
    iconColor: 'text-indigo-600',
  },
  {
    icon: Lock,
    title: 'Access Control & Sistem Keamanan Gedung',
    description:
      'Pemasangan kunci pintu digital magnetik (EM Lock / Drop Bolt), absensi biometric fingerprint & RFID card, barrier gate kendaraan, serta sistem alarm peringatan dini.',
    badge: 'Access & Control',
    color: 'from-cyan-500/20 to-cyan-600/10 text-cyan-600',
    iconColor: 'text-cyan-600',
  },
  {
    icon: Zap,
    title: 'Instalasi Kelistrikan & Grounding Proteksi',
    description:
      'Penataan jalur instalasi kelistrikan gedung komersial, perakitan panel MCB daya, sistem grounding penangkal petir, serta integrasi UPS cadangan untuk proteksi aset elektronik.',
    badge: 'Electrical Engineering',
    color: 'from-amber-500/20 to-amber-600/10 text-amber-600',
    iconColor: 'text-amber-600',
  },
  {
    icon: Wrench,
    title: 'Perawatan & Maintenance Rutin (SLA)',
    description:
      'Layanan inspeksi berkala, audit performa jaringan, pembersihan fisik perangkat, penanganan kendala darurat, dan jaminan purna jual dengan response time cepat.',
    badge: 'Maintenance & Support',
    color: 'from-emerald-500/20 to-emerald-600/10 text-emerald-600',
    iconColor: 'text-emerald-600',
  },
  {
    icon: Layers,
    title: 'Pengadaan Hardware & Solusi IT',
    description:
      'Penyediaan perangkat keras komputasi, rack server standar industri, access point WiFi berkepadatan tinggi, serta material instalasi bersertifikasi resmi.',
    badge: 'Procurement',
    color: 'from-rose-500/20 to-rose-600/10 text-rose-600',
    iconColor: 'text-rose-600',
  },
];

// Portofolio Proyek Unggulan yang Pernah Dikerjakan
const portfolioItems = [
  {
    title: 'Sistem Surveillance Terpadu 50+ Titik',
    category: 'Commercial & Retail',
    location: 'Pusat Perbelanjaan & Kawasan Niaga',
    scope: 'Pemasangan IP CCTV Resolusi 4MP, Ruang Kontrol Sentral, & Kabel UTP Cat6 Eksterior',
    highlight: 'Monitoring 24/7 dengan ruang kendali sentral dan sistem backup penyimpanan.',
    tag: 'CCTV & Keamanan',
  },
  {
    title: 'Backbone Fiber Optic Antar Gedung 10G',
    category: 'Corporate Office',
    location: 'Kawasan Perkantoran Multigedung',
    scope: 'Penarikan Kabel FO Armored Outdoor 300m, Fusion Splicing, OTB & Switch Layer-3',
    highlight: 'Konektivitas data latensi rendah dan stabilitas koneksi antar divisi kerja.',
    tag: 'Fiber Optic',
  },
  {
    title: 'Access Control & Presensi Biometrik Terpusat',
    category: 'Logistics & Warehousing',
    location: 'Fasilitas Pergudangan Modern',
    scope: 'Sistem Access Door EM-Lock, Fingerprint & RFID Scanner, Integrasi Cloud Database',
    highlight: 'Pencatatan keluar-masuk karyawan otomatis dengan tingkat keamanan ganda.',
    tag: 'Access Control',
  },
  {
    title: 'Instalasi Kelistrikan Gedung Komersial 3 Lantai',
    category: 'Commercial Building',
    location: 'Kompleks Ruko & Perkantoran',
    scope: 'Pemasangan Jalur Kelistrikan Baru, Panel Distribusi Daya, & Grounding Proteksi',
    highlight: 'Standar instalasi rapi memenuhi sertifikasi kelaikan teknis dan keamanan beban.',
    tag: 'Kelistrikan',
  },
  {
    title: 'Peremajaan Rack Server & Kabel Terstruktur',
    category: 'Enterprise Data Center',
    location: 'Ruang Server Kantor Pusat',
    scope: 'Cable Management, Patch Panel Cat6, Labeling Jalur, Penggantian Switch 48-Port',
    highlight: 'Mengeliminasi kabel semrawut dan memudahkan pemeliharaan jangka panjang.',
    tag: 'Server & IT',
  },
  {
    title: 'WiFi Enterprise Kepadatan Tinggi (High Density)',
    category: 'Hospitality & Commercial',
    location: 'Ruang Publik & Area Pertemuan',
    scope: 'Setup 12 Access Point WiFi-6, Seamless Roaming, Bandwidth Management Controller',
    highlight: 'Konektivitas stabil untuk ratusan perangkat sekaligus tanpa buffering.',
    tag: 'Wireless Network',
  },
];

// Nilai Keunggulan Perusahaan
const strengths = [
  {
    icon: Award,
    title: 'Standar Pengerjaan Rapi & Presisi',
    description:
      'Setiap instalasi dikerjakan sesuai standar operasional industri (SOP) dengan penataan kabel terstruktur, rapi, dan mudah di-maintenance.',
  },
  {
    icon: ShieldCheck,
    title: 'Perangkat Berkualitas & Bergaransi',
    description:
      'Kami hanya menggunakan material dan perangkat keras original dari produsen terpercaya dengan jaminan garansi resmi.',
  },
  {
    icon: Users,
    title: 'Teknisi Tersertifikasi & Berpengalaman',
    description:
      'Didukung oleh tim teknisi profesional yang terbiasa menangani instalasi skala rumahan hingga proyek gedung komersial besar.',
  },
  {
    icon: Clock,
    title: 'Layanan Cepat Tanggap & Purna Jual',
    description:
      'Komitmen dukungan teknis responsif jika terjadi kendala operasional, didukung opsi kontrak maintenance berkala.',
  },
];

export default async function LandingPage() {
  // Ambil profil perusahaan dari database
  let companyFromDb = null;
  let clients: Array<{ id: string; name: string; company: string | null }> = [];

  try {
    companyFromDb = await prisma.companyProfile.findFirst();
  } catch (error) {
    console.error('Gagal memuat profil perusahaan dari database:', error);
  }

  try {
    clients = await prisma.client.findMany({
      select: { id: true, name: true, company: true },
      take: 6,
    });
  } catch (error) {
    console.error('Gagal memuat daftar klien dari database:', error);
  }

  const company = companyFromDb || {
    name: 'Einva Inti Data',
    tagline: 'Installed Right, Serviced Better',
    address: 'Gempol Rt 10 Sambirejo, Sambirejo, Sragen',
    city: 'Jawa Tengah',
    phone: '082346268845',
    email: 'info@einvaintidata.com',
    website: 'https://einvaintidata.com',
    npwp: '00.000.000.0-000.000',
    bankName: 'Bank Rakyat Indonesia',
    bankAccount: '000000000000000',
    bankHolder: 'PT EINVA INTI DATA',
    directorName: null,
    notes: 'Pembayaran dapat ditransfer sesuai rekening bank yang tertera.',
    logo: null,
  };

  const currentYear = new Date().getFullYear();

  // Format nomor WhatsApp
  const cleanPhone = company.phone ? company.phone.replace(/[^0-9]/g, '').replace(/^0/, '62') : '';
  const waUrl = cleanPhone
    ? `https://wa.me/${cleanPhone}?text=Halo%20${encodeURIComponent(company.name)}%2C%20saya%20ingin%20berkonsultasi%20mengenai%20layanan%20instalasi.`
    : null;

  // Layanan Dinamis (dari database atau fallback)
  let displayServices = services;
  if ((company as any).servicesJson) {
    try {
      const parsed = JSON.parse((company as any).servicesJson);
      if (Array.isArray(parsed) && parsed.length > 0) {
        displayServices = parsed.map((s: any) => ({
          ...s,
          icon: iconMap[s.iconName] || Camera,
          color: serviceColorMap[s.iconName] || 'from-blue-500/20 to-blue-600/10 text-blue-600',
        }));
      }
    } catch (e) {
      console.error('Gagal parse servicesJson', e);
    }
  }

  // Portofolio Dinamis (dari database atau fallback)
  let displayPortfolio = portfolioItems;
  if ((company as any).portfolioJson) {
    try {
      const parsed = JSON.parse((company as any).portfolioJson);
      if (Array.isArray(parsed) && parsed.length > 0) {
        displayPortfolio = parsed;
      }
    } catch (e) {
      console.error('Gagal parse portfolioJson', e);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between selection:bg-blue-600 selection:text-white">
      {/* ========================================================================= */}
      {/* 1. NAVBAR / HEADER RESMI                                                 */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-50 border-b border-slate-200/90 bg-white/95 backdrop-blur-md shadow-xs">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo & Identitas Perusahaan */}
          <Link href="/" className="flex items-center gap-3.5 group">
            {company.logo ? (
              <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs transition group-hover:shadow-md">
                <img
                  src={company.logo}
                  alt={`Logo ${company.name}`}
                  className="h-full w-full object-contain p-1"
                />
              </div>
            ) : (
              <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs transition group-hover:shadow-md">
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 text-lg font-black text-white">
                  {company.name?.[0]?.toUpperCase() || 'E'}
                </div>
              </div>
            )}
            <div>
              <div className="text-lg font-bold tracking-tight text-slate-900 leading-tight">
                {company.name}
              </div>
              <div className="text-[11px] font-medium text-slate-500 tracking-wide line-clamp-1">
                {company.tagline || 'Solusi IT, Jaringan & Keamanan'}
              </div>
            </div>
          </Link>

          {/* Navigasi Desktop */}
          <nav className="hidden items-center gap-7 lg:flex">
            <a href="#tentang" className="text-sm font-semibold text-slate-600 transition hover:text-blue-600">
              Tentang Kami
            </a>
            <a href="#layanan" className="text-sm font-semibold text-slate-600 transition hover:text-blue-600">
              Layanan & Solusi
            </a>
            <a href="#portofolio" className="text-sm font-semibold text-slate-600 transition hover:text-blue-600">
              Portofolio Proyek
            </a>
            <a href="#keunggulan" className="text-sm font-semibold text-slate-600 transition hover:text-blue-600">
              Keunggulan
            </a>
            <a href="#kontak" className="text-sm font-semibold text-slate-600 transition hover:text-blue-600">
              Kontak Kantor
            </a>
          </nav>

          {/* Action Button: Kontak & Portal Internal */}
          <div className="flex items-center gap-2.5">
            {waUrl && (
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-emerald-700"
              >
                <Phone className="h-3.5 w-3.5" />
                <span>Konsultasi WA</span>
              </a>
            )}
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-xs transition hover:border-blue-600 hover:text-blue-600 active:scale-95"
              title="Akses Portal Internal Khusus Karyawan"
            >
              <LogIn className="h-3.5 w-3.5" />
              <span>Portal Karyawan</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* ========================================================================= */}
        {/* 2. HERO SECTION / PORTOFOLIO UTAMA                                        */}
        {/* ========================================================================= */}
        <section className="relative overflow-hidden bg-slate-950 text-white">
          {/* Radial Glow & Subtle Grid Background */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(37,99,235,0.30),transparent_40%),radial-gradient(circle_at_bottom_right,_rgba(79,70,229,0.22),transparent_40%)]" />
          <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:36px_36px]" />

          <div className="relative mx-auto grid max-w-7xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-12 lg:gap-8 lg:px-8 lg:py-28">
            {/* Teks Pengantar Hero */}
            <div className="flex flex-col justify-center lg:col-span-7">
              <div className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-blue-400/30 bg-blue-500/10 px-4 py-1.5 text-xs font-semibold text-blue-200 backdrop-blur-xs">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                <span>Profil Resmi Perusahaan • {company.name}</span>
              </div>

              <h1 className="text-3xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl leading-[1.15]">
                Solusi Andal Instalasi Jaringan, CCTV & Infrastruktur IT.
              </h1>

              <p className="mt-6 max-w-xl text-base sm:text-lg leading-relaxed text-slate-300">
                {company.tagline
                  ? `${company.name} hadir dengan komitmen "${company.tagline}". Kami menghadirkan instalasi berstandar industri untuk perkantoran, kawasan niaga, fasilitas logistik, dan industri.`
                  : `${company.name} adalah mitra penyedia solusi profesional di bidang instalasi jaringan kabel & fiber optic, sistem CCTV terintegrasi, access control, serta pemeliharaan infrastruktur teknologi.`}
              </p>

              <div className="mt-8 flex flex-wrap gap-3.5">
                <a
                  href="#portofolio"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 text-sm font-bold text-white shadow-lg shadow-blue-600/30 transition hover:bg-blue-500 active:scale-95"
                >
                  <Briefcase className="h-4 w-4" />
                  <span>Lihat Portofolio Karya</span>
                </a>
                {waUrl ? (
                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900/80 px-6 text-sm font-semibold text-slate-200 transition hover:border-slate-500 hover:bg-slate-800 hover:text-white"
                  >
                    <Phone className="h-4 w-4 text-emerald-400" />
                    <span>Konsultasi Proyek</span>
                  </a>
                ) : (
                  <a
                    href="#kontak"
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900/80 px-6 text-sm font-semibold text-slate-200 transition hover:border-slate-500 hover:bg-slate-800 hover:text-white"
                  >
                    <Mail className="h-4 w-4 text-blue-400" />
                    <span>Hubungi Kami</span>
                  </a>
                )}
              </div>

              {/* Nilai Tambah Cepat */}
              <div className="mt-10 grid grid-cols-2 gap-4 border-t border-slate-800/80 pt-8 sm:grid-cols-3">
                <div>
                  <div className="text-2xl font-black text-white">100%</div>
                  <div className="text-xs text-slate-400">Garansi & Dukungan Resmi</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-emerald-400">Multi-Sektor</div>
                  <div className="text-xs text-slate-400">Kantor, Ritel, & Pergudangan</div>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <div className="text-2xl font-black text-blue-400">SOP Teruji</div>
                  <div className="text-xs text-slate-400">Instalasi Rapi & Presisi</div>
                </div>
              </div>
            </div>

            {/* Showcase Visual Card Portofolio */}
            <div className="flex items-center justify-center lg:col-span-5">
              <div className="relative w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-2xl backdrop-blur-xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
                      <Building2 className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">{company.name}</h3>
                      <p className="text-[11px] text-slate-400">Profil & Layanan Unggulan</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-1 text-[11px] font-semibold text-emerald-300">
                    Aktif Melayani
                  </span>
                </div>

                <div className="mt-5 space-y-3.5">
                  <div className="rounded-2xl border border-slate-800/90 bg-slate-950/60 p-4">
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                      <span>Bidang Layanan Spesialis</span>
                      <span className="text-blue-400 font-semibold">Tersertifikasi</span>
                    </div>
                    <p className="text-sm font-bold text-white">
                      CCTV Surveillance • Fiber Optic • Access Door • Kelistrikan
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-800/90 bg-slate-950/60 p-4">
                    <div className="text-xs text-slate-400 mb-2">Area Cakupan Pelayanan:</div>
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
                      <MapPin className="h-4 w-4 text-emerald-400 shrink-0" />
                      <span>{company.city || 'Jawa Tengah & Sekitarnya'}</span>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-blue-500/20 bg-blue-950/20 p-4 text-xs text-slate-300">
                    <div className="flex items-center gap-2 font-bold text-blue-300 mb-1">
                      <CheckCircle2 className="h-4 w-4 text-blue-400 shrink-0" />
                      <span>Komitmen Kualitas Kerja</span>
                    </div>
                    Pengerjaan tepat waktu dengan dokumentasi serah terima lengkap, uji koneksi, dan pelatihan operasional bagi staf klien.
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                  <span>Konsultasi gratis & survei lokasi</span>
                  <a href="#kontak" className="text-blue-400 font-semibold hover:underline flex items-center gap-1">
                    Hubungi Kantor <ArrowRight className="h-3 w-3" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 3. TENTANG PERUSAHAAN                                                     */}
        {/* ========================================================================= */}
        <section id="tentang" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 border-b border-slate-200">
          <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-6 space-y-5">
              <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 border border-blue-200 px-3.5 py-1 text-xs font-bold text-blue-700 uppercase tracking-wider">
                Tentang Perusahaan
              </div>
              <h2 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
                Mitra Profesional untuk Kebutuhan Instalasi Teknologi Perusahaan Anda
              </h2>
              {(company as any).aboutText ? (
                <div className="text-base leading-relaxed text-slate-600 whitespace-pre-line space-y-3">
                  {(company as any).aboutText}
                </div>
              ) : (
                <>
                  <p className="text-base leading-relaxed text-slate-600">
                    <strong>{company.name}</strong> adalah badan usaha profesional yang bergerak di bidang penyediaan solusi teknologi informasi, instalasi sistem keamanan terpadu, dan infrastruktur kabel data.
                  </p>
                  <p className="text-base leading-relaxed text-slate-600">
                    Kami percaya bahwa infrastruktur teknologi yang andal adalah fondasi utama kelancaran operasional bisnis modern. Dengan perpaduan material berkualitas tinggi, teknisi tersertifikasi, dan pengawasan kualitas ketat, kami memastikan setiap titik instalasi beroperasi dengan efisiensi maksimal dan memiliki daya tahan panjang.
                  </p>
                </>
              )}

              {/* Poin Visi & Komitmen */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
                  <div className="font-bold text-slate-900 text-sm mb-1 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-blue-600" />
                    <span>Presisi & Keamanan</span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Setiap jalur kabel dan konektor dipasang dengan perhitungan teknis beban dan keamanan terbaik.
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
                  <div className="font-bold text-slate-900 text-sm mb-1 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    <span>Transparansi SPH</span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Surat Penawaran Harga (SPH) terinci jelas tanpa ada biaya tersembunyi bagi klien kami.
                  </p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 p-8 text-white shadow-xl">
                <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2.5">
                  <Building2 className="h-5 w-5 text-blue-400" />
                  <span>Detail Profil Perusahaan</span>
                </h3>

                <dl className="space-y-4 text-sm divide-y divide-slate-800">
                  <div className="pt-3 first:pt-0 flex flex-col sm:flex-row sm:justify-between gap-1">
                    <dt className="text-slate-400 text-xs uppercase tracking-wider">Nama Resmi</dt>
                    <dd className="font-bold text-white">{company.name}</dd>
                  </div>

                  {company.tagline && (
                    <div className="pt-3 flex flex-col sm:flex-row sm:justify-between gap-1">
                      <dt className="text-slate-400 text-xs uppercase tracking-wider">Motto / Tagline</dt>
                      <dd className="text-slate-200 italic font-medium">"{company.tagline}"</dd>
                    </div>
                  )}

                  {company.directorName && (
                    <div className="pt-3 flex flex-col sm:flex-row sm:justify-between gap-1">
                      <dt className="text-slate-400 text-xs uppercase tracking-wider">Pimpinan / Direktur</dt>
                      <dd className="text-white font-semibold">{company.directorName}</dd>
                    </div>
                  )}

                  <div className="pt-3 flex flex-col sm:flex-row sm:justify-between gap-1">
                    <dt className="text-slate-400 text-xs uppercase tracking-wider">Wilayah Operasional</dt>
                    <dd className="text-slate-200">{company.city || 'Indonesia'}</dd>
                  </div>

                  {company.npwp && (
                    <div className="pt-3 flex flex-col sm:flex-row sm:justify-between gap-1">
                      <dt className="text-slate-400 text-xs uppercase tracking-wider">Nomor NPWP</dt>
                      <dd className="font-mono text-slate-300 text-xs">{company.npwp}</dd>
                    </div>
                  )}

                  <div className="pt-3 flex flex-col sm:flex-row sm:justify-between gap-1">
                    <dt className="text-slate-400 text-xs uppercase tracking-wider">Spesialisasi</dt>
                    <dd className="text-blue-300 font-medium">
                      Network Infrastructure, CCTV Surveillance & Electrical
                    </dd>
                  </div>
                </dl>

                {company.address && (
                  <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900/80 p-4 text-xs text-slate-300 flex items-start gap-3">
                    <MapPin className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-white block mb-0.5">Alamat Kantor Resmi:</span>
                      {company.address}
                      {company.city ? `, ${company.city}` : ''}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 4. LAYANAN & SOLUSI UNGGULAN                                              */}
        {/* ========================================================================= */}
        <section id="layanan" className="bg-slate-100/60 py-20 border-b border-slate-200">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <div className="inline-flex items-center gap-2 rounded-full bg-blue-100/80 border border-blue-200 px-3.5 py-1 text-xs font-bold text-blue-700 uppercase tracking-wider">
                Layanan & Solusi
              </div>
              <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
                Cakupan Layanan Profesional Kami
              </h2>
              <p className="mt-3 text-slate-600 text-base">
                Menyediakan solusi end-to-end dari tahap perencanaan, pengadaan material, pemasangan fisik, hingga uji coba dan perawatan berkala.
              </p>
            </div>

            <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {displayServices.map((item) => {
                const IconComponent = item.icon;
                return (
                  <div
                    key={item.title}
                    className="group relative flex flex-col justify-between rounded-3xl border border-slate-200/90 bg-white p-7 shadow-xs transition hover:-translate-y-1.5 hover:shadow-xl hover:border-blue-300"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-5">
                        <div
                          className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${item.color} shadow-2xs group-hover:scale-105 transition-transform`}
                        >
                          <IconComponent className="h-7 w-7" />
                        </div>
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold text-slate-600">
                          {item.badge}
                        </span>
                      </div>

                      <h3 className="text-xl font-bold tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors">
                        {item.title}
                      </h3>

                      <p className="mt-3 text-sm leading-relaxed text-slate-600">
                        {item.description}
                      </p>
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-500">
                      <span>Standar Industri</span>
                      <a href="#kontak" className="text-blue-600 hover:text-blue-700 flex items-center gap-1">
                        Konsultasi <ArrowRight className="h-3.5 w-3.5" />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 5. PORTOFOLIO PROYEK PERUSAHAAN                                          */}
        {/* ========================================================================= */}
        <section id="portofolio" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 border-b border-slate-200">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 border border-indigo-200 px-3.5 py-1 text-xs font-bold text-indigo-700 uppercase tracking-wider">
                Portofolio Pengerjaan
              </div>
              <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
                Pengalaman & Hasil Karya Kami
              </h2>
              <p className="mt-2 max-w-2xl text-slate-600 text-sm sm:text-base">
                Dokumentasi ragam proyek instalasi teknologi, keamanan, dan jaringan yang telah sukses kami selesaikan dengan kepuasan klien.
              </p>
            </div>

            <div className="shrink-0">
              <a
                href="#kontak"
                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-slate-800"
              >
                <span>Mulai Proyek Bersama Kami</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {displayPortfolio.map((item, idx) => (
              <div
                key={item.title}
                className="flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-6 shadow-xs transition hover:shadow-lg hover:border-slate-300"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <span className="rounded-lg bg-blue-50 border border-blue-100 px-2.5 py-1 text-xs font-bold text-blue-700">
                      {item.tag}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-400">
                      0{idx + 1}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 leading-snug">
                    {item.title}
                  </h3>

                  <div className="mt-2.5 flex items-center gap-1.5 text-xs font-medium text-slate-500">
                    <Building2 className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span>{item.category} • {item.location}</span>
                  </div>

                  <div className="mt-4 rounded-2xl bg-slate-50 border border-slate-100 p-3.5 text-xs text-slate-600 space-y-1.5">
                    <div>
                      <span className="font-semibold text-slate-800 block text-[11px] uppercase tracking-wide">
                        Lingkup Pengerjaan:
                      </span>
                      <span>{item.scope}</span>
                    </div>
                  </div>

                  <p className="mt-3.5 text-xs leading-relaxed text-slate-500">
                    <strong className="text-slate-700">Hasil:</strong> {item.highlight}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-emerald-600 font-semibold">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="h-4 w-4" /> Terselesaikan dengan Baik
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 6. MENGAPA MEMILIH KAMI (KEUNGGULAN)                                      */}
        {/* ========================================================================= */}
        <section id="keunggulan" className="bg-slate-900 py-20 text-white border-b border-slate-800">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/30 bg-blue-500/10 px-3.5 py-1 text-xs font-semibold text-blue-200">
                Nilai & Keunggulan
              </div>
              <h2 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl">
                Mengapa Mempercayakan Proyek Anda Kepada {company.name}?
              </h2>
              <p className="mt-3 text-slate-300 text-base">
                Kombinasi integritas kerja, kepatuhan standar keselamatan, dan dedikasi penuh terhadap hasil pengerjaan terbaik.
              </p>
            </div>

            <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {strengths.map((item) => {
                const IconComponent = item.icon;
                return (
                  <div
                    key={item.title}
                    className="rounded-3xl border border-slate-800 bg-slate-800/50 p-6 shadow-sm backdrop-blur-xs transition hover:border-slate-700 hover:bg-slate-800"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600/20 text-blue-400 border border-blue-500/30 mb-5">
                      <IconComponent className="h-6 w-6" />
                    </div>
                    <h3 className="text-base font-bold text-white mb-2">{item.title}</h3>
                    <p className="text-xs leading-relaxed text-slate-400">{item.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 7. KLIEN & REKANAN KAMI                                                   */}
        {/* ========================================================================= */}
        {clients.length > 0 && (
          <section className="bg-white py-16 border-b border-slate-200">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                Kepercayaan Klien & Rekanan Kerja Sama
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-4 sm:gap-6">
                {clients.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center gap-2.5 rounded-2xl border border-slate-200 bg-slate-50/80 px-5 py-3 shadow-2xs"
                  >
                    <Building2 className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-bold text-slate-800">{c.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ========================================================================= */}
        {/* 8. DETAIL KONTAK & KANTOR RESMI                                           */}
        {/* ========================================================================= */}
        <section id="kontak" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-gradient-to-br from-blue-900 via-slate-900 to-slate-950 p-8 text-white shadow-2xl sm:p-14 border border-blue-800/40">
            <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
              <div className="lg:col-span-7 space-y-5">
                <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/30 bg-blue-500/10 px-3.5 py-1 text-xs font-semibold text-blue-200">
                  Hubungi Kami
                </div>
                <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white leading-tight">
                  Konsultasikan Kebutuhan Proyek Anda Bersama Tim Ahli Kami.
                </h2>
                <p className="text-sm sm:text-base leading-relaxed text-slate-300 max-w-xl">
                  Kami siap melakukan survei lokasi, diskusi rancangan instalasi teknis, dan menyusun Surat Penawaran Harga (SPH) resmi yang kompetitif dan transparan.
                </p>

                <div className="pt-2 flex flex-wrap gap-3.5">
                  {waUrl && (
                    <a
                      href={waUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 text-sm font-bold text-white shadow-lg shadow-emerald-600/30 transition hover:bg-emerald-500 active:scale-95"
                    >
                      <Phone className="h-4 w-4" />
                      <span>Chat WhatsApp Sekarang</span>
                    </a>
                  )}
                  {company.email && (
                    <a
                      href={`mailto:${company.email}`}
                      className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900/80 px-6 text-sm font-semibold text-slate-200 transition hover:border-slate-500 hover:bg-slate-800 hover:text-white"
                    >
                      <Mail className="h-4 w-4 text-blue-400" />
                      <span>Kirim Email Penawaran</span>
                    </a>
                  )}
                </div>
              </div>

              {/* Rincian Kontak Kantor */}
              <div className="lg:col-span-5 rounded-2xl border border-slate-800 bg-slate-900/80 p-6 space-y-4">
                <h3 className="text-base font-bold text-white border-b border-slate-800 pb-3 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-blue-400" />
                  <span>Informasi Kantor Resmi</span>
                </h3>

                <ul className="space-y-3.5 text-xs text-slate-300">
                  <li className="flex items-start gap-3">
                    <MapPin className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-white block">Alamat:</strong>
                      {company.address}
                      {company.city ? `, ${company.city}` : ''}
                    </span>
                  </li>

                  {company.phone && (
                    <li className="flex items-center gap-3">
                      <Phone className="h-4 w-4 text-emerald-400 shrink-0" />
                      <div>
                        <strong className="text-white block">Telepon / WhatsApp:</strong>
                        <span className="font-mono text-slate-200">{company.phone}</span>
                      </div>
                    </li>
                  )}

                  {company.email && (
                    <li className="flex items-center gap-3">
                      <Mail className="h-4 w-4 text-amber-400 shrink-0" />
                      <div>
                        <strong className="text-white block">Email Resmi:</strong>
                        <span className="text-slate-200">{company.email}</span>
                      </div>
                    </li>
                  )}

                  <li className="flex items-center gap-3">
                    <Clock className="h-4 w-4 text-cyan-400 shrink-0" />
                    <div>
                      <strong className="text-white block">Jam Kerja Operasional:</strong>
                      <span>Senin - Sabtu: 08:30 - 17:00 WIB</span>
                    </div>
                  </li>
                </ul>

                {company.bankName && company.bankAccount && (
                  <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-400">
                    <span className="text-slate-300 font-semibold block">Rekening Resmi Perusahaan:</span>
                    <span className="text-white font-medium">{company.bankName} - {company.bankAccount}</span>
                    {company.bankHolder && <span className="block">a.n {company.bankHolder}</span>}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ========================================================================= */}
      {/* 9. FOOTER PERUSAHAAN & TAUTAN PORTAL KARYAWAN                            */}
      {/* ========================================================================= */}
      <footer className="border-t border-slate-800 bg-slate-950 text-slate-400">
        <div className="mx-auto max-w-7xl px-4 pt-14 pb-8 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {/* Kolom 1: Profil Singkat */}
            <div className="space-y-3.5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white font-black text-base">
                  {company.name?.[0]?.toUpperCase() || 'E'}
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">{company.name}</h3>
                  <p className="text-[11px] text-slate-400">{company.tagline || 'Solusi IT & Keamanan'}</p>
                </div>
              </div>
              <p className="text-xs leading-relaxed text-slate-400">
                Penyedia solusi terintegrasi untuk instalasi jaringan fiber optic & kabel data, sistem kamera pengawas (CCTV), access control, dan kelistrikan gedung.
              </p>
            </div>

            {/* Kolom 2: Navigasi Layanan */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3.5">
                Layanan Spesialis
              </h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <a href="#layanan" className="hover:text-white transition">
                    Instalasi CCTV Surveillance
                  </a>
                </li>
                <li>
                  <a href="#layanan" className="hover:text-white transition">
                    Infrastruktur Fiber Optic & LAN
                  </a>
                </li>
                <li>
                  <a href="#layanan" className="hover:text-white transition">
                    Access Control & Door Lock
                  </a>
                </li>
                <li>
                  <a href="#layanan" className="hover:text-white transition">
                    Instalasi Panel & Kelistrikan
                  </a>
                </li>
                <li>
                  <a href="#layanan" className="hover:text-white transition">
                    Maintenance & Preventive Care
                  </a>
                </li>
              </ul>
            </div>

            {/* Kolom 3: Portofolio & Keunggulan */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3.5">
                Portofolio & Info
              </h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <a href="#portofolio" className="hover:text-white transition">
                    Proyek Komersial & Toko
                  </a>
                </li>
                <li>
                  <a href="#portofolio" className="hover:text-white transition">
                    Instalasi Gedung Perkantoran
                  </a>
                </li>
                <li>
                  <a href="#portofolio" className="hover:text-white transition">
                    Sistem Keamanan Pergudangan
                  </a>
                </li>
                <li>
                  <a href="#tentang" className="hover:text-white transition">
                    Profil Badan Usaha
                  </a>
                </li>
                <li>
                  <a href="#keunggulan" className="hover:text-white transition">
                    Standar Mutu & Garansi
                  </a>
                </li>
              </ul>
            </div>

            {/* Kolom 4: Akses Khusus Karyawan */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3.5">
                Portal Internal
              </h4>
              <p className="text-xs leading-relaxed text-slate-400 mb-3">
                Akses khusus staf dan manajemen operasional untuk manajemen proyek, surat penawaran harga (SPH), dan penagihan.
              </p>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 border border-slate-800 px-4 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-800 hover:text-white transition"
              >
                <LogIn className="h-3.5 w-3.5 text-blue-400" />
                <span>Masuk Portal Karyawan</span>
              </Link>
            </div>
          </div>

          {/* Baris Hak Cipta */}
          <div className="mt-12 pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <div>
              © {currentYear} <span className="text-slate-300 font-semibold">{company.name}</span>. Seluruh Hak Cipta Dilindungi.
            </div>
            <div className="flex items-center gap-4">
              <a href="#tentang" className="hover:text-slate-300 transition">Tentang Kami</a>
              <span>•</span>
              <a href="#kontak" className="hover:text-slate-300 transition">Kontak</a>
              <span>•</span>
              <Link href="/login" className="hover:text-blue-400 transition flex items-center gap-1 text-slate-400">
                <LogIn className="h-3 w-3" /> Login Karyawan
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
