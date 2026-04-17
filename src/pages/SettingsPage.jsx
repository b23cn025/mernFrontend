import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import api from '../utils/api';

const ToggleSwitch = ({ checked, onChange, isDarkMode = true }) => (
  <button
    onClick={() => onChange(!checked)}
    style={{
      width: 44, 
      height: 24, 
      borderRadius: 12,
      background: checked ? '#6C63FF' : (isDarkMode ? 'rgba(200,200,220,0.3)' : 'rgba(50,50,80,0.3)'),
      border: `2px solid ${checked ? '#6C63FF' : (isDarkMode ? '#999999' : '#666666')}`,
      cursor: 'pointer', 
      position: 'relative',
      transition: 'all 0.3s ease', 
      flexShrink: 0,
      boxShadow: checked ? '0 0 8px rgba(108, 99, 255, 0.4)' : 'none'
    }}
  >
    <span style={{
      position: 'absolute', 
      top: 2,
      left: checked ? 22 : 2,
      width: 16, 
      height: 16, 
      borderRadius: '50%',
      background: isDarkMode ? '#ffffff' : '#000000', 
      transition: 'left 0.3s ease',
      display: 'block',
      boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
    }} />
  </button>
);

const SectionCard = ({ title, children }) => (
  <div className="glass rounded-2xl p-6 mb-5">
    <h3 className="font-bold text-base mb-4" style={{ color: '#6C63FF' }}>{title}</h3>
    {children}
  </div>
);

const ToggleRow = ({ label, desc, checked, onChange, isDarkMode = true }) => (
  <div className="flex items-center justify-between py-3"
    style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
    <div>
      <p className="text-sm font-medium text-white">{label}</p>
      {desc && <p className="text-xs text-gray-400 mt-0.5">{desc}</p>}
    </div>
    <ToggleSwitch checked={checked} onChange={onChange} isDarkMode={isDarkMode} />
  </div>
);

export default function SettingsPage() {
  const { t, i18n } = useTranslation();
  const { user, refreshUser, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('notifications');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const isDarkMode = localStorage.getItem('fp_theme') !== 'light';

  // Notifications
  const [notifs, setNotifs] = useState({
    workoutReminder: true,
    streakAlert: true,
    weeklyReport: true,
    prAchievement: true,
    restDay: false,
    goalDeadline: false,
  });

  // Goals
  const [goals, setGoals] = useState({
    primaryGoal: user?.fitnessGoal || 'General Fitness',
    daysPerWeek: 4,
    sessionLength: 60,
    targetWeight: '',
    targetDate: '',
    level: 'Intermediate',
  });

  // Privacy
  const [privacy, setPrivacy] = useState({
    publicProfile: false,
    shareActivity: true,
    showMetrics: false,
    analytics: true,
    twoFA: false,
  });

  // Units
  const [units, setUnits] = useState({
    weight: 'kg',
    distance: 'km',
    theme: localStorage.getItem('fp_theme') || 'dark',
    language: localStorage.getItem('fp_language') || 'en',
  });

  const tabs = [
    { id: 'notifications', label: t('tabNotifs', '🔔 Notifications') },
    { id: 'goals', label: t('tabGoals', '🎯 Goals & Plans') },
    { id: 'privacy', label: t('tabPrivacy', '🔒 Privacy & Security') },
    { id: 'units', label: t('tabPrefs', '⚙️ Preferences') },
  ];

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.patch('/users/settings', { notifs, goals, privacy, units });
      await refreshUser();
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      '⚠️ WARNING: This will permanently delete your account and all associated data. This action CANNOT be undone.\n\nAre you absolutely sure?'
    );
    
    if (!confirmed) return;

    const doubleConfirm = window.confirm(
      'This is your FINAL WARNING. All your workouts, progress, and personal data will be permanently deleted.\n\nType "DELETE" in the next prompt to confirm.'
    );

    if (!doubleConfirm) return;

    const userInput = prompt('Type DELETE to confirm account deletion:');
    
    if (userInput !== 'DELETE') {
      alert('Account deletion cancelled. You did not type DELETE.');
      return;
    }

    try {
      setSaving(true);
      await api.delete('/auth/account');
      alert('✅ Your account has been successfully deleted.');
      logout();
      navigate('/login');
    } catch (err) {
      alert(`❌ Error deleting account: ${err.response?.data?.message || err.message}`);
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-dark)' }}>
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">
            ⚙️ <span className="gradient-text">{t('settingsTitle', 'Settings')}</span>
          </h1>
          <p className="text-gray-400 mt-1 text-sm">{t('managePrefs', 'Manage your app preferences and account options.')}</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 flex-wrap mb-6">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className="px-4 py-2 rounded-xl text-sm font-medium transition-all"
              style={{
                background: activeTab === tab.id ? '#6C63FF' : 'rgba(255,255,255,0.06)',
                color: activeTab === tab.id ? '#fff' : '#9CA3AF',
                border: 'none', cursor: 'pointer'
              }}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <SectionCard title={t('activityReminders', 'Activity & Reminders')}>
            <ToggleRow label="Daily workout reminder" desc="Get nudged at your preferred time"
              checked={notifs.workoutReminder} onChange={v => setNotifs({ ...notifs, workoutReminder: v })} isDarkMode={isDarkMode} />
            <ToggleRow label="Streak alerts" desc="Don't break the chain"
              checked={notifs.streakAlert} onChange={v => setNotifs({ ...notifs, streakAlert: v })} isDarkMode={isDarkMode} />
            <ToggleRow label="Weekly summary" desc="Every Sunday morning"
              checked={notifs.weeklyReport} onChange={v => setNotifs({ ...notifs, weeklyReport: v })} isDarkMode={isDarkMode} />
            <ToggleRow label="PR achievements" desc="Celebrate personal records"
              checked={notifs.prAchievement} onChange={v => setNotifs({ ...notifs, prAchievement: v })} isDarkMode={isDarkMode} />
            <ToggleRow label="Rest day notice" desc="Recovery is training too"
              checked={notifs.restDay} onChange={v => setNotifs({ ...notifs, restDay: v })} isDarkMode={isDarkMode} />
            <ToggleRow label="Goal deadline reminders" desc="3 days before target date"
              checked={notifs.goalDeadline} onChange={v => setNotifs({ ...notifs, goalDeadline: v })} isDarkMode={isDarkMode} />
          </SectionCard>
        )}

        {/* Goals Tab */}
        {activeTab === 'goals' && (
          <>
            <SectionCard title={t('primaryGoal', 'Primary Goal')}>
              <div className="grid grid-cols-2 gap-3">
                {['Fat Loss', 'Muscle Gain', 'General Fitness', 'Endurance'].map(g => (
                  <button key={g} onClick={() => setGoals({ ...goals, primaryGoal: g })}
                    className="rounded-xl p-4 text-left transition-all"
                    style={{
                      background: goals.primaryGoal === g ? 'rgba(108,99,255,0.2)' : 'rgba(255,255,255,0.05)',
                      border: goals.primaryGoal === g ? '1px solid #6C63FF' : '1px solid rgba(255,255,255,0.1)',
                      cursor: 'pointer'
                    }}>
                    <p className="font-semibold text-sm"
                      style={{ color: goals.primaryGoal === g ? '#6C63FF' : '#fff' }}>{g}</p>
                  </button>
                ))}
              </div>
            </SectionCard>

            <SectionCard title={t('trainingPlan', 'Training Plan')}>
              <div className="mb-5">
                <label className="text-xs text-gray-400 block mb-2">Days per week</label>
                <div className="flex items-center gap-3">
                  <input type="range" min={1} max={7} step={1} value={goals.daysPerWeek}
                    onChange={e => setGoals({ ...goals, daysPerWeek: +e.target.value })}
                    style={{ flex: 1, accentColor: '#6C63FF' }} />
                  <span className="text-sm font-bold" style={{ color: '#6C63FF', minWidth: 48 }}>
                    {goals.daysPerWeek} days
                  </span>
                </div>
              </div>
              <div className="mb-5">
                <label className="text-xs text-gray-400 block mb-2">Session length</label>
                <div className="flex items-center gap-3">
                  <input type="range" min={20} max={120} step={5} value={goals.sessionLength}
                    onChange={e => setGoals({ ...goals, sessionLength: +e.target.value })}
                    style={{ flex: 1, accentColor: '#6C63FF' }} />
                  <span className="text-sm font-bold" style={{ color: '#43E97B', minWidth: 48 }}>
                    {goals.sessionLength} min
                  </span>
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-2">Experience level</label>
                <select value={goals.level} onChange={e => setGoals({ ...goals, level: e.target.value })}
                  className="w-full rounded-xl px-4 py-2 text-sm"
                  style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}>
                  <option>Beginner</option>
                  <option>Intermediate</option>
                  <option>Advanced</option>
                </select>
              </div>
            </SectionCard>

            <SectionCard title="Target">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-400 block mb-2">Target weight (kg)</label>
                  <input type="number" value={goals.targetWeight}
                    onChange={e => setGoals({ ...goals, targetWeight: e.target.value })}
                    placeholder="e.g. 75"
                    className="w-full rounded-xl px-4 py-2 text-sm"
                    style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }} />
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-2">Target date</label>
                  <input type="date" value={goals.targetDate}
                    onChange={e => setGoals({ ...goals, targetDate: e.target.value })}
                    className="w-full rounded-xl px-4 py-2 text-sm"
                    style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }} />
                </div>
              </div>
            </SectionCard>
          </>
        )}

        {/* Privacy Tab */}
        {activeTab === 'privacy' && (
          <>
            <SectionCard title={t('profileVis', 'Profile Visibility')}>
              <ToggleRow label="Public profile" desc="Anyone can view your profile and stats"
                checked={privacy.publicProfile} onChange={v => setPrivacy({ ...privacy, publicProfile: v })} isDarkMode={isDarkMode} />
              <ToggleRow label="Share activity feed" desc="Workouts visible to followers"
                checked={privacy.shareActivity} onChange={v => setPrivacy({ ...privacy, shareActivity: v })} isDarkMode={isDarkMode} />
              <ToggleRow label="Show body metrics" desc="Weight & measurements on profile"
                checked={privacy.showMetrics} onChange={v => setPrivacy({ ...privacy, showMetrics: v })} isDarkMode={isDarkMode} />
            </SectionCard>

            <SectionCard title={t('security', 'Security')}>
              <ToggleRow label="Two-factor authentication" desc="Secure login via authenticator app"
                checked={privacy.twoFA} onChange={v => setPrivacy({ ...privacy, twoFA: v })} isDarkMode={isDarkMode} />
              <ToggleRow label="Dark Mode" desc="Apply dark theme throughout the app"
                checked={units.theme === 'dark'} onChange={v => {
                  const newTheme = v ? 'dark' : 'light';
                  setUnits({ ...units, theme: newTheme });
                  document.documentElement.setAttribute('data-theme', newTheme);
                  localStorage.setItem('fp_theme', newTheme);
                }} isDarkMode={isDarkMode} />
              <ToggleRow label="Analytics & improvement" desc="Help improve the app with anonymised usage data"
                checked={privacy.analytics} onChange={v => setPrivacy({ ...privacy, analytics: v })} isDarkMode={isDarkMode} />
              <div className="mt-4">
                <button className="text-sm px-4 py-2 rounded-xl"
                  style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', color: '#9CA3AF', cursor: 'pointer' }}>
                  Change password →
                </button>
              </div>
            </SectionCard>

            <div className="glass rounded-2xl p-6"
              style={{ border: '1px solid rgba(255,101,132,0.3)' }}>
              <h3 className="font-bold text-base mb-1" style={{ color: '#FF6584' }}>{t('dangerZone', '⚠️ Danger Zone')}</h3>
              <p className="text-xs text-gray-400 mb-4">Permanently removes all your data. This cannot be undone.</p>
              <button
                onClick={handleDeleteAccount}
                disabled={saving}
                className="text-sm px-4 py-2 rounded-xl transition-all"
                style={{ 
                  background: 'rgba(255,101,132,0.12)', 
                  border: '1px solid #FF6584', 
                  color: '#FF6584', 
                  cursor: saving ? 'not-allowed' : 'pointer',
                  opacity: saving ? 0.7 : 1
                }}>
                {saving ? 'Deleting...' : 'Delete account'}
              </button>
            </div>
          </>
        )}

        {/* Preferences Tab */}
        {activeTab === 'units' && (
          <SectionCard title={t('appPrefs', 'App Preferences')}>
            {[
              { label: 'Weight unit', key: 'weight', options: ['kg', 'lbs'] },
              { label: 'Distance unit', key: 'distance', options: ['km', 'miles'] },
              { label: 'Language', key: 'language', options: ['en', 'te', 'hi'] },
            ].map(({ label, key, options }) => (
              <div key={key} className="flex items-center justify-between py-3"
                style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <span className="text-sm text-white">{label}</span>
                <select value={units[key]} onChange={e => {
                  const val = e.target.value;
                  setUnits({ ...units, [key]: val });
                  if (key === 'language') {
                    localStorage.setItem('fp_language', val);
                    i18n.changeLanguage(val);
                  }
                }}
                  className="rounded-xl px-3 py-1.5 text-sm"
                  style={{ 
                    background: '#1a1a2e', 
                    border: '1px solid rgba(108, 99, 255, 0.3)', 
                    color: '#ffffff',
                    colorScheme: 'dark'
                  }}>
                  {options.map(o => <option key={o} value={o} style={{ background: '#1a1a2e', color: '#ffffff' }}>{o}</option>)}
                </select>
              </div>
            ))}
          </SectionCard>
        )}

        {/* Save Button */}
        <div className="flex justify-end mt-6 gap-3">
          {saved && <span className="text-sm self-center" style={{ color: '#43E97B' }}>✓ {t('saved', 'Saved!')}</span>}
          <button onClick={handleSave} disabled={saving}
            className="btn-gradient px-6 py-3 rounded-xl text-white font-semibold">
            {saving ? t('loading', 'Saving...') : t('saveChanges', 'Save Changes')}
          </button>
        </div>

      </div>
    </div>
  );
}
