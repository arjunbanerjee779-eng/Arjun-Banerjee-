import React, { useState } from 'react';
import {
  UserProfile,
  SadhanaPractice,
  PracticeSession,
  DevotionalResource,
} from '../../types';
import { StorageService } from '../../services/storage';
import { t } from '../../services/translations';
import {
  Flame,
  Plus,
  Play,
  Calendar,
  BookOpen,
  Clock,
  Shield,
  Volume2,
  CheckCircle2,
  Heart,
  Music,
  Share2,
} from 'lucide-react';
import { NaamJapModal } from './NaamJapModal';

interface SadhanaViewProps {
  profile: UserProfile;
  practices: SadhanaPractice[];
  sessions: PracticeSession[];
  onRefreshData: () => void;
}

export const SadhanaView: React.FC<SadhanaViewProps> = ({
  profile,
  practices,
  sessions,
  onRefreshData,
}) => {
  const [activeTab, setActiveTab] = useState<'practices' | 'history' | 'library'>('practices');
  const [selectedPracticeForSession, setSelectedPracticeForSession] = useState<SadhanaPractice | null>(null);
  const [isCreatingPractice, setIsCreatingPractice] = useState(false);

  // New Practice Form State
  const [newPracticeName, setNewPracticeName] = useState('');
  const [newPracticeType, setNewPracticeType] = useState<SadhanaPractice['type']>('naam_jap');
  const [newPracticeIntention, setNewPracticeIntention] = useState('');
  const [newTargetMinutes, setNewTargetMinutes] = useState(15);
  const [newTargetCount, setNewTargetCount] = useState(108);

  const devotionalResources = StorageService.getApprovedResources();

  const handleCreatePractice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPracticeName.trim()) return;

    const practice: SadhanaPractice = {
      id: `prac_${Date.now()}`,
      userId: profile.id,
      name: newPracticeName.trim(),
      type: newPracticeType,
      intention: newPracticeIntention.trim() || undefined,
      targetDurationMinutes: newTargetMinutes,
      targetCount: newPracticeType === 'naam_jap' ? newTargetCount : undefined,
      preferredSchedule: 'morning',
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    StorageService.savePractice(practice);
    setIsCreatingPractice(false);
    setNewPracticeName('');
    setNewPracticeIntention('');
    onRefreshData();
  };

  const totalSadhanaMinutesAll = sessions.reduce((acc, s) => acc + (s.durationMinutes || 0), 0);

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-6 py-6 pb-24 space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#782F3B] via-[#4A1D25] to-[#263E32] rounded-3xl p-5 sm:p-7 text-white shadow-xl border border-[#C4A264]/40 relative overflow-hidden">
        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#D4B274] font-heading">
            <Flame className="w-4 h-4" />
            <span>Sadhana • Personal Devotion & Inner Clarity</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold font-heading text-[#F6F0E5]">
            Sacred Devotional Anchor
          </h1>
          <p className="text-xs sm:text-sm text-[#F6F0E5]/90 font-serif italic max-w-2xl leading-relaxed">
            “Personal devotion without public spiritual competition. Steady remembrance that quietens the mind and sanctifies daily duty.”
          </p>

          <div className="flex flex-wrap items-center gap-2 pt-2 text-[11px]">
            <div className="bg-black/20 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
              {practices.filter(p => p.isActive).length} Active Practices
            </div>
            <div className="bg-black/20 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
              {sessions.length} Recorded Sessions ({totalSadhanaMinutesAll} total mins)
            </div>
            <div className="bg-black/20 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 text-[#D4B274]">
              Private & Encrypted Locally
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-[#E2DACB] dark:border-[#2E3833] pb-2 text-xs font-medium">
        <button
          onClick={() => setActiveTab('practices')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition-all ${
            activeTab === 'practices'
              ? 'bg-[#782F3B] text-white shadow-sm'
              : 'text-[#716D64] hover:bg-[#EDE7DB] dark:hover:bg-[#252D29]'
          }`}
        >
          <Flame className="w-3.5 h-3.5" />
          <span>My Practices</span>
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition-all ${
            activeTab === 'history'
              ? 'bg-[#782F3B] text-white shadow-sm'
              : 'text-[#716D64] hover:bg-[#EDE7DB] dark:hover:bg-[#252D29]'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Private History</span>
        </button>
        <button
          onClick={() => setActiveTab('library')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition-all ${
            activeTab === 'library'
              ? 'bg-[#782F3B] text-white shadow-sm'
              : 'text-[#716D64] hover:bg-[#EDE7DB] dark:hover:bg-[#252D29]'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Devotional Wisdom</span>
        </button>
      </div>

      {/* Tab 1: Practices */}
      {activeTab === 'practices' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-heading font-bold text-sm text-[#782F3B] dark:text-[#D4B274]">
              Configured Practices
            </h3>
            <button
              onClick={() => setIsCreatingPractice(true)}
              className="flex items-center gap-1.5 bg-[#263E32] hover:bg-[#1C2F25] text-white px-3.5 py-1.5 rounded-xl text-xs font-medium transition-colors shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Custom Practice</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {practices.map((practice) => (
              <div
                key={practice.id}
                className="p-5 rounded-2xl bg-[#FBF8F2] dark:bg-[#1A201D] border border-[#C4A264]/30 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#782F3B]/10 text-[#782F3B] dark:text-[#D4B274]">
                      {practice.type.replace('_', ' ')}
                    </span>
                    <span className="text-[10px] text-[#716D64] dark:text-[#9FA4A1] capitalize">
                      {practice.preferredSchedule?.replace('_', ' ')}
                    </span>
                  </div>

                  <h4 className="font-bold text-base text-[#1F2421] dark:text-[#F1F4F2]">
                    {practice.name}
                  </h4>

                  {practice.intention && (
                    <p className="text-xs text-[#716D64] dark:text-[#9FA4A1] italic">
                      “{practice.intention}”
                    </p>
                  )}

                  <div className="flex items-center gap-3 text-[11px] text-[#716D64] dark:text-[#9FA4A1] pt-1">
                    {practice.targetCount && (
                      <span className="font-medium">Target: {practice.targetCount} beads (1 Mala)</span>
                    )}
                    {practice.targetDurationMinutes && (
                      <span>• Est. {practice.targetDurationMinutes} mins</span>
                    )}
                  </div>
                </div>

                <div className="pt-4 mt-3 border-t border-[#E2DACB] dark:border-[#2E3833] flex items-center justify-between">
                  <span className="text-[10px] text-[#263E32] dark:text-[#A8C7B5] font-medium">
                    {practice.isActive ? 'Active Daily Practice' : 'Paused'}
                  </span>

                  <button
                    onClick={() => setSelectedPracticeForSession(practice)}
                    className="flex items-center gap-1.5 bg-[#782F3B] hover:bg-[#5E242E] text-white px-4 py-1.5 rounded-xl text-xs font-semibold shadow-sm transition-colors"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Launch Session</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Private History */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          <div className="bg-[#EDE7DB]/70 dark:bg-[#252D29]/70 p-3.5 rounded-2xl border border-[#C4A264]/30 flex items-center gap-2 text-xs text-[#716D64] dark:text-[#9FA4A1]">
            <Shield className="w-4 h-4 text-[#263E32] dark:text-[#A8C7B5] shrink-0" />
            <span>
              Private devotional history. Sanjivani never ranks devotion, scores spiritual worth, or generates public devotional leaderboards.
            </span>
          </div>

          <div className="space-y-2.5">
            {sessions.map((sess) => (
              <div
                key={sess.id}
                className="p-4 rounded-2xl bg-[#FBF8F2] dark:bg-[#1A201D] border border-[#C4A264]/25 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-2"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Flame className="w-3.5 h-3.5 text-[#782F3B] dark:text-[#D4B274]" />
                    <span className="font-bold text-sm text-[#1F2421] dark:text-[#F1F4F2]">
                      {sess.practiceName}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#263E32]/10 text-[#263E32] dark:text-[#A8C7B5] font-semibold">
                      Completed
                    </span>
                  </div>
                  {sess.notes && (
                    <p className="text-xs text-[#716D64] dark:text-[#9FA4A1] italic">
                      “{sess.notes}”
                    </p>
                  )}
                  <p className="text-[10px] text-[#716D64] dark:text-[#9FA4A1]">
                    {new Date(sess.startTime).toLocaleDateString(undefined, {
                      weekday: 'short',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>

                <div className="flex items-center gap-3 text-xs sm:text-right">
                  {sess.count && (
                    <div>
                      <span className="block font-bold text-[#782F3B] dark:text-[#D4B274] font-serif text-sm">
                        {sess.count} Beads
                      </span>
                      <span className="text-[10px] text-[#716D64] dark:text-[#9FA4A1]">
                        {Math.floor(sess.count / 108)} Malas
                      </span>
                    </div>
                  )}
                  <div>
                    <span className="block font-bold text-sm text-[#263E32] dark:text-[#A8C7B5]">
                      {sess.durationMinutes} mins
                    </span>
                    <span className="text-[10px] text-[#716D64] dark:text-[#9FA4A1]">
                      Duration
                    </span>
                  </div>
                </div>
              </div>
            ))}

            {sessions.length === 0 && (
              <p className="text-xs text-[#716D64] py-8 text-center italic">
                No practice sessions recorded yet. Launch a session to begin your private record.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Devotional Wisdom Library */}
      {activeTab === 'library' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {devotionalResources.map((res) => (
              <div
                key={res.id}
                className="p-5 rounded-2xl bg-[#FBF8F2] dark:bg-[#1A201D] border border-[#C4A264]/30 shadow-sm space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#782F3B] dark:text-[#D4B274]">
                    {res.resourceType} • {res.category.replace('_', ' ')}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#EDE7DB] dark:bg-[#252D29] text-[#716D64]">
                    Verified
                  </span>
                </div>

                <h4 className="font-bold text-base text-[#1F2421] dark:text-[#F1F4F2]">
                  {res.title}
                </h4>

                <p className="font-serif italic text-xs leading-relaxed text-[#1F2421] dark:text-[#F1F4F2] bg-[#EDE7DB]/50 dark:bg-[#252D29]/50 p-3 rounded-xl border border-[#C4A264]/20">
                  {res.contentOrUrl}
                </p>

                <div className="flex items-center justify-between text-[11px] text-[#716D64] dark:text-[#9FA4A1] pt-1">
                  <span>Source: {res.attribution}</span>
                  <div className="flex gap-1">
                    {res.tags.map((tg, i) => (
                      <span key={i} className="text-[9px] bg-[#EDE7DB] dark:bg-[#2E3833] px-1.5 py-0.5 rounded">
                        #{tg}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create Practice Modal */}
      {isCreatingPractice && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-[#FBF8F2] dark:bg-[#1A201D] border border-[#C4A264]/40 rounded-3xl max-w-md w-full p-6 text-[#1F2421] dark:text-[#F1F4F2] space-y-4">
            <h3 className="font-heading font-bold text-lg text-[#782F3B] dark:text-[#D4B274]">
              Add Sincere Practice
            </h3>
            <form onSubmit={handleCreatePractice} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Practice Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Shri Radha Naam Jap or Morning Prayer"
                  value={newPracticeName}
                  onChange={(e) => setNewPracticeName(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-white dark:bg-[#252D29] border border-[#C4A264]/40 focus:outline-none focus:ring-1 focus:ring-[#782F3B]"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Practice Type</label>
                <select
                  value={newPracticeType}
                  onChange={(e) => setNewPracticeType(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl bg-white dark:bg-[#252D29] border border-[#C4A264]/40"
                >
                  <option value="naam_jap">Naam Jap (Bead Counter)</option>
                  <option value="prayer">Prayer & Sandhya Vandana</option>
                  <option value="naam_sankirtan">Naam Sankirtan & Listening</option>
                  <option value="devotional_reading">Devotional Reading / Swadhyaya</option>
                  <option value="reflection">Quiet Heart Reflection</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">Heartfelt Intention (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Centering the mind in unconditional grace"
                  value={newPracticeIntention}
                  onChange={(e) => setNewPracticeIntention(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-white dark:bg-[#252D29] border border-[#C4A264]/40"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-1">Target Duration (min)</label>
                  <input
                    type="number"
                    min="1"
                    max="180"
                    value={newTargetMinutes}
                    onChange={(e) => setNewTargetMinutes(parseInt(e.target.value) || 15)}
                    className="w-full p-2 rounded-xl bg-white dark:bg-[#252D29] border border-[#C4A264]/40"
                  />
                </div>
                {newPracticeType === 'naam_jap' && (
                  <div>
                    <label className="block font-semibold mb-1">Target Beads</label>
                    <input
                      type="number"
                      step="108"
                      value={newTargetCount}
                      onChange={(e) => setNewTargetCount(parseInt(e.target.value) || 108)}
                      className="w-full p-2 rounded-xl bg-white dark:bg-[#252D29] border border-[#C4A264]/40"
                    />
                  </div>
                )}
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreatingPractice(false)}
                  className="px-4 py-2 text-[#716D64] hover:underline"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#782F3B] hover:bg-[#5E242E] text-white px-5 py-2 rounded-xl font-semibold shadow-md"
                >
                  Save Practice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Session Modal */}
      {selectedPracticeForSession && (
        <NaamJapModal
          practice={selectedPracticeForSession}
          isOpen={!!selectedPracticeForSession}
          onClose={() => setSelectedPracticeForSession(null)}
          onSessionSaved={() => onRefreshData()}
          soundEnabled={profile.soundEnabled}
        />
      )}
    </div>
  );
};
