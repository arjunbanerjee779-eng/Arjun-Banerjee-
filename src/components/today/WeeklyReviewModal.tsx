import React from 'react';
import {
  PracticeSession,
  Task,
  ReviewEvent,
  MistakeEntry,
  DailyReflection,
} from '../../types';
import { X, Award, CheckCircle2, BookOpen, Flame, Heart, TrendingUp } from 'lucide-react';

interface WeeklyReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: PracticeSession[];
  tasks: Task[];
  reviewEvents: ReviewEvent[];
  mistakes: MistakeEntry[];
  reflections: DailyReflection[];
}

export const WeeklyReviewModal: React.FC<WeeklyReviewModalProps> = ({
  isOpen,
  onClose,
  sessions,
  tasks,
  reviewEvents,
  mistakes,
  reflections,
}) => {
  if (!isOpen) return null;

  const totalSadhanaMinutes = sessions.reduce((acc, s) => acc + (s.durationMinutes || 0), 0);
  const completedTasks = tasks.filter(t => t.status === 'completed');
  const taskCompletionRate = tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0;
  const passedMistakes = mistakes.filter(m => m.retestStatus === 'passed');

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-[#FBF8F2] dark:bg-[#1A201D] border border-[#C4A264]/40 rounded-3xl max-w-2xl w-full shadow-2xl p-6 sm:p-8 text-[#1F2421] dark:text-[#F1F4F2] relative max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#E2DACB] dark:border-[#2E3833]">
          <div>
            <div className="flex items-center gap-1.5 text-[#782F3B] dark:text-[#D4B274] text-xs font-bold uppercase tracking-wider font-heading">
              <Award className="w-4 h-4" />
              <span>Sanjivani Weekly Review & Insight</span>
            </div>
            <h2 className="text-xl font-bold font-heading text-[#782F3B] dark:text-[#D4B274] mt-0.5">
              Reflective Progress Report
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-[#EDE7DB] dark:hover:bg-[#252D29] text-[#716D64]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="py-4 space-y-5 overflow-y-auto flex-1 text-xs">
          {/* Guiding Sincerity Notice */}
          <div className="bg-[#263E32]/10 dark:bg-[#3A5B4A]/20 p-3.5 rounded-2xl border border-[#263E32]/25 text-[11px] leading-relaxed text-[#263E32] dark:text-[#A8C7B5]">
            “Sincerity over superficial streaks. Progress through responsible action, honest reflection, and compassionate renewal.”
            <p className="text-[10px] text-[#716D64] dark:text-[#9FA4A1] mt-1">
              Note: Sanjivani never ranks devotion or calculates spiritual worth. This report reflects your practical efforts and study habits.
            </p>
          </div>

          {/* 4 Pillars Summary Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {/* Sadhana */}
            <div className="p-3 rounded-2xl bg-white dark:bg-[#1E2421] border border-[#C4A264]/30 flex flex-col">
              <div className="flex items-center gap-1.5 text-[#782F3B] dark:text-[#D4B274] font-semibold text-[11px]">
                <Flame className="w-3.5 h-3.5" />
                <span>Sadhana</span>
              </div>
              <span className="text-xl font-bold font-serif text-[#782F3B] dark:text-[#D4B274] mt-2">
                {sessions.length}
              </span>
              <span className="text-[10px] text-[#716D64] dark:text-[#9FA4A1]">
                Sessions ({totalSadhanaMinutes} mins)
              </span>
            </div>

            {/* Kartavya */}
            <div className="p-3 rounded-2xl bg-white dark:bg-[#1E2421] border border-[#C4A264]/30 flex flex-col">
              <div className="flex items-center gap-1.5 text-[#263E32] dark:text-[#A8C7B5] font-semibold text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Kartavya</span>
              </div>
              <span className="text-xl font-bold font-serif text-[#263E32] dark:text-[#A8C7B5] mt-2">
                {completedTasks.length} / {tasks.length}
              </span>
              <span className="text-[10px] text-[#716D64] dark:text-[#9FA4A1]">
                {taskCompletionRate}% Completed
              </span>
            </div>

            {/* Adhyayan */}
            <div className="p-3 rounded-2xl bg-white dark:bg-[#1E2421] border border-[#C4A264]/30 flex flex-col">
              <div className="flex items-center gap-1.5 text-blue-700 dark:text-blue-400 font-semibold text-[11px]">
                <BookOpen className="w-3.5 h-3.5" />
                <span>Adhyayan</span>
              </div>
              <span className="text-xl font-bold font-serif text-blue-700 dark:text-blue-400 mt-2">
                {reviewEvents.length}
              </span>
              <span className="text-[10px] text-[#716D64] dark:text-[#9FA4A1]">
                Recall Reviews Logged
              </span>
            </div>

            {/* Mistake Retests */}
            <div className="p-3 rounded-2xl bg-white dark:bg-[#1E2421] border border-[#C4A264]/30 flex flex-col">
              <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400 font-semibold text-[11px]">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Mistakes</span>
              </div>
              <span className="text-xl font-bold font-serif text-amber-700 dark:text-amber-400 mt-2">
                {passedMistakes.length} / {mistakes.length}
              </span>
              <span className="text-[10px] text-[#716D64] dark:text-[#9FA4A1]">
                Retests Passed
              </span>
            </div>
          </div>

          {/* Practical Next-Week Recommendations */}
          <div className="space-y-2">
            <h4 className="font-bold text-xs uppercase tracking-wider text-[#782F3B] dark:text-[#D4B274]">
              Three Practical Adjustments for Next Week
            </h4>
            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-xl bg-white dark:bg-[#1E2421] border border-[#C4A264]/25 flex items-start gap-2.5">
                <span className="font-bold text-[#782F3B] dark:text-[#D4B274]">1.</span>
                <div>
                  <p className="font-semibold text-[#1F2421] dark:text-[#F1F4F2]">
                    Protect the First 30 Minutes of Morning Stillness
                  </p>
                  <p className="text-[11px] text-[#716D64] dark:text-[#9FA4A1] mt-0.5">
                    Before opening messaging or tasks, anchor your heart in your chosen Sadhana. It sets a peaceful tone for the entire day’s duties.
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white dark:bg-[#1E2421] border border-[#C4A264]/25 flex items-start gap-2.5">
                <span className="font-bold text-[#782F3B] dark:text-[#D4B274]">2.</span>
                <div>
                  <p className="font-semibold text-[#1F2421] dark:text-[#F1F4F2]">
                    Decompose Complex Duties into Concrete 25-Minute Milestones
                  </p>
                  <p className="text-[11px] text-[#716D64] dark:text-[#9FA4A1] mt-0.5">
                    Reviewing unfinished tasks revealed that vague goals stall execution. Break items into single physical actions.
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white dark:bg-[#1E2421] border border-[#C4A264]/25 flex items-start gap-2.5">
                <span className="font-bold text-[#782F3B] dark:text-[#D4B274]">3.</span>
                <div>
                  <p className="font-semibold text-[#1F2421] dark:text-[#F1F4F2]">
                    Prioritize Spaced Retesting Over Passive Reading
                  </p>
                  <p className="text-[11px] text-[#716D64] dark:text-[#9FA4A1] mt-0.5">
                    Your Mistake Notebook entries showed rapid mastery once active retesting was conducted. Continue this discipline.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-[#E2DACB] dark:border-[#2E3833] flex justify-end">
          <button
            onClick={onClose}
            className="bg-[#782F3B] hover:bg-[#5E242E] text-white px-5 py-2 rounded-xl text-xs font-semibold shadow-md"
          >
            Close Report
          </button>
        </div>
      </div>
    </div>
  );
};
