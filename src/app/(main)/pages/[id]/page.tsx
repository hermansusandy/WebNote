"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Loader2, Trash } from "lucide-react"
import { Editor } from "@/components/editor"

export default function PageDetail() {
    const params = useParams()
    const router = useRouter()
    const [page, setPage] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [title, setTitle] = useState("")
    const [blockId, setBlockId] = useState<string | null>(null)
    const [content, setContent] = useState<any>(null)

    useEffect(() => {
        const fetchPageAndContent = async () => {
            const res = await fetch(`/api/pages/${params.id}`)
            if (res.status === 401) {
                router.push('/login')
                return
            }
            if (!res.ok) {
                setLoading(false)
                return
            }
            const data = await res.json()
            if (data?.page) {
                setPage(data.page)
                setTitle(data.page.title)
            }
            setBlockId(data?.blockId ?? null)
            setContent(data?.content ?? null)

            setLoading(false)
        }

        if (params.id) fetchPageAndContent()
    }, [params.id])

    // Debounced title update
    useEffect(() => {
        if (title === page?.title) return

        const timer = setTimeout(async () => {
            const res = await fetch(`/api/pages/${params.id}`, {
                method: 'PATCH',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({ title }),
            })
            if (res.ok) setPage((prev: any) => ({ ...prev, title }))
        }, 1000)

        return () => clearTimeout(timer)
    }, [title, params.id, page?.title])

    const updateTitle = (newTitle: string) => {
        setTitle(newTitle)
    }

    const deletePage = async () => {
        if (confirm('Are you sure you want to delete this page?')) {
            await fetch(`/api/pages/${params.id}`, { method: 'DELETE' })
            router.push('/pages')
            router.refresh()
        }
    }

    const handleContentChange = async (newContent: any) => {
        const res = await fetch(`/api/pages/${params.id}/content`, {
            method: 'PUT',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ content: newContent }),
        })
        if (res.ok) {
            const data = await res.json().catch(() => ({}))
            if (data?.blockId) setBlockId(data.blockId)
        }
    }

    if (loading) return <div className="flex items-center justify-center h-full"><Loader2 className="animate-spin" /></div>
    if (!page) return <div className="p-8">Page not found</div>

    return (
        <div className="max-w-5xl mx-auto space-y-4 pb-20">
            <div className="flex items-center gap-4 group">
                <Input
                    className="text-4xl font-bold border-none shadow-none focus-visible:ring-0 px-0 h-auto"
                    value={title}
                    onChange={(e) => updateTitle(e.target.value)}
                    placeholder="Untitled Page"
                />
                <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive" onClick={deletePage}>
                    <Trash className="h-4 w-4" />
                </Button>
            </div>

            <div className="min-h-[500px]">
                <Editor content={content} onChange={handleContentChange} />
            </div>
        </div>
    )
}
