"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function InvoiceForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [projects, setProjects] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [items, setItems] = useState([{ name: "", description: "", quantity: 1, unit: "Unit", unitPrice: 0 }]);
  const [discount, setDiscount] = useState(0);
  const [useTax, setUseTax] = useState(false);
  const [initialPayment, setInitialPayment] = useState(0);
  const [dueDate, setDueDate] = useState("");
  
  const [projectId, setProjectId] = useState(searchParams.get("projectId") || "");
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
  const safeInitialPayment = Math.min(Math.max(initialPayment, 0), grandTotal);

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

    if (!projectId || !clientId || !dueDate) {
      alert("Pilih proyek, klien, dan tanggal jatuh tempo terlebih dahulu.");
      return;
    }

    const payload = {
      projectId,
      clientId,
      items: items.map((item) => ({
        ...item,
        qty: Number(item.quantity || 0),
      })),
      discount,
      tax: useTax ? 11 : 0,
      initialPayment: safeInitialPayment,
      dueDate: new Date(dueDate).toISOString(),
      notes: `Pembayaran dapat ditransfer ke Rekening BCA 123456789 a/n ProjeKerja Inc.\nUang muka awal: ${safeInitialPayment.toLocaleString("id-ID", { style: "currency", currency: "IDR" })}`
    };

    const res = await fetch("/api/invoices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      router.push("/invoices");
    } else {
      const err = await res.json().catch(() => ({}));
      alert(err?.error || "Gagal menyimpan invoice");
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Buat Invoice Baru</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
          <div>
            <label className="block text-sm font-medium mb-1">Jatuh Tempo</label>
            <input required type="date" className="w-full border p-2 rounded" value={dueDate} onChange={e => setDueDate(e.target.value)} />
          </div>
        </div>

        {/* Items Table */}
        <div className="border rounded p-4 bg-white">
          <h2 className="font-semibold mb-4">Item Invoice</h2>
          {items.map((item, index) => (
            <div key={index} className="flex gap-4 items-start mb-4 border-b pb-4">
              <div className="flex-1">
                <input placeholder="Nama Item" className="w-full border p-2 rounded mb-2" value={item.name} onChange={e => handleItemChange(index, "name", e.target.value)} required />
                <input placeholder="Deskripsi (Opsional)" className="w-full border p-2 rounded text-sm" value={item.description} onChange={e => handleItemChange(index, "description", e.target.value)} />
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

        {/* Totals */}
        <div className="flex justify-end bg-gray-50 p-4 rounded border">
          <div className="w-72 space-y-2 text-sm">
            <div className="flex justify-between"><span>Subtotal:</span> <span>{subtotal.toLocaleString("id-ID", { style: "currency", currency: "IDR" })}</span></div>
            <div className="flex justify-between items-center">
              <span>Diskon (Rp):</span>
              <input type="number" className="border p-1 w-24 text-right" value={discount} onChange={e => setDiscount(Number(e.target.value))} />
            </div>
            <div className="flex justify-between items-center">
              <span>PPN 11%:</span>
              <input type="checkbox" checked={useTax} onChange={e => setUseTax(e.target.checked)} />
            </div>
            <div className="flex justify-between items-center border-t pt-2">
              <span>Uang Muka (Rp):</span>
              <input type="number" className="border p-1 w-24 text-right" value={safeInitialPayment} onChange={e => setInitialPayment(Number(e.target.value))} max={grandTotal} />
            </div>
            <div className="flex justify-between font-bold text-lg pt-2 border-t"><span>Total:</span> <span>{grandTotal.toLocaleString("id-ID", { style: "currency", currency: "IDR" })}</span></div>
            <div className="flex justify-between text-gray-600 pt-1">
              <span>Sisa tagihan:</span>
              <span>{(grandTotal - safeInitialPayment).toLocaleString("id-ID", { style: "currency", currency: "IDR" })}</span>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <button type="button" onClick={() => router.back()} className="px-4 py-2 border rounded hover:bg-gray-100">Batal</button>
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Simpan Invoice</button>
        </div>
      </form>
    </div>
  );
}

export default function NewInvoicePage() {
  return (
    <Suspense fallback={<div>Memuat form...</div>}>
      <InvoiceForm />
    </Suspense>
  );
}
