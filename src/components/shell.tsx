"use client"

import * as React from "react"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import { Sidebar } from "@/components/sidebar"
import { cn } from "@/lib/utils"

interface ShellProps {
    children: React.ReactNode
}

export function Shell({ children }: ShellProps) {
    const [isCollapsed, setIsCollapsed] = React.useState(false)
    const [mounted, setMounted] = React.useState(false)

    React.useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return null
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
