import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Navbar from '../components/Navbar';
import api from '../utils/api';

const MUSCLES = ['Biceps', 'Triceps', 'Chest', 'Back', 'Legs', 'Shoulders', 'Forearms'];
const GOALS = ['Fat Loss', 'Muscle Gain', 'General Fitness'];
const DIFFICULTIES = ['Beginner', 'Intermediate', 'Advanced'];

function ExerciseForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState(initial || {
    name: '', targetMuscle: 'Biceps', difficulty: 'Beginner',
    equipment: '', instructions: { en: '', te: '' }, youtubeUrl: '', caloriesPerMin: 5
  });
  const h = e => {
    const { name, value } = e.target;
    if (name === 'en' || name === 'te') setForm(f => ({ ...f, instructions: { ...f.instructions, [name]: value } }));
    else setForm(f => ({ ...f, [name]: value }));
  };
  return (
    <div className="glass rounded-2xl p-6 mb-4">
      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="text-gray-400 text-sm mb-1 block">Name *</label>
          <input name="name" value={form.name} onChange={h} required className="input-field" />
        </div>
        <div>
          <label className="text-gray-400 text-sm mb-1 block">Target Muscle</label>
          <select name="targetMuscle" value={form.targetMuscle} onChange={h} className="input-field" style={{ background: 'rgba(18,18,42,0.8)' }}>
            {MUSCLES.map(m => <option key={m}>{m}</option>)}
          </select>
        </div>
        <div>
          <label className="text-gray-400 text-sm mb-1 block">Difficulty</label>
          <select name="difficulty" value={form.difficulty} onChange={h} className="input-field" style={{ background: 'rgba(18,18,42,0.8)' }}>
            {DIFFICULTIES.map(d => <option key={d}>{d}</option>)}
          </select>
        </div>
        <div>
          <label className="text-gray-400 text-sm mb-1 block">Equipment</label>
          <input name="equipment" value={form.equipment} onChange={h} className="input-field" />
        </div>
        <div>
          <label className="text-gray-400 text-sm mb-1 block">YouTube URL</label>
          <input name="youtubeUrl" value={form.youtubeUrl} onChange={h} className="input-field" />
        </div>
        <div>
          <label className="text-gray-400 text-sm mb-1 block">Calories/min</label>
          <input name="caloriesPerMin" type="number" value={form.caloriesPerMin} onChange={h} className="input-field" />
        </div>
        <div className="md:col-span-2">
          <label className="text-gray-400 text-sm mb-1 block">Instructions (English) *</label>
          <textarea name="en" value={form.instructions.en} onChange={h} rows={3} className="input-field" />
        </div>
        <div className="md:col-span-2">
          <label className="text-gray-400 text-sm mb-1 block">Instructions (Telugu)</label>
          <textarea name="te" value={form.instructions.te} onChange={h} rows={3} className="input-field" />
        </div>
      </div>
      <div className="flex gap-3">
        <button onClick={() => onSave(form)} className="btn-gradient px-5 py-2 rounded-xl text-white text-sm font-semibold">Save</button>
        <button onClick={onCancel} className="px-5 py-2 rounded-xl text-sm font-medium"
          style={{ background: 'rgba(255,255,255,0.05)', color: '#a0aec0', border: '1px solid rgba(255,255,255,0.1)' }}>Cancel</button>
      </div>
    </div>
  );
}

export default function AdminPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('stats');
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [workouts, setWorkouts] = useState([]);
  const [showExForm, setShowExForm] = useState(false);
  const [editEx, setEditEx] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/admin/stats').then(r => setStats(r.data));
  }, []);

  useEffect(() => {
    if (activeTab === 'users') api.get('/admin/users').then(r => setUsers(r.data));
    if (activeTab === 'exercises') api.get('/exercises').then(r => setExercises(r.data));
    if (activeTab === 'workouts') api.get('/workouts').then(r => setWorkouts(r.data));
  }, [activeTab]);

  const handleSaveExercise = async (form) => {
    try {
      if (editEx) { await api.put(`/exercises/${editEx._id}`, form); setEditEx(null); }
      else { await api.post('/exercises', form); setShowExForm(false); }
      api.get('/exercises').then(r => setExercises(r.data));
    } catch (err) { alert(err.response?.data?.message || 'Error saving exercise.'); }
  };

  const handleDeleteExercise = async (id) => {
    if (!window.confirm('Delete this exercise?')) return;
    await api.delete(`/exercises/${id}`);
    setExercises(prev => prev.filter(e => e._id !== id));
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    await api.delete(`/admin/users/${id}`);
    setUsers(prev => prev.filter(u => u._id !== id));
  };

  const TABS = [
    { id: 'stats', label: '📊 Stats' },
    { id: 'users', label: '👥 Users' },
    { id: 'exercises', label: '💪 Exercises' },
    { id: 'workouts', label: '🏋️ Workouts' }
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-dark)' }}>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">⚙️ {t('admin')} Panel</h1>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className="px-4 py-2 rounded-xl text-sm font-medium transition-all"
              style={activeTab === tab.id
                ? { background: 'rgba(108,99,255,0.25)', color: '#6C63FF', border: '1px solid #6C63FF' }
                : { background: 'rgba(255,255,255,0.05)', color: '#a0aec0', border: '1px solid rgba(255,255,255,0.1)' }}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Stats Tab */}
        {activeTab === 'stats' && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {[
              { label: 'Total Users', val: stats.totalUsers, icon: '👥', color: '#6C63FF' },
              { label: 'Premium Users', val: stats.premiumUsers, icon: '⭐', color: '#FFC107' },
              { label: 'Exercises', val: stats.totalExercises, icon: '💪', color: '#43E97B' },
              { label: 'Workouts', val: stats.totalWorkouts, icon: '🏋️', color: '#FF6584' },
              { label: 'Completions', val: stats.totalProgress, icon: '✅', color: '#6C63FF' }
            ].map(s => (
              <div key={s.label} className="glass rounded-2xl p-5 card-hover">
                <p className="text-2xl mb-1">{s.icon}</p>
                <p className="text-2xl font-bold" style={{ color: s.color }}>{s.val ?? '–'}</p>
                <p className="text-gray-400 text-xs mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="glass rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.05)' }}>
                  {['Name', 'Email', 'Goal', 'Plan', 'Coins', 'Role', ''].map(h => (
                    <th key={h} className="p-3 text-left text-gray-400 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u._id} style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    <td className="p-3 font-medium">{u.name}</td>
                    <td className="p-3 text-gray-400">{u.email}</td>
                    <td className="p-3 text-gray-400">{u.fitnessGoal}</td>
                    <td className="p-3">
                      <span className={`badge ${u.subscription?.plan === 'premium' ? 'badge-yellow' : 'badge-purple'}`}>
                        {u.subscription?.plan}
                      </span>
                    </td>
                    <td className="p-3 text-yellow-400">🪙 {u.coins}</td>
                    <td className="p-3">
                      <span className={`badge ${u.role === 'admin' ? 'badge-red' : 'badge-green'}`}>{u.role}</span>
                    </td>
                    <td className="p-3">
                      {u.role !== 'admin' && (
                        <button onClick={() => handleDeleteUser(u._id)} className="text-gray-500 hover:text-red-400 text-xs">🗑️</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Exercises Tab */}
        {activeTab === 'exercises' && (
          <div>
            {!showExForm && !editEx && (
              <button onClick={() => setShowExForm(true)}
                className="btn-gradient px-5 py-2.5 rounded-xl text-white text-sm font-semibold mb-4">
                + Add Exercise
              </button>
            )}
            {showExForm && !editEx && <ExerciseForm onSave={handleSaveExercise} onCancel={() => setShowExForm(false)} />}
            {editEx && <ExerciseForm initial={editEx} onSave={handleSaveExercise} onCancel={() => setEditEx(null)} />}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {exercises.map(ex => (
                <div key={ex._id} className="glass rounded-xl p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold">{ex.name}</p>
                      <p className="text-gray-400 text-xs mt-1">{ex.targetMuscle} · {ex.difficulty}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => { setEditEx(ex); setShowExForm(false); }}
                        className="text-purple-400 hover:text-purple-300 text-xs">✏️</button>
                      <button onClick={() => handleDeleteExercise(ex._id)}
                        className="text-gray-500 hover:text-red-400 text-xs">🗑️</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Workouts Tab */}
        {activeTab === 'workouts' && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {workouts.map(w => (
              <div key={w._id} className="glass rounded-xl p-4">
                <p className="font-semibold">{w.title}</p>
                <p className="text-gray-400 text-xs mt-1">{w.goal} · {w.difficulty}</p>
                <div className="flex gap-2 mt-2 text-xs text-gray-400">
                  <span>⏱ {w.estimatedTime}m</span>
                  <span>🔥 {w.caloriesBurned}</span>
                  <span>🪙 {w.coinsReward}</span>
                  {w.isPremium && <span className="badge badge-yellow">Premium</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
