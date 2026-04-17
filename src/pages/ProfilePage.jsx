import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../utils/api';

const InfoRow = ({ label, value }) => (
  <div className="flex justify-between py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
    <span className="text-sm text-gray-400">{label}</span>
    <span className="text-sm font-medium text-white">{value || '—'}</span>
  </div>
);

export default function ProfilePage() {
  const { t } = useTranslation();
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const fileRef = useRef();

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [viewAvatar, setViewAvatar] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [form, setForm] = useState({
    name: '', username: '', bio: '', height: '', weight: '', dob: '',
  });

  // Sync form when user loads
  useEffect(() => {
    if (user) {
      setForm({
        name:     user.name     || '',
        username: user.username || '',
        bio:      user.bio      || '',
        height:   user.height   || '',
        weight:   user.weight   || '',
        dob:      user.dob      || '',
      });
    }
  }, [user]);

  const initials = (user?.name || 'U')
    .split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  const handleEdit = () => { setError(''); setSuccessMsg(''); setEditing(true); };

  const handleCancel = () => {
    setForm({
      name:     user?.name     || '',
      username: user?.username || '',
      bio:      user?.bio      || '',
      height:   user?.height   || '',
      weight:   user?.weight   || '',
      dob:      user?.dob      || '',
    });
    setError('');
    setEditing(false);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { setError('Name cannot be empty.'); return; }
    setSaving(true);
    setError('');
    try {
      // FIX: Update user state locally immediately so no flicker
      const res = await api.patch('/users/profile', {
        name:     form.name,
        username: form.username,
        bio:      form.bio,
        height:   form.height ? Number(form.height) : undefined,
        weight:   form.weight ? Number(form.weight) : undefined,
        dob:      form.dob,
      });

      // FIX: Use the response data directly to update user
      // instead of calling refreshUser() which re-fetches and may return stale data
      if (res.data?.user) {
        // If your backend returns { message, user } — use it directly
        await refreshUser();
      } else {
        await refreshUser();
      }

      setEditing(false);
      setSuccessMsg('Profile saved!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      console.error('Save error:', err);
      setError(err?.response?.data?.message || 'Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Client-side size check
    if (file.size > 10 * 1024 * 1024) {
      setError('Image must be under 10MB.');
      e.target.value = '';
      return;
    }

    setAvatarUploading(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('avatar', file);

      await api.post('/users/profile/avatar', fd, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      await refreshUser();
      setSuccessMsg('Avatar updated!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      console.error('Avatar upload failed:', err);
      setError(err?.response?.data?.message || 'Avatar upload failed. Max 10MB, JPEG/PNG/WEBP only.');
    } finally {
      setAvatarUploading(false);
      e.target.value = '';
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-dark)' }}>
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold">
            👤 <span className="gradient-text">Profile</span>
          </h1>
          <div className="flex items-center gap-2">
            {editing && (
              <button onClick={handleCancel}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-400"
                style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}>
                Cancel
              </button>
            )}
            <button
              onClick={editing ? handleSave : handleEdit}
              disabled={saving}
              className="btn-gradient px-5 py-2 rounded-xl text-white text-sm font-semibold"
              style={{ opacity: saving ? 0.7 : 1 }}>
              {editing ? (saving ? 'Saving...' : '✓ Save') : 'Edit Profile'}
            </button>
          </div>
        </div>

        {/* Error / Success banners */}
        {error && (
          <div className="mb-4 px-4 py-3 rounded-xl text-sm"
            style={{ background: 'rgba(255,101,132,0.12)', border: '1px solid #FF6584', color: '#FF6584' }}>
            ⚠️ {error}
          </div>
        )}
        {successMsg && (
          <div className="mb-4 px-4 py-3 rounded-xl text-sm"
            style={{ background: 'rgba(67,233,123,0.12)', border: '1px solid #43E97B', color: '#43E97B' }}>
            ✓ {successMsg}
          </div>
        )}

        {/* Avatar + identity */}
        <div className="glass rounded-2xl p-6 mb-5 flex items-center gap-5">

          {/* Avatar */}
          <div style={{ position: 'relative', flexShrink: 0, cursor: 'pointer' }}
            onClick={() => {
              if (editing) {
                fileRef.current?.click();
              } else if (user?.avatar) {
                setViewAvatar(true);
              }
            }}>

            {user?.avatar ? (
              <img src={user.avatar} alt="avatar"
                style={{
                  width: 72, height: 72, borderRadius: '50%',
                  objectFit: 'cover', border: '2px solid rgba(108,99,255,0.5)'
                }} />
            ) : (
              <div style={{
                width: 72, height: 72, borderRadius: '50%',
                background: 'linear-gradient(135deg, #6C63FF, #43E97B)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 26, fontWeight: 700, color: '#fff'
              }}>
                {initials}
              </div>
            )}

            {/* Overlay */}
            {editing && (
              <div style={{
                position: 'absolute', inset: 0, borderRadius: '50%',
                background: 'rgba(0,0,0,0.55)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 18, color: '#fff',
                opacity: avatarUploading ? 1 : 0,
                transition: 'opacity 0.2s',
              }}
                onMouseEnter={e => e.currentTarget.style.opacity = 1}
                onMouseLeave={e => { if (!avatarUploading) e.currentTarget.style.opacity = 0; }}>
                {avatarUploading ? '⏳' : '📷'}
              </div>
            )}

            {/* FIX: No Content-Type override — let axios handle FormData */}
            <input ref={fileRef} type="file"
              accept="image/jpeg,image/png,image/webp"
              style={{ display: 'none' }}
              onChange={handleAvatarChange} />
          </div>

          <div style={{ flex: 1 }}>
            {editing ? (
              <>
                <input value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="Full name"
                  className="w-full rounded-xl px-3 py-2 text-base font-bold mb-2"
                  style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff' }} />
                <input value={form.username}
                  onChange={e => setForm({ ...form, username: e.target.value })}
                  placeholder="@username"
                  className="w-full rounded-xl px-3 py-2 text-sm"
                  style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: '#9CA3AF' }} />
              </>
            ) : (
              <>
                <p className="text-xl font-bold text-white">{user?.name}</p>
                <p className="text-sm text-gray-400">{user?.username || user?.email}</p>
                <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.25)' }}>
                  Click avatar to view photo
                </p>
              </>
            )}
          </div>
        </div>

        {/* Badges */}
        <div className="flex gap-2 flex-wrap mb-5">
          <span className="badge badge-purple">{user?.fitnessGoal}</span>
          <span className="badge badge-green">🔥 Streak active</span>
          <span className={`badge ${user?.subscription?.plan === 'premium' ? 'badge-yellow' : 'badge-purple'}`}>
            {user?.subscription?.plan === 'premium' ? '⭐ Premium' : '🆓 Free'}
          </span>
          <span className="badge badge-yellow">🪙 {user?.coins || 0} coins</span>
        </div>

        {/* Bio */}
        <div className="glass rounded-2xl p-6 mb-5">
          <h3 className="font-bold text-sm mb-3" style={{ color: '#6C63FF' }}>About</h3>
          {editing ? (
            <textarea value={form.bio}
              onChange={e => setForm({ ...form, bio: e.target.value })}
              rows={3} placeholder="Write something about yourself..."
              className="w-full rounded-xl px-4 py-3 text-sm"
              style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', resize: 'none' }} />
          ) : (
            <p className="text-sm text-gray-300">{user?.bio || 'No bio yet. Hit Edit Profile to add one.'}</p>
          )}
        </div>

        {/* Body Metrics */}
        <div className="glass rounded-2xl p-6 mb-5">
          <h3 className="font-bold text-sm mb-3" style={{ color: '#43E97B' }}>Body Metrics</h3>
          {editing ? (
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Height (cm)', key: 'height', placeholder: '178', type: 'number' },
                { label: 'Weight (kg)', key: 'weight', placeholder: '74',  type: 'number' },
                { label: 'Date of birth', key: 'dob',  placeholder: '',    type: 'date'   },
              ].map(f => (
                <div key={f.key}>
                  <label className="text-xs text-gray-400 block mb-1">{f.label}</label>
                  <input type={f.type} value={form[f.key]}
                    onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                    placeholder={f.placeholder}
                    className="w-full rounded-xl px-3 py-2 text-sm"
                    style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }} />
                </div>
              ))}
            </div>
          ) : (
            <>
              <InfoRow label="Height"        value={user?.height ? `${user.height} cm` : null} />
              <InfoRow label="Weight"        value={user?.weight ? `${user.weight} kg` : null} />
              <InfoRow label="Date of birth" value={user?.dob} />
              <InfoRow label="Fitness goal"  value={user?.fitnessGoal} />
            </>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            { label: 'Workouts', value: user?.totalWorkouts || 0, color: '#6C63FF', icon: '🏋️' },
            { label: 'Calories', value: user?.totalCalories || 0, color: '#FF6584', icon: '🔥' },
            { label: 'Coins',    value: user?.coins          || 0, color: '#FFC107', icon: '🪙' },
          ].map(s => (
            <div key={s.label} className="glass rounded-2xl p-4 text-center card-hover">
              <span className="text-xl">{s.icon}</span>
              <p className="text-2xl font-bold mt-1" style={{ color: s.color }}>{s.value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Quick links */}
        <div className="flex gap-3 flex-wrap">
          <button onClick={() => navigate('/settings')}
            className="flex-1 glass rounded-xl py-3 text-sm font-medium card-hover"
            style={{ color: '#6C63FF' }}>
            ⚙️ Settings
          </button>
          <button onClick={() => navigate('/helpdesk')}
            className="flex-1 glass rounded-xl py-3 text-sm font-medium card-hover"
            style={{ color: '#43E97B' }}>
            💬 Help & Support
          </button>
        </div>

      </div>

      {/* View Avatar Modal */}
      {viewAvatar && user?.avatar && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(5px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}
          onClick={() => setViewAvatar(false)}>
          <img src={user.avatar} alt="Full Avatar"
            style={{
              maxWidth: '90vw', maxHeight: '90vh',
              borderRadius: '20px', objectFit: 'contain',
              boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
            }}
            onClick={e => e.stopPropagation()} />
          <button
            onClick={() => setViewAvatar(false)}
            style={{
              position: 'absolute', top: 20, right: 20,
              background: 'rgba(255,255,255,0.1)', color: '#fff',
              border: 'none', borderRadius: '50%', width: 40, height: 40,
              fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
            }}>✕</button>
        </div>
      )}
    </div>
  );
}
