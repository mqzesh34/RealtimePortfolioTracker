import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Plus, Minus } from 'lucide-react';
import socket from '../utils/socket';
import type { MarketItem, PortfolioItem } from '../types';
import DistributionChart from '../components/DistributionChart';
import AssetForm from '../components/AssetForm';
import { useTutorial } from '../context/TutorialContext';

const DEMO_PORTFOLIO: PortfolioItem[] = [
    { code: 'Gram Altın', amount: 15 },
    { code: 'Gram Gümüş', amount: 100 },
    { code: 'Has Altın', amount: 5 },
];

const Portfolio = () => {
    const { showDemoData } = useTutorial();

    const [marketData, setMarketData] = useState<MarketItem[]>(() => {
        try {
            const cached = localStorage.getItem('marketDataCache');
            return cached ? JSON.parse(cached) : [];
        } catch (e) {
            return [];
        }
    });

    const [stableCodes, setStableCodes] = useState<string[]>([]);

    useEffect(() => {
        if (marketData.length > 0) {
            const newCodes = marketData.map(m => m.code).sort();
            setStableCodes(prev => {
                if (JSON.stringify(prev) !== JSON.stringify(newCodes)) {
                    return newCodes;
                }
                return prev;
            });
        }
    }, [marketData]);

    const [portfolio, setPortfolio] = useState<PortfolioItem[]>(() => {
        try {
            const saved = localStorage.getItem('userPortfolio');
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            console.error("Failed to load portfolio", e);
            return [];
        }
    });

    const [activeTab, setActiveTab] = useState<'add' | 'remove'>('add');

    useEffect(() => {
        localStorage.setItem('userPortfolio', JSON.stringify(portfolio));
    }, [portfolio]);

    const incomingDataRef = useRef<MarketItem[]>([]);

    useEffect(() => {
        const handleMarketData = (response: any) => {
            const data = Array.isArray(response) ? response : response.tickers;
            const processedData: MarketItem[] = [];

            data.forEach((item: any) => {
                processedData.push({
                    code: item.symbol || item.code || '',
                    buy: item.buy?.toString() || '0',
                    sell: item.sell?.toString() || '0',
                    change: item.change,
                    rawCode: item.code
                });
            });
            incomingDataRef.current = processedData;
        };

        socket.on('market_data', handleMarketData);

        if (!socket.connected) {
            socket.connect();
        }

        const intervalId = setInterval(() => {
            if (incomingDataRef.current.length > 0) {

                setMarketData(prev => {
                    const newData = incomingDataRef.current;
                    if (JSON.stringify(prev) === JSON.stringify(newData)) {
                        return prev;
                    }

                    localStorage.setItem('marketDataCache', JSON.stringify(newData));
                    return newData;
                });
            }
        }, 1000);

        return () => {
            socket.off('market_data', handleMarketData);
            clearInterval(intervalId);
        };
    }, []);

    const effectivePortfolio = useMemo(() => {
        return showDemoData ? DEMO_PORTFOLIO : portfolio;
    }, [portfolio, showDemoData]);

    const { chartData } = useMemo(() => {
        let total = 0;
        const cData: any[] = [];

        effectivePortfolio.forEach(item => {
            const marketItem = marketData.find(m => m.code === item.code);
            if (marketItem) {
                const price = Number(marketItem.buy);
                const value = price * item.amount;
                total += value;

                cData.push({
                    name: item.code,
                    value: value
                });
            }
        });

        const filteredChartData = cData.filter(d => d.value > 0);
        return { chartData: filteredChartData };
    }, [effectivePortfolio, marketData]);

    const handleAddAsset = useCallback((code: string, amount: number) => {
        setPortfolio(prev => {
            const existing = prev.find(p => p.code === code);
            if (existing) {
                return prev.map(p => p.code === code ? { ...p, amount: p.amount + amount } : p);
            } else {
                return [...prev, { code, amount }];
            }
        });
    }, []);

    const handleRemoveAsset = useCallback((code: string, amount: number) => {
        setPortfolio(prev => {
            const existing = prev.find(p => p.code === code);
            if (!existing) return prev;

            const newAmount = existing.amount - amount;

            if (newAmount <= 0.000001) {
                return prev.filter(p => p.code !== code);
            } else {
                return prev.map(p => p.code === code ? { ...p, amount: newAmount } : p);
            }
        });
    }, []);

    return (
        <div className="px-4 pt-20 max-w-4xl mx-auto h-full flex flex-col pb-24 overflow-y-auto scrollbar-hide">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div id="tutorial-distribution-chart">
                    <DistributionChart data={chartData} />
                </div>

                <div id="tutorial-asset-form" className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-6 flex flex-col">
                    <div className="flex items-center gap-2 mb-6 bg-zinc-950/50 p-1 rounded-xl">
                        <button
                            onClick={() => setActiveTab('add')}
                            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'add'
                                ? 'bg-zinc-800 text-yellow-500 shadow-lg'
                                : 'text-zinc-500 hover:text-zinc-300'
                                }`}
                        >
                            <Plus className="w-4 h-4" />
                            Varlık Ekle
                        </button>
                        <button
                            onClick={() => setActiveTab('remove')}
                            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'remove'
                                ? 'bg-zinc-800 text-red-500 shadow-lg'
                                : 'text-zinc-500 hover:text-zinc-300'
                                }`}
                        >
                            <Minus className="w-4 h-4" />
                            Varlık Kaldır
                        </button>
                    </div>

                    <AssetForm
                        key={activeTab}
                        mode={activeTab}
                        availableAssets={stableCodes}
                        portfolioAssets={portfolio}
                        onAdd={handleAddAsset}
                        onRemove={handleRemoveAsset}
                    />
                </div>
            </div>
        </div >
    );
};

export default Portfolio;
