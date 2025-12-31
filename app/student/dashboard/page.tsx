"use client"
import DashboardCard from "@/components/dashboard/card"
import { ChevronRight } from "lucide-react"
import { useState, useEffect } from "react"
import Image from "next/image"
import ArabicStatsChart from "@/components/dashboard/charts"
import { dashboardApi } from "@/lib/services/dashboard"
import type { DashboardOverview, TopicProgress } from "@/lib/types"

export default function Page() {
    const [active, setActive] = useState('test')
    const [overview, setOverview] = useState<DashboardOverview | null>(null)
    const [topicProgress, setTopicProgress] = useState<TopicProgress[]>([])
    const [dailyMetrics, setDailyMetrics] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const tabs = [
        { key: 'test', label: 'اختبرني' },
        { key: 'monthly', label: 'شهري' },
        { key: 'monthly2', label: 'شهري' },
    ]

    useEffect(() => {
        async function fetchDashboardData() {
            try {
                setLoading(true)
                setError(null)

                const [overviewData, progressData, metricsData] = await Promise.all([
                    dashboardApi.getOverview(),
                    dashboardApi.getTopicProgress(),
                    dashboardApi.getDaily(),
                ])

                setOverview(overviewData)
                setTopicProgress(progressData.topics)
                setDailyMetrics(metricsData)
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
                <h1 className="text-right font-almarai-extrabold-28 mb-8">مرحبًا بعودتك يا {userName}</h1>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 mb-8 items-stretch">
                    <div className="flex flex-col  w-full sm:col-span-2 lg:col-span-1 h-auto sm:h-64 md:h-72 lg:h-80 px-4 py-6 gap-6 rounded-2xl border-2 border-slate-200 bg-white shadow-lg overflow-hidden">
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
                                        className={`h-8 pt-[6px] pr-[12px] pb-[6px] pl-[12px] rounded-[8px] text-sm transition ${active === tab.key ? 'text-white' : 'text-slate-700'}`}
                                        style={{
                                            backgroundColor: active === tab.key ? '#35AB4E' : '#E5E5E5',
                                            borderBottomWidth: '1.6px',
                                            borderBottomColor: active === tab.key ? '#20672F' : 'transparent',
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
                            const chartData = [
                                {
                                    name: 'النطق',
                                    value: dailyMetrics?.averages?.pronunciationScore || 0,
                                    color: '#FF9800',
                                    label: `${Math.round(dailyMetrics?.averages?.pronunciationScore || 0)}%`
                                },
                                {
                                    name: 'الطلاقة',
                                    value: dailyMetrics?.averages?.fluencyScore || 0,
                                    color: '#D05872',
                                    label: `${Math.round(dailyMetrics?.averages?.fluencyScore || 0)}%`
                                },
                                {
                                    name: 'الدقة',
                                    value: dailyMetrics?.averages?.accuracyScore || 0,
                                    color: '#8BD9B7',
                                    label: `${Math.round(dailyMetrics?.averages?.accuracyScore || 0)}%`
                                }
                            ];
                            return <ArabicStatsChart data={chartData} />;
                        })()}


                    </div>
                    <div className="relative flex flex-col items-center justify-center text-center w-full h-56 sm:h-64 md:h-72 lg:h-80 py-4 gap-4 rounded-[16px] border-2 border-transparent bg-[#FFF5CE] shadow-[0_2px_8px_0_rgba(0,0,0,0.102)]">
                        <Image src="/images/fire.png" alt="decor" width={56} height={56} className="absolute left-4 top-1/2 -translate-y-1/2" />
                        <DashboardCard title=" الخط الحالي" days={currentStreak} unit="أيام" />
                    </div>

                    <div className="relative flex flex-col items-center justify-center text-center w-full h-56 sm:h-64 md:h-72 lg:h-80 py-4 gap-3 rounded-[16px] border-2 border-[rgba(202,73,90,0.102)] bg-[#FBD4D3]">
                        <Image src="/images/start.png" alt="decor" width={56} height={56} className="absolute left-2 top-1/2 -translate-y-1/2" />
                        <DashboardCard title="اجمل خط" days={longestStreak} unit="أيام" />
                    </div>


                </div>

                <div className="bg-white shadow-sm h-[calc(100vh-171px)] py-[10px] px-[16px] gap-[12px] rotate-0 opacity-100 rounded-[13px] overflow-y-auto border-2 border-[#E5E5E5] flex flex-col justify-center">
                    <h2 className="text-right text-xl sm:text-2xl font-bold text-slate-900 mb-8">تقدم المحاضرات</h2>

                    <div className="space-y-3 sm:space-y-4">
                        {topicProgress.length === 0 ? (
                            <div className="text-center py-8 text-slate-500">
                                لا توجد مواضيع متاحة حاليًا
                            </div>
                        ) : (
                            topicProgress.slice(0, 10).map((topic) => (
                                <div key={topic.id} className="bg-white shadow-sm h-[171px] py-[17px] px-[16px] gap-[12px] rotate-0 opacity-100 rounded-[13px] border-2 border-[#E5E5E5] flex flex-col justify-center">
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">

                                        <div className="text-right">
                                            <p className="text-[14px] leading-[20px] font-normal" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, fontStyle: 'normal', color: '#4B4B4B' }}>{topic.name}</p>
                                            <p className="text-[14px] leading-[20px] font-normal flex items-center gap-1" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, fontStyle: 'normal', color: '#4B4B4B' }}>
                                                <span>{topic.completedScenarios} من {topic.totalScenarios} سيناريو</span>

                                                <Image src="/images/Frame.svg" alt="Continue Icon" width={16} height={16} />

                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2 sm:gap-3">
                                            <span className="text-sm sm:text-base font-bold text-amber-500">{topic.percentage}%</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <div className="flex-1 bg-slate-200 rounded-full h-2 sm:h-2.5 overflow-hidden">
                                            <div
                                                className="bg-amber-400 h-full rounded-full transition-all duration-300"
                                                style={{ width: `${topic.percentage}%` }}
                                            />
                                        </div>



                                    </div>
                                    <div className="flex items-center justify-between gap-2 sm:gap-3">

                                        <div className="flex gap-1 sm:gap-1.5 ml-2 sm:ml-4">
                                            {[...Array(topic.totalScenarios)].map((_, i) => (
                                                <div
                                                    key={i}
                                                    className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full transition-colors ${i < topic.completedScenarios ? "bg-green-600" : "bg-slate-300"
                                                        }`}
                                                />
                                            ))}
                                        </div>
                                        <button className="h-9 px-[11px] py-[7px] gap-[10px] bg-[#35AB4E] hover:bg-[#2f9c46] text-white text-sm rounded-lg border-b-2 flex items-center transition">
                                            <ChevronRight className="w-4 h-4" />
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
