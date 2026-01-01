"use client";

import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface FeedbackPopupProps {
  isOpen: boolean;
  onClose: () => void;
  scores?: {
    pronunciation: number;
    accuracy: number;
    fluency: number;
    completeness: number;
    total: number;
  };
  transcription?: string;
}

export default function FeedbackPopup({ isOpen, onClose, scores, transcription }: FeedbackPopupProps) {
  if (!isOpen) return null;

  const getScoreLabel = (score: number) => {
    if (score >= 90) return "ممتاز";
    if (score >= 80) return "جيد جداً";
    if (score >= 70) return "جيد";
    if (score >= 60) return "مقبول";
    return "يحتاج تحسين";
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 80) return "text-green-500";
    if (score >= 70) return "text-yellow-600";
    if (score >= 60) return "text-orange-500";
    return "text-red-500";
  };

  const feedbackItems = scores ? [
    { label: "النطق", value: scores.pronunciation, icon: "🗣️" },
    { label: "الدقة", value: scores.accuracy, icon: "🎯" },
    { label: "الطلاقة", value: scores.fluency, icon: "⚡" },
    { label: "الاكتمال", value: scores.completeness, icon: "✅" },
  ] : [];

  const totalScore = scores?.total || 0;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4 overflow-y-auto" onClick={onClose}>
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-lg relative animate-in fade-in zoom-in duration-200 my-auto max-h-[95vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 left-3 sm:top-4 sm:left-4 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors z-10"
        >
          <X className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
        </button>

        {/* Content */}
        <div className="p-4 sm:p-6 md:p-8" dir="rtl">
          {/* Header */}
          <div className="text-center mb-4 sm:mb-6 md:mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-green-400 to-green-600 mb-3 sm:mb-4 shadow-lg">
              <span className="text-2xl sm:text-3xl md:text-4xl">📊</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-1 sm:mb-2">تغذية راجعة</h2>
            <p className="text-gray-500 text-xs sm:text-sm">نتائج التسجيل الصوتي</p>
          </div>

          {/* Transcription */}
          {transcription && (
            <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl sm:rounded-2xl border border-blue-100">
              <p className="text-xs text-blue-600 font-medium mb-1 sm:mb-2 text-center">ما تم تسجيله:</p>
              <p className="text-base sm:text-lg font-medium text-gray-800 text-center leading-relaxed">{transcription}</p>
            </div>
          )}

          {/* Total Score */}
          {scores && (
            <div className="mb-4 sm:mb-6 p-4 sm:p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl sm:rounded-2xl border-2 border-green-200">
              <div className="text-center">
                <p className="text-xs sm:text-sm text-green-700 font-medium mb-1 sm:mb-2">النتيجة الإجمالية</p>
                <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap">
                  <span className={`text-3xl sm:text-4xl md:text-5xl font-bold ${getScoreColor(totalScore)}`}>
                    {Math.round(totalScore)}%
                  </span>
                  <span className="text-lg sm:text-xl md:text-2xl font-bold text-green-600">
                    {getScoreLabel(totalScore)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Detailed Scores */}
          {scores && (
            <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
              {feedbackItems.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg sm:rounded-xl hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <span className="text-xl sm:text-2xl">{item.icon}</span>
                    <span className="text-sm sm:text-base font-medium text-gray-700">{item.label}</span>
                  </div>
                  <div className="flex items-center gap-1 sm:gap-2">
                    <span className={`text-lg sm:text-xl font-bold ${getScoreColor(item.value)}`}>
                      {Math.round(item.value)}%
                    </span>
                    <span className="text-xs sm:text-sm text-gray-500 hidden xs:inline">
                      ({getScoreLabel(item.value)})
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Close Button */}
          <Button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl sm:rounded-2xl h-12 sm:h-14 text-base sm:text-lg font-bold shadow-lg hover:shadow-xl transition-all border-b-4 border-green-700 active:border-b-0 active:translate-y-[2px]"
          >
            إغلاق
          </Button>
        </div>
      </div>
    </div>
  );
}
