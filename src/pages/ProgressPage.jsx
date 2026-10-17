import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import Navbar from '../components/Navbar';
import api from '../utils/api';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="glass rounded-lg p-3 text-sm">
        <p className="font-medium mb-1">{label}</p>
        {payload.map(p => (
          <p key={p.name} style={{ color: p.color }}>{p.name}: {p.value}</p>
        ))}
      </div>
    );
  }
  return null;
};

export default function ProgressPage() {
  const { t } = useTranslation();
  const [progressList, setProgressList] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get('/progress?limit=30'), api.get('/progress/stats')])
      .then(([pRes, sRes]) => {
        setProgressList(pRes.data);
        setStats(sRes.data);
      }).finally(() => setLoading(false));
  }, []);

  // Build last-7-day chart data
  const buildWeeklyData = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayStr = d.toLocaleDateString('en', { weekday: 'short' });
      const dateKey = d.toDateString();
      const dayProgress = progressList.filter(p => new Date(p.completedAt).toDateString() === dateKey);
      days.push({
        day: dayStr,
        Workouts: dayProgress.length,
        Calories: dayProgress.reduce((s, p) => s + p.caloriesBurned, 0),
        Coins: dayProgress.reduce((s, p) => s + p.coinsEarned, 0)
      });
    }
    return days;
  };

  const weeklyData = buildWeeklyData();

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-dark)' }}>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2">📈 {t('myProgress')}</h1>
        <p className="text-gray-400 mb-8">Track your fitness journey</p>

        {/* Total Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: t('workoutsCompleted'), val: stats.totalWorkouts || 0, icon: '🏋️', color: '#6C63FF' },
            { label: t('caloriesBurned'), val: stats.totalCalories || 0, icon: '🔥', color: '#FF6584' },
            { label: t('coins'), val: stats.totalCoins || 0, icon: '🪙', color: '#FFC107' },
            { label: 'This Week', val: stats.weeklyCount || 0, icon: '📅', color: '#43E97B' }
          ].map(s => (
            <div key={s.label} className="glass rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">{s.icon}</span>
                <span className="text-gray-400 text-sm">{s.label}</span>
              </div>
              <p className="text-3xl font-bold" style={{ color: s.color }}>{s.val}</p>
            </div>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><div className="spinner" /></div>
        ) : (
          <>
            {/* Weekly Calories Bar Chart */}
            <div className="glass rounded-2xl p-6 mb-6">
              <h3 className="font-semibold mb-4">🔥 {t('weeklyActivity')} – Calories</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="day" stroke="#a0aec0" tick={{ fill: '#a0aec0', fontSize: 12 }} />
                  <YAxis stroke="#a0aec0" tick={{ fill: '#a0aec0', fontSize: 12 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="Calories" fill="#FF6584" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Weekly Workouts Line Chart */}
            <div className="glass rounded-2xl p-6 mb-6">
              <h3 className="font-semibold mb-4">💪 Workouts & Coins This Week</h3>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="day" stroke="#a0aec0" tick={{ fill: '#a0aec0', fontSize: 12 }} />
                  <YAxis stroke="#a0aec0" tick={{ fill: '#a0aec0', fontSize: 12 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line type="monotone" dataKey="Workouts" stroke="#6C63FF" strokeWidth={2} dot={{ fill: '#6C63FF', r: 4 }} />
                  <Line type="monotone" dataKey="Coins" stroke="#FFC107" strokeWidth={2} dot={{ fill: '#FFC107', r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Recent Activity */}
            <div className="glass rounded-2xl p-6">
              <h3 className="font-semibold mb-4">📋 Recent Activity</h3>
              {progressList.length === 0 ? (
                <p className="text-gray-400 text-center py-8">No workouts yet. Complete your first workout!</p>
              ) : (
                <div className="space-y-3">
                  {progressList.slice(0, 10).map(p => (
                    <div key={p._id} className="flex items-center justify-between p-3 rounded-xl"
                      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <div>
                        <p className="font-medium text-sm">{p.workoutTitle || 'Workout'}</p>
                        <p className="text-xs text-gray-400">{new Date(p.completedAt).toLocaleDateString('en', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                      </div>
                      <div className="flex gap-4 text-sm">
                        <span style={{ color: '#FF6584' }}>🔥 {p.caloriesBurned} kcal</span>
                        <span style={{ color: '#FFC107' }}>🪙 +{p.coinsEarned}</span>
                        <span className="text-gray-400">⏱ {p.duration}m</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
