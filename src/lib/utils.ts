import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

export function formatTimestamp(timestamp: number): string {
  const now = Date.now()
  const diff = now - timestamp
  
  if (diff < 60000) return 'Just now'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
  if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`
  
  return new Date(timestamp).toLocaleDateString()
}

export function truncateText(text: string, maxLength: number = 100): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

export function extractTextFromHtml(html: string): string {
  const div = document.createElement('div')
  div.innerHTML = html
  return div.textContent || div.innerText || ''
}

export function detectContentType(content: string): 'script' | 'link' | 'text' {
  const codePatterns = [
    /^(function|const|let|var|class|import|export|if|for|while)/m,
    /^[\s]*[<>{}[\]]/m,
    /^[\s]*#![\/\w]+/,
    /^[\s]*\/\*|\*\/|\/\//m
  ]
  
  const urlPattern = /^https?:\/\/[^\s]+$/
  
  if (urlPattern.test(content.trim())) return 'link'
  if (codePatterns.some(pattern => pattern.test(content))) return 'script'
  return 'text'
}