import { useCallback } from 'react';

export const useCurrency = () => {
    const getCurrencySymbol = useCallback((code: string, rawCode?: string) => {
        const lowerCode = code.toLowerCase();
        const isDollar = lowerCode.includes('ons') || lowerCode.includes('/usd') || lowerCode.endsWith('usd');
        const isDollarRaw = rawCode?.includes('USD') && !rawCode?.includes('TRY');

        return (isDollar || isDollarRaw) ? '$' : '₺';
    }, []);

    const formatCurrency = useCallback((price: number, code: string, rawCode?: string) => {
        const symbol = getCurrencySymbol(code, rawCode);
        const isSilver = code === 'Gümüş Ons' || code === 'Gram Gümüş';
        const fractionDigits = isSilver ? 2 : 0;

        const formattedPrice = price.toLocaleString('tr-TR', {
            minimumFractionDigits: fractionDigits,
            maximumFractionDigits: fractionDigits
        });

        return `${formattedPrice}${symbol}`;
    }, [getCurrencySymbol]);

    return { getCurrencySymbol, formatCurrency };
};
