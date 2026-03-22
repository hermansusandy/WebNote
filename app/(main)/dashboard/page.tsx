import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import Link from "next/link"

export default function DashboardPage() {
    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Today&apos;s Reminders
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">0</div>
                        <p className="text-xs text-muted-foreground">
                            0 overdue
                        </p>
                        <div className="mt-4 space-y-2">
                            <p className="text-sm text-muted-foreground">No reminders for today.</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Learning Priorities
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">0</div>
                        <p className="text-xs text-muted-foreground">
                            Active topics
                        </p>
                        <div className="mt-4 space-y-2">
                            <p className="text-sm text-muted-foreground">No active learning topics.</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Recent Pages
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">No recent pages.</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
