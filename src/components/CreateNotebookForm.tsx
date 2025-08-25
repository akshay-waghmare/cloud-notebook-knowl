import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useNotebooks } from '@/hooks/useData'

interface CreateNotebookFormProps {
  onSuccess: () => void
}

const NOTEBOOK_ICONS = ['📓', '📔', '📕', '📗', '📘', '📙', '🗂️', '📁', '💼', '🎯', '💡', '🔬', '🎨', '🛠️', '💻', '📊']

export function CreateNotebookForm({ onSuccess }: CreateNotebookFormProps) {
  const { createNotebook } = useNotebooks()
  const [name, setName] = useState('')
  const [selectedIcon, setSelectedIcon] = useState('📓')
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || isSubmitting) return
    
    setIsSubmitting(true)
    try {
      createNotebook(name.trim(), selectedIcon)
      setName('')
      setSelectedIcon('📓')
      onSuccess()
    } finally {
      setIsSubmitting(false)
    }
  }
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="notebook-name">Notebook Name</Label>
        <Input
          id="notebook-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter notebook name..."
          autoFocus
        />
      </div>
      
      <div className="space-y-3">
        <Label>Choose Icon</Label>
        <div className="grid grid-cols-8 gap-2">
          {NOTEBOOK_ICONS.map((icon) => (
            <button
              key={icon}
              type="button"
              onClick={() => setSelectedIcon(icon)}
              className={`
                p-3 rounded-lg border-2 text-xl hover:bg-muted transition-colors
                ${selectedIcon === icon ? 'border-primary bg-primary/10' : 'border-border'}
              `}
            >
              {icon}
            </button>
          ))}
        </div>
      </div>
      
      <div className="flex gap-3 pt-4">
        <Button type="submit" disabled={!name.trim() || isSubmitting} className="flex-1">
          {isSubmitting ? 'Creating...' : 'Create Notebook'}
        </Button>
      </div>
    </form>
  )
}