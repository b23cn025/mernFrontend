import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

export default function LoginPage() {
  const { t } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [form, setForm] = useState({
    name: '', email: '', password: '', age: '', height: '', weight: '', fitnessGoal: 'General Fitness'
  });

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const endpoint = isRegister ? '/auth/register' : '/auth/login';
      const payload = isRegister ? form : { email: form.email, password: form.password };
      const res = await api.post(endpoint, payload);
      
      // Direct login (no 2FA)
      login(res.data.user, res.data.token);
      navigate('/dashboard');
    } catch (err) {
      if (err.response?.status === 502 || !err.response) {
        setError('⚠️ Cannot connect to server. Please check backend is running.');
      } else if (err.response?.status === 500) {
        setError('⚠️ Server error. Please try again.');
      } else {
        setError(err.response?.data?.message || 'Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: 'var(--bg-dark)' }}>
      {/* Animated background blobs */}
      <div className="absolute top-0 left-0 w-96 h-96 rounded-full opacity-20 animate-float"
        style={{ background: 'radial-gradient(circle, #6C63FF, transparent)', filter: 'blur(60px)' }} />
      <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full opacity-20"
        style={{ background: 'radial-gradient(circle, #FF6584, transparent)', filter: 'blur(60px)', animation: 'float 4s ease-in-out infinite reverse' }} />

      <div className="glass rounded-2xl p-8 w-full max-w-md mx-4 relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl btn-gradient flex items-center justify-center mx-auto mb-3">
            <span className="text-white font-black text-2xl">FP</span>
          </div>
          <h1 className="text-2xl font-bold gradient-text">FitnessPass</h1>
          <p className="text-gray-400 text-sm mt-1">
            {isRegister ? 'Create your account' : 'Welcome back! Sign in to continue'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg text-sm text-center"
            style={{ background: 'rgba(255,101,132,0.1)', color: '#FF6584', border: '1px solid rgba(255,101,132,0.3)' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">{t('name')}</label>
                <input name="name" value={form.name} onChange={handleChange} required
                  placeholder="John Doe" className="input-field" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">{t('age')}</label>
                  <input name="age" type="number" value={form.age} onChange={handleChange}
                    placeholder="25" className="input-field" />
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">{t('height')}</label>
                  <input name="height" type="number" value={form.height} onChange={handleChange}
                    placeholder="170" className="input-field" />
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">{t('weight')}</label>
                  <input name="weight" type="number" value={form.weight} onChange={handleChange}
                    placeholder="70" className="input-field" />
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">{t('fitnessGoal')}</label>
                <select name="fitnessGoal" value={form.fitnessGoal} onChange={handleChange} className="input-field"
                  style={{ background: 'rgba(18,18,42,0.8)' }}>
                  <option value="Fat Loss">{t('fatLoss')}</option>
                  <option value="Muscle Gain">{t('muscleGain')}</option>
                  <option value="General Fitness">{t('generalFitness')}</option>
                </select>
              </div>
            </>
          )}

          <div>
            <label className="text-sm text-gray-400 mb-1 block">{t('email')}</label>
            <input name="email" type="email" value={form.email} onChange={handleChange} required
              placeholder="john@example.com" className="input-field" />
          </div>
          <div>
            <label className="text-sm text-gray-400 mb-1 block">{t('password')}</label>
            <input name="password" type="password" value={form.password} onChange={handleChange} required
              placeholder="••••••••" className="input-field" />
          </div>

          <button type="submit" disabled={loading}
            className="btn-gradient w-full py-3 rounded-xl text-white font-semibold text-base mt-2"
            style={{ opacity: loading ? 0.7 : 1 }}>
            {loading ? t('loading') : (isRegister ? t('register') : t('login'))}
          </button>
        </form>

        <p className="text-center text-gray-400 text-sm mt-6">
          {isRegister ? 'Already have an account? ' : "Don't have an account? "}
          <button onClick={() => { setIsRegister(!isRegister); setError(''); }}
            className="font-semibold" style={{ color: '#6C63FF' }}>
            {isRegister ? t('login') : t('register')}
          </button>
        </p>
        
      </div>
    </div>
  );
}
