import { useState, useEffect } from 'react'
import { Clipboard, Image, FileText, Code, Link, Plus } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useContent, useNotebooks } from '@/hooks/useData'
import { useClipboard } from '@/hooks/useClipboard'
import { detectContentType, extractTextFromHtml } from '@/lib/utils'
import { toast } from 'sonner'

interface ContentCaptureProps {
  notebookId: string
  onSuccess: () => void
}

export function ContentCapture({ notebookId, onSuccess }: ContentCaptureProps) {
  const { addContent } = useContent()
  const { incrementItemCount } = useNotebooks()
  const { clipboardData, readClipboard, clearClipboardData } = useClipboard()
  
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [tags, setTags] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [detectedType, setDetectedType] = useState<'text' | 'script' | 'link' | 'image'>('text')
  
  useEffect(() => {
    if (clipboardData) {
      if (clipboardData.type === 'image' && clipboardData.image) {
        setContent(clipboardData.image)
        setTitle('Captured Image')
        setDetectedType('image')
      } else if (clipboardData.text) {
        const text = clipboardData.html ? extractTextFromHtml(clipboardData.html) : clipboardData.text
        setContent(text)
        setTitle(text.split('\n')[0].substring(0, 100) || 'Captured Content')
        setDetectedType(detectContentType(text))
      }
    }
  }, [clipboardData])
  
  const handlePasteFromClipboard = async () => {
    const data = await readClipboard()
    if (data) {
      if (data.type === 'image' && data.image) {
        setContent(data.image)
        setTitle('Captured Image')
        setDetectedType('image')
      } else if (data.text) {
        const text = data.html ? extractTextFromHtml(data.html) : data.text
        setContent(text)
        setTitle(text.split('\n')[0].substring(0, 100) || 'Captured Content')
        setDetectedType(detectContentType(text))
      }
      toast.success('Content pasted from clipboard')
    } else {
      toast.error('Failed to read clipboard')
    }
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !content.trim() || isSubmitting) return
    
    setIsSubmitting(true)
    try {
      const tagList = tags.split(',').map(tag => tag.trim()).filter(Boolean)
      
      addContent({
        notebookId,
        type: detectedType,
        title: title.trim(),
        content: content.trim(),
        metadata: {
          tags: tagList.length > 0 ? tagList : undefined,
          source: 'manual_capture'
        }
      })
      
      incrementItemCount(notebookId)
      
      setTitle('')
      setContent('')
      setTags('')
      setDetectedType('text')
      clearClipboardData()
      
      toast.success('Content added successfully')
      onSuccess()
    } finally {
      setIsSubmitting(false)
    }
  }
  
  const typeIcons = {
    text: FileText,
    script: Code,
    link: Link,
    image: Image
  }
  
  const TypeIcon = typeIcons[detectedType]
  
  return (
    <div className="space-y-6">
      {clipboardData && (
        <Card className="border-accent/20 bg-accent/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Clipboard size={16} />
              Clipboard Content Detected
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              {clipboardData.type === 'image' ? 'Image detected in clipboard' : 
               `Text content detected: "${clipboardData.text?.substring(0, 100)}..."`}
            </p>
            <Button size="sm" onClick={handlePasteFromClipboard} className="gap-2">
              <Clipboard size={14} />
              Use Clipboard Content
            </Button>
          </CardContent>
        </Card>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="content-title">Title</Label>
          <Input
            id="content-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter a title for this content..."
            autoFocus
          />
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="content-body">Content</Label>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="gap-1">
                <TypeIcon size={12} />
                {detectedType}
              </Badge>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handlePasteFromClipboard}
                className="gap-1 text-xs"
              >
                <Clipboard size={12} />
                Paste
              </Button>
            </div>
          </div>
          
          {detectedType === 'image' && content.startsWith('data:') ? (
            <div className="space-y-3">
              <img 
                src={content} 
                alt="Captured content"
                className="w-full max-h-64 object-contain rounded-md border"
              />
              <Input
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Image data URL..."
                className="font-mono text-xs"
              />
            </div>
          ) : (
            <Textarea
              id="content-body"
              value={content}
              onChange={(e) => {
                setContent(e.target.value)
                setDetectedType(detectContentType(e.target.value))
              }}
              placeholder="Paste or type your content here..."
              className={`min-h-32 ${detectedType === 'script' ? 'font-mono' : ''}`}
            />
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="content-tags">Tags (optional)</Label>
          <Input
            id="content-tags"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="Enter tags separated by commas..."
          />
          <p className="text-xs text-muted-foreground">
            Tags help organize and find your content later
          </p>
        </div>
        
        <div className="flex gap-3 pt-4">
          <Button 
            type="submit" 
            disabled={!title.trim() || !content.trim() || isSubmitting}
            className="flex-1 gap-2"
          >
            <Plus size={16} />
            {isSubmitting ? 'Adding...' : 'Add Content'}
          </Button>
        </div>
      </form>
    </div>
  )
}