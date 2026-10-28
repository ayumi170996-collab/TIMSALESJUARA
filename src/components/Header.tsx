import React from 'react';
import { Sparkles, MessageSquare, BookOpen, BarChart3, Globe, Mic } from 'lucide-react';
import { LanguageOption, CEFRLevel } from '../types';

interface HeaderProps {
  activeTab: 'practice' | 'scenarios' | 'flashcards' | 'metrics';
  setActiveTab: (tab: 'practice' | 'scenarios' | 'flashcards' | 'metrics') => void;
  selectedLanguage: LanguageOption;
  selectedLevel: CEFRLevel;
  onOpenLanguagePicker: () => void;
  isConnected: boolean;
  onToggleSession: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  selectedLanguage,
  selectedLevel,
  onOpenLanguagePicker,
  isConnected,
  onToggleSession,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-sm">
            <Mic className="w-5 h-5 text-slate-950 stroke-[2.5]" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white font-['Outfit']">
            LinguaLive
          </span>
        </div>

        {/* Zone 2: Navigation Links (Single-line, unboxed, hover states) */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
          <button
            onClick={() => setActiveTab('practice')}
            className={`flex items-center gap-2 whitespace-nowrap transition-colors py-1 ${
              activeTab === 'practice'
                ? 'text-emerald-400 font-semibold border-b-2 border-emerald-400'
                : 'hover:text-white'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Voice Practice</span>
          </button>

          <button
            onClick={() => setActiveTab('scenarios')}
            className={`flex items-center gap-2 whitespace-nowrap transition-colors py-1 ${
              activeTab === 'scenarios'
                ? 'text-emerald-400 font-semibold border-b-2 border-emerald-400'
                : 'hover:text-white'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>Scenarios</span>
          </button>

          <button
            onClick={() => setActiveTab('flashcards')}
            className={`flex items-center gap-2 whitespace-nowrap transition-colors py-1 ${
              activeTab === 'flashcards'
                ? 'text-emerald-400 font-semibold border-b-2 border-emerald-400'
                : 'hover:text-white'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Vocabulary Deck</span>
          </button>

          <button
            onClick={() => setActiveTab('metrics')}
            className={`flex items-center gap-2 whitespace-nowrap transition-colors py-1 ${
              activeTab === 'metrics'
                ? 'text-emerald-400 font-semibold border-b-2 border-emerald-400'
                : 'hover:text-white'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Performance</span>
          </button>
        </nav>

        {/* Zone 3: Language Selector & Primary Session CTA */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onOpenLanguagePicker}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700/80 rounded-lg border border-slate-700 transition-colors whitespace-nowrap"
            title="Change Target Language and Level"
          >
            <span className="text-base leading-none">{selectedLanguage.flag}</span>
            <span className="hidden sm:inline font-semibold">{selectedLanguage.name}</span>
            <span className="text-slate-400">·</span>
            <span className="text-emerald-400 font-bold">{selectedLevel}</span>
          </button>

          <button
            onClick={onToggleSession}
            className={`px-4 py-2 text-xs font-semibold rounded-lg shadow-sm transition-all whitespace-nowrap flex items-center gap-2 ${
              isConnected
                ? 'bg-rose-500 hover:bg-rose-600 text-white'
                : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isConnected ? 'bg-white animate-pulse' : 'bg-slate-950'
              }`}
            />
            <span>{isConnected ? 'End Conversation' : 'Start Live Voice'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
