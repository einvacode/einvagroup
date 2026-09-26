import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatRupiah(amount: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount)
}

export function formatDate(date: Date | string) {
  return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(date))
}

export function formatShortDate(date: Date | string) {
  return new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(date))
}

export function generateDocNumber(prefix: string, sequence: number) {
  const year = new Date().getFullYear()
  const seq = sequence.toString().padStart(3, '0')
  return `${prefix}-${year}-${seq}`
}

export function getStatusColor(status: string) {
  switch (status.toUpperCase()) {
    case 'PLANNING':
    case 'PENDING':
    case 'DRAFT':
      return 'bg-yellow-100 text-yellow-800'
    case 'IN_PROGRESS':
    case 'SENT':
      return 'bg-blue-100 text-blue-800'
    case 'COMPLETED':
    case 'ACCEPTED':
    case 'PAID':
      return 'bg-green-100 text-green-800'
    case 'CANCELLED':
    case 'REJECTED':
    case 'OVERDUE':
    case 'ON_HOLD':
      return 'bg-red-100 text-red-800'
    case 'PARTIAL':
      return 'bg-purple-100 text-purple-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

export function calculatePercentage(current: number, total: number) {
  if (total === 0) return 0
  return Math.round((current / total) * 100)
}
