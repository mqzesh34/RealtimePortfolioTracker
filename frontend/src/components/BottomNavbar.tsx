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
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
            <div className="bg-zinc-900/40 backdrop-blur-sm border border-white/5 rounded-full p-1.5 shadow-lg flex items-center gap-10">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activePage === item.id;

                    return (
                        <button
                            key={item.id}
                            onClick={() => onPageChange(item.id)}
                            className="relative flex flex-col items-center justify-center group"
                        >
                            <div className={`
                                flex items-center justify-center w-14 h-14 rounded-full transition-all duration-300
                                ${isActive
                                    ? 'bg-yellow-400/10 text-yellow-400 shadow-[0_0_20px_rgba(250,204,21,0.15)] transform scale-110'
                                    : 'text-zinc-500 hover:text-zinc-200 hover:bg-white/5'}
                            `}>
                                <Icon size={26} strokeWidth={isActive ? 2.5 : 2} />
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default BottomNavbar;
