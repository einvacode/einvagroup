const fs = require('fs');

let content = fs.readFileSync('src/app/(dashboard)/projects/[id]/page.tsx', 'utf-8');

// 1. Add imports
content = content.replace(
  'import { Skeleton } from "@/components/ui/skeleton";',
  `import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";`
);

// 2. Add state
const stateToInject = `  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [progressDialogOpen, setProgressDialogOpen] = useState(false);
  const [progressForm, setProgressForm] = useState({ percentage: 0, note: "" });
  const [editForm, setEditForm] = useState<any>({});
  const [savingProgress, setSavingProgress] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);
`;
content = content.replace('  const [savingExpense, setSavingExpense] = useState(false);', `  const [savingExpense, setSavingExpense] = useState(false);\n${stateToInject}`);

// 3. Add functions
const functionsToInject = `
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingEdit(true);
    try {
      const res = await fetch(\`/api/projects/\${projectId}\`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editForm.name,
          location: editForm.location,
          budget: Number(editForm.budget || 0),
          status: editForm.status,
          type: editForm.type,
          startDate: editForm.startDate,
          endDate: editForm.endDate,
        }),
      });
      if (!res.ok) throw new Error("Gagal menyimpan");
      setEditDialogOpen(false);
      await fetchProject();
    } catch (error) {
      alert("Gagal mengupdate proyek");
    } finally {
      setSavingEdit(false);
    }
  };

  const handleProgressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProgress(true);
    try {
      const res = await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          percentage: Number(progressForm.percentage),
          note: progressForm.note,
        }),
      });
      if (!res.ok) throw new Error("Gagal menyimpan progress");
      setProgressDialogOpen(false);
      setProgressForm({ percentage: 0, note: "" });
      await fetchProject();
    } catch (error) {
      alert("Gagal mengupdate progress");
    } finally {
      setSavingProgress(false);
    }
  };

  const openEditDialog = () => {
    setEditForm({
      name: project.name || "",
      location: project.location || "",
      budget: project.budget || 0,
      status: project.status || "Planned",
      type: project.type || "Instalasi",
      startDate: project.startDate ? new Date(project.startDate).toISOString().slice(0, 10) : "",
      endDate: project.endDate ? new Date(project.endDate).toISOString().slice(0, 10) : "",
    });
    setEditDialogOpen(true);
  };
`;
content = content.replace('  const handleExpenseSubmit = async', `${functionsToInject}\n  const handleExpenseSubmit = async`);

// 4. Edit Project Button
const editBtnInject = `        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={openEditDialog}>Edit Proyek</Button>
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 border-0">{project.status}</Badge>`;
content = content.replace(
  /<div className="flex items-center gap-2">\s*<Badge className="bg-blue-100 text-blue-800/s,
  editBtnInject
);

// 5. Update Progress Button
content = content.replace(
  '<Button size="sm" className="bg-blue-600"><Plus className="h-4 w-4 mr-2" /> Update Progress</Button>',
  '<Button size="sm" className="bg-blue-600" onClick={() => { setProgressForm({ percentage: project.progress || 0, note: "" }); setProgressDialogOpen(true); }}><Plus className="h-4 w-4 mr-2" /> Update Progress</Button>'
);

// 6. Display progress updates
const progressList = `{project.progressUpdates?.length > 0 ? (
                <div className="space-y-4">
                  {project.progressUpdates.map((update: any) => (
                    <div key={update.id} className="border-l-2 border-blue-500 pl-4 py-2">
                      <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                        <Clock className="h-3 w-3" />
                        <span>{format(new Date(update.createdAt), "dd MMM yyyy HH:mm", { locale: id })}</span>
                        <span className="font-semibold text-blue-600 ml-2">{update.percentage}%</span>
                      </div>
                      <p className="text-gray-800">{update.note || "Tidak ada catatan."}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">Belum ada pembaruan progress.</p>
              )}`;
content = content.replace('<p className="text-sm text-gray-500">Belum ada pembaruan progress.</p>', progressList);


// 7. Inject Dialogs at the end
const dialogsInject = `

      {/* Edit Project Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Proyek</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Nama Proyek</Label>
              <Input required value={editForm.name} onChange={(e) => setEditForm({...editForm, name: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>Lokasi</Label>
              <Input value={editForm.location} onChange={(e) => setEditForm({...editForm, location: e.target.value})} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tanggal Mulai</Label>
                <Input type="date" value={editForm.startDate} onChange={(e) => setEditForm({...editForm, startDate: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Target Selesai</Label>
                <Input type="date" value={editForm.endDate} onChange={(e) => setEditForm({...editForm, endDate: e.target.value})} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Status</Label>
                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={editForm.status} onChange={(e) => setEditForm({...editForm, status: e.target.value})}>
                  <option value="Planned">Planned</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="On Hold">On Hold</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Anggaran (Rp)</Label>
                <Input type="number" value={editForm.budget} onChange={(e) => setEditForm({...editForm, budget: e.target.value})} />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>Batal</Button>
              <Button type="submit" disabled={savingEdit}>{savingEdit ? "Menyimpan..." : "Simpan Perubahan"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Update Progress Dialog */}
      <Dialog open={progressDialogOpen} onOpenChange={setProgressDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Update Progress</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleProgressSubmit} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Persentase Progress (%)</Label>
              <Input type="number" min="0" max="100" required value={progressForm.percentage} onChange={(e) => setProgressForm({...progressForm, percentage: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>Catatan / Keterangan</Label>
              <Textarea placeholder="Progress hari ini meliputi..." value={progressForm.note} onChange={(e) => setProgressForm({...progressForm, note: e.target.value})} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setProgressDialogOpen(false)}>Batal</Button>
              <Button type="submit" disabled={savingProgress}>{savingProgress ? "Menyimpan..." : "Update Progress"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}`;
content = content.replace(/<\/div>\s*<\/div>\s*\);\s*}\s*$/, dialogsInject);

fs.writeFileSync('src/app/(dashboard)/projects/[id]/page.tsx', content);
