import React, { useState, useEffect, useRef } from 'react';
import { SadhanaPractice, PracticeSession } from '../../types';
import { StorageService } from '../../services/storage';
import { audio } from '../../services/audioService';
import { X, Play, Pause, CheckCircle2, RotateCcw, Flame, Volume2 } from 'lucide-react';

interface NaamJapModalProps {
  practice: SadhanaPractice;
  isOpen: boolean;
  onClose: () => void;
  onSessionSaved: (session: PracticeSession) => void;
  soundEnabled: boolean;
}

export const NaamJapModal: React.FC<NaamJapModalProps> = ({
  practice,
  isOpen,
  onClose,
  onSessionSaved,
  soundEnabled,
}) => {
  const [beadCount, setBeadCount] = useState(0);
  const [malasCompleted, setMalasCompleted] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [notes, setNotes] = useState('');
  const [isFinishing, setIsFinishing] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Resilient timer using timestamp delta
  const startTimeRef = useRef<number | null>(null);
  const accumulatedRef = useRef<number>(0);
  const intervalRef = useRef<any>(null);

  useEffect(() => {
    if (isOpen) {
      setBeadCount(0);
      setMalasCompleted(0);
      setElapsedSeconds(0);
      accumulatedRef.current = 0;
      startTimeRef.current = null;
      setIsRunning(true);
      startTimeRef.current = Date.now();
      setIsSaved(false);
      setIsFinishing(false);

      if (soundEnabled) {
        audio.playSingingBowl(2.5);
      }
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isOpen, soundEnabled]);

  useEffect(() => {
    if (isRunning) {
      if (!startTimeRef.current) startTimeRef.current = Date.now();
      intervalRef.current = setInterval(() => {
        const delta = Math.floor((Date.now() - (startTimeRef.current || Date.now())) / 1000);
        setElapsedSeconds(accumulatedRef.current + delta);
      }, 500);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (startTimeRef.current) {
        accumulatedRef.current += Math.floor((Date.now() - startTimeRef.current) / 1000);
        startTimeRef.current = null;
      }
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning]);

  if (!isOpen) return null;

  const handleBeadClick = () => {
    if (soundEnabled) {
      audio.playBeadClick();
    }
    if (beadCount + 1 >= 108) {
      setBeadCount(0);
      setMalasCompleted(prev => prev + 1);
      if (soundEnabled) {
        audio.playSingingBowl(3.0);
      }
    } else {
      setBeadCount(prev => prev + 1);
    }
  };

  const handleFinish = () => {
    if (isSaved) return; // Prevent double creation
    setIsSaved(true);

    const totalMinutes = Math.max(1, Math.round(elapsedSeconds / 60));
    const totalCount = malasCompleted * 108 + beadCount;

    const newSession: PracticeSession = {
      id: `sess_${Date.now()}`,
      practiceId: practice.id,
      practiceName: practice.name,
      userId: 'usr_default',
      startTime: new Date(Date.now() - elapsedSeconds * 1000).toISOString(),
      endTime: new Date().toISOString(),
      durationMinutes: totalMinutes,
      count: totalCount > 0 ? totalCount : undefined,
      notes: notes.trim() || undefined,
      status: 'completed',
      createdAt: new Date().toISOString(),
    };

    StorageService.saveSession(newSession);
    onSessionSaved(newSession);
    setTimeout(() => {
      onClose();
    }, 600);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
      <div className="bg-[#FBF8F2] dark:bg-[#1A201D] border border-[#C4A264]/40 rounded-3xl max-w-md w-full shadow-2xl p-6 text-[#1F2421] dark:text-[#F1F4F2] relative flex flex-col items-center">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-[#EDE7DB] dark:hover:bg-[#252D29] text-[#716D64]"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Practice Name & Sacred Header */}
        <div className="text-center space-y-1 mb-4">
          <div className="flex items-center justify-center gap-1.5 text-[#782F3B] dark:text-[#D4B274]">
            <Flame className="w-4 h-4" />
            <span className="text-xs font-semibold uppercase tracking-widest font-heading">
              Sadhana Session
            </span>
          </div>
          <h2 className="text-xl font-bold font-heading text-[#782F3B] dark:text-[#D4B274]">
            {practice.name}
          </h2>
          {practice.intention && (
            <p className="text-xs text-[#716D64] dark:text-[#9FA4A1] max-w-xs italic">
              “{practice.intention}”
            </p>
          )}
        </div>

        {/* Resilient Timer Display */}
        <div className="flex items-center gap-2 mb-4 bg-[#EDE7DB]/80 dark:bg-[#252D29]/80 px-4 py-1.5 rounded-full border border-[#C4A264]/30 text-xs">
          <span className="text-[#716D64] dark:text-[#9FA4A1]">Elapsed:</span>
          <span className="font-mono font-bold text-sm text-[#263E32] dark:text-[#A8C7B5]">
            {formatTime(elapsedSeconds)}
          </span>
          <button
            onClick={() => setIsRunning(!isRunning)}
            className="p-1 rounded-full hover:bg-[#C4A264]/20 text-[#782F3B] dark:text-[#D4B274]"
            title={isRunning ? 'Pause Timer' : 'Resume Timer'}
          >
            {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Mala Bead Visual Counter */}
        <div className="relative my-2 flex flex-col items-center justify-center">
          {/* Circular click target */}
          <button
            onClick={handleBeadClick}
            className="w-44 h-44 sm:w-48 sm:h-48 rounded-full bg-gradient-to-br from-[#F6F0E5] to-[#EDE7DB] dark:from-[#252D29] dark:to-[#1E2421] border-4 border-[#C4A264] shadow-xl flex flex-col items-center justify-center cursor-pointer active:scale-95 transition-transform select-none relative group"
            title="Tap to advance bead"
          >
            {/* Subtle bead progress ring SVG */}
            <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none">
              <circle
                cx="50%"
                cy="50%"
                r="44%"
                className="stroke-[#E2DACB] dark:stroke-[#2E3833] fill-none"
                strokeWidth="4"
              />
              <circle
                cx="50%"
                cy="50%"
                r="44%"
                className="stroke-[#782F3B] dark:stroke-[#D4B274] fill-none transition-all duration-150"
                strokeWidth="4"
                strokeDasharray="276"
                strokeDashoffset={276 - (276 * beadCount) / 108}
                strokeLinecap="round"
              />
            </svg>

            <span className="text-3xl sm:text-4xl font-bold font-serif text-[#782F3B] dark:text-[#D4B274]">
              {beadCount}
            </span>
            <span className="text-[11px] uppercase tracking-wider text-[#716D64] dark:text-[#9FA4A1] font-medium">
              of 108 Beads
            </span>
            <span className="text-[10px] text-[#263E32] dark:text-[#A8C7B5] mt-1 font-medium group-hover:underline">
              Tap anywhere
            </span>
          </button>

          {/* Malas Completed Counter */}
          <div className="mt-3 flex items-center gap-2">
            <span className="text-xs text-[#716D64] dark:text-[#9FA4A1]">Malas Completed:</span>
            <span className="text-sm font-bold px-2 py-0.5 rounded-full bg-[#782F3B]/10 dark:bg-[#D4B274]/20 text-[#782F3B] dark:text-[#D4B274]">
              {malasCompleted}
            </span>
          </div>
        </div>

        {/* Finishing Drawer / Notes */}
        {!isFinishing ? (
          <div className="w-full mt-4 flex gap-2">
            <button
              onClick={() => {
                if (window.confirm('Reset current counter?')) {
                  setBeadCount(0);
                  setMalasCompleted(0);
                }
              }}
              className="p-2.5 rounded-xl border border-[#E2DACB] dark:border-[#2E3833] hover:bg-[#EDE7DB] text-[#716D64]"
              title="Reset Counter"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsFinishing(true)}
              className="flex-1 bg-[#782F3B] hover:bg-[#5E242E] text-white py-2.5 rounded-xl font-medium text-xs shadow-md transition-colors flex items-center justify-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Complete Session</span>
            </button>
          </div>
        ) : (
          <div className="w-full mt-3 space-y-2 animate-in fade-in">
            <label className="block text-[11px] font-semibold text-[#716D64] dark:text-[#9FA4A1]">
              Optional Private Reflection Note:
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Heartfelt peace, focused on remembrance..."
              className="w-full text-xs p-2.5 rounded-xl bg-white dark:bg-[#252D29] border border-[#C4A264]/40 focus:outline-none focus:ring-1 focus:ring-[#782F3B]"
            />
            <div className="flex gap-2">
              <button
                onClick={() => setIsFinishing(false)}
                className="text-xs px-3 py-2 text-[#716D64] hover:underline"
              >
                Back
              </button>
              <button
                disabled={isSaved}
                onClick={handleFinish}
                className="flex-1 bg-[#263E32] hover:bg-[#1C2F25] text-white py-2 rounded-xl font-medium text-xs shadow-md transition-colors flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isSaved ? 'Saved Privately...' : 'Confirm & Save to Private History'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
