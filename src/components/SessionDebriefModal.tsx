import React, { useState, useEffect } from 'react';
import {
  X,
  Award,
  Sparkles,
  CheckCircle2,
  TrendingUp,
  BookOpen,
  RefreshCw,
  Share2,
} from 'lucide-react';
import { ChatMessage, SessionDebrief, CEFRLevel } from '../types';

interface SessionDebriefModalProps {
  isOpen: boolean;
  onClose: () => void;
  messages: ChatMessage[];
  targetLanguage: string;
  level: CEFRLevel;
  scenarioTitle: string;
}

export const SessionDebriefModal: React.FC<SessionDebriefModalProps> = ({
  isOpen,
  onClose,
  messages,
  targetLanguage,
  level,
  scenarioTitle,
}) => {
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<SessionDebrief | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && !report && !loading) {
      generateReport();
    }
  }, [isOpen]);

  const generateReport = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/session-debrief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationHistory: messages,
          targetLanguage,
          level,
          scenario: scenarioTitle,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to generate debrief');
      }

      const data: SessionDebrief = await res.json();
      setReport(data);
    } catch (e: any) {
      console.error(e);
      setError('Could not generate assessment. Ensure your conversation has at least a few turns.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-white">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
              <Award className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white font-['Outfit']">
                Session Linguistic Assessment
              </h2>
              <p className="text-xs text-slate-400">
                AI evaluation of your conversation in {targetLanguage} ({scenarioTitle})
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center text-center">
              <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin mb-3" />
              <p className="text-sm font-semibold text-slate-200">
                Evaluating dialogue turns & linguistic fluency…
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Gemini is analyzing grammar accuracy, vocabulary complexity, and response naturalness.
              </p>
            </div>
          ) : error ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              <p className="text-rose-400 font-semibold mb-2">{error}</p>
              <button
                onClick={generateReport}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200"
              >
                Try Again
              </button>
            </div>
          ) : report ? (
            <div className="space-y-6">
              {/* Score Badges */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                    Fluency & Pacing
                  </div>
                  <div className="text-3xl font-bold text-emerald-400 mt-1 font-mono">
                    {report.fluencyScore}
                    <span className="text-xs text-slate-500">/100</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                    Grammar Accuracy
                  </div>
                  <div className="text-3xl font-bold text-sky-400 mt-1 font-mono">
                    {report.grammarScore}
                    <span className="text-xs text-slate-500">/100</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                    Vocabulary Range
                  </div>
                  <div className="text-3xl font-bold text-indigo-400 mt-1 font-mono">
                    {report.vocabularyScore}
                    <span className="text-xs text-slate-500">/100</span>
                  </div>
                </div>
              </div>

              {/* Assessment Summary */}
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs leading-relaxed text-slate-200">
                <div className="font-semibold text-emerald-400 mb-1 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Executive Feedback</span>
                </div>
                {report.overallAssessment}
              </div>

              {/* Strengths & Improvements */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800">
                  <div className="text-xs font-semibold text-slate-200 mb-2.5 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Demonstrated Strengths</span>
                  </div>
                  <ul className="space-y-2 text-xs text-slate-300">
                    {report.strengths.map((str, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-emerald-400 mt-0.5">•</span>
                        <span>{str}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800">
                  <div className="text-xs font-semibold text-slate-200 mb-2.5 flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-amber-400" />
                    <span>Areas to Focus Next</span>
                  </div>
                  <ul className="space-y-2 text-xs text-slate-300">
                    {report.improvements.map((imp, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-amber-400 mt-0.5">•</span>
                        <span>{imp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Recommended Vocabulary to Review */}
              {report.keyVocabularyToReview && report.keyVocabularyToReview.length > 0 && (
                <div>
                  <div className="text-xs font-semibold text-slate-200 mb-2 flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-emerald-400" />
                    <span>Recommended Vocabulary from this Session</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {report.keyVocabularyToReview.map((vocab, i) => (
                      <div
                        key={i}
                        className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs"
                      >
                        <div className="font-bold text-slate-100">{vocab.term}</div>
                        <div className="text-emerald-400 text-[11px] font-medium">
                          {vocab.meaning}
                        </div>
                        <div className="text-slate-400 text-[10px] mt-1 italic">
                          "{vocab.usageExample}"
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Assessed according to CEFR standards
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors"
          >
            Close Report
          </button>
        </div>
      </div>
    </div>
  );
};
