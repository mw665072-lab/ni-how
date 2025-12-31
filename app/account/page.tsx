"use client"

import React, { useEffect, useState, useCallback } from "react"
import { useAuthProtection, useAuth } from "@/hooks/useAuthProtection"
import { useAppContext } from '@/context/AppContext'
import { useDirection } from '@/hooks/useDirection'
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import LogoutButton from "@/components/LogoutButton"
import { dashboardApi } from "@/lib/services/dashboard"
import { useToast } from '@/hooks/use-toast'
import type { DashboardOverview } from "@/lib/types"

export default function AccountPage() {
    useAuthProtection()
    const { user } = useAuth()
    const dir = useDirection('rtl')

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

            ; (async () => {
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

    const [editing, setEditing] = useState(false)
    const [nameInput, setNameInput] = useState<string>(user?.username ?? '')

    const saveName = () => {
        const trimmed = nameInput.trim()
        if (trimmed.length < 2) {
            toast({ title: 'Name too short', description: 'Please enter at least 2 characters.' })
            return
        }

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
        <div className="min-h-screen bg-white" dir={dir} lang={dir === 'rtl' ? 'ar' : 'en'}>
            <div className="max-w-full mx-auto px-2 sm:px-6">
                <h1 className={`${dir === 'rtl' ? 'text-right' : 'text-left'} font-almarai-extrabold-28 mb-8`}>مرحبًا بعودتك</h1>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="flex flex-col justify-between w-full h-auto px-4 py-6 gap-6 rounded-2xl border-2 border-slate-200 bg-white shadow-lg overflow-hidden">
                        <CardHeader>
                            <div className="flex items-center justify-between w-full">
                                <div className="flex items-center gap-4">
                                    <Avatar aria-label={`Avatar for ${user?.username ?? user?.email ?? 'user'}`}>
                                        <AvatarFallback>{initials}</AvatarFallback>
                                    </Avatar>
                                    <div className={dir === 'rtl' ? 'text-right' : 'text-left'}>
                                        <h2 className="text-lg font-medium">{user?.username ?? 'Guest'}</h2>
                                        <p className="text-sm text-muted-foreground">{user?.email ?? 'Not signed in'}</p>
                                    </div>
                                </div>
                            </div>
                        </CardHeader>

                        <CardContent>
                            <div className="flex flex-col gap-3">
                                <div className="flex flex-wrap gap-2 items-center">
                                    {editing ? (
                                        <div className="flex gap-2 items-center">
                                            <input className="input px-2 py-1 rounded border" value={nameInput} onChange={e => setNameInput(e.target.value)} />
                                            <Button size="sm" className="bg-[#35AB4E] hover:bg-[#2f9c46] text-white border-b-2" onClick={saveName}>Save</Button>
                                            <Button variant="ghost" size="sm" onClick={() => { setEditing(false); setNameInput(user?.username ?? '') }}>Cancel</Button>
                                        </div>
                                    ) : (
                                        <div />
                                    )}

                                    <LogoutButton />
                                </div>

                                <p className="text-sm text-muted-foreground">Manage your profile, change password, and sign out from here.</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}