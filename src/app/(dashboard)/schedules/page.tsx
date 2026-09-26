import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Plus, Calendar as CalendarIcon, List, ChevronLeft, ChevronRight, BarChartHorizontal, Printer } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { differenceInDays, addDays, format, min, max, startOfDay, endOfDay } from 'date-fns'

type Schedule = {
  id: string
  projectId: string
  name: string
  startDate: string
  endDate: string
  status: string
  assigneeId?: string
  notes?: string
  project: { id: string; name: string }
  assignee?: { id: string; name: string }
}

const statusColors: Record<string, string> = {
  PENDING: 'bg-slate-500',
  IN_PROGRESS: 'bg-blue-600',
  COMPLETED: 'bg-emerald-600',
}

const statusLabels: Record<string, string> = {
  PENDING: 'Menunggu',
  IN_PROGRESS: 'Proses',
  COMPLETED: 'Selesai',
}

export default function SchedulesPage() {
  const router = useRouter()
  const [view, setView] = useState<'calendar' | 'list' | 'gantt'>('gantt')
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [loading, setLoading] = useState(true)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedProjectId, setSelectedProjectId] = useState<string>('all')
  
  useEffect(() => {
    fetchSchedules()
  }, [])

  const fetchSchedules = async () => {
    try {
      const res = await fetch('/api/schedules')
      const data = await res.json()
      if (res.ok) {
        setSchedules(data)
      }
    } catch (error) {
      console.error('Failed to fetch schedules:', error)
    } finally {
      setLoading(false)
    }
  }

  // --- Calendar View Logic ---
  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate()
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay()

  const handlePrevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  const handleNextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  const handleToday = () => setCurrentDate(new Date())

  const getSchedulesForDay = (day: number) => {
    const targetDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
    targetDate.setHours(0, 0, 0, 0)
    
    return schedules.filter(schedule => {
      if (selectedProjectId !== 'all' && schedule.projectId !== selectedProjectId) return false
      const start = new Date(schedule.startDate)
      start.setHours(0, 0, 0, 0)
      const end = new Date(schedule.endDate)
      end.setHours(23, 59, 59, 999)
      return targetDate >= start && targetDate <= end
    })
  }

  const renderCalendar = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const daysInMonth = getDaysInMonth(year, month)
    const firstDay = getFirstDayOfMonth(year, month)
    
    const days = []
    const weekDays = ['Ming', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-32 border-b border-r bg-slate-50/50 p-2"></div>)
    }

    const today = new Date()

    for (let day = 1; day <= daysInMonth; day++) {
      const daySchedules = getSchedulesForDay(day)
      const isToday = today.getDate() === day && today.getMonth() === month && today.getFullYear() === year

      days.push(
        <div key={day} className={`h-32 border-b border-r p-2 overflow-y-auto ${isToday ? 'bg-blue-50/30' : ''}`}>
          <div className="flex justify-between items-center mb-1">
            <span className={`text-sm font-medium ${isToday ? 'bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center' : 'text-slate-700'}`}>
              {day}
            </span>
          </div>
          <div className="space-y-1">
            {daySchedules.map((schedule) => (
              <div 
                key={schedule.id}
                className={`${statusColors[schedule.status] || 'bg-slate-500'} text-white text-[10px] sm:text-xs p-1 rounded truncate cursor-pointer hover:opacity-80`}
                title={`${schedule.name} - ${schedule.project.name}`}
              >
                {schedule.name}
              </div>
            ))}
          </div>
        </div>
      )
    }

    return (
      <div className="bg-white rounded-xl border shadow-sm mt-4">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center space-x-4">
            <h2 className="text-lg font-bold text-slate-900">
              {currentDate.toLocaleString('id-ID', { month: 'long', year: 'numeric' })}
            </h2>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={handlePrevMonth}><ChevronLeft className="h-4 w-4" /></Button>
            <Button variant="outline" size="sm" onClick={handleToday}>Hari Ini</Button>
            <Button variant="outline" size="sm" onClick={handleNextMonth}><ChevronRight className="h-4 w-4" /></Button>
          </div>
        </div>
        <div className="grid grid-cols-7 border-b bg-slate-50">
          {weekDays.map(day => (
            <div key={day} className="py-2 text-center text-xs font-bold text-slate-500 border-r last:border-r-0">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 bg-white">
          {days}
        </div>
      </div>
    )
  }

  // --- List View Logic ---
  const renderList = () => {
    const filtered = selectedProjectId === 'all' ? schedules : schedules.filter(s => s.projectId === selectedProjectId)
    return (
      <div className="bg-white rounded-xl border shadow-sm mt-4 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-[11px] text-slate-500 uppercase tracking-wider bg-slate-50 border-b font-bold">
              <tr>
                <th className="px-6 py-4">Nama Tugas</th>
                <th className="px-6 py-4">Proyek</th>
                <th className="px-6 py-4">PIC</th>
                <th className="px-6 py-4">Mulai</th>
                <th className="px-6 py-4">Selesai</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((schedule) => (
                <tr key={schedule.id} className="hover:bg-slate-50/80">
                  <td className="px-6 py-4 font-semibold text-slate-900">{schedule.name}</td>
                  <td className="px-6 py-4 text-slate-600">{schedule.project.name}</td>
                  <td className="px-6 py-4 text-slate-600">{schedule.assignee?.name || '-'}</td>
                  <td className="px-6 py-4 text-slate-600">{formatDate(schedule.startDate)}</td>
                  <td className="px-6 py-4 text-slate-600">{formatDate(schedule.endDate)}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold text-white ${statusColors[schedule.status] || 'bg-slate-500'}`}>
                      {statusLabels[schedule.status] || schedule.status}
                    </span>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    Tidak ada jadwal untuk proyek ini.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  // --- Gantt Chart View Logic ---
  const projects = useMemo(() => {
    const map = new Map<string, { id: string, name: string, schedules: Schedule[] }>()
    schedules.forEach(s => {
      if (!map.has(s.projectId)) {
        map.set(s.projectId, { id: s.projectId, name: s.project.name, schedules: [] })
      }
      map.get(s.projectId)!.schedules.push(s)
    })
    return Array.from(map.values())
  }, [schedules])

  const renderGantt = () => {
    const filteredProjects = selectedProjectId === 'all' ? projects : projects.filter(p => p.id === selectedProjectId)

    if (filteredProjects.length === 0) {
      return (
        <div className="bg-white rounded-xl border p-12 text-center text-slate-500 mt-4 shadow-sm">
          Tidak ada data jadwal untuk ditampilkan dalam Gantt Chart.
        </div>
      )
    }

    return (
      <div className="mt-4 space-y-8">
        {filteredProjects.map(project => {
          // Calculate project bounds
          const startDates = project.schedules.map(s => startOfDay(new Date(s.startDate)))
          const endDates = project.schedules.map(s => endOfDay(new Date(s.endDate)))
          
          if (startDates.length === 0) return null

          const projectStart = min(startDates)
          const projectEnd = max(endDates)
          const totalDays = Math.max(1, differenceInDays(projectEnd, projectStart) + 1)
          
          // Generate date headers (show every few days if too long, or every day)
          const dateHeaders = []
          for (let i = 0; i < totalDays; i++) {
            dateHeaders.push(addDays(projectStart, i))
          }

          return (
            <div key={project.id} className="bg-white rounded-xl border shadow-sm overflow-hidden gantt-container print:break-inside-avoid print:shadow-none print:border-slate-300">
              <div className="bg-slate-50 px-6 py-4 border-b">
                <h3 className="text-lg font-bold text-slate-900">{project.name}</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Timeline: {format(projectStart, 'dd MMM yyyy')} - {format(projectEnd, 'dd MMM yyyy')} ({totalDays} Hari)
                </p>
              </div>
              
              <div className="overflow-x-auto pb-4">
                <div className="min-w-[800px] p-6">
                  {/* Gantt Timeline Header */}
                  <div className="flex border-b border-slate-200 pb-2 mb-4 relative">
                    <div className="w-1/3 shrink-0 font-semibold text-xs text-slate-500 uppercase tracking-wider">Daftar Tugas</div>
                    <div className="w-2/3 relative flex text-[10px] text-slate-400">
                      {dateHeaders.map((date, idx) => {
                        // Show label only occasionally if there are many days
                        const showLabel = totalDays <= 14 || idx % Math.ceil(totalDays / 10) === 0 || idx === totalDays - 1
                        return (
                          <div key={idx} className="flex-1 border-l border-slate-100 relative h-4">
                            {showLabel && (
                              <span className="absolute -top-1 -left-3 w-6 text-center">{format(date, 'd/M')}</span>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Gantt Rows */}
                  <div className="space-y-4">
                    {project.schedules.map((schedule) => {
                      const sStart = startOfDay(new Date(schedule.startDate))
                      const sEnd = endOfDay(new Date(schedule.endDate))
                      
                      const leftPercent = (differenceInDays(sStart, projectStart) / totalDays) * 100
                      const widthPercent = (Math.max(1, differenceInDays(sEnd, sStart) + 1) / totalDays) * 100

                      return (
                        <div key={schedule.id} className="flex items-center group">
                          <div className="w-1/3 shrink-0 pr-4">
                            <div className="text-sm font-semibold text-slate-800 truncate" title={schedule.name}>{schedule.name}</div>
                            <div className="text-[11px] text-slate-500 truncate">
                              PIC: {schedule.assignee?.name || '-'} • {format(sStart, 'dd/MM')} - {format(sEnd, 'dd/MM')}
                            </div>
                          </div>
                          
                          <div className="w-2/3 relative h-8 bg-slate-50 rounded-lg border border-slate-100">
                            {/* Grid lines background */}
                            <div className="absolute inset-0 flex">
                              {dateHeaders.map((_, idx) => (
                                <div key={idx} className="flex-1 border-l border-slate-100" />
                              ))}
                            </div>
                            
                            {/* Gantt Bar */}
                            <div 
                              className={`absolute top-1 bottom-1 rounded-md shadow-sm opacity-90 group-hover:opacity-100 transition-all ${statusColors[schedule.status] || 'bg-slate-500'} print:!bg-slate-800`}
                              style={{ 
                                left: `${Math.max(0, leftPercent)}%`, 
                                width: `${Math.min(100 - leftPercent, widthPercent)}%` 
                              }}
                            >
                              <div className="w-full h-full px-2 flex items-center overflow-hidden">
                                <span className="text-[10px] font-bold text-white truncate drop-shadow-md">
                                  {schedule.status === 'COMPLETED' ? '✓' : ''} {schedule.name}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="space-y-6">
      {/* CSS for print mode */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * { visibility: hidden; }
          .gantt-container, .gantt-container * { visibility: visible; }
          .gantt-container { position: absolute; left: 0; top: 0; width: 100%; border: none !important; }
          aside, header, .no-print { display: none !important; }
        }
      `}} />

      <div className="rounded-3xl border border-slate-200 bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 p-6 text-white shadow-xl shadow-violet-500/20 no-print">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-violet-100">Scheduling</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight">Jadwal Proyek</h1>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <select
              className="bg-white/10 border border-white/20 text-white text-sm rounded-xl px-3 py-2 outline-none appearance-none cursor-pointer backdrop-blur-sm"
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
            >
              <option value="all" className="text-slate-900">Semua Proyek</option>
              {projects.map(p => (
                <option key={p.id} value={p.id} className="text-slate-900">{p.name}</option>
              ))}
            </select>

            <div className="flex rounded-xl bg-white/10 p-1 backdrop-blur-sm">
              <button
                onClick={() => setView('gantt')}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${view === 'gantt' ? 'bg-white text-violet-700' : 'text-violet-100 hover:text-white'}`}
              >
                <span className="flex items-center gap-2"><BarChartHorizontal className="h-4 w-4" /> Gantt</span>
              </button>
              <button
                onClick={() => setView('calendar')}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${view === 'calendar' ? 'bg-white text-violet-700' : 'text-violet-100 hover:text-white'}`}
              >
                <span className="flex items-center gap-2"><CalendarIcon className="h-4 w-4" /> Kalender</span>
              </button>
              <button
                onClick={() => setView('list')}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${view === 'list' ? 'bg-white text-violet-700' : 'text-violet-100 hover:text-white'}`}
              >
                <span className="flex items-center gap-2"><List className="h-4 w-4" /> Daftar</span>
              </button>
            </div>

            {view === 'gantt' && (
              <Button onClick={handlePrint} className="bg-emerald-500 text-white hover:bg-emerald-600 shadow-md">
                <Printer className="mr-2 h-4 w-4" /> Cetak Gantt
              </Button>
            )}

            <Button onClick={() => router.push('/schedules/new')} className="bg-white text-violet-700 hover:bg-violet-50 shadow-md">
              <Plus className="mr-2 h-4 w-4" />
              Jadwal Baru
            </Button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-violet-600" />
        </div>
      ) : (
        view === 'calendar' ? renderCalendar() : view === 'list' ? renderList() : renderGantt()
      )}
    </div>
  )
}

