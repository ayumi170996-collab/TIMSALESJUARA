import React from 'react';
import {
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  BookmarkPlus,
  Clock,
  Mic,
  BookOpen,
  Award,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { TurnCorrection, SessionMetrics, VocabularyItem } from '../types';

interface FeedbackPanelProps {
  turnCorrection: TurnCorrection | null;
  isAnalyzing: boolean;
  metrics: SessionMetrics;
  onSaveVocabulary: (item: Omit<VocabularyItem, 'id' | 'addedAt'>) => void;
  onOpenDebriefModal: () => void;
  targetLanguage: string;
}

export const FeedbackPanel: React.FC<FeedbackPanelProps> = ({
  turnCorrection,
  isAnalyzing,
  metrics,
  onSaveVocabulary,
  onOpenDebriefModal,
  targetLanguage,
}) => {
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-4">
      {/* Real-time Language Coach Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg text-white">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <h3 className="text-sm font-semibold text-slate-100">Live AI Language Coach</h3>
          </div>

          <div className="text-xs text-slate-400">
            {isAnalyzing ? (
              <span className="text-emerald-400 animate-pulse font-medium">Analyzing speech…</span>
            ) : turnCorrection ? (
              <span>CEFR {turnCorrection.detectedLevel || 'B1'}</span>
            ) : (
              <span>Listening</span>
            )}
          </div>
        </div>

        {turnCorrection ? (
          <div className="space-y-4">
            {/* Phrasing evaluation */}
            <div
              className={`p-3.5 rounded-xl border ${
                turnCorrection.isCorrect
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-100'
                  : 'bg-amber-500/10 border-amber-500/30 text-amber-100'
              }`}
            >
              <div className="flex items-start gap-2.5">
                {turnCorrection.isCorrect ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                )}
                <div className="text-xs">
                  <div className="font-semibold text-slate-100 mb-0.5">
                    {turnCorrection.isCorrect ? 'Natural & Accurate Phrasing' : 'Native Speaker Alternative'}
                  </div>
                  <p className="font-medium text-emerald-300 text-sm mb-1">
                    "{turnCorrection.betterAlternative}"
                  </p>
                  <p className="text-slate-300 leading-relaxed">{turnCorrection.explanation}</p>
                </div>
              </div>
            </div>

            {/* Extracted Key Vocabulary */}
            {turnCorrection.vocabulary && turnCorrection.vocabulary.length > 0 && (
              <div>
                <div className="text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Key Vocabulary in This Turn</span>
                </div>
                <div className="space-y-2">
                  {turnCorrection.vocabulary.map((v, i) => (
                    <div
                      key={i}
                      className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/70 flex items-center justify-between text-xs group"
                    >
                      <div>
                        <div className="font-bold text-slate-100">{v.word}</div>
                        <div className="text-slate-400">{v.translation}</div>
                        {v.note && <div className="text-[10px] text-slate-500 mt-0.5">{v.note}</div>}
                      </div>

                      <button
                        onClick={() =>
                          onSaveVocabulary({
                            word: v.word,
                            translation: v.translation,
                            note: v.note,
                            targetLanguage,
                          })
                        }
                        className="px-2.5 py-1 rounded-lg bg-slate-700 hover:bg-emerald-500 hover:text-slate-950 text-slate-200 text-[11px] font-medium transition-colors flex items-center gap-1 shrink-0"
                        title="Add to study deck"
                      >
                        <BookmarkPlus className="w-3 h-3" />
                        <span>Save</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="py-8 text-center text-slate-500 text-xs">
            <Lightbulb className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="font-medium text-slate-400">Speak or write to receive real-time feedback</p>
            <p className="text-slate-500 mt-1 max-w-xs mx-auto">
              Your AI coach will check grammar, suggest native phrasing, and extract vocabulary after every turn.
            </p>
          </div>
        )}
      </div>

      {/* Practice Metrics & End Session Debrief Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg text-white">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-semibold text-slate-100">Live Session Stats</h3>
          </div>
          <span className="text-xs text-slate-400 font-mono tabular-nums">
            {formatTime(metrics.durationSeconds)}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
            <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
              Words Spoken
            </div>
            <div className="text-xl font-bold text-slate-100 mt-1 font-mono tabular-nums">
              {metrics.userWordsSpoken}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">by you</div>
          </div>

          <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
            <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
              Dialogue Turns
            </div>
            <div className="text-xl font-bold text-slate-100 mt-1 font-mono tabular-nums">
              {metrics.userTurns}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">{metrics.modelTurns} from partner</div>
          </div>
        </div>

        <button
          onClick={onOpenDebriefModal}
          disabled={metrics.userTurns === 0}
          className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 disabled:opacity-40 text-slate-950 font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
        >
          <Award className="w-4 h-4 stroke-[2.5]" />
          <span>Generate Session Assessment</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
