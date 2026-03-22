import React, { useState, useEffect, useCallback } from 'react'
import 'tippy.js/dist/tippy.css'
import { Extension, Range } from '@tiptap/core'
import Suggestion, { SuggestionProps } from '@tiptap/suggestion'
import { ReactRenderer } from '@tiptap/react'
import tippy, { Instance } from 'tippy.js'
import {
    Heading1,
    Heading2,
    Heading3,
    List,
    ListOrdered,
    CheckSquare,
    Image as ImageIcon,
    Type,
    Code,
    Sparkles,
    Table
} from 'lucide-react'
import { Editor } from '@tiptap/core'

type IconComponent = React.ComponentType<{ className?: string }>

interface CommandItemProps {
    title: string
    icon: IconComponent
    section: string
    badge?: string
    command: (props: { editor: Editor; range: Range }) => void
}

interface CommandListProps {
    items: CommandItemProps[]
    command: (item: CommandItemProps) => void
    editor: Editor
    range: Range
}

const CommandList = ({ items, command }: CommandListProps) => {
    const [selectedIndex, setSelectedIndex] = useState(0)

    const selectItem = useCallback((index: number) => {
        const item = items[index]
        if (item) {
            command(item)
        }
    }, [command, items])

    useEffect(() => {
        const navigationKeys = ['ArrowUp', 'ArrowDown', 'Enter']
        const onKeyDown = (e: KeyboardEvent) => {
            if (navigationKeys.includes(e.key)) {
                e.preventDefault()
                if (e.key === 'ArrowUp') {
                    setSelectedIndex((selectedIndex + items.length - 1) % items.length)
                    return true
                }
                if (e.key === 'ArrowDown') {
                    setSelectedIndex((selectedIndex + 1) % items.length)
                    return true
                }
                if (e.key === 'Enter') {
                    selectItem(selectedIndex)
                    return true
                }
                return false
            }
        }
        document.addEventListener('keydown', onKeyDown)
        return () => document.removeEventListener('keydown', onKeyDown)
    }, [items, selectedIndex, selectItem])

    // Group items by section
    const groupedItems = items.reduce((acc, item) => {
        if (!acc[item.section]) {
            acc[item.section] = []
        }
        acc[item.section].push(item)
        return acc
    }, {} as Record<string, CommandItemProps[]>)

    const sections = Object.keys(groupedItems)
    let currentIndex = 0

    return (
        <div className="z-50 min-w-[18rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md animate-in fade-in-80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2">
            <div className="max-h-[300px] overflow-y-auto overflow-x-hidden p-1">
                {sections.map((section) => (
                    <div key={section} className="mb-2">
                        <div className="px-2 py-1 text-xs font-medium text-muted-foreground select-none">
                            {section}
                        </div>
                        {groupedItems[section].map((item) => {
                            const isSelected = currentIndex === selectedIndex
                            const index = currentIndex
                            currentIndex++

                            return (
                                <button
                                    key={index}
                                    className={`relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none w-full text-left gap-2 ${isSelected ? 'bg-accent text-accent-foreground' : ''
                                        }`}
                                    onClick={() => selectItem(index)}
                                >
                                    <div className="flex items-center justify-center w-5 h-5 border rounded bg-background shrink-0 text-muted-foreground">
                                        <item.icon className="h-3.5 w-3.5" />
                                    </div>
                                    <span className="flex-1 truncate">{item.title}</span>
                                    {item.badge && (
                                        <span className="px-1.5 py-0.5 text-[10px] font-medium bg-blue-500/10 text-blue-500 rounded border border-blue-200">
                                            {item.badge}
                                        </span>
                                    )}
                                </button>
                            )
                        })}
                    </div>
                ))}
            </div>
        </div>
    )
}

const renderItems = () => {
    let component: ReactRenderer | null = null
    let popup: Instance | null = null

    return {
        onStart: (props: SuggestionProps) => {
            component = new ReactRenderer(CommandList, {
                props,
                editor: props.editor,
            })

            if (!props.clientRect) {
                return
            }

            popup = tippy(document.body as Element, {
                getReferenceClientRect: () => props.clientRect?.() ?? new DOMRect(0, 0, 0, 0),
                appendTo: () => document.body,
                content: component.element,
                showOnCreate: true,
                interactive: true,
                trigger: 'manual',
                placement: 'bottom-start',
            })
        },
        onUpdate: (props: SuggestionProps) => {
            component?.updateProps(props)

            if (!props.clientRect) {
                return
            }

            popup?.setProps({ getReferenceClientRect: () => props.clientRect?.() ?? new DOMRect(0, 0, 0, 0) })
        },
        onKeyDown: (props: { event: KeyboardEvent }) => {
            if (props.event.key === 'Escape') {
                popup?.hide()
                return true
            }
            const ref = component?.ref as unknown as { onKeyDown?: (p: { event: KeyboardEvent }) => boolean } | null
            return ref?.onKeyDown?.(props) ?? false
        },
        onExit: () => {
            popup?.destroy()
            component?.destroy()
        },
    }
}

const Commands = Extension.create({
    name: 'slash-commands',

    addOptions() {
        return {
            suggestion: {
                char: '/',
                command: ({ editor, range, props }: { editor: Editor; range: Range; props: CommandItemProps }) => {
                    props.command({ editor, range })
                },
            },
        }
    },

    addProseMirrorPlugins() {
        return [
            Suggestion({
                editor: this.editor,
                ...this.options.suggestion,
            }),
        ]
    },
})

export const getSuggestionItems = ({ query }: { query: string }) => {
    return [
        {
            title: 'Ask AI',
            section: 'Suggested',
            icon: Sparkles,
            badge: 'Beta',
            command: async ({ editor, range }: { editor: Editor; range: Range }) => {
                const prompt = window.prompt('What would you like the AI to write?')
                if (!prompt) return

                // Delete the slash command
                editor.chain().focus().deleteRange(range).run()

                // Insert a placeholder or loading state if desired, 
                // but for now we'll just stream into the current position.

                try {
                    const response = await fetch('/api/generate', {
                        method: 'POST',
                        body: JSON.stringify({ prompt }),
                    })

                    if (!response.ok) throw new Error('Failed to generate text')
                    if (!response.body) return

                    const reader = response.body.getReader()
                    const decoder = new TextDecoder()
                    let done = false

                    while (!done) {
                        const { value, done: doneReading } = await reader.read()
                        done = doneReading
                        const chunkValue = decoder.decode(value)
                        editor.chain().focus().insertContent(chunkValue).run()
                    }
                } catch (error) {
                    console.error('AI generation error:', error)
                    window.alert('Failed to generate text. Please try again.')
                }
            },
        },
        {
            title: 'Meeting Notes',
            section: 'Suggested',
            icon: Sparkles,
            badge: 'Template',
            command: ({ editor, range }: { editor: Editor; range: Range }) => {
                editor.chain().focus().deleteRange(range).insertContent([
                    {
                        type: 'heading',
                        attrs: { level: 1 },
                        content: [{ type: 'text', text: 'Meeting Notes' }]
                    },
                    {
                        type: 'paragraph',
                        content: [{ type: 'text', text: 'Date: ' + new Date().toLocaleDateString() }]
                    },
                    {
                        type: 'heading',
                        attrs: { level: 2 },
                        content: [{ type: 'text', text: 'Attendees' }]
                    },
                    {
                        type: 'bulletList',
                        content: [
                            { type: 'listItem', content: [{ type: 'paragraph' }] }
                        ]
                    },
                    {
                        type: 'heading',
                        attrs: { level: 2 },
                        content: [{ type: 'text', text: 'Agenda' }]
                    },
                    {
                        type: 'bulletList',
                        content: [
                            { type: 'listItem', content: [{ type: 'paragraph' }] }
                        ]
                    },
                    {
                        type: 'heading',
                        attrs: { level: 2 },
                        content: [{ type: 'text', text: 'Action Items' }]
                    },
                    {
                        type: 'taskList',
                        content: [
                            { type: 'taskItem', attrs: { checked: false }, content: [{ type: 'paragraph' }] }
                        ]
                    }
                ]).run()
            },
        },
        {
            title: 'Text',
            section: 'Basic blocks',
            icon: Type,
            command: ({ editor, range }: { editor: Editor; range: Range }) => {
                editor.chain().focus().deleteRange(range).setNode('paragraph').run()
            },
        },
        {
            title: 'Heading 1',
            section: 'Basic blocks',
            icon: Heading1,
            command: ({ editor, range }: { editor: Editor; range: Range }) => {
                editor.chain().focus().deleteRange(range).setNode('heading', { level: 1 }).run()
            },
        },
        {
            title: 'Heading 2',
            section: 'Basic blocks',
            icon: Heading2,
            command: ({ editor, range }: { editor: Editor; range: Range }) => {
                editor.chain().focus().deleteRange(range).setNode('heading', { level: 2 }).run()
            },
        },
        {
            title: 'Heading 3',
            section: 'Basic blocks',
            icon: Heading3,
            command: ({ editor, range }: { editor: Editor; range: Range }) => {
                editor.chain().focus().deleteRange(range).setNode('heading', { level: 3 }).run()
            },
        },
        {
            title: 'To-do List',
            section: 'Basic blocks',
            icon: CheckSquare,
            command: ({ editor, range }: { editor: Editor; range: Range }) => {
                editor.chain().focus().deleteRange(range).toggleTaskList().run()
            },
        },
        {
            title: 'Bullet List',
            section: 'Basic blocks',
            icon: List,
            command: ({ editor, range }: { editor: Editor; range: Range }) => {
                editor.chain().focus().deleteRange(range).toggleBulletList().run()
            },
        },
        {
            title: 'Numbered List',
            section: 'Basic blocks',
            icon: ListOrdered,
            command: ({ editor, range }: { editor: Editor; range: Range }) => {
                editor.chain().focus().deleteRange(range).toggleOrderedList().run()
            },
        },
        {
            title: 'Image',
            section: 'Basic blocks',
            icon: ImageIcon,
            command: ({ editor, range }: { editor: Editor; range: Range }) => {
                const url = window.prompt('Enter image URL')
                if (url) {
                    editor.chain().focus().deleteRange(range).setImage({ src: url }).run()
                }
            },
        },
        {
            title: 'Table',
            section: 'Basic blocks',
            icon: Table,
            command: ({ editor, range }: { editor: Editor; range: Range }) => {
                editor.chain().focus().deleteRange(range).insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
            },
        },
        {
            title: 'Code Block',
            section: 'Basic blocks',
            icon: Code,
            command: ({ editor, range }: { editor: Editor; range: Range }) => {
                editor.chain().focus().deleteRange(range).toggleCodeBlock().run()
            },
        },
    ].filter((item) => item.title.toLowerCase().includes(query.toLowerCase()))
}

export { Commands, renderItems }
