"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase/client"
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
            const { data: pageData, error: pageError } = await supabase
                .from('pages')
                .select('*')
                .eq('id', params.id)
                .single()

            if (pageData) {
                setPage(pageData)
                setTitle(pageData.title)
            }

            // Fetch content
            const { data: blockData } = await supabase
                .from('page_blocks')
                .select('*')
                .eq('page_id', params.id)
                .eq('type', 'tiptap-doc')
                .single()

            if (blockData) {
                setBlockId(blockData.id)
                setContent(blockData.content)
            }

            setLoading(false)
        }

        if (params.id) fetchPageAndContent()
    }, [params.id])

    const updateTitle = async (newTitle: string) => {
        setTitle(newTitle)
        await supabase
            .from('pages')
            .update({ title: newTitle })
            .eq('id', params.id)
    }

    const deletePage = async () => {
        if (confirm('Are you sure you want to delete this page?')) {
            await supabase.from('pages').delete().eq('id', params.id)
            router.push('/pages')
            router.refresh()
        }
    }

    const handleContentChange = async (newContent: any) => {
        // Debouncing would be good here, but for MVP direct update is okay-ish or use a timeout
        // Let's just save.
        const user = (await supabase.auth.getUser()).data.user
        if (!user) return

        if (blockId) {
            await supabase
                .from('page_blocks')
                .update({ content: newContent, updated_at: new Date().toISOString() })
                .eq('id', blockId)
        } else {
            const { data } = await supabase
                .from('page_blocks')
                .insert({
                    page_id: params.id,
                    user_id: user.id,
                    type: 'tiptap-doc',
                    content: newContent
                })
                .select()
                .single()

            if (data) setBlockId(data.id)
        }
    }

    if (loading) return <div className="flex items-center justify-center h-full"><Loader2 className="animate-spin" /></div>
    if (!page) return <div className="p-8">Page not found</div>

    return (
        <div className="max-w-3xl mx-auto space-y-8 pb-20">
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
