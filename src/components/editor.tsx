"use client"

import { useEditor, EditorContent, BubbleMenu } from '@tiptap/react'
import type { JSONContent } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import Image from '@tiptap/extension-image'
import { Table } from '@tiptap/extension-table'
import { TableRow } from '@tiptap/extension-table-row'
import { TableCell } from '@tiptap/extension-table-cell'
import { TableHeader } from '@tiptap/extension-table-header'
import TextAlign from '@tiptap/extension-text-align'
import { useEffect } from 'react'
import { Commands, getSuggestionItems, renderItems } from './slash-command'
import { EditorBlockMenu } from './editor-block-menu'
import { Bold, Italic, Strikethrough, Code, AlignLeft, AlignCenter, AlignRight } from 'lucide-react'
import { Toggle } from "@/components/ui/toggle"

interface EditorProps {
    content: JSONContent | null
    onChange: (content: JSONContent) => void
    editable?: boolean
}

export function Editor({ content, onChange, editable = true }: EditorProps) {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                bulletList: {
                    keepMarks: true,
                    keepAttributes: false,
                },
                orderedList: {
                    keepMarks: true,
                    keepAttributes: false,
                },
            }),
            Placeholder.configure({
                placeholder: 'Type "/" for commands...',
            }),
            TaskList,
            TaskItem.configure({
                nested: true,
            }),
            Image,
            Table.configure({
                resizable: true,
            }),
            TableRow,
            TableHeader,
            TableCell,
            TextAlign.configure({
                types: ['heading', 'paragraph', 'tableCell', 'tableHeader'],
            }),
            Commands.configure({
                suggestion: {
                    items: getSuggestionItems,
                    render: renderItems,
                },
            }),
        ],
        content: content,
        editable: editable,
        editorProps: {
            attributes: {
                class: 'prose dark:prose-invert max-w-none focus:outline-none min-h-[200px]',
            },
        },
        onUpdate: ({ editor }) => {
            onChange(editor.getJSON())
        },
        immediatelyRender: false,
    })

    // Update content if it changes externally (e.g. initial load)
    useEffect(() => {
        if (editor && content && !editor.isFocused) {
            if (editor.isEmpty && content) {
                editor.commands.setContent(content)
            }
        }
    }, [content, editor])

    if (!editor) {
        return null
    }

    return (
        <>
            {editor && (
                <BubbleMenu editor={editor} tippyOptions={{ duration: 100 }}>
                    <div className="flex items-center gap-1 p-1 rounded-md border bg-popover shadow-md">
                        <Toggle
                            size="sm"
                            pressed={editor.isActive('bold')}
                            onPressedChange={() => editor.chain().focus().toggleBold().run()}
                        >
                            <Bold className="h-4 w-4" />
                        </Toggle>
                        <Toggle
                            size="sm"
                            pressed={editor.isActive('italic')}
                            onPressedChange={() => editor.chain().focus().toggleItalic().run()}
                        >
                            <Italic className="h-4 w-4" />
                        </Toggle>
                        <Toggle
                            size="sm"
                            pressed={editor.isActive('strike')}
                            onPressedChange={() => editor.chain().focus().toggleStrike().run()}
                        >
                            <Strikethrough className="h-4 w-4" />
                        </Toggle>
                        <Toggle
                            size="sm"
                            pressed={editor.isActive('code')}
                            onPressedChange={() => editor.chain().focus().toggleCode().run()}
                        >
                            <Code className="h-4 w-4" />
                        </Toggle>
                        <div className="w-px h-4 bg-border mx-1" />
                        <Toggle
                            size="sm"
                            pressed={editor.isActive({ textAlign: 'left' })}
                            onPressedChange={() => editor.chain().focus().setTextAlign('left').run()}
                        >
                            <AlignLeft className="h-4 w-4" />
                        </Toggle>
                        <Toggle
                            size="sm"
                            pressed={editor.isActive({ textAlign: 'center' })}
                            onPressedChange={() => editor.chain().focus().setTextAlign('center').run()}
                        >
                            <AlignCenter className="h-4 w-4" />
                        </Toggle>
                        <Toggle
                            size="sm"
                            pressed={editor.isActive({ textAlign: 'right' })}
                            onPressedChange={() => editor.chain().focus().setTextAlign('right').run()}
                        >
                            <AlignRight className="h-4 w-4" />
                        </Toggle>
                    </div>
                </BubbleMenu>
            )}
            <div className="relative pl-8 md:pl-12">
                {editor && <EditorBlockMenu editor={editor} />}
                <EditorContent editor={editor} />
            </div>
        </>
    )
}
