"use client"

import * as React from "react"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import { Sidebar } from "@/components/sidebar"
import { MobileNav } from "@/components/mobile-nav"
import { useMobile } from "@/hooks/use-mobile"

import { cn } from "@/lib/utils"

interface ShellProps {
    children: React.ReactNode
}

export function Shell({ children }: ShellProps) {
    const [isCollapsed, setIsCollapsed] = React.useState(false)
    const [mounted, setMounted] = React.useState(false)
    const isMobile = useMobile()

    React.useEffect(() => {
        setMounted(true)
    }, [])

    // Removed mounted check to reveal potential hydration errors or fix mounting issues
    // if (!mounted) {
    //     return null
    // }

    if (isMobile) {
        return (
            <div className="flex flex-col min-h-screen">
                <div className="p-4 border-b flex items-center gap-4">
                    <MobileNav />
                    <span className="font-semibold">WebNote</span>
                </div>
                <div className="flex-1 overflow-y-auto p-2 md:p-4">
                    {children}
                </div>
            </div>
        )
    }

    return (
        <ResizablePanelGroup
            direction="horizontal"
            className="min-h-screen w-full rounded-lg border"
        >
            <ResizablePanel
                defaultSize={20}
                minSize={15}
                maxSize={30}
                collapsible={true}
                onCollapse={() => setIsCollapsed(true)}
                onExpand={() => setIsCollapsed(false)}
                className={cn(isCollapsed && "min-w-[50px] transition-all duration-300 ease-in-out")}
            >
                <Sidebar className="h-full border-r-0" />
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={80}>
                <div className="h-full overflow-y-auto p-8">
                    {children}
                </div>
            </ResizablePanel>
        </ResizablePanelGroup>
    )
}
