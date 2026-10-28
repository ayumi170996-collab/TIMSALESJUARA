import React, { useState } from 'react';
import {
  X,
  BookOpen,
  Volume2,
  Trash2,
  CheckCircle2,
  RotateCw,
  Download,
  Plus,
} from 'lucide-react';
import { VocabularyItem } from '../types';
import { playWavClip } from '../utils/audio';

interface FlashcardsModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: VocabularyItem[];
  onRemoveItem: (id: string) => void;
  onToggleMastered: (id: string) => void;
  onAddManualItem: (item: Omit<VocabularyItem, 'id' | 'addedAt'>) => void;
  targetLanguage: string;
}

export const FlashcardsModal: React.FC<FlashcardsModalProps> = ({
  isOpen,
  onClose,
  items,
  onRemoveItem,
  onToggleMastered,
  onAddManualItem,
  targetLanguage,
}) => {
  const [activeTab, setActiveTab] = useState<'list' | 'quiz'>('list');
  const [quizIndex, setQuizIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [newWord, setNewWord] = useState('');
  const [newTrans, setNewTrans] = useState('');
  const [newNote, setNewNote] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [playingWord, setPlayingWord] = useState<string | null>(null);

  if (!isOpen) return null;

  const handlePlayWord = async (text: string) => {
    try {
      setPlayingWord(text);
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, voiceName: 'Zephyr' }),
      });
      const data = await res.json();
      if (data.audio) {
        const audio = playWavClip(data.audio);
        audio.onended = () => setPlayingWord(null);
      } else {
        setPlayingWord(null);
      }
    } catch (e) {
      console.warn('TTS error:', e);
      setPlayingWord(null);
    }
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWord.trim() || !newTrans.trim()) return;
    onAddManualItem({
      word: newWord.trim(),
      translation: newTrans.trim(),
      note: newNote.trim(),
      targetLanguage,
    });
    setNewWord('');
    setNewTrans('');
    setNewNote('');
    setShowAddForm(false);
  };

  const exportCSV = () => {
    const rows = [
      ['Word', 'Translation', 'Notes', 'Language', 'Mastered'],
      ...items.map((i) => [
        `"${i.word.replace(/"/g, '""')}"`,
        `"${i.translation.replace(/"/g, '""')}"`,
        `"${(i.note || '').replace(/"/g, '""')}"`,
        i.targetLanguage,
        i.mastered ? 'Yes' : 'No',
      ]),
    ];
    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `lingualive_vocab_${targetLanguage.toLowerCase()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const currentQuizCard = items[quizIndex];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-white">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white font-['Outfit']">
                Vocabulary Deck ({items.length} cards)
              </h2>
              <p className="text-xs text-slate-400">
                Saved terms & phrases from your conversation sessions in {targetLanguage}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {items.length > 0 && (
              <button
                onClick={exportCSV}
                className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                title="Export CSV"
              >
                <Download className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* View Switcher: List vs Flashcard Quiz */}
        <div className="px-5 py-2.5 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-1.5 p-1 bg-slate-900 rounded-lg border border-slate-800">
            <button
              onClick={() => setActiveTab('list')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                activeTab === 'list'
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Word List
            </button>
            <button
              onClick={() => {
                setActiveTab('quiz');
                setIsFlipped(false);
                setQuizIndex(0);
              }}
              disabled={items.length === 0}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors disabled:opacity-40 ${
                activeTab === 'quiz'
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Practice Cards
            </button>
          </div>

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="text-xs font-medium text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Word</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Add Word Form */}
          {showAddForm && (
            <form
              onSubmit={handleAddSubmit}
              className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3"
            >
              <div className="text-xs font-semibold text-slate-200">Add New Word / Phrase</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  value={newWord}
                  onChange={(e) => setNewWord(e.target.value)}
                  placeholder={`Word in ${targetLanguage}`}
                  className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-emerald-500"
                  required
                />
                <input
                  type="text"
                  value={newTrans}
                  onChange={(e) => setNewTrans(e.target.value)}
                  placeholder="English translation"
                  className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-emerald-500"
                  required
                />
              </div>
              <input
                type="text"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Grammar note or example sentence (optional)"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-emerald-500"
              />
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs"
              >
                Save Card
              </button>
            </form>
          )}

          {items.length === 0 ? (
            <div className="py-16 text-center text-slate-500 text-xs">
              <BookOpen className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <p className="text-sm font-semibold text-slate-300">Your deck is currently empty</p>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                During conversation practice, click the bookmark icon on any suggested word or message to save it here for spaced review!
              </p>
            </div>
          ) : activeTab === 'list' ? (
            <div className="space-y-2">
              {items.map((item) => (
                <div
                  key={item.id}
                  className={`p-3.5 rounded-xl border flex items-center justify-between transition-all ${
                    item.mastered
                      ? 'bg-slate-950/40 border-slate-800/80 opacity-70'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex-1 pr-3">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-100 text-sm">{item.word}</span>
                      <button
                        onClick={() => handlePlayWord(item.word)}
                        className="text-slate-400 hover:text-emerald-400 transition-colors p-1"
                        title="Listen to pronunciation"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="text-xs text-emerald-400 font-medium">{item.translation}</div>
                    {item.note && <div className="text-[11px] text-slate-400 mt-0.5">{item.note}</div>}
                    {item.exampleSentence && (
                      <div className="text-[11px] text-slate-500 italic mt-1 border-l-2 border-slate-700 pl-2">
                        "{item.exampleSentence}"
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => onToggleMastered(item.id)}
                      className={`p-1.5 rounded-lg border text-xs transition-colors ${
                        item.mastered
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                      }`}
                      title={item.mastered ? 'Mark unmastered' : 'Mark mastered'}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onRemoveItem(item.id)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                      title="Delete card"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Flashcard Quiz View */
            <div className="max-w-md mx-auto py-4">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2 font-mono">
                <span>
                  Card {quizIndex + 1} of {items.length}
                </span>
                <span>{currentQuizCard.mastered ? 'Status: Mastered' : 'Learning'}</span>
              </div>

              {/* Flip Card */}
              <div
                onClick={() => setIsFlipped(!isFlipped)}
                className="w-full h-64 rounded-2xl bg-gradient-to-b from-slate-800 to-slate-900 border border-slate-700 p-6 flex flex-col justify-between items-center text-center cursor-pointer shadow-xl relative transition-all"
              >
                <div className="text-xs text-slate-400 flex items-center gap-1.5">
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>Click to flip card</span>
                </div>

                {!isFlipped ? (
                  <div className="space-y-3">
                    <div className="text-2xl font-bold text-white font-['Outfit']">
                      {currentQuizCard.word}
                    </div>
                    {currentQuizCard.exampleSentence && (
                      <p className="text-xs text-slate-400 italic max-w-xs">
                        "{currentQuizCard.exampleSentence}"
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="text-xl font-bold text-emerald-400">
                      {currentQuizCard.translation}
                    </div>
                    {currentQuizCard.note && (
                      <p className="text-xs text-slate-300 max-w-xs">{currentQuizCard.note}</p>
                    )}
                  </div>
                )}

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePlayWord(currentQuizCard.word);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 border border-slate-700 flex items-center gap-1.5"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Listen</span>
                </button>
              </div>

              {/* Navigation Controls */}
              <div className="flex items-center justify-between mt-4">
                <button
                  onClick={() => {
                    setQuizIndex((prev) => Math.max(0, prev - 1));
                    setIsFlipped(false);
                  }}
                  disabled={quizIndex === 0}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-xs font-semibold text-slate-300"
                >
                  Previous
                </button>

                <button
                  onClick={() => onToggleMastered(currentQuizCard.id)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 ${
                    currentQuizCard.mastered
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{currentQuizCard.mastered ? 'Mastered' : 'Mark Mastered'}</span>
                </button>

                <button
                  onClick={() => {
                    setQuizIndex((prev) => Math.min(items.length - 1, prev + 1));
                    setIsFlipped(false);
                  }}
                  disabled={quizIndex === items.length - 1}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-xs font-semibold text-slate-300"
                >
                  Next Card
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
