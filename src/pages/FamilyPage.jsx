import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Navbar from '../components/Navbar';
import api from '../utils/api';

export default function FamilyPage() {
  const { t } = useTranslation();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', age: '', fitnessGoal: 'General Fitness' });
  const [adding, setAdding] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const fetchMembers = () => {
    api.get('/family').then(r => setMembers(r.data)).finally(() => setLoading(false));
  };

  useEffect(() => { fetchMembers(); }, []);

  const handleAdd = async e => {
    e.preventDefault();
    setAdding(true);
    try {
      await api.post('/family/add', form);
      setForm({ name: '', age: '', fitnessGoal: 'General Fitness' });
      setShowForm(false);
      fetchMembers();
    } catch (err) {
      alert(err.response?.data?.message || 'Error adding member.');
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this family member?')) return;
    await api.delete(`/family/${id}`);
    fetchMembers();
  };

  const goalIcon = { 'Fat Loss': '🔥', 'Muscle Gain': '💪', 'General Fitness': '⚡' };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-dark)' }}>
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">👨‍👩‍👧 {t('familyPlan')}</h1>
            <p className="text-gray-400 mt-1">Track fitness for your whole family</p>
          </div>
          <button onClick={() => setShowForm(!showForm)}
            className="btn-gradient px-5 py-2.5 rounded-xl text-white font-semibold text-sm">
            + {t('addMember')}
          </button>
        </div>

        {showForm && (
          <div className="glass rounded-2xl p-6 mb-6">
            <h3 className="font-semibold mb-4">{t('addMember')}</h3>
            <form onSubmit={handleAdd} className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="text-gray-400 text-sm mb-1 block">{t('memberName')} *</label>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                  required placeholder="Family member name" className="input-field" />
              </div>
              <div>
                <label className="text-gray-400 text-sm mb-1 block">{t('age')}</label>
                <input type="number" value={form.age} onChange={e => setForm({ ...form, age: e.target.value })}
                  placeholder="Age" className="input-field" />
              </div>
              <div>
                <label className="text-gray-400 text-sm mb-1 block">{t('fitnessGoal')}</label>
                <select value={form.fitnessGoal} onChange={e => setForm({ ...form, fitnessGoal: e.target.value })}
                  className="input-field" style={{ background: 'rgba(18,18,42,0.8)' }}>
                  <option value="Fat Loss">{t('fatLoss')}</option>
                  <option value="Muscle Gain">{t('muscleGain')}</option>
                  <option value="General Fitness">{t('generalFitness')}</option>
                </select>
              </div>
              <div className="md:col-span-3 flex gap-3">
                <button type="submit" disabled={adding}
                  className="btn-gradient px-6 py-2.5 rounded-xl text-white font-semibold text-sm">
                  {adding ? t('loading') : t('add')}
                </button>
                <button type="button" onClick={() => setShowForm(false)}
                  className="px-6 py-2.5 rounded-xl text-sm font-medium"
                  style={{ background: 'rgba(255,255,255,0.05)', color: '#a0aec0', border: '1px solid rgba(255,255,255,0.1)' }}>
                  {t('cancel')}
                </button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-20"><div className="spinner" /></div>
        ) : members.length === 0 ? (
          <div className="glass rounded-2xl p-12 text-center">
            <p className="text-5xl mb-4">👨‍👩‍👧</p>
            <p className="text-gray-400">No family members added yet.</p>
            <p className="text-gray-500 text-sm mt-1">Click "Add Family Member" to get started.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {members.map(m => (
              <div key={m._id} className="glass rounded-2xl p-5 card-hover">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-full btn-gradient flex items-center justify-center text-white font-bold text-lg">
                    {m.name.charAt(0).toUpperCase()}
                  </div>
                  <button onClick={() => handleDelete(m._id)}
                    className="text-gray-500 hover:text-red-400 transition-colors text-sm">
                    🗑️
                  </button>
                </div>
                <h3 className="font-bold text-lg">{m.name}</h3>
                {m.age && <p className="text-gray-400 text-sm">Age: {m.age}</p>}
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-lg">{goalIcon[m.fitnessGoal]}</span>
                  <span className="badge badge-purple text-xs">{m.fitnessGoal}</span>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-lg p-2" style={{ background: 'rgba(108,99,255,0.1)' }}>
                    <p className="text-sm font-bold" style={{ color: '#6C63FF' }}>{m.workoutsCompleted}</p>
                    <p className="text-xs text-gray-400">Workouts</p>
                  </div>
                  <div className="rounded-lg p-2" style={{ background: 'rgba(255,101,132,0.1)' }}>
                    <p className="text-sm font-bold" style={{ color: '#FF6584' }}>{m.caloriesBurned}</p>
                    <p className="text-xs text-gray-400">Calories</p>
                  </div>
                  <div className="rounded-lg p-2" style={{ background: 'rgba(255,193,7,0.1)' }}>
                    <p className="text-sm font-bold" style={{ color: '#FFC107' }}>{m.coinsEarned}</p>
                    <p className="text-xs text-gray-400">Coins</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
