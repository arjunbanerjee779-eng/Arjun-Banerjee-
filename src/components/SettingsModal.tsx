import React, { useState } from 'react';
import { UserProfile, Language, ThemeMode } from '../types';
import { StorageService } from '../services/storage';
import {
  X,
  User,
  Shield,
  Download,
  Trash2,
  Globe,
  Palette,
  Volume2,
  Database,
  CheckCircle2,
  FileText,
} from 'lucide-react';
import { t } from '../services/translations';

interface SettingsModalProps {
  profile: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onUpdateProfile: (updated: UserProfile) => void;
  onResetData: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  profile,
  isOpen,
  onClose,
  onUpdateProfile,
  onResetData,
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'privacy' | 'appearance' | 'database'>('profile');
  const [name, setName] = useState(profile.displayName);
  const [lifeStage, setLifeStage] = useState(profile.lifeStage);
  const [availableHours, setAvailableHours] = useState(profile.dailyAvailableHours);
  const [role, setRole] = useState(profile.role);
  const [showSqlMigration, setShowSqlMigration] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  if (!isOpen) return null;

  const handleSaveProfile = () => {
    const updated: UserProfile = {
      ...profile,
      displayName: name.trim() || 'Sadhak',
      lifeStage,
      dailyAvailableHours: availableHours,
      role,
    };
    StorageService.saveProfile(updated);
    onUpdateProfile(updated);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleExportJson = () => {
    const jsonStr = StorageService.exportAllData();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sanjivani-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleResetConfirm = () => {
    if (window.confirm('Are you sure you want to reset all local Sanjivani data? This will clear all tasks, reviews, and logs.')) {
      onResetData();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-[#FBF8F2] dark:bg-[#1A201D] border border-[#C4A264]/40 rounded-2xl max-w-2xl w-full shadow-2xl p-5 sm:p-7 text-[#1F2421] dark:text-[#F1F4F2] relative max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#E2DACB] dark:border-[#2E3833]">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold font-heading text-[#782F3B] dark:text-[#D4B274]">
              Settings & Privacy
            </h2>
            <span className="text-[10px] bg-[#263E32]/10 text-[#263E32] dark:text-[#A8C7B5] px-2 py-0.5 rounded-full border border-[#263E32]/20">
              Workspace v1.0
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-[#EDE7DB] dark:hover:bg-[#252D29] text-[#716D64]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Buttons */}
        <div className="flex gap-2 border-b border-[#E2DACB] dark:border-[#2E3833] py-2 text-xs font-medium overflow-x-auto">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === 'profile'
                ? 'bg-[#782F3B] text-white'
                : 'text-[#716D64] hover:bg-[#EDE7DB] dark:hover:bg-[#252D29]'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Profile & Role</span>
          </button>
          <button
            onClick={() => setActiveTab('privacy')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === 'privacy'
                ? 'bg-[#782F3B] text-white'
                : 'text-[#716D64] hover:bg-[#EDE7DB] dark:hover:bg-[#252D29]'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Privacy & Data</span>
          </button>
          <button
            onClick={() => setActiveTab('appearance')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === 'appearance'
                ? 'bg-[#782F3B] text-white'
                : 'text-[#716D64] hover:bg-[#EDE7DB] dark:hover:bg-[#252D29]'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>Theme & Sound</span>
          </button>
          <button
            onClick={() => setActiveTab('database')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === 'database'
                ? 'bg-[#782F3B] text-white'
                : 'text-[#716D64] hover:bg-[#EDE7DB] dark:hover:bg-[#252D29]'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>PostgreSQL Schema</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="py-4 space-y-4 overflow-y-auto flex-1 text-xs">
          {activeTab === 'profile' && (
            <div className="space-y-3">
              <div>
                <label className="block font-semibold mb-1">Display Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#1E2421] border border-[#C4A264]/40 focus:outline-none focus:ring-1 focus:ring-[#782F3B]"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Current Life Stage / Focus</label>
                <select
                  value={lifeStage}
                  onChange={(e) => setLifeStage(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#1E2421] border border-[#C4A264]/40"
                >
                  <option value="student">Student (School / College)</option>
                  <option value="competitive_exam">Competitive Exam Aspirant</option>
                  <option value="professional">Working Professional / Creator</option>
                  <option value="householder">Householder / Family Caregiver</option>
                  <option value="devotee">Devotee / Sadhak</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">
                  Daily Available Focus Time ({availableHours} hours)
                </label>
                <input
                  type="range"
                  min="1"
                  max="14"
                  step="0.5"
                  value={availableHours}
                  onChange={(e) => setAvailableHours(parseFloat(e.target.value))}
                  className="w-full accent-[#782F3B]"
                />
              </div>

              <div className="pt-2 border-t border-[#E2DACB] dark:border-[#2E3833]">
                <label className="block font-semibold mb-1">Platform Role</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setRole('member')}
                    className={`flex-1 p-2 rounded-xl border text-center transition-all ${
                      role === 'member'
                        ? 'border-[#782F3B] bg-[#782F3B]/10 font-bold text-[#782F3B] dark:text-[#D4B274]'
                        : 'border-[#E2DACB] hover:bg-[#EDE7DB]'
                    }`}
                  >
                    Community Member
                  </button>
                  <button
                    onClick={() => setRole('admin')}
                    className={`flex-1 p-2 rounded-xl border text-center transition-all ${
                      role === 'admin'
                        ? 'border-[#263E32] bg-[#263E32]/10 font-bold text-[#263E32] dark:text-[#A8C7B5]'
                        : 'border-[#E2DACB] hover:bg-[#EDE7DB]'
                    }`}
                  >
                    Community Administrator
                  </button>
                </div>
                <p className="text-[10px] text-[#716D64] dark:text-[#9FA4A1] mt-1">
                  Admins can manage community challenges, announcements, and moderation in the Sangha tab.
                </p>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={handleSaveProfile}
                  className="flex items-center gap-1.5 bg-[#782F3B] hover:bg-[#5E242E] text-white px-4 py-2 rounded-xl font-medium shadow-sm"
                >
                  {isSaved ? <CheckCircle2 className="w-4 h-4" /> : null}
                  <span>{isSaved ? 'Saved!' : 'Save Profile Changes'}</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="space-y-4">
              <div className="bg-[#EDE7DB]/70 dark:bg-[#252D29]/70 p-4 rounded-xl border border-[#C4A264]/30 space-y-2">
                <div className="flex items-center gap-2 font-bold text-[#263E32] dark:text-[#A8C7B5]">
                  <Shield className="w-4 h-4" />
                  <span>Sanjivani Privacy Guarantee</span>
                </div>
                <p className="text-[#716D64] dark:text-[#9FA4A1] leading-relaxed">
                  • <strong>Private by default:</strong> Your Naam Jap counts, devotional journal, task calendar, mistake entries, and test scores are never published or shared unless you explicitly choose to post a milestone to a community challenge.
                  <br />• <strong>No Spiritual Worth Calculation:</strong> Sanjivani never grades, scores, or ranks human spiritual purity or devotion.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Data Portability & Management</h4>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={handleExportJson}
                    className="flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-[#1E2421] border border-[#C4A264]/40 hover:bg-[#EDE7DB] rounded-xl text-xs font-medium"
                  >
                    <Download className="w-3.5 h-3.5 text-[#782F3B] dark:text-[#D4B274]" />
                    <span>Export Entire Account (JSON)</span>
                  </button>
                  <button
                    onClick={handleResetConfirm}
                    className="flex items-center gap-1.5 px-3 py-2 bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900 rounded-xl text-xs font-medium hover:bg-red-100"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Reset All Local Data</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="space-y-3">
              <div>
                <label className="block font-semibold mb-1">Visual Theme</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['devotional', 'light', 'dark'] as ThemeMode[]).map((m) => (
                    <button
                      key={m}
                      onClick={() => {
                        const updated = { ...profile, theme: m };
                        StorageService.saveProfile(updated);
                        onUpdateProfile(updated);
                      }}
                      className={`p-2.5 rounded-xl border text-center capitalize text-xs ${
                        profile.theme === m
                          ? 'border-[#782F3B] bg-[#782F3B]/10 font-bold text-[#782F3B] dark:text-[#D4B274]'
                          : 'border-[#E2DACB] hover:bg-[#EDE7DB]'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Sound Feedback</label>
                <div className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-[#1E2421] border border-[#C4A264]/30">
                  <div className="flex items-center gap-2">
                    <Volume2 className="w-4 h-4 text-[#782F3B] dark:text-[#D4B274]" />
                    <div>
                      <p className="font-semibold">Mala Clicks & Singing Bowl Chime</p>
                      <p className="text-[10px] text-[#716D64] dark:text-[#9FA4A1]">
                        Generates serene acoustic tones using Web Audio API
                      </p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={profile.soundEnabled}
                    onChange={(e) => {
                      const updated = { ...profile, soundEnabled: e.target.checked };
                      StorageService.saveProfile(updated);
                      onUpdateProfile(updated);
                    }}
                    className="w-4 h-4 accent-[#782F3B]"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'database' && (
            <div className="space-y-3">
              <div className="bg-[#263E32]/10 dark:bg-[#3A5B4A]/20 p-3 rounded-xl border border-[#263E32]/20 text-[11px] leading-relaxed">
                <p className="font-semibold text-[#263E32] dark:text-[#A8C7B5]">
                  Relational PostgreSQL Schema Specification
                </p>
                <p className="text-[#716D64] dark:text-[#9FA4A1] mt-1">
                  Sanjivani is engineered with a strict relational data model. To connect a production Supabase or Cloud SQL instance, run the normalized DDL schema below.
                </p>
              </div>

              <div className="bg-black/90 text-amber-200 p-3 rounded-xl font-mono text-[10px] overflow-x-auto max-h-48 border border-amber-900/40">
                <pre>{`-- SANJIVANI POSTGRESQL PRODUCTION DDL
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  display_name TEXT NOT NULL,
  email TEXT UNIQUE,
  role TEXT DEFAULT 'member',
  life_stage TEXT NOT NULL,
  language TEXT DEFAULT 'en',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  priority TEXT NOT NULL,
  estimated_minutes INT NOT NULL,
  status TEXT DEFAULT 'todo',
  deadline DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE practice_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  practice_name TEXT NOT NULL,
  count INT,
  duration_minutes INT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id UUID,
  name TEXT NOT NULL,
  ease_factor NUMERIC(3,2) DEFAULT 2.5,
  interval_days INT DEFAULT 1,
  repetition_count INT DEFAULT 0,
  next_review_date DATE NOT NULL
);

CREATE TABLE mistake_notebook (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  problem_description TEXT NOT NULL,
  category TEXT NOT NULL,
  why_failed TEXT NOT NULL,
  correct_method TEXT NOT NULL,
  retest_status TEXT DEFAULT 'pending'
);`}</pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
