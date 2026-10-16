import React, { useState } from 'react';
import {
  UserProfile,
  Subject,
  Chapter,
  Topic,
  ReviewEvent,
  MistakeEntry,
  MockTest,
} from '../../types';
import { StorageService } from '../../services/storage';
import {
  calculateNextReview,
  calculateTopicMastery,
} from '../../services/spacedRepetition';
import { requestRevisionAssist, RevisionAssistResponse } from '../../services/aiService';
import {
  BookOpen,
  Plus,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Brain,
  Award,
  Calendar,
  Sparkles,
  Layers,
  ChevronRight,
  TrendingUp,
  FileQuestion,
  Lightbulb,
} from 'lucide-react';

interface LearningViewProps {
  profile: UserProfile;
  subjects: Subject[];
  chapters: Chapter[];
  topics: Topic[];
  onRefreshData: () => void;
}

export const LearningView: React.FC<LearningViewProps> = ({
  profile,
  subjects,
  chapters,
  topics,
  onRefreshData,
}) => {
  const [activeTab, setActiveTab] = useState<'queue' | 'subjects' | 'mistakes' | 'tests'>('queue');
  const [activeRevisionTopic, setActiveRevisionTopic] = useState<Topic | null>(null);

  // Revision Session Modal State
  const [showNotes, setShowNotes] = useState(false);
  const [accuracy, setAccuracy] = useState(85);
  const [confidence, setConfidence] = useState<1 | 2 | 3 | 4 | 5>(4);
  const [assistanceLevel, setAssistanceLevel] = useState<
    'read_solution' | 'attempted_recall' | 'reproduced_method' | 'solved_independently'
  >('attempted_recall');
  const [aiPrompts, setAiPrompts] = useState<RevisionAssistResponse | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);

  // Mistake Notebook State
  const mistakes = StorageService.getMistakes();
  const [isAddingMistake, setIsAddingMistake] = useState(false);
  const [mistakeProblem, setMistakeProblem] = useState('');
  const [mistakeCategory, setMistakeCategory] = useState<MistakeEntry['category']>('conceptual');
  const [mistakeAttempt, setMistakeAttempt] = useState('');
  const [mistakeWhyFailed, setMistakeWhyFailed] = useState('');
  const [mistakeCorrectMethod, setMistakeCorrectMethod] = useState('');
  const [selectedTopicIdForMistake, setSelectedTopicIdForMistake] = useState('');

  // Tests & Mocks State
  const tests = StorageService.getTests();
  const [isAddingTest, setIsAddingTest] = useState(false);
  const [testName, setTestName] = useState('');
  const [maxMarks, setMaxMarks] = useState(100);
  const [obtainedMarks, setObtainedMarks] = useState(75);
  const [testDuration, setTestDuration] = useState(90);

  // New Topic Modal State
  const [isAddingTopic, setIsAddingTopic] = useState(false);
  const [newTopicName, setNewTopicName] = useState('');
  const [newTopicSubjectId, setNewTopicSubjectId] = useState(subjects[0]?.id || '');
  const [newTopicChapterId, setNewTopicChapterId] = useState(chapters[0]?.id || '');
  const [newTopicDifficulty, setNewTopicDifficulty] = useState<Topic['difficulty']>('moderate');
  const [newTopicNotes, setNewTopicNotes] = useState('');

  const todayStr = new Date().toISOString().split('T')[0];

  // Group topics for Spaced Repetition queue
  const dueTodayTopics = topics.filter((t) => {
    if (!t.nextReviewDate) return true;
    return t.nextReviewDate <= todayStr;
  });

  const upcomingTopics = topics.filter((t) => {
    if (!t.nextReviewDate) return false;
    return t.nextReviewDate > todayStr;
  });

  const handleStartRevisionSession = async (topic: Topic) => {
    setActiveRevisionTopic(topic);
    setShowNotes(false);
    setAccuracy(80);
    setConfidence(3);
    setAssistanceLevel('attempted_recall');
    setAiPrompts(null);
    setLoadingAi(true);

    const sub = subjects.find((s) => s.id === topic.subjectId);
    try {
      const res = await requestRevisionAssist({
        subjectName: sub?.name || 'General',
        topicName: topic.name,
        difficulty: topic.difficulty,
        notes: topic.referenceNotes,
      });
      setAiPrompts(res);
    } catch (e) {
      console.warn('AI revision assist failed:', e);
    } finally {
      setLoadingAi(false);
    }
  };

  const handleCompleteRevisionSession = () => {
    if (!activeRevisionTopic) return;

    const sub = subjects.find((s) => s.id === activeRevisionTopic.subjectId);
    const reviewResult = calculateNextReview(
      activeRevisionTopic,
      {
        topicId: activeRevisionTopic.id,
        subjectId: activeRevisionTopic.subjectId,
        topicName: activeRevisionTopic.name,
        subjectName: sub?.name || 'Subject',
        date: todayStr,
        recallAttemptedBeforeNotes: !showNotes,
        accuracyScore: accuracy,
        confidenceRating: confidence,
        assistanceLevel,
        timeSpentMinutes: 15,
      },
      sub?.examDate
    );

    const updatedAccuracies = [
      ...(activeRevisionTopic.accuracyHistory || []),
      accuracy,
    ].slice(-10);

    const updatedTopic: Topic = {
      ...activeRevisionTopic,
      lastReviewedAt: new Date().toISOString(),
      nextReviewDate: reviewResult.nextReviewDate,
      intervalDays: reviewResult.intervalDays,
      repetitionCount: reviewResult.newRepetitionCount,
      easeFactor: reviewResult.newEaseFactor,
      learningStatus: reviewResult.learningStatus,
      totalReviewCount: (activeRevisionTopic.totalReviewCount || 0) + 1,
      independentSolvedCount:
        assistanceLevel === 'solved_independently'
          ? (activeRevisionTopic.independentSolvedCount || 0) + 1
          : activeRevisionTopic.independentSolvedCount || 0,
      accuracyHistory: updatedAccuracies,
    };

    StorageService.saveTopic(updatedTopic);

    // Save review event
    const event: ReviewEvent = {
      id: `rev_${Date.now()}`,
      topicId: activeRevisionTopic.id,
      subjectId: activeRevisionTopic.subjectId,
      topicName: activeRevisionTopic.name,
      subjectName: sub?.name || 'Subject',
      date: todayStr,
      recallAttemptedBeforeNotes: !showNotes,
      accuracyScore: accuracy,
      confidenceRating: confidence,
      assistanceLevel,
      timeSpentMinutes: 15,
      suggestedNextReview: reviewResult.nextReviewDate,
    };
    StorageService.saveReviewEvent(event);

    setActiveRevisionTopic(null);
    onRefreshData();
  };

  const handleSaveMistake = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mistakeProblem.trim()) return;

    const top = topics.find((t) => t.id === selectedTopicIdForMistake);
    const sub = subjects.find((s) => s.id === top?.subjectId);

    const newMistake: MistakeEntry = {
      id: `mstk_${Date.now()}`,
      userId: profile.id,
      topicId: top?.id,
      topicName: top?.name || 'General',
      subjectName: sub?.name,
      problemDescription: mistakeProblem.trim(),
      category: mistakeCategory,
      userAttemptDescription: mistakeAttempt.trim(),
      whyFailedReason: mistakeWhyFailed.trim(),
      correctMethod: mistakeCorrectMethod.trim(),
      retestStatus: 'pending',
      nextRetestDate: new Date(Date.now() + 3600000 * 48).toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
    };

    StorageService.saveMistake(newMistake);
    setIsAddingMistake(false);
    setMistakeProblem('');
    setMistakeAttempt('');
    setMistakeWhyFailed('');
    setMistakeCorrectMethod('');
    onRefreshData();
  };

  const handleRetestToggle = (mistake: MistakeEntry) => {
    const newStatus = mistake.retestStatus === 'passed' ? 'pending' : 'passed';
    StorageService.saveMistake({ ...mistake, retestStatus: newStatus });
    onRefreshData();
  };

  const handleSaveTest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testName.trim()) return;

    const newTest: MockTest = {
      id: `test_${Date.now()}`,
      userId: profile.id,
      testName: testName.trim(),
      date: todayStr,
      maxMarks,
      obtainedMarks,
      durationMinutes: testDuration,
      reflection: 'Recorded from official mock assessment.',
    };

    StorageService.saveTest(newTest);
    setIsAddingTest(false);
    setTestName('');
    onRefreshData();
  };

  const handleCreateTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopicName.trim()) return;

    const created: Topic = {
      id: `top_${Date.now()}`,
      subjectId: newTopicSubjectId,
      chapterId: newTopicChapterId,
      name: newTopicName.trim(),
      importance: 'high',
      difficulty: newTopicDifficulty,
      learningStatus: 'learning',
      referenceNotes: newTopicNotes.trim() || undefined,
      nextReviewDate: todayStr,
      intervalDays: 1,
      repetitionCount: 0,
      easeFactor: 2.5,
      independentSolvedCount: 0,
      totalReviewCount: 0,
      accuracyHistory: [],
    };

    StorageService.saveTopic(created);
    setIsAddingTopic(false);
    setNewTopicName('');
    setNewTopicNotes('');
    onRefreshData();
  };

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-6 py-6 pb-24 space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-[#1E2E25] via-[#263E32] to-[#4A1D25] rounded-3xl p-5 sm:p-7 text-white shadow-xl border border-[#C4A264]/40 relative overflow-hidden">
        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#D4B274] font-heading">
            <Brain className="w-4 h-4" />
            <span>Adhyayan • Deep Learning & Spaced Repetition</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold font-heading text-[#F6F0E5]">
            Retention & Mastery Engine
          </h1>
          <p className="text-xs sm:text-sm text-[#F6F0E5]/90 font-serif italic max-w-2xl leading-relaxed">
            “No passive re-reading. Real retention is forged through the struggle of active recall, spaced repetition, and honest error analysis.”
          </p>

          <div className="flex flex-wrap items-center gap-2 pt-2 text-[11px]">
            <div className="bg-black/20 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
              {dueTodayTopics.length} Topics Due Today
            </div>
            <div className="bg-black/20 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
              {mistakes.filter((m) => m.retestStatus === 'pending').length} Mistakes Awaiting Retest
            </div>
            <div className="bg-black/20 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 text-[#D4B274]">
              SuperMemo-2 Adaptive Intervals
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E2DACB] dark:border-[#2E3833] pb-3">
        <div className="flex gap-2 text-xs font-medium">
          <button
            onClick={() => setActiveTab('queue')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl transition-all ${
              activeTab === 'queue'
                ? 'bg-[#782F3B] text-white shadow-sm'
                : 'text-[#716D64] hover:bg-[#EDE7DB] dark:hover:bg-[#252D29]'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Revision Queue ({dueTodayTopics.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('subjects')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl transition-all ${
              activeTab === 'subjects'
                ? 'bg-[#782F3B] text-white shadow-sm'
                : 'text-[#716D64] hover:bg-[#EDE7DB] dark:hover:bg-[#252D29]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Syllabus Hierarchy</span>
          </button>
          <button
            onClick={() => setActiveTab('mistakes')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl transition-all ${
              activeTab === 'mistakes'
                ? 'bg-[#782F3B] text-white shadow-sm'
                : 'text-[#716D64] hover:bg-[#EDE7DB] dark:hover:bg-[#252D29]'
            }`}
          >
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Mistake Notebook ({mistakes.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('tests')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl transition-all ${
              activeTab === 'tests'
                ? 'bg-[#782F3B] text-white shadow-sm'
                : 'text-[#716D64] hover:bg-[#EDE7DB] dark:hover:bg-[#252D29]'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Mock Tests ({tests.length})</span>
          </button>
        </div>

        <button
          onClick={() => setIsAddingTopic(true)}
          className="flex items-center gap-1.5 bg-[#263E32] hover:bg-[#1C2F25] text-white px-3.5 py-1.5 rounded-xl text-xs font-semibold shadow-sm transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Topic</span>
        </button>
      </div>

      {/* Tab 1: Revision Queue */}
      {activeTab === 'queue' && (
        <div className="space-y-4">
          <div className="space-y-3">
            <h3 className="font-heading font-bold text-sm text-[#782F3B] dark:text-[#D4B274] flex items-center gap-1.5">
              <span>Due for Active Recall Today</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-300 font-bold">
                {dueTodayTopics.length} Due
              </span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {dueTodayTopics.map((topic) => {
                const sub = subjects.find((s) => s.id === topic.subjectId);
                const mastery = calculateTopicMastery(topic);
                return (
                  <div
                    key={topic.id}
                    className="p-4 rounded-2xl bg-[#FBF8F2] dark:bg-[#1A201D] border border-[#C4A264]/35 shadow-sm space-y-3 flex flex-col justify-between"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-[#716D64] uppercase tracking-wider">
                          {sub?.name || 'Subject'}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-semibold capitalize">
                          {topic.difficulty}
                        </span>
                      </div>

                      <h4 className="font-bold text-sm sm:text-base text-[#1F2421] dark:text-[#F1F4F2]">
                        {topic.name}
                      </h4>

                      <div className="flex items-center gap-2 text-[10px] text-[#716D64] dark:text-[#9FA4A1]">
                        <span>Interval: {topic.intervalDays} days</span>
                        <span>• Repetition: #{topic.repetitionCount}</span>
                        <span>• Ease: {topic.easeFactor}</span>
                      </div>

                      {/* Mastery Evidence Bars */}
                      <div className="pt-2 space-y-1">
                        <div className="flex justify-between text-[10px]">
                          <span className="text-[#716D64]">Calculated Mastery Estimate:</span>
                          <span className="font-bold text-[#263E32] dark:text-[#A8C7B5]">
                            {mastery.composite}% ({mastery.level})
                          </span>
                        </div>
                        <div className="w-full bg-[#EDE7DB] dark:bg-[#252D29] h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-[#263E32] dark:bg-[#A8C7B5] h-full rounded-full transition-all"
                            style={{ width: `${mastery.composite}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-[#E2DACB] dark:border-[#2E3833] flex justify-end">
                      <button
                        onClick={() => handleStartRevisionSession(topic)}
                        className="flex items-center gap-1.5 bg-[#782F3B] hover:bg-[#5E242E] text-white px-4 py-1.5 rounded-xl text-xs font-semibold shadow-sm transition-colors"
                      >
                        <Brain className="w-3.5 h-3.5" />
                        <span>Begin Active Recall</span>
                      </button>
                    </div>
                  </div>
                );
              })}

              {dueTodayTopics.length === 0 && (
                <div className="col-span-2 p-8 text-center bg-[#FBF8F2] dark:bg-[#1A201D] rounded-2xl border border-[#E2DACB] dark:border-[#2E3833] space-y-2">
                  <CheckCircle2 className="w-8 h-8 mx-auto text-[#263E32]" />
                  <p className="text-sm font-semibold text-[#1F2421] dark:text-[#F1F4F2]">
                    Active revision queue is clear for today!
                  </p>
                  <p className="text-xs text-[#716D64]">
                    Your retention is reinforced. Take time for independent problem solving or upcoming topics.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Upcoming topics */}
          {upcomingTopics.length > 0 && (
            <div className="space-y-2 pt-4">
              <h4 className="font-bold text-xs uppercase tracking-wider text-[#716D64] dark:text-[#9FA4A1]">
                Upcoming Spaced Reviews ({upcomingTopics.length})
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {upcomingTopics.map((top) => (
                  <div
                    key={top.id}
                    className="p-3 rounded-xl bg-white dark:bg-[#1E2421] border border-[#E2DACB] dark:border-[#2E3833] flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-semibold text-[#1F2421] dark:text-[#F1F4F2]">{top.name}</p>
                      <p className="text-[10px] text-[#716D64]">Due on {top.nextReviewDate}</p>
                    </div>
                    <button
                      onClick={() => handleStartRevisionSession(top)}
                      className="text-[11px] text-[#782F3B] dark:text-[#D4B274] hover:underline"
                    >
                      Review Early
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Syllabus Hierarchy */}
      {activeTab === 'subjects' && (
        <div className="space-y-4">
          {subjects.map((sub) => {
            const subChapters = chapters.filter((c) => c.subjectId === sub.id);
            return (
              <div
                key={sub.id}
                className="p-5 rounded-2xl bg-[#FBF8F2] dark:bg-[#1A201D] border border-[#C4A264]/30 space-y-4 shadow-sm"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E2DACB] dark:border-[#2E3833] pb-3">
                  <div>
                    <h3 className="font-heading font-bold text-base text-[#782F3B] dark:text-[#D4B274]">
                      {sub.name}
                    </h3>
                    {sub.description && (
                      <p className="text-xs text-[#716D64] dark:text-[#9FA4A1]">{sub.description}</p>
                    )}
                  </div>
                  {sub.examDate && (
                    <span className="text-xs px-2.5 py-1 rounded-full bg-[#263E32]/10 text-[#263E32] dark:text-[#A8C7B5] font-semibold border border-[#263E32]/20">
                      Exam Date: {sub.examDate}
                    </span>
                  )}
                </div>

                <div className="space-y-3">
                  {subChapters.map((ch) => {
                    const chapterTopics = topics.filter((t) => t.chapterId === ch.id);
                    return (
                      <div
                        key={ch.id}
                        className="p-3.5 rounded-xl bg-white dark:bg-[#252D29] border border-[#C4A264]/20 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-xs text-[#263E32] dark:text-[#A8C7B5]">
                            Chapter {ch.order}: {ch.name}
                          </span>
                          <span className="text-[10px] text-[#716D64]">
                            {chapterTopics.length} Topics
                          </span>
                        </div>

                        <div className="space-y-1.5 pl-2">
                          {chapterTopics.map((top) => (
                            <div
                              key={top.id}
                              className="flex items-center justify-between p-2 rounded-lg bg-[#FBF8F2] dark:bg-[#1A201D] border border-[#E2DACB] dark:border-[#2E3833] text-xs"
                            >
                              <div>
                                <span className="font-medium text-[#1F2421] dark:text-[#F1F4F2]">
                                  {top.name}
                                </span>
                                <span className="text-[10px] text-[#716D64] ml-2">
                                  Next: {top.nextReviewDate || 'Not scheduled'}
                                </span>
                              </div>
                              <button
                                onClick={() => handleStartRevisionSession(top)}
                                className="text-[11px] text-[#782F3B] dark:text-[#D4B274] font-medium hover:underline"
                              >
                                Test Recall
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab 3: Mistake Notebook */}
      {activeTab === 'mistakes' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-heading font-bold text-sm text-[#782F3B] dark:text-[#D4B274]">
                Mistake Notebook (Error Analysis Protocol)
              </h3>
              <p className="text-[11px] text-[#716D64] dark:text-[#9FA4A1]">
                Classify misconceptions, identify root causes, and retest after 48 hours to eliminate repeated errors.
              </p>
            </div>
            <button
              onClick={() => setIsAddingMistake(true)}
              className="flex items-center gap-1.5 bg-[#782F3B] hover:bg-[#5E242E] text-white px-3.5 py-1.5 rounded-xl text-xs font-semibold shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Log Mistake</span>
            </button>
          </div>

          <div className="space-y-3">
            {mistakes.map((mstk) => (
              <div
                key={mstk.id}
                className="p-5 rounded-2xl bg-[#FBF8F2] dark:bg-[#1A201D] border border-[#C4A264]/30 shadow-sm space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-300">
                      {mstk.category.replace('_', ' ')}
                    </span>
                    <span className="text-xs font-semibold text-[#716D64] dark:text-[#9FA4A1]">
                      Topic: {mstk.topicName || 'General'}
                    </span>
                  </div>

                  <button
                    onClick={() => handleRetestToggle(mstk)}
                    className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      mstk.retestStatus === 'passed'
                        ? 'bg-[#263E32] text-white'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-300'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{mstk.retestStatus === 'passed' ? 'Retest Passed ✓' : 'Awaiting Retest'}</span>
                  </button>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-[#716D64]">Problem / Question:</span>
                  <p className="font-semibold text-xs sm:text-sm text-[#1F2421] dark:text-[#F1F4F2]">
                    {mstk.problemDescription}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-white dark:bg-[#252D29] p-3 rounded-xl border border-[#C4A264]/20">
                  <div>
                    <span className="font-bold text-red-600 dark:text-red-400 block mb-0.5">
                      Why Attempt Failed:
                    </span>
                    <p className="text-[#716D64] dark:text-[#9FA4A1]">{mstk.whyFailedReason}</p>
                  </div>
                  <div>
                    <span className="font-bold text-[#263E32] dark:text-[#A8C7B5] block mb-0.5">
                      Correct Conceptual Method:
                    </span>
                    <p className="text-[#1F2421] dark:text-[#F1F4F2]">{mstk.correctMethod}</p>
                  </div>
                </div>
              </div>
            ))}

            {mistakes.length === 0 && (
              <p className="text-xs text-[#716D64] py-8 text-center italic">
                No mistakes logged yet. When you encounter a challenging question or calculation slip, record it here to cement retention.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Tab 4: Mock Tests */}
      {activeTab === 'tests' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-heading font-bold text-sm text-[#782F3B] dark:text-[#D4B274]">
                Recorded Mock Tests & Accuracy Trends
              </h3>
              <p className="text-[11px] text-[#716D64] dark:text-[#9FA4A1]">
                Calculated strictly from genuine recorded scores without fabricated data.
              </p>
            </div>
            <button
              onClick={() => setIsAddingTest(true)}
              className="flex items-center gap-1.5 bg-[#263E32] hover:bg-[#1C2F25] text-white px-3.5 py-1.5 rounded-xl text-xs font-semibold shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Record Test Result</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {tests.map((tst) => {
              const pct = Math.round((tst.obtainedMarks / tst.maxMarks) * 100);
              return (
                <div
                  key={tst.id}
                  className="p-5 rounded-2xl bg-[#FBF8F2] dark:bg-[#1A201D] border border-[#C4A264]/30 shadow-sm space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-[#716D64]">{tst.date}</span>
                    <span className="text-lg font-bold font-serif text-[#782F3B] dark:text-[#D4B274]">
                      {pct}%
                    </span>
                  </div>

                  <h4 className="font-bold text-sm sm:text-base text-[#1F2421] dark:text-[#F1F4F2]">
                    {tst.testName}
                  </h4>

                  <div className="flex items-center gap-3 text-xs text-[#716D64] dark:text-[#9FA4A1]">
                    <span>Score: <strong>{tst.obtainedMarks}</strong> / {tst.maxMarks}</span>
                    <span>• Duration: {tst.durationMinutes} mins</span>
                  </div>

                  {tst.reflection && (
                    <p className="text-xs text-[#716D64] dark:text-[#9FA4A1] italic bg-[#EDE7DB]/50 dark:bg-[#252D29]/50 p-2.5 rounded-xl">
                      “{tst.reflection}”
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Active Revision Interactive Modal */}
      {activeRevisionTopic && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-[#FBF8F2] dark:bg-[#1A201D] border border-[#C4A264]/40 rounded-3xl max-w-xl w-full p-6 text-[#1F2421] dark:text-[#F1F4F2] space-y-4 max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2DACB] dark:border-[#2E3833]">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#782F3B] dark:text-[#D4B274]">
                  Active Retrieval Revision
                </span>
                <h3 className="font-heading font-bold text-lg text-[#1F2421] dark:text-[#F1F4F2]">
                  {activeRevisionTopic.name}
                </h3>
              </div>
              <button
                onClick={() => setActiveRevisionTopic(null)}
                className="text-xs text-[#716D64] hover:underline"
              >
                Cancel
              </button>
            </div>

            <div className="py-2 space-y-4 overflow-y-auto flex-1 text-xs">
              {/* Active Recall Prompt */}
              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 space-y-2">
                <div className="flex items-center gap-1.5 text-amber-900 dark:text-amber-300 font-bold">
                  <Lightbulb className="w-4 h-4" />
                  <span>Rule: Attempt Recall Before Checking Reference Notes!</span>
                </div>
                <p className="text-amber-800 dark:text-amber-400 leading-relaxed text-xs">
                  State the core principles, formulas, and edge cases mentally or on scratch paper. Do not look at notes until you have genuinely attempted retrieval.
                </p>
              </div>

              {/* AI-Generated Active Recall Prompts */}
              {loadingAi && (
                <div className="p-4 text-center text-xs text-[#716D64]">
                  Generating tailored active recall challenge questions...
                </div>
              )}

              {aiPrompts?.questions && aiPrompts.questions.length > 0 && (
                <div className="space-y-2.5">
                  <h4 className="font-bold text-xs uppercase text-[#263E32] dark:text-[#A8C7B5]">
                    Active Recall Questions:
                  </h4>
                  {aiPrompts.questions.map((q, i) => (
                    <div key={i} className="p-3 rounded-xl bg-white dark:bg-[#252D29] border border-[#C4A264]/30 space-y-1">
                      <p className="font-semibold text-xs text-[#1F2421] dark:text-[#F1F4F2]">
                        Q{i + 1}: {q.prompt}
                      </p>
                      {showNotes && (
                        <p className="text-[11px] text-[#263E32] dark:text-[#A8C7B5] italic bg-[#263E32]/10 p-2 rounded-lg mt-1">
                          Key Concept: {q.sampleAnswer}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Reference Notes Reveal Button */}
              <div>
                {!showNotes ? (
                  <button
                    onClick={() => setShowNotes(true)}
                    className="w-full py-2.5 rounded-xl border border-[#C4A264] text-[#782F3B] dark:text-[#D4B274] font-semibold hover:bg-[#EDE7DB] transition-colors"
                  >
                    I have attempted recall → Reveal Reference Notes
                  </button>
                ) : (
                  <div className="p-3.5 rounded-xl bg-white dark:bg-[#252D29] border border-[#263E32]/40 space-y-1.5 animate-in fade-in">
                    <span className="font-bold text-xs text-[#263E32] dark:text-[#A8C7B5]">
                      Reference Notes & Solution:
                    </span>
                    <p className="text-xs leading-relaxed text-[#1F2421] dark:text-[#F1F4F2]">
                      {activeRevisionTopic.referenceNotes || 'No custom reference notes attached to this topic.'}
                    </p>
                  </div>
                )}
              </div>

              {/* Self Assessment Form */}
              <div className="p-4 rounded-2xl bg-white dark:bg-[#252D29] border border-[#C4A264]/30 space-y-3">
                <span className="font-bold text-xs uppercase text-[#782F3B] dark:text-[#D4B274]">
                  Honest Recall Evaluation
                </span>

                <div>
                  <label className="block font-semibold mb-1">
                    Recall Accuracy: <strong className="text-[#782F3B]">{accuracy}%</strong>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={accuracy}
                    onChange={(e) => setAccuracy(parseInt(e.target.value))}
                    className="w-full accent-[#782F3B]"
                  />
                  <div className="flex justify-between text-[10px] text-[#716D64]">
                    <span>0% (Blank)</span>
                    <span>50% (Partial)</span>
                    <span>100% (Complete Flawless Recall)</span>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold mb-1">Confidence Rating (1 - 5)</label>
                  <div className="flex gap-2">
                    {([1, 2, 3, 4, 5] as const).map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setConfidence(r)}
                        className={`flex-1 py-1.5 rounded-lg border text-xs font-bold transition-all ${
                          confidence === r
                            ? 'bg-[#782F3B] text-white border-[#782F3B]'
                            : 'border-[#E2DACB] hover:bg-[#EDE7DB]'
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block font-semibold mb-1">Assistance Level</label>
                  <select
                    value={assistanceLevel}
                    onChange={(e) => setAssistanceLevel(e.target.value as any)}
                    className="w-full p-2 rounded-xl bg-[#FBF8F2] dark:bg-[#1A201D] border border-[#C4A264]/40 text-xs"
                  >
                    <option value="read_solution">Read solution / notes without recall effort</option>
                    <option value="attempted_recall">Attempted recall from memory before notes</option>
                    <option value="reproduced_method">Reproduced full solution/formula on scratchpad</option>
                    <option value="solved_independently">Solved fresh problem independently</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-[#E2DACB] dark:border-[#2E3833] flex justify-end">
              <button
                onClick={handleCompleteRevisionSession}
                className="bg-[#263E32] hover:bg-[#1C2F25] text-white px-5 py-2.5 rounded-xl font-semibold text-xs shadow-md"
              >
                Submit Session & Compute Next Interval
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Topic Modal */}
      {isAddingTopic && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-[#FBF8F2] dark:bg-[#1A201D] border border-[#C4A264]/40 rounded-3xl max-w-md w-full p-6 text-[#1F2421] dark:text-[#F1F4F2] space-y-4">
            <h3 className="font-heading font-bold text-lg text-[#782F3B] dark:text-[#D4B274]">
              Add Study Topic
            </h3>
            <form onSubmit={handleCreateTopic} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Topic Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Definite Integrals: Tabular Method"
                  value={newTopicName}
                  onChange={(e) => setNewTopicName(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-white dark:bg-[#252D29] border border-[#C4A264]/40 focus:outline-none focus:ring-1 focus:ring-[#782F3B]"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Subject</label>
                <select
                  value={newTopicSubjectId}
                  onChange={(e) => setNewTopicSubjectId(e.target.value)}
                  className="w-full p-2 rounded-xl bg-white dark:bg-[#252D29] border border-[#C4A264]/40"
                >
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">Difficulty</label>
                <select
                  value={newTopicDifficulty}
                  onChange={(e) => setNewTopicDifficulty(e.target.value as any)}
                  className="w-full p-2 rounded-xl bg-white dark:bg-[#252D29] border border-[#C4A264]/40"
                >
                  <option value="easy">Easy</option>
                  <option value="moderate">Moderate</option>
                  <option value="challenging">Challenging</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">Reference Notes or Key Formulas</label>
                <textarea
                  rows={3}
                  placeholder="Formulas, common misconceptions, or boundary conditions..."
                  value={newTopicNotes}
                  onChange={(e) => setNewTopicNotes(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-white dark:bg-[#252D29] border border-[#C4A264]/40"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddingTopic(false)}
                  className="px-4 py-2 text-[#716D64] hover:underline"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#263E32] hover:bg-[#1C2F25] text-white px-5 py-2 rounded-xl font-semibold shadow-md"
                >
                  Save Topic
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Mistake Modal */}
      {isAddingMistake && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-[#FBF8F2] dark:bg-[#1A201D] border border-[#C4A264]/40 rounded-3xl max-w-md w-full p-6 text-[#1F2421] dark:text-[#F1F4F2] space-y-4 max-h-[90vh] flex flex-col">
            <h3 className="font-heading font-bold text-lg text-[#782F3B] dark:text-[#D4B274]">
              Log Misconception into Mistake Notebook
            </h3>

            <form onSubmit={handleSaveMistake} className="space-y-3 text-xs overflow-y-auto flex-1 pr-1">
              <div>
                <label className="block font-semibold mb-1">Question / Problem Description *</label>
                <textarea
                  rows={2}
                  required
                  placeholder="e.g. Evaluate integral of x * e^(2x) dx under time constraint..."
                  value={mistakeProblem}
                  onChange={(e) => setMistakeProblem(e.target.value)}
                  className="w-full p-2 rounded-xl bg-white dark:bg-[#252D29] border border-[#C4A264]/40"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Error Category</label>
                <select
                  value={mistakeCategory}
                  onChange={(e) => setMistakeCategory(e.target.value as any)}
                  className="w-full p-2 rounded-xl bg-white dark:bg-[#252D29] border border-[#C4A264]/40"
                >
                  <option value="conceptual">Conceptual Misunderstanding</option>
                  <option value="formula_selection">Incorrect Formula Selection</option>
                  <option value="calculation">Calculation / Sign Slip</option>
                  <option value="misreading">Misreading the Question</option>
                  <option value="inability_to_start">Inability to Start</option>
                  <option value="time_pressure">Time Pressure Error</option>
                  <option value="careless">Careless Execution</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">Why Did the Attempt Fail?</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Did not notice symmetry; forgot coefficient factor 1/2"
                  value={mistakeWhyFailed}
                  onChange={(e) => setMistakeWhyFailed(e.target.value)}
                  className="w-full p-2 rounded-xl bg-white dark:bg-[#252D29] border border-[#C4A264]/40"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Correct Conceptual Method</label>
                <textarea
                  rows={2}
                  required
                  placeholder="e.g. Use King's Property; antiderivative of e^(kx) is (1/k)e^(kx)"
                  value={mistakeCorrectMethod}
                  onChange={(e) => setMistakeCorrectMethod(e.target.value)}
                  className="w-full p-2 rounded-xl bg-white dark:bg-[#252D29] border border-[#C4A264]/40"
                />
              </div>

              <div className="pt-3 border-t border-[#E2DACB] dark:border-[#2E3833] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddingMistake(false)}
                  className="px-4 py-2 text-[#716D64] hover:underline"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#782F3B] hover:bg-[#5E242E] text-white px-5 py-2 rounded-xl font-semibold shadow-md"
                >
                  Save Mistake
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Test Modal */}
      {isAddingTest && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-[#FBF8F2] dark:bg-[#1A201D] border border-[#C4A264]/40 rounded-3xl max-w-md w-full p-6 text-[#1F2421] dark:text-[#F1F4F2] space-y-4">
            <h3 className="font-heading font-bold text-lg text-[#782F3B] dark:text-[#D4B274]">
              Record Mock Test Result
            </h3>
            <form onSubmit={handleSaveTest} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Test Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. All India Sectional Test #2"
                  value={testName}
                  onChange={(e) => setTestName(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-white dark:bg-[#252D29] border border-[#C4A264]/40"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-1">Marks Obtained</label>
                  <input
                    type="number"
                    value={obtainedMarks}
                    onChange={(e) => setObtainedMarks(parseInt(e.target.value) || 0)}
                    className="w-full p-2 rounded-xl bg-white dark:bg-[#252D29] border border-[#C4A264]/40"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Maximum Marks</label>
                  <input
                    type="number"
                    value={maxMarks}
                    onChange={(e) => setMaxMarks(parseInt(e.target.value) || 100)}
                    className="w-full p-2 rounded-xl bg-white dark:bg-[#252D29] border border-[#C4A264]/40"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddingTest(false)}
                  className="px-4 py-2 text-[#716D64] hover:underline"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#263E32] hover:bg-[#1C2F25] text-white px-5 py-2 rounded-xl font-semibold shadow-md"
                >
                  Save Result
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
