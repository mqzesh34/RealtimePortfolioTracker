import { useState, useEffect, useMemo } from 'react';
import socket from '../utils/socket';
import type { MarketItem, PortfolioItem } from '../types';

export const usePortfolio = () => {
    const [marketData, setMarketData] = useState<MarketItem[]>(() => {
        try {
            const cached = localStorage.getItem('marketDataCache');
            return cached ? JSON.parse(cached) : [];
        } catch (e) {
            return [];
        }
    });

    const [portfolio, setPortfolio] = useState<PortfolioItem[]>(() => {
        try {
            const saved = localStorage.getItem('userPortfolio');
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            console.error("Failed to load portfolio", e);
            return [];
        }
    });

    useEffect(() => {
        localStorage.setItem('userPortfolio', JSON.stringify(portfolio));
    }, [portfolio]);

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
            setMarketData(processedData);
            localStorage.setItem('marketDataCache', JSON.stringify(processedData));
        };

        socket.on('market_data', handleMarketData);

        if (!socket.connected) {
            socket.connect();
        }

        return () => {
            socket.off('market_data', handleMarketData);
        };
    }, []);

    const { totalValue, totalChangePercentage, chartData, portfolioList } = useMemo(() => {
        let total = 0;
        let totalPrevious = 0;
        const cData: { name: string; value: number }[] = [];
        const pList: (PortfolioItem & { currentPrice: number; totalValue: number; change: number })[] = [];

        portfolio.forEach(item => {
            const marketItem = marketData.find(m => m.code === item.code);
            if (marketItem) {
                const price = Number(marketItem.sell);
                const value = price * item.amount;
                total += value;

                const change = marketItem.change || 0;
                const prevPrice = price / (1 + (change / 100));
                totalPrevious += prevPrice * item.amount;

                cData.push({
                    name: item.code,
                    value: value
                });

                pList.push({
                    ...item,
                    currentPrice: price,
                    totalValue: value,
                    change: change
                });
            } else {
                pList.push({
                    ...item,
                    currentPrice: 0,
                    totalValue: 0,
                    change: 0
                });
            }
        });

        const totalChangePercent = totalPrevious > 0
            ? ((total - totalPrevious) / totalPrevious) * 100
            : 0;

        const filteredChartData = cData.filter(d => d.value > 0);

        return { totalValue: total, totalChangePercentage: totalChangePercent, chartData: filteredChartData, portfolioList: pList };
    }, [portfolio, marketData]);

    return {
        marketData,
        portfolio,
        setPortfolio,
        totalValue,
        totalChangePercentage,
        chartData,
        portfolioList
    };
};
