"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Plus, Calendar, MapPin, Building2, Wallet, CheckCircle, Clock } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [expenseDialogOpen, setExpenseDialogOpen] = useState(false);
  const [expenseForm, setExpenseForm] = useState({
    name: "",
    amount: 0,
    category: "MATERIAL",
    date: new Date().toISOString().slice(0, 10),
    note: "",
  });
  const [savingExpense, setSavingExpense] = useState(false);

  const fetchProject = async () => {
    try {
      const res = await fetch(`/api/projects/${projectId}`);
      if (!res.ok) throw new Error("Not found");
      const data = await res.json();
      setProject(data);
    } catch (error) {
      console.error(error);
      router.push("/projects");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) fetchProject();
  }, [projectId, router]);

  const handleExpenseSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!projectId) return;

    setSavingExpense(true);
    try {
      const res = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          ...expenseForm,
          amount: Number(expenseForm.amount || 0),
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData?.error || "Gagal menyimpan pengeluaran");
      }

      setExpenseForm({
        name: "",
        amount: 0,
        category: "MATERIAL",
        date: new Date().toISOString().slice(0, 10),
        note: "",
      });
      setExpenseDialogOpen(false);
      await fetchProject();
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : "Gagal menyimpan pengeluaran");
    } finally {
      setSavingExpense(false);
    }
  };

  if (loading) {
    return <div className="space-y-6 animate-pulse p-4">
      <div className="h-8 bg-gray-200 rounded w-1/4"></div>
      <div className="h-64 bg-gray-200 rounded w-full"></div>
    </div>;
  }

  if (!project) return null;

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val || 0);

  const totalExpenses = project.expenses?.reduce((acc: number, curr: any) => acc + curr.amount, 0) || 0;
  
  // Minimal calculation placeholders
  const totalInvoices = project.invoices?.reduce((acc: number, curr: any) => acc + curr.total, 0) || 0;
  const totalPaid = project.invoices?.filter((i:any) => i.status === 'Paid').reduce((acc: number, curr: any) => acc + curr.total, 0) || 0;
  const profit = totalPaid - totalExpenses;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Link href="/projects">
            <Button variant="ghost" size="icon">
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
            <p className="text-gray-500 text-sm mt-1 flex items-center gap-2">
              <Building2 className="h-4 w-4" /> {project.client?.name}
              {project.location && <><span className="mx-1">•</span><MapPin className="h-4 w-4" /> {project.location}</>}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 border-0">{project.status}</Badge>
          <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100 border-0">{project.type}</Badge>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid grid-cols-5 bg-white border shadow-sm">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="dokumen">Dokumen</TabsTrigger>
          <TabsTrigger value="jadwal">Jadwal</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
          <TabsTrigger value="keuangan">Keuangan</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Status Proyek</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <span className="text-sm font-medium text-gray-700">Progress Keseluruhan</span>
                  <span className="text-2xl font-bold text-blue-600">{project.progress}%</span>
                </div>
                <Progress value={project.progress} className="h-4" />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 text-sm">
                  <div>
                    <span className="text-gray-500 flex items-center gap-1"><Calendar className="h-4 w-4"/> Mulai</span>
                    <p className="font-medium mt-1">{project.startDate ? format(new Date(project.startDate), 'dd MMMM yyyy', { locale: id }) : "-"}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 flex items-center gap-1"><CheckCircle className="h-4 w-4"/> Target Selesai</span>
                    <p className="font-medium mt-1">{project.endDate ? format(new Date(project.endDate), 'dd MMMM yyyy', { locale: id }) : "-"}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 flex items-center gap-1"><Wallet className="h-4 w-4"/> Anggaran</span>
                    <p className="font-medium mt-1">{formatCurrency(project.budget)}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Total Penawaran</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{project.quotations?.length || 0} Dokumen</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">Total Invoice</CardTitle>
                  <Link href={`/invoices/new?projectId=${project.id}`}>
                    <Button size="sm" variant="outline" className="h-7 text-xs border-blue-200 text-blue-600 hover:bg-blue-50">
                      <Plus className="h-3 w-3 mr-1" /> Buat
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(totalInvoices)}</div>
                <p className="text-sm text-gray-500 mt-1">{project.invoices?.length || 0} Invoice</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Total Dibayar</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{formatCurrency(totalPaid)}</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="dokumen" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Dokumen Proyek</CardTitle>
                <CardDescription>Penawaran dan Invoice terkait proyek ini.</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500">Belum ada dokumen yang ditampilkan.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="jadwal" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Jadwal Pekerjaan</CardTitle>
                <CardDescription>Daftar tugas dan jadwal.</CardDescription>
              </div>
              <Button size="sm" className="bg-blue-600"><Plus className="h-4 w-4 mr-2" /> Tambah Jadwal</Button>
            </CardHeader>
            <CardContent>
               <p className="text-sm text-gray-500">Belum ada jadwal.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="progress" className="mt-6">
           <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Update Progress</CardTitle>
                <CardDescription>Timeline pengerjaan proyek.</CardDescription>
              </div>
              <Button size="sm" className="bg-blue-600"><Plus className="h-4 w-4 mr-2" /> Update Progress</Button>
            </CardHeader>
            <CardContent>
               <p className="text-sm text-gray-500">Belum ada pembaruan progress.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="keuangan" className="mt-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-green-50 border-green-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg text-green-800">Pemasukan (Dibayar)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-700">{formatCurrency(totalPaid)}</div>
              </CardContent>
            </Card>
            <Card className="bg-red-50 border-red-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg text-red-800">Pengeluaran</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-700">{formatCurrency(totalExpenses)}</div>
              </CardContent>
            </Card>
            <Card className={profit >= 0 ? "bg-blue-50 border-blue-200" : "bg-orange-50 border-orange-200"}>
              <CardHeader className="pb-2">
                <CardTitle className={`text-lg ${profit >= 0 ? 'text-blue-800' : 'text-orange-800'}`}>Profit / Margin</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${profit >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>{formatCurrency(profit)}</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Daftar Pengeluaran</CardTitle>
              </div>
              <Button
               size="sm"
               variant="outline"
               onClick={() => setExpenseDialogOpen(true)}
              >
               <Plus className="h-4 w-4 mr-2" /> Tambah Pengeluaran
              </Button>
            </CardHeader>
            <CardContent>
               {project.expenses && project.expenses.length > 0 ? (
                 <div className="space-y-4">
                   {project.expenses.map((exp: any) => (
                     <div key={exp.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-md border">
                       <div>
                         <p className="font-medium">{exp.name}</p>
                         <p className="text-xs text-gray-500">{format(new Date(exp.date), 'dd MMM yyyy', { locale: id })} • {exp.category}</p>
                         {exp.note && <p className="text-xs text-gray-500 mt-1">{exp.note}</p>}
                       </div>
                       <div className="font-bold text-red-600">
                         -{formatCurrency(exp.amount)}
                       </div>
                     </div>
                   ))}
                 </div>
               ) : (
                 <p className="text-sm text-gray-500">Belum ada catatan pengeluaran.</p>
               )}
            </CardContent>
          </Card>

          {expenseDialogOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
              <div className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-6 shadow-xl">
               <div className="mb-4 flex items-center justify-between">
                 <h2 className="text-lg font-semibold text-slate-900">Tambah Pengeluaran Proyek</h2>
                 <button type="button" className="text-slate-500 hover:text-slate-700" onClick={() => setExpenseDialogOpen(false)}>✕</button>
               </div>

               <form onSubmit={handleExpenseSubmit} className="space-y-4">
                 <div>
                   <label className="mb-1 block text-sm font-medium">Nama pengeluaran</label>
                   <input
                     required
                     value={expenseForm.name}
                     onChange={(e) => setExpenseForm({ ...expenseForm, name: e.target.value })}
                     className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                     placeholder="Contoh: Pembelian material, transport, honor"
                   />
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                   <div>
                     <label className="mb-1 block text-sm font-medium">Jumlah</label>
                     <input
                       required
                       type="number"
                       min="0"
                       value={expenseForm.amount}
                       onChange={(e) => setExpenseForm({ ...expenseForm, amount: Number(e.target.value) })}
                       className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                     />
                   </div>

                   <div>
                     <label className="mb-1 block text-sm font-medium">Kategori</label>
                     <select
                       value={expenseForm.category}
                       onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
                       className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                     >
                       <option value="MATERIAL">Material</option>
                       <option value="LABOR">Tenaga Kerja</option>
                       <option value="TRANSPORT">Transport</option>
                       <option value="OTHER">Lainnya</option>
                     </select>
                   </div>
                 </div>

                 <div>
                   <label className="mb-1 block text-sm font-medium">Tanggal</label>
                   <input
                     required
                     type="date"
                     value={expenseForm.date}
                     onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })}
                     className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                   />
                 </div>

                 <div>
                   <label className="mb-1 block text-sm font-medium">Catatan / keterangan</label>
                   <textarea
                     rows={3}
                     value={expenseForm.note}
                     onChange={(e) => setExpenseForm({ ...expenseForm, note: e.target.value })}
                     className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                     placeholder="Opsional"
                   />
                 </div>

                 <div className="flex justify-end gap-3 pt-2">
                   <button type="button" onClick={() => setExpenseDialogOpen(false)} className="rounded-md border border-slate-200 px-4 py-2 text-sm">Batal</button>
                   <button type="submit" disabled={savingExpense} className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60">
                     {savingExpense ? "Menyimpan..." : "Simpan Pengeluaran"}
                   </button>
                 </div>
               </form>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
