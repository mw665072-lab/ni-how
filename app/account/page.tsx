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
            <div className="max-w-full mx-auto px-4 py-6">
                <h1 className={`${dir === 'rtl' ? 'text-right' : 'text-left'} text-xl font-bold mb-4`}>
                    {dir === 'rtl' ? 'الحساب' : 'Account'}
                </h1>

                <Card className="border border-slate-200 rounded-lg shadow-sm">
                    <CardContent className="p-4">
                        <div className={`flex ${dir === 'rtl' ? 'flex-row-reverse' : 'flex-row'} items-center justify-between gap-4`}>
                            {/* Left side: Avatar and user info */}
                            <div className={`flex ${dir === 'rtl' ? 'flex-row-reverse' : 'flex-row'} items-center gap-3 flex-1`}>
                                <Avatar className="h-12 w-12" aria-label={`Avatar for ${user?.username ?? user?.email ?? 'user'}`}>
                                    <AvatarFallback className="text-sm bg-[#35AB4E] text-white font-semibold">{initials}</AvatarFallback>
                                </Avatar>
                                <div className={`flex-1 ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
                                    <h2 className="text-base font-semibold">{user?.username ?? 'Guest'}</h2>
                                    <p className="text-xs text-slate-500">{user?.email ?? 'Not signed in'}</p>
                                </div>
                            </div>

                            {/* Right side: Stats and Logout */}
                            <div className={`flex ${dir === 'rtl' ? 'flex-row-reverse' : 'flex-row'} items-center gap-3`}>
                                
                                {loading && (
                                    <div className="text-xs text-slate-500 px-3">
                                        {dir === 'rtl' ? 'جاري التحميل...' : 'Loading...'}
                                    </div>
                                )}

                                <LogoutButton />
                            </div>
                        </div>

                        {error && (
                            <div className="text-xs text-red-500 mt-3">
                                {error}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}