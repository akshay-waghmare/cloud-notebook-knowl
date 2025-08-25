import { useState, useRef, useEffect } from 'react'
import { ArrowLeft, Send, Loader, MessageCircle, Trash2 } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useChat, useContent } from '@/hooks/useData'
import { formatTimestamp } from '@/lib/utils'
import type { Notebook } from '@/lib/types'
import { toast } from 'sonner'

interface ChatViewProps {
  notebook: Notebook
  onBack: () => void
}

export function ChatView({ notebook, onBack }: ChatViewProps) {
  const { getMessagesByNotebook, addMessage, clearChatHistory } = useChat()
  const { getContentByNotebook } = useContent()
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  const messages = getMessagesByNotebook(notebook.id)
  const content = getContentByNotebook(notebook.id)
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }
  
  useEffect(() => {
    scrollToBottom()
  }, [messages])
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return
    
    const userMessage = input.trim()
    setInput('')
    setIsLoading(true)
    
    try {
      // Add user message
      addMessage({
        notebookId: notebook.id,
        role: 'user',
        content: userMessage
      })
      
      // Prepare context from notebook content
      const contextText = content.map(item => 
        `Title: ${item.title}\nType: ${item.type}\nContent: ${item.content}\n---`
      ).join('\n')
      
      // Create AI prompt
      const prompt = spark.llmPrompt`You are an AI assistant helping with a knowledge base called "${notebook.name}". 

The user has the following content in this notebook:
${contextText}

User question: ${userMessage}

Please provide a helpful response based on the content in this notebook. If the question relates to specific content, reference it. If there's no relevant content, suggest ways the user could add relevant information to help answer their question.`
      
      // Get AI response
      const aiResponse = await spark.llm(prompt)
      
      // Add AI response
      addMessage({
        notebookId: notebook.id,
        role: 'assistant',
        content: aiResponse
      })
    } catch (error) {
      console.error('Failed to get AI response:', error)
      toast.error('Failed to get AI response. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleClearChat = () => {
    clearChatHistory(notebook.id)
    toast.success('Chat history cleared')
  }
  
  return (
    <div className="flex flex-col h-[80vh] max-h-[600px]">
      <div className="flex items-center justify-between p-6 border-b">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onBack} className="gap-2">
            <ArrowLeft size={16} />
            Back
          </Button>
          <div className="flex items-center gap-3">
            <div className="text-xl">{notebook.icon}</div>
            <div>
              <h2 className="text-xl font-semibold">Chat with {notebook.name}</h2>
              <p className="text-sm text-muted-foreground">
                {content.length} items available for context
              </p>
            </div>
          </div>
        </div>
        
        {messages.length > 0 && (
          <Button variant="outline" size="sm" onClick={handleClearChat} className="gap-2">
            <Trash2 size={14} />
            Clear History
          </Button>
        )}
      </div>
      
      <ScrollArea className="flex-1 p-6">
        <div className="space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-8">
              <MessageCircle size={48} className="mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Start a conversation</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Ask questions about your content in {notebook.name}. I can help you find information, 
                summarize content, or discover connections.
              </p>
            </div>
          )}
          
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <Card className={`max-w-[80%] ${
                message.role === 'user' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted'
              }`}>
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {message.content}
                    </p>
                    <p className={`text-xs ${
                      message.role === 'user' 
                        ? 'text-primary-foreground/70' 
                        : 'text-muted-foreground'
                    }`}>
                      {formatTimestamp(message.timestamp)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <Card className="bg-muted">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Loader size={16} className="animate-spin" />
                    <span className="text-sm">Thinking...</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>
      
      <form onSubmit={handleSubmit} className="p-6 border-t">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question about your content..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button type="submit" disabled={!input.trim() || isLoading} size="icon">
            <Send size={16} />
          </Button>
        </div>
      </form>
    </div>
  )
}