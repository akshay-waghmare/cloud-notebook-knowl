export interface Notebook {
  id: string
  name: string
  icon: string
  color: string
  createdAt: number
  updatedAt: number
  itemCount: number
}

export interface ContentItem {
  id: string
  notebookId: string
  type: 'text' | 'image' | 'script' | 'link'
  title: string
  content: string
  metadata?: {
    url?: string
    language?: string
    tags?: string[]
    source?: string
  }
  createdAt: number
  updatedAt: number
}

export interface ChatMessage {
  id: string
  notebookId: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}

export interface ClipboardData {
  text?: string
  html?: string
  image?: string
  type: 'text' | 'image' | 'mixed'
}