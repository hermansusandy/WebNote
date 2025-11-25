"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
    LayoutDashboard,
    FileText,
    GraduationCap,
    Bell,
    Package,
    Settings,
    Plus,
    ChevronRight,
    ChevronDown,
    Trash,
    Youtube
} from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { useRouter } from "next/navigation"
import * as React from "react"
import { supabase } from "@/lib/supabase/client"
import { toast } from "sonner"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> { }

export function Sidebar({ className }: SidebarProps) {
    const pathname = usePathname()
    const router = useRouter()
    const [pages, setPages] = React.useState<any[]>([])
    const [user, setUser] = React.useState<any>(null)
    const [isQuickActionsOpen, setIsQuickActionsOpen] = React.useState(true)
    const [isPagesOpen, setIsPagesOpen] = React.useState(true)

    React.useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            setUser(user)
            if (user) fetchPages(user.id)
        }
        getUser()

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user)
            if (session?.user) fetchPages(session.user.id)
            else setPages([])
        })

        return () => subscription.unsubscribe()
    }, [])

    const fetchPages = async (userId: string) => {
        const { data } = await supabase
            .from('pages')
            .select('id, title, icon')
            .eq('user_id', userId)
            .is('parent_id', null)
            .order('sort_order', { ascending: true })

        if (data) setPages(data)
    }

    const handleCreatePage = async () => {
        if (!user) {
            router.push('/login')
            return
        }

        const { data, error } = await supabase
            .from('pages')
            .insert({
                user_id: user.id,
                title: 'Untitled Page'
            })
            .select()
            .single()

        if (data) {
            fetchPages(user.id)
            router.push(`/pages/${data.id}`)
            toast.success("Page created successfully")
        }
    }

    const handleCreateLearning = async () => {
        if (!user) {
            router.push('/login')
            return
        }
        // For MVP, just redirect to learning page with a query param or let the page handle it
        // But here we can create a default one
        const { data } = await supabase.from('learning_titles').insert({
            user_id: user.id,
            title: 'New Learning Goal',
            priority: 'Medium',
            status: 'Planned'
        }).select().single()

        if (data) {
            router.push(`/learning?new=${data.id}`)
            toast.success("Learning goal created successfully")
        }
    }

    const handleCreateReminder = async () => {
        if (!user) {
            router.push('/login')
            return
        }
        const { data } = await supabase.from('reminders').insert({
            user_id: user.id,
            title: 'New Reminder',
            due_at: new Date().toISOString()
        }).select().single()

        if (data) {
            router.push(`/reminders`)
            toast.success("Reminder created successfully")
        }
    }

    const links = [
        { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
        { name: "Learning", href: "/learning", icon: GraduationCap },
        { name: "Reminders", href: "/reminders", icon: Bell },
        { name: "Tools/URL", href: "/tools", icon: Package },
        { name: "Youtube", href: "/youtube", icon: Youtube },
    ]

    return (
        <div className={cn("pb-4 h-full bg-background flex flex-col", className)}>
            <div className="space-y-4 py-4 flex-1 flex flex-col min-h-0 overflow-y-auto">
                <div className="px-3 py-2">
                    <div className="flex items-center justify-between mb-2 px-4">
                        <h2 className="text-lg font-semibold tracking-tight">
                            WebNote
                        </h2>
                        <ThemeToggle />
                    </div>
                    <div className="space-y-1">
                        {links.map((link) => (
                            <React.Fragment key={link.href}>
                                <Button
                                    variant={pathname?.startsWith(link.href) ? "secondary" : "ghost"}
                                    className="w-full justify-start"
                                    asChild
                                >
                                    <Link href={link.href}>
                                        <link.icon className="mr-2 h-4 w-4" />
                                        {link.name}
                                    </Link>
                                </Button>
                                {link.name === 'Dashboard' && (
                                    <div className="space-y-1">
                                        <Button
                                            variant="ghost"
                                            className="w-full justify-between hover:bg-transparent px-4"
                                            onClick={() => setIsPagesOpen(!isPagesOpen)}
                                        >
                                            <div className="flex items-center">
                                                <FileText className="mr-2 h-4 w-4" />
                                                <span>Pages</span>
                                            </div>
                                            {isPagesOpen ? (
                                                <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                            ) : (
                                                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                            )}
                                        </Button>
                                        {isPagesOpen && (
                                            <div className="space-y-1 pl-2 animate-in slide-in-from-top-2 fade-in duration-200">
                                                {pages.length === 0 ? (
                                                    <div className="text-sm text-muted-foreground pl-4 py-1">
                                                        No pages yet.
                                                    </div>
                                                ) : (
                                                    pages.map(page => (
                                                        <div key={page.id} className="relative group">
                                                            <Button
                                                                variant={pathname === `/pages/${page.id}` ? "secondary" : "ghost"}
                                                                className="w-full justify-start font-normal truncate pr-8 h-8"
                                                                asChild
                                                            >
                                                                <Link href={`/pages/${page.id}`}>
                                                                    <span className="truncate">{page.title}</span>
                                                                </Link>
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                                                                onClick={async (e) => {
                                                                    e.preventDefault()
                                                                    e.stopPropagation()
                                                                    if (!confirm("Delete this page?")) return

                                                                    const { error } = await supabase.from('pages').delete().eq('id', page.id)
                                                                    if (error) {
                                                                        toast.error("Failed to delete page")
                                                                        return
                                                                    }

                                                                    setPages(currentPages => currentPages.filter(p => p.id !== page.id))

                                                                    if (pathname === `/pages/${page.id}`) {
                                                                        router.push('/dashboard')
                                                                    }
                                                                    toast.success("Page deleted successfully")
                                                                }}
                                                            >
                                                                <Trash className="h-3 w-3" />
                                                            </Button>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                </div>
                <div className="px-3 py-2">
                    <Button
                        variant="ghost"
                        className="w-full justify-between hover:bg-transparent px-4 mb-2"
                        onClick={() => setIsQuickActionsOpen(!isQuickActionsOpen)}
                    >
                        <span className="text-lg font-semibold tracking-tight">Quick Actions</span>
                        {isQuickActionsOpen ? (
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        ) : (
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        )}
                    </Button>
                    {isQuickActionsOpen && (
                        <div className="space-y-1 animate-in slide-in-from-top-2 fade-in duration-200">
                            <Button variant="ghost" className="w-full justify-start" onClick={handleCreatePage}>
                                <Plus className="mr-2 h-4 w-4" />
                                New Page
                            </Button>
                            <Button variant="ghost" className="w-full justify-start" onClick={handleCreateLearning}>
                                <Plus className="mr-2 h-4 w-4" />
                                New Learning
                            </Button>
                            <Button variant="ghost" className="w-full justify-start" onClick={handleCreateReminder}>
                                <Plus className="mr-2 h-4 w-4" />
                                New Reminder
                            </Button>
                        </div>
                    )}
                </div>

            </div>
            <div className="p-4 border-t mt-auto">
                {!user ? (
                    <Button className="w-full" asChild>
                        <Link href="/login">Log In</Link>
                    </Button>
                ) : (
                    <div className="flex flex-col gap-2 w-full">
                        <div className="px-2 py-1.5 text-sm font-medium truncate text-muted-foreground bg-muted/50 rounded-md">
                            {user.email}
                        </div>
                        <Button variant="outline" className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50" onClick={async () => {
                            await supabase.auth.signOut()
                            router.push('/login')
                        }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-4 w-4"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" x2="9" y1="12" y2="12" /></svg>
                            Log out
                        </Button>
                    </div>
                )}
            </div>
        </div>
    )
}
