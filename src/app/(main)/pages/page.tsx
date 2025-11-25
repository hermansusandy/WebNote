import { Button } from "@/components/ui/button"
import { Plus, FileText } from "lucide-react"

export default function PagesPage() {
    return (
        <div className="flex flex-col items-center justify-center h-[calc(100vh-8rem)] text-center space-y-4">
            <div className="p-4 rounded-full bg-muted">
                <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight">Select a page</h2>
            <p className="text-muted-foreground">
                Select a page from the sidebar or create a new one.
            </p>
            <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create New Page
            </Button>
        </div>
    )
}
