"use client";

import Header from "@/components/Header";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useEffect, useState, useRef } from "react";
import { sessionsApi } from '@/lib/api'
import { apiClient } from '@/lib/http'
import { useRouter } from "next/navigation";
import { Play, Pause, Volume2 } from "lucide-react";
import { useAuthProtection } from "@/hooks/useAuthProtection";

interface SessionFeedback {
  sessionId: string;
  username: string;
  overallScore: number;
  totalScenarios: number;
  completedCount: number;
  comprehensiveFeedback: string; // AI text
  feedbackAudioUrl?: string;
  strengths: {
    averagePronunciation: string | number;
    averageAccuracy: string | number;
    averageFluency: string | number;
    consistency: string | number;
  };
  improvements: {
    lowestScore?: string | number;
    highestScore?: string | number;
    improvementPotential?: string | number;
    areasNeedingWork?: string;
  };
  overallAssessment?: string;
  attempts: Array<{
    id?: string;
    scenarioId?: number;
    scenarioNumber?: number;
    audioUrl?: string;
    audioFeedbackUrl?: string;
    textualFeedback?: string;
    pronunciationScore?: number;
    accuracyScore?: number;
    fluencyScore?: number;
    completenessScore?: number;
    totalScore?: number;
  }>;
}

export default function FeedbackPage() {
  useAuthProtection();

  // Normalize different shapes (session object vs. feedback object) into a stable SessionFeedback
  const normalizeSessionToFeedback = (sessionObj: any): SessionFeedback => {
    const fb = sessionObj?.feedback ?? {};
    const strengths = fb?.strengths ?? sessionObj?.strengths ?? {};
    const improvements = fb?.improvements ?? sessionObj?.improvements ?? {};
    const attemptsRaw = sessionObj?.attempts ?? [];

    const attempts = attemptsRaw.map((a: any) => ({
      id: a.id,
      scenarioId: a.scenarioId,
      scenarioNumber: a.scenario?.scenarioNumber ?? a.scenarioNumber ?? undefined,
      audioUrl: a.audioUrl,
      audioFeedbackUrl: a.audioFeedbackUrl,
      textualFeedback: a.textualFeedback,
      pronunciationScore: a.pronunciationScore,
      accuracyScore: a.accuracyScore,
      fluencyScore: a.fluencyScore,
      completenessScore: a.completenessScore,
      totalScore: a.totalScore,
    }))

    return {
      sessionId: sessionObj?.id ?? sessionObj?.sessionId ?? '',
      username: sessionObj?.user?.username ?? sessionObj?.username ?? localStorage.getItem('userName') ?? 'user',
      overallScore: sessionObj?.overallScore ?? 0,
      totalScenarios: sessionObj?.totalScenarios ?? (sessionObj?.topic?.scenarios?.length ?? 0) ?? 0,
      completedCount: sessionObj?.completedCount ?? 0,
      comprehensiveFeedback: fb?.aiFeedback ?? sessionObj?.comprehensiveFeedback ?? fb?.comprehensiveFeedback ?? '',
      feedbackAudioUrl: fb?.feedbackAudioUrl ?? sessionObj?.feedbackAudioUrl ?? '',
      strengths: {
        averagePronunciation: strengths?.averagePronunciation ?? 0,
        averageAccuracy: strengths?.averageAccuracy ?? 0,
        averageFluency: strengths?.averageFluency ?? 0,
        consistency: strengths?.consistency ?? 0,
      },
      improvements: {
        lowestScore: improvements?.lowestScore ?? 0,
        highestScore: improvements?.highestScore ?? 0,
        improvementPotential: improvements?.improvementPotential ?? 0,
        areasNeedingWork: improvements?.areasNeedingWork ?? '',
      },
      overallAssessment: fb?.overallAssessment ?? sessionObj?.overallAssessment ?? fb?.aiFeedback ?? '',
      attempts,
    }
  }

  const [feedback, setFeedback] = useState<SessionFeedback | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPlayingFeedback, setIsPlayingFeedback] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const router = useRouter();

  useEffect(() => {
    let mounted = true

    // Get feedback data from session storage and attempt to refresh from server
    const feedbackData = sessionStorage.getItem('sessionFeedback')
    console.log('Feedback data from sessionStorage:', feedbackData)
    if (feedbackData) {
      try {
        const parsed = JSON.parse(feedbackData)
        setFeedback(normalizeSessionToFeedback(parsed))
      } catch (error) {
        console.error('Error parsing feedback data:', error)
      }
    }

    const currentSession = sessionStorage.getItem('currentSession')
    let sessionId: string | null = null
    try {
      if (feedbackData) {
        const parsed = JSON.parse(feedbackData)
        sessionId = parsed?.sessionId ?? null
      }
    } catch (err) {
      // ignore
    }
    if (!sessionId && currentSession) {
      try {
        const parsed = JSON.parse(currentSession)
        sessionId = parsed?.sessionId ?? null
      } catch (err) {
        // ignore
      }
    }

    const loadFromServer = async (sid: string) => {
      setLoading(true)
      setError(null)
      try {
        const res = await sessionsApi.getById(sid)
        if (!mounted) return
        console.log('Fetched feedback from server for session', sid, res)
        // Prefer normalized response shape; ensure username
        if (res) {
          setFeedback(normalizeSessionToFeedback(res))
          try {
            sessionStorage.setItem('sessionFeedback', JSON.stringify(res))
          } catch (err) {
            // ignore storage errors
          }
        }
      } catch (err: any) {
        console.error('Failed to fetch session feedback', err)
        setError(err?.message ?? 'Failed to load feedback')

        // Try generating feedback server-side if supported
        try {
          await apiClient.post(`/sessions/${sid}/complete`)
          // fetch again after generation
          const res2 = await sessionsApi.getById(sid)
          if (!mounted) return
          console.log('Fetched feedback after generation for session', sid, res2)
          if (res2) {
            setFeedback(normalizeSessionToFeedback(res2))
            try {
              sessionStorage.setItem('sessionFeedback', JSON.stringify(res2))
            } catch (err) {
              // ignore
            }
          }
        } catch (genErr) {
          console.error('Failed to generate or fetch feedback', genErr)
        }
      } finally {
        if (mounted) setLoading(false)
      }
    }

    if (sessionId) {
      // fetch fresh feedback from server
      loadFromServer(sessionId)
    } else {
      setLoading(false)
    }

    return () => { mounted = false }
  }, []);

  const [error, setError] = useState<string | null>(null)
  const [showAttempts, setShowAttempts] = useState(false)

  const handleFeedbackAudioPlay = () => {
    if (!feedback?.feedbackAudioUrl) return;

    if (isPlayingFeedback) {
      audioRef.current?.pause();
      setIsPlayingFeedback(false);
    } else {
      if (!audioRef.current) {
        audioRef.current = new Audio(feedback.feedbackAudioUrl);
        audioRef.current.addEventListener('ended', () => setIsPlayingFeedback(false));
      }
      audioRef.current.play();
      setIsPlayingFeedback(true);
    }
  };

  const handleAttemptAudioPlay = (url?: string) => {
    if (!url) return
    if (!audioRef.current) {
      audioRef.current = new Audio(url)
      audioRef.current.addEventListener('ended', () => setIsPlayingFeedback(false))
      audioRef.current.play()
      setIsPlayingFeedback(true)
      return
    }

    // if same source, toggle play/pause
    if ((audioRef.current as HTMLAudioElement).src === url) {
      if (isPlayingFeedback) {
        audioRef.current.pause()
        setIsPlayingFeedback(false)
      } else {
        audioRef.current.play()
        setIsPlayingFeedback(true)
      }
      return
    }

    // switch source
    audioRef.current.pause()
    audioRef.current = new Audio(url)
    audioRef.current.addEventListener('ended', () => setIsPlayingFeedback(false))
    audioRef.current.play()
    setIsPlayingFeedback(true)
  }

  const handleSessionEnd = () => {
    // Clear all session storage data
    sessionStorage.removeItem('currentSession');
    sessionStorage.removeItem('sessionFeedback');

    // Clear any other potential session data
    const sessionKeys = Object.keys(sessionStorage);
    sessionKeys.forEach(key => {
      if (key.startsWith('session') || key.includes('scenario') || key.includes('attempt')) {
        sessionStorage.removeItem(key);
      }
    });

    // Clear all local storage data
    localStorage.clear();

    // Navigate to home page
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل التغذية الراجعة...</p>
        </div>
      </div>
    );
  }

  if (!feedback) {
    return (
      <div className="min-h-screen flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <p className="text-gray-600 mb-4">لا توجد تغذية راجعة متاحة</p>
          <Button onClick={() => router.push('/onboarding')} className="bg-green-500 hover:bg-green-600">
            العودة للبداية
          </Button>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gray-100" dir="rtl">
      <Header />

      {/* Main Content */}
      <div className="px-4 py-6">
        {/* Page Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-black">
            أحسنت يا  {feedback.username || 'user'}
          </h1>
          <p className="text-gray-600 mt-2 text-lg">
            لقد أكملت الدرس بنجاح. إليك تقييمك الشامل.
          </p>
        </div>

        {/* Main Content Area */}
        <div className="flex flex-col lg:flex-row gap-8 items-center justify-center max-w-6xl mx-auto">
          {/* Feedback Card - Left Side */}
          <div className="flex-1 lg:w-2/3 max-w-2xl order-1 lg:order-1">
            <div className="bg-gray-200 rounded-3xl p-8 shadow-lg">
              {/* Feedback Summary */}
              <div className="text-right mb-6">
                <h2 className="text-2xl font-bold text-green-600">تقييم تلقائي</h2>
                <p className="text-gray-700 mt-2">{feedback.comprehensiveFeedback}</p>
              </div>

              {/* Summary metrics */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-white rounded-lg p-4 shadow-sm text-right">
                  <div className="text-sm text-gray-500">الاكتمال</div>
                  <div className="text-2xl font-bold text-gray-800">{Math.round(((feedback.completedCount ?? 0) / Math.max(1, feedback.totalScenarios ?? 1)) * 100)}%</div>
                  <div className="text-xs text-gray-400">{feedback.completedCount ?? 0} / {feedback.totalScenarios ?? 0}</div>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-sm text-right">
                  <div className="text-sm text-gray-500">الدقة</div>
                  <div className="text-2xl font-bold text-gray-800">{Number(feedback.strengths.averageAccuracy ?? 0)}%</div>
                  <div className="text-xs text-gray-400">دقة النطق</div>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-sm text-right">
                  <div className="text-sm text-gray-500">النطق</div>
                  <div className="text-2xl font-bold text-gray-800">{Number(feedback.strengths.averagePronunciation ?? 0)}%</div>
                  <div className="text-xs text-gray-400">نسبة النطق</div>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-sm text-right">
                  <div className="text-sm text-gray-500">الطلاقة</div>
                  <div className="text-2xl font-bold text-gray-800">{Number(feedback.strengths.averageFluency ?? 0)}%</div>
                  <div className="text-xs text-gray-400">سلاسة الكلام</div>
                </div>
              </div>

              <div className="mb-4 text-right">
                <div className="text-sm text-gray-500">التقييم العام</div>
                <div className="text-lg font-semibold text-gray-800">{feedback.overallAssessment ?? feedback.comprehensiveFeedback}</div>
              </div>

              {feedback.feedbackAudioUrl && (
                <div className="flex justify-center mb-6">
                  <div className="bg-green-100 border border-green-200 rounded-3xl px-6 py-2 w-full max-w-[60%]">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-800 font-medium text-lg">تغذية راجعة صوتية</span>
                      <button
                        onClick={handleFeedbackAudioPlay}
                        className="bg-green-500 hover:bg-green-600 text-white rounded-full p-2 transition-colors"
                        disabled={!feedback.feedbackAudioUrl}
                      >
                        {isPlayingFeedback ? (
                          <Pause className="h-3 w-3" />
                        ) : (
                          <Play className="h-3 w-3" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div className="text-right mb-4 text-sm text-red-600">{error}</div>
              )}

              <div className="text-right mt-4">
                <button className="text-sm text-sky-600" onClick={() => setShowAttempts((v) => !v)}>
                  {showAttempts ? 'إخفاء المحاولات' : `عرض المحاولات (${feedback.attempts?.length ?? 0})`} →
                </button>
              </div>

              {/* Attempts list (collapsible) */}
              {showAttempts && feedback.attempts && feedback.attempts.length > 0 && (
                <div className="space-y-3 mt-4">
                  <h3 className="text-right font-semibold text-gray-700 mb-2">محاولات</h3>
                  {feedback.attempts.map((a) => (
                    <div key={a.id ?? a.scenarioId} className="bg-white rounded-lg p-3 shadow-sm flex items-center justify-between">
                      <div className="text-right">
                        <div className="font-medium">المشهد {a.scenarioNumber ?? a.scenarioId}</div>
                        {a.textualFeedback && <div className="text-sm text-gray-600 mt-1">{a.textualFeedback}</div>}
                        <div className="text-xs text-gray-500 mt-1">نطق: {a.pronunciationScore ?? 0}% • دقة: {a.accuracyScore ?? 0}% • طلاقة: {a.fluencyScore ?? 0}% • اكتمال: {a.completenessScore ?? 0}%</div>
                      </div>
                      <div className="flex items-center gap-2">
                        {a.audioFeedbackUrl && (
                          <button
                            onClick={() => handleAttemptAudioPlay(a.audioFeedbackUrl)}
                            className="bg-green-500 hover:bg-green-600 text-white rounded-full p-2"
                            aria-label={`Play attempt ${a.scenarioNumber ?? a.scenarioId} feedback`}
                          >
                            <Play className="h-3 w-3" />
                          </button>
                        )}
                        <div className="text-sm text-gray-500">{a.totalScore ?? '-'}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Session Ended Button */}
              <div className="text-center">
                <Button
                  onClick={handleSessionEnd}
                  className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-xl font-medium"
                >
                  انتهت الجلسة
                </Button>
              </div>
            </div>
          </div>

          {/* Sheikh Character - Right Side */}
          <div className="flex-shrink-0 lg:w-1/3 order-2 lg:order-2">
            <Image
              src="/images/shiekh.png"
              alt="Sheikh Character"
              width={300}
              height={400}
              className="object-contain w-full h-auto"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
