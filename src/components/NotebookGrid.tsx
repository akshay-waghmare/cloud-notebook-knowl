import { useState } from 'react'
import { BookOpen, Plus, Search, MessageCircle, Cloud } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { useNotebooks } from '@/hooks/useData'
import { formatTimestamp } from '@/lib/utils'
import type { Notebook } from '@/lib/types'
import { CreateNotebookForm } from './CreateNotebookForm'

interface NotebookGridProps {
  onSelectNotebook: (notebook: Notebook) => void
  onOpenChat: (notebook: Notebook) => void
}

export function NotebookGrid({ onSelectNotebook, onOpenChat }: NotebookGridProps) {
  const { notebooks } = useNotebooks()
  const [searchQuery, setSearchQuery] = useState('')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  
  const filteredNotebooks = notebooks.filter(notebook =>
    notebook.name.toLowerCase().includes(searchQuery.toLowerCase())
  )
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BookOpen size={32} className="text-primary" />
          <h1 className="text-3xl font-bold">CloudMind</h1>
        </div>
        <div className="flex items-center gap-2">
          <Cloud size={20} className="text-green-500" />
          <span className="text-sm text-muted-foreground">Synced</span>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search notebooks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus size={20} />
              New Notebook
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Notebook</DialogTitle>
            </DialogHeader>
            <CreateNotebookForm onSuccess={() => setIsCreateDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>
      
      {filteredNotebooks.length === 0 ? (
        <div className="text-center py-12">
          {notebooks.length === 0 ? (
            <div className="space-y-4">
              <BookOpen size={64} className="mx-auto text-muted-foreground" />
              <div>
                <h3 className="text-lg font-semibold">No notebooks yet</h3>
                <p className="text-muted-foreground">Create your first notebook to start building your knowledge base</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <Search size={64} className="mx-auto text-muted-foreground" />
              <div>
                <h3 className="text-lg font-semibold">No notebooks found</h3>
                <p className="text-muted-foreground">Try adjusting your search query</p>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredNotebooks.map((notebook) => (
            <Card 
              key={notebook.id} 
              className="cursor-pointer hover:shadow-lg transition-all duration-200 border-2 hover:border-primary/20"
              onClick={() => onSelectNotebook(notebook)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{notebook.icon}</div>
                    <div className="min-w-0 flex-1">
                      <CardTitle className="text-lg truncate">{notebook.name}</CardTitle>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      onOpenChat(notebook)
                    }}
                    className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <MessageCircle size={16} />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <Badge variant="secondary">
                      {notebook.itemCount} items
                    </Badge>
                    <span className="text-muted-foreground">
                      {formatTimestamp(notebook.updatedAt)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}