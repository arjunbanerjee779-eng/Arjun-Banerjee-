import React, { useState, useEffect } from 'react';
import {
  UserProfile,
  SadhanaPractice,
  PracticeSession,
  Task,
  Subject,
  Chapter,
  Topic,
  Challenge,
  ChallengeMembership,
  Language,
} from './types';
import { StorageService } from './services/storage';
import { Navbar, TabType } from './components/Navbar';
import { OnboardingModal } from './components/OnboardingModal';
import { SettingsModal } from './components/SettingsModal';
import { TodayView } from './components/today/TodayView';
import { SadhanaView } from './components/sadhana/SadhanaView';
import { KartavyaView } from './components/kartavya/KartavyaView';
import { LearningView } from './components/learning/LearningView';
import { SanghaView } from './components/sangha/SanghaView';

export default function App() {
  const [profile, setProfile] = useState<UserProfile>(StorageService.getProfile());
  const [isOnboarded, setIsOnboarded] = useState<boolean>(StorageService.isOnboarded());
  const [currentTab, setCurrentTab] = useState<TabType>('today');
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  // Core Data State
  const [practices, setPractices] = useState<SadhanaPractice[]>([]);
  const [sessions, setSessions] = useState<PracticeSession[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [challengeMemberships, setChallengeMemberships] = useState<ChallengeMembership[]>([]);

  const refreshData = () => {
    setProfile(StorageService.getProfile());
    setPractices(StorageService.getPractices());
    setSessions(StorageService.getSessions());
    setTasks(StorageService.getTasks());
    setSubjects(StorageService.getSubjects());
    setChapters(StorageService.getChapters());
    setTopics(StorageService.getTopics());
    setChallenges(StorageService.getChallenges());
    setChallengeMemberships(StorageService.getChallengeMemberships());
  };

  useEffect(() => {
    refreshData();
  }, []);

  // Sync theme class to document body
  useEffect(() => {
    const root = document.documentElement;
    if (profile.theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [profile.theme]);

  const handleLanguageChange = (lang: Language) => {
    const updated = { ...profile, language: lang };
    StorageService.saveProfile(updated);
    setProfile(updated);
  };

  const handleToggleSound = () => {
    const updated = { ...profile, soundEnabled: !profile.soundEnabled };
    StorageService.saveProfile(updated);
    setProfile(updated);
  };

  const handleResetData = () => {
    StorageService.resetAllData();
    setIsOnboarded(false);
    refreshData();
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F6F0E5] dark:bg-[#151917] text-[#1F2421] dark:text-[#F1F4F2] transition-colors selection:bg-[#782F3B]/20 selection:text-[#782F3B]">
      {/* Top Navbar & Header */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        profile={profile}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onLanguageChange={handleLanguageChange}
        onToggleSound={handleToggleSound}
      />

      {/* Main Workspace Body */}
      <main className="flex-1 w-full">
        {currentTab === 'today' && (
          <TodayView
            profile={profile}
            tasks={tasks}
            practices={practices}
            topics={topics}
            sessions={sessions}
            onNavigateTab={setCurrentTab}
            onRefreshData={refreshData}
          />
        )}

        {currentTab === 'sadhana' && (
          <SadhanaView
            profile={profile}
            practices={practices}
            sessions={sessions}
            onRefreshData={refreshData}
          />
        )}

        {currentTab === 'kartavya' && (
          <KartavyaView
            profile={profile}
            tasks={tasks}
            onRefreshData={refreshData}
          />
        )}

        {currentTab === 'learning' && (
          <LearningView
            profile={profile}
            subjects={subjects}
            chapters={chapters}
            topics={topics}
            onRefreshData={refreshData}
          />
        )}

        {currentTab === 'sangha' && (
          <SanghaView
            profile={profile}
            challenges={challenges}
            challengeMemberships={challengeMemberships}
            onRefreshData={refreshData}
          />
        )}
      </main>

      {/* Onboarding Flow for New Users */}
      {!isOnboarded && (
        <OnboardingModal
          onComplete={(updatedProfile) => {
            setProfile(updatedProfile);
            setIsOnboarded(true);
            refreshData();
          }}
        />
      )}

      {/* Settings & Privacy Modal */}
      <SettingsModal
        profile={profile}
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onUpdateProfile={(updated) => setProfile(updated)}
        onResetData={handleResetData}
      />
    </div>
  );
}
