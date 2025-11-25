"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Search, Trash, CheckCircle2, Circle, Filter, X, Pencil, Check, ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { CategoryManager } from "@/components/category-manager"
import { LongText } from "@/components/long-text"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

import { toast } from "sonner"

export default function LearningPage() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const [items, setItems] = useState<any[]>([])
    const [categories, setCategories] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState("")
    const [editingId, setEditingId] = useState<string | null>(null)

    // Selection & Filters
    const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
    const [statusFilter, setStatusFilter] = useState<string>("All")
    const [priorityFilter, setPriorityFilter] = useState<string>("All")
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
            .from('learning_categories')
            .select('*')
            .eq('user_id', user.id)
            .order('name')

        if (data) setCategories(data)
    }

    const fetchItems = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data } = await supabase
            .from('learning_titles')
            .select(`
                *,
                category:learning_categories(id, name, color)
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

        const { data } = await supabase.from('learning_titles').insert({
            user_id: user.id,
            title: 'New Learning Goal',
            priority: 'Medium',
            status: 'Planned',
            category_id: categoryId
        }).select(`
            *,
            category:learning_categories(id, name, color)
        `).single()

        if (data) {
            setItems([data, ...items])
            setEditingId(data.id) // Auto-enter edit mode
            toast.success("Topic created successfully")
        }
    }

    const handleUpdate = async (id: string, updates: any) => {
        // Optimistic update
        setItems(prevItems => prevItems.map(item => {
            if (item.id === id) {
                // If updating category_id, we need to find the category object for optimistic UI
                if (updates.category_id) {
                    const cat = categories.find(c => c.id === updates.category_id)
                    return { ...item, ...updates, category: cat }
                }
                return { ...item, ...updates }
            }
            return item
        }))

        await supabase.from('learning_titles').update(updates).eq('id', id)
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this item?')) return
        setItems(items.filter(item => item.id !== id))
        setSelectedItems(prev => {
            const next = new Set(prev)
            next.delete(id)
            return next
        })
        await supabase.from('learning_titles').delete().eq('id', id)
        toast.success("Topic deleted successfully")
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

    const handleBulkStatusUpdate = async (status: string) => {
        const ids = Array.from(selectedItems)
        setItems(items.map(item => ids.includes(item.id) ? { ...item, status } : item))
        setSelectedItems(new Set()) // Clear selection

        await supabase
            .from('learning_titles')
            .update({ status })
            .in('id', ids)

        toast.success("Status updated successfully")
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
        return item.title.toLowerCase().includes(search.toLowerCase()) ||
            categoryName.toLowerCase().includes(search.toLowerCase())
    }).filter(item => {
        const matchesStatus = statusFilter === "All" || item.status === statusFilter
        const matchesPriority = priorityFilter === "All" || item.priority === priorityFilter
        const matchesCategory = categoryFilter === "All" || (item.category_id === categoryFilter) || (categoryFilter === "Uncategorized" && !item.category_id)
        return matchesStatus && matchesPriority && matchesCategory
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

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Completed': return 'bg-green-500/10 text-green-600 border-green-200 hover:bg-green-500/20'
            case 'In Progress': return 'bg-blue-500/10 text-blue-600 border-blue-200 hover:bg-blue-500/20'
            default: return 'bg-slate-500/10 text-slate-600 border-slate-200 hover:bg-slate-500/20'
        }
    }

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'High': return 'text-red-600 border-red-200 bg-red-50 hover:bg-red-100'
            case 'Medium': return 'text-orange-600 border-orange-200 bg-orange-50 hover:bg-orange-100'
            default: return 'text-slate-600 border-slate-200 bg-slate-50 hover:bg-slate-100'
        }
    }

    const renderSortIcon = (key: string) => {
        if (sortConfig?.key !== key) return <ArrowUpDown className="ml-2 h-4 w-4 text-muted-foreground/50" />
        if (sortConfig.direction === 'asc') return <ArrowUp className="ml-2 h-4 w-4 text-foreground" />
        return <ArrowDown className="ml-2 h-4 w-4 text-foreground" />
    }

    return (
        <div className="space-y-8 pb-20">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Learning Planner</h1>
                <div className="flex gap-2">
                    <CategoryManager tableName="learning_categories" title="Categories" onUpdate={fetchCategories} />
                    <Button onClick={handleCreate}>
                        <Plus className="mr-2 h-4 w-4" />
                        New Topic
                    </Button>
                </div>
            </div>

            <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2 flex-wrap">
                    <div className="relative flex-1 min-w-[200px] max-w-sm">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search topics..."
                            className="pl-8"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-[150px]">
                            <div className="flex items-center gap-2">
                                <Filter className="h-3.5 w-3.5 text-muted-foreground" />
                                <SelectValue placeholder="Status" />
                            </div>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="All">All Status</SelectItem>
                            <SelectItem value="Planned">Planned</SelectItem>
                            <SelectItem value="In Progress">In Progress</SelectItem>
                            <SelectItem value="Completed">Completed</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                        <SelectTrigger className="w-[150px]">
                            <div className="flex items-center gap-2">
                                <Filter className="h-3.5 w-3.5 text-muted-foreground" />
                                <SelectValue placeholder="Priority" />
                            </div>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="All">All Priority</SelectItem>
                            <SelectItem value="High">High</SelectItem>
                            <SelectItem value="Medium">Medium</SelectItem>
                            <SelectItem value="Low">Low</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                        <SelectTrigger className="w-[150px]">
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

                    {(statusFilter !== "All" || priorityFilter !== "All" || categoryFilter !== "All") && (
                        <Button variant="ghost" size="icon" onClick={() => {
                            setStatusFilter("All")
                            setPriorityFilter("All")
                            setCategoryFilter("All")
                        }}>
                            <X className="h-4 w-4" />
                        </Button>
                    )}
                </div>

                {selectedItems.size > 0 && (
                    <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-md animate-in fade-in slide-in-from-top-2">
                        <span className="text-sm font-medium px-2">{selectedItems.size} selected</span>
                        <div className="h-4 w-px bg-border mx-2" />
                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" onClick={() => handleBulkStatusUpdate('Planned')}>Set Planned</Button>
                            <Button variant="ghost" size="sm" onClick={() => handleBulkStatusUpdate('In Progress')}>Set In Progress</Button>
                            <Button variant="ghost" size="sm" onClick={() => handleBulkStatusUpdate('Completed')}>Set Completed</Button>
                        </div>
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
                    <div className="w-[30%] cursor-pointer hover:text-foreground flex items-center" onClick={() => handleSort('title')}>
                        Topic {renderSortIcon('title')}
                    </div>
                    <div className="flex-1 cursor-pointer hover:text-foreground flex items-center" onClick={() => handleSort('notes')}>
                        Notes {renderSortIcon('notes')}
                    </div>
                    <div className="w-[140px] cursor-pointer hover:text-foreground flex items-center" onClick={() => handleSort('category')}>
                        Category {renderSortIcon('category')}
                    </div>
                    <div className="w-[120px] cursor-pointer hover:text-foreground flex items-center" onClick={() => handleSort('status')}>
                        Status {renderSortIcon('status')}
                    </div>
                    <div className="w-[120px] cursor-pointer hover:text-foreground flex items-center" onClick={() => handleSort('priority')}>
                        Priority {renderSortIcon('priority')}
                    </div>
                    <div className="w-20">Actions</div>
                </div>

                {sortedItems.length === 0 ? (
                    <div className="p-8 text-center text-sm text-muted-foreground border rounded-md border-dashed">
                        No learning topics found.
                    </div>
                ) : (
                    sortedItems.map((item) => {
                        const isEditing = editingId === item.id

                        return (
                            <div key={item.id} className={`flex items-center gap-4 p-2 border rounded-lg bg-card transition-colors group ${selectedItems.has(item.id) ? 'bg-accent/50 border-primary/50' : 'hover:bg-accent/50'}`}>
                                <Checkbox
                                    checked={selectedItems.has(item.id)}
                                    onCheckedChange={() => toggleSelection(item.id)}
                                />
                                <div className="w-10 text-muted-foreground text-xs">{item.displayIndex}</div>
                                <div className="w-[30%]">
                                    {isEditing ? (
                                        <Input
                                            value={item.title}
                                            onChange={(e) => handleUpdate(item.id, { title: e.target.value })}
                                            className="font-semibold text-lg"
                                        />
                                    ) : (
                                        <div className="font-semibold text-lg truncate">{item.title}</div>
                                    )}
                                </div>

                                <div className="flex-1 min-w-0">
                                    {isEditing ? (
                                        <Textarea
                                            value={item.notes || ''}
                                            onChange={(e) => handleUpdate(item.id, { notes: e.target.value })}
                                            placeholder="Add notes..."
                                            className="text-sm min-h-[80px]"
                                        />
                                    ) : (
                                        <LongText text={item.notes} />
                                    )}
                                </div>

                                <div className="w-[140px]">
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

                                <div className="w-[120px]">
                                    {isEditing ? (
                                        <Select
                                            value={item.status}
                                            onValueChange={(val) => handleUpdate(item.id, { status: val })}
                                        >
                                            <SelectTrigger className="h-8 text-xs">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Planned">Planned</SelectItem>
                                                <SelectItem value="In Progress">In Progress</SelectItem>
                                                <SelectItem value="Completed">Completed</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    ) : (
                                        <Badge variant="outline" className={getStatusColor(item.status)}>
                                            {item.status}
                                        </Badge>
                                    )}
                                </div>

                                <div className="w-[120px]">
                                    {isEditing ? (
                                        <Select
                                            value={item.priority}
                                            onValueChange={(val) => handleUpdate(item.id, { priority: val })}
                                        >
                                            <SelectTrigger className="h-8 text-xs">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Low">Low</SelectItem>
                                                <SelectItem value="Medium">Medium</SelectItem>
                                                <SelectItem value="High">High</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    ) : (
                                        <Badge variant="outline" className={getPriorityColor(item.priority)}>
                                            {item.priority}
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
