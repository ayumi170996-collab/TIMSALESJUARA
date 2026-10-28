import React, { useState } from 'react';
import { X, Globe, Sparkles, Plus, Check } from 'lucide-react';
import { Scenario, LanguageOption, CEFRLevel } from '../types';
import { SUPPORTED_LANGUAGES, PRACTICE_SCENARIOS } from '../data/languages';

interface ScenarioPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedLanguage: LanguageOption;
  onSelectLanguage: (lang: LanguageOption) => void;
  selectedLevel: CEFRLevel;
  onSelectLevel: (level: CEFRLevel) => void;
  activeScenario: Scenario;
  onSelectScenario: (scenario: Scenario) => void;
}

export const ScenarioPickerModal: React.FC<ScenarioPickerModalProps> = ({
  isOpen,
  onClose,
  selectedLanguage,
  onSelectLanguage,
  selectedLevel,
  onSelectLevel,
  activeScenario,
  onSelectScenario,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [customTitle, setCustomTitle] = useState('');
  const [customDesc, setCustomDesc] = useState('');
  const [customRole, setCustomRole] = useState('');
  const [showCustomForm, setShowCustomForm] = useState(false);

  if (!isOpen) return null;

  const categories = ['All', 'Dining', 'Travel', 'Social', 'Professional', 'Emergency'];
  const filteredScenarios =
    activeCategory === 'All'
      ? PRACTICE_SCENARIOS
      : PRACTICE_SCENARIOS.filter((s) => s.category === activeCategory);

  const handleCreateCustomScenario = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTitle.trim()) return;

    const newScenario: Scenario = {
      id: `custom-${Date.now()}`,
      title: customTitle.trim(),
      category: 'Social',
      targetLevel: selectedLevel,
      description: customDesc.trim() || 'Custom practice scenario created by learner.',
      partnerRole: customRole.trim() || 'Conversation Partner',
      userRole: 'Language Learner',
      suggestedStarter: `Hola, ¿podemos hablar sobre ${customTitle.trim()}?`,
      keywords: ['custom', 'conversation'],
    };

    onSelectScenario(newScenario);
    setShowCustomForm(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-white">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
              <Globe className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white font-['Outfit']">
                Practice Settings & Scenarios
              </h2>
              <p className="text-xs text-slate-400">
                Choose your target language, difficulty level, and conversation context
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* Target Language Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              1. Target Language
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
              {SUPPORTED_LANGUAGES.map((lang) => {
                const isSelected = selectedLanguage.code === lang.code;
                return (
                  <button
                    key={lang.code}
                    onClick={() => onSelectLanguage(lang)}
                    className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-500/15 text-white ring-1 ring-emerald-500'
                        : 'border-slate-800 bg-slate-950/50 text-slate-300 hover:border-slate-700 hover:bg-slate-800/40'
                    }`}
                  >
                    <div>
                      <div className="text-xl mb-1">{lang.flag}</div>
                      <div className="text-xs font-bold leading-tight">{lang.name}</div>
                      <div className="text-[10px] text-slate-400">{lang.nativeName}</div>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-emerald-400 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* CEFR Level Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              2. Your Proficiency Level (CEFR)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {(['A1', 'A2', 'B1', 'B2', 'C1'] as CEFRLevel[]).map((level) => {
                const isSelected = selectedLevel === level;
                const descriptions: Record<CEFRLevel, string> = {
                  A1: 'Beginner (Simple words, slow)',
                  A2: 'Elementary (Basic everyday talk)',
                  B1: 'Intermediate (Daily life, hobbies)',
                  B2: 'Upper-Inter (Natural flow, idioms)',
                  C1: 'Advanced (Nuance & debate)',
                };
                return (
                  <button
                    key={level}
                    onClick={() => onSelectLevel(level)}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-500/15 text-white ring-1 ring-emerald-500'
                        : 'border-slate-800 bg-slate-950/50 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="font-bold text-sm text-emerald-400">{level}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5 leading-snug">
                      {descriptions[level]}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Scenario Selection */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                3. Choose Conversation Scenario
              </label>

              <button
                onClick={() => setShowCustomForm(!showCustomForm)}
                className="text-xs font-medium text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{showCustomForm ? 'Cancel Custom' : 'Create Custom Scenario'}</span>
              </button>
            </div>

            {/* Custom Scenario Form */}
            {showCustomForm && (
              <form
                onSubmit={handleCreateCustomScenario}
                className="mb-4 p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3"
              >
                <div className="text-xs font-semibold text-slate-200">New Custom Scenario</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    placeholder="Scenario title (e.g. Renting a bike in Amsterdam)"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 outline-none focus:border-emerald-500"
                    required
                  />
                  <input
                    type="text"
                    value={customRole}
                    onChange={(e) => setCustomRole(e.target.value)}
                    placeholder="AI Partner's role (e.g. Bike shop owner)"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 outline-none focus:border-emerald-500"
                  />
                </div>
                <textarea
                  value={customDesc}
                  onChange={(e) => setCustomDesc(e.target.value)}
                  placeholder="Situation context or specific goals you want to practice…"
                  rows={2}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 outline-none focus:border-emerald-500 resize-none"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors"
                >
                  Use Custom Scenario
                </button>
              </form>
            )}

            {/* Category filter segmented tabs */}
            <div className="flex items-center gap-1.5 mb-3 overflow-x-auto pb-1">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                    activeCategory === cat
                      ? 'bg-slate-800 text-white font-semibold border border-slate-700'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Scenarios Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filteredScenarios.map((sc) => {
                const isSelected = activeScenario.id === sc.id;
                return (
                  <div
                    key={sc.id}
                    onClick={() => {
                      onSelectScenario(sc);
                      onClose();
                    }}
                    className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-500/10 text-white shadow-md'
                        : 'border-slate-800 bg-slate-950/40 text-slate-300 hover:border-slate-700 hover:bg-slate-800/30'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                        <span className="text-emerald-400 font-semibold">{sc.category}</span>
                        <span>Level {sc.targetLevel}</span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-100 font-['Outfit']">
                        {sc.title}
                      </h4>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                        {sc.description}
                      </p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                      <span>Partner: <strong className="text-slate-300">{sc.partnerRole}</strong></span>
                      {isSelected ? (
                        <span className="text-emerald-400 font-bold flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" />
                          <span>Active</span>
                        </span>
                      ) : (
                        <span className="text-slate-400 hover:text-white">Select →</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
