import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function formatDate(date) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export function formatDistance(meters) {
  if (meters < 1000) {
    return `${Math.round(meters)}m`
  }
  return `${(meters / 1000).toFixed(1)}km`
}

export function getPriorityColor(priority) {
  switch (priority) {
    case 'urgent': return 'bg-red-600 text-white'
    case 'high': return 'bg-orange-500 text-white'
    case 'medium': return 'bg-yellow-500 text-white'
    case 'low': return 'bg-green-500 text-white'
    default: return 'bg-gray-500 text-white'
  }
}

export function getStatusColor(status) {
  switch (status) {
    case 'new': return 'bg-blue-100 text-blue-800'
    case 'triage': return 'bg-yellow-100 text-yellow-800'
    case 'assigned': return 'bg-purple-100 text-purple-800'
    case 'in_progress': return 'bg-orange-100 text-orange-800'
    case 'complete': return 'bg-green-100 text-green-800'
    case 'duplicate': return 'bg-gray-100 text-gray-800'
    case 'unable_to_contact': return 'bg-red-100 text-red-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}