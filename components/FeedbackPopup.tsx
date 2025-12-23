"use client";

import { Button } from "@/components/ui/button";

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
    if (score >= 80) return "جيد";
    if (score >= 70) return "مقبول";
    return "يحتاج إلى تحسين";
  };

  const feedbackData = scores ? [
    { label: "المقياس", value: "النتيجة" },
    { label: "الدقة", value: `${Math.round(scores.accuracy)}% (${getScoreLabel(scores.accuracy)})` },
    { label: "الطلاقة", value: `${Math.round(scores.fluency)}% (${getScoreLabel(scores.fluency)})` },
    { label: "الاكتمال", value: `${Math.round(scores.completeness)}% (${getScoreLabel(scores.completeness)})` },
    { label: "النطق", value: `${Math.round(scores.pronunciation)}% (${getScoreLabel(scores.pronunciation)})` },
    { label: "الإجمالي", value: `${Math.round(scores.total)}% (${getScoreLabel(scores.total)})` },
  ] : [
    { label: "المقياس", value: "النتيجة" },
    { label: "الدقة", value: "88% (جيد)" },
    { label: "الطلاقة", value: "90% (ممتاز)" },
    { label: "الاكتمال", value: "90% (ممتاز)" },
    { label: "النطق", value: "75% (مقبول)" },
    { label: "الإجمالي", value: "85% (جيد)" },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-100 rounded-2xl shadow-lg w-full max-w-md relative">
        {/* Popup Content */}
        <div className="p-6 pt-8">
          {/* Title */}
          <div className="text-right mb-6">
            <h2 className="text-green-600 font-bold text-xl">تغذية راجعة</h2>
          </div>

          {/* Transcription */}
          {transcription && (
            <div className="text-center mb-6 p-3 bg-white rounded-xl">
              <p className="text-sm text-gray-600 mb-1">ما تم تسجيله:</p>
              <p className="text-lg font-medium text-gray-800">{transcription}</p>
            </div>
          )}


          {/* Feedback Data */}
          <div className="space-y-4 mb-6">
            {feedbackData.map((item, index) => (
              <div key={index} className="flex justify-between items-center">
                <div className="text-right text-black font-medium">
                  {item.label}
                </div>
                <div className="text-left text-green-600 font-medium">
                  {item.value}
                </div>
              </div>
            ))}
          </div>

          {/* Close Button */}
          <div className="flex justify-center">
            <Button
              onClick={onClose}
              className="bg-red-500 hover:bg-red-600 text-white rounded-xl px-8 py-3"
            >
              إغلاق
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
