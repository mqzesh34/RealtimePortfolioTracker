import React, { useEffect, useState } from 'react';
import { useTutorial } from '../context/TutorialContext';
import { X, ChevronRight } from 'lucide-react';

interface TutorialOverlayProps {
    activePage: string;
    onPageChange: (page: string) => void;
}

const TutorialOverlay: React.FC<TutorialOverlayProps> = ({ activePage, onPageChange }) => {
    const { isActive, currentStep, nextStep, skipTutorial } = useTutorial();
    const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

    useEffect(() => {
        if (isActive && currentStep) {
            if (activePage !== currentStep.page) {
                onPageChange(currentStep.page);
            }
        }
    }, [isActive, currentStep, activePage, onPageChange]);

    useEffect(() => {
        if (!isActive || !currentStep?.targetId) {
            setTargetRect(null);
            return;
        }

        const updateRect = () => {
            const el = document.getElementById(currentStep.targetId!);
            if (el) {
                const rect = el.getBoundingClientRect();
                const padding = 8;
                const newRect = {
                    top: rect.top - padding,
                    left: rect.left - padding,
                    width: rect.width + (padding * 2),
                    height: rect.height + (padding * 2),
                    bottom: rect.bottom + padding,
                    right: rect.right + padding,
                    x: rect.x - padding,
                    y: rect.y - padding,
                    toJSON: () => { }
                } as DOMRect;

                setTargetRect(newRect);
            } else {
                setTargetRect(null);
            }
        };

        const timer = setTimeout(updateRect, 300);
        window.addEventListener('resize', updateRect);

        return () => {
            clearTimeout(timer);
            window.removeEventListener('resize', updateRect);
        };
    }, [isActive, currentStep, activePage]);

    if (!isActive || !currentStep) return null;

    let positionClasses = "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2";

    if (currentStep.position === 'bottom') {
        positionClasses = "bottom-32 left-4 right-4";
    } else if (currentStep.position === 'top') {
        positionClasses = "top-32 left-4 right-4";
    } else if (currentStep.position === 'center') {
        positionClasses = "top-1/2 left-4 right-4 -translate-y-1/2";
    }

    return (
        <div className="fixed inset-0 z-[100] pointer-events-none overflow-hidden">
            {targetRect ? (
                <div
                    className="absolute transition-all duration-500 ease-in-out"
                    style={{
                        top: targetRect.top,
                        left: targetRect.left,
                        width: targetRect.width,
                        height: targetRect.height,
                        boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.85)',
                        borderRadius: '24px'
                    }}
                />
            ) : (
                <div className="absolute inset-0 bg-black/85 transition-all duration-500" />
            )}

            <div
                className={`absolute ${positionClasses} pointer-events-auto bg-zinc-900 border border-yellow-500/30 p-6 rounded-3xl shadow-2xl transition-all duration-500`}
                style={{ zIndex: 102 }}
            >
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-2">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-yellow-500 text-black text-xs font-bold">
                            {currentStep.id}
                        </span>
                        <h3 className="text-lg font-bold text-white">{currentStep.title}</h3>
                    </div>
                    <button
                        onClick={skipTutorial}
                        className="text-zinc-500 hover:text-white transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <p className="text-zinc-300 mb-6 leading-relaxed">
                    {currentStep.description}
                </p>

                <div className="flex justify-end gap-3">
                    <button
                        onClick={skipTutorial}
                        className="text-zinc-500 text-sm font-medium hover:text-white px-3 py-2 transition-colors"
                    >
                        Geç
                    </button>
                    <button
                        onClick={nextStep}
                        className="bg-yellow-500 hover:bg-yellow-400 text-black px-5 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-lg hover:shadow-yellow-500/20"
                    >
                        {currentStep.id === 9 ? 'Tamamla' : 'Devam Et'}
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TutorialOverlay;
