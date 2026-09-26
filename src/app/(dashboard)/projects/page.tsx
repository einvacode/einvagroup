"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Eye, FolderKanban, Plus, Search, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("Semua");
  const [type, setType] = useState("Semua");
  const [search, setSearch] = useState("");

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (status !== "Semua") params.append("status", status);
      if (type !== "Semua") params.append("type", type);
      if (search) params.append("search", search);

      const res = await fetch(`/api/projects?${params.toString()}`);
      const data = await res.json();
      if (Array.isArray(data)) setProjects(data);
    } catch (error) {
      console.error("Error fetching projects", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [status, type, search]);

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus proyek ini?")) return;

    try {
      await fetch(`/api/projects/${id}`, { method: "DELETE" });
      fetchProjects();
    } catch (error) {
      console.error("Error deleting project", error);
    }
  };

  const statusColors: Record<string, string> = {
    Planning: "bg-slate-100 text-slate-700",
    "In Progress": "bg-blue-100 text-blue-800",
    "On Hold": "bg-amber-100 text-amber-800",
    Completed: "bg-emerald-100 text-emerald-800",
    Cancelled: "bg-red-100 text-red-800",
  };

  const typeColors: Record<string, string> = {
    CCTV: "bg-violet-100 text-violet-800",
    Jaringan: "bg-indigo-100 text-indigo-800",
    Listrik: "bg-orange-100 text-orange-800",
    Lainnya: "bg-slate-100 text-slate-700",
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 p-6 text-white shadow-xl shadow-slate-900/10">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-blue-200">Portfolio</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight">Kelola Proyek</h1>
          </div>
          <Link href="/projects/new">
            <Button className="bg-white text-slate-900 hover:bg-slate-100">
              <Plus className="mr-2 h-4 w-4" /> Tambah Proyek
            </Button>
          </Link>
        </div>
      </div>

      <div className="card-surface rounded-2xl p-4 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama proyek, klien, atau tipe..."
              className="border-slate-200 pl-9"
            />
          </div>

          <div className="w-full lg:w-48">
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="border-slate-200 bg-white">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Semua">Semua Status</SelectItem>
                <SelectItem value="Planning">Planning</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="On Hold">On Hold</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="Cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="w-full lg:w-48">
            <Select value={type} onValueChange={setType}>
              <SelectTrigger className="border-slate-200 bg-white">
                <SelectValue placeholder="Tipe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Semua">Semua Tipe</SelectItem>
                <SelectItem value="CCTV">CCTV</SelectItem>
                <SelectItem value="Jaringan">Jaringan</SelectItem>
                <SelectItem value="Listrik">Listrik</SelectItem>
                <SelectItem value="Lainnya">Lainnya</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="card-surface overflow-hidden rounded-2xl shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50">
              <TableHead className="px-6 py-4">Nama Proyek</TableHead>
              <TableHead className="px-6 py-4">Klien</TableHead>
              <TableHead className="px-6 py-4">Tipe</TableHead>
              <TableHead className="px-6 py-4">Progress</TableHead>
              <TableHead className="px-6 py-4">Status</TableHead>
              <TableHead className="px-6 py-4">Tanggal Mulai</TableHead>
              <TableHead className="px-6 py-4 text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell className="px-6 py-4"><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell className="px-6 py-4"><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell className="px-6 py-4"><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                  <TableCell className="px-6 py-4"><Skeleton className="h-2 w-24" /></TableCell>
                  <TableCell className="px-6 py-4"><Skeleton className="h-6 w-24 rounded-full" /></TableCell>
                  <TableCell className="px-6 py-4"><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell className="px-6 py-4"><Skeleton className="h-8 w-16 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : projects.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="px-6 py-12 text-center text-slate-500">
                  Tidak ada proyek ditemukan.
                </TableCell>
              </TableRow>
            ) : (
              projects.map((project) => (
                <TableRow key={project.id} className="hover:bg-slate-50/60">
                  <TableCell className="px-6 py-4">
                    <Link href={`/projects/${project.id}`} className="font-semibold text-slate-900 transition-colors hover:text-blue-600">
                      {project.name}
                    </Link>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-slate-700">{project.client?.name || "-"}</TableCell>
                  <TableCell className="px-6 py-4">
                    <Badge className={`${typeColors[project.type] || "bg-slate-100 text-slate-700"} border-0`}>
                      {project.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Progress value={project.progress || 0} className="h-2 w-24" />
                      <span className="text-xs text-slate-500">{project.progress || 0}%</span>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <Badge className={`${statusColors[project.status] || "bg-slate-100 text-slate-700"} border-0`}>
                      {project.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-slate-700">
                    {project.startDate ? new Date(project.startDate).toLocaleDateString("id-ID") : "-"}
                  </TableCell>
                  <TableCell className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Link href={`/projects/${project.id}`} title="Lihat Detail">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:bg-blue-50">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button variant="ghost" size="icon" title="Hapus Proyek" className="h-8 w-8 text-red-600 hover:bg-red-50" onClick={() => handleDelete(project.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
