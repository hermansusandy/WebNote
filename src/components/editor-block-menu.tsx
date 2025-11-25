"use client"

import React, { useState, useEffect, useCallback } from 'react'
import { Editor } from '@tiptap/react'
import { Plus, GripVertical, AlignLeft, AlignCenter, AlignRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface EditorBlockMenuProps {
    editor: Editor
}

export const EditorBlockMenu = ({ editor }: EditorBlockMenuProps) => {
    const [menuPosition, setMenuPosition] = useState<number | null>(null)
    const [activeNode, setActiveNode] = useState<any>(null)

    const updateMenuPosition = useCallback(() => {
        if (!editor) return

        const { from } = editor.state.selection
        const domAtPos = editor.view.domAtPos(from).node
        const dom = domAtPos instanceof HTMLElement ? domAtPos : domAtPos.parentElement

        if (!dom) return

        // Find the closest block-level element
        const block = dom.closest('.tiptap > *')

        if (block) {
            const rect = (block as HTMLElement).getBoundingClientRect()
            const editorRect = editor.view.dom.getBoundingClientRect()

            // Calculate relative top position
            const top = rect.top - editorRect.top
            setMenuPosition(top)
        } else {
            setMenuPosition(null)
        }
    }, [editor])

    useEffect(() => {
        if (!editor) return

        const handleUpdate = () => {
            updateMenuPosition()
        }

        editor.on('selectionUpdate', handleUpdate)
        editor.on('update', handleUpdate)
        editor.on('focus', handleUpdate)
        editor.on('blur', handleUpdate)

        // Initial update
        updateMenuPosition()

        return () => {
            editor.off('selectionUpdate', handleUpdate)
            editor.off('update', handleUpdate)
            editor.off('focus', handleUpdate)
            editor.off('blur', handleUpdate)
        }
    }, [editor, updateMenuPosition])

    if (menuPosition === null) return null

    return (
        <div
            className="absolute left-[-3rem] flex items-center gap-1 transition-all duration-200 ease-in-out"
            style={{ top: `${menuPosition}px` }}
        >
            <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-muted-foreground hover:text-foreground"
                onClick={() => {
                    // Trigger slash command menu
                    editor.chain().focus().insertContent('/').run()
                }}
            >
                <Plus className="h-4 w-4" />
            </Button>

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-muted-foreground hover:text-foreground cursor-grab"
                    >
                        <GripVertical className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                    <DropdownMenuItem onClick={() => {
                        editor.chain().focus().deleteNode('paragraph').run()
                    }}>
                        Delete
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => {
                        // Duplicate logic would go here
                    }}>
                        Duplicate
                    </DropdownMenuItem>
                    <div className="h-px bg-border my-1" />
                    <DropdownMenuItem onClick={() => editor.chain().focus().setTextAlign('left').run()}>
                        <AlignLeft className="h-4 w-4 mr-2" />
                        Align Left
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => editor.chain().focus().setTextAlign('center').run()}>
                        <AlignCenter className="h-4 w-4 mr-2" />
                        Align Center
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => editor.chain().focus().setTextAlign('right').run()}>
                        <AlignRight className="h-4 w-4 mr-2" />
                        Align Right
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    )
}
