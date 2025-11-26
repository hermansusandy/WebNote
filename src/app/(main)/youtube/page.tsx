"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Search, Trash, ExternalLink, Pencil, Check, X, Filter, ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react"
import { CategoryManager } from "@/components/category-manager"
import { Checkbox } from "@/components/ui/checkbox"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

import { toast } from "sonner"

export default function YoutubePage() {
    const [items, setItems] = useState<any[]>([])
    const [categories, setCategories] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState("")
    const [editingId, setEditingId] = useState<string | null>(null)

    // Selection & Filters
    const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
    const [categoryFilter, setCategoryFilter] = useState<string>("All")
    const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' } | null>(null)

    useEffect(() => {
        fetchItems()
        fetchCategories()
    }, [])

    const fetchCategories = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data } = await supabase
            .from('youtube_categories')
            .select('*')
            .eq('user_id', user.id)
            .order('name')

        if (data) setCategories(data)
    }

    const fetchItems = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data } = await supabase
            .from('youtube_items')
            .select(`
                *,
                category:youtube_categories(id, name, color)
            `)
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })

        if (data) setItems(data)
        setLoading(false)
    }

    const handleCreate = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        // Get default category if exists
        let categoryId = categories.length > 0 ? categories[0].id : null

        // If no categories exist, create a default "General" one
        if (!categoryId) {
            const { data: newCategory } = await supabase
                .from('youtube_categories')
                .insert({ user_id: user.id, name: 'General' })
                .select()
                .single()

            if (newCategory) {
                setCategories([newCategory])
                categoryId = newCategory.id
            } else {
                console.error("Failed to create default category")
                return
            }
        }

        const { data } = await supabase.from('youtube_items').insert({
            user_id: user.id,
            category_id: categoryId,
            name: 'New Youtube Video',
            url: '',
            note: ''
        }).select(`
            *,
            category:youtube_categories(id, name, color)
        `).single()

        if (data) {
            setItems([data, ...items])
            setEditingId(data.id) // Auto-enter edit mode for new item
            toast.success("Video added successfully")
        }
    }

    const handleUpdate = async (id: string, updates: any) => {
        // Optimistic update
        setItems(prevItems => prevItems.map(item => {
            if (item.id === id) {
                if (updates.category_id) {
                    const cat = categories.find(c => c.id === updates.category_id)
                    return { ...item, ...updates, category: cat }
                }
                return { ...item, ...updates }
            }
            return item
        }))

        await supabase.from('youtube_items').update(updates).eq('id', id)
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this item?')) return
        setItems(items.filter(item => item.id !== id))
        setSelectedItems(prev => {
            const next = new Set(prev)
            next.delete(id)
            return next
        })
        await supabase.from('youtube_items').delete().eq('id', id)
        toast.success("Video deleted successfully")
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
        if (selectedItems.size === sortedItems.length) {
            setSelectedItems(new Set())
        } else {
            setSelectedItems(new Set(sortedItems.map(item => item.id)))
        }
    }

    const handleBulkDelete = async () => {
        if (!confirm(`Delete ${selectedItems.size} items?`)) return
        const ids = Array.from(selectedItems)
        setItems(items.filter(item => !ids.includes(item.id)))
        setSelectedItems(new Set())
        await supabase.from('youtube_items').delete().in('id', ids)
        toast.success("Selected videos deleted successfully")
    }

    const handleSort = (key: string) => {
        setSortConfig(current => {
            if (current?.key === key) {
                return { key, direction: current.direction === 'asc' ? 'desc' : 'asc' }
            }
            return { key, direction: 'asc' }
        })
    }

    const filteredItems = items.filter(item => {
        const categoryName = item.category?.name || ''
        return item.name.toLowerCase().includes(search.toLowerCase()) ||
            categoryName.toLowerCase().includes(search.toLowerCase())
    }).filter(item => {
        const matchesCategory = categoryFilter === "All" || (item.category_id === categoryFilter) || (categoryFilter === "Uncategorized" && !item.category_id)
        return matchesCategory
    })

    // Assign display index based on creation time (Oldest = 1)
    const itemsWithIndex = [...filteredItems].sort((a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    ).map((item, index) => ({ ...item, displayIndex: index + 1 }))

    const sortedItems = itemsWithIndex.sort((a, b) => {
        if (!sortConfig) {
            // Default sort: Newest first (descending index)
            return b.displayIndex - a.displayIndex
        }
        const { key, direction } = sortConfig

        if (key === 'created_at') {
            return direction === 'asc' ? a.displayIndex - b.displayIndex : b.displayIndex - a.displayIndex
        }

        let aValue = a[key]
        let bValue = b[key]

        if (key === 'category') {
            aValue = a.category?.name || ''
            bValue = b.category?.name || ''
        } else {
            aValue = aValue || ''
            bValue = bValue || ''
        }

        if (aValue < bValue) return direction === 'asc' ? -1 : 1
        if (aValue > bValue) return direction === 'asc' ? 1 : -1
        return 0
    })

    const getYoutubeId = (url: string) => {
        if (!url) return null
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
        const match = url.match(regExp)
        return (match && match[2].length === 11) ? match[2] : null
    }

    const handleUrlChange = async (id: string, url: string) => {
        handleUpdate(id, { url })

        const videoId = getYoutubeId(url)
        if (videoId) {
            try {
                const response = await fetch(`https://noembed.com/embed?url=https://www.youtube.com/watch?v=${videoId}`)
                const data = await response.json()
                if (data.title) {
                    handleUpdate(id, { name: data.title })
                }
            } catch (error) {
                console.error("Failed to fetch video title", error)
            }
        }
    }

    const renderSortIcon = (key: string) => {
        if (sortConfig?.key !== key) return <ArrowUpDown className="ml-2 h-4 w-4 text-muted-foreground/50" />
        if (sortConfig.direction === 'asc') return <ArrowUp className="ml-2 h-4 w-4 text-foreground" />
        return <ArrowDown className="ml-2 h-4 w-4 text-foreground" />
    }

    return (
        <div className="space-y-8 pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h1 className="text-3xl font-bold tracking-tight">Youtube</h1>
                <div className="flex gap-2 w-full md:w-auto">
                    <CategoryManager tableName="youtube_categories" onUpdate={fetchCategories} title="Manage Categories" />
                    <Button onClick={handleCreate} className="flex-1 md:flex-none">
                        <Plus className="mr-2 h-4 w-4" />
                        New Video
                    </Button>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2 flex-1">
                    <div className="relative flex-1">
                        <Filter className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search videos..."
                            className="pl-8 w-full"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <div className="flex gap-2">
                        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                            <SelectTrigger className="w-full md:w-[150px] flex-1">
                                <div className="flex items-center gap-2">
                                    <Filter className="h-3.5 w-3.5 text-muted-foreground" />
                                    <SelectValue placeholder="Category" />
                                </div>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="All">All Categories</SelectItem>
                                <SelectItem value="Uncategorized">Uncategorized</SelectItem>
                                {categories.map(cat => (
                                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {categoryFilter !== "All" && (
                            <Button variant="ghost" size="icon" onClick={() => setCategoryFilter("All")}>
                                <X className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                </div>

                {selectedItems.size > 0 && (
                    <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-md animate-in fade-in slide-in-from-top-2">
                        <span className="text-sm font-medium px-2">{selectedItems.size} selected</span>
                        <div className="h-4 w-px bg-border mx-2" />
                        <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={handleBulkDelete}>Delete Selected</Button>
                        <div className="flex-1" />
                        <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={() => setSelectedItems(new Set())}>Cancel</Button>
                    </div>
                )}
            </div>

            <div className="space-y-2">
                <div className="flex items-center gap-4 px-4 py-2 text-sm font-medium text-muted-foreground border-b">
                    <Checkbox
                        checked={sortedItems.length > 0 && selectedItems.size === sortedItems.length}
                        onCheckedChange={toggleSelectAll}
                    />
                    <div className="w-10 font-medium cursor-pointer hover:text-foreground flex items-center" onClick={() => handleSort('created_at')}>
                        No. {renderSortIcon('created_at')}
                    </div>
                    <div className="w-[120px]">Thumbnail</div>
                    <div className="flex-1 cursor-pointer hover:text-foreground flex items-center" onClick={() => handleSort('name')}>
                        Video Name {renderSortIcon('name')}
                    </div>
                    <div className="w-[180px] cursor-pointer hover:text-foreground flex items-center" onClick={() => handleSort('category')}>
                        Category {renderSortIcon('category')}
                    </div>
                    <div className="w-[200px] cursor-pointer hover:text-foreground flex items-center" onClick={() => handleSort('url')}>
                        URL {renderSortIcon('url')}
                    </div>
                    <div className="w-[200px] cursor-pointer hover:text-foreground flex items-center" onClick={() => handleSort('note')}>
                        Note {renderSortIcon('note')}
                    </div>
                    <div className="w-20">Actions</div>
                </div>

                {sortedItems.length === 0 ? (
                    <div className="p-8 text-center text-sm text-muted-foreground border rounded-md border-dashed">
                        No videos found.
                    </div>
                ) : (
                    sortedItems.map((item) => {
                        const videoId = getYoutubeId(item.url)
                        const thumbnailUrl = videoId ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : null
                        const isEditing = editingId === item.id

                        return (
                            <div key={item.id} className={`flex items-center gap-4 p-4 border rounded-lg bg-card transition-colors group ${selectedItems.has(item.id) ? 'bg-accent/50 border-primary/50' : 'hover:bg-accent/50'}`}>
                                <Checkbox
                                    checked={selectedItems.has(item.id)}
                                    onCheckedChange={() => toggleSelection(item.id)}
                                />
                                <div className="w-10 text-muted-foreground text-xs">{item.displayIndex}</div>
                                <div className="relative group/thumbnail">
                                    <div className="w-[120px] h-[68px] bg-muted rounded-md overflow-hidden shrink-0 flex items-center justify-center cursor-pointer">
                                        {thumbnailUrl ? (
                                            <img src={thumbnailUrl} alt={item.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="text-muted-foreground/20">
                                                <ExternalLink className="h-8 w-8" />
                                            </div>
                                        )}
                                    </div>
                                    {thumbnailUrl && (
                                        <div className="absolute left-0 bottom-full mb-2 hidden group-hover/thumbnail:block z-50 w-[320px] aspect-video rounded-lg overflow-hidden shadow-xl border bg-background animate-in fade-in zoom-in-95 duration-200">
                                            <img src={thumbnailUrl.replace('mqdefault', 'maxresdefault')} alt={item.name} className="w-full h-full object-cover" />
                                        </div>
                                    )}
                                </div>

                                <div className="flex-1">
                                    {isEditing ? (
                                        <Input
                                            value={item.name}
                                            onChange={(e) => handleUpdate(item.id, { name: e.target.value })}
                                            className="font-semibold text-base"
                                        />
                                    ) : (
                                        <div className="font-semibold text-base truncate">{item.name}</div>
                                    )}
                                </div>

                                <div className="w-[180px]">
                                    {isEditing ? (
                                        <Select
                                            value={item.category_id || "none"}
                                            onValueChange={(val) => handleUpdate(item.id, { category_id: val === "none" ? null : val })}
                                        >
                                            <SelectTrigger className="h-8 text-xs w-full">
                                                <SelectValue placeholder="No Category" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="none">No Category</SelectItem>
                                                {categories.map(cat => (
                                                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    ) : (
                                        <Badge variant="secondary" className="font-normal">
                                            {item.category?.name || "No Category"}
                                        </Badge>
                                    )}
                                </div>

                                <div className="w-[200px]">
                                    {isEditing ? (
                                        <Input
                                            value={item.url || ''}
                                            onChange={(e) => handleUrlChange(item.id, e.target.value)}
                                            placeholder="https://..."
                                            className="h-8 text-xs"
                                        />
                                    ) : (
                                        item.url ? (
                                            <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline truncate block">
                                                {item.url}
                                            </a>
                                        ) : (
                                            <span className="text-xs text-muted-foreground">-</span>
                                        )
                                    )}
                                </div>

                                <div className="w-[200px]">
                                    {isEditing ? (
                                        <Input
                                            value={item.note || ''}
                                            onChange={(e) => handleUpdate(item.id, { note: e.target.value })}
                                            placeholder="Notes..."
                                            className="h-8 text-xs"
                                        />
                                    ) : (
                                        <div className="text-xs text-muted-foreground truncate">{item.note || "-"}</div>
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
