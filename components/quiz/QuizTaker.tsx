"use client";
import { useState, useEffect, useCallback } from 'react';
import { getApiUrl } from '@/lib/config';

interface QuizTakerProps {
  quizId: string;
  onComplete: () => void;
  onExit: () => void;
}

export default function QuizTaker({ quizId, onComplete, onExit }: QuizTakerProps) {
  const [quiz, setQuiz] = useState<any>(null);
  const [attempt, setAttempt] = useState<any>(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<number, any>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [tabWarnings, setTabWarnings] = useState(0);
  const [showWarning, setShowWarning] = useState(false);

  // Start quiz
  useEffect(() => {
    const startQuiz = async () => {
      try {
        const token = sessionStorage.getItem('accessToken');
        if (!token) return;
        const res = await fetch(getApiUrl(`/api/quiz/${quizId}/start`), {
          method: 'POST', headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        });
        const data = await res.json();
        if (!res.ok) { setError(data.error || 'Failed to start quiz'); setLoading(false); return; }
        setQuiz(data.quiz);
        setAttempt(data.attempt);
        // Calculate remaining time
        const elapsed = (Date.now() - new Date(data.attempt.startedAt).getTime()) / 1000;
        setTimeLeft(Math.max(0, data.quiz.timeLimit * 60 - elapsed));
        // Restore saved answers
        if (data.attempt.answers) setAnswers(data.attempt.answers);
      } catch { setError('Failed to connect'); }
      setLoading(false);
    };
    startQuiz();
  }, [quizId]);

  // Countdown timer
  useEffect(() => {
    if (timeLeft <= 0 || result) return;
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { handleSubmit(); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [timeLeft, result]);

  // Anti-cheat: tab switch detection
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden && !result) {
        setTabWarnings(prev => prev + 1);
        setShowWarning(true);
        setTimeout(() => setShowWarning(false), 3000);
        // Log to backend
        const token = sessionStorage.getItem('accessToken');
        if (token) {
          fetch(getApiUrl(`/api/quiz/${quizId}/tabswitch`), {
            method: 'PUT', headers: { 'Authorization': `Bearer ${token}` },
          }).catch(() => {});
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [quizId, result]);

  // Anti-cheat: disable copy/paste/right-click
  useEffect(() => {
    const prevent = (e: Event) => { e.preventDefault(); return false; };
    const preventKeys = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && ['c', 'v', 'a', 'x', 'p', 's'].includes(e.key.toLowerCase())) {
        e.preventDefault();
      }
      if (e.key === 'PrintScreen') e.preventDefault();
    };
    document.addEventListener('contextmenu', prevent);
    document.addEventListener('copy', prevent);
    document.addEventListener('paste', prevent);
    document.addEventListener('selectstart', prevent);
    document.addEventListener('keydown', preventKeys);
    return () => {
      document.removeEventListener('contextmenu', prevent);
      document.removeEventListener('copy', prevent);
      document.removeEventListener('paste', prevent);
      document.removeEventListener('selectstart', prevent);
      document.removeEventListener('keydown', preventKeys);
    };
  }, []);

  // Request fullscreen
  useEffect(() => {
    if (quiz && !result) {
      try { document.documentElement.requestFullscreen?.(); } catch {}
    }
    return () => { try { document.exitFullscreen?.(); } catch {} };
  }, [quiz, result]);

  // Save answer
  const saveAnswer = useCallback(async (qIdx: number, answer: any) => {
    setAnswers(prev => ({ ...prev, [qIdx]: answer }));
    const token = sessionStorage.getItem('accessToken');
    if (token) {
      fetch(getApiUrl(`/api/quiz/${quizId}/answer`), {
        method: 'PUT', headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionIndex: qIdx, answer }),
      }).catch(() => {});
    }
  }, [quizId]);

  // Submit quiz
  const handleSubmit = async () => {
    if (submitting || result) return;
    setSubmitting(true);
    try {
      const token = sessionStorage.getItem('accessToken');
      if (!token) return;
      const res = await fetch(getApiUrl(`/api/quiz/${quizId}/submit`), {
        method: 'POST', headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (res.ok) setResult(data);
      else setError(data.error || 'Failed to submit');
    } catch { setError('Failed to submit'); }
    setSubmitting(false);
    try { document.exitFullscreen?.(); } catch {}
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  if (loading) return (
    <div className="fixed inset-0 z-[70] bg-slate-900 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-purple-500 border-t-transparent mx-auto mb-3"></div>
        <p className="text-slate-400 text-sm">Loading quiz...</p>
      </div>
    </div>
  );

  if (error && !quiz) return (
    <div className="fixed inset-0 z-[70] bg-slate-900 flex items-center justify-center">
      <div className="text-center max-w-sm">
        <span className="text-4xl">⚠️</span>
        <p className="text-red-400 text-sm font-medium mt-3">{error}</p>
        <button onClick={onExit} className="mt-4 bg-slate-700 text-white px-6 py-2 rounded-lg text-sm">Go Back</button>
      </div>
    </div>
  );

  if (result) return (
    <div className="fixed inset-0 z-[70] bg-slate-900 flex items-center justify-center">
      <div className="text-center max-w-sm bg-slate-800 rounded-2xl p-8 border border-slate-700">
        <div className={`h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4 ${result.percentage >= 70 ? 'bg-green-500/20' : result.percentage >= 50 ? 'bg-yellow-500/20' : 'bg-red-500/20'}`}>
          <span className="text-3xl">{result.percentage >= 70 ? '🎉' : result.percentage >= 50 ? '📝' : '📚'}</span>
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Quiz Complete!</h2>
        <div className={`text-4xl font-bold mb-1 ${result.percentage >= 70 ? 'text-green-400' : result.percentage >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>{result.percentage}%</div>
        <p className="text-slate-400 text-sm">{result.score} / {result.totalPoints} points</p>
        {tabWarnings > 0 && <p className="text-orange-400 text-xs mt-3">⚠️ {tabWarnings} tab switch{tabWarnings !== 1 ? 'es' : ''} detected</p>}
        <button onClick={() => { onComplete(); onExit(); }} className="mt-6 w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2.5 rounded-lg text-sm font-medium">Done</button>
      </div>
    </div>
  );

  if (!quiz) return null;

  const questions = quiz.questions || [];
  const showAll = !quiz.settings?.showOneAtATime;
  const canGoBack = quiz.settings?.allowBacktrack !== false;

  return (
    <div className="fixed inset-0 z-[70] bg-slate-900 flex flex-col select-none" style={{ userSelect: 'none', WebkitUserSelect: 'none' }}>
      {/* Tab switch warning */}
      {showWarning && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[80] bg-red-600 text-white px-6 py-3 rounded-xl shadow-2xl animate-bounce text-sm font-medium">
          ⚠️ Tab switch detected! ({tabWarnings}) — This is being recorded.
        </div>
      )}

      {/* Header */}
      <div className="bg-slate-800/90 border-b border-slate-700/50 px-4 py-3 flex items-center justify-between flex-shrink-0">
        <div className="min-w-0 flex-1">
          <h2 className="text-white font-semibold text-sm truncate">{quiz.title}</h2>
          <p className="text-slate-400 text-xs">{questions.length} questions • {quiz.totalPoints} points</p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className={`px-3 py-1.5 rounded-lg text-sm font-mono font-bold ${timeLeft < 60 ? 'bg-red-600/30 text-red-300 animate-pulse' : timeLeft < 300 ? 'bg-orange-600/20 text-orange-300' : 'bg-slate-700/50 text-white'}`}>
            ⏱ {formatTime(timeLeft)}
          </div>
          <button onClick={() => { if (confirm('Submit quiz now?')) handleSubmit(); }} disabled={submitting} className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-1.5 rounded-lg text-xs font-medium disabled:opacity-50">
            {submitting ? 'Submitting...' : 'Submit'}
          </button>
        </div>
      </div>

      {/* Questions */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        <div className="max-w-3xl mx-auto space-y-6">
          {(showAll ? questions : [questions[currentQ]]).map((q: any, displayIdx: number) => {
            const qIdx = showAll ? q.originalIndex : questions[currentQ]?.originalIndex;
            if (!q) return null;
            const actualIdx = q.originalIndex;
            return (
              <div key={actualIdx} className="bg-slate-800/60 rounded-2xl border border-slate-700/40 p-5">
                <div className="flex items-start gap-3 mb-4">
                  <span className="bg-purple-600/20 text-purple-300 text-xs font-bold px-2.5 py-1 rounded-lg flex-shrink-0">Q{(showAll ? displayIdx : currentQ) + 1}</span>
                  <div className="flex-1">
                    <p className="text-white text-sm leading-relaxed">{q.text}</p>
                    <span className="text-[10px] text-slate-500 mt-1 block">{q.points} point{q.points !== 1 ? 's' : ''}</span>
                  </div>
                </div>

                {q.type === 'mcq' && (
                  <div className="space-y-2 ml-9">
                    {q.options.map((opt: string, oi: number) => (
                      <button key={oi} onClick={() => saveAnswer(actualIdx, oi)} className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-all ${answers[actualIdx] === oi ? 'bg-purple-600/20 border-purple-500/50 text-white' : 'bg-slate-700/20 border-slate-600/30 text-slate-300 hover:border-slate-500/50'}`}>
                        <span className="font-medium mr-2">{String.fromCharCode(65 + oi)}.</span> {opt}
                      </button>
                    ))}
                  </div>
                )}

                {q.type === 'true_false' && (
                  <div className="flex gap-3 ml-9">
                    <button onClick={() => saveAnswer(actualIdx, true)} className={`flex-1 py-3 rounded-xl border text-sm font-medium transition-all ${answers[actualIdx] === true ? 'bg-green-600/20 border-green-500/50 text-green-300' : 'bg-slate-700/20 border-slate-600/30 text-slate-300 hover:border-slate-500/50'}`}>True</button>
                    <button onClick={() => saveAnswer(actualIdx, false)} className={`flex-1 py-3 rounded-xl border text-sm font-medium transition-all ${answers[actualIdx] === false ? 'bg-red-600/20 border-red-500/50 text-red-300' : 'bg-slate-700/20 border-slate-600/30 text-slate-300 hover:border-slate-500/50'}`}>False</button>
                  </div>
                )}

                {q.type === 'short_answer' && (
                  <div className="ml-9">
                    <textarea value={answers[actualIdx] || ''} onChange={(e) => saveAnswer(actualIdx, e.target.value)} placeholder="Type your answer..." className="w-full px-4 py-3 bg-slate-700/30 border border-slate-600/30 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-none" rows={3} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Navigation (one-at-a-time mode) */}
      {!showAll && (
        <div className="bg-slate-800/90 border-t border-slate-700/50 px-4 py-3 flex items-center justify-between flex-shrink-0">
          <button onClick={() => setCurrentQ(prev => Math.max(0, prev - 1))} disabled={currentQ === 0 || !canGoBack} className="text-slate-400 hover:text-white px-4 py-2 rounded-lg hover:bg-slate-700/50 text-sm disabled:opacity-30 disabled:cursor-not-allowed">← Previous</button>
          <div className="flex gap-1.5">
            {questions.map((_: any, i: number) => (
              <button key={i} onClick={() => canGoBack && setCurrentQ(i)} className={`h-2.5 w-2.5 rounded-full transition-all ${i === currentQ ? 'bg-purple-500 scale-125' : answers[questions[i]?.originalIndex] !== undefined ? 'bg-green-500/60' : 'bg-slate-600'}`} />
            ))}
          </div>
          {currentQ < questions.length - 1 ? (
            <button onClick={() => setCurrentQ(prev => Math.min(questions.length - 1, prev + 1))} className="text-white px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-sm">Next →</button>
          ) : (
            <button onClick={() => { if (confirm('Submit quiz?')) handleSubmit(); }} className="text-white px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-sm font-medium">Submit</button>
          )}
        </div>
      )}
    </div>
  );
}
