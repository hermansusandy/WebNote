"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
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
import { CategoryManager } from "@/components/category-manager"
import { LongText } from "@/components/long-text"
import { toast } from "sonner"

export default function ToolsPage() {
    const [items, setItems] = useState<any[]>([])
    const [categories, setCategories] = useState<any[]>([])
    const [subCategories, setSubCategories] = useState<any[]>([])

    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState("")
    const [editingId, setEditingId] = useState<string | null>(null)

    // Selection & Filters
    const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
    const [categoryFilter, setCategoryFilter] = useState<string>("All")
    const [subCategoryFilter, setSubCategoryFilter] = useState<string>("All")

    useEffect(() => {
        fetchItems()
        fetchCategories()
        fetchSubCategories()
    }, [])

    const fetchItems = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data } = await supabase
            .from('web_urls')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })

        if (data) setItems(data)
        setLoading(false)
    }

    const fetchCategories = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return
        const { data } = await supabase.from('web_url_categories').select('*').eq('user_id', user.id).order('name')
        if (data) setCategories(data)
    }

    const fetchSubCategories = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return
        const { data } = await supabase.from('web_url_sub_categories').select('*').eq('user_id', user.id).order('name')
        if (data) setSubCategories(data)
    }

    const handleCreate = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data, error } = await supabase.from('web_urls').insert({
            user_id: user.id,
            name: 'New Web URL',
            url: 'https://example.com',
            category: categories[0]?.name || 'General',
            sub_category: subCategories[0]?.name || null,
            remarks: ''
        }).select().single()

        if (error) {
            console.error("Error creating URL:", error)
            toast.error(`Failed to create URL: ${error.message} `)
            return
        }

        if (data) {
            setItems([data, ...items])
            setEditingId(data.id) // Auto-enter edit mode
            toast.success("URL created successfully")
        }
    }

    const handleUpdate = async (id: string, updates: any) => {
        // Optimistic update
        setItems(prevItems => prevItems.map(item => {
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
            (item.sub_category || '').toLowerCase().includes(search.toLowerCase()) ||
            (item.remarks || '').toLowerCase().includes(search.toLowerCase()) ||
            item.url.toLowerCase().includes(search.toLowerCase())
    }).filter(item => {
        const matchesCategory = categoryFilter === "All" || item.category === categoryFilter
        const matchesSubCategory = subCategoryFilter === "All" || item.sub_category === subCategoryFilter
        return matchesCategory && matchesSubCategory
    })

    const getYoutubeId = (url: string) => {
        if (!url) return null
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
        const match = url.match(regExp)
        return (match && match[2].length === 11) ? match[2] : null
    }

    return (
        <div className="space-y-8 pb-20 p-8">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Tools/URL</h1>
                <div className="flex gap-2">
                    <CategoryManager tableName="web_url_categories" title="Categories" onUpdate={fetchCategories} />
                    <CategoryManager tableName="web_url_sub_categories" title="Sub-Categories" onUpdate={fetchSubCategories} />
                    <Button onClick={handleCreate}>
                        <Plus className="mr-2 h-4 w-4" />
                        New URL
                    </Button>
                </div>
            </div>

            <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2 flex-wrap">
                    <div className="relative flex-1 min-w-[200px] max-w-sm">
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
                                <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select value={subCategoryFilter} onValueChange={setSubCategoryFilter}>
                        <SelectTrigger className="w-[180px]">
                            <div className="flex items-center gap-2">
                                <Filter className="h-3.5 w-3.5 text-muted-foreground" />
                                <SelectValue placeholder="Sub-Category" />
                            </div>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="All">All Sub-Categories</SelectItem>
                            {subCategories.map(cat => (
                                <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {(categoryFilter !== "All" || subCategoryFilter !== "All") && (
                        <Button variant="ghost" size="icon" onClick={() => {
                            setCategoryFilter("All")
                            setSubCategoryFilter("All")
                        }}>
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

            <div className="space-y-2">
                <div className="flex items-center gap-4 px-4 py-2 text-sm font-medium text-muted-foreground border-b">
                    <Checkbox
                        checked={filteredItems.length > 0 && selectedItems.size === filteredItems.length}
                        onCheckedChange={toggleSelectAll}
                    />

                    <div className="w-[15%]">Name</div>
                    <div className="w-[20%]">URL</div>
                    <div className="flex-1">Remarks</div>
                    <div className="w-[120px]">Category</div>
                    <div className="w-[120px]">Sub-Category</div>
                    <div className="w-20">Actions</div>
                </div>

                {filteredItems.length === 0 ? (
                    <div className="p-8 text-center text-sm text-muted-foreground border rounded-md border-dashed">
                        No URLs found.
                    </div>
                ) : (
                    filteredItems.map(item => {
                        const isEditing = editingId === item.id
                        const youtubeId = getYoutubeId(item.url)
                        const thumbnailUrl = youtubeId
                            ? `https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`
                            : `https://www.google.com/s2/favicons?domain=${item.url}&sz=128`

                        return (
                            <div key={item.id} className={`flex items-center gap-4 p-2 border rounded-lg bg-card transition-colors group ${selectedItems.has(item.id) ? 'bg-accent/50 border-primary/50' : 'hover:bg-accent/50'}`}>
                                <Checkbox
                                    checked={selectedItems.has(item.id)}
                                    onCheckedChange={() => toggleSelection(item.id)}
                                />



                                <div className="w-[15%] relative group/name">
                                    {isEditing ? (
                                        <Input
                                            value={item.name}
                                            onChange={(e) => handleUpdate(item.id, { name: e.target.value })}
                                            className="font-semibold"
                                        />
                                    ) : (
                                        <>
                                            <div className="font-semibold truncate cursor-help" title={item.name}>{item.name}</div>
                                            {item.url && (
                                                <div className="absolute left-0 top-full mt-2 hidden group-hover/name:block z-50 w-[320px] aspect-video rounded-lg overflow-hidden shadow-xl border bg-background animate-in fade-in zoom-in-95 duration-200 pointer-events-none">
                                                    <img
                                                        src={youtubeId ? `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg` : thumbnailUrl}
                                                        alt={item.name}
                                                        className={`w-full h-full ${youtubeId ? 'object-cover' : 'object-contain p-8 bg-white'}`}
                                                    />
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>

                                <div className="w-[20%] flex items-center gap-2 min-w-0">
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

                                <div className="flex-1 min-w-0">
                                    {isEditing ? (
                                        <Textarea
                                            value={item.remarks || ''}
                                            onChange={(e) => handleUpdate(item.id, { remarks: e.target.value })}
                                            placeholder="Remarks..."
                                            className="text-sm min-h-[60px]"
                                        />
                                    ) : (
                                        <LongText text={item.remarks} />
                                    )}
                                </div>

                                <div className="w-[120px]">
                                    {isEditing ? (
                                        <Select value={item.category || ''} onValueChange={(val) => handleUpdate(item.id, { category: val })}>
                                            <SelectTrigger className="h-8">
                                                <SelectValue placeholder="Category" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {categories.map(cat => (
                                                    <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    ) : (
                                        <Badge variant="secondary" className="font-normal">
                                            {item.category || "General"}
                                        </Badge>
                                    )}
                                </div>

                                <div className="w-[120px]">
                                    {isEditing ? (
                                        <Select value={item.sub_category || ''} onValueChange={(val) => handleUpdate(item.id, { sub_category: val })}>
                                            <SelectTrigger className="h-8">
                                                <SelectValue placeholder="Sub-Category" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {subCategories.map(cat => (
                                                    <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    ) : (
                                        <Badge variant="outline" className="font-normal text-muted-foreground">
                                            {item.sub_category || "-"}
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
            </div >
        </div >
    )
}
