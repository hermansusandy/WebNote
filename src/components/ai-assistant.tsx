"use client"

import { useChat } from '@ai-sdk/react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sparkles, X, Send, Bot, User } from "lucide-react"
import { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"

export function AIAssistant() {
    const [isOpen, setIsOpen] = useState(false)
    const [inputValue, setInputValue] = useState('')
    const { messages, sendMessage, isLoading } = useChat()

    const handleLocalSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!inputValue.trim()) return

        sendMessage({ text: inputValue })
        setInputValue('')
    }

    const scrollRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [messages])

    if (!isOpen) {
        return (
            <Button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-4 right-4 h-12 w-12 rounded-full shadow-lg z-50 p-0"
            >
                <Sparkles className="h-6 w-6" />
            </Button>
        )
    }


    return (
        <div className="fixed bottom-4 right-4 w-[350px] h-[500px] bg-background border rounded-lg shadow-xl z-50 flex flex-col animate-in slide-in-from-bottom-5 fade-in duration-300">
            <div className="flex items-center justify-between p-3 border-b bg-muted/50 rounded-t-lg">
                <div className="flex items-center gap-2 font-semibold">
                    <Sparkles className="h-4 w-4 text-primary" />
                    AI Assistant
                </div>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setIsOpen(false)}>
                    <X className="h-4 w-4" />
                </Button>
            </div>

            <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                <div className="space-y-4">
                    {messages?.length === 0 && (
                        <div className="text-center text-muted-foreground text-sm py-8">
                            <Bot className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p>Hi! I can help you create pages or answer questions.</p>
                        </div>
                    )}
                    {messages?.map((m: any) => (
                        <div
                            key={m.id}
                            className={cn(
                                "flex gap-2 text-sm",
                                m.role === 'user' ? "flex-row-reverse" : "flex-row"
                            )}
                        >
                            <div className={cn(
                                "h-8 w-8 rounded-full flex items-center justify-center shrink-0",
                                m.role === 'user' ? "bg-primary text-primary-foreground" : "bg-muted"
                            )}>
                                {m.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                            </div>
                            <div className={cn(
                                "rounded-lg px-3 py-2 max-w-[80%]",
                                m.role === 'user'
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-muted text-foreground"
                            )}>
                                {m.parts ? (
                                    m.parts.map((part: any, index: number) => {
                                        if (part.type === 'text') {
                                            return <p key={index}>{part.text}</p>
                                        }
                                        if (part.type === 'tool-invocation') {
                                            const toolInvocation = part.toolInvocation
                                            const { toolName, toolCallId, state } = toolInvocation

                                            if (state === 'result') {
                                                return (
                                                    <div key={toolCallId} className="mt-2 p-2 bg-background/50 rounded text-xs border">
                                                        {toolName === 'createPage' ? '✅ Page created' : '✅ Action completed'}
                                                    </div>
                                                )
                                            }
                                            return (
                                                <div key={toolCallId} className="mt-2 p-2 bg-background/50 rounded text-xs border animate-pulse">
                                                    {toolName === 'createPage' ? 'Creating page...' : 'Working...'}
                                                </div>
                                            )
                                        }
                                        return null
                                    })
                                ) : (
                                    // Fallback if parts is missing (e.g. legacy or optimistic update issue)
                                    // But wait, optimistic update via sendMessage({ text }) should create parts.
                                    // Let's assume parts exists.
                                    m.content
                                )}
                            </div>
                        </div>
                    ))}
                    {isLoading && messages?.[messages.length - 1]?.role === 'user' && (
                        <div className="flex gap-2 text-sm">
                            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                                <Bot className="h-4 w-4" />
                            </div>
                            <div className="bg-muted text-foreground rounded-lg px-3 py-2">
                                <span className="animate-pulse">...</span>
                            </div>
                        </div>
                    )}
                </div>
            </ScrollArea>

            <form onSubmit={handleLocalSubmit} className="p-3 border-t bg-background rounded-b-lg">
                <div className="flex gap-2">
                    <Input
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Ask me anything..."
                        className="flex-1"
                    />
                    <Button type="submit" size="icon" disabled={isLoading || !inputValue.trim()}>
                        <Send className="h-4 w-4" />
                    </Button>
                </div>
            </form>
        </div>
    )
}
