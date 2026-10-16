import React, { useState } from 'react';
import {
  UserProfile,
  Challenge,
  ChallengeMembership,
  SharedPost,
  Announcement,
  DevotionalResource,
} from '../../types';
import { StorageService } from '../../services/storage';
import { t } from '../../services/translations';
import {
  Users,
  Award,
  CheckCircle2,
  Calendar,
  Sparkles,
  Shield,
  Plus,
  MessageSquare,
  BookOpen,
  Send,
  Lock,
  Heart,
  AlertTriangle,
} from 'lucide-react';

interface SanghaViewProps {
  profile: UserProfile;
  challenges: Challenge[];
  challengeMemberships: ChallengeMembership[];
  onRefreshData: () => void;
}

export const SanghaView: React.FC<SanghaViewProps> = ({
  profile,
  challenges,
  challengeMemberships,
  onRefreshData,
}) => {
  const [activeTab, setActiveTab] = useState<'challenges' | 'feed' | 'resources' | 'admin'>('challenges');
  const [selectedChallengeToJoin, setSelectedChallengeToJoin] = useState<Challenge | null>(null);
  const [personalGoalInput, setPersonalGoalInput] = useState('');

  // Shared Reflection post state
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [isPostingReflection, setIsPostingReflection] = useState(false);

  // Admin Console State
  const [newChallengeTitle, setNewChallengeTitle] = useState('');
  const [newChallengeDesc, setNewChallengeDesc] = useState('');
  const [newChallengePurpose, setNewChallengePurpose] = useState('');
  const [newChallengeActivity, setNewChallengeActivity] = useState('');
  const [newAnnouncementTitle, setNewAnnouncementTitle] = useState('');
  const [newAnnouncementContent, setNewAnnouncementContent] = useState('');

  const announcements = StorageService.getAnnouncements();
  const sharedPosts = StorageService.getSharedPosts();
  const approvedResources = StorageService.getApprovedResources();

  const todayStr = new Date().toISOString().split('T')[0];

  const handleJoinChallenge = (challengeId: string) => {
    StorageService.joinChallenge(challengeId, personalGoalInput.trim() || undefined);
    setSelectedChallengeToJoin(null);
    setPersonalGoalInput('');
    onRefreshData();
  };

  const handleToggleCheckin = (challengeId: string) => {
    StorageService.toggleChallengeDay(challengeId, todayStr);
    onRefreshData();
  };

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostTitle.trim() || !newPostContent.trim()) return;

    const post: SharedPost = {
      id: `post_${Date.now()}`,
      userId: profile.id,
      authorName: profile.displayName,
      authorRole: profile.lifeStage.replace('_', ' '),
      title: newPostTitle.trim(),
      content: newPostContent.trim(),
      timestamp: new Date().toISOString(),
      isModerated: true,
      likes: 1,
    };

    StorageService.saveSharedPost(post);
    setIsPostingReflection(false);
    setNewPostTitle('');
    setNewPostContent('');
    onRefreshData();
  };

  const handleAdminCreateChallenge = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChallengeTitle.trim()) return;

    const list = StorageService.getChallenges();
    const created: Challenge = {
      id: `chal_${Date.now()}`,
      title: newChallengeTitle.trim(),
      description: newChallengeDesc.trim(),
      purpose: newChallengePurpose.trim(),
      startDate: todayStr,
      endDate: new Date(Date.now() + 3600000 * 24 * 21).toISOString().split('T')[0],
      rules: ['Maintain daily sincerity in your chosen duty', 'Keep private counts private'],
      suggestedDailyActivity: newChallengeActivity.trim(),
      participantCount: 1,
      isPublished: true,
      category: 'sadhana',
    };

    list.unshift(created);
    localStorage.setItem('sanjivani_challenges', JSON.stringify(list));
    setNewChallengeTitle('');
    setNewChallengeDesc('');
    setNewChallengePurpose('');
    setNewChallengeActivity('');
    onRefreshData();
    alert('Challenge published to Sanjivani Sangha directory!');
  };

  const handleAdminPublishAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnnouncementTitle.trim()) return;

    const list = StorageService.getAnnouncements();
    const created: Announcement = {
      id: `ann_${Date.now()}`,
      title: newAnnouncementTitle.trim(),
      content: newAnnouncementContent.trim(),
      publishedAt: new Date().toISOString(),
      authorName: profile.displayName,
    };
    list.unshift(created);
    localStorage.setItem('sanjivani_announcements', JSON.stringify(list));
    setNewAnnouncementTitle('');
    setNewAnnouncementContent('');
    onRefreshData();
    alert('Announcement broadcasted to community!');
  };

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-6 py-6 pb-24 space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-[#263E32] via-[#354F42] to-[#782F3B] rounded-3xl p-5 sm:p-7 text-white shadow-xl border border-[#C4A264]/40 relative overflow-hidden">
        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#D4B274] font-heading">
            <Users className="w-4 h-4" />
            <span>Sangha • Community & Mutual Encouragement</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold font-heading text-[#F6F0E5]">
            Sanjivani Community Circle
          </h1>
          <p className="text-xs sm:text-sm text-[#F6F0E5]/90 font-serif italic max-w-2xl leading-relaxed">
            “Community connection without surveillance. Grow alongside fellow sadhaks, students, and professionals while preserving full personal privacy.”
          </p>

          <div className="flex flex-wrap items-center gap-2 pt-2 text-[11px]">
            <div className="bg-black/20 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
              {challenges.length} Active Challenges
            </div>
            <div className="bg-black/20 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
              {challengeMemberships.length} Enrolled Challenges
            </div>
            <div className="bg-black/20 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 text-[#D4B274]">
              Private Sadhana History Protected
            </div>
          </div>
        </div>
      </div>

      {/* Announcements Carousel / Banner */}
      {announcements.length > 0 && (
        <div className="bg-[#EDE7DB]/80 dark:bg-[#252D29]/80 p-4 rounded-2xl border border-[#C4A264]/30 space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase text-[#782F3B] dark:text-[#D4B274]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Sangha Announcement</span>
          </div>
          <h4 className="font-bold text-sm text-[#1F2421] dark:text-[#F1F4F2]">
            {announcements[0].title}
          </h4>
          <p className="text-xs text-[#716D64] dark:text-[#9FA4A1] leading-relaxed">
            {announcements[0].content}
          </p>
          <span className="text-[10px] text-[#716D64] block pt-1">
            Posted by {announcements[0].authorName}
          </span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E2DACB] dark:border-[#2E3833] pb-3">
        <div className="flex gap-2 text-xs font-medium">
          <button
            onClick={() => setActiveTab('challenges')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl transition-all ${
              activeTab === 'challenges'
                ? 'bg-[#782F3B] text-white shadow-sm'
                : 'text-[#716D64] hover:bg-[#EDE7DB] dark:hover:bg-[#252D29]'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Challenges Directory</span>
          </button>
          <button
            onClick={() => setActiveTab('feed')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl transition-all ${
              activeTab === 'feed'
                ? 'bg-[#782F3B] text-white shadow-sm'
                : 'text-[#716D64] hover:bg-[#EDE7DB] dark:hover:bg-[#252D29]'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Shared Reflections</span>
          </button>
          <button
            onClick={() => setActiveTab('resources')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl transition-all ${
              activeTab === 'resources'
                ? 'bg-[#782F3B] text-white shadow-sm'
                : 'text-[#716D64] hover:bg-[#EDE7DB] dark:hover:bg-[#252D29]'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Approved Library</span>
          </button>
          {profile.role === 'admin' && (
            <button
              onClick={() => setActiveTab('admin')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl transition-all ${
                activeTab === 'admin'
                  ? 'bg-[#263E32] text-white shadow-sm'
                  : 'text-[#263E32] dark:text-[#A8C7B5] font-bold hover:bg-[#EDE7DB]'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Admin Console</span>
            </button>
          )}
        </div>

        {activeTab === 'feed' && (
          <button
            onClick={() => setIsPostingReflection(true)}
            className="flex items-center gap-1.5 bg-[#782F3B] hover:bg-[#5E242E] text-white px-3.5 py-1.5 rounded-xl text-xs font-semibold shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Share Reflection</span>
          </button>
        )}
      </div>

      {/* Tab 1: Challenges Directory */}
      {activeTab === 'challenges' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {challenges.map((chal) => {
              const membership = challengeMemberships.find((m) => m.challengeId === chal.id);
              const isCheckedInToday = membership?.completedDays.includes(todayStr);

              return (
                <div
                  key={chal.id}
                  className="p-5 rounded-2xl bg-[#FBF8F2] dark:bg-[#1A201D] border border-[#C4A264]/30 shadow-sm space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#782F3B]/10 text-[#782F3B] dark:text-[#D4B274]">
                        {chal.category}
                      </span>
                      <span className="text-[10px] text-[#716D64] dark:text-[#9FA4A1]">
                        {chal.participantCount} Participants
                      </span>
                    </div>

                    <h4 className="font-bold text-base text-[#1F2421] dark:text-[#F1F4F2]">
                      {chal.title}
                    </h4>

                    <p className="text-xs text-[#716D64] dark:text-[#9FA4A1] leading-relaxed">
                      {chal.description}
                    </p>

                    <div className="p-2.5 rounded-xl bg-white dark:bg-[#252D29] border border-[#C4A264]/20 text-[11px] space-y-1">
                      <span className="font-bold text-[#263E32] dark:text-[#A8C7B5] block">
                        Daily Focus Activity:
                      </span>
                      <p>{chal.suggestedDailyActivity}</p>
                    </div>

                    {membership && (
                      <div className="pt-2 text-xs space-y-1">
                        <div className="flex justify-between text-[11px]">
                          <span className="text-[#716D64]">Your Sincerity Check-ins:</span>
                          <span className="font-bold text-[#263E32] dark:text-[#A8C7B5]">
                            {membership.completedDays.length} Days Completed
                          </span>
                        </div>
                        {membership.personalGoal && (
                          <p className="text-[10px] text-[#716D64] italic">
                            Goal: “{membership.personalGoal}”
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-[#E2DACB] dark:border-[#2E3833] flex items-center justify-between">
                    {membership ? (
                      <button
                        onClick={() => handleToggleCheckin(chal.id)}
                        className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-semibold transition-colors shadow-sm ${
                          isCheckedInToday
                            ? 'bg-[#263E32] text-white'
                            : 'bg-white dark:bg-[#252D29] border border-[#782F3B] text-[#782F3B] dark:text-[#D4B274] hover:bg-[#782F3B]/10'
                        }`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{isCheckedInToday ? 'Checked in Today ✓' : 'Log Daily Check-in'}</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => setSelectedChallengeToJoin(chal)}
                        className="flex items-center gap-1.5 bg-[#782F3B] hover:bg-[#5E242E] text-white px-4 py-1.5 rounded-xl text-xs font-semibold shadow-sm transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Join Challenge</span>
                      </button>
                    )}

                    <span className="text-[10px] text-[#716D64] flex items-center gap-1">
                      <Lock className="w-3 h-3 text-[#263E32]" />
                      <span>Private logs</span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: Shared Reflections Feed */}
      {activeTab === 'feed' && (
        <div className="space-y-4">
          <div className="space-y-3">
            {sharedPosts.map((post) => (
              <div
                key={post.id}
                className="p-5 rounded-2xl bg-[#FBF8F2] dark:bg-[#1A201D] border border-[#C4A264]/30 shadow-sm space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-[#782F3B]/10 text-[#782F3B] dark:text-[#D4B274] flex items-center justify-center font-bold text-xs">
                      {post.authorName[0]}
                    </div>
                    <div>
                      <span className="font-bold text-xs text-[#1F2421] dark:text-[#F1F4F2]">
                        {post.authorName}
                      </span>
                      <span className="text-[10px] text-[#716D64] ml-2 capitalize">
                        {post.authorRole}
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#263E32]/10 text-[#263E32] dark:text-[#A8C7B5] font-semibold">
                    Approved
                  </span>
                </div>

                <h4 className="font-bold text-sm text-[#782F3B] dark:text-[#D4B274]">
                  {post.title}
                </h4>

                <p className="text-xs text-[#1F2421] dark:text-[#F1F4F2] leading-relaxed">
                  {post.content}
                </p>

                {post.challengeTitle && (
                  <span className="text-[10px] text-[#716D64] italic block">
                    Part of: {post.challengeTitle}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Approved Resources */}
      {activeTab === 'resources' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {approvedResources.map((res) => (
            <div
              key={res.id}
              className="p-5 rounded-2xl bg-[#FBF8F2] dark:bg-[#1A201D] border border-[#C4A264]/30 shadow-sm space-y-2"
            >
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#782F3B] dark:text-[#D4B274]">
                {res.category.replace('_', ' ')}
              </span>
              <h4 className="font-bold text-base text-[#1F2421] dark:text-[#F1F4F2]">
                {res.title}
              </h4>
              <p className="font-serif italic text-xs leading-relaxed text-[#1F2421] dark:text-[#F1F4F2] bg-[#EDE7DB]/50 dark:bg-[#252D29]/50 p-3 rounded-xl border border-[#C4A264]/20">
                {res.contentOrUrl}
              </p>
              <div className="text-[10px] text-[#716D64] flex justify-between pt-1">
                <span>Attribution: {res.attribution}</span>
                <span className="text-[#263E32] dark:text-[#A8C7B5] font-semibold">Verified</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 4: Admin Console */}
      {activeTab === 'admin' && profile.role === 'admin' && (
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-[#263E32]/10 dark:bg-[#3A5B4A]/20 border border-[#263E32]/20 space-y-2 text-xs">
            <h3 className="font-heading font-bold text-base text-[#263E32] dark:text-[#A8C7B5] flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span>Sanjivani Community Administrator Desk</span>
            </h3>
            <p className="text-[#716D64] dark:text-[#9FA4A1]">
              Manage community challenges and broadcast announcements. Note: Administrators do NOT have access to private member Sadhana counts, journals, or mistake logs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Create Challenge */}
            <form onSubmit={handleAdminCreateChallenge} className="p-5 rounded-2xl bg-[#FBF8F2] dark:bg-[#1A201D] border border-[#C4A264]/30 space-y-3 text-xs shadow-sm">
              <h4 className="font-bold text-sm text-[#782F3B] dark:text-[#D4B274]">
                Create & Publish Challenge
              </h4>
              <div>
                <label className="block font-semibold mb-1">Challenge Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 14-Day Seva & Stillness Sprint"
                  value={newChallengeTitle}
                  onChange={(e) => setNewChallengeTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-white dark:bg-[#252D29] border border-[#C4A264]/40"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Description</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Rules, intention, and daily focus..."
                  value={newChallengeDesc}
                  onChange={(e) => setNewChallengeDesc(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-white dark:bg-[#252D29] border border-[#C4A264]/40"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Suggested Daily Activity</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 108 Radha Naam + 30 min family seva"
                  value={newChallengeActivity}
                  onChange={(e) => setNewChallengeActivity(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-white dark:bg-[#252D29] border border-[#C4A264]/40"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-[#782F3B] hover:bg-[#5E242E] text-white py-2 rounded-xl font-semibold shadow-md"
              >
                Publish Challenge
              </button>
            </form>

            {/* Broadcast Announcement */}
            <form onSubmit={handleAdminPublishAnnouncement} className="p-5 rounded-2xl bg-[#FBF8F2] dark:bg-[#1A201D] border border-[#C4A264]/30 space-y-3 text-xs shadow-sm">
              <h4 className="font-bold text-sm text-[#263E32] dark:text-[#A8C7B5]">
                Broadcast Sangha Announcement
              </h4>
              <div>
                <label className="block font-semibold mb-1">Announcement Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Special Satsang & Study Circle"
                  value={newAnnouncementTitle}
                  onChange={(e) => setNewAnnouncementTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-white dark:bg-[#252D29] border border-[#C4A264]/40"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Message Content</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Announcement message for all members..."
                  value={newAnnouncementContent}
                  onChange={(e) => setNewAnnouncementContent(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-white dark:bg-[#252D29] border border-[#C4A264]/40"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-[#263E32] hover:bg-[#1C2F25] text-white py-2 rounded-xl font-semibold shadow-md"
              >
                Broadcast Announcement
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Join Challenge Modal */}
      {selectedChallengeToJoin && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-[#FBF8F2] dark:bg-[#1A201D] border border-[#C4A264]/40 rounded-3xl max-w-md w-full p-6 text-[#1F2421] dark:text-[#F1F4F2] space-y-4">
            <h3 className="font-heading font-bold text-lg text-[#782F3B] dark:text-[#D4B274]">
              Join {selectedChallengeToJoin.title}
            </h3>
            <p className="text-xs text-[#716D64] dark:text-[#9FA4A1]">
              {selectedChallengeToJoin.description}
            </p>
            <div className="space-y-2 text-xs">
              <label className="block font-semibold">Your Personal Commitment / Goal:</label>
              <input
                type="text"
                placeholder="e.g. Wake before sunrise and complete duty with calm"
                value={personalGoalInput}
                onChange={(e) => setPersonalGoalInput(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-white dark:bg-[#252D29] border border-[#C4A264]/40"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setSelectedChallengeToJoin(null)}
                className="text-xs px-3 py-2 text-[#716D64] hover:underline"
              >
                Cancel
              </button>
              <button
                onClick={() => handleJoinChallenge(selectedChallengeToJoin.id)}
                className="bg-[#782F3B] hover:bg-[#5E242E] text-white px-5 py-2 rounded-xl text-xs font-semibold shadow-md"
              >
                Confirm Enrollment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Post Reflection Modal */}
      {isPostingReflection && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-[#FBF8F2] dark:bg-[#1A201D] border border-[#C4A264]/40 rounded-3xl max-w-md w-full p-6 text-[#1F2421] dark:text-[#F1F4F2] space-y-4">
            <h3 className="font-heading font-bold text-lg text-[#782F3B] dark:text-[#D4B274]">
              Share Sincere Reflection
            </h3>
            <form onSubmit={handleCreatePost} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. How quiet morning Jap transformed my study stamina"
                  value={newPostTitle}
                  onChange={(e) => setNewPostTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-white dark:bg-[#252D29] border border-[#C4A264]/40"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Your Thoughts / Insight</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Share practical learnings or encouragement for the community..."
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-white dark:bg-[#252D29] border border-[#C4A264]/40"
                />
              </div>
              <p className="text-[10px] text-[#716D64]">
                Reflections are moderated to ensure mutual encouragement and respect.
              </p>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPostingReflection(false)}
                  className="px-3 py-2 text-[#716D64] hover:underline"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#782F3B] hover:bg-[#5E242E] text-white px-5 py-2 rounded-xl font-semibold shadow-md"
                >
                  Post Reflection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
