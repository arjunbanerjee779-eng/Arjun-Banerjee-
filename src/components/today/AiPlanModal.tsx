import React, { useState } from 'react';
import { Task, SadhanaPractice, Topic } from '../../types';
import {
  requestDailyPlan,
  requestBacklogRecovery,
  PlanResponse,
  RecoveryResponse,
} from '../../services/aiService';
import {
  Sparkles,
  X,
  Clock,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Calendar,
} from 'lucide-react';

interface AiPlanModalProps {
  mode: 'plan' | 'recovery';
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
  practices: SadhanaPractice[];
  topicsDue: Topic[];
  dailyAvailableHours: number;
  onApplyPlan?: (approvedTasks: any[]) => void;
}

export const AiPlanModal: React.FC<AiPlanModalProps> = ({
  mode,
  isOpen,
  onClose,
  tasks,
  practices,
  topicsDue,
  dailyAvailableHours,
  onApplyPlan,
}) => {
  const [loading, setLoading] = useState(false);
  const [planResult, setPlanResult] = useState<PlanResponse | null>(null);
  const [recoveryResult, setRecoveryResult] = useState<RecoveryResponse | null>(null);
  const [applied, setApplied] = useState(false);

  const fetchPlan = async () => {
    setLoading(true);
    setApplied(false);
    try {
      if (mode === 'plan') {
        const res = await requestDailyPlan({
          availableHours: dailyAvailableHours,
          tasks: tasks.filter(t => t.status !== 'completed'),
          practices: practices.filter(p => p.isActive),
          revisionTopics: topicsDue,
          energyLevel: 'balanced',
        });
        setPlanResult(res);
      } else {
        const overdue = tasks.filter(t => {
          if (t.status === 'completed') return false;
          if (!t.deadline) return false;
          return new Date(t.deadline) < new Date(new Date().toDateString());
        });
        const res = await requestBacklogRecovery({
          overdueTasks: overdue.length > 0 ? overdue : tasks.filter(t => t.status === 'todo'),
          upcomingDeadlines: tasks.filter(t => t.deadline).map(t => ({ title: t.title, deadline: t.deadline })),
          dailyAvailableHours,
          daysToRecover: 3,
        });
        setRecoveryResult(res);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (isOpen) {
      fetchPlan();
    } else {
      setPlanResult(null);
      setRecoveryResult(null);
      setApplied(false);
    }
  }, [isOpen, mode]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-[#FBF8F2] dark:bg-[#1A201D] border border-[#C4A264]/40 rounded-3xl max-w-xl w-full shadow-2xl p-5 sm:p-7 text-[#1F2421] dark:text-[#F1F4F2] relative max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#E2DACB] dark:border-[#2E3833]">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-[#782F3B]/10 text-[#782F3B] dark:text-[#D4B274]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-heading text-[#782F3B] dark:text-[#D4B274]">
                {mode === 'plan' ? 'Sanjivani Daily Planning Assistant' : 'Compassionate Backlog Recovery'}
              </h2>
              <span className="text-[10px] text-[#716D64] dark:text-[#9FA4A1]">
                Respects your limits • Never fabricates data • Requires your approval
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-[#EDE7DB] dark:hover:bg-[#252D29] text-[#716D64]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="py-4 space-y-4 overflow-y-auto flex-1 text-xs">
          {loading && (
            <div className="py-12 flex flex-col items-center justify-center gap-3">
              <RefreshCw className="w-7 h-7 text-[#782F3B] dark:text-[#D4B274] animate-spin" />
              <p className="text-xs text-[#716D64] dark:text-[#9FA4A1] font-medium">
                Synthesizing realistic schedule within {dailyAvailableHours}h focus budget...
              </p>
            </div>
          )}

          {!loading && mode === 'plan' && planResult && (
            <div className="space-y-4 animate-in fade-in">
              {/* Summary Banner */}
              <div className="bg-[#EDE7DB]/70 dark:bg-[#252D29]/70 p-3.5 rounded-2xl border border-[#C4A264]/30 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#782F3B] dark:text-[#D4B274]">
                  Proposed Blueprint
                </span>
                <p className="font-semibold text-sm text-[#1F2421] dark:text-[#F1F4F2]">
                  {planResult.summary}
                </p>
                <p className="text-[11px] text-[#716D64] dark:text-[#9FA4A1]">
                  Estimated Duration: <strong>{planResult.estimated_duration}</strong> | Rationale: {planResult.rationale}
                </p>
              </div>

              {/* Proposed Actions List */}
              <div className="space-y-2">
                <h4 className="font-bold text-xs uppercase tracking-wider text-[#263E32] dark:text-[#A8C7B5]">
                  Recommended Action Sequence
                </h4>
                {planResult.proposed_actions?.map((act, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-[#1E2421] border border-[#C4A264]/25 shadow-sm"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#782F3B]/10 text-[#782F3B] dark:text-[#D4B274]">
                        {act.time}
                      </span>
                      <span className="font-medium">{act.action}</span>
                    </div>
                    <span className="text-[11px] text-[#716D64] dark:text-[#9FA4A1]">
                      {act.durationMinutes} min
                    </span>
                  </div>
                ))}
              </div>

              {/* Warnings / Deferred Items */}
              {planResult.deferred_items?.length > 0 && (
                <div className="bg-amber-50 dark:bg-amber-950/20 p-3 rounded-xl border border-amber-200 dark:border-amber-900/40 text-[11px] text-amber-800 dark:text-amber-300">
                  <div className="flex items-center gap-1.5 font-bold mb-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Protected Balance: Deferred Non-Urgent Tasks</span>
                  </div>
                  <ul className="list-disc pl-4 space-y-0.5">
                    {planResult.deferred_items.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                  <p className="text-[10px] mt-1 text-amber-700/80 dark:text-amber-400/80">
                    Deferring these items prevents cognitive fatigue and protects quality of practice.
                  </p>
                </div>
              )}
            </div>
          )}

          {!loading && mode === 'recovery' && recoveryResult && (
            <div className="space-y-4 animate-in fade-in">
              <div className="bg-[#263E32]/10 dark:bg-[#3A5B4A]/20 p-3.5 rounded-2xl border border-[#263E32]/20 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#263E32] dark:text-[#A8C7B5]">
                  Compassionate Triage
                </span>
                <p className="font-medium text-xs text-[#1F2421] dark:text-[#F1F4F2] leading-relaxed">
                  {recoveryResult.diagnosis}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-white dark:bg-[#1E2421] border border-[#782F3B]/30 space-y-1">
                <span className="text-[10px] font-bold uppercase text-[#782F3B] dark:text-[#D4B274]">
                  Single Immediate Action
                </span>
                <p className="font-bold text-sm text-[#782F3B] dark:text-[#D4B274]">
                  {recoveryResult.immediateAction}
                </p>
                <p className="text-[11px] text-[#716D64] dark:text-[#9FA4A1]">
                  Focus exclusively on this duty before looking at anything else today.
                </p>
              </div>

              {recoveryResult.suggestedDefer?.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-bold text-xs text-[#716D64] dark:text-[#9FA4A1]">
                    Recommended Rescheduling:
                  </h4>
                  {recoveryResult.suggestedDefer.map((item, i) => (
                    <div key={i} className="p-2.5 rounded-xl bg-[#EDE7DB]/50 dark:bg-[#252D29]/50 border border-[#E2DACB] dark:border-[#2E3833]">
                      <span className="font-semibold">{item.title}</span>
                      <p className="text-[10px] text-[#716D64] dark:text-[#9FA4A1] mt-0.5">{item.reason}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer with Approval requirement */}
        <div className="pt-3 border-t border-[#E2DACB] dark:border-[#2E3833] flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[10px] text-[#716D64] dark:text-[#9FA4A1]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#263E32] dark:text-[#A8C7B5]" />
            <span>AI does not modify your records without confirmation</span>
          </div>

          <div className="flex gap-2">
            <button
              onClick={fetchPlan}
              className="px-3 py-1.5 text-xs text-[#716D64] hover:underline"
            >
              Regenerate
            </button>
            <button
              onClick={() => {
                setApplied(true);
                setTimeout(() => {
                  onClose();
                }, 700);
              }}
              disabled={applied}
              className="flex items-center gap-1.5 bg-[#782F3B] hover:bg-[#5E242E] text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-md transition-colors"
            >
              {applied ? <CheckCircle className="w-3.5 h-3.5" /> : null}
              <span>{applied ? 'Plan Accepted!' : 'Approve & Adopt Blueprint'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
