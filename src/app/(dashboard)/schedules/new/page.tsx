'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'

const formSchema = z.object({
  projectId: z.string().min(1, 'Proyek harus dipilih'),
  name: z.string().min(1, 'Nama tugas harus diisi'),
  startDate: z.string().min(1, 'Tanggal mulai harus diisi'),
  endDate: z.string().min(1, 'Tanggal selesai harus diisi'),
  assigneeId: z.string().optional(),
  notes: z.string().optional()
}).refine(data => new Date(data.endDate) >= new Date(data.startDate), {
  message: "Tanggal selesai tidak boleh lebih awal dari tanggal mulai",
  path: ["endDate"]
})

type Project = { id: string; name: string }
type User = { id: string; name: string }

export default function NewSchedulePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [projects, setProjects] = useState<Project[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [error, setError] = useState('')

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      projectId: '',
      name: '',
      startDate: '',
      endDate: '',
      assigneeId: '',
      notes: ''
    }
  })

  useEffect(() => {
    // Fetch projects and users for selects
    Promise.all([
      fetch('/api/projects').then(res => res.json()),
      fetch('/api/users').then(res => res.json())
    ]).then(([projectsData, usersData]) => {
      if (Array.isArray(projectsData)) setProjects(projectsData)
      if (Array.isArray(usersData)) setUsers(usersData)
    }).catch(err => {
      console.error("Failed to fetch initial data", err)
    })
  }, [])

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/schedules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (res.ok) {
        router.push('/schedules')
        router.refresh()
      } else {
        const errorData = await res.json()
        setError(errorData.error || 'Terjadi kesalahan')
      }
    } catch (err) {
      setError('Terjadi kesalahan jaringan')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div className="flex items-center space-x-4">
        <Link href="/schedules">
          <Button variant="ghost" size="sm" className="p-2">
            <ArrowLeft className="w-5 h-5 text-gray-500" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Buat Jadwal Baru</h1>
          <p className="text-sm text-gray-500">Tambahkan tugas baru ke dalam proyek</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg border shadow-sm">
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="projectId">Proyek <span className="text-red-500">*</span></Label>
            <Select onValueChange={(val) => setValue('projectId', val)}>
              <SelectTrigger id="projectId">
                <SelectValue placeholder="Pilih Proyek" />
              </SelectTrigger>
              <SelectContent>
                {projects.map(p => (
                  <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.projectId && <p className="text-sm text-red-500">{errors.projectId.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Nama Tugas <span className="text-red-500">*</span></Label>
            <Input id="name" {...register('name')} placeholder="Mis. Instalasi Kabel" />
            {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Tanggal Mulai <span className="text-red-500">*</span></Label>
              <Input id="startDate" type="date" {...register('startDate')} />
              {errors.startDate && <p className="text-sm text-red-500">{errors.startDate.message}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="endDate">Tanggal Selesai <span className="text-red-500">*</span></Label>
              <Input id="endDate" type="date" {...register('endDate')} />
              {errors.endDate && <p className="text-sm text-red-500">{errors.endDate.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="assigneeId">PIC / Penanggung Jawab</Label>
            <Select onValueChange={(val) => setValue('assigneeId', val)}>
              <SelectTrigger id="assigneeId">
                <SelectValue placeholder="Pilih PIC (Opsional)" />
              </SelectTrigger>
              <SelectContent>
                {users.map(u => (
                  <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Catatan</Label>
            <Textarea id="notes" {...register('notes')} placeholder="Tambahkan catatan terkait tugas..." rows={3} />
          </div>

          <div className="pt-4 flex justify-end space-x-2">
            <Link href="/schedules">
              <Button type="button" variant="outline">Batal</Button>
            </Link>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Simpan Jadwal
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
