"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Search, Trash, Filter, X, Pencil, Check, ExternalLink } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

import { toast } from "sonner"

export default function ToolsPage() {
    const [items, setItems] = useState<any[]>([])
    const [categories, setCategories] = useState<string[]>([]) // Simple string categories for now or reuse learning_categories? User asked for "Category". Let's use a simple text field or distinct values for now to simplify, or maybe reuse learning_categories?
    // Actually, "Category" field usually implies a tag or a select.
    // Let's use a simple text input for category for flexibility, or a select if we want to enforce.
    // Given the previous pattern, let's use a simple text field for "Category" to keep it simple as requested "field only Name, Url, Category, Action".
    // Or better, let's make it a text input that suggests existing categories.
    // For MVP, let's just use a text input for Category.

    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState("")
    const [editingId, setEditingId] = useState<string | null>(null)

    // Selection & Filters
    const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
    const [categoryFilter, setCategoryFilter] = useState<string>("All")

    useEffect(() => {
        fetchItems()
    }, [])

    const fetchItems = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data } = await supabase
            .from('web_urls')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })

        if (data) {
            setItems(data)
            // Extract unique categories
            const uniqueCategories = Array.from(new Set(data.map(item => item.category).filter(Boolean))) as string[]
            setCategories(uniqueCategories)
        }
        setLoading(false)
    }

    const handleCreate = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data } = await supabase.from('web_urls').insert({
            user_id: user.id,
            name: 'New Web URL',
            url: 'https://example.com',
            category: 'General'
        }).select().single()

        if (data) {
            setItems([data, ...items])
            setEditingId(data.id) // Auto-enter edit mode
            toast.success("URL created successfully")
        }
    }

    const handleUpdate = async (id: string, updates: any) => {
        // Optimistic update
        setItems(items.map(item => {
            if (item.id === id) {
                return { ...item, ...updates }
            }
            return item
        }))

        await supabase.from('web_urls').update(updates).eq('id', id)
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this item?')) return
        setItems(items.filter(item => item.id !== id))
        setSelectedItems(prev => {
            const next = new Set(prev)
            next.delete(id)
            return next
        })
        await supabase.from('web_urls').delete().eq('id', id)
        toast.success("URL deleted successfully")
    }

    const toggleSelection = (id: string) => {
        setSelectedItems(prev => {
            const next = new Set(prev)
            if (next.has(id)) next.delete(id)
            else next.add(id)
            return next
        })
    }

    const toggleSelectAll = () => {
        if (selectedItems.size === filteredItems.length) {
            setSelectedItems(new Set())
        } else {
            setSelectedItems(new Set(filteredItems.map(item => item.id)))
        }
    }

    const filteredItems = items.filter(item => {
        return item.name.toLowerCase().includes(search.toLowerCase()) ||
            (item.category || '').toLowerCase().includes(search.toLowerCase()) ||
            item.url.toLowerCase().includes(search.toLowerCase())
    }).filter(item => {
        const matchesCategory = categoryFilter === "All" || item.category === categoryFilter
        return matchesCategory
    })

    return (
        <div className="space-y-8 pb-20 p-8">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Web URL Tools</h1>
                <Button onClick={handleCreate}>
                    <Plus className="mr-2 h-4 w-4" />
                    New URL
                </Button>
            </div>

            <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search URLs..."
                            className="pl-8"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                        <SelectTrigger className="w-[150px]">
                            <div className="flex items-center gap-2">
                                <Filter className="h-3.5 w-3.5 text-muted-foreground" />
                                <SelectValue placeholder="Category" />
                            </div>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="All">All Categories</SelectItem>
                            {categories.map(cat => (
                                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {(categoryFilter !== "All") && (
                        <Button variant="ghost" size="icon" onClick={() => setCategoryFilter("All")}>
                            <X className="h-4 w-4" />
                        </Button>
                    )}
                </div>

                {selectedItems.size > 0 && (
                    <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-md animate-in fade-in slide-in-from-top-2">
                        <span className="text-sm font-medium px-2">{selectedItems.size} selected</span>
                        <div className="flex-1" />
                        <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={() => setSelectedItems(new Set())}>Cancel</Button>
                    </div>
                )}
            </div>

            <div className="space-y-4">
                <div className="flex items-center gap-4 px-4 py-2 text-sm font-medium text-muted-foreground border-b">
                    <Checkbox
                        checked={filteredItems.length > 0 && selectedItems.size === filteredItems.length}
                        onCheckedChange={toggleSelectAll}
                    />
                    <div className="w-[25%]">Name</div>
                    <div className="flex-1">URL</div>
                    <div className="w-[150px]">Category</div>
                    <div className="w-20">Actions</div>
                </div>

                {filteredItems.length === 0 ? (
                    <div className="p-8 text-center text-sm text-muted-foreground border rounded-md border-dashed">
                        No URLs found.
                    </div>
                ) : (
                    filteredItems.map(item => {
                        const isEditing = editingId === item.id

                        return (
                            <div key={item.id} className={`flex items-center gap-4 p-4 border rounded-lg bg-card transition-colors group ${selectedItems.has(item.id) ? 'bg-accent/50 border-primary/50' : 'hover:bg-accent/50'}`}>
                                <Checkbox
                                    checked={selectedItems.has(item.id)}
                                    onCheckedChange={() => toggleSelection(item.id)}
                                />
                                <div className="w-[25%]">
                                    {isEditing ? (
                                        <Input
                                            value={item.name}
                                            onChange={(e) => handleUpdate(item.id, { name: e.target.value })}
                                            className="font-semibold"
                                        />
                                    ) : (
                                        <div className="font-semibold truncate">{item.name}</div>
                                    )}
                                </div>

                                <div className="flex-1 flex items-center gap-2">
                                    {isEditing ? (
                                        <Input
                                            value={item.url}
                                            onChange={(e) => handleUpdate(item.id, { url: e.target.value })}
                                            className="text-sm font-mono"
                                        />
                                    ) : (
                                        <>
                                            <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-500 hover:underline truncate flex-1 block">
                                                {item.url}
                                            </a>
                                            <ExternalLink className="h-3 w-3 text-muted-foreground shrink-0" />
                                        </>
                                    )}
                                </div>

                                <div className="w-[150px]">
                                    {isEditing ? (
                                        <Input
                                            value={item.category || ''}
                                            onChange={(e) => handleUpdate(item.id, { category: e.target.value })}
                                            placeholder="Category"
                                            className="text-sm"
                                        />
                                    ) : (
                                        <Badge variant="secondary" className="font-normal">
                                            {item.category || "General"}
                                        </Badge>
                                    )}
                                </div>

                                <div className="w-20 flex items-center gap-1">
                                    {isEditing ? (
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50" onClick={() => setEditingId(null)}>
                                            <Check className="h-4 w-4" />
                                        </Button>
                                    ) : (
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => setEditingId(item.id)}>
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                    )}
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => handleDelete(item.id)}>
                                        <Trash className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        )
                    })
                )}
            </div>
        </div>
    )
}
