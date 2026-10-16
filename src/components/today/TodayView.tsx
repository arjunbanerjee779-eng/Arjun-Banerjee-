import React, { useState } from 'react';
import {
  UserProfile,
  Task,
  SadhanaPractice,
  Topic,
  PracticeSession,
  DailyReflection,
  ReviewEvent,
  MistakeEntry,
} from '../../types';
import { StorageService } from '../../services/storage';
import { t } from '../../services/translations';
import {
  Sun,
  Flame,
  CheckCircle2,
  Circle,
  Play,
  Sparkles,
  BookOpen,
  ArrowRight,
  Clock,
  Heart,
  RotateCcw,
  Send,
  Calendar,
  AlertCircle,
  Award,
} from 'lucide-react';
import { NaamJapModal } from '../sadhana/NaamJapModal';
import { AiPlanModal } from './AiPlanModal';
import { WeeklyReviewModal } from './WeeklyReviewModal';
import { requestReflectionInsight } from '../../services/aiService';

interface TodayViewProps {
  profile: UserProfile;
  tasks: Task[];
  practices: SadhanaPractice[];
  topics: Topic[];
  sessions: PracticeSession[];
  onNavigateTab: (tab: any) => void;
  onRefreshData: () => void;
}

export const TodayView: React.FC<TodayViewProps> = ({
  profile,
  tasks,
  practices,
  topics,
  sessions,
  onNavigateTab,
  onRefreshData,
}) => {
  const [activePracticeForJap, setActivePracticeForJap] = useState<SadhanaPractice | null>(null);
  const [aiModalMode, setAiModalMode] = useState<'plan' | 'recovery' | null>(null);
  const [showWeeklyReview, setShowWeeklyReview] = useState(false);

  // Today's reflection state
  const todayStr = new Date().toISOString().split('T')[0];
  const reflections = StorageService.getReflections();
  const existingToday = reflections.find(r => r.date === todayStr);

  const [sankalpaText, setSankalpaText] = useState(
    existingToday?.sankalpa || 'Sincerity in every duty. Steady remembrance. Compassionate presence with all.'
  );
  const [isEditingSankalpa, setIsEditingSankalpa] = useState(false);
  const [reflectionWentWell, setReflectionWentWell] = useState(existingToday?.wentWell || '');
  const [reflectionDuty, setReflectionDuty] = useState(existingToday?.dutyFulfilledSincerely || '');
  const [reflectionInterrupted, setReflectionInterrupted] = useState(existingToday?.attentionInterruptedBy || '');
  const [reflectionLearned, setReflectionLearned] = useState(existingToday?.whatLearned || '');
  const [reflectionChangeTomorrow, setReflectionChangeTomorrow] = useState(existingToday?.changeTomorrow || '');
  const [aiReflectionInsight, setAiReflectionInsight] = useState(existingToday?.aiInsight || '');
  const [isReflectingAi, setIsReflectingAi] = useState(false);
  const [reflectionSavedMessage, setReflectionSavedMessage] = useState(false);

  // Compute metrics
  const activeTasks = tasks.filter(t => t.status !== 'completed');
  const completedTasksToday = tasks.filter(t => t.status === 'completed');
  const topicsDueToday = topics.filter(top => {
    if (!top.nextReviewDate) return false;
    return top.nextReviewDate <= todayStr;
  });
  const todaySessions = sessions.filter(s => s.startTime.startsWith(todayStr));
  const totalSadhanaMinutesToday = todaySessions.reduce((acc, s) => acc + (s.durationMinutes || 0), 0);

  // Identify next recommended action
  const nextTask = activeTasks.find(t => t.priority === 'urgent_important') || activeTasks[0];
  const primaryPractice = practices.find(p => p.isActive) || practices[0];

  const handleSaveSankalpa = () => {
    const updatedReflection: DailyReflection = {
      id: existingToday?.id || `refl_${Date.now()}`,
      userId: profile.id,
      date: todayStr,
      sankalpa: sankalpaText.trim(),
      wentWell: reflectionWentWell,
      dutyFulfilledSincerely: reflectionDuty,
      attentionInterruptedBy: reflectionInterrupted,
      whatLearned: reflectionLearned,
      changeTomorrow: reflectionChangeTomorrow,
      aiInsight: aiReflectionInsight,
      createdAt: existingToday?.createdAt || new Date().toISOString(),
    };
    StorageService.saveReflection(updatedReflection);
    setIsEditingSankalpa(false);
  };

  const handleSaveReflection = async () => {
    setIsReflectingAi(true);
    let insight = aiReflectionInsight;
    try {
      const res = await requestReflectionInsight({
        reflectionText: `${reflectionWentWell}. Learned: ${reflectionLearned}`,
        completedTasksCount: completedTasksToday.length,
        sadhanaCount: todaySessions.length,
        primaryObstacle: reflectionInterrupted,
      });
      insight = res.insight;
      setAiReflectionInsight(insight);
    } catch (e) {
      console.warn(e);
    } finally {
      setIsReflectingAi(false);
    }

    const updatedReflection: DailyReflection = {
      id: existingToday?.id || `refl_${Date.now()}`,
      userId: profile.id,
      date: todayStr,
      sankalpa: sankalpaText.trim(),
      wentWell: reflectionWentWell,
      dutyFulfilledSincerely: reflectionDuty,
      attentionInterruptedBy: reflectionInterrupted,
      whatLearned: reflectionLearned,
      changeTomorrow: reflectionChangeTomorrow,
      aiInsight: insight,
      createdAt: existingToday?.createdAt || new Date().toISOString(),
    };
    StorageService.saveReflection(updatedReflection);
    setReflectionSavedMessage(true);
    setTimeout(() => setReflectionSavedMessage(false), 3000);
  };

  const handleToggleTaskStatus = (task: Task) => {
    const newStatus = task.status === 'completed' ? 'todo' : 'completed';
    const updated = {
      ...task,
      status: newStatus as Task['status'],
      completedAt: newStatus === 'completed' ? new Date().toISOString() : undefined,
    };
    StorageService.saveTask(updated);
    onRefreshData();
  };

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-6 py-6 pb-24 space-y-6">
      {/* Top Welcome & Philosophy Bar */}
      <div className="bg-gradient-to-r from-[#263E32] to-[#782F3B] rounded-3xl p-5 sm:p-7 text-white shadow-xl border border-[#C4A264]/40 relative overflow-hidden">
        {/* Subtle decorative background watermarks */}
        <div className="absolute -right-6 -bottom-6 w-44 h-44 rounded-full bg-white/5 blur-2xl pointer-events-none" />

        <div className="relative z-10 space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#F6F0E5]/80 font-heading">
              Shri Radha • Daily Companion
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setAiModalMode('plan')}
                className="flex items-center gap-1.5 bg-white/15 hover:bg-white/25 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-medium transition-colors border border-white/20 text-[#F6F0E5]"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#D4B274]" />
                <span>AI Daily Plan</span>
              </button>
              <button
                onClick={() => setShowWeeklyReview(true)}
                className="flex items-center gap-1.5 bg-[#C4A264]/20 hover:bg-[#C4A264]/30 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-medium transition-colors border border-[#C4A264]/40 text-[#F6F0E5]"
              >
                <Award className="w-3.5 h-3.5 text-[#D4B274]" />
                <span>Weekly Review</span>
              </button>
            </div>
          </div>

          <h1 className="text-xl sm:text-2xl font-bold font-heading text-[#F6F0E5]">
            Pranam, {profile.displayName}
          </h1>

          <p className="text-xs sm:text-sm text-[#F6F0E5]/90 font-serif italic max-w-2xl leading-relaxed">
            “Radha Naam in the heart. Clarity in the mind. Sincerity in every duty.”
          </p>

          {/* Quick Metrics Pills */}
          <div className="flex flex-wrap items-center gap-2 pt-2 text-[11px]">
            <div className="bg-black/20 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-[#D4B274]" />
              <span>Sadhana: {totalSadhanaMinutesToday} mins today</span>
            </div>
            <div className="bg-black/20 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#A8C7B5]" />
              <span>Kartavya: {completedTasksToday.length}/{tasks.length} duties fulfilled</span>
            </div>
            <div className="bg-black/20 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-blue-200" />
              <span>Adhyayan: {topicsDueToday.length} reviews due</span>
            </div>
          </div>
        </div>
      </div>

      {/* Today's Sacred Sankalpa */}
      <div className="bg-[#FBF8F2] dark:bg-[#1A201D] border border-[#C4A264]/35 rounded-2xl p-4 sm:p-5 shadow-sm space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#782F3B] dark:text-[#D4B274] uppercase tracking-wider font-heading">
            <Sun className="w-4 h-4" />
            <span>{t(profile.language, 'sankalpa')}</span>
          </div>
          {!isEditingSankalpa ? (
            <button
              onClick={() => setIsEditingSankalpa(true)}
              className="text-xs text-[#716D64] hover:text-[#782F3B] hover:underline"
            >
              Edit Intention
            </button>
          ) : (
            <button
              onClick={handleSaveSankalpa}
              className="text-xs font-semibold text-[#263E32] dark:text-[#A8C7B5] hover:underline"
            >
              Save Intention
            </button>
          )}
        </div>

        {!isEditingSankalpa ? (
          <p className="font-serif italic text-sm sm:text-base text-[#1F2421] dark:text-[#F1F4F2] leading-relaxed">
            “{sankalpaText}”
          </p>
        ) : (
          <div className="space-y-2">
            <textarea
              rows={2}
              value={sankalpaText}
              onChange={(e) => setSankalpaText(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl bg-white dark:bg-[#252D29] border border-[#C4A264]/40 focus:outline-none focus:ring-1 focus:ring-[#782F3B]"
              placeholder="What is your heartfelt intention for today?"
            />
            <button
              onClick={handleSaveSankalpa}
              className="bg-[#782F3B] text-white px-3 py-1 rounded-lg text-xs font-medium"
            >
              Confirm Sankalpa
            </button>
          </div>
        )}
      </div>

      {/* Grid: Next Action & Sadhana Quick Launch */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Next Recommended Action */}
        <div className="bg-[#FBF8F2] dark:bg-[#1A201D] border border-[#C4A264]/35 rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#263E32] dark:text-[#A8C7B5]">
                {t(profile.language, 'nextAction')}
              </span>
              {nextTask?.priority && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#782F3B]/10 text-[#782F3B] dark:text-[#D4B274] font-medium capitalize">
                  {nextTask.priority.replace('_', ' ')}
                </span>
              )}
            </div>

            {nextTask ? (
              <div className="space-y-1">
                <h3 className="font-bold text-sm sm:text-base text-[#1F2421] dark:text-[#F1F4F2]">
                  {nextTask.title}
                </h3>
                {nextTask.description && (
                  <p className="text-xs text-[#716D64] dark:text-[#9FA4A1] line-clamp-2">
                    {nextTask.description}
                  </p>
                )}
                <div className="flex items-center gap-2 text-[11px] text-[#716D64] dark:text-[#9FA4A1] pt-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Est. {nextTask.estimatedMinutes} mins</span>
                  {nextTask.deadline && <span>• Due {nextTask.deadline}</span>}
                </div>
              </div>
            ) : (
              <p className="text-xs text-[#716D64] dark:text-[#9FA4A1] py-4 italic">
                All duties currently completed. Rest with peace or review a topic.
              </p>
            )}
          </div>

          <div className="pt-4 flex items-center justify-between border-t border-[#E2DACB] dark:border-[#2E3833] mt-3">
            {nextTask ? (
              <button
                onClick={() => handleToggleTaskStatus(nextTask)}
                className="flex items-center gap-1.5 bg-[#263E32] hover:bg-[#1C2F25] text-white px-4 py-2 rounded-xl text-xs font-medium shadow-sm transition-colors"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Mark Completed</span>
              </button>
            ) : (
              <button
                onClick={() => onNavigateTab('kartavya')}
                className="text-xs text-[#782F3B] dark:text-[#D4B274] font-medium hover:underline flex items-center gap-1"
              >
                <span>Add New Duty</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              onClick={() => onNavigateTab('kartavya')}
              className="text-xs text-[#716D64] hover:underline"
            >
              View All Tasks ({activeTasks.length})
            </button>
          </div>
        </div>

        {/* Sadhana Anchor Card */}
        <div className="bg-[#FBF8F2] dark:bg-[#1A201D] border border-[#C4A264]/35 rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#782F3B] dark:text-[#D4B274]">
                Spiritual Anchor
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#EDE7DB] dark:bg-[#252D29] text-[#716D64]">
                Private by default
              </span>
            </div>

            <div className="space-y-1">
              <h3 className="font-bold text-sm sm:text-base text-[#782F3B] dark:text-[#D4B274]">
                {primaryPractice ? primaryPractice.name : 'Shri Radha Naam Jap'}
              </h3>
              <p className="text-xs text-[#716D64] dark:text-[#9FA4A1]">
                {primaryPractice?.intention || 'Anchor the mind in sacred remembrance and stillness.'}
              </p>
              <div className="flex items-center gap-2 text-[11px] text-[#716D64] dark:text-[#9FA4A1] pt-1">
                <span>Target: {primaryPractice?.targetCount ? `${primaryPractice.targetCount} beads` : '15 mins'}</span>
                <span>• {todaySessions.length} sessions logged today</span>
              </div>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-between border-t border-[#E2DACB] dark:border-[#2E3833] mt-3">
            <button
              onClick={() => setActivePracticeForJap(primaryPractice)}
              className="flex items-center gap-1.5 bg-[#782F3B] hover:bg-[#5E242E] text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-md transition-colors"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Start Jap / Practice</span>
            </button>

            <button
              onClick={() => onNavigateTab('sadhana')}
              className="text-xs text-[#716D64] hover:underline"
            >
              Sadhana Journal & History
            </button>
          </div>
        </div>
      </div>

      {/* Priority Duties & Active Revision Split */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Priority Duties Checklist */}
        <div className="bg-[#FBF8F2] dark:bg-[#1A201D] border border-[#C4A264]/35 rounded-2xl p-4 sm:p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#263E32] dark:text-[#A8C7B5] uppercase tracking-wider font-heading">
              <CheckCircle2 className="w-4 h-4" />
              <span>Today’s Duties ({activeTasks.length} pending)</span>
            </div>
            <button
              onClick={() => setAiModalMode('recovery')}
              className="text-[11px] text-[#782F3B] dark:text-[#D4B274] hover:underline flex items-center gap-1"
            >
              <span>Backlog Triage</span>
            </button>
          </div>

          <div className="space-y-2">
            {activeTasks.slice(0, 4).map((task) => (
              <div
                key={task.id}
                className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white dark:bg-[#252D29] border border-[#C4A264]/20 hover:border-[#C4A264]/50 transition-colors"
              >
                <button
                  onClick={() => handleToggleTaskStatus(task)}
                  className="mt-0.5 text-[#716D64] hover:text-[#263E32] transition-colors"
                  title="Toggle Complete"
                >
                  {task.status === 'completed' ? (
                    <CheckCircle2 className="w-4 h-4 text-[#263E32] fill-[#263E32]/10" />
                  ) : (
                    <Circle className="w-4 h-4" />
                  )}
                </button>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-[#1F2421] dark:text-[#F1F4F2] truncate">
                    {task.title}
                  </p>
                  <div className="flex items-center gap-2 text-[10px] text-[#716D64] dark:text-[#9FA4A1] mt-0.5">
                    <span className="capitalize px-1.5 py-0.2 bg-[#EDE7DB] dark:bg-[#1E2421] rounded">
                      {task.category}
                    </span>
                    <span>{task.estimatedMinutes}m</span>
                  </div>
                </div>
              </div>
            ))}
            {activeTasks.length === 0 && (
              <p className="text-xs text-[#716D64] py-3 text-center italic">
                All duties fulfilled! Take a moment of quiet rest.
              </p>
            )}
          </div>
        </div>

        {/* Active Revision Queue Preview */}
        <div className="bg-[#FBF8F2] dark:bg-[#1A201D] border border-[#C4A264]/35 rounded-2xl p-4 sm:p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-blue-800 dark:text-blue-300 uppercase tracking-wider font-heading">
              <BookOpen className="w-4 h-4" />
              <span>Spaced Revision Queue ({topicsDueToday.length} Due)</span>
            </div>
            <button
              onClick={() => onNavigateTab('learning')}
              className="text-[11px] text-[#782F3B] dark:text-[#D4B274] hover:underline"
            >
              Open Adhyayan
            </button>
          </div>

          <div className="space-y-2">
            {topicsDueToday.slice(0, 3).map((top) => (
              <div
                key={top.id}
                className="p-2.5 rounded-xl bg-white dark:bg-[#252D29] border border-[#C4A264]/20 flex items-center justify-between"
              >
                <div>
                  <p className="text-xs font-semibold text-[#1F2421] dark:text-[#F1F4F2]">
                    {top.name}
                  </p>
                  <p className="text-[10px] text-[#716D64] dark:text-[#9FA4A1]">
                    Interval: {top.intervalDays}d • Repetition: #{top.repetitionCount}
                  </p>
                </div>
                <button
                  onClick={() => onNavigateTab('learning')}
                  className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900 text-[11px] font-medium hover:bg-blue-100"
                >
                  Recall Now
                </button>
              </div>
            ))}
            {topicsDueToday.length === 0 && (
              <p className="text-xs text-[#716D64] py-3 text-center italic">
                No topics due for recall right now. Retention is on track.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Evening Sincere Reflection Card */}
      <div className="bg-[#FBF8F2] dark:bg-[#1A201D] border border-[#C4A264]/35 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-[#782F3B]/10 text-[#782F3B] dark:text-[#D4B274]">
              <Heart className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm font-heading text-[#782F3B] dark:text-[#D4B274]">
                Evening Sincere Reflection (Sandhya Chintan)
              </h3>
              <p className="text-[11px] text-[#716D64] dark:text-[#9FA4A1]">
                Private by default • Honest introspection without shame or guilt
              </p>
            </div>
          </div>
          {reflectionSavedMessage && (
            <span className="text-[11px] font-bold text-[#263E32] dark:text-[#A8C7B5]">
              ✓ Reflection Saved Privately
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div>
            <label className="block font-semibold mb-1 text-[#716D64] dark:text-[#9FA4A1]">
              Which duty was fulfilled with genuine sincerity?
            </label>
            <input
              type="text"
              value={reflectionDuty}
              onChange={(e) => setReflectionDuty(e.target.value)}
              placeholder="e.g. Sincere problem solving in calculus; attentive family support"
              className="w-full p-2.5 rounded-xl bg-white dark:bg-[#252D29] border border-[#C4A264]/30 focus:outline-none focus:ring-1 focus:ring-[#782F3B]"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1 text-[#716D64] dark:text-[#9FA4A1]">
              What interrupted or fragmented your attention?
            </label>
            <input
              type="text"
              value={reflectionInterrupted}
              onChange={(e) => setReflectionInterrupted(e.target.value)}
              placeholder="e.g. Excessive phone checking around 4 PM"
              className="w-full p-2.5 rounded-xl bg-white dark:bg-[#252D29] border border-[#C4A264]/30 focus:outline-none focus:ring-1 focus:ring-[#782F3B]"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1 text-[#716D64] dark:text-[#9FA4A1]">
              What did you learn today (conceptually or about your mind)?
            </label>
            <input
              type="text"
              value={reflectionLearned}
              onChange={(e) => setReflectionLearned(e.target.value)}
              placeholder="e.g. King’s property integral shortcut; importance of quiet morning start"
              className="w-full p-2.5 rounded-xl bg-white dark:bg-[#252D29] border border-[#C4A264]/30 focus:outline-none focus:ring-1 focus:ring-[#782F3B]"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1 text-[#716D64] dark:text-[#9FA4A1]">
              What will you adjust tomorrow morning?
            </label>
            <input
              type="text"
              value={reflectionChangeTomorrow}
              onChange={(e) => setReflectionChangeTomorrow(e.target.value)}
              placeholder="e.g. Put phone in drawer during focus block 1"
              className="w-full p-2.5 rounded-xl bg-white dark:bg-[#252D29] border border-[#C4A264]/30 focus:outline-none focus:ring-1 focus:ring-[#782F3B]"
            />
          </div>
        </div>

        {/* AI Reflection Synthesis Box if available */}
        {aiReflectionInsight && (
          <div className="bg-[#EDE7DB]/80 dark:bg-[#252D29]/80 p-3.5 rounded-xl border border-[#C4A264]/30 text-xs space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#782F3B] dark:text-[#D4B274]">
              Evening Insight
            </span>
            <p className="font-serif italic text-sm text-[#1F2421] dark:text-[#F1F4F2]">
              “{aiReflectionInsight}”
            </p>
          </div>
        )}

        <div className="flex justify-end pt-1">
          <button
            onClick={handleSaveReflection}
            disabled={isReflectingAi}
            className="flex items-center gap-2 bg-[#782F3B] hover:bg-[#5E242E] text-white px-5 py-2 rounded-xl text-xs font-semibold shadow-md transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isReflectingAi ? 'Reflecting...' : 'Save Evening Reflection'}</span>
          </button>
        </div>
      </div>

      {/* Modals */}
      {activePracticeForJap && (
        <NaamJapModal
          practice={activePracticeForJap}
          isOpen={!!activePracticeForJap}
          onClose={() => setActivePracticeForJap(null)}
          onSessionSaved={() => onRefreshData()}
          soundEnabled={profile.soundEnabled}
        />
      )}

      {aiModalMode && (
        <AiPlanModal
          mode={aiModalMode}
          isOpen={!!aiModalMode}
          onClose={() => setAiModalMode(null)}
          tasks={tasks}
          practices={practices}
          topicsDue={topicsDueToday}
          dailyAvailableHours={profile.dailyAvailableHours}
          onApplyPlan={() => onRefreshData()}
        />
      )}

      {showWeeklyReview && (
        <WeeklyReviewModal
          isOpen={showWeeklyReview}
          onClose={() => setShowWeeklyReview(false)}
          sessions={sessions}
          tasks={tasks}
          reviewEvents={StorageService.getReviewEvents()}
          mistakes={StorageService.getMistakes()}
          reflections={reflections}
        />
      )}
    </div>
  );
};
