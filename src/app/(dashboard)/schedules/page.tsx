'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Plus, Calendar as CalendarIcon, List, ChevronLeft, ChevronRight } from 'lucide-react'
import { formatDate } from '@/lib/utils'

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
  PENDING: 'bg-gray-500',
  IN_PROGRESS: 'bg-blue-600',
  COMPLETED: 'bg-green-600',
}

const statusLabels: Record<string, string> = {
  PENDING: 'Menunggu',
  IN_PROGRESS: 'Proses',
  COMPLETED: 'Selesai',
}

export default function SchedulesPage() {
  const router = useRouter()
  const [view, setView] = useState<'calendar' | 'list'>('calendar')
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [loading, setLoading] = useState(true)
  const [currentDate, setCurrentDate] = useState(new Date())
  
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

  // Calendar Helpers
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay()
  }

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const handleToday = () => {
    setCurrentDate(new Date())
  }

  const getSchedulesForDay = (day: number) => {
    const targetDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
    targetDate.setHours(0, 0, 0, 0)
    
    return schedules.filter(schedule => {
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
      days.push(<div key={`empty-${i}`} className="h-32 border-b border-r bg-gray-50/50 p-2"></div>)
    }

    const today = new Date()

    for (let day = 1; day <= daysInMonth; day++) {
      const daySchedules = getSchedulesForDay(day)
      const isToday = today.getDate() === day && today.getMonth() === month && today.getFullYear() === year

      days.push(
        <div key={day} className={`h-32 border-b border-r p-2 overflow-y-auto ${isToday ? 'bg-blue-50/30' : ''}`}>
          <div className="flex justify-between items-center mb-1">
            <span className={`text-sm font-medium ${isToday ? 'bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center' : 'text-gray-700'}`}>
              {day}
            </span>
          </div>
          <div className="space-y-1">
            {daySchedules.map((schedule) => (
              <div 
                key={schedule.id}
                className={`${statusColors[schedule.status] || 'bg-gray-500'} text-white text-xs p-1 rounded truncate cursor-pointer hover:opacity-80`}
                title={`${schedule.name} - ${schedule.project.name}`}
                onClick={() => alert(`Tugas: ${schedule.name}\nProyek: ${schedule.project.name}\nPIC: ${schedule.assignee?.name || '-'}`)}
              >
                {schedule.name}
              </div>
            ))}
          </div>
        </div>
      )
    }

    return (
      <div className="bg-white rounded-lg border shadow-sm mt-4">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center space-x-4">
            <h2 className="text-lg font-semibold text-gray-900">
              {currentDate.toLocaleString('id-ID', { month: 'long', year: 'numeric' })}
            </h2>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={handlePrevMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleToday}>
              Hari Ini
            </Button>
            <Button variant="outline" size="sm" onClick={handleNextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-7 border-b bg-gray-50">
          {weekDays.map(day => (
            <div key={day} className="py-2 text-center text-sm font-medium text-gray-500 border-r last:border-r-0">
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

  const renderList = () => {
    return (
      <div className="bg-white rounded-lg border shadow-sm mt-4 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3">Nama Tugas</th>
                <th className="px-6 py-3">Proyek</th>
                <th className="px-6 py-3">PIC</th>
                <th className="px-6 py-3">Mulai</th>
                <th className="px-6 py-3">Selesai</th>
                <th className="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {schedules.map((schedule) => (
                <tr key={schedule.id} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">{schedule.name}</td>
                  <td className="px-6 py-4">{schedule.project.name}</td>
                  <td className="px-6 py-4">{schedule.assignee?.name || '-'}</td>
                  <td className="px-6 py-4">{formatDate(schedule.startDate)}</td>
                  <td className="px-6 py-4">{formatDate(schedule.endDate)}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs text-white ${statusColors[schedule.status] || 'bg-gray-500'}`}>
                      {statusLabels[schedule.status] || schedule.status}
                    </span>
                  </td>
                </tr>
              ))}
              {schedules.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    Tidak ada jadwal yang ditemukan
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 p-6 text-white shadow-xl shadow-violet-500/20">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-violet-100">Scheduling</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight">Jadwal Proyek</h1>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex rounded-xl bg-white/10 p-1 backdrop-blur-sm">
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

            <Button onClick={() => router.push('/schedules/new')} className="bg-white text-violet-700 hover:bg-violet-50">
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
        view === 'calendar' ? renderCalendar() : renderList()
      )}
    </div>
  )
}
