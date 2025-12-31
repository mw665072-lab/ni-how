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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg relative animate-in fade-in zoom-in duration-200" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors z-10"
        >
          <X className="h-5 w-5 text-gray-600" />
        </button>

        {/* Content */}
        <div className="p-8" dir="rtl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-green-600 mb-4 shadow-lg">
              <span className="text-4xl">📊</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">تغذية راجعة</h2>
            <p className="text-gray-500 text-sm">نتائج التسجيل الصوتي</p>
          </div>

          {/* Transcription */}
          {transcription && (
            <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-100">
              <p className="text-xs text-blue-600 font-medium mb-2 text-center">ما تم تسجيله:</p>
              <p className="text-lg font-medium text-gray-800 text-center leading-relaxed">{transcription}</p>
            </div>
          )}

          {/* Total Score */}
          {scores && (
            <div className="mb-6 p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border-2 border-green-200">
              <div className="text-center">
                <p className="text-sm text-green-700 font-medium mb-2">النتيجة الإجمالية</p>
                <div className="flex items-center justify-center gap-3">
                  <span className={`text-5xl font-bold ${getScoreColor(totalScore)}`}>
                    {Math.round(totalScore)}%
                  </span>
                  <span className="text-2xl font-bold text-green-600">
                    {getScoreLabel(totalScore)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Detailed Scores */}
          {scores && (
            <div className="space-y-3 mb-6">
              {feedbackItems.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{item.icon}</span>
                    <span className="text-base font-medium text-gray-700">{item.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xl font-bold ${getScoreColor(item.value)}`}>
                      {Math.round(item.value)}%
                    </span>
                    <span className="text-sm text-gray-500">
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
            className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-2xl h-14 text-lg font-bold shadow-lg hover:shadow-xl transition-all border-b-4 border-green-700 active:border-b-0 active:translate-y-[2px]"
          >
            إغلاق
          </Button>
        </div>
      </div>
    </div>
  );
}
