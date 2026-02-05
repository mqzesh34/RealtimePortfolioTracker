import { useState, useEffect } from 'react';
import socket from '../utils/socket';


import type { MarketItem } from '../types';
import { useCurrency } from '../hooks/useCurrency';



const Market = () => {
    const [marketData, setMarketData] = useState<MarketItem[]>(() => {
        try {
            const cached = localStorage.getItem('marketDataCache');
            return cached ? JSON.parse(cached) : [];
        } catch (e) {
            console.error("Piyasa önbelleği yüklenemedi", e);
            return [];
        }
    });
    const [connectionStatus, setConnectionStatus] = useState<string>('Bağlanıyor...');

    const { formatCurrency } = useCurrency();

    useEffect(() => {
        if (marketData.length > 0) {
            localStorage.setItem('marketDataCache', JSON.stringify(marketData));
        }
    }, [marketData]);

    useEffect(() => {
        const handleConnect = () => {
            console.log('Piyasa sayfası sokete bağlandı');
            setConnectionStatus('Bağlandı');
        };

        const handleConnectError = () => {
            setConnectionStatus('Bağlantı Hatası');
        };

        const handleMarketData = (response: any) => {
            const data = Array.isArray(response) ? response : response.tickers;

            const processedData: MarketItem[] = [];

            data.forEach((item: any) => {
                const name = item.symbol || '';
                const code = item.code || '';

                processedData.push({
                    code: name,
                    buy: item.buy?.toString() || '0',
                    sell: item.sell?.toString() || '0',
                    change: item.change,
                    rawCode: code
                });
            });

            const ORDER = [
                'Has Altın',
                'Altın Ons',
                'Gram Gümüş',
                'Gümüş Ons',
                '14 Ayar Altın',
                '22 Ayar Altın',
                'Gram Altın',
                'Çeyrek Altın',
                'Yarım Altın',
                'Tam Altın',
                'Ata Altın',
                "Ata 5'li",
                'Gremse Altın'
            ];

            processedData.sort((a, b) => {
                let indexA = ORDER.indexOf(a.code);
                let indexB = ORDER.indexOf(b.code);

                if (indexA === -1) indexA = 99;
                if (indexB === -1) indexB = 99;

                return indexA - indexB;
            });

            setMarketData(processedData);
        };

        socket.on('connect', handleConnect);
        socket.on('connect_error', handleConnectError);
        socket.on('market_data', handleMarketData);

        if (socket.connected) {
            handleConnect();
        }

        return () => {
            socket.off('connect', handleConnect);
            socket.off('connect_error', handleConnectError);
            socket.off('market_data', handleMarketData);
        };
    }, []);

    return (
        <div className="px-4 pt-20 max-w-2xl mx-auto h-full flex flex-col">

            <div className="flex items-center px-4 py-2 text-[10px] sm:text-xs font-bold tracking-widest text-zinc-500 uppercase border-b border-zinc-800">
                <div className="flex-1 pl-4">Varlık</div>
                <div className="w-13 text-center">Alış</div>
                <div className="w-25 text-center ml-2">Satış</div>
                <div className="text-center">Değişim</div>
            </div>

            <div id="tutorial-market-grid" className="flex-1 overflow-y-auto scrollbar-hide pb-40 px-1 pt-2">
                <div className="space-y-3">
                    {marketData.length === 0 ? (
                        <div className="text-center text-zinc-500 py-10">
                            {connectionStatus === 'Bağlandı' ? 'Veri bekleniyor...' : connectionStatus}
                        </div>
                    ) : (
                        marketData.map((item, index) => {
                            const buyPrice = Number(item.buy);
                            const sellPrice = Number(item.sell);
                            const change = item.change || 0;

                            const bgClass = change > 0
                                ? 'bg-green-500/10 border-green-500/20'
                                : change < 0
                                    ? 'bg-red-500/10 border-red-500/20'
                                    : 'bg-zinc-900 border-zinc-800/50';

                            return (
                                <div key={index} className={`flex items-center justify-between p-3 sm:p-4 border-2 rounded-3xl shadow-xl transition-colors duration-300 ${bgClass}`}>
                                    <div className="flex-1 flex items-center min-w-0">
                                        <span className="font-bold text-sm sm:text-sm text-zinc-100 tracking-wide truncate">{item.code}</span>
                                    </div>
                                    <div className="w-21 text-center">
                                        <span className="text-zinc-200 font-medium text-sm sm:text-sm tabular-nums tracking-wide">
                                            {formatCurrency(buyPrice, item.code, item.rawCode)}
                                        </span>
                                    </div>
                                    <div className="w-21 text-center">
                                        <span className="text-zinc-200 font-medium text-sm sm:text-sm tabular-nums tracking-wide">
                                            {formatCurrency(sellPrice, item.code, item.rawCode)}
                                        </span>
                                    </div>
                                    <div className={`${change >= 0 ? 'text-green-500' : 'text-red-500'} pl-2`}>
                                        <span className="font-medium text-sm sm:text-sm tabular-nums tracking-wide">
                                            %{Math.abs(change).toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
};

export default Market;
