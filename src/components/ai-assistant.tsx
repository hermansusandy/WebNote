"use client"

import { useChat } from '@ai-sdk/react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sparkles, X, Send, Bot, User, Check, ArrowUp } from "lucide-react"
import { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

export function AIAssistant() {
    const [isOpen, setIsOpen] = useState(false)
    const [inputValue, setInputValue] = useState('')
    const chatHelpers = useChat({
        maxSteps: 5,
        onError: (err) => {
            console.error("AI Chat Error:", err)
            toast.error("AI Error: " + err.message)
        }
    })

    // Cast to any to access available helpers since types seem mismatched
    const { messages, append, sendMessage, isLoading, error } = chatHelpers as any

    const handleLocalSubmit = async (e?: React.FormEvent) => {
        e?.preventDefault()
        if (!inputValue.trim()) return

        const msg = { role: 'user', content: inputValue }

        try {
            if (append) {
                await append(msg)
            } else if (sendMessage) {
                await sendMessage(msg)
            } else {
                toast.error("Chat is not ready (internal error).")
                return
            }
            setInputValue('')
        } catch (err) {
            console.error("Submit error:", err)
        }
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
                className="fixed bottom-4 right-4 h-12 w-12 rounded-full shadow-lg z-50 p-0 bg-background border hover:bg-muted"
            >
                <Sparkles className="h-6 w-6 text-foreground" />
            </Button>
        )
    }

    return (
        <div className="fixed bottom-4 right-4 w-[400px] h-[600px] bg-[#1F1F1F] text-white border border-[#333] rounded-xl shadow-2xl z-50 flex flex-col animate-in slide-in-from-bottom-5 fade-in duration-300 font-sans overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-[#333]">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-300">
                    <span>New AI chat</span>
                </div>
                <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-400 hover:text-white hover:bg-[#333]" onClick={() => setIsOpen(false)}>
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                <div className="space-y-6">
                    {messages?.length === 0 && (
                        <div className="mt-10 px-2">
                            <div className="mb-8">
                                <div className="h-16 w-16 bg-white rounded-full flex items-center justify-center mb-6 shadow-lg relative">
                                    <span className="text-3xl font-serif italic text-black">AI</span>
                                    <Sparkles className="absolute -top-1 -right-1 h-6 w-6 text-blue-400 fill-blue-400" />
                                </div>
                                <h2 className="text-2xl font-bold mb-1">What magic shall we</h2>
                                <h2 className="text-2xl font-bold">make happen?</h2>
                            </div>

                            <div className="space-y-2">
                                <button className="w-full flex items-center gap-3 p-2 hover:bg-[#333] rounded-md text-left transition-colors group" onClick={() => { setInputValue("Help me organize my notes"); }}>
                                    <div className="h-8 w-8 rounded-md bg-[#333] group-hover:bg-[#444] flex items-center justify-center text-yellow-400">
                                        <Sparkles className="h-4 w-4" />
                                    </div>
                                    <span className="text-sm font-medium text-gray-300 group-hover:text-white">Brainstorm ideas</span>
                                </button>
                                <button className="w-full flex items-center gap-3 p-2 hover:bg-[#333] rounded-md text-left transition-colors group" onClick={() => { setInputValue("Create a todo list for..."); }}>
                                    <div className="h-8 w-8 rounded-md bg-[#333] group-hover:bg-[#444] flex items-center justify-center text-blue-400">
                                        <Check className="h-4 w-4" />
                                    </div>
                                    <span className="text-sm font-medium text-gray-300 group-hover:text-white">Create a task tracker</span>
                                </button>
                                <button className="w-full flex items-center gap-3 p-2 hover:bg-[#333] rounded-md text-left transition-colors group" onClick={() => { setInputValue("Summarize this page"); }}>
                                    <div className="h-8 w-8 rounded-md bg-[#333] group-hover:bg-[#444] flex items-center justify-center text-purple-400">
                                        <Bot className="h-4 w-4" />
                                    </div>
                                    <span className="text-sm font-medium text-gray-300 group-hover:text-white">Analyze for insights</span>
                                </button>
                            </div>
                        </div>
                    )}

                    {messages?.map((m: any) => (
                        <div key={m.id} className="space-y-1">
                            <div className="flex items-center gap-2 mb-1">
                                {m.role === 'user' ? (
                                    <div className="h-5 w-5 rounded-full bg-blue-500 flex items-center justify-center text-[10px] font-bold text-white">U</div>
                                ) : (
                                    <div className="h-5 w-5 rounded-full bg-purple-500 flex items-center justify-center text-[10px] font-bold text-white">AI</div>
                                )}
                                <span className="text-xs font-medium text-gray-400">{m.role === 'user' ? 'You' : 'AI Assistant'}</span>
                            </div>
                            <div className={cn(
                                "text-sm leading-relaxed text-gray-200 pl-7",
                                m.role === 'user' ? "" : ""
                            )}>
                                {m.parts ? (
                                    m.parts.map((part: any, index: number) => {
                                        if (part.type === 'text') return <p key={index} className="whitespace-pre-wrap">{part.text}</p>
                                        if (part.type === 'tool-invocation') {
                                            const { toolName, toolCallId, state } = part.toolInvocation
                                            return (
                                                <div key={toolCallId} className="my-2 p-2 bg-[#333] rounded text-xs border border-[#444] text-gray-300">
                                                    {state === 'result' ? `✅ ${toolName} completed` : `⏳ ${toolName}...`}
                                                </div>
                                            )
                                        }
                                        return null
                                    })
                                ) : (
                                    m.content
                                )}
                            </div>
                        </div>
                    ))}

                    {isLoading && messages?.[messages.length - 1]?.role === 'user' && (
                        <div className="flex items-center gap-2 pl-7">
                            <div className="h-2 w-2 bg-gray-500 rounded-full animate-bounce" />
                            <div className="h-2 w-2 bg-gray-500 rounded-full animate-bounce delay-75" />
                            <div className="h-2 w-2 bg-gray-500 rounded-full animate-bounce delay-150" />
                        </div>
                    )}
                </div>
            </ScrollArea>

            <div className="p-4 bg-[#1F1F1F]">
                <div className="relative bg-[#2F2F2F] rounded-xl border border-[#444] focus-within:border-gray-500 transition-colors">
                    <form onSubmit={handleLocalSubmit}>
                        <Input
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder="Ask, search, or make anything..."
                            className="w-full bg-transparent border-none text-white placeholder:text-gray-500 focus-visible:ring-0 h-12 pr-10"
                        />
                        <div className="absolute right-2 top-2 bottom-2 flex items-center gap-1">
                            <Button
                                type="submit"
                                size="icon"
                                className={cn(
                                    "h-8 w-8 rounded-lg transition-all",
                                    inputValue.trim() ? "bg-blue-600 hover:bg-blue-500 text-white" : "bg-[#3F3F3F] text-gray-500 cursor-not-allowed"
                                )}
                                disabled={isLoading || !inputValue.trim()}
                            >
                                <ArrowUp className="h-4 w-4" />
                            </Button>
                        </div>
                    </form>
                </div>
                <div className="flex items-center justify-between mt-2 px-1">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Button variant="ghost" size="sm" className="h-6 px-2 text-gray-500 hover:text-gray-300 hover:bg-[#333] rounded-md">
                            <Sparkles className="h-3 w-3 mr-1.5" />
                            Auto
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
