"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Trash, Pencil, Check, X } from "lucide-react"
import { supabase } from "@/lib/supabase/client"
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

    useEffect(() => {
        fetchItems()
    }, [tableName])

    const fetchItems = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data } = await supabase
            .from(tableName)
            .select('*')
            .eq('user_id', user.id)
            .order('name')

        if (data) setItems(data)
    }

    const handleAdd = async () => {
        if (!newItemName.trim()) return
        setLoading(true)

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { error } = await supabase
            .from(tableName)
            .insert({ user_id: user.id, name: newItemName.trim() })

        if (error) {
            toast.error(`Failed to add item: ${error.message}`)
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

        const { error } = await supabase
            .from(tableName)
            .update({ name: editingName.trim() })
            .eq('id', id)

        if (error) {
            toast.error(`Failed to update item: ${error.message}`)
        } else {
            toast.success("Item updated successfully")
            setEditingId(null)
            fetchItems()
            onUpdate()
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure?")) return

        const { error } = await supabase
            .from(tableName)
            .delete()
            .eq('id', id)

        if (error) {
            toast.error(`Failed to delete item: ${error.message}`)
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
