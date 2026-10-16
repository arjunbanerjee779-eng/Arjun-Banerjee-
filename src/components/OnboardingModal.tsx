import React, { useState } from 'react';
import { UserProfile, Language } from '../types';
import { StorageService } from '../services/storage';
import { Sparkles, ArrowRight, Check, Heart, Shield, Clock, BookOpen, Flame } from 'lucide-react';
import { t } from '../services/translations';

interface OnboardingModalProps {
  onComplete: (profile: UserProfile) => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('Arjun Banerjee');
  const [lifeStage, setLifeStage] = useState<UserProfile['lifeStage']>('student');
  const [availableHours, setAvailableHours] = useState(6);
  const [primaryGoal, setPrimaryGoal] = useState('Exam Excellence with Deep Understanding');
  const [sadhanaFocus, setSadhanaFocus] = useState('Shri Radha Naam Jap (108 beads) & Centering');
  const [proposedPlan, setProposedPlan] = useState([
    { time: '06:00 AM', label: 'Morning Centering & Chosen Sadhana', duration: '20 mins' },
    { time: '08:30 AM', label: 'Highest Priority Duty / Deep Study Block', duration: '90 mins' },
    { time: '02:00 PM', label: 'Active Spaced Revision & Mistake Logging', duration: '45 mins' },
    { time: '08:30 PM', label: 'Family Duty, Walking & Evening Sincere Reflection', duration: '30 mins' },
  ]);

  const handleFinish = () => {
    const existing = StorageService.getProfile();
    const updated: UserProfile = {
      ...existing,
      displayName: name.trim() || 'Sadhak',
      lifeStage,
      dailyAvailableHours: availableHours,
      primaryGoals: [primaryGoal, 'Steady Sadhana', 'Sincerity in Duty'],
    };
    StorageService.saveProfile(updated);
    StorageService.setOnboarded(true);
    onComplete(updated);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-[#FBF8F2] dark:bg-[#1A201D] border border-[#C4A264]/40 rounded-2xl max-w-xl w-full shadow-2xl p-6 sm:p-8 text-[#1F2421] dark:text-[#F1F4F2] relative">
        {/* Step Indicators */}
        <div className="flex items-center justify-between mb-6 border-b border-[#E2DACB] dark:border-[#2E3833] pb-3 text-xs font-medium">
          <div className="flex items-center gap-1.5 text-[#782F3B] dark:text-[#D4B274]">
            <Sparkles className="w-4 h-4" />
            <span className="font-heading uppercase tracking-wider">Welcome to Sanjivani</span>
          </div>
          <span className="text-[#716D64] dark:text-[#9FA4A1]">Step {step} of 4</span>
        </div>

        {/* Step 1: Welcome & Philosophy */}
        {step === 1 && (
          <div className="space-y-4 animate-in fade-in">
            <div className="text-center space-y-2 py-2">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-[#782F3B] to-[#263E32] flex items-center justify-center text-white shadow-md border border-[#C4A264]">
                <Flame className="w-8 h-8 text-[#F6F0E5]" />
              </div>
              <h2 className="text-2xl font-bold font-heading text-[#782F3B] dark:text-[#D4B274]">
                Sanjivani
              </h2>
              <p className="text-xs uppercase tracking-widest text-[#263E32] dark:text-[#A8C7B5] font-semibold">
                Sadhana • Kartavya • Adhyayan • Sangha
              </p>
            </div>

            <div className="bg-[#EDE7DB]/70 dark:bg-[#252D29]/70 rounded-xl p-4 border border-[#C4A264]/30 space-y-2 text-sm leading-relaxed">
              <p className="font-serif italic text-[#782F3B] dark:text-[#D4B274] text-center text-base">
                “Radha Naam in the heart. Clarity in the mind. Sincerity in every duty.”
              </p>
              <p className="text-xs text-[#716D64] dark:text-[#9FA4A1] text-center">
                Progress through sincere practice, responsible action, honest reflection, and compassionate renewal.
              </p>
            </div>

            <div className="text-xs text-[#716D64] dark:text-[#9FA4A1] space-y-2 pt-1">
              <p className="flex items-start gap-2">
                <Shield className="w-4 h-4 text-[#263E32] dark:text-[#A8C7B5] shrink-0 mt-0.5" />
                <span>
                  <strong>Privacy by default:</strong> Your devotional counts, mistake logs, and private reflections stay on your device. We never calculate spiritual worth or promote devotional ranking.
                </span>
              </p>
              <p className="flex items-start gap-2">
                <Heart className="w-4 h-4 text-[#782F3B] dark:text-[#D4B274] shrink-0 mt-0.5" />
                <span>
                  <strong>Compassionate discipline:</strong> When you miss a day, Sanjivani helps you restart without shame or guilt.
                </span>
              </p>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                onClick={() => setStep(2)}
                className="flex items-center gap-2 bg-[#782F3B] hover:bg-[#5E242E] text-white px-5 py-2.5 rounded-xl font-medium text-sm transition-colors shadow-md"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Context & Life Stage */}
        {step === 2 && (
          <div className="space-y-4 animate-in fade-in">
            <h3 className="text-lg font-bold font-heading text-[#782F3B] dark:text-[#D4B274]">
              Your Context & Responsibilities
            </h3>
            <p className="text-xs text-[#716D64] dark:text-[#9FA4A1]">
              Sanjivani adapts to your genuine circumstances. There is no one-size-fits-all mold.
            </p>

            <div className="space-y-3 pt-2 text-xs">
              <div>
                <label className="block font-semibold mb-1">Your Name / Preferred Title</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Arjun"
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#1E2421] border border-[#C4A264]/40 focus:outline-none focus:ring-2 focus:ring-[#782F3B]"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Primary Life Stage</label>
                <select
                  value={lifeStage}
                  onChange={(e) => setLifeStage(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#1E2421] border border-[#C4A264]/40 focus:outline-none focus:ring-2 focus:ring-[#782F3B]"
                >
                  <option value="student">Student (School / College / University)</option>
                  <option value="competitive_exam">Competitive Exam Aspirant (GATE / UPSC / NET)</option>
                  <option value="professional">Working Professional / Entrepreneur</option>
                  <option value="householder">Householder / Family Caregiver</option>
                  <option value="devotee">Devotee / Sadhak</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">
                  Daily Available Focus Time: <span className="text-[#782F3B] dark:text-[#D4B274] font-bold">{availableHours} Hours</span>
                </label>
                <input
                  type="range"
                  min="2"
                  max="12"
                  step="0.5"
                  value={availableHours}
                  onChange={(e) => setAvailableHours(parseFloat(e.target.value))}
                  className="w-full accent-[#782F3B]"
                />
                <div className="flex justify-between text-[10px] text-[#716D64] dark:text-[#9FA4A1]">
                  <span>2h (Gentle)</span>
                  <span>6h (Standard)</span>
                  <span>12h (Intensive)</span>
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-between">
              <button
                onClick={() => setStep(1)}
                className="text-xs text-[#716D64] hover:underline px-3 py-2"
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                className="flex items-center gap-2 bg-[#782F3B] hover:bg-[#5E242E] text-white px-5 py-2 rounded-xl font-medium text-xs transition-colors shadow-md"
              >
                <span>Next</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Aspirations & Intentions */}
        {step === 3 && (
          <div className="space-y-4 animate-in fade-in">
            <h3 className="text-lg font-bold font-heading text-[#782F3B] dark:text-[#D4B274]">
              Personal Intentions
            </h3>
            <p className="text-xs text-[#716D64] dark:text-[#9FA4A1]">
              Clarify your main direction so the Today dashboard can highlight the right next action.
            </p>

            <div className="space-y-3 pt-2 text-xs">
              <div>
                <label className="block font-semibold mb-1">Main Intellectual / Professional Goal</label>
                <input
                  type="text"
                  value={primaryGoal}
                  onChange={(e) => setPrimaryGoal(e.target.value)}
                  placeholder="e.g. Master Mathematics & Clear Exams with Distinction"
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#1E2421] border border-[#C4A264]/40 focus:outline-none focus:ring-2 focus:ring-[#782F3B]"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Chosen Sadhana Practice</label>
                <input
                  type="text"
                  value={sadhanaFocus}
                  onChange={(e) => setSadhanaFocus(e.target.value)}
                  placeholder="e.g. Shri Radha Naam Jap or 15 mins Quiet Prayer"
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#1E2421] border border-[#C4A264]/40 focus:outline-none focus:ring-2 focus:ring-[#782F3B]"
                />
                <span className="text-[10px] text-[#716D64] dark:text-[#9FA4A1]">
                  You have full autonomy to select any spiritual practice, prayer, or quiet reflection.
                </span>
              </div>
            </div>

            <div className="pt-4 flex justify-between">
              <button
                onClick={() => setStep(2)}
                className="text-xs text-[#716D64] hover:underline px-3 py-2"
              >
                Back
              </button>
              <button
                onClick={() => setStep(4)}
                className="flex items-center gap-2 bg-[#782F3B] hover:bg-[#5E242E] text-white px-5 py-2 rounded-xl font-medium text-xs transition-colors shadow-md"
              >
                <span>Preview First-Day Plan</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Proposed Plan Preview */}
        {step === 4 && (
          <div className="space-y-4 animate-in fade-in">
            <h3 className="text-lg font-bold font-heading text-[#782F3B] dark:text-[#D4B274]">
              Proposed Day 1 Blueprint
            </h3>
            <p className="text-xs text-[#716D64] dark:text-[#9FA4A1]">
              A balanced preview integrating Sadhana, Kartavya duty, and Adhyayan revision. You can edit this anytime.
            </p>

            <div className="space-y-2 pt-1 text-xs">
              {proposedPlan.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-[#1E2421] border border-[#C4A264]/30"
                >
                  <div className="flex items-center gap-2.5">
                    <Clock className="w-4 h-4 text-[#782F3B] dark:text-[#D4B274] shrink-0" />
                    <div>
                      <span className="font-semibold text-[#263E32] dark:text-[#A8C7B5]">{item.time}</span>
                      <p className="font-medium text-[#1F2421] dark:text-[#F1F4F2]">{item.label}</p>
                    </div>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#EDE7DB] dark:bg-[#2E3833] text-[#716D64] dark:text-[#9FA4A1]">
                    {item.duration}
                  </span>
                </div>
              ))}
            </div>

            <div className="bg-[#263E32]/10 dark:bg-[#3A5B4A]/20 p-3 rounded-xl text-[11px] text-[#263E32] dark:text-[#A8C7B5] border border-[#263E32]/20">
              ✓ Ready! You can begin with a peaceful 1-Mala Naam Jap session, work on your urgent duty, or test your retention in the Spaced Repetition queue.
            </div>

            <div className="pt-4 flex justify-between">
              <button
                onClick={() => setStep(3)}
                className="text-xs text-[#716D64] hover:underline px-3 py-2"
              >
                Back
              </button>
              <button
                onClick={handleFinish}
                className="flex items-center gap-2 bg-[#782F3B] hover:bg-[#5E242E] text-white px-6 py-2.5 rounded-xl font-medium text-xs transition-colors shadow-lg ring-1 ring-[#C4A264]"
              >
                <Check className="w-4 h-4" />
                <span>Enter Sanjivani Platform</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
