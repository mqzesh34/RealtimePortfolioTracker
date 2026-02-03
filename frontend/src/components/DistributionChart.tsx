import { memo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#8dd1e1', '#a4de6c', '#d0ed57'];

interface DistributionChartProps {
    data: Array<{ name: string; value: number }>;
}

const DistributionChart = memo(({ data }: DistributionChartProps) => {
    return (
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-6 h-80 flex flex-col">
            <h3 className="text-zinc-100 font-medium mb-4">Varlık Dağılımı</h3>
            <div className="flex-1 w-full min-h-0">
                {data.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                                isAnimationActive={false}
                                label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                                    const RADIAN = Math.PI / 180;
                                    const r = 25 + innerRadius + (outerRadius - innerRadius);
                                    const ma = midAngle ?? 0; // Default to 0 if undefined
                                    const p = percent ?? 0;

                                    const x = cx + r * Math.cos(-ma * RADIAN);
                                    const y = cy + r * Math.sin(-ma * RADIAN);

                                    return (
                                        <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize="11px">
                                            {`${(p * 100).toFixed(0)}%`}
                                        </text>
                                    );
                                }}
                            >
                                {data.map((_, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="rgba(0,0,0,0)" />
                                ))}
                            </Pie>
                            <Legend
                                iconType="circle"
                                wrapperStyle={{ fontSize: '11px', color: '#a1a1aa' }}
                                formatter={(value) => {
                                    return value;
                                }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="flex items-center justify-center h-full text-zinc-500 text-sm">
                        Portföy boş
                    </div>
                )}
            </div>
        </div>
    );
});

export default DistributionChart;
