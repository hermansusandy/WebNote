"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Trash, Calendar as CalendarIcon, Filter, X } from "lucide-react"
import { format, isToday, isPast, isFuture } from "date-fns"
import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar"
import { Checkbox } from "@/components/ui/checkbox"
import { CategoryManager } from "@/components/category-manager"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

export default function RemindersPage() {
    const [items, setItems] = useState<any[]>([])
    const [categories, setCategories] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    // Selection & Filters
    const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
    const [priorityFilter, setPriorityFilter] = useState<string>("All")
    const [search, setSearch] = useState("")

    const fetchCategories = async () => {
        const res = await fetch(`/api/categories?table=reminder_categories`)
        if (!res.ok) return
        const data = await res.json().catch(() => ({}))
        if (data?.items) setCategories(data.items)
    }

    const fetchItems = async () => {
        const res = await fetch('/api/reminders')
        if (!res.ok) {
            setLoading(false)
            return
        }
        const data = await res.json().catch(() => ({}))
        if (data?.items) setItems(data.items)
        setLoading(false)
    }

    useEffect(() => {
        fetchItems()
        fetchCategories()
    }, [])

    const handleCreate = async () => {
        // Get default category if exists
        const categoryId = categories.length > 0 ? categories[0].id : null

        const res = await fetch('/api/reminders', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({
                title: 'New Reminder',
                due_at: new Date().toISOString(),
                priority: 'Medium',
                category_id: categoryId,
            }),
        })
        const json = await res.json().catch(() => ({}))
        const data = json?.item

        if (data) {
            setItems([...items, data].sort((a, b) => new Date(a.due_at).getTime() - new Date(b.due_at).getTime()))
        }
    }

    const handleUpdate = async (id: string, updates: any) => {
        setItems(items.map(item => {
            if (item.id === id) {
                if (updates.category_id) {
                    const cat = categories.find(c => c.id === updates.category_id)
                    return { ...item, ...updates, category: cat }
                }
                return { ...item, ...updates }
            }
            return item
        }))
        await fetch(`/api/reminders/${id}`, {
            method: 'PATCH',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify(updates),
        })
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this reminder?')) return
        setItems(items.filter(item => item.id !== id))
        setSelectedItems(prev => {
            const next = new Set(prev)
            next.delete(id)
            return next
        })
        await fetch(`/api/reminders/${id}`, { method: 'DELETE' })
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

    const handleBulkDelete = async () => {
        if (!confirm(`Delete ${selectedItems.size} reminders?`)) return
        const ids = Array.from(selectedItems)
        setItems(items.filter(item => !ids.includes(item.id)))
        setSelectedItems(new Set())
        await fetch('/api/reminders', {
            method: 'DELETE',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ ids }),
        })
    }

    const filteredItems = items.filter(item => {
        const categoryName = item.category?.name || ''
        const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase()) ||
            categoryName.toLowerCase().includes(search.toLowerCase())
        const matchesPriority = priorityFilter === "All" || item.priority === priorityFilter
        return matchesSearch && matchesPriority
    })

    const todayItems = filteredItems.filter(item => isToday(new Date(item.due_at)))
    const upcomingItems = filteredItems.filter(item => isFuture(new Date(item.due_at)) && !isToday(new Date(item.due_at)))
    const pastItems = filteredItems.filter(item => isPast(new Date(item.due_at)) && !isToday(new Date(item.due_at)))

    const ReminderItem = ({ item }: { item: any }) => (
        <div className={`flex flex-col md:flex-row items-start md:items-center gap-4 p-3 border rounded-lg bg-card transition-colors group ${selectedItems.has(item.id) ? 'bg-accent/50 border-primary/50' : 'hover:bg-accent/50'}`}>
            <div className="flex items-center gap-3 w-full md:w-auto">
                <Checkbox
                    checked={selectedItems.has(item.id)}
                    onCheckedChange={() => toggleSelection(item.id)}
                />
                <Input
                    value={item.title}
                    onChange={(e) => handleUpdate(item.id, { title: e.target.value })}
                    className="font-medium border-none shadow-none p-0 h-auto focus-visible:ring-0 bg-transparent flex-1 md:w-auto"
                />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-between md:justify-end md:ml-auto mt-2 md:mt-0">
                <div className="flex flex-wrap items-center gap-2 flex-1 md:flex-none">
                    <div className="w-full md:w-[140px] flex-1 md:flex-none min-w-[120px]">
                        <Select
                            value={item.category_id || "none"}
                            onValueChange={(val) => handleUpdate(item.id, { category_id: val === "none" ? null : val })}
                        >
                            <SelectTrigger className="h-8 text-xs border-transparent bg-transparent hover:border-input focus:border-input w-full">
                                <SelectValue placeholder="No Category" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">No Category</SelectItem>
                                {categories.map(cat => (
                                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="w-[90px] md:w-[100px] flex-1 md:flex-none">
                        <Select
                            value={item.priority || "Medium"}
                            onValueChange={(val) => handleUpdate(item.id, { priority: val })}
                        >
                            <SelectTrigger className="h-8 text-xs border-transparent bg-transparent hover:border-input focus:border-input w-full">
                                <SelectValue placeholder="Priority" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Low">Low</SelectItem>
                                <SelectItem value="Medium">Medium</SelectItem>
                                <SelectItem value="High">High</SelectItem>
                                <SelectItem value="Urgent">Urgent</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant={"outline"}
                                className={cn(
                                    "w-auto md:w-[180px] justify-start text-left font-normal h-8 text-xs",
                                    !item.due_at && "text-muted-foreground"
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                <span className="hidden md:inline">{item.due_at ? format(new Date(item.due_at), "PPP") : <span>Pick a date</span>}</span>
                                <span className="md:hidden">{item.due_at ? format(new Date(item.due_at), "MM/dd") : <span>Date</span>}</span>
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                mode="single"
                                selected={new Date(item.due_at)}
                                onSelect={(date) => date && handleUpdate(item.id, { due_at: date.toISOString() })}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                    <Button variant="ghost" size="icon" className="text-destructive md:opacity-0 md:group-hover:opacity-100" onClick={() => handleDelete(item.id)}>
                        <Trash className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    )

    return (
        <div className="space-y-8 pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h1 className="text-3xl font-bold tracking-tight">Reminders</h1>
                <div className="flex gap-2 w-full md:w-auto">
                    <CategoryManager tableName="reminder_categories" onUpdate={fetchCategories} title="Manage Categories" />
                    <Button onClick={handleCreate} className="flex-1 md:flex-none">
                        <Plus className="mr-2 h-4 w-4" />
                        New Reminder
                    </Button>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2 flex-1">
                    <div className="relative flex-1">
                        <Filter className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search reminders..."
                            className="pl-8 w-full"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <div className="flex gap-2">
                        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                            <SelectTrigger className="w-full md:w-[130px] flex-1">
                                <div className="flex items-center gap-2">
                                    <Filter className="h-3.5 w-3.5 text-muted-foreground" />
                                    <SelectValue placeholder="Priority" />
                                </div>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="All">All Priority</SelectItem>
                                <SelectItem value="Low">Low</SelectItem>
                                <SelectItem value="Medium">Medium</SelectItem>
                                <SelectItem value="High">High</SelectItem>
                                <SelectItem value="Urgent">Urgent</SelectItem>
                            </SelectContent>
                        </Select>

                        {priorityFilter !== "All" && (
                            <Button variant="ghost" size="icon" onClick={() => setPriorityFilter("All")}>
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

            <div className="space-y-8">
                <div className="flex items-center gap-2 px-4">
                    <Checkbox
                        checked={filteredItems.length > 0 && selectedItems.size === filteredItems.length}
                        onCheckedChange={toggleSelectAll}
                    />
                    <span className="text-sm text-muted-foreground">Select All</span>
                </div>

                {todayItems.length > 0 && (
                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold flex items-center gap-2 text-green-500">
                            Today
                            <span className="text-xs font-normal text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{todayItems.length}</span>
                        </h2>
                        <div className="space-y-2">
                            {todayItems.map(item => <ReminderItem key={item.id} item={item} />)}
                        </div>
                    </div>
                )}

                {upcomingItems.length > 0 && (
                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold flex items-center gap-2 text-blue-500">
                            Upcoming
                            <span className="text-xs font-normal text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{upcomingItems.length}</span>
                        </h2>
                        <div className="space-y-2">
                            {upcomingItems.map(item => <ReminderItem key={item.id} item={item} />)}
                        </div>
                    </div>
                )}

                {pastItems.length > 0 && (
                    <div className="space-y-4 opacity-60 hover:opacity-100 transition-opacity">
                        <h2 className="text-lg font-semibold flex items-center gap-2 text-muted-foreground">
                            Overdue / Past
                            <span className="text-xs font-normal text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{pastItems.length}</span>
                        </h2>
                        <div className="space-y-2">
                            {pastItems.map(item => <ReminderItem key={item.id} item={item} />)}
                        </div>
                    </div>
                )}

                {items.length === 0 && (
                    <div className="p-8 text-center text-sm text-muted-foreground border rounded-md border-dashed">
                        No reminders found. Start by creating one!
                    </div>
                )}
            </div>
        </div>
    )
}
