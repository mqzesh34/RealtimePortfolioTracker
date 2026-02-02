import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Coins } from 'lucide-react';
import Marquee from 'react-fast-marquee';
import socket from '../utils/socket';

interface TickerData {
    symbol: string;
    price: number;
    change: number;
    icon: React.ReactNode;
}

const getIconForSymbol = (symbol: string) => {
    switch (symbol) {
        case 'Gram Altın': return <Coins className="w-3 h-3 text-yellow-400" />;
        case 'Altın Ons': return <Coins className="w-3 h-3 text-yellow-400" />;
        case 'Gümüş Ons': return <Coins className="w-3 h-3 text-white-400" />;
        case 'Gram Gümüş': return <Coins className="w-3 h-3 text-white-400" />;
    }
};

const ALLOWED_SYMBOLS = ['Gram Altın', 'Altın Ons', 'Gümüş Ons', 'Gram Gümüş'];

const TopTicker = () => {
    const [tickers, setTickers] = useState<TickerData[]>(() => {
        try {
            const cached = localStorage.getItem('marketTickerCache');
            if (cached) {
                const parsed = JSON.parse(cached);
                const filtered = parsed
                    .filter((item: any) => ALLOWED_SYMBOLS.includes(item.symbol))
                    .map((item: any) => ({
                        ...item,
                        icon: getIconForSymbol(item.symbol)
                    }));

                if (filtered.length > 0) return filtered;
            }
        } catch (e) {
            console.error("Üst bant önbelleği yüklenemedi", e);
        }

        return [
            { symbol: 'Gram Altın', price: 0, change: 0, icon: <Coins className="w-3 h-3 text-yellow-400" /> },
            { symbol: 'Altın Ons', price: 0, change: 0, icon: <Coins className="w-3 h-3 text-yellow-400" /> },
            { symbol: 'Gümüş Ons', price: 0, change: 0, icon: <Coins className="w-3 h-3 text-white-400" /> },
            { symbol: 'Gram Gümüş', price: 0, change: 0, icon: <Coins className="w-3 h-3 text-white-400" /> },
        ];
    });

    const [lastUpdate, setLastUpdate] = useState<string>(() => {
        return localStorage.getItem('marketTimeCache') || '';
    });

    useEffect(() => {
        const handleConnect = () => {
            console.log('Üst bant piyasa verilerine bağlandı');
        };

        const handleConnectError = (err: any) => {
            console.error('Üst bant soket hatası:', err);
        };

        const handleMarketData = (response: any) => {
            const data = Array.isArray(response) ? response : response.tickers || [];
            const time = !Array.isArray(response) ? response.time : '';

            if (time) setLastUpdate(time);

            setTickers(prevTickers => {
                const currentTickers = [...prevTickers];

                data.forEach((item: any) => {
                    if (!ALLOWED_SYMBOLS.includes(item.symbol)) return;

                    const index = currentTickers.findIndex(t => t.symbol === item.symbol);
                    const tickerItem: TickerData = {
                        symbol: item.symbol,
                        price: item.price,
                        change: item.change,
                        icon: getIconForSymbol(item.symbol)
                    };

                    if (index !== -1) {
                        currentTickers[index] = tickerItem;
                    } else {
                        currentTickers.push(tickerItem);
                    }
                });

                return currentTickers;
            });
        };

        socket.on('connect', handleConnect);
        socket.on('connect_error', handleConnectError);
        socket.on('market_data', handleMarketData);

        return () => {
            socket.off('connect', handleConnect);
            socket.off('connect_error', handleConnectError);
            socket.off('market_data', handleMarketData);
        };
    }, []);

    useEffect(() => {
        const handler = setTimeout(() => {
            const cacheData = tickers.map(({ icon, ...rest }) => rest);
            localStorage.setItem('marketTickerCache', JSON.stringify(cacheData));
            if (lastUpdate) {
                localStorage.setItem('marketTimeCache', lastUpdate);
            }
        }, 1000);

        return () => {
            clearTimeout(handler);
        };
    }, [tickers, lastUpdate]);

    const TickerItem = ({ ticker }: { ticker: TickerData }) => {
        return (
            <div className="flex items-center gap-1.5 min-w-fit shrink-0 px-2">
                {ticker.icon}

                <span className="text-gray-200 font-medium text-xs tracking-wide whitespace-nowrap">
                    {ticker.symbol}
                </span>

                <span className="text-yellow-400 font-semibold text-xs tabular-nums text-right w-[4.5rem]">
                    {ticker.symbol.includes('ONS') ? '$' : '₺'}{ticker.price.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>

                <div className={`flex items-center justify-end w-[3.5rem] gap-0.5 ${ticker.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {ticker.change >= 0 ? (
                        <TrendingUp className="w-3 h-3" />
                    ) : (
                        <TrendingDown className="w-3 h-3" />
                    )}
                    <span className="font-semibold text-xs tabular-nums">
                        %{Math.abs(ticker.change).toFixed(2)}
                    </span>
                </div>

                <div className="w-px h-4 bg-gray-600 ml-1" />
            </div>
        );
    };

    return (
        <>
            <div className="fixed top-0 left-0 right-0 z-50 h-12 bg-gradient-to-r from-yellow-400/5 via-zinc-900/80 to-yellow-400/5 border border-gray-800/50 shadow-xl overflow-hidden backdrop-blur-xl max-w-[100vw]">
                <div className="flex items-center h-12 w-full">
                    <Marquee
                        gradient={true}
                        gradientColor="rgba(0, 0, 0, 0)"
                        gradientWidth={50}
                        speed={40}
                        pauseOnHover={false}
                    >
                        {tickers.map((ticker, index) => (
                            <TickerItem key={`ticker-${index}`} ticker={ticker} />
                        ))}
                    </Marquee>
                </div>
            </div>

            <div className="fixed top-14 left-1/2 -translate-x-1/2 bg-zinc-900/90 border border-gray-800 text-[10px] text-gray-400 font-medium px-3 py-0.5 rounded-full shadow-lg z-40 backdrop-blur-sm pointer-events-none">
                {lastUpdate || '--:--'}
            </div>
        </>
    );
};

export default TopTicker;