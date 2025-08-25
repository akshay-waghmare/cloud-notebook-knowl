import { useState } from 'react'
import { ArrowLeft, MessageCircle, Plus, Search, FileText, Code, Link, Image } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useContent } from '@/hooks/useData'
import { formatTimestamp, truncateText } from '@/lib/utils'
import type { Notebook, ContentItem } from '@/lib/types'
import { ContentCapture } from './ContentCapture'

interface NotebookViewProps {
  notebook: Notebook
  onBack: () => void
  onOpenChat: () => void
}

export function NotebookView({ notebook, onBack, onOpenChat }: NotebookViewProps) {
  const { getContentByNotebook } = useContent()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [isCaptureDialogOpen, setIsCaptureDialogOpen] = useState(false)
  
  const content = getContentByNotebook(notebook.id)
  const filteredContent = content.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.content.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = selectedType === 'all' || item.type === selectedType
    return matchesSearch && matchesType
  })
  
  const typeIcons = {
    text: FileText,
    script: Code,
    link: Link,
    image: Image
  }
  
  const typeCounts = content.reduce((acc, item) => {
    acc[item.type] = (acc[item.type] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onBack} className="gap-2">
            <ArrowLeft size={16} />
            Back
          </Button>
          <div className="flex items-center gap-3">
            <div className="text-2xl">{notebook.icon}</div>
            <div>
              <h1 className="text-2xl font-bold">{notebook.name}</h1>
              <p className="text-muted-foreground">
                {content.length} items • Updated {formatTimestamp(notebook.updatedAt)}
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onOpenChat} className="gap-2">
            <MessageCircle size={16} />
            Chat
          </Button>
          
          <Dialog open={isCaptureDialogOpen} onOpenChange={setIsCaptureDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2">
                <Plus size={16} />
                Add Content
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add Content to {notebook.name}</DialogTitle>
              </DialogHeader>
              <ContentCapture 
                notebookId={notebook.id} 
                onSuccess={() => setIsCaptureDialogOpen(false)} 
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      <div className="flex items-center gap-4 flex-wrap">
        <div className="relative flex-1 min-w-64">
          <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search content..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant={selectedType === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedType('all')}
          >
            All ({content.length})
          </Button>
          {Object.entries(typeCounts).map(([type, count]) => {
            const Icon = typeIcons[type as keyof typeof typeIcons]
            return (
              <Button
                key={type}
                variant={selectedType === type ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedType(type)}
                className="gap-1"
              >
                <Icon size={14} />
                {count}
              </Button>
            )
          })}
        </div>
      </div>
      
      {filteredContent.length === 0 ? (
        <div className="text-center py-12">
          {content.length === 0 ? (
            <div className="space-y-4">
              <Plus size={64} className="mx-auto text-muted-foreground" />
              <div>
                <h3 className="text-lg font-semibold">No content yet</h3>
                <p className="text-muted-foreground">Start adding content to build your knowledge base</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <Search size={64} className="mx-auto text-muted-foreground" />
              <div>
                <h3 className="text-lg font-semibold">No content found</h3>
                <p className="text-muted-foreground">Try adjusting your search or filters</p>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredContent.map((item) => (
            <ContentCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  )
}

function ContentCard({ item }: { item: ContentItem }) {
  const Icon = {
    text: FileText,
    script: Code,
    link: Link,
    image: Image
  }[item.type]
  
  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <Icon size={20} className="text-muted-foreground mt-1 flex-shrink-0" />
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-base leading-tight">{item.title}</h3>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="secondary" className="text-xs">
                {item.type}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {formatTimestamp(item.createdAt)}
              </span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {item.type === 'image' && item.content.startsWith('data:') ? (
          <img 
            src={item.content} 
            alt={item.title}
            className="w-full h-32 object-cover rounded-md mb-3"
          />
        ) : (
          <p className={`text-sm text-muted-foreground leading-relaxed ${
            item.type === 'script' ? 'font-mono bg-muted p-3 rounded-md' : ''
          }`}>
            {truncateText(item.content, 150)}
          </p>
        )}
        
        {item.metadata?.tags && item.metadata.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {item.metadata.tags.map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}