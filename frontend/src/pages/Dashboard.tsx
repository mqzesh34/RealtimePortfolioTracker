import { TrendingUp, TrendingDown, Wallet, Coins } from 'lucide-react';
import { usePortfolio } from '../hooks/usePortfolio';

const getAssetIcon = (code: string) => {
    const lower = code.toLowerCase();
    if (lower.includes('altın') || lower.includes('gold')) return <Coins className="w-5 h-5 text-yellow-400" />;
    return <Coins className="w-5 h-5 text-zinc-300" />;
};

const Dashboard = () => {
    const { totalValue, totalChangePercentage, portfolioList } = usePortfolio();



    return (
        <div className="px-4 pt-20 max-w-4xl mx-auto h-full flex flex-col pb-24 overflow-y-auto scrollbar-hide">
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-6 mb-8 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                        <Wallet className="w-6 h-6 text-yellow-500" />
                        <h2 className="text-zinc-400 font-medium">Toplam Varlık</h2>
                    </div>
                    {totalValue > 0 && (
                        <div className={`flex items-center gap-1 px-2.5 py-1 rounded-lg ${totalChangePercentage >= 0 ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                            {totalChangePercentage >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                            <span className="font-bold text-sm">%{Math.abs(totalChangePercentage).toFixed(2)}</span>
                        </div>
                    )}
                </div>

                <div className={`font-bold text-zinc-100 tracking-tight tabular-nums whitespace-nowrap transition-all duration-300 ${totalValue.toLocaleString('tr-TR', { maximumFractionDigits: 0 }).length > 15
                    ? 'text-2xl'
                    : totalValue.toLocaleString('tr-TR', { maximumFractionDigits: 0 }).length > 12
                        ? 'text-3xl'
                        : 'text-4xl'
                    }`}>
                    {totalValue.toLocaleString('tr-TR', { maximumFractionDigits: 0 })} ₺
                </div>
            </div>

            <div className="space-y-3">
                <h3 className="text-zinc-100 font-medium px-2">Varlıklarım</h3>
                {portfolioList.length === 0 ? (
                    <div className="text-center text-zinc-500 py-10 bg-zinc-900/30 rounded-3xl border border-zinc-800/50">
                        Henüz varlık eklenmedi.
                    </div>
                ) : (
                    portfolioList.map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-zinc-900 border border-zinc-800 rounded-3xl group hover:border-zinc-700 transition-colors">
                            <div className="flex items-center gap-4 flex-1">
                                <div className="p-3 bg-zinc-800 rounded-2xl">
                                    {getAssetIcon(item.code)}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-zinc-100">{item.code}</span>
                                    </div>
                                    <div className="text-xs text-zinc-500 mt-0.5 font-medium">
                                        {item.amount.toLocaleString('tr-TR')} adet × {item.currentPrice.toLocaleString('tr-TR', { maximumFractionDigits: 0 })} ₺
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="text-right">
                                    <div className="font-bold text-zinc-100 tabular-nums">
                                        {item.totalValue.toLocaleString('tr-TR', { maximumFractionDigits: 0 })} ₺
                                    </div>
                                </div>

                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Dashboard;
