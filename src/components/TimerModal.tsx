import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, CheckCircle, X, Sparkles, Timer as TimerIcon } from 'lucide-react';
import { Habit } from '../logic/habits.ts';
import { playChimeSound } from '../utils/notification.ts';
import { fireCelebration } from '../utils/confetti.ts';

interface TimerModalProps {
  habit: Habit | null;
  isOpen: boolean;
  onClose: () => void;
  onCompleteHabit: (id: string) => void;
}

export const TimerModal: React.FC<TimerModalProps> = ({
  habit,
  isOpen,
  onClose,
  onCompleteHabit,
}) => {
  const TOTAL_SECONDS = 120; // 2 minutes
  const [timeLeft, setTimeLeft] = useState(TOTAL_SECONDS);
  const [isRunning, setIsRunning] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeLeft(TOTAL_SECONDS);
      setIsRunning(true);
    } else {
      setIsRunning(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setIsRunning(false);
            playChimeSound();
            fireCelebration();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, timeLeft]);

  if (!isOpen || !habit) return null;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const progressPercent = Math.round(((TOTAL_SECONDS - timeLeft) / TOTAL_SECONDS) * 100);

  const handleMarkDone = () => {
    playChimeSound();
    fireCelebration();
    onCompleteHabit(habit.id);
    onClose();
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(TOTAL_SECONDS);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="timer-modal-title"
    >
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-100 overflow-hidden text-center p-6 sm:p-8 relative">
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close timer"
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header icon */}
        <div className="w-12 h-12 mx-auto rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-700 mb-3">
          <TimerIcon className="w-6 h-6" />
        </div>

        <h3 id="timer-modal-title" className="text-xl font-extrabold text-slate-800">
          The 2-Minute Rule
        </h3>
        <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1">
          &ldquo;When you start a new habit, it should take less than two minutes to do.&rdquo;
        </p>

        {/* Habit Card Details */}
        <div className="mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-left">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Big Goal
          </div>
          <div className="text-sm font-bold text-slate-800">{habit.name}</div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 mt-2">
            Your Tiny Action Right Now
          </div>
          <div className="text-sm font-semibold text-emerald-800 italic">
            &ldquo;{habit.tiny}&rdquo;
          </div>
        </div>

        {/* Timer Display */}
        <div className="my-6">
          <div className="text-5xl font-black text-slate-800 tracking-tight font-mono">
            {timeFormatted}
          </div>
          <div className="w-48 h-2 bg-slate-100 rounded-full mx-auto mt-3 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-teal-400 to-emerald-500 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          {timeLeft === 0 && (
            <p className="text-xs font-bold text-emerald-600 mt-2 animate-bounce">
              🎉 2 minutes up! Small win achieved!
            </p>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => setIsRunning(!isRunning)}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            {isRunning ? (
              <>
                <Pause className="w-4 h-4" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>{timeLeft === TOTAL_SECONDS ? 'Start' : 'Resume'}</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="p-2.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Reset timer to 2:00"
            aria-label="Reset timer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Complete button */}
        <div className="mt-5 pt-5 border-t border-slate-100">
          <button
            type="button"
            onClick={handleMarkDone}
            className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-extrabold text-slate-900 bg-[#55E6C1] hover:bg-[#43d4af] transition-all shadow-sm hover:shadow cursor-pointer active:scale-98"
          >
            <CheckCircle className="w-4 h-4" />
            <span>Mark as Done (+1 Streak 🔥)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
