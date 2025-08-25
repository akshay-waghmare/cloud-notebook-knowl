import { useState } from 'react'
import { Plus, Clipboard } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useNotebooks } from '@/hooks/useData'
import { useClipboard } from '@/hooks/useClipboard'
import { ContentCapture } from './ContentCapture'
import { toast } from 'sonner'

export function FloatingCaptureButton() {
  const { notebooks } = useNotebooks()
  const { clipboardData, readClipboard } = useClipboard()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedNotebookId, setSelectedNotebookId] = useState<string>('')
  
  const handleQuickCapture = async () => {
    if (notebooks.length === 0) {
      toast.error('Create a notebook first')
      return
    }
    
    if (notebooks.length === 1) {
      setSelectedNotebookId(notebooks[0].id)
      setIsDialogOpen(true)
      return
    }
    
    // If multiple notebooks, show selection first
    const data = await readClipboard()
    if (data) {
      setIsDialogOpen(true)
    } else {
      toast.error('No content found in clipboard')
    }
  }
  
  if (notebooks.length === 0) {
    return null
  }
  
  return (
    <div className="floating-capture">
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button 
            size="lg" 
            className="rounded-full h-14 w-14 shadow-lg hover:shadow-xl transition-all duration-200"
            onClick={handleQuickCapture}
          >
            {clipboardData ? <Clipboard size={24} /> : <Plus size={24} />}
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Quick Capture</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {notebooks.length > 1 && !selectedNotebookId && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Notebook</label>
                <Select value={selectedNotebookId} onValueChange={setSelectedNotebookId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a notebook..." />
                  </SelectTrigger>
                  <SelectContent>
                    {notebooks.map((notebook) => (
                      <SelectItem key={notebook.id} value={notebook.id}>
                        <div className="flex items-center gap-2">
                          <span>{notebook.icon}</span>
                          <span>{notebook.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            {(selectedNotebookId || notebooks.length === 1) && (
              <ContentCapture 
                notebookId={selectedNotebookId || notebooks[0].id}
                onSuccess={() => {
                  setIsDialogOpen(false)
                  setSelectedNotebookId('')
                }}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}