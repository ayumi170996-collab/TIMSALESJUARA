import React, { useState } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  Square,
  Sparkles,
  Settings2,
  RefreshCw,
  Play,
  RotateCcw,
} from 'lucide-react';
import { VoiceVisualizer } from './VoiceVisualizer';
import { Scenario, PrebuiltVoice, LanguageOption } from '../types';
import { VOICE_DESCRIPTIONS } from '../data/languages';
import { playWavClip } from '../utils/audio';

interface VoiceStageProps {
  scenario: Scenario;
  selectedLanguage: LanguageOption;
  selectedVoice: PrebuiltVoice;
  onSelectVoice: (voice: PrebuiltVoice) => void;
  connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'error';
  isMicMuted: boolean;
  onToggleMute: () => void;
  isAiSpeaking: boolean;
  isUserSpeaking: boolean;
  aiVolume: number;
  userVolume: number;
  onConnect: () => void;
  onDisconnect: () => void;
  onInterrupt: () => void;
  onClearSession: () => void;
  onOpenScenarioModal: () => void;
}

export const VoiceStage: React.FC<VoiceStageProps> = ({
  scenario,
  selectedLanguage,
  selectedVoice,
  onSelectVoice,
  connectionStatus,
  isMicMuted,
  onToggleMute,
  isAiSpeaking,
  isUserSpeaking,
  aiVolume,
  userVolume,
  onConnect,
  onDisconnect,
  onInterrupt,
  onClearSession,
  onOpenScenarioModal,
}) => {
  const [isPlayingSample, setIsPlayingSample] = useState(false);
  const [showVoiceSettings, setShowVoiceSettings] = useState(false);

  const isConnected = connectionStatus === 'connected';
  const isConnecting = connectionStatus === 'connecting';

  // Preview voice sample using server TTS
  const handleTestVoice = async (voice: PrebuiltVoice) => {
    try {
      setIsPlayingSample(true);
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: selectedLanguage.greetingSample,
          voiceName: voice,
        }),
      });
      const data = await res.json();
      if (data.audio) {
        const audio = playWavClip(data.audio);
        audio.onended = () => setIsPlayingSample(false);
      } else {
        setIsPlayingSample(false);
      }
    } catch (e) {
      console.warn('Voice preview error:', e);
      setIsPlayingSample(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl text-white">
      {/* Scenario Hero Header with authentic atmospheric backdrop */}
      <div className="relative h-44 sm:h-52 overflow-hidden bg-slate-950">
        {scenario.image ? (
          <img
            src={scenario.image}
            alt={scenario.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover opacity-45 brightness-90"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 opacity-80" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent" />

        <div className="absolute inset-0 p-5 sm:p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <span className="font-semibold text-emerald-400">{scenario.category}</span>
              <span aria-hidden="true">·</span>
              <span>Target Level {scenario.targetLevel}</span>
              <span aria-hidden="true">·</span>
              <span>{selectedLanguage.name}</span>
            </div>

            <button
              onClick={onOpenScenarioModal}
              className="px-3 py-1 text-xs font-medium text-slate-200 bg-slate-950/70 hover:bg-slate-800 border border-slate-700 rounded-lg backdrop-blur-sm transition-colors whitespace-nowrap"
            >
              Change Scenario
            </button>
          </div>

          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight font-['Outfit']">
              {scenario.title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl line-clamp-2">
              {scenario.description}
            </p>
            <div className="flex items-center gap-4 text-xs text-slate-400 mt-2">
              <span>Partner: <strong className="text-slate-200">{scenario.partnerRole}</strong></span>
              <span aria-hidden="true">·</span>
              <span>You: <strong className="text-slate-200">{scenario.userRole}</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Interactive Audio Centerpiece */}
      <div className="p-5 sm:p-6 bg-slate-900 border-t border-slate-800">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center mb-6">
          {/* AI Partner Visualizer & Status */}
          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div
                className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${
                  isAiSpeaking
                    ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20 ring-4 ring-emerald-500/20'
                    : 'bg-slate-800 text-slate-300 border border-slate-700'
                }`}
              >
                <Volume2 className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-slate-400 font-medium">AI Partner ({selectedVoice})</div>
                <div className="text-sm font-semibold text-white">
                  {isAiSpeaking ? 'Speaking in real-time…' : isConnected ? 'Listening to you' : 'Standby'}
                </div>
              </div>
            </div>

            <div className="w-32">
              <VoiceVisualizer level={aiVolume} isActive={isAiSpeaking} type="model" />
            </div>
          </div>

          {/* User Mic Visualizer & Status */}
          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div
                className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${
                  isMicMuted
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                    : isUserSpeaking
                    ? 'bg-sky-500 text-slate-950 shadow-lg shadow-sky-500/20 ring-4 ring-sky-500/20'
                    : 'bg-slate-800 text-slate-300 border border-slate-700'
                }`}
              >
                {isMicMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </div>
              <div>
                <div className="text-xs text-slate-400 font-medium">Your Voice (16kHz PCM)</div>
                <div className="text-sm font-semibold text-white">
                  {isMicMuted
                    ? 'Microphone Muted'
                    : isUserSpeaking
                    ? 'Transmitting voice…'
                    : isConnected
                    ? 'Ready for your turn'
                    : 'Not connected'}
                </div>
              </div>
            </div>

            <div className="w-32">
              <VoiceVisualizer
                level={userVolume}
                isActive={isUserSpeaking && !isMicMuted}
                type="user"
              />
            </div>
          </div>
        </div>

        {/* Audio Action Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-2">
            {!isConnected ? (
              <button
                onClick={onConnect}
                disabled={isConnecting}
                className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {isConnecting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Connecting to Gemini Live…</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" />
                    <span>Start Live Voice Practice</span>
                  </>
                )}
              </button>
            ) : (
              <>
                <button
                  onClick={onDisconnect}
                  className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-semibold text-xs transition-colors flex items-center gap-1.5"
                >
                  <Square className="w-3.5 h-3.5 fill-current" />
                  <span>Stop Practice</span>
                </button>

                <button
                  onClick={onToggleMute}
                  className={`px-3 py-2 rounded-xl text-xs font-medium border transition-colors flex items-center gap-1.5 ${
                    isMicMuted
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                      : 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'
                  }`}
                  title={isMicMuted ? 'Unmute microphone' : 'Mute microphone'}
                >
                  {isMicMuted ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                  <span>{isMicMuted ? 'Unmute Mic' : 'Mute Mic'}</span>
                </button>

                {isAiSpeaking && (
                  <button
                    onClick={onInterrupt}
                    className="px-3 py-2 rounded-xl text-xs font-medium bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 transition-colors flex items-center gap-1.5"
                    title="Interrupt AI speaking and take the floor"
                  >
                    <Square className="w-3.5 h-3.5" />
                    <span>Interrupt AI</span>
                  </button>
                )}
              </>
            )}

            <button
              onClick={onClearSession}
              className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-xl transition-colors"
              title="Reset conversation"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowVoiceSettings(!showVoiceSettings)}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-colors flex items-center gap-1.5"
            >
              <Settings2 className="w-3.5 h-3.5" />
              <span>Voice: {selectedVoice}</span>
            </button>
          </div>
        </div>

        {/* Voice Persona Dropdown Drawer */}
        {showVoiceSettings && (
          <div className="mt-4 p-4 rounded-xl bg-slate-950/70 border border-slate-800 text-xs">
            <div className="text-slate-300 font-semibold mb-2 flex items-center justify-between">
              <span>Gemini Prebuilt Voices</span>
              <span className="text-slate-500 font-normal">Select persona tone</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {(['Zephyr', 'Puck', 'Charon', 'Kore', 'Fenrir'] as PrebuiltVoice[]).map((voice) => {
                const info = VOICE_DESCRIPTIONS[voice];
                const isSelected = selectedVoice === voice;
                return (
                  <div
                    key={voice}
                    onClick={() => onSelectVoice(voice)}
                    className={`p-2.5 rounded-lg border cursor-pointer transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-500/10 text-white'
                        : 'border-slate-800 bg-slate-900/60 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-slate-100">{voice}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTestVoice(voice);
                        }}
                        disabled={isPlayingSample}
                        className="px-2 py-0.5 text-[10px] rounded bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 flex items-center gap-1"
                        title="Preview voice pronunciation"
                      >
                        <Volume2 className="w-3 h-3" />
                        <span>Preview</span>
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-400">{info.tone}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
