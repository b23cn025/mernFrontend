import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import api from '../utils/api';
import YouTube from 'react-youtube';

const diffBadge = { Beginner: 'badge-green', Intermediate: 'badge-yellow', Advanced: 'badge-red' };

// Step 2: Exercise Details & Execution View
function ExerciseExecutor({ exercise, workoutIndex, totalExercises, onComplete, onSkip }) {
  const [seconds, setSeconds] = useState(0);
  const [reps, setReps] = useState(0);
  const [sets, setSets] = useState(1);
  const [running, setRunning] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (running) {
      timerRef.current = setInterval(() => setSeconds(s => s + 1), 1000);
    } else clearInterval(timerRef.current);
    return () => clearInterval(timerRef.current);
  }, [running]);

  const fmt = s => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  const videoId = exercise?.youtubeUrl?.match(/(?:youtube\.com\/embed\/|youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/)?.[1];

  return (
    <div className="glass rounded-2xl p-8 max-w-3xl mx-auto">
      {/* Progress indicator */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-gray-300">
            Exercise {workoutIndex} of {totalExercises}
          </span>
          <span className="text-xs px-3 py-1 rounded-full" style={{ background: 'rgba(108,99,255,0.2)', color: '#6C63FF' }}>
            {Math.round((workoutIndex / totalExercises) * 100)}% Complete
          </span>
        </div>
        <div className="w-full h-2 rounded-full" style={{ background: 'rgba(255,255,255,0.1)' }}>
          <div className="h-full rounded-full" style={{ background: 'linear-gradient(90deg, #6C63FF, #FF6584)', width: `${(workoutIndex / totalExercises) * 100}%`, transition: 'width 0.3s ease' }} />
        </div>
      </div>

      {/* Exercise Header */}
      <div className="mb-6">
        <h2 className="text-3xl font-bold mb-2">{exercise?.name || 'Exercise'}</h2>
        <div className="flex gap-2 mb-4">
          <span className="badge badge-purple">{exercise?.targetMuscle}</span>
          <span className="text-xs px-3 py-1 rounded-full" style={{ background: 'rgba(108,99,255,0.15)', color: '#6C63FF' }}>
            ~{exercise?.caloriesPerMin} kcal/min
          </span>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <div className="glass rounded-xl p-4 text-center">
          <p className="text-xs text-gray-400 mb-1">Reps</p>
          <div className="flex items-center justify-center gap-3">
            <button onClick={() => setReps(Math.max(0, reps - 1))} className="w-8 h-8 rounded-lg" style={{ background: 'rgba(255,255,255,0.1)' }}>−</button>
            <span className="text-3xl font-bold gradient-text">{reps}</span>
            <button onClick={() => setReps(reps + 1)} className="w-8 h-8 rounded-lg" style={{ background: 'rgba(108,99,255,0.2)', color: '#6C63FF' }}>+</button>
          </div>
        </div>

        <div className="glass rounded-xl p-4 text-center">
          <p className="text-xs text-gray-400 mb-1">Sets</p>
          <div className="flex items-center justify-center gap-3">
            <button onClick={() => setSets(Math.max(1, sets - 1))} className="w-8 h-8 rounded-lg" style={{ background: 'rgba(255,255,255,0.1)' }}>−</button>
            <span className="text-3xl font-bold" style={{ color: '#FF6584' }}>{sets}</span>
            <button onClick={() => setSets(sets + 1)} className="w-8 h-8 rounded-lg" style={{ background: 'rgba(255,101,132,0.2)', color: '#FF6584' }}>+</button>
          </div>
        </div>

        <div className="glass rounded-xl p-4 text-center">
          <p className="text-xs text-gray-400 mb-1">Time</p>
          <p className="text-3xl font-mono font-bold" style={{ color: '#43E97B' }}>{fmt(seconds)}</p>
        </div>
      </div>

      {/* Video */}
      {videoId && (
        <div className="mb-6 rounded-2xl overflow-hidden" style={{ aspectRatio: '16/9' }}>
          <iframe
            width="100%" height="100%"
            src={`https://www.youtube.com/embed/${videoId}?modestbranding=1`}
            title={exercise?.name}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={{ border: 'none' }}
          />
        </div>
      )}

      {/* Instructions */}
      {exercise?.instructions?.en && (
        <div className="mb-6 p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)' }}>
          <p className="text-sm text-gray-300 leading-relaxed">{exercise.instructions.en}</p>
        </div>
      )}

      {/* Timer Controls */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={() => setRunning(!running)}
          className="flex-1 py-3 rounded-xl text-white font-semibold text-lg transition-all"
          style={{ background: running ? 'rgba(255,101,132,0.2)' : 'rgba(67,233,123,0.2)', color: running ? '#FF6584' : '#43E97B', border: `2px solid ${running ? '#FF6584' : '#43E97B'}` }}>
          {running ? '⏸ Pause' : '▶ Start Timer'}
        </button>
        <button
          onClick={() => { setSeconds(0); setRunning(false); }}
          className="px-6 py-3 rounded-xl font-semibold"
          style={{ background: 'rgba(255,255,255,0.05)', color: '#a0aec0', border: '1px solid rgba(255,255,255,0.1)' }}>
          ↺ Reset
        </button>
      </div>

      {/* Next/Complete Buttons */}
      <div className="flex gap-3">
        <button
          onClick={onSkip}
          className="flex-1 py-3 rounded-xl font-semibold transition-all"
          style={{ background: 'rgba(255,255,255,0.05)', color: '#a0aec0', border: '1px solid rgba(255,255,255,0.1)' }}>
          ⏭ Skip Exercise
        </button>
        <button
          onClick={() => onComplete({ reps, sets, seconds })}
          className="flex-1 py-3 rounded-xl font-semibold text-white transition-all"
          style={{ background: 'linear-gradient(135deg, #6C63FF, #43E97B)', border: 'none' }}>
          ✅ {workoutIndex === totalExercises ? 'Finish Workout' : 'Next Exercise'}
        </button>
      </div>
    </div>
  );
}

// Step 1 Enhanced: Workout Details with Exercise List
function WorkoutDetail({ workout, onComplete, onBack, completing }) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [startWorkout, setStartWorkout] = useState(false);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [totalTime, setTotalTime] = useState(0);

  const hasPremiumAccess = user?.subscription?.status === 'active' && user?.subscription?.plan !== 'free';

  if (startWorkout && workout.exercises && workout.exercises.length > 0) {
    return (
      <div>
        <button onClick={() => setStartWorkout(false)} className="text-gray-400 hover:text-white text-sm mb-4 flex items-center gap-1">
          ← Back to Details
        </button>
        <ExerciseExecutor
          exercise={workout.exercises[currentExerciseIndex]}
          workoutIndex={currentExerciseIndex + 1}
          totalExercises={workout.exercises.length}
          onComplete={(exerciseData) => {
            setTotalTime(t => t + exerciseData.seconds);
            if (currentExerciseIndex < workout.exercises.length - 1) {
              setCurrentExerciseIndex(c => c + 1);
            } else {
              // Workout complete
              onComplete(workout._id, Math.floor(totalTime / 60) || workout.estimatedTime);
              setStartWorkout(false);
            }
          }}
          onSkip={() => {
            if (currentExerciseIndex < workout.exercises.length - 1) {
              setCurrentExerciseIndex(c => c + 1);
            } else {
              onComplete(workout._id, Math.floor(totalTime / 60) || workout.estimatedTime);
              setStartWorkout(false);
            }
          }}
        />
      </div>
    );
  }

  return (
    <div className="glass rounded-2xl p-6">
      <button onClick={onBack} className="text-gray-400 hover:text-white text-sm mb-4 flex items-center gap-1">
        ← Back to workouts
      </button>
      <div className="flex flex-col md:flex-row md:items-start gap-6">
        <div className="flex-1">
          <div className="flex gap-2 mb-3 flex-wrap">
            <span className={`badge ${diffBadge[workout.difficulty]}`}>{workout.difficulty}</span>
            <span className="badge badge-purple">{workout.goal}</span>
            {workout.isPremium && <span className="badge badge-yellow">⭐ Premium</span>}
          </div>
          <h2 className="text-2xl font-bold mb-2">{workout.title}</h2>
          <p className="text-gray-400 mb-5">{workout.description}</p>

          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="glass rounded-xl p-3 text-center">
              <p className="text-2xl font-bold" style={{ color: '#6C63FF' }}>{workout.exercises?.length || 0}</p>
              <p className="text-xs text-gray-400">Exercises</p>
            </div>
            <div className="glass rounded-xl p-3 text-center">
              <p className="text-2xl font-bold" style={{ color: '#FF6584' }}>{workout.caloriesBurned}</p>
              <p className="text-xs text-gray-400">kcal</p>
            </div>
            <div className="glass rounded-xl p-3 text-center">
              <p className="text-2xl font-bold" style={{ color: '#FFC107' }}>+{workout.coinsReward}</p>
              <p className="text-xs text-gray-400">{t('coins')}</p>
            </div>
          </div>

          {/* Premium Content Wall / YouTube Player */}
          {workout.isPremium && !hasPremiumAccess ? (
            <div className="mb-6 p-8 text-center rounded-2xl" style={{ background: 'rgba(108,99,255,0.1)', border: '1px solid rgba(108,99,255,0.2)' }}>
              <span className="text-4xl mb-3 block">🔒</span>
              <h3 className="text-xl font-bold mb-2">Premium Content Locked</h3>
              <p className="text-sm text-gray-400 mb-5">You need an active Premium or Daily Flex subscription to access this workout and view its instructional video.</p>
              <button onClick={() => navigate('/subscription')} className="btn-gradient px-6 py-2 rounded-xl text-white font-semibold">
                View Plans & Upgrade
              </button>
            </div>
          ) : (
            <>
              {/* YouTube Video if available and either free or unlocked premium */}
              {workout.youtubeVideoId && (
                <div className="mb-6 overflow-hidden rounded-2xl" style={{ border: '1px solid var(--border)', aspectRatio: '16/9' }}>
                  <iframe
                    width="100%" height="100%"
                    src={`https://www.youtube.com/embed/${workout.youtubeVideoId}?modestbranding=1`}
                    title={workout.title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    style={{ border: 'none' }}
                  />
                </div>
              )}

              <button
                onClick={() => setStartWorkout(true)}
                disabled={completing}
                className="btn-gradient w-full py-3 rounded-xl text-white font-bold text-base"
                style={{ opacity: completing ? 0.7 : 1 }}>
                {completing ? '⏳ Completing...' : `🚀 ${t('startWorkout')} (${workout.exercises?.length || 0} exercises)`}
              </button>
            </>
          )}
        </div>

        {/* Exercise list */}
        <div className="md:w-80">
          <h3 className="font-semibold mb-4 text-gray-200">📋 Exercises ({workout.exercises?.length}):</h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {workout.exercises?.map((ex, i) => (
              <div key={ex._id || i} className="glass rounded-xl p-3 flex items-center gap-3 hover:bg-white/5 transition-all">
                <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{ background: 'rgba(108,99,255,0.2)', color: '#6C63FF' }}>{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{ex.name}</p>
                  <p className="text-xs text-gray-400">{ex.targetMuscle}</p>
                </div>
                <span className="text-xs px-2 py-1 rounded" style={{ background: 'rgba(255,193,7,0.15)', color: '#FFC107' }}>
                  {ex.caloriesPerMin}kcal
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function WorkoutsPage() {
  const { t } = useTranslation();
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [workouts, setWorkouts] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [success, setSuccess] = useState(null);
  const [goalFilter, setGoalFilter] = useState('All');

  const GOALS = ['All', 'Fat Loss', 'Muscle Gain', 'General Fitness'];

  useEffect(() => {
    const q = goalFilter !== 'All' ? `?goal=${goalFilter}` : '';
    api.get(`/workouts${q}`).then(r => setWorkouts(r.data)).finally(() => setLoading(false));
  }, [goalFilter]);

  const handleComplete = async (workoutId, duration) => {
    setCompleting(true);
    try {
      const res = await api.post('/workouts/complete', { workoutId, duration });
      setSuccess(`🎉 ${t('workoutCompleted')} +${res.data.coinsEarned} 🪙 | Streak: ${res.data.streak} days`);
      refreshUser();
      setTimeout(() => { setSuccess(null); setSelected(null); }, 4000);
    } catch (err) {
      alert(err.response?.data?.message || 'Error completing workout.');
    } finally {
      setCompleting(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-dark)' }}>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        {success && (
          <div className="mb-6 p-4 rounded-xl text-center font-semibold"
            style={{ background: 'rgba(67,233,123,0.15)', color: '#43E97B', border: '1px solid rgba(67,233,123,0.3)' }}>
            {success}
          </div>
        )}

        {selected ? (
          <WorkoutDetail workout={selected} onComplete={handleComplete} onBack={() => setSelected(null)} completing={completing} />
        ) : (
          <>
            <h1 className="text-3xl font-bold mb-2">🏋️ {t('workouts')}</h1>
            <p className="text-gray-400 mb-6">Select a workout plan and start training</p>

            {/* Goal Filter */}
            <div className="flex flex-wrap gap-2 mb-6">
              {GOALS.map(g => (
                <button key={g} onClick={() => setGoalFilter(g)}
                  className="px-4 py-2 rounded-xl text-sm font-medium transition-all"
                  style={goalFilter === g
                    ? { background: 'rgba(108,99,255,0.25)', color: '#6C63FF', border: '1px solid #6C63FF' }
                    : { background: 'rgba(255,255,255,0.05)', color: '#a0aec0', border: '1px solid rgba(255,255,255,0.1)' }}>
                  {g}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="flex justify-center py-20"><div className="spinner" /></div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                {workouts.map(w => (
                  <div key={w._id} className="glass rounded-2xl p-6 card-hover cursor-pointer"
                    onClick={() => setSelected(w)}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex gap-2">
                        <span className={`badge ${diffBadge[w.difficulty]}`}>{w.difficulty}</span>
                        {w.isPremium && <span className="badge badge-yellow">⭐</span>}
                      </div>
                      <span className="text-2xl">
                        {w.goal === 'Fat Loss' ? '🔥' : w.goal === 'Muscle Gain' ? '💪' : '⚡'}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold mb-2">{w.title}</h3>
                    <p className="text-gray-400 text-sm mb-4 line-clamp-2">{w.description}</p>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex gap-3 text-gray-400">
                        <span>⏱ {w.estimatedTime}m</span>
                        <span>🔥 {w.caloriesBurned}</span>
                        <span>🪙 +{w.coinsReward}</span>
                      </div>
                    </div>
                    <button className="btn-gradient w-full mt-4 py-2 rounded-xl text-white text-sm font-semibold">
                      {t('startWorkout')}
                    </button>
                  </div>
                ))}
              </div>
            )}
            {!loading && workouts.length === 0 && (
              <p className="text-center text-gray-400 py-12">{t('noData')}</p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
