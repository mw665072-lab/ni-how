import React, { useEffect, useState } from 'react';
import { useRouter } from "next/navigation";

interface ProgressBarProps {
    unit?: string;
    lesson?: string;
    progress?: number;
    dir?: 'ltr' | 'rtl';
    onClick?: () => void;
    title?: string;
}

export default function ProgressBar({
    unit = '',
    lesson = "",
    progress = 0,
    dir,
    onClick,
    title="تخطي"
}: ProgressBarProps) {
    const [effectiveDir, setEffectiveDir] = useState<'ltr' | 'rtl'>(dir ?? 'rtl');
      const router = useRouter();


    useEffect(() => {
        if (!dir && typeof document !== 'undefined') {
            const d = (document.documentElement?.dir as 'ltr' | 'rtl') || 'rtl';
            setEffectiveDir(d);
        }
    }, [dir]);

    // Use transform scaleX to fill the bar instead of absolute positioning.
    const transformOrigin = effectiveDir === 'rtl' ? 'right center' : 'left center';

    return (
        <div className="" dir={effectiveDir}>
            <div className="mx-auto">
                <div className={`flex gap-4 items-center mb-6 ${effectiveDir === 'rtl' ? 'flex-row' : ''}`}>
                    <button
                    onClick={onClick}
                        className="inline-flex items-center gap-[4px] h-[33px] py-[6px] px-[16px] opacity-100 rounded-[32px] bg-[#E5E5E5] border-b-2 border-b-[#636363] text-gray-600 transition-colors"
                    >
                        {title} ←
                    </button>
                    <h2 className="font-inter-semibold-20 align-middle">{`${unit} ${lesson}`}</h2>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-1">
                    <div className="relative">
                        <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-orange-500 rounded-full transition-transform duration-500"
                                style={{ width: '100%', transformOrigin, transform: `scaleX(${Math.max(0, Math.min(1, progress / 100))})` } as React.CSSProperties}
                                aria-valuenow={progress}
                                role="progressbar"
                            />
                        </div>

                        <div className="mt-3 text-center flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-800">{`تم إنجاز %${progress}`}</span>
                            <span className="text-sm text-gray-600 mr-2">{`100%`}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}