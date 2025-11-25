"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

interface LongTextProps {
    text: string | null | undefined
    maxLength?: number
    className?: string
}

export function LongText({ text, maxLength = 50, className = "" }: LongTextProps) {
    if (!text) return <span className="text-muted-foreground">-</span>

    if (text.length <= maxLength) {
        return <span className={className}>{text}</span>
    }

    return (
        <div className={`flex items-center gap-1 ${className}`}>
            <span className="truncate max-w-[200px]">{text.slice(0, maxLength)}...</span>
            <Popover>
                <PopoverTrigger asChild>
                    <Button variant="link" className="h-auto p-0 text-xs font-medium text-blue-500 hover:text-blue-700">
                        More
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 max-h-[300px] overflow-y-auto whitespace-pre-wrap text-sm">
                    {text}
                </PopoverContent>
            </Popover>
        </div>
    )
}
