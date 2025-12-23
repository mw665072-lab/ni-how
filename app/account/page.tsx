"use client"

import React, { useEffect, useState, useCallback } from "react"
import Header from "@/components/Header"
import { useAuthProtection, useAuth } from "@/hooks/useAuthProtection"
import { useAppContext } from '@/context/AppContext'
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
// import { Progress } from "@/components/ui/progress"
import LogoutButton from "@/components/LogoutButton"
import Link from "next/link"
import { dashboardApi } from "@/lib/services/dashboard"
import { useToast } from '@/hooks/use-toast'
import type { DashboardOverview } from "@/lib/types"

export default function AccountPage() {
    useAuthProtection()
    const { user } = useAuth()

    const [overview, setOverview] = useState<DashboardOverview | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const { toast } = useToast()

    useEffect(() => {
        let mounted = true
        const controller = new AbortController()

        const load = async () => {
            setLoading(true)
            setError(null)
            try {
                const res = await dashboardApi.getOverview({ signal: controller.signal })
                if (!mounted) return
                setOverview(res)
            } catch (err) {
                if (!mounted) return
                const msg = (err as Error)?.message ?? 'Failed to load overview'
                setError(msg)
                toast({ title: 'Failed to load overview', description: msg })
            } finally {
                if (mounted) setLoading(false)
            }
        }

        load()

        return () => {
            mounted = false
            controller.abort()
        }
    }, [toast])

    const retry = useCallback(() => {
        setError(null)
        setLoading(true)

        const controller = new AbortController()

        ;(async () => {
            try {
                const res = await dashboardApi.getOverview({ signal: controller.signal })
                setOverview(res)
                setError(null)
            } catch (err) {
                const msg = (err as Error)?.message ?? 'Failed to load overview'
                setError(msg)
                toast({ title: 'Failed to load overview', description: msg })
            } finally {
                setLoading(false)
            }
        })()
    }, [toast])

    const { login: contextLogin } = useAppContext()

    const initials = (user?.username || user?.email || "User")
        .split(" ")
        .map(s => s[0]?.toUpperCase())
        .slice(0, 2)
        .join("")

    // inline edit state
    const [editing, setEditing] = useState(false)
    const [nameInput, setNameInput] = useState<string>(user?.username ?? '')

    const saveName = () => {
        const trimmed = nameInput.trim()
        if (trimmed.length < 2) {
            toast({ title: 'Name too short', description: 'Please enter at least 2 characters.' })
            return
        }

        // simple client-side only update to AppContext (could be extended to server-side)
        try {
            const updated = { ...(user ?? { email: '', id: '' }), username: trimmed }
            contextLogin(updated as any)
            setEditing(false)
            toast({ title: 'Profile updated', description: 'Your display name was updated.' })
        } catch (err) {
            const msg = (err as Error)?.message ?? 'Failed to update name'
            toast({ title: 'Update failed', description: msg })
        }
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            <main className="mx-auto p-6">
                <h1 className="text-2xl font-semibold mb-4">My Account</h1>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="flex flex-col items-start gap-4">
                        <CardHeader>
                            <div className="flex items-center gap-4">
                                <Avatar aria-label={`Avatar for ${user?.username ?? user?.email ?? 'user'}`}>
                                    <AvatarFallback>{initials}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <h2 className="text-lg font-medium">{user?.username ?? 'Guest'}</h2>
                                    <p className="text-sm text-muted-foreground">{user?.email ?? 'Not signed in'}</p>
                                </div>
                            </div>
                        </CardHeader>

                        <CardContent>
                            <div className="flex flex-col gap-3">
                                <div className="flex flex-wrap gap-2">
                                    {editing ? (
                                        <div className="flex gap-2 items-center">
                                            <input className="input px-2 py-1 rounded border" value={nameInput} onChange={e => setNameInput(e.target.value)} />
                                            <Button size="sm" onClick={saveName}>Save</Button>
                                            <Button variant="ghost" size="sm" onClick={() => { setEditing(false); setNameInput(user?.username ?? '') }}>Cancel</Button>
                                        </div>
                                    ) : (
                                        <>
                                            <Button size="sm" onClick={() => setEditing(true)}>Edit profile</Button>
                                            <Link href="/account/coming-soon">
                                                <Button variant="outline" size="sm">Change password</Button>
                                            </Link>
                                        </>
                                    )}

                                    <LogoutButton />
                                </div>

                                <p className="text-sm text-muted-foreground">Manage your profile, change password, and sign out from here.</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="md:col-span-2">
                        <CardHeader>
                            <CardTitle>Progress & stats</CardTitle>
                            <CardDescription>Overview of your learning progress</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {loading ? (
                                <div className="space-y-3">
                                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                                </div>
                            ) : error ? (
                                <div className="space-y-3 text-center text-sm text-red-600">
                                    <div role="alert" aria-live="polite">{error}</div>
                                    <div>
                                        <Button size="sm" className="mt-2" onClick={retry}>Retry</Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <div className="p-3 bg-muted rounded-md">
                                            <div className="text-sm text-muted-foreground">Level</div>
                                            <div className="text-lg font-semibold">{overview?.level ?? '-'}</div>
                                        </div>
                                        <div className="p-3 bg-muted rounded-md">
                                            <div className="text-sm text-muted-foreground">Topics completed</div>
                                            <div className="text-lg font-semibold">{overview?.topicsCompleted ?? '-'}/{overview?.totalTopics ?? '-'}</div>
                                        </div>
                                        <div className="p-3 bg-muted rounded-md">
                                            <div className="text-sm text-muted-foreground">Current streak</div>
                                            <div className="text-lg font-semibold">{overview?.currentStreak ?? '-'}</div>
                                        </div>
                                    </div>

                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="text-sm text-muted-foreground">XP Progress</div>
                                            <div className="text-sm">{overview?.xp ?? 0} XP</div>
                                        </div>
                                        {/* <Progress value={overview?.xpProgress ?? 0} /> */}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    )
}