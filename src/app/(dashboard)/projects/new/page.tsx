"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import { ChevronLeft, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const projectSchema = z.object({
  name: z.string().min(1, "Nama proyek wajib diisi"),
  clientId: z.string().min(1, "Klien wajib dipilih"),
  type: z.string().min(1, "Tipe pekerjaan wajib diisi"),
  description: z.string().optional(),
  location: z.string().optional(),
  budget: z.coerce.number().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export default function NewProjectPage() {
  const router = useRouter();
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [clientModalOpen, setClientModalOpen] = useState(false);
  const [newClientName, setNewClientName] = useState("");
  const [newClientCompany, setNewClientCompany] = useState("");
  const [newClientPhone, setNewClientPhone] = useState("");
  const [newClientEmail, setNewClientEmail] = useState("");
  const [newClientAddress, setNewClientAddress] = useState("");
  const [clientCreating, setClientCreating] = useState(false);

  const form = useForm<z.infer<typeof projectSchema>>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: "",
      clientId: "",
      type: "",
      description: "",
      location: "",
      budget: 0,
      startDate: "",
      endDate: "",
    },
  });

  const fetchClients = async () => {
    try {
      const res = await fetch("/api/clients");
      const data = await res.json();
      if (Array.isArray(data)) setClients(data);
    } catch (error) {
      console.error("Error fetching clients", error);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const onSubmit = async (values: z.infer<typeof projectSchema>) => {
    setLoading(true);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      
      if (res.ok) {
        const data = await res.json();
        router.push(`/projects/${data.id}`);
      } else {
        const err = await res.json();
        console.error("Failed to create project", err);
      }
    } catch (error) {
      console.error("Error creating project", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClient = async () => {
    if (!newClientName) return;
    setClientCreating(true);
    try {
      const res = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newClientName,
          company: newClientCompany,
          email: newClientEmail,
          phone: newClientPhone,
          address: newClientAddress,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setClients([data, ...clients]);
        form.setValue("clientId", data.id);
        setClientModalOpen(false);
        setNewClientName("");
        setNewClientCompany("");
        setNewClientEmail("");
        setNewClientPhone("");
        setNewClientAddress("");
      }
    } catch (error) {
      console.error("Error creating client", error);
    } finally {
      setClientCreating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/projects">
          <Button variant="ghost" size="icon">
            <ChevronLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Buat Proyek Baru</h1>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama Proyek *</FormLabel>
                    <FormControl>
                      <Input placeholder="Contoh: Instalasi CCTV Gedung A" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-2">
                <FormField
                  control={form.control}
                  name="clientId"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Klien *</FormLabel>
                      <div className="flex gap-2">
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih Klien" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {clients.map(client => (
                              <SelectItem key={client.id} value={client.id}>
                                {client.name} {client.company && `(${client.company})`}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <Dialog open={clientModalOpen} onOpenChange={setClientModalOpen}>
                          <DialogTrigger asChild>
                            <Button type="button" variant="outline" size="icon" title="Tambah Klien Baru">
                              <Plus className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Tambah Klien Baru</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 pt-4">
                              <div className="space-y-2">
                                <label className="text-sm font-medium">Nama *</label>
                                <Input value={newClientName} onChange={e => setNewClientName(e.target.value)} />
                              </div>
                              <div className="space-y-2">
                                <label className="text-sm font-medium">Perusahaan</label>
                                <Input value={newClientCompany} onChange={e => setNewClientCompany(e.target.value)} />
                              </div>
                              <div className="space-y-2">
                                <label className="text-sm font-medium">Telepon</label>
                                <Input value={newClientPhone} onChange={e => setNewClientPhone(e.target.value)} />
                              </div>
                              <div className="space-y-2">
                                <label className="text-sm font-medium">Email</label>
                                <Input value={newClientEmail} onChange={e => setNewClientEmail(e.target.value)} />
                              </div>
                              <div className="space-y-2">
                                <label className="text-sm font-medium">Alamat</label>
                                <Textarea value={newClientAddress} onChange={e => setNewClientAddress(e.target.value)} />
                              </div>
                              <Button type="button" className="w-full bg-blue-600" onClick={handleCreateClient} disabled={clientCreating || !newClientName}>
                                {clientCreating ? "Menyimpan..." : "Simpan Klien"}
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipe Pekerjaan *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih Tipe" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="CCTV">CCTV</SelectItem>
                        <SelectItem value="Jaringan">Jaringan</SelectItem>
                        <SelectItem value="Listrik">Listrik</SelectItem>
                        <SelectItem value="Lainnya">Lainnya</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lokasi</FormLabel>
                    <FormControl>
                      <Input placeholder="Alamat atau nama lokasi" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="budget"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Anggaran (Rp)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tanggal Mulai</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Target Selesai</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Deskripsi Proyek</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Keterangan tambahan..." rows={4} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end pt-4 border-t">
              <Button type="button" variant="outline" className="mr-2" onClick={() => router.back()}>
                Batal
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={loading}>
                {loading ? "Menyimpan..." : "Buat Proyek"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
