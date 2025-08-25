import { useKV } from '@github/spark/hooks'
import { Notebook, ContentItem, ChatMessage } from '@/lib/types'
import { generateId } from '@/lib/utils'

export function useNotebooks() {
  const [notebooks, setNotebooks] = useKV<Notebook[]>('notebooks', [])
  
  const createNotebook = (name: string, icon: string = '📓', color: string = 'blue') => {
    const newNotebook: Notebook = {
      id: generateId(),
      name,
      icon,
      color,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      itemCount: 0
    }
    
    setNotebooks(current => [...current, newNotebook])
    return newNotebook
  }
  
  const updateNotebook = (id: string, updates: Partial<Notebook>) => {
    setNotebooks(current => 
      current.map(notebook => 
        notebook.id === id 
          ? { ...notebook, ...updates, updatedAt: Date.now() }
          : notebook
      )
    )
  }
  
  const deleteNotebook = (id: string) => {
    setNotebooks(current => current.filter(notebook => notebook.id !== id))
  }
  
  const incrementItemCount = (notebookId: string) => {
    setNotebooks(current =>
      current.map(notebook =>
        notebook.id === notebookId
          ? { ...notebook, itemCount: notebook.itemCount + 1, updatedAt: Date.now() }
          : notebook
      )
    )
  }
  
  return {
    notebooks,
    createNotebook,
    updateNotebook,
    deleteNotebook,
    incrementItemCount
  }
}

export function useContent() {
  const [content, setContent] = useKV<ContentItem[]>('content', [])
  
  const addContent = (item: Omit<ContentItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newItem: ContentItem = {
      ...item,
      id: generateId(),
      createdAt: Date.now(),
      updatedAt: Date.now()
    }
    
    setContent(current => [newItem, ...current])
    return newItem
  }
  
  const updateContent = (id: string, updates: Partial<ContentItem>) => {
    setContent(current =>
      current.map(item =>
        item.id === id
          ? { ...item, ...updates, updatedAt: Date.now() }
          : item
      )
    )
  }
  
  const deleteContent = (id: string) => {
    setContent(current => current.filter(item => item.id !== id))
  }
  
  const getContentByNotebook = (notebookId: string) => {
    return content.filter(item => item.notebookId === notebookId)
  }
  
  return {
    content,
    addContent,
    updateContent,
    deleteContent,
    getContentByNotebook
  }
}

export function useChat() {
  const [messages, setMessages] = useKV<ChatMessage[]>('chat-messages', [])
  
  const addMessage = (message: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    const newMessage: ChatMessage = {
      ...message,
      id: generateId(),
      timestamp: Date.now()
    }
    
    setMessages(current => [...current, newMessage])
    return newMessage
  }
  
  const getMessagesByNotebook = (notebookId: string) => {
    return messages.filter(msg => msg.notebookId === notebookId)
  }
  
  const clearChatHistory = (notebookId: string) => {
    setMessages(current => current.filter(msg => msg.notebookId !== notebookId))
  }
  
  return {
    messages,
    addMessage,
    getMessagesByNotebook,
    clearChatHistory
  }
}