export interface MarketItem {
    code: string;
    buy: string;
    sell: string;
    change?: number;
    rawCode?: string;
}

export interface PortfolioItem {
    code: string;
    amount: number;
}
