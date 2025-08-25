import { useState } from 'react'
import { Toaster } from 'sonner'
import { NotebookGrid } from '@/components/NotebookGrid'
import { NotebookView } from '@/components/NotebookView'
import { ChatView } from '@/components/ChatView'
import { FloatingCaptureButton } from '@/components/FloatingCaptureButton'
import type { Notebook } from '@/lib/types'

type ViewMode = 'grid' | 'notebook' | 'chat'

function App() {
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [selectedNotebook, setSelectedNotebook] = useState<Notebook | null>(null)
  
  const handleSelectNotebook = (notebook: Notebook) => {
    setSelectedNotebook(notebook)
    setViewMode('notebook')
  }
  
  const handleOpenChat = (notebook: Notebook) => {
    setSelectedNotebook(notebook)
    setViewMode('chat')
  }
  
  const handleBackToGrid = () => {
    setViewMode('grid')
    setSelectedNotebook(null)
  }
  
  const handleBackToNotebook = () => {
    setViewMode('notebook')
  }
  
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {viewMode === 'grid' && (
          <NotebookGrid 
            onSelectNotebook={handleSelectNotebook}
            onOpenChat={handleOpenChat}
          />
        )}
        
        {viewMode === 'notebook' && selectedNotebook && (
          <NotebookView 
            notebook={selectedNotebook}
            onBack={handleBackToGrid}
            onOpenChat={() => handleOpenChat(selectedNotebook)}
          />
        )}
        
        {viewMode === 'chat' && selectedNotebook && (
          <ChatView 
            notebook={selectedNotebook}
            onBack={viewMode === 'notebook' ? handleBackToNotebook : handleBackToGrid}
          />
        )}
      </div>
      
      <FloatingCaptureButton />
      <Toaster position="top-right" />
    </div>
  )
}

export default App