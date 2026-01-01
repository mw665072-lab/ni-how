"use client"

import { useEffect, useState, useMemo, useCallback } from 'react'

import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { leaderboardApi } from '@/lib/api'
import type { UnifiedLeaderboardEntry, UnifiedLeaderboardResponse } from '@/lib/types'
import { useAppContext } from '@/context/AppContext'

export default function LeaderboardPage() {
    const { dir } = useAppContext()
    const isRtl = dir == 'rtl'

    const [entries, setEntries] = useState<UnifiedLeaderboardEntry[]>([])
    const [loading, setLoading] = useState(false)
    const [student, setStudent] = useState<UnifiedLeaderboardEntry | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [selectedTab, setSelectedTab] = useState<'weekly' | 'monthly' | 'all'>('weekly')

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
                    if (resp.userRank) setStudent(resp.userRank)
                } else {
                    console.error('Failed loading leaderboard', lbResult.reason)
                    setError((lbResult.reason as Error)?.message ?? 'Failed to load leaderboard')
                }

                if (studentResult.status === 'fulfilled') {
                    const s: any = studentResult.value
                    if (s) setStudent((prev) => prev ?? s)
                } else {
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
        const controller = new AbortController()

            ; (async () => {
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
        <div className="min-h-screen bg-white" dir='rtl'>
            <div className="mx-auto w-full max-w-full px-3 sm:px-6 py-4 sm:py-6">
                {/* Tabs */}
                <div className="flex gap-2 justify-start mb-4 sm:mb-6">
                    <button
                        type="button"
                        onClick={() => setSelectedTab('all')}
                        className={`flex-1 sm:flex-none px-4 sm:px-6 py-2 rounded-full text-xs sm:text-sm font-medium transition-all ${selectedTab === 'all'
                                ? 'bg-[#35AB4E] text-white border-b-2 border-[#20672F]'
                                : 'bg-[#E5E5E5] text-gray-700'
                            }`}
                    >
                        شهري
                    </button>
                    <button
                        type="button"
                        onClick={() => setSelectedTab('monthly')}
                        className={`flex-1 sm:flex-none px-4 sm:px-6 py-2 rounded-full text-xs sm:text-sm font-medium transition-all ${selectedTab === 'monthly'
                                ? 'bg-[#35AB4E] text-white border-b-2 border-[#20672F]'
                                : 'bg-[#E5E5E5] text-gray-700'
                            }`}
                    >
                        سنوي
                    </button>
                    <button
                        type="button"
                        onClick={() => setSelectedTab('weekly')}
                        className={`flex-1 sm:flex-none px-4 sm:px-6 py-2 rounded-full text-xs sm:text-sm font-medium transition-all ${selectedTab === 'weekly'
                                ? 'bg-[#35AB4E] text-white border-b-2 border-[#20672F]'
                                : 'bg-[#E5E5E5] text-gray-700'
                            }`}
                    >
                        أسبوعي
                    </button>
                </div>

                {/* Top 3 Students Card */}
                <Card className="mb-4 sm:mb-6 border-2 border-slate-200 rounded-2xl shadow-sm">
                    <CardContent className="p-4 sm:p-8">
                        <h2 className="text-base sm:text-xl font-bold text-gray-800 mb-4 sm:mb-6 text-right">أفضل 3 طلاب</h2>

                        <div className="flex items-end justify-center gap-3 sm:gap-8 max-w-3xl mx-auto">
                            {topThree.length >= 3 && (
                                <>
                                    {/* 2nd Place */}
                                    <div className="flex flex-col items-center flex-1">
                                        <div className="relative mb-2 sm:mb-3">
                                            <Avatar className="h-14 w-14 sm:h-20 sm:w-20 bg-gradient-to-br from-gray-100 to-gray-200 border-2 sm:border-4 border-gray-300">
                                                <AvatarFallback className="text-xl sm:text-3xl font-bold text-gray-700">
                                                    {topThree[1]?.username?.charAt(0).toUpperCase() || 'ف'}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="absolute -top-1 sm:-top-2 -right-1 sm:-right-2 flex h-5 w-5 sm:h-7 sm:w-7 items-center justify-center rounded-full bg-gray-400 text-xs sm:text-sm font-bold text-white shadow-md">
                                                2
                                            </div>
                                        </div>
                                        <h4 className="text-xs sm:text-base font-bold text-gray-800 mb-0.5 sm:mb-1 truncate max-w-full text-center">{topThree[1]?.username || 'فاطمة علي'}</h4>
                                        <p className="text-[10px] sm:text-xs text-gray-500 mb-0.5 sm:mb-1">متوسط</p>
                                        <p className="text-xs sm:text-sm font-medium text-gray-700">{topThree[1]?.metrics?.topicsCompleted || 24} موضوع</p>
                                    </div>

                                    {/* 1st Place */}
                                    <div className="flex flex-col items-center flex-1 -mt-2 sm:-mt-4">
                                        <div className="relative mb-2 sm:mb-3">
                                            <Avatar className="h-16 w-16 sm:h-24 sm:w-24 bg-gradient-to-br from-yellow-100 to-yellow-200 border-2 sm:border-4 border-yellow-400">
                                                <AvatarFallback className="text-2xl sm:text-4xl font-bold text-yellow-700">
                                                    {topThree[0]?.username?.charAt(0).toUpperCase() || 'م'}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="absolute -top-1 sm:-top-2 -right-1 sm:-right-2 flex h-6 w-6 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-yellow-500 text-xs sm:text-base font-bold text-white shadow-md">
                                                1
                                            </div>
                                        </div>
                                        <h4 className="text-sm sm:text-lg font-bold text-gray-800 mb-0.5 sm:mb-1 truncate max-w-full text-center">{topThree[0]?.username || 'محمد حسين'}</h4>
                                        <p className="text-[10px] sm:text-xs text-yellow-600 mb-0.5 sm:mb-1">متقدم</p>
                                        <p className="text-xs sm:text-base font-semibold text-gray-800">{topThree[0]?.metrics?.topicsCompleted || 22} موضوع</p>
                                    </div>

                                    {/* 3rd Place */}
                                    <div className="flex flex-col items-center flex-1">
                                        <div className="relative mb-2 sm:mb-3">
                                            <Avatar className="h-14 w-14 sm:h-20 sm:w-20 bg-gradient-to-br from-orange-100 to-orange-200 border-2 sm:border-4 border-orange-300">
                                                <AvatarFallback className="text-xl sm:text-3xl font-bold text-orange-700">
                                                    {topThree[2]?.username?.charAt(0).toUpperCase() || 'أ'}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="absolute -top-1 sm:-top-2 -right-1 sm:-right-2 flex h-5 w-5 sm:h-7 sm:w-7 items-center justify-center rounded-full bg-orange-500 text-xs sm:text-sm font-bold text-white shadow-md">
                                                3
                                            </div>
                                        </div>
                                        <h4 className="text-xs sm:text-base font-bold text-gray-800 mb-0.5 sm:mb-1 truncate max-w-full text-center">{topThree[2]?.username || 'أحمد محمد'}</h4>
                                        <p className="text-[10px] sm:text-xs text-gray-500 mb-0.5 sm:mb-1">مبتدئ</p>
                                        <p className="text-xs sm:text-sm font-medium text-gray-700">{topThree[2]?.metrics?.topicsCompleted || 28} موضوع</p>
                                    </div>
                                </>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* All Students Card */}
                <Card className="border-2 border-slate-200 rounded-2xl shadow-sm">
                    <CardContent className="p-4 sm:p-8">
                        <h2 className="text-base sm:text-xl font-bold text-gray-800 mb-4 sm:mb-6 text-right">جميع الطلاب</h2>

                        <div className="space-y-3">
                            {loading && (
                                <div className="p-8 text-center text-sm text-gray-500">جاري التحميل...</div>
                            )}
                            {error && (
                                <div className="p-6 text-center">
                                    <div className="text-sm text-red-600 mb-3">{error}</div>
                                    <button
                                        className="px-4 py-2 bg-[#35AB4E] text-white rounded-lg hover:bg-[#2f9c46] transition-colors"
                                        onClick={retry}
                                    >
                                        إعادة المحاولة
                                    </button>
                                </div>
                            )}
                            {!loading && !error && rest.map((entry, idx) => {
                                const isCurrentUser = entry.userId === student?.userId
                                const displayRank = entry.rank || (idx + 4)

                                return (
                                    <div
                                        key={entry.rank || idx}
                                        className={`flex items-center justify-between py-3 px-4 rounded-lg ${isCurrentUser ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'
                                            }`}
                                    >
                                        <div className="flex items-center gap-4 flex-1">
                                           <div className="flex flex-col items-end">
                                            <span className="text-base font-bold text-gray-800">
                                                {entry.metrics?.topicsCompleted || 0} موضوع
                                            </span>
                                            <span className="text-xs text-gray-500">
                                                {entry.metrics?.totalSessions || 20} جلسة
                                            </span>
                                        </div>
                                            <div className="flex flex-col text-right">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-base font-bold text-gray-800">
                                                        {entry.username || '-'}
                                                    </span>
                                                    {isCurrentUser && (
                                                        <span className="text-xs text-blue-600 bg-blue-100 px-2 py-0.5 rounded-md font-medium">
                                                            أنت
                                                        </span>
                                                    )}
                                                </div>
                                                <span className="text-xs text-blue-500">
                                                    {entry.metrics?.avgCompletionTime ? `${entry.metrics.avgCompletionTime} دقيقة` : 'متوسط'}
                                                </span>
                                            </div>
                                        </div>
                                           <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white border-2 border-gray-200 text-sm font-bold text-gray-700">
                                                {displayRank}
                                            </div>
                                      
                                    </div>
                                )
                            })}
                            {!loading && !error && rest.length === 0 && entries.length <= 3 && (
                                <div className="p-8 text-center text-sm text-gray-500">
                                    لا يوجد المزيد من الطلاب
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}