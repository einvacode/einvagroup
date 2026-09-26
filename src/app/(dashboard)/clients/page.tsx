'use client';

import { useEffect, useMemo, useState } from 'react';
import { Plus, Building2, Mail, Phone, MapPin, Pencil, Trash2, Search, Users, BriefcaseBusiness, MapPinned } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

const emptyForm = {
  name: '',
  company: '',
  email: '',
  phone: '',
  address: '',
};

export default function ClientsPage() {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const fetchClients = async () => {
    try {
      const res = await fetch('/api/clients');
      const data = await res.json();
      setClients(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch clients', error);
      setClients([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const stats = useMemo(() => {
    const citySet = new Set(clients.map((client) => client.address).filter(Boolean).map((item) => item.toString().trim()));
    const withCompany = clients.filter((client) => client.company && client.company.trim()).length;
    return {
      total: clients.length,
      company: withCompany,
      cities: citySet.size,
    };
  }, [clients]);

  const filteredClients = useMemo(() => {
    const term = search.toLowerCase().trim();
    if (!term) return clients;

    return clients.filter((client) =>
      [client.name, client.company, client.email, client.phone, client.address]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term))
    );
  }, [clients, search]);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const openCreateModal = () => {
    resetForm();
    setOpen(true);
  };

  const openEditModal = (client: any) => {
    setEditingId(client.id);
    setForm({
      name: client.name || '',
      company: client.company || '',
      email: client.email || '',
      phone: client.phone || '',
      address: client.address || '',
    });
    setOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) return;

    setSaving(true);
    try {
      const payload = editingId ? { id: editingId, ...form } : form;
      const method = editingId ? 'PUT' : 'POST';
      const res = await fetch('/api/clients', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error('Failed to save client');
      }

      const data = await res.json();
      if (editingId) {
        setClients((prev) => prev.map((client) => (client.id === editingId ? data : client)));
      } else {
        setClients((prev) => [data, ...prev]);
      }

      resetForm();
      setOpen(false);
    } catch (error) {
      console.error('Error saving client', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm('Hapus data klien ini?');
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/clients?id=${id}`, { method: 'DELETE' });
      if (!res.ok) {
        throw new Error('Failed to delete client');
      }

      setClients((prev) => prev.filter((client) => client.id !== id));
    } catch (error) {
      console.error('Error deleting client', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 p-6 text-white shadow-xl shadow-slate-900/10">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-blue-200">CRM</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight">Data Klien</h1>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari nama, email, kota..."
                className="h-11 border-slate-700 bg-white/10 pl-9 text-white placeholder:text-slate-300 focus-visible:ring-slate-200"
              />
            </div>

            <Dialog open={open} onOpenChange={(value) => { setOpen(value); if (!value) resetForm(); }}>
              <DialogTrigger asChild>
                <Button className="h-11 bg-white text-slate-900 hover:bg-slate-100" onClick={openCreateModal}>
                  <Plus className="mr-2 h-4 w-4" />
                  Tambah Klien
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-xl">
                <DialogHeader>
                  <DialogTitle>{editingId ? 'Edit Klien' : 'Tambah Klien Baru'}</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 pt-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Nama Klien *</label>
                    <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Contoh: Budi Santoso" />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Perusahaan</label>
                    <Input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} placeholder="Contoh: PT. Maju Bersama" />
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Email</label>
                      <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="nama@perusahaan.com" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Telepon</label>
                      <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="08xxxxxxxxx" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Alamat</label>
                    <Textarea value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Alamat klien lengkap" rows={4} />
                  </div>

                  <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={handleSubmit} disabled={saving || !form.name.trim()}>
                    {saving ? 'Menyimpan...' : editingId ? 'Update Klien' : 'Simpan Klien'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Total Klien</p>
                <p className="mt-2 text-3xl font-bold text-slate-900">{stats.total}</p>
              </div>
              <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
                <Users className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Dengan Perusahaan</p>
                <p className="mt-2 text-3xl font-bold text-slate-900">{stats.company}</p>
              </div>
              <div className="rounded-xl bg-violet-50 p-3 text-violet-600">
                <BriefcaseBusiness className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Kota Terkait</p>
                <p className="mt-2 text-3xl font-bold text-slate-900">{stats.cities}</p>
              </div>
              <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
                <MapPinned className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-0">
              <thead>
                <tr className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                  <th className="px-6 py-4">Nama</th>
                  <th className="px-6 py-4">Perusahaan</th>
                  <th className="px-6 py-4">Kontak</th>
                  <th className="px-6 py-4">Alamat</th>
                  <th className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-sm text-slate-500">Memuat data klien...</td>
                  </tr>
                ) : filteredClients.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-sm text-slate-500">Belum ada data klien yang sesuai pencarian.</td>
                  </tr>
                ) : (
                  filteredClients.map((client) => (
                    <tr key={client.id} className="border-t border-slate-200 hover:bg-slate-50/80">
                      <td className="px-6 py-4 align-top">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 font-semibold text-blue-700">
                            {String(client.name || 'K').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">{client.name}</p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 align-top text-slate-600">
                        {client.company ? (
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-slate-400" />
                            <span>{client.company}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>

                      <td className="px-6 py-4 align-top text-slate-600">
                        <div className="space-y-2">
                          {client.email ? (
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4 text-slate-400" />
                              <span>{client.email}</span>
                            </div>
                          ) : null}
                          {client.phone ? (
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4 text-slate-400" />
                              <span>{client.phone}</span>
                            </div>
                          ) : null}
                        </div>
                      </td>

                      <td className="px-6 py-4 align-top text-slate-600">
                        {client.address ? (
                          <div className="flex items-start gap-2">
                            <MapPin className="h-4 w-4 text-slate-400 mt-0.5" />
                            <span>{client.address}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>

                      <td className="px-6 py-4 align-top">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => openEditModal(client)}
                            className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(client.id)}
                            className="inline-flex items-center gap-1 rounded-md border border-red-200 bg-red-50 px-2.5 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-100"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
