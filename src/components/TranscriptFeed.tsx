import React, { useState, useRef, useEffect } from 'react';
import {
  Volume2,
  BookmarkPlus,
  Send,
  Sparkles,
  HelpCircle,
  Copy,
  Check,
  Languages,
} from 'lucide-react';
import { ChatMessage, VocabularyItem, TurnCorrection } from '../types';
import { playWavClip } from '../utils/audio';

interface TranscriptFeedProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  onSaveVocabulary: (item: Omit<VocabularyItem, 'id' | 'addedAt'>) => void;
  targetLanguage: string;
  turnCorrection: TurnCorrection | null;
  isAiSpeaking: boolean;
  isUserSpeaking: boolean;
}

export const TranscriptFeed: React.FC<TranscriptFeedProps> = ({
  messages,
  onSendMessage,
  onSaveVocabulary,
  targetLanguage,
  turnCorrection,
  isAiSpeaking,
  isUserSpeaking,
}) => {
  const [inputText, setInputText] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [playingMsgId, setPlayingMsgId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isAiSpeaking, isUserSpeaking]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText);
    setInputText('');
  };

  const handlePlayAudio = async (text: string, msgId: string) => {
    try {
      setPlayingMsgId(msgId);
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, voiceName: 'Zephyr' }),
      });
      const data = await res.json();
      if (data.audio) {
        const audio = playWavClip(data.audio);
        audio.onended = () => setPlayingMsgId(null);
      } else {
        setPlayingMsgId(null);
      }
    } catch (e) {
      console.warn('TTS playback error:', e);
      setPlayingMsgId(null);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl flex flex-col h-[520px] shadow-lg overflow-hidden">
      {/* Header bar */}
      <div className="px-5 py-3 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Languages className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-semibold text-slate-200">
            Real-Time Conversation Transcript
          </span>
        </div>
        <div className="text-xs text-slate-500">
          Click any message to listen or save vocabulary
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
            <div className="w-12 h-12 rounded-full bg-slate-800/80 flex items-center justify-center mb-3 text-slate-400">
              <Sparkles className="w-6 h-6 text-emerald-400" />
            </div>
            <p className="text-sm font-medium text-slate-300">Start the conversation</p>
            <p className="text-xs text-slate-500 max-w-sm mt-1">
              Speak into your microphone or type a message below in {targetLanguage}. Your AI partner will reply in real-time.
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} group`}
              >
                <div className="text-[11px] text-slate-400 mb-1 px-1 flex items-center gap-2">
                  <span>{isUser ? 'You' : 'AI Partner'}</span>
                  <span>·</span>
                  <span>
                    {new Date(msg.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>

                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed transition-all ${
                    isUser
                      ? 'bg-sky-600/90 text-white rounded-tr-sm'
                      : 'bg-slate-800 text-slate-100 rounded-tl-sm border border-slate-700/60'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>

                  {/* Message Action bar */}
                  <div
                    className={`flex items-center gap-2 mt-2 pt-2 border-t text-xs ${
                      isUser ? 'border-sky-500/50 text-sky-200' : 'border-slate-700 text-slate-400'
                    }`}
                  >
                    <button
                      onClick={() => handlePlayAudio(msg.text, msg.id)}
                      className="hover:text-white flex items-center gap-1 transition-colors"
                      title="Listen with native pronunciation"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>{playingMsgId === msg.id ? 'Playing…' : 'Listen'}</span>
                    </button>

                    <button
                      onClick={() => handleCopy(msg.text, msg.id)}
                      className="hover:text-white flex items-center gap-1 transition-colors"
                      title="Copy text"
                    >
                      {copiedId === msg.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-300" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>

                    {!isUser && (
                      <button
                        onClick={() =>
                          onSaveVocabulary({
                            word: msg.text.slice(0, 40),
                            translation: 'Phrase from conversation',
                            targetLanguage,
                            exampleSentence: msg.text,
                          })
                        }
                        className="hover:text-emerald-300 flex items-center gap-1 transition-colors ml-auto"
                        title="Save to Vocabulary Deck"
                      >
                        <BookmarkPlus className="w-3.5 h-3.5" />
                        <span>Save</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Follow-up Prompts ("Need a hint?") */}
      {turnCorrection?.suggestedNextPhrases && turnCorrection.suggestedNextPhrases.length > 0 && (
        <div className="px-4 py-2 bg-slate-950/80 border-t border-slate-800 text-xs">
          <div className="flex items-center gap-1.5 text-emerald-400 font-semibold mb-1.5">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Need a hint? You could say:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {turnCorrection.suggestedNextPhrases.map((hint, idx) => (
              <button
                key={idx}
                onClick={() => setInputText(hint.phrase)}
                className="text-left px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700/80 text-slate-200 hover:text-white transition-colors"
                title={`Translation: ${hint.translation}`}
              >
                <div className="font-medium text-emerald-300">{hint.phrase}</div>
                <div className="text-[10px] text-slate-400">{hint.translation}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Text message input form (Type or speak fallback) */}
      <form
        onSubmit={handleSubmit}
        className="p-3 bg-slate-950/90 border-t border-slate-800 flex items-center gap-2"
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={`Type a message in ${targetLanguage} or use your voice…`}
          className="flex-1 bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded-xl px-4 py-2 text-sm text-slate-100 placeholder-slate-500 outline-none transition-colors"
        />
        <button
          type="submit"
          disabled={!inputText.trim()}
          className="p-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-slate-950 transition-colors shadow-sm"
          title="Send message"
        >
          <Send className="w-4 h-4 stroke-[2.5]" />
        </button>
      </form>
    </div>
  );
};
