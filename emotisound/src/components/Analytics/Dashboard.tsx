import React, { useEffect, useState } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Emotion } from '../../types';
import { EMOTION_COLORS, EMOTION_LABELS } from '../../utils/emotionMapper';
import apiClient from '../../services/apiClient';
import { AlertCircle } from 'lucide-react';

interface EmotionStats {
    [key: string]: number;
}

export const Analytics: React.FC = () => {
    const [stats, setStats] = useState<EmotionStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            setError(null);
            const data = await apiClient.getEmotionStats();
            setStats(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load analytics');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="text-center py-8">Loading analytics...</div>;
    }

    if (error) {
        return (
            <div className="flex items-start gap-2 p-4 bg-yellow-50 border border-yellow-200 rounded text-yellow-700">
                <AlertCircle size={20} className="mt-0.5 flex-shrink-0" />
                <div>
                    <p className="font-medium">Analytics Not Available</p>
                    <p className="text-sm">{error}</p>
                </div>
            </div>
        );
    }

    if (!stats || Object.values(stats).every(v => v === 0)) {
        return (
            <div className="text-center py-8 text-gray-600">
                <p>No emotion data collected yet.</p>
                <p className="text-sm mt-2">Enable your camera and detection to start collecting analytics.</p>
            </div>
        );
    }

    // Prepare data for charts
    const chartData = (Object.entries(stats) as [Emotion, number][]).map(([emotion, count]) => ({
        name: EMOTION_LABELS[emotion],
        value: count,
        color: EMOTION_COLORS[emotion],
    }));

    const total = Object.values(stats).reduce((a, b) => a + b, 0);

    return (
        <div className="space-y-8">
            <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Emotion Distribution</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, value }) => `${name}: ${value}`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                        >
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip />
                    </PieChart>
                </ResponsiveContainer>
            </div>

            <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Detection Count</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="value" fill="#8884d8" radius={[8, 8, 0, 0]}>
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {chartData.map(({ name, value, color }) => (
                    <div key={name} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div
                            className="w-full h-2 rounded mb-2"
                            style={{ backgroundColor: color }}
                        />
                        <p className="text-sm text-gray-600">{name}</p>
                        <p className="text-2xl font-bold text-gray-800">{value}</p>
                        <p className="text-xs text-gray-500">
                            {((value / total) * 100).toFixed(1)}%
                        </p>
                    </div>
                ))}
            </div>

            <button
                onClick={loadStats}
                className="w-full py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm font-medium"
            >
                Refresh Analytics
            </button>
        </div>
    );
};
