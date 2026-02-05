import { LayoutDashboard, TrendingUp, PieChart } from 'lucide-react';

interface BottomNavbarProps {
    activePage: string;
    onPageChange: (page: string) => void;
}

const BottomNavbar = ({ activePage, onPageChange }: BottomNavbarProps) => {
    const navItems = [
        { id: 'market', icon: TrendingUp, label: 'Piyasa' },
        { id: 'dashboard', icon: LayoutDashboard, label: 'Panel' },
        { id: 'portfolio', icon: PieChart, label: 'Portföy' },
    ];

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
            <div className="bg-zinc-900/70 backdrop-blur-md border border-white/10 rounded-3xl px-6 py-3 shadow-2xl flex items-center gap-8">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activePage === item.id;

                    return (
                        <button
                            key={item.id}
                            id={`nav-${item.id}`}
                            onClick={() => onPageChange(item.id)}
                            className="relative flex flex-col items-center justify-center group gap-1"
                        >
                            <div className={`
                                flex items-center justify-center w-12 h-12 rounded-2xl transition-all duration-300
                                ${isActive
                                    ? 'bg-yellow-500/15 text-yellow-400 shadow-[0_0_20px_rgba(250,204,21,0.2)]'
                                    : 'text-zinc-500 hover:text-zinc-200 hover:bg-white/5'}
                            `}>
                                <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                            </div>
                            <span className={`text-[10px] font-semibold tracking-wide transition-colors duration-300 ${isActive ? 'text-yellow-400' : 'text-zinc-500 group-hover:text-zinc-300'
                                }`}>
                                {item.label}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default BottomNavbar;
