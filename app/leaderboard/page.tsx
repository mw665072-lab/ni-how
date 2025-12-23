"use client"

import { useEffect, useState, useMemo, useCallback } from 'react'
import { Crown } from "lucide-react"
import Header from "@/components/Header"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { leaderboardApi } from '@/lib/api'
import type { UnifiedLeaderboardEntry, UnifiedLeaderboardResponse } from '@/lib/types'


export default function LeaderboardPage() {
    const [entries, setEntries] = useState<UnifiedLeaderboardEntry[]>([])
    const [loading, setLoading] = useState(false)
    const [student, setStudent] = useState<UnifiedLeaderboardEntry | null>(null)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        let mounted = true
        const controller = new AbortController()

        const loadAll = async () => {
            setLoading(true)
            setError(null)

            const leaderboardPromise = leaderboardApi.getLeaderboard(100, 0, undefined, { signal: controller.signal })
            const studentPromise = leaderboardApi.getStudentLevel({ signal: controller.signal })

            try {
                const [lbResult, studentResult] = await Promise.allSettled([leaderboardPromise, studentPromise])

                if (!mounted) return

                if (lbResult.status === 'fulfilled') {
                    const resp = lbResult.value as UnifiedLeaderboardResponse
                    setEntries(resp.leaderboard ?? [])
                    // prefer the userRank from unified response if present
                    if (resp.userRank) setStudent(resp.userRank)
                } else {
                    console.error('Failed loading leaderboard', lbResult.reason)
                    setError((lbResult.reason as Error)?.message ?? 'Failed to load leaderboard')
                }

                if (studentResult.status === 'fulfilled') {
                    // student result may be null
                    const s: any = studentResult.value
                    if (s) setStudent((prev) => prev ?? s)
                } else {
                    // not fatal: we may still have userRank from leaderboard
                    console.warn('Failed loading student level', studentResult.reason)
                }
            } catch (err) {
                if (!mounted) return
                console.error('Unexpected error loading leaderboard', err)
                setError((err as Error)?.message ?? 'An unexpected error occurred')
            } finally {
                if (mounted) setLoading(false)
            }
        }

        loadAll()

        return () => {
            mounted = false
            controller.abort()
        }
    }, [])

    const retry = useCallback(() => {
        setError(null)
        setLoading(true)

        // trigger the effect by forcing a re-render: simplest approach is to call the same load logic
        // but since the effect above runs only once, just call the same helper inline here
        const controller = new AbortController()

        ;(async () => {
            try {
                const resp = await leaderboardApi.getLeaderboard(100, 0, undefined, { signal: controller.signal })
                setEntries(resp.leaderboard ?? [])
                if (resp.userRank) setStudent(resp.userRank)
            } catch (err) {
                console.error('Retry failed', err)
                setError((err as Error)?.message ?? 'Failed to load leaderboard')
            } finally {
                setLoading(false)
            }
        })()
    }, [])

    const topThree = useMemo(() => entries.slice(0, 3), [entries])
    const rest = useMemo(() => entries.slice(3), [entries])

    return (
        <div className="min-h-screen bg-gray-50 p-6" dir="rtl">
            <Header />
            <div className="mx-auto w-full">
                {/* Unified Leaderboard (no tabs) */}
                <div className="mb-6 text-center">
                    <h2 className="text-lg font-semibold">Leaderboard</h2>
                    <p className="text-sm text-gray-500">Top students by overall score</p>
                </div>

                {/* Top Three Compact Podium */}
                <div className="mb-8 flex items-end justify-center gap-10">
                    {topThree.map((winner) => {
                        const isFirst = winner.rank === 1
                        const ring = isFirst ? "ring-4 ring-brand/30" : winner.rank === 2 ? "ring-2 ring-gray-200" : "ring-2 ring-orange-200"
                        const initial = winner.username?.charAt(0).toUpperCase() || '-'

                        return (
                            <div key={winner.rank} className={`flex flex-col items-center ${isFirst ? "order-2" : winner.rank === 2 ? "order-1" : "order-3"}`}>
                                {isFirst && <Crown className="mb-2 h-8 w-8 text-yellow-400" strokeWidth={2} />}

                                <div className={`relative mb-3 ${ring}`}>
                                    <Avatar className={`h-20 w-20 bg-white text-lg font-bold ${isFirst ? "text-black" : "text-gray-800"}`}>
                                        <AvatarFallback>{initial}</AvatarFallback>
                                    </Avatar>

                                    <div className={`absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold text-white ${isFirst ? "bg-yellow-500" : winner.rank === 2 ? "bg-gray-400" : "bg-orange-500"}`}>
                                        {winner.rank}
                                    </div>
                                </div>

                                <h4 className="text-sm font-medium text-gray-900 truncate w-36 text-center">{winner.username}</h4>

                                    <div className="mt-2 flex items-center gap-2">
                                    <div className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-xs text-blue-600 font-medium">Score {Number(winner.score ?? 0).toFixed(2)}</div>
                                    <div className="text-xs text-gray-500">Topics {winner.metrics?.topicsCompleted ?? 0} • {winner.metrics?.totalSessions ?? 0} sessions</div>
                                </div>
                            </div>
                        )
                    })}
                </div>

                {/* Slim Leaderboard List */}
                <Card className="shadow-sm border border-gray-200/50">
                    <CardContent className="p-0">
                        <div className="divide-y">
                            {loading && <div className="p-4 text-center text-sm text-gray-500">Loading…</div>}
                            {error && (
                                <div className="p-4 text-center text-sm text-red-600">
                                    <div role="alert" aria-live="polite">{error}</div>
                                    <button className="mt-2 inline-flex items-center rounded bg-brand px-3 py-1 text-xs text-white" onClick={retry}>Retry</button>
                                </div>
                            )}
                            {!loading && rest.map((entry, idx) => (
                                <div
                                    key={entry.rank}
                                    className={`flex items-center justify-between gap-4 px-4 py-3 transition-colors ${(entry.userId === student?.userId) ? 'bg-brand/10' : idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-gray-100`}
                                >
                                    {/* Right: user info (avatar + name) */}
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 text-sm font-semibold text-gray-700">
                                            {entry.username?.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-medium text-gray-900 truncate">{entry.username}</span>
                                                {entry.userId === student?.userId && <span className="text-xs text-brand bg-brand/10 px-2 py-0.5 rounded">You</span>}
                                            </div>
                                            <div className="text-xs text-gray-500">ID: {entry.userId} • Rank #{entry.rank}</div>
                                        </div>
                                    </div>

                                    {/* Left: metrics */}
                                    <div className="flex items-center gap-3">
                                        <div className="flex flex-col items-end text-right">
                                            <div className="text-sm font-medium text-gray-900">{Number(entry.score ?? 0).toFixed(2)} pts</div>
                                            <div className="text-xs text-gray-500">Topics {entry.metrics?.topicsCompleted ?? 0} • {entry.metrics?.totalSessions ?? 0} sessions</div>
                                        </div>
                                        <div className="inline-flex flex-col items-center justify-center rounded-full bg-blue-50 px-3 py-1 text-xs text-blue-600 font-medium">
                                            <div>{Number(entry.metrics?.avgAttemptsPerTopic ?? 0).toFixed(1)}</div>
                                            <div className="text-[10px] text-blue-500">avg attempts</div>
                                        </div>
                                        <div className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700 font-medium">Avg time: {entry.metrics?.avgCompletionTime ?? '-'}m</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
