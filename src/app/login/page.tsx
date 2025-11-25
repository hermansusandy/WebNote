"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default function LoginPage() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        if (error) {
            setError(error.message)
            setLoading(false)
        } else {
            router.push("/dashboard")
            router.refresh()
        }
    }

    const handleSignUp = async () => {
        setLoading(true)
        setError(null)
        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: email.split('@')[0]
                }
            }
        })

        if (error) {
            setError(error.message)
            setLoading(false)
        } else {
            setError("Check your email for the confirmation link (or if using local/testing, you might be auto-confirmed).")
            setLoading(false)
            // For local dev with email confirmation disabled, we might be logged in.
            // Check session
            const { data: { session } } = await supabase.auth.getSession()
            if (session) {
                router.push("/dashboard")
                router.refresh()
            }
        }
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-muted/50">
            <Card className="w-[350px]">
                <CardHeader>
                    <CardTitle>Welcome back</CardTitle>
                    <CardDescription>Enter your email to sign in to your account</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                            <Input
                                type="email"
                                placeholder="Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Input
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        {error && <p className="text-sm text-red-500">{error}</p>}
                        <div className="flex flex-col gap-2">
                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? "Loading..." : "Sign In"}
                            </Button>
                            <Button type="button" variant="outline" className="w-full" onClick={handleSignUp} disabled={loading}>
                                Sign Up
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
