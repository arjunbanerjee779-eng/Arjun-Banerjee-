import React from 'react';
import {
  Sun,
  Flame,
  CheckSquare,
  BookOpen,
  Users,
  Settings,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { Language, UserProfile } from '../types';
import { t } from '../services/translations';
import { AudioPlayerBar } from './AudioPlayerBar';

export type TabType = 'today' | 'sadhana' | 'kartavya' | 'learning' | 'sangha';

interface NavbarProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  profile: UserProfile;
  onOpenSettings: () => void;
  onLanguageChange: (lang: Language) => void;
  onToggleSound: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  profile,
  onOpenSettings,
  onLanguageChange,
  onToggleSound,
}) => {
  const tabs = [
    { id: 'today' as TabType, label: t(profile.language, 'today'), icon: Sun },
    { id: 'sadhana' as TabType, label: t(profile.language, 'sadhana'), icon: Flame },
    { id: 'kartavya' as TabType, label: t(profile.language, 'kartavya'), icon: CheckSquare },
    { id: 'learning' as TabType, label: t(profile.language, 'learning'), icon: BookOpen },
    { id: 'sangha' as TabType, label: t(profile.language, 'sangha'), icon: Users },
  ];

  return (
    <>
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-[#F6F0E5]/95 dark:bg-[#151917]/95 backdrop-blur-md border-b border-[#E2DACB] dark:border-[#2E3833] transition-colors">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-2">
          {/* Logo & Subtitle */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#782F3B] to-[#263E32] flex items-center justify-center text-[#F6F0E5] shadow-md border border-[#C4A264]/40">
              {/* Sacred Lotus Motif */}
              <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current text-[#F6F0E5]" aria-hidden="true">
                <path d="M12 2C11.5 5.5 9 8 5 9C9 10 11.5 12.5 12 16C12.5 12.5 15 10 19 9C15 8 12.5 5.5 12 2Z" opacity="0.9" />
                <path d="M12 14C10.5 16.5 8 18 4 18.5C8 19.5 10.5 21 12 23C13.5 21 16 19.5 20 18.5C16 18 13.5 16.5 12 14Z" opacity="0.6" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-heading font-bold text-lg sm:text-xl tracking-wide text-[#782F3B] dark:text-[#D4B274]">
                  {t(profile.language, 'appTitle')}
                </span>
                <span className="hidden sm:inline text-[11px] font-medium px-2 py-0.5 rounded-full bg-[#263E32]/10 dark:bg-[#3A5B4A]/25 text-[#263E32] dark:text-[#A8C7B5] border border-[#263E32]/20">
                  {t(profile.language, 'subtitle')}
                </span>
              </div>
              <p className="text-[11px] text-[#716D64] dark:text-[#9FA4A1] line-clamp-1 hidden md:block">
                “{t(profile.language, 'tagline')}”
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 bg-[#EDE7DB]/70 dark:bg-[#1E2421]/70 p-1 rounded-full border border-[#C4A264]/20">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = currentTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onSelectTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-[#782F3B] text-white shadow-sm ring-1 ring-[#C4A264]'
                      : 'text-[#1F2421] dark:text-[#F1F4F2] hover:bg-[#C4A264]/15'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right actions: Audio Bar, Language, Settings */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <AudioPlayerBar
              soundEnabled={profile.soundEnabled}
              onToggleSound={onToggleSound}
            />

            {/* Language Picker */}
            <select
              aria-label="Language"
              value={profile.language}
              onChange={(e) => onLanguageChange(e.target.value as Language)}
              className="text-xs bg-[#EDE7DB] dark:bg-[#1E2421] border border-[#C4A264]/40 rounded-full px-2 py-1 text-[#1F2421] dark:text-[#F1F4F2] focus:outline-none focus:ring-1 focus:ring-[#C4A264]"
            >
              <option value="en">English</option>
              <option value="bn">বাংলা</option>
              <option value="hi">हिन्दी</option>
            </select>

            {/* Settings button */}
            <button
              onClick={onOpenSettings}
              title="Settings & Privacy"
              className="p-2 rounded-full hover:bg-[#EDE7DB] dark:hover:bg-[#1E2421] text-[#716D64] dark:text-[#9FA4A1] transition-colors relative"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar (5 tabs) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#F6F0E5]/98 dark:bg-[#151917]/98 backdrop-blur-lg border-t border-[#E2DACB] dark:border-[#2E3833] pb-[env(safe-area-inset-bottom)]">
        <div className="flex items-center justify-around h-15 px-1 max-w-lg mx-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className={`flex flex-col items-center justify-center flex-1 py-1 px-1 transition-all ${
                  isActive
                    ? 'text-[#782F3B] dark:text-[#D4B274] font-semibold scale-105'
                    : 'text-[#716D64] dark:text-[#9FA4A1] hover:text-[#1F2421]'
                }`}
              >
                <div
                  className={`p-1 rounded-full transition-colors ${
                    isActive ? 'bg-[#782F3B]/10 dark:bg-[#D4B274]/15' : ''
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] mt-0.5 tracking-tight truncate max-w-[62px]">
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
};
