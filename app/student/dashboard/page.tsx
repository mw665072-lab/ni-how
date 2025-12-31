"use client"
import DashboardCard from "@/components/dashboard/card"
import { ChevronRight } from "lucide-react"
import { useState, useEffect } from "react"
import Image from "next/image"
import ArabicStatsChart from "@/components/dashboard/charts"
import { dashboardApi } from "@/lib/services/dashboard"
import type { DashboardOverview, TopicProgress, DailyMetricsResponse, WeeklyMetricsResponse, MonthlyMetricsResponse } from "@/lib/types"

export default function Page() {
    const [overview, setOverview] = useState<DashboardOverview | null>(null)
    const [topicProgress, setTopicProgress] = useState<TopicProgress[]>([])
    const [dailyMetrics, setDailyMetrics] = useState<DailyMetricsResponse | null>(null)
    const [weeklyMetrics, setWeeklyMetrics] = useState<WeeklyMetricsResponse | null>(null)
    const [monthlyMetrics, setMonthlyMetrics] = useState<MonthlyMetricsResponse | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [active, setActive] = useState('daily')

    const tabs = [
        { key: 'daily', label: 'يومي' },
        { key: 'weekly', label: 'أسبوعي' },
        { key: 'monthly', label: 'شهري' },
    ]

    useEffect(() => {
        async function fetchDashboardData() {
            try {
                setLoading(true)
                setError(null)

                const [overviewData, progressData, dailyData, weeklyData, monthlyData] = await Promise.all([
                    dashboardApi.getOverview(),
                    dashboardApi.getTopicProgress(),
                    dashboardApi.getDaily(),
                    dashboardApi.getWeekly(),
                    dashboardApi.getMonthly(),
                ])

                setOverview(overviewData)
                setTopicProgress(progressData.topics)
                setDailyMetrics(dailyData)
                setWeeklyMetrics(weeklyData)
                setMonthlyMetrics(monthlyData)

                // Sync username to localStorage so other pages have the latest
                if (overviewData.userName) {
                    localStorage.setItem('userName', overviewData.userName)
                }
            } catch (err) {
                console.error('Failed to fetch dashboard data:', err)
                setError('Failed to load dashboard data')
            } finally {
                setLoading(false)
            }
        }

        fetchDashboardData()
    }, [])

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center" dir="rtl">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#35AB4E] mx-auto mb-4"></div>
                    <p className="text-slate-600">جاري التحميل...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center" dir="rtl">
                <div className="text-center">
                    <p className="text-red-600 mb-4">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-[#35AB4E] text-white rounded-lg"
                    >
                        إعادة المحاولة
                    </button>
                </div>
            </div>
        )
    }

    // Use real data or fallback to defaults
    const userName = overview?.userName || 'الطالب'
    const currentStreak = overview?.currentStreak || 0
    const longestStreak = overview?.longestStreak || 0

    return (
        <div className="min-h-screen bg-white" dir="rtl">
            <div className="max-w-full mx-auto px-2 sm:px-6">
                <h1 className="text-right font-almarai-extrabold-28 mb-8 hidden sm:block">مرحبًا بعودتك يا {userName}</h1>
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 mb-8 items-stretch">
                    <div className="flex flex-col w-full col-span-2 sm:col-span-2 lg:col-span-1 h-auto sm:h-64 md:h-72 lg:h-80 px-4 py-6 gap-6 rounded-2xl border-2 border-slate-200 bg-white shadow-lg overflow-hidden">
                        <div className="text-right flex md:flex-row flex-col flex-shrink-0 justify-between items-center w-full">
                            <div>
                                <h4 className="font-almarai-extrabold mb-4">المقاييس الرئيسية</h4>
                            </div>
                            <div className="flex flex-wrap gap-2.5">
                                {tabs.map((tab) => (
                                    <button
                                        key={tab.key}
                                        onClick={() => setActive(tab.key)}
                                        aria-pressed={active === tab.key}
                                        className={`h-8 pt-[6px] pr-[12px] pb-[6px] pl-[12px] rounded-full text-sm transition ${active === tab.key ? 'text-white' : 'text-slate-700'}`}
                                        style={{
                                            backgroundColor: active === tab.key ? '#35AB4E' : '#E5E5E5',
                                            borderBottom: active === tab.key ? '2px solid #20672F' : 'none',
                                            transform: 'rotate(0deg)',
                                            opacity: 1,
                                        }}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>

                        </div>
                        {/* Map daily metrics to chart data */}
                        {(() => {
                            const currentMetrics =
                                active === 'monthly' ? monthlyMetrics :
                                    active === 'weekly' ? weeklyMetrics :
                                        dailyMetrics;

                            const chartData = [
                                {
                                    name: 'النطق',
                                    value: currentMetrics?.averages?.pronunciationScore || 0,
                                    color: '#FF9800',
                                    label: `${Math.round(currentMetrics?.averages?.pronunciationScore || 0)}%`
                                },
                                {
                                    name: 'الطلاقة',
                                    value: currentMetrics?.averages?.fluencyScore || 0,
                                    color: '#D05872',
                                    label: `${Math.round(currentMetrics?.averages?.fluencyScore || 0)}%`
                                },
                                {
                                    name: 'الدقة',
                                    value: currentMetrics?.averages?.accuracyScore || 0,
                                    color: '#8BD9B7',
                                    label: `${Math.round(currentMetrics?.averages?.accuracyScore || 0)}%`
                                }
                            ];
                            return <ArabicStatsChart data={chartData} />;
                        })()}


                    </div>
                    <div className="relative flex flex-col items-center justify-center text-center w-full h-[155px] sm:h-64 md:h-72 lg:h-80 py-4 gap-4 rounded-[16px] border-2 border-transparent bg-[#FFF5CE] shadow-sm">
                        <Image src="/images/fire.png" alt="decor" width={56} height={56} className="absolute right-2 sm:left-4 top-1/2 -translate-y-1/2 opacity-50 sm:opacity-100" />
                        <div className="relative z-10">
                            <p className="text-sm sm:text-base font-bold mb-1"> الخط الحالي</p>
                            <h3 className="text-4xl sm:text-5xl font-extrabold mb-1">{currentStreak}</h3>
                            <p className="text-sm sm:text-base">أيام</p>
                        </div>
                    </div>

                    <div className="relative flex flex-col items-center justify-center text-center w-full h-[155px] sm:h-64 md:h-72 lg:h-80 py-4 gap-3 rounded-[16px] border-2 border-transparent bg-[#FBD4D3] shadow-sm">
                        <Image src="/images/start.png" alt="decor" width={56} height={56} className="absolute right-2 sm:left-2 top-1/2 -translate-y-1/2 opacity-50 sm:opacity-100" />
                        <div className="relative z-10">
                            <p className="text-sm sm:text-base font-bold mb-1">أطول خط</p>
                            <h3 className="text-4xl sm:text-5xl font-extrabold mb-1">{longestStreak}</h3>
                            <p className="text-sm sm:text-base">أيام</p>
                        </div>
                    </div>
                </div>

                <div className="bg-transparent sm:bg-white sm:shadow-sm h-auto py-[10px] px-0 sm:px-[16px] gap-[12px] rounded-[13px] overflow-y-auto sm:border-2 sm:border-[#E5E5E5] flex flex-col justify-start">
                    <h2 className="text-right text-xl sm:text-2xl font-bold text-slate-900 mb-6 px-2">تقدم المحاضرات</h2>

                    <div className="space-y-4">
                        {topicProgress.length === 0 ? (
                            <div className="text-center py-8 text-slate-500">
                                لا توجد مواضيع متاحة حاليًا
                            </div>
                        ) : (
                            topicProgress.slice(0, 10).map((topic) => (
                                <div key={topic.id} className="bg-white shadow-sm h-auto py-5 px-4 rounded-[13px] border-2 border-[#E5E5E5] flex flex-col gap-4">
                                    <div className="flex flex-row items-center justify-between">
                                        <div className="text-right">
                                            <p className="text-lg font-bold text-[#4B4B4B]">{topic.name}</p>
                                            <p className="text-sm text-slate-500 flex items-center gap-1">
                                                <span>{topic.completedScenarios} من {topic.totalScenarios} درس</span>
                                                <Image src="/images/Frame.svg" alt="Check" width={14} height={14} className="inline-block" />
                                            </p>
                                        </div>
                                        <div className="flex items-center">
                                            <span className="text-xl font-bold text-[#FF9800]">%{topic.percentage}</span>
                                        </div>
                                    </div>

                                    <div className="w-full bg-slate-100 rounded-full h-3.5 overflow-hidden">
                                        <div
                                            className="bg-[#FF9800] h-full rounded-full transition-all duration-300 shadow-[0_0_8px_rgba(255,152,0,0.4)]"
                                            style={{ width: `${topic.percentage}%` }}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="flex gap-1.5">
                                            {[...Array(topic.totalScenarios)].map((_, i) => (
                                                <div
                                                    key={i}
                                                    className={`w-2 h-2 rounded-full transition-colors ${i < topic.completedScenarios ? "bg-[#35AB4E]" : "bg-slate-200"
                                                        }`}
                                                />
                                            ))}
                                        </div>
                                        <button className="h-10 px-4 bg-[#35AB4E] hover:bg-[#2f9c46] text-white text-sm font-bold rounded-lg border-b-2 border-[#20672F] flex items-center gap-2 transition active:translate-y-[1px] active:border-b-0">
                                            <ChevronRight className="w-4 h-4 ml-[-4px]" />
                                            متابعة
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
