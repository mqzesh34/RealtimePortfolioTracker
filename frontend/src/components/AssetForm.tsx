import { useState, useMemo, memo } from 'react';
import { Plus, Minus } from 'lucide-react';
import type { PortfolioItem } from '../types';

interface AssetFormProps {
    mode: 'add' | 'remove';
    availableAssets: string[];
    portfolioAssets: PortfolioItem[];
    onAdd: (code: string, amount: number) => void;
    onRemove: (code: string, amount: number) => void;
}

const AssetForm = memo(({
    mode,
    availableAssets,
    portfolioAssets,
    onAdd,
    onRemove
}: AssetFormProps) => {
    const [selectedAssetCode, setSelectedAssetCode] = useState<string>('');
    const [amount, setAmount] = useState<string>('');

    const handleSubmit = () => {
        if (!selectedAssetCode || !amount) return;
        const numAmount = parseFloat(amount.replace(',', '.'));
        if (isNaN(numAmount) || numAmount <= 0) return;

        if (mode === 'add') {
            onAdd(selectedAssetCode, numAmount);
        } else {
            onRemove(selectedAssetCode, numAmount);
        }

        setAmount('');
        setSelectedAssetCode('');
    };

    const currentOwnedAmount = useMemo(() => {
        if (mode === 'remove' && selectedAssetCode) {
            const asset = portfolioAssets.find(p => p.code === selectedAssetCode);
            return asset ? asset.amount : 0;
        }
        return 0;
    }, [mode, selectedAssetCode, portfolioAssets]);

    const options = mode === 'add'
        ? availableAssets
        : portfolioAssets.map(p => p.code);

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <label className="text-xs text-zinc-500 uppercase tracking-wider font-bold">Varlık Seçin</label>
                <div className="relative">
                    <select
                        value={selectedAssetCode}
                        onChange={(e) => setSelectedAssetCode(e.target.value)}
                        className="w-full bg-black/40 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-200 outline-none focus:border-yellow-500/50 transition-colors appearance-none cursor-pointer"
                    >
                        <option value="" disabled>Seçiniz</option>
                        {options.map((code) => (
                            <option key={code} value={code}>
                                {code}
                            </option>
                        ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500">
                        <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                </div>
            </div>

            <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <label className="text-xs text-zinc-500 uppercase tracking-wider font-bold">Miktar</label>
                    {mode === 'remove' && selectedAssetCode && (
                        <span className="text-xs text-zinc-400 font-medium">
                            Mevcut: <span className="text-zinc-200">{currentOwnedAmount.toLocaleString('tr-TR')}</span>
                        </span>
                    )}
                </div>
                <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-black/40 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-200 outline-none focus:border-yellow-500/50 transition-colors"
                />
            </div>

            <button
                onClick={handleSubmit}
                disabled={!selectedAssetCode || !amount}
                className={`w-full font-bold py-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${mode === 'add'
                    ? 'bg-yellow-500 hover:bg-yellow-400 text-black'
                    : 'bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/50'
                    }`}
            >
                {mode === 'add' ? (
                    <>
                        <Plus className="w-5 h-5" />
                        Ekle
                    </>
                ) : (
                    <>
                        <Minus className="w-5 h-5" />
                        Kaldır
                    </>
                )}
            </button>
        </div>
    );
});

export default AssetForm;
