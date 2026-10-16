import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Bell, Music, Disc } from 'lucide-react';
import { audio } from '../services/audioService';

interface AudioPlayerBarProps {
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const AudioPlayerBar: React.FC<AudioPlayerBarProps> = ({ soundEnabled, onToggleSound }) => {
  const [isDronePlaying, setIsDronePlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);

  useEffect(() => {
    audio.setMasterVolume(soundEnabled ? volume : 0);
  }, [volume, soundEnabled]);

  const handleBowlChime = () => {
    if (!soundEnabled) onToggleSound();
    audio.playSingingBowl(3.5);
  };

  const handleToggleDrone = () => {
    if (!soundEnabled) onToggleSound();
    const playing = audio.toggleTanpura(setIsDronePlaying);
    setIsDronePlaying(playing);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value);
    setVolume(v);
  };

  return (
    <div className="flex items-center gap-1 sm:gap-2 bg-[#EDE7DB]/80 dark:bg-[#1E2421]/90 backdrop-blur-sm border border-[#C4A264]/30 rounded-full px-2.5 py-1 text-xs text-[#1F2421] dark:text-[#F1F4F2]">
      {/* Singing Bowl chime button */}
      <button
        onClick={handleBowlChime}
        title="Play Sacred Singing Bowl Chime"
        className="flex items-center gap-1 px-2 py-1 rounded-full hover:bg-[#C4A264]/20 transition-colors text-[#782F3B] dark:text-[#D4B274] font-medium"
      >
        <Bell className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Chime</span>
      </button>

      {/* Tanpura Drone toggle */}
      <button
        onClick={handleToggleDrone}
        title={isDronePlaying ? 'Pause Meditative Drone' : 'Start Meditative Tanpura Drone'}
        className={`flex items-center gap-1 px-2 py-1 rounded-full transition-all ${
          isDronePlaying
            ? 'bg-[#782F3B] text-white shadow-sm ring-1 ring-[#C4A264]'
            : 'hover:bg-[#C4A264]/20 text-[#263E32] dark:text-[#F1F4F2]'
        }`}
      >
        <Disc className={`w-3.5 h-3.5 ${isDronePlaying ? 'animate-spin' : ''}`} />
        <span className="hidden sm:inline">{isDronePlaying ? 'Drone Active' : 'Tanpura'}</span>
      </button>

      {/* Volume toggle & slider */}
      <div className="relative flex items-center">
        <button
          onClick={() => {
            if (showVolumeSlider) setShowVolumeSlider(false);
            else setShowVolumeSlider(true);
          }}
          className="p-1 rounded-full hover:bg-[#C4A264]/20 text-[#716D64] dark:text-[#9FA4A1]"
          title="Sound Volume"
        >
          {soundEnabled && volume > 0 ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
        </button>

        {showVolumeSlider && (
          <div className="absolute right-0 top-8 z-50 bg-white dark:bg-[#1A201D] border border-[#C4A264]/40 shadow-xl rounded-xl p-3 flex flex-col gap-2 min-w-[140px]">
            <div className="flex justify-between items-center text-[11px] font-medium">
              <span>Volume</span>
              <span>{Math.round(volume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={handleVolumeChange}
              className="accent-[#782F3B] dark:accent-[#D4B274] h-1.5 bg-[#EDE7DB] rounded-lg cursor-pointer"
            />
            <button
              onClick={onToggleSound}
              className="text-[10px] text-[#782F3B] dark:text-[#D4B274] hover:underline text-left mt-1"
            >
              {soundEnabled ? 'Mute all sounds' : 'Unmute sounds'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
