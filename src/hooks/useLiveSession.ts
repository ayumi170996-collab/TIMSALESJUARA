import { useState, useEffect, useRef, useCallback } from 'react';
import {
  ChatMessage,
  CEFRLevel,
  PrebuiltVoice,
  TurnCorrection,
  SessionMetrics,
} from '../types';
import {
  float32ToInt16Base64,
  calculateRMS,
  LiveAudioPlayer,
} from '../utils/audio';

interface UseLiveSessionProps {
  targetLanguage: string;
  level: CEFRLevel;
  scenarioTitle: string;
  voiceName: PrebuiltVoice;
}

export function useLiveSession({
  targetLanguage,
  level,
  scenarioTitle,
  voiceName,
}: UseLiveSessionProps) {
  const [connectionStatus, setConnectionStatus] = useState<
    'disconnected' | 'connecting' | 'connected' | 'error'
  >('disconnected');
  const [error, setError] = useState<string | null>(null);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [isUserSpeaking, setIsUserSpeaking] = useState(false);
  const [userVolume, setUserVolume] = useState(0);
  const [aiVolume, setAiVolume] = useState(0);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentTurnCorrection, setCurrentTurnCorrection] = useState<TurnCorrection | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [metrics, setMetrics] = useState<SessionMetrics>({
    durationSeconds: 0,
    userTurns: 0,
    modelTurns: 0,
    userWordsSpoken: 0,
    correctionsGiven: 0,
    vocabularyLearned: 0,
  });

  const wsRef = useRef<WebSocket | null>(null);
  const audioPlayerRef = useRef<LiveAudioPlayer | null>(null);
  const inputAudioCtxRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);

  const isMutedRef = useRef(isMicMuted);
  isMutedRef.current = isMicMuted;

  const currentModelTextRef = useRef<string>('');
  const currentUserTextRef = useRef<string>('');
  const lastAnalyzedUserTextRef = useRef<string>('');

  // Timer for session duration
  useEffect(() => {
    let interval: any;
    if (connectionStatus === 'connected') {
      interval = setInterval(() => {
        setMetrics((prev) => ({
          ...prev,
          durationSeconds: prev.durationSeconds + 1,
        }));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [connectionStatus]);

  // Request analysis from backend
  const analyzeTurn = useCallback(
    async (userText: string, partnerText: string) => {
      if (!userText || userText.trim().length < 3) return;
      if (lastAnalyzedUserTextRef.current === userText) return;
      lastAnalyzedUserTextRef.current = userText;

      setIsAnalyzing(true);
      try {
        const res = await fetch('/api/analyze-turn', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userUtterance: userText,
            partnerUtterance: partnerText,
            targetLanguage,
            level,
          }),
        });
        if (res.ok) {
          const data: TurnCorrection = await res.json();
          setCurrentTurnCorrection(data);
          setMetrics((prev) => ({
            ...prev,
            correctionsGiven: prev.correctionsGiven + (data.isCorrect ? 0 : 1),
            vocabularyLearned: prev.vocabularyLearned + (data.vocabulary?.length || 0),
          }));
        }
      } catch (err) {
        console.warn('Turn analysis error:', err);
      } finally {
        setIsAnalyzing(false);
      }
    },
    [targetLanguage, level]
  );

  // Setup user mic capture
  const setupMicStream = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      mediaStreamRef.current = stream;

      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const inputCtx = new AudioContextClass({ sampleRate: 16000 });
      inputAudioCtxRef.current = inputCtx;

      const source = inputCtx.createMediaStreamSource(stream);
      const processor = inputCtx.createScriptProcessor(4096, 1, 1);
      scriptProcessorRef.current = processor;

      source.connect(processor);
      processor.connect(inputCtx.destination);

      processor.onaudioprocess = (e) => {
        if (isMutedRef.current || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
          setUserVolume(0);
          setIsUserSpeaking(false);
          return;
        }

        const inputData = e.inputBuffer.getChannelData(0);
        const rms = calculateRMS(inputData);
        setUserVolume(rms);
        const speaking = rms > 0.08;
        setIsUserSpeaking(speaking);

        const base64 = float32ToInt16Base64(inputData);
        wsRef.current.send(
          JSON.stringify({
            type: 'audio',
            audio: base64,
          })
        );
      };
    } catch (err: any) {
      console.error('Microphone access failed:', err);
      setError(
        'Could not access microphone. Please grant mic permission in your browser.'
      );
    }
  }, []);

  // Connect to Gemini Live API WebSocket
  const connect = useCallback(async () => {
    disconnect();
    setConnectionStatus('connecting');
    setError(null);
    currentModelTextRef.current = '';
    currentUserTextRef.current = '';

    // Initialize audio player
    audioPlayerRef.current = new LiveAudioPlayer((level) => {
      setAiVolume(level);
      setIsAiSpeaking(level > 0.02);
    });

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/live?lang=${encodeURIComponent(
      targetLanguage
    )}&level=${encodeURIComponent(level)}&scenario=${encodeURIComponent(
      scenarioTitle
    )}&voice=${encodeURIComponent(voiceName)}`;

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = async () => {
      console.log('[Live] WebSocket connected');
      setConnectionStatus('connected');
      await setupMicStream();
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === 'ready') {
          console.log('[Live] Session ready:', data.message);
        } else if (data.type === 'audio' && data.audio) {
          audioPlayerRef.current?.enqueueChunk(data.audio);
        } else if (data.type === 'interrupted') {
          console.log('[Live] Model interrupted by user speech');
          audioPlayerRef.current?.interrupt();
          setIsAiSpeaking(false);
        } else if (data.type === 'modelText' && data.text) {
          currentModelTextRef.current += data.text;
          const text = currentModelTextRef.current;

          setMessages((prev) => {
            const last = prev[prev.length - 1];
            if (last && last.role === 'model') {
              return [...prev.slice(0, -1), { ...last, text }];
            } else {
              return [
                ...prev,
                {
                  id: `model-${Date.now()}`,
                  role: 'model',
                  text,
                  timestamp: Date.now(),
                },
              ];
            }
          });
        } else if (data.type === 'userText' && data.text) {
          currentUserTextRef.current += data.text;
          const userStr = currentUserTextRef.current;

          setMessages((prev) => {
            const last = prev[prev.length - 1];
            if (last && last.role === 'user') {
              return [...prev.slice(0, -1), { ...last, text: userStr }];
            } else {
              return [
                ...prev,
                {
                  id: `user-${Date.now()}`,
                  role: 'user',
                  text: userStr,
                  timestamp: Date.now(),
                },
              ];
            }
          });
        } else if (data.type === 'turnComplete') {
          const lastUserText = currentUserTextRef.current;
          const lastModelText = currentModelTextRef.current;

          if (lastUserText) {
            setMetrics((prev) => ({
              ...prev,
              userTurns: prev.userTurns + 1,
              userWordsSpoken: prev.userWordsSpoken + lastUserText.trim().split(/\s+/).length,
            }));
            analyzeTurn(lastUserText, lastModelText);
          }
          if (lastModelText) {
            setMetrics((prev) => ({
              ...prev,
              modelTurns: prev.modelTurns + 1,
            }));
          }

          currentUserTextRef.current = '';
          currentModelTextRef.current = '';
        } else if (data.type === 'error') {
          setError(data.message || 'Error occurred in live session');
        }
      } catch (e) {
        console.error('[Live] Message parsing error:', e);
      }
    };

    ws.onerror = (err) => {
      console.error('[Live] WebSocket error:', err);
      setError('Connection to live voice service failed.');
      setConnectionStatus('error');
    };

    ws.onclose = () => {
      console.log('[Live] WebSocket closed');
      if (connectionStatus === 'connected') {
        setConnectionStatus('disconnected');
      }
    };
  }, [targetLanguage, level, scenarioTitle, voiceName, setupMicStream, analyzeTurn]);

  // Clean disconnect
  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    if (scriptProcessorRef.current) {
      scriptProcessorRef.current.disconnect();
      scriptProcessorRef.current = null;
    }

    if (inputAudioCtxRef.current && inputAudioCtxRef.current.state !== 'closed') {
      inputAudioCtxRef.current.close();
      inputAudioCtxRef.current = null;
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }

    if (audioPlayerRef.current) {
      audioPlayerRef.current.stop();
      audioPlayerRef.current = null;
    }

    setConnectionStatus('disconnected');
    setIsAiSpeaking(false);
    setIsUserSpeaking(false);
    setUserVolume(0);
    setAiVolume(0);
  }, []);

  // Send textual message directly to session (or fallback mode)
  const sendTextMessage = useCallback(
    async (text: string) => {
      if (!text.trim()) return;

      const newUserMsg: ChatMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        text: text.trim(),
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, newUserMsg]);
      setMetrics((prev) => ({
        ...prev,
        userTurns: prev.userTurns + 1,
        userWordsSpoken: prev.userWordsSpoken + text.trim().split(/\s+/).length,
      }));

      // If WS is connected, send real-time text input
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            type: 'text',
            text: text.trim(),
          })
        );
      } else {
        // Fallback HTTP text chat endpoint
        try {
          const res = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              messages: [...messages, newUserMsg],
              targetLanguage,
              level,
              scenario: scenarioTitle,
            }),
          });
          const data = await res.json();
          if (data.reply) {
            const newModelMsg: ChatMessage = {
              id: `model-${Date.now()}`,
              role: 'model',
              text: data.reply,
              timestamp: Date.now(),
            };
            setMessages((prev) => [...prev, newModelMsg]);
            setMetrics((prev) => ({ ...prev, modelTurns: prev.modelTurns + 1 }));
            analyzeTurn(text.trim(), data.reply);
          }
        } catch (err: any) {
          console.error('Chat error:', err);
          setError('Failed to send text message.');
        }
      }
    },
    [messages, targetLanguage, level, scenarioTitle, analyzeTurn]
  );

  // Toggle mic mute
  const toggleMute = useCallback(() => {
    setIsMicMuted((prev) => !prev);
  }, []);

  // Interrupt AI playback immediately
  const interruptAi = useCallback(() => {
    audioPlayerRef.current?.interrupt();
    setIsAiSpeaking(false);
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'interrupt' }));
    }
  }, []);

  // Reset conversation
  const clearSession = useCallback(() => {
    setMessages([]);
    setCurrentTurnCorrection(null);
    setMetrics({
      durationSeconds: 0,
      userTurns: 0,
      modelTurns: 0,
      userWordsSpoken: 0,
      correctionsGiven: 0,
      vocabularyLearned: 0,
    });
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    connectionStatus,
    error,
    isMicMuted,
    isAiSpeaking,
    isUserSpeaking,
    userVolume,
    aiVolume,
    messages,
    currentTurnCorrection,
    isAnalyzing,
    metrics,
    connect,
    disconnect,
    sendTextMessage,
    toggleMute,
    interruptAi,
    clearSession,
    analyzeTurn,
  };
}
