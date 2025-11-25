"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Trash, Edit2, X, Check } from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"

interface Category {
    id: string
    name: string
    color?: string
}

interface CategoryManagerProps {
    tableName: string
    onUpdate: () => void
}

export function CategoryManager({ tableName, onUpdate }: CategoryManagerProps) {
    const [categories, setCategories] = useState<Category[]>([])
    const [newCategory, setNewCategory] = useState("")
    const [editingId, setEditingId] = useState<string | null>(null)
    const [editName, setEditName] = useState("")
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchCategories()
    }, [tableName])

    const fetchCategories = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data } = await supabase
            .from(tableName)
            .select('*')
            .eq('user_id', user.id)
            .order('name')

        if (data) setCategories(data)
        setLoading(false)
    }

    const handleAdd = async () => {
        if (!newCategory.trim()) return
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data } = await supabase
            .from(tableName)
            .insert({ user_id: user.id, name: newCategory.trim() })
            .select()
            .single()

        if (data) {
            setCategories([...categories, data])
            setNewCategory("")
            onUpdate()
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this category?")) return

        await supabase.from(tableName).delete().eq('id', id)
        setCategories(categories.filter(c => c.id !== id))
        onUpdate()
    }

    const startEdit = (category: Category) => {
        setEditingId(category.id)
        setEditName(category.name)
    }

    const saveEdit = async () => {
        if (!editingId || !editName.trim()) return

        await supabase
            .from(tableName)
            .update({ name: editName.trim() })
            .eq('id', editingId)

        setCategories(categories.map(c => c.id === editingId ? { ...c, name: editName.trim() } : c))
        setEditingId(null)
        onUpdate()
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">Manage Categories</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Manage Categories</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                    <div className="flex gap-2">
                        <Input
                            placeholder="New category name..."
                            value={newCategory}
                            onChange={(e) => setNewCategory(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                        />
                        <Button onClick={handleAdd} size="icon">
                            <Plus className="h-4 w-4" />
                        </Button>
                    </div>

                    <div className="space-y-2 max-h-[300px] overflow-y-auto">
                        {categories.map(category => (
                            <div key={category.id} className="flex items-center gap-2 p-2 border rounded-md bg-muted/50">
                                {editingId === category.id ? (
                                    <>
                                        <Input
                                            value={editName}
                                            onChange={(e) => setEditName(e.target.value)}
                                            className="h-8"
                                            autoFocus
                                        />
                                        <Button size="icon" variant="ghost" className="h-8 w-8 text-green-500" onClick={saveEdit}>
                                            <Check className="h-4 w-4" />
                                        </Button>
                                        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setEditingId(null)}>
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </>
                                ) : (
                                    <>
                                        <span className="flex-1 font-medium">{category.name}</span>
                                        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => startEdit(category)}>
                                            <Edit2 className="h-3 w-3" />
                                        </Button>
                                        <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => handleDelete(category.id)}>
                                            <Trash className="h-3 w-3" />
                                        </Button>
                                    </>
                                )}
                            </div>
                        ))}
                        {categories.length === 0 && (
                            <div className="text-center text-sm text-muted-foreground py-4">
                                No categories yet.
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
