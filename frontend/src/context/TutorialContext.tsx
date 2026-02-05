import React, { createContext, useContext, useState, useEffect } from 'react';

export interface TutorialStep {
    id: number;
    title: string;
    description: string;
    targetId?: string;
    page: string;
    position?: 'top' | 'bottom' | 'center' | 'top-left';
}

interface TutorialContextType {
    isActive: boolean;
    currentStepIndex: number;
    showDemoData: boolean;
    startTutorial: () => void;
    nextStep: () => void;
    skipTutorial: () => void;
    currentStep: TutorialStep | null;
}

const TutorialContext = createContext<TutorialContextType | undefined>(undefined);

const STEPS: TutorialStep[] = [
    {
        id: 1,
        title: "Hoş Geldiniz! 👋",
        description: "Varlıklarınızı anlık Kapalıçarşı fiyatlarıyla takip etmeye başlayın.",
        page: "dashboard",
        position: 'center'
    },
    {
        id: 2,
        title: "Toplam Varlık 💰",
        description: "Portföyünüzün toplam anlık değeri burada görünür.",
        targetId: 'tutorial-total-balance',
        page: "dashboard",
        position: 'bottom'
    },
    {
        id: 3,
        title: "Varlık Listesi 📝",
        description: "Sahip olduğunuz varlıklar burada listelenir.",
        targetId: 'tutorial-portfolio-list',
        page: "dashboard",
        position: 'bottom'
    },
    {
        id: 4,
        title: "Piyasa 📈",
        description: "Anlık piyasa verilerini görmek için bu sayfayı kullanabilirsiniz.",
        targetId: 'nav-market',
        page: "market",
        position: 'bottom'
    },
    {
        id: 5,
        title: "Canlı Fiyatlar ⚡",
        description: "Tüm altın ve döviz kurlarını buradan saniye saniye izleyebilirsiniz.",
        targetId: 'tutorial-market-grid',
        page: "market",
        position: 'bottom'
    },
    {
        id: 6,
        title: "Portföy Yönetimi 💼",
        description: "Varlıklarınızı yönetmek için Portföy sayfasına gidelim.",
        targetId: 'nav-portfolio',
        page: "portfolio",
        position: 'bottom'
    },
    {
        id: 7,
        title: "Ekle/Çıkar ➕",
        description: "Yeni bir varlık aldığınızda ekleyebilir veya sattığınızda buradan kaldırabilirsiniz.",
        targetId: 'tutorial-asset-form',
        page: "portfolio",
        position: 'top'
    },
    {
        id: 8,
        title: "Dağılım 📊",
        description: "Yatırımlarınızın oransal dağılımını bu grafikte görebilirsiniz.",
        targetId: 'tutorial-distribution-chart',
        page: "portfolio",
        position: 'bottom'
    },
    {
        id: 9,
        title: "Hazırsınız! 🚀",
        description: "Artık kendi portföyünüzü oluşturabilirsiniz. İyi kazançlar!",
        page: "dashboard",
        position: 'center'
    }
];

export const TutorialProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isActive, setIsActive] = useState(false);
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [showDemoData, setShowDemoData] = useState(false);

    useEffect(() => {
        const completed = localStorage.getItem('tutorial_completed');
        if (!completed) {
            const timer = setTimeout(() => {
                startTutorial();
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, []);

    const startTutorial = () => {
        setIsActive(true);
        setCurrentStepIndex(0);
        setShowDemoData(true);
    };

    const nextStep = () => {
        if (currentStepIndex < STEPS.length - 1) {
            setCurrentStepIndex(prev => prev + 1);
        } else {
            finishTutorial();
        }
    };

    const skipTutorial = () => {
        finishTutorial();
    };

    const finishTutorial = () => {
        setIsActive(false);
        setShowDemoData(false);
        setCurrentStepIndex(0);
        localStorage.setItem('tutorial_completed', 'true');
    };

    const currentStep = isActive ? STEPS[currentStepIndex] : null;

    return (
        <TutorialContext.Provider value={{
            isActive,
            currentStepIndex,
            showDemoData,
            startTutorial,
            nextStep,
            skipTutorial,
            currentStep
        }}>
            {children}
        </TutorialContext.Provider>
    );
};

export const useTutorial = () => {
    const context = useContext(TutorialContext);
    if (context === undefined) {
        throw new Error('useTutorial must be used within a TutorialProvider');
    }
    return context;
};
