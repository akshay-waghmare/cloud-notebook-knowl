import { useState, useEffect } from 'react'
import { ClipboardData } from '@/lib/types'

export function useClipboard() {
  const [clipboardData, setClipboardData] = useState<ClipboardData | null>(null)
  
  const readClipboard = async (): Promise<ClipboardData | null> => {
    try {
      if (!navigator.clipboard) {
        throw new Error('Clipboard API not supported')
      }
      
      const items = await navigator.clipboard.read()
      let result: ClipboardData = { type: 'text' }
      
      for (const item of items) {
        // Try to read text
        if (item.types.includes('text/plain')) {
          try {
            const text = await (await item.getType('text/plain')).text()
            result.text = text
          } catch (e) {
            console.warn('Failed to read text from clipboard:', e)
          }
        }
        
        // Try to read HTML
        if (item.types.includes('text/html')) {
          try {
            const html = await (await item.getType('text/html')).text()
            result.html = html
          } catch (e) {
            console.warn('Failed to read HTML from clipboard:', e)
          }
        }
        
        // Try to read image
        const imageTypes = item.types.filter(type => type.startsWith('image/'))
        if (imageTypes.length > 0) {
          try {
            const blob = await item.getType(imageTypes[0])
            const reader = new FileReader()
            const imageDataUrl = await new Promise<string>((resolve, reject) => {
              reader.onload = () => resolve(reader.result as string)
              reader.onerror = reject
              reader.readAsDataURL(blob)
            })
            result.image = imageDataUrl
            result.type = result.text ? 'mixed' : 'image'
          } catch (e) {
            console.warn('Failed to read image from clipboard:', e)
          }
        }
      }
      
      return result
    } catch (error) {
      console.error('Failed to read clipboard:', error)
      // Fallback for older browsers or when clipboard API fails
      try {
        const text = await navigator.clipboard.readText()
        return { text, type: 'text' }
      } catch (fallbackError) {
        console.error('Fallback clipboard read also failed:', fallbackError)
        return null
      }
    }
  }
  
  const monitorClipboard = () => {
    let lastText = ''
    
    const checkClipboard = async () => {
      try {
        const text = await navigator.clipboard.readText()
        if (text !== lastText && text.length > 0) {
          lastText = text
          const data = await readClipboard()
          setClipboardData(data)
        }
      } catch (error) {
        // Silently fail for permission issues during monitoring
      }
    }
    
    const interval = setInterval(checkClipboard, 1000)
    return () => clearInterval(interval)
  }
  
  useEffect(() => {
    // Only start monitoring if user has interacted with the page
    const handleUserInteraction = () => {
      const cleanup = monitorClipboard()
      return cleanup
    }
    
    document.addEventListener('click', handleUserInteraction, { once: true })
    document.addEventListener('keydown', handleUserInteraction, { once: true })
    
    return () => {
      document.removeEventListener('click', handleUserInteraction)
      document.removeEventListener('keydown', handleUserInteraction)
    }
  }, [])
  
  return {
    clipboardData,
    readClipboard,
    clearClipboardData: () => setClipboardData(null)
  }
}