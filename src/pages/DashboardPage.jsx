import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import api from '../utils/api';

const StatCard = ({ label, value, icon, color }) => (
  <div className="glass rounded-2xl p-5 card-hover">
    <div className="flex items-center gap-3 mb-2">
      <span className="text-2xl">{icon}</span>
      <span className="text-gray-400 text-sm">{label}</span>
    </div>
    <p className="text-3xl font-bold" style={{ color }}>{value}</p>
  </div>
);

export default function DashboardPage() {
  const { t } = useTranslation();
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [workouts, setWorkouts] = useState([]);
  const [stats, setStats] = useState({ totalWorkouts: 0, totalCalories: 0, totalCoins: 0 });
  const [reward, setReward] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [wRes, sRes, rRes] = await Promise.all([
          api.get(`/workouts?goal=${user?.fitnessGoal || ''}`),
          api.get('/progress/stats'),
          api.get('/rewards')
        ]);
        setWorkouts(wRes.data.slice(0, 3));
        setStats(sRes.data);
        setReward(rRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchData();
  }, [user]);

  const goalColors = { 'Fat Loss': '#FF6584', 'Muscle Gain': '#6C63FF', 'General Fitness': '#43E97B' };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-dark)' }}>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">
              {t('welcomeBack')}, <span className="gradient-text">{user?.name?.split(' ')[0]} 👋</span>
            </h1>
            <div className="flex items-center gap-2 mt-2">
              <span className="badge badge-purple">{t('yourGoal')}: {user?.fitnessGoal}</span>
              <span className="badge badge-green">🔥 {reward?.streak || 0} {t('streak')}</span>
              <span className={`badge ${user?.subscription?.plan === 'premium' ? 'badge-yellow' : 'badge-purple'}`}>
                {user?.subscription?.plan === 'premium' ? '⭐ Premium' : '🆓 Free'}
              </span>
            </div>
          </div>
          <button onClick={() => navigate('/workouts')}
            className="btn-gradient px-6 py-3 rounded-xl text-white font-semibold self-start md:self-auto">
            {t('startWorkout')} →
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard label={t('workoutsCompleted')} value={stats.totalWorkouts} icon="🏋️" color="#6C63FF" />
          <StatCard label={t('caloriesBurned')} value={stats.totalCalories} icon="🔥" color="#FF6584" />
          <StatCard label={t('coinsEarned')} value={user?.coins || 0} icon="🪙" color="#FFC107" />
          <StatCard label={t('streak')} value={`${reward?.streak || 0} days`} icon="⚡" color="#43E97B" />
        </div>

        {/* Recommended Workouts */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <span>💪</span> {t('recommendedWorkouts')}
          </h2>
          {loading ? (
            <div className="flex justify-center py-12"><div className="spinner" /></div>
          ) : (
            <div className="grid md:grid-cols-3 gap-4">
              {workouts.map(w => (
                <div key={w._id} className="glass rounded-2xl p-5 card-hover cursor-pointer"
                  onClick={() => navigate(`/workouts/${w._id}`)}>
                  <div className="flex items-center justify-between mb-3">
                    <span className={`badge badge-${w.difficulty === 'Beginner' ? 'green' : w.difficulty === 'Intermediate' ? 'yellow' : 'red'}`}>
                      {w.difficulty}
                    </span>
                    {w.isPremium && <span className="badge badge-yellow">⭐ Premium</span>}
                  </div>
                  <h3 className="font-bold text-lg mb-2">{w.title}</h3>
                  <p className="text-gray-400 text-sm mb-4 line-clamp-2">{w.description}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <span>⏱ {w.estimatedTime} {t('minutes')}</span>
                    <span>🔥 {w.caloriesBurned} kcal</span>
                    <span>🪙 +{w.coinsReward}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
          {workouts.length > 0 && (
            <button onClick={() => navigate('/workouts')} className="mt-4 text-sm"
              style={{ color: '#6C63FF' }}>
              View all workouts →
            </button>
          )}
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: t('exercises'), icon: '📋', to: '/exercises', color: '#6C63FF' },
            { label: t('progress'), icon: '📈', to: '/progress', color: '#43E97B' },
            { label: t('family'), icon: '👨‍👩‍👧', to: '/family', color: '#FF6584' },
            { label: t('subscription'), icon: '⭐', to: '/subscription', color: '#FFC107' }
          ].map(item => (
            <button key={item.to} onClick={() => navigate(item.to)}
              className="glass rounded-xl p-4 card-hover flex flex-col items-center gap-2">
              <span className="text-2xl">{item.icon}</span>
              <span className="text-sm font-medium" style={{ color: item.color }}>{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
