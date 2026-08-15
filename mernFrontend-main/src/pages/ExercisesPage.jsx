import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import api from '../utils/api';
import i18n from '../i18n/i18n';

const MUSCLES = ['All', 'Biceps', 'Triceps', 'Chest', 'Back', 'Legs', 'Shoulders', 'Forearms'];
const DIFFICULTIES = ['All', 'Beginner', 'Intermediate', 'Advanced'];

const diffBadge = { Beginner: 'badge-green', Intermediate: 'badge-yellow', Advanced: 'badge-red' };

function ExerciseModal({ exercise, onClose, isPremium }) {
  const { t } = useTranslation();
  const lang = i18n.language;
  if (!exercise) return null;

  // Prevent accessing locked exercises
  if (!isPremium) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}
        onClick={onClose}>
        <div className="glass rounded-2xl max-w-2xl w-full p-8 text-center"
          onClick={e => e.stopPropagation()}>
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold mb-2">This Exercise is Locked</h2>
          <p className="text-gray-400 mb-6">Upgrade to Premium to unlock all exercises and advanced features.</p>
          <button onClick={onClose} className="btn-gradient px-6 py-2 rounded-xl text-white font-semibold">
            Close
          </button>
        </div>
      </div>
    );
  }

  const videoId = exercise.youtubeUrl?.split('v=')[1]?.split('&')[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}>
      <div className="glass rounded-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}>
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold">{exercise.name}</h2>
            <div className="flex gap-2 mt-2">
              <span className={`badge ${diffBadge[exercise.difficulty]}`}>{exercise.difficulty}</span>
              <span className="badge badge-purple">{exercise.targetMuscle}</span>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl leading-none">×</button>
        </div>

        {/* YouTube Embed */}
        {videoId && (
          <div className="rounded-xl overflow-hidden mb-5" style={{ aspectRatio: '16/9' }}>
            <iframe
              width="100%" height="100%"
              src={`https://www.youtube.com/embed/${videoId}`}
              title={exercise.name}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              style={{ border: 'none' }}
            />
          </div>
        )}

        <div className="space-y-4">
          <div>
            <p className="text-gray-400 text-sm mb-1">🏋️ {t('equipment')}</p>
            <p className="font-medium">{exercise.equipment}</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm mb-2">📝 {t('instructions')}</p>
            <p className="text-gray-300 leading-relaxed">
              {lang === 'te' && exercise.instructions?.te ? exercise.instructions.te : exercise.instructions?.en}
            </p>
          </div>
          <div className="flex gap-4 text-sm">
            <span className="text-gray-400">🔥 ~{exercise.caloriesPerMin} kcal/min</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ExercisesPage() {
  const { t } = useTranslation();
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [exercises, setExercises] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [muscle, setMuscle] = useState('All');
  const [difficulty, setDifficulty] = useState('All');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSidebar, setShowSidebar] = useState(true);

  // Check if user has premium or daily subscription
  const isPremium = user?.subscription?.plan === 'premium' || user?.subscription?.plan === 'daily';

  // Refresh user data when page loads to check latest subscription
  useEffect(() => {
    refreshUser();
  }, []);

  // Static exercise reference list organized by muscle group
  const EXERCISE_REFERENCE = {
    'Biceps': ['Hammer Curls', 'Barbell Curls', 'Dumbbell Curls', 'Cable Curls', 'Machine Curls'],
    'Triceps': ['Tricep Dips', 'Overhead Press', 'Rope Pushdown', 'Close-Grip Press', 'Skullcrushers'],
    'Chest': ['Push-ups', 'Bench Press', 'Incline Press', 'Chest Flyes', 'Dumbbell Press'],
    'Back': ['Lat Pulldowns', 'Bent-Over Rows', 'Pull-ups', 'Seated Rows', 'Face Pulls'],
    'Legs': ['Squats', 'Leg Press', 'Lunges', 'Leg Curls', 'Leg Extensions'],
    'Shoulders': ['Shoulder Press', 'Lateral Raises', 'Shrugs', 'Military Press', 'Upright Rows'],
    'Forearms': ['Wrist Curls', 'Reverse Curls', 'Farmer Carry', 'Wrist Extensions', 'Plate Pinches'],
    'Core': ['Planks', 'Crunches', 'Russian Twists', 'Ab Wheel', 'Leg Raises']
  };

  useEffect(() => {
    api.get('/exercises').then(r => { setExercises(r.data); setFiltered(r.data); }).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let result = exercises;
    if (muscle !== 'All') result = result.filter(e => e.targetMuscle === muscle);
    if (difficulty !== 'All') result = result.filter(e => e.difficulty === difficulty);
    if (search) result = result.filter(e => e.name.toLowerCase().includes(search.toLowerCase()));
    setFiltered(result);
  }, [muscle, difficulty, search, exercises]);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-dark)' }}>
      <Navbar />
      <div className="flex">
        {/* Sidebar */}
        {showSidebar && (
          <div className="hidden lg:flex w-64 flex-col p-6 border-r" style={{ borderColor: 'var(--border)', background: 'rgba(0,0,0,0.2)' }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg gradient-text">📋 Reference</h3>
              <button onClick={() => setShowSidebar(false)} className="text-gray-400 hover:text-white text-lg">×</button>
            </div>

            <div className="space-y-4 overflow-y-auto flex-1">
              {Object.entries(EXERCISE_REFERENCE).map(([muscle, exList]) => (
                <div key={muscle}>
                  <button
                    onClick={() => setMuscle(muscle)}
                    className="w-full text-left px-3 py-2 rounded-lg mb-2 text-sm font-semibold transition-all"
                    style={{
                      background: muscle === 'All' && muscle !== 'All' ? 'rgba(108,99,255,0.2)' : muscle === (exercises.find(e => e.targetMuscle === muscle)?.targetMuscle || muscle) ? 'rgba(108,99,255,0.15)' : 'transparent',
                      color: muscle === 'All' ? '#6C63FF' : '#e0e0e0'
                    }}>
                    💪 {muscle}
                  </button>
                  <div className="pl-2 space-y-1 text-xs text-gray-400">
                    {exList.map((ex, idx) => (
                      <div key={idx} className="py-1 px-2 rounded hover:bg-white/5 transition-all hover:text-gray-300 cursor-pointer">
                        • {ex}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 p-3 rounded-lg text-xs text-center" style={{ background: 'rgba(108,99,255,0.1)', color: '#6C63FF' }}>
              💡 Click muscle groups to filter exercises
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 px-4 py-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-bold">💪 {t('exerciseLibrary')}</h1>
                  {isPremium && (
                    <div className="badge badge-purple px-3 py-1">⭐ Premium</div>
                  )}
                </div>
                <p className="text-gray-400 mt-1">{filtered.length} of {exercises.length} exercises available {isPremium ? '- Full access unlocked!' : '- Locked'}</p>
              </div>
              <button
                onClick={() => setShowSidebar(!showSidebar)}
                className="lg:hidden px-4 py-2 rounded-xl text-sm"
                style={{ background: 'rgba(108,99,255,0.15)', color: '#6C63FF' }}>
                📋 {showSidebar ? 'Hide' : 'Show'} Reference
              </button>
            </div>

            {/* Filters */}
            <div className="glass rounded-2xl p-4 mb-6 flex flex-wrap gap-3 items-center">
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="🔍 Search exercises..."
                className="input-field" style={{ maxWidth: '220px', padding: '8px 14px' }} />

              <div className="flex flex-wrap gap-2">
                {MUSCLES.map(m => (
                  <button key={m} onClick={() => setMuscle(m)}
                    className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
                    style={muscle === m
                      ? { background: 'rgba(108,99,255,0.3)', color: '#6C63FF', border: '1px solid #6C63FF' }
                      : { background: 'rgba(255,255,255,0.05)', color: '#a0aec0', border: '1px solid rgba(255,255,255,0.1)' }}>
                    {m}
                  </button>
                ))}
              </div>

              <div className="flex gap-2">
                {DIFFICULTIES.map(d => (
                  <button key={d} onClick={() => setDifficulty(d)}
                    className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
                    style={difficulty === d
                      ? { background: 'rgba(67,233,123,0.2)', color: '#43E97B', border: '1px solid #43E97B' }
                      : { background: 'rgba(255,255,255,0.05)', color: '#a0aec0', border: '1px solid rgba(255,255,255,0.1)' }}>
                    {d}
                  </button>
                ))}
              </div>
            </div>

        {/* Exercise Grid */}
            {!isPremium && (
              <div className="glass rounded-2xl p-8 text-center mb-6 relative overflow-hidden" style={{ border: '2px solid rgba(108,99,255,0.3)' }}>
                <div className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-10 animate-float" style={{ background: 'radial-gradient(circle, #6C63FF, transparent)', filter: 'blur(60px)' }} />
                <h2 className="text-3xl font-bold mb-3 relative z-10">🔐 To unlock all exercises, <span className="gradient-text">Upgrade to Premium!</span></h2>
                <p className="text-gray-400 mb-6 relative z-10 max-w-xl mx-auto">Get instant access to all exercises, advanced workout plans, professional video tutorials, and exclusive premium features.</p>
                <button
                  onClick={() => navigate('/subscription')}
                  className="btn-gradient px-8 py-3 rounded-xl text-white font-semibold relative z-10 hover:shadow-lg transition-all">
                  ⭐ Upgrade to Premium
                </button>
              </div>
            )}
            {loading ? (
              <div className="flex justify-center py-20"><div className="spinner" /></div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filtered.map(ex => {
                  const videoId = ex.youtubeUrl?.split('v=')[1]?.split('&')[0] || ex.youtubeUrl?.match(/embed\/(\w+)/)?.[1];
                  return (
                    <div key={ex._id}
                      onClick={() => isPremium && setSelected(ex)}
                      className={`glass rounded-2xl p-5 transition-all ${isPremium ? 'card-hover cursor-pointer' : 'opacity-70'}`}
                      style={!isPremium ? { pointerEvents: 'none' } : {}}>
                      {videoId && (
                        <div className="rounded-xl overflow-hidden mb-4 relative group" style={{ aspectRatio: '16/9' }}>
                          <img src={`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`}
                            alt={ex.name} className="w-full h-full object-cover transition-all"
                            style={!isPremium ? { filter: 'blur(12px) brightness(0.6)' } : { filter: 'brightness(1)' }} />
                          {!isPremium && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-1" style={{ background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(2px)' }}>
                              <div className="text-5xl">🔒</div>
                              <div className="text-white font-bold text-sm">Locked</div>
                            </div>
                          )}
                        </div>
                      )}
                      <div className="flex gap-2 mb-2 flex-wrap">
                        <span className={`badge ${diffBadge[ex.difficulty]}`}>{ex.difficulty}</span>
                        <span className="badge badge-purple">{ex.targetMuscle}</span>
                      </div>
                      <h3 className="font-semibold text-base mb-1">{ex.name}</h3>
                      <p className="text-gray-400 text-xs">{ex.equipment}</p>
                      {isPremium && (
                        <p className="text-xs mt-2" style={{ color: '#6C63FF' }}>Click to view →</p>
                      )}
                      {!isPremium && (
                        <p className="text-xs mt-2 text-gray-500">🔐 Premium only</p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
            {!loading && filtered.length === 0 && (
              <div className="text-center py-20 text-gray-400">{t('noData')}</div>
            )}
          </div>
        </div>
      </div>

      {selected && <ExerciseModal exercise={selected} onClose={() => setSelected(null)} isPremium={isPremium} />}
    </div>
  );
}
