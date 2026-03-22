"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Trash, Pencil, Check, X } from "lucide-react"
import { toast } from "sonner"

interface CategoryManagerProps {
    tableName: string
    title: string
    onUpdate: () => void
}

export function CategoryManager({ tableName, title, onUpdate }: CategoryManagerProps) {
    const [items, setItems] = useState<any[]>([])
    const [newItemName, setNewItemName] = useState("")
    const [editingId, setEditingId] = useState<string | null>(null)
    const [editingName, setEditingName] = useState("")
    const [loading, setLoading] = useState(false)

    const fetchItems = async () => {
        const res = await fetch(`/api/categories?table=${encodeURIComponent(tableName)}`)
        if (!res.ok) return
        const data = await res.json()
        if (data?.items) setItems(data.items)
    }

    useEffect(() => {
        fetchItems()
    }, [tableName])

    const handleAdd = async () => {
        if (!newItemName.trim()) return
        setLoading(true)

        const res = await fetch('/api/categories', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ table: tableName, name: newItemName.trim() }),
        })

        if (!res.ok) {
            toast.error('Failed to add item')
        } else {
            toast.success("Item added successfully")
            setNewItemName("")
            fetchItems()
            onUpdate()
        }
        setLoading(false)
    }

    const handleUpdate = async (id: string) => {
        if (!editingName.trim()) return

        const res = await fetch('/api/categories', {
            method: 'PATCH',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ table: tableName, id, name: editingName.trim() }),
        })

        if (!res.ok) {
            toast.error('Failed to update item')
        } else {
            toast.success("Item updated successfully")
            setEditingId(null)
            fetchItems()
            onUpdate()
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure?")) return

        const res = await fetch('/api/categories', {
            method: 'DELETE',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ table: tableName, id }),
        })

        if (!res.ok) {
            toast.error('Failed to delete item')
        } else {
            toast.success("Item deleted successfully")
            fetchItems()
            onUpdate()
        }
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">Manage {title}</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Manage {title}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <div className="flex gap-2">
                        <Input
                            placeholder={`New ${title} name`}
                            value={newItemName}
                            onChange={(e) => setNewItemName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                        />
                        <Button onClick={handleAdd} disabled={loading}>
                            <Plus className="h-4 w-4" />
                        </Button>
                    </div>
                    <div className="space-y-2 max-h-[300px] overflow-y-auto">
                        {items.map(item => (
                            <div key={item.id} className="flex items-center gap-2 p-2 border rounded-md">
                                {editingId === item.id ? (
                                    <>
                                        <Input
                                            value={editingName}
                                            onChange={(e) => setEditingName(e.target.value)}
                                            className="h-8"
                                        />
                                        <Button size="icon" variant="ghost" className="h-8 w-8 text-green-600" onClick={() => handleUpdate(item.id)}>
                                            <Check className="h-4 w-4" />
                                        </Button>
                                        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setEditingId(null)}>
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </>
                                ) : (
                                    <>
                                        <span className="flex-1">{item.name}</span>
                                        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => {
                                            setEditingId(item.id)
                                            setEditingName(item.name)
                                        }}>
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => handleDelete(item.id)}>
                                            <Trash className="h-4 w-4" />
                                        </Button>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
