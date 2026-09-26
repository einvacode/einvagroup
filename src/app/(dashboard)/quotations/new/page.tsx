"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function NewQuotationPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [items, setItems] = useState([{ name: "", description: "", quantity: 1, unit: "Unit", unitPrice: 0 }]);
  const [discount, setDiscount] = useState(0);
  const [useTax, setUseTax] = useState(false);
  const [subject, setSubject] = useState("Penawaran Pekerjaan");
  const [letterBody, setLetterBody] = useState(
    "Dengan hormat,\n\nBersama ini kami sampaikan penawaran untuk pelaksanaan pekerjaan yang telah dibahas sebelumnya. Kami berharap dapat melanjutkan kerja sama sesuai kebutuhan dan jadwal yang disepakati."
  );
  const [projectId, setProjectId] = useState("");
  const [clientId, setClientId] = useState("");

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [projectRes, clientRes] = await Promise.all([
          fetch("/api/projects"),
          fetch("/api/clients"),
        ]);

        const [projectData, clientData] = await Promise.all([
          projectRes.json(),
          clientRes.json(),
        ]);

        setProjects(Array.isArray(projectData) ? projectData : []);
        setClients(Array.isArray(clientData) ? clientData : []);
      } catch (error) {
        console.error("Failed to load project and client options", error);
      }
    };

    fetchOptions();
  }, []);

  useEffect(() => {
    if (!projectId) return;
    const selectedProject = projects.find((project) => project.id === projectId);
    if (selectedProject?.clientId && selectedProject.clientId !== clientId) {
      setClientId(selectedProject.clientId);
    }
  }, [projectId, projects, clientId]);

  const subtotal = items.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);
  const totalAfterDiscount = subtotal - discount;
  const tax = useTax ? totalAfterDiscount * 0.11 : 0;
  const grandTotal = totalAfterDiscount + tax;

  const handleAddItem = () => {
    setItems([...items, { name: "", description: "", quantity: 1, unit: "Unit", unitPrice: 0 }]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...items];
    (newItems[index] as any)[field] = value;
    setItems(newItems);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!projectId || !clientId) {
      alert("Pilih proyek dan klien terlebih dahulu.");
      return;
    }

    const payload = {
      projectId,
      clientId,
      subject,
      items: items.map((item) => ({
        ...item,
        qty: Number(item.quantity || 0),
        quantity: Number(item.quantity || 0),
      })),
      discount,
      tax: useTax ? 11 : 0,
      notes: letterBody,
    };

    const res = await fetch("/api/quotations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      router.push("/quotations");
    } else {
      const err = await res.json().catch(() => ({}));
      alert(err?.error || "Gagal menyimpan penawaran");
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Buat Penawaran Baru</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Proyek</label>
            <select
              required
              className="w-full border p-2 rounded"
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
            >
              <option value="">Pilih Proyek</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>{project.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Klien</label>
            <select
              required
              className="w-full border p-2 rounded"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
            >
              <option value="">Pilih Klien</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>{client.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="bg-white border rounded p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Perihal</label>
            <input value={subject} onChange={e => setSubject(e.target.value)} className="w-full border p-2 rounded" placeholder="Misal: Penawaran Pekerjaan Instalasi CCTV" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Isi Surat Penawaran</label>
            <textarea
              value={letterBody}
              onChange={e => setLetterBody(e.target.value)}
              rows={6}
              className="w-full border p-2 rounded resize-y"
              placeholder="Tulis kalimat formal untuk surat penawaran Anda..."
            />
          </div>
        </div>

        <div className="border rounded p-4 bg-white">
          <h2 className="font-semibold mb-4">Rincian Pekerjaan</h2>
          {items.map((item, index) => (
            <div key={index} className="flex gap-4 items-start mb-4 border-b pb-4">
              <div className="flex-1">
                <input placeholder="Nama Pekerjaan" className="w-full border p-2 rounded mb-2" value={item.name} onChange={e => handleItemChange(index, "name", e.target.value)} required />
                <input placeholder="Deskripsi pekerjaan / detail teknis (opsional)" className="w-full border p-2 rounded text-sm" value={item.description} onChange={e => handleItemChange(index, "description", e.target.value)} />
              </div>
              <div className="w-24">
                <input type="number" min="1" placeholder="Qty" className="w-full border p-2 rounded" value={item.quantity} onChange={e => handleItemChange(index, "quantity", Number(e.target.value))} required />
              </div>
              <div className="w-24">
                <select className="w-full border p-2 rounded" value={item.unit} onChange={e => handleItemChange(index, "unit", e.target.value)}>
                  <option>Unit</option>
                  <option>Set</option>
                  <option>Meter</option>
                  <option>Lot</option>
                </select>
              </div>
              <div className="w-40">
                <input type="number" min="0" placeholder="Harga" className="w-full border p-2 rounded" value={item.unitPrice} onChange={e => handleItemChange(index, "unitPrice", Number(e.target.value))} required />
              </div>
              <div className="w-10">
                <button type="button" onClick={() => handleRemoveItem(index)} className="text-red-500 hover:text-red-700">X</button>
              </div>
            </div>
          ))}
          <button type="button" onClick={handleAddItem} className="text-blue-600 text-sm font-medium">+ Tambah Item</button>
        </div>

        <div className="flex justify-end bg-gray-50 p-4 rounded border">
          <div className="w-64 space-y-2 text-sm">
            <div className="flex justify-between"><span>Subtotal:</span> <span>{subtotal.toLocaleString("id-ID", { style: "currency", currency: "IDR" })}</span></div>
            <div className="flex justify-between items-center">
              <span>Diskon (Rp):</span>
              <input type="number" className="border p-1 w-24 text-right" value={discount} onChange={e => setDiscount(Number(e.target.value))} />
            </div>
            <div className="flex justify-between items-center">
              <span>PPN 11%:</span>
              <input type="checkbox" checked={useTax} onChange={e => setUseTax(e.target.checked)} />
            </div>
            <div className="flex justify-between font-bold text-lg pt-2 border-t"><span>Total:</span> <span>{grandTotal.toLocaleString("id-ID", { style: "currency", currency: "IDR" })}</span></div>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <button type="button" onClick={() => router.back()} className="px-4 py-2 border rounded hover:bg-gray-100">Batal</button>
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Simpan Draft</button>
        </div>
      </form>
    </div>
  );
}
