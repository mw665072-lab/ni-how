"use client"

import { useEffect, useState, useMemo, useCallback } from 'react'

import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { leaderboardApi } from '@/lib/api'
import type { UnifiedLeaderboardEntry, UnifiedLeaderboardResponse } from '@/lib/types'
import { useAppContext } from '@/context/AppContext'

export default function LeaderboardPage() {
    const { dir } = useAppContext()
    console.log('dir from context:', dir)
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
        <div className="min-h-screen" >
            <div className="mx-auto w-full max-w-full mb-8 px-4 sm:px-4 lg:px-2">
                <div className={`flex gap-2.5 w-full ${isRtl ? '' : 'justify-center md:justify-start'} mb-6`}>
                    <button
                        type="button"
                        onClick={() => setSelectedTab('weekly')}
                        aria-pressed={selectedTab === 'weekly'}
                        className={`flex-1 min-w-0 h-10 px-3 flex items-center justify-center rounded-[8px] text-sm font-medium shadow-sm transition-colors md:flex-none md:rounded-lg md:h-10 md:px-3 md:w-auto md:border-b-[1.6px] ${selectedTab === 'weekly' ? 'bg-[#35AB4E] text-white md:border-b-[#20672F] hover:bg-[#16A34A]' : 'bg-[#E5E5E5] text-gray-700 md:border-b-transparent hover:bg-[#d9d9d9]'}`}>
                        أسبوعي
                    </button>
                    <button
                        type="button"
                        onClick={() => setSelectedTab('monthly')}
                        aria-pressed={selectedTab === 'monthly'}
                        className={`flex-1 min-w-0 h-10 px-3 flex items-center justify-center rounded-[8px] text-sm font-medium shadow-sm transition-colors md:flex-none md:rounded-lg md:h-10 md:px-3 md:w-auto md:border-b-[1.6px] ${selectedTab === 'monthly' ? 'bg-[#35AB4E] text-white md:border-b-[#20672F] hover:bg-[#16A34A]' : 'bg-[#E5E5E5] text-gray-700 md:border-b-transparent hover:bg-[#d9d9d9]'}`}>
                        شهري
                    </button>
                    <button
                        type="button"
                        onClick={() => setSelectedTab('all')}
                        aria-pressed={selectedTab === 'all'}
                        className={`flex-1 min-w-0 h-10 px-3 flex items-center justify-center rounded-[8px] text-sm font-medium shadow-sm transition-colors md:flex-none md:rounded-lg md:h-10 md:px-3 md:w-auto md:border-b-[1.6px] ${selectedTab === 'all' ? 'bg-[#35AB4E] text-white md:border-b-[#20672F] hover:bg-[#16A34A]' : 'bg-[#E5E5E5] text-gray-700 md:border-b-transparent hover:bg-[#d9d9d9]'}`}>
                        الكل
                    </button>
                </div>

                <div className=' py-6 px-4 rounded-lg border border-[#E5E5E5] bg-white shadow-sm'>
                    <div className={`mb-8 ${isRtl ? '' : 'text-start'}`}>
                        <h1 className={`text-2xl md:text-3xl font-bold text-gray-900 ${isRtl ? '' : 'text-start'}`}>أفضل 3 طلاب</h1>
                    </div>

                    <div className={`mb-8 flex items-end justify-center gap-4 ${isRtl ? 'flex-row-reverse' : 'flex-row'}`}>
                        {topThree.length >= 3 && (() => {
                            const ordered = [topThree[0], topThree[1], topThree[2]]

                            const TopStudentCard = ({ entry, position }: { entry: UnifiedLeaderboardEntry | undefined, position: 1 | 2 | 3 }) => {
                                const nameClass = 'text-[16px] sm:text-[16px] font-extrabold leading-[20px] tracking-[0%] text-[#4B4B4B] text-center'
                                if (!entry) return (
                                    <div className="flex-1 flex items-end justify-center">
                                        <div className="w-full max-w-[220px] sm:max-w-[240px]">
                                            <div className="flex flex-col items-center">
                                                <div className="relative mb-2">
                                                    <div className="h-16 w-16 rounded-[26843500px] bg-gray-100 opacity-100 transform-none" />
                                                </div>
                                                <h4 className={`${nameClass} mb-1 truncate`}>-</h4>
                                                <div className="text-xs text-gray-500 mb-2">-</div>
                                                <div className="text-sm font-medium text-gray-900">- موضوع</div>
                                            </div>
                                        </div>
                                    </div>
                                )

                                const isCenter = position === 2
                                const topicsClass = isCenter ? 'text-base font-semibold' : 'text-sm font-medium'
                                const timeClass = position === 2 ? 'text-xs text-yellow-600' : 'text-xs text-gray-500'

                                const avatarBg = position === 1 ? 'from-yellow-100 to-yellow-200 border-[#FFD700] text-yellow-700' : position === 2 ? 'from-gray-100 to-gray-200 border-[#C0C0C0] text-gray-700' : 'from-orange-100 to-orange-200 border-[#CD7F32] text-orange-700'
                                const badgeBg = position === 1 ? 'bg-yellow-500' : position === 2 ? 'bg-gray-400' : 'bg-orange-500'

                                const maxW = isCenter ? 'max-w-[260px] sm:max-w-[300px]' : 'max-w-[220px] sm:max-w-[240px]'

                                return (
                                    <div className="flex-1 flex items-end justify-center">
                                        <div className={`w-full ${maxW}`}>
                                            <div className="flex flex-col items-center">
                                                <div className="relative mb-2">
                                                    <Avatar className={`h-16 w-16 rounded-[26843500px] opacity-100 transform-none bg-gradient-to-br ${avatarBg} border-4`}>
                                                        <AvatarFallback className={`text-2xl sm:text-3xl font-bold ${position === 1 ? 'text-yellow-700' : position === 2 ? 'text-gray-700' : 'text-orange-700'}`}>
                                                            {entry.username?.charAt(0).toUpperCase() || (position === 1 ? 'أ' : position === 2 ? 'ف' : 'م')}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className={`absolute -top-2 end-2 flex h-8 w-8 items-center justify-center rounded-full ${badgeBg} text-sm font-bold text-white shadow-md`}>{position}</div>
                                                </div>
                                                <h4 className={`${nameClass} mb-1 truncate`}>{entry.username}</h4>
                                                <div className={`${timeClass} mb-2`}>{entry.metrics?.avgCompletionTime ? `${entry.metrics.avgCompletionTime}m` : (position === 1 ? 'متقدم' : 'متوسط')}</div>
                                                <div className={`${topicsClass} text-gray-900`}>{entry.metrics?.topicsCompleted || (position === 1 ? 28 : position === 2 ? 24 : 22)} موضوع</div>
                                            </div>
                                        </div>
                                    </div>
                                )
                            }

                            return (
                                <div className={`flex items-end justify-center gap-6 w-full max-w-4xl ${isRtl ? 'flex-row-reverse' : 'flex-row'}`}>
                                    {ordered.map((e, i) => (
                                        <TopStudentCard key={e?.userId ?? i} entry={e} position={(i + 1) as 1 | 2 | 3} />
                                    ))}
                                </div>
                            )
                        })()}

                    </div>
                </div>



                <div className='py-6'>
                    <Card className="overflow-hidden rounded-lg  border border-[#E5E5E5] bg-white shadow-[0px_2px_8px_0px_rgba(0,0,0,0.102)]">
                        <CardContent className="py-8 px-4 sm:py-10 sm:px-6">
                            <div className={`mb-8 ${isRtl ? '' : 'text-start'}`}>
                                <h2 className={`text-2xl font-bold text-gray-900 ${isRtl ? '' : 'text-start'}`}>جميع الطلاب</h2>
                            </div>
                            <div className="divide-y divide-gray-100">
                                {loading && (
                                    <div className="p-8 text-center text-sm text-gray-500">جاري التحميل...</div>
                                )}
                                {error && (
                                    <div className="p-6 text-center">
                                        <div className="text-sm text-red-600 mb-3" role="alert" aria-live="polite">{error}</div>
                                        <button
                                            className="inline-flex items-center rounded-lg bg-[#22C55E] px-4 py-2 text-sm font-medium text-white hover:bg-[#16A34A] transition-colors"
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
                                            className={`flex items-center my-3 justify-between ${isRtl ? 'flex-row-reverse' : 'flex-row'} gap-4 py-3 px-3 ${isCurrentUser ? 'bg-[#F8F9FA] border border-[#E5E5E5] rounded-md' : 'bg-white'}`}
                                        >

                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-sm font-semibold text-gray-600 flex-shrink-0">
                                                    {displayRank}
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-6 md:gap-16 w-full">
                                                <div className={`flex flex-col ${isRtl ? 'items-end' : 'items-start'}`}>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm font-semibold text-gray-900">
                                                            {entry.username || `Student ${displayRank}`}
                                                        </span>
                                                        {isCurrentUser && (
                                                            <span className="text-xs text-blue-600 bg-blue-100 px-2 py-0.5 rounded-md font-medium">
                                                                أنت
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="text-xs text-blue-500">
                                                        {entry.metrics?.avgCompletionTime ? `${entry.metrics.avgCompletionTime}m` : 'متوسط'}
                                                    </div>
                                                </div>
                                                <div className={`flex flex-col ${isRtl ? 'items-start' : 'items-end'}`}>
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {Number(entry.metrics?.topicsCompleted || 0)} موضوع
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        {entry.metrics?.totalSessions || 0} جلسة
                                                    </div>
                                                </div>
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
        </div>
    )
}