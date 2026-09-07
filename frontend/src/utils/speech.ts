/**
 * Web Speech Text-to-Speech (TTS) Controller for Yojana Dvar (Ticket YD-A11Y-4.1)
 * ==============================================================================
 * Enables seamless audio narration for non-literate and low digital literacy users
 * in both Hindi ('hi-IN') and English ('en-IN').
 */

import { useState, useEffect, useCallback } from 'react';

export interface SpeechOptions {
  id?: string;
  lang?: 'en' | 'hi';
  rate?: number;
  pitch?: number;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: any) => void;
}

let activeUtteranceId: string | null = null;
const activeListeners: Set<(id: string | null) => void> = new Set();

function notifyListeners() {
  activeListeners.forEach((listener) => listener(activeUtteranceId));
}

/**
 * Strips markdown, emojis, HTML tags, and excessive punctuation so that
 * the speech engine reads out pure, natural sentences.
 */
export function sanitizeTextForSpeech(text: string): string {
  if (!text) return '';
  return text
    // Remove HTML tags
    .replace(/<[^>]*>/g, ' ')
    // Remove Markdown formatting like **, *, #, _, ~
    .replace(/[*#_~`\[\]()]/g, ' ')
    // Remove URLs
    .replace(/https?:\/\/\S+/gi, '')
    // Remove common emojis & symbols
    .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '')
    // Standardize Rupee symbol / Rs to spoken format
    .replace(/₹\s*(\d+(?:,\d+)*)/g, ' $1 रुपये ')
    .replace(/Rs\.?\s*(\d+(?:,\d+)*)/gi, ' $1 rupees ')
    // Remove excessive whitespace
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Checks if the browser supports SpeechSynthesis.
 */
export function isSpeechSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
}

/**
 * Finds the optimal voice for the given language.
 */
export function getBestVoice(lang: 'en' | 'hi'): SpeechSynthesisVoice | null {
  if (!isSpeechSupported()) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices || voices.length === 0) return null;

  if (lang === 'hi') {
    // Look for native Hindi voices (hi-IN, hi)
    const hindiVoice = voices.find((v) => 
      v.lang.toLowerCase().startsWith('hi') || 
      v.name.toLowerCase().includes('hindi') || 
      v.name.toLowerCase().includes('lekha')
    );
    if (hindiVoice) return hindiVoice;
  }

  // Look for Indian English or natural English voices
  const indianEng = voices.find((v) => v.lang.toLowerCase() === 'en-in');
  if (indianEng) return indianEng;

  const standardEng = voices.find((v) => v.lang.toLowerCase().startsWith('en'));
  if (standardEng) return standardEng;

  return voices[0] || null;
}

/**
 * Speaks the provided text using Web Speech Synthesis.
 */
export function speakText(text: string, options?: SpeechOptions): void {
  if (!isSpeechSupported()) {
    console.warn('SpeechSynthesis is not supported on this device/browser.');
    options?.onError?.(new Error('SpeechSynthesis not supported'));
    return;
  }

  // Cancel any ongoing speech
  stopSpeech();

  const cleanText = sanitizeTextForSpeech(text);
  if (!cleanText) return;

  const utteranceId = options?.id || 'speech_' + Math.random().toString(36).slice(2, 9);
  activeUtteranceId = utteranceId;
  notifyListeners();

  const utterance = new SpeechSynthesisUtterance(cleanText);
  const lang = options?.lang || 'hi';
  utterance.lang = lang === 'hi' ? 'hi-IN' : 'en-IN';
  utterance.rate = options?.rate ?? (lang === 'hi' ? 0.95 : 1.0); // Slightly slower for clear Hindi articulation
  utterance.pitch = options?.pitch ?? 1.0;

  const voice = getBestVoice(lang);
  if (voice) {
    utterance.voice = voice;
  }

  utterance.onstart = () => {
    activeUtteranceId = utteranceId;
    notifyListeners();
    options?.onStart?.();
  };

  utterance.onend = () => {
    if (activeUtteranceId === utteranceId) {
      activeUtteranceId = null;
      notifyListeners();
    }
    options?.onEnd?.();
  };

  utterance.onerror = (e) => {
    if (activeUtteranceId === utteranceId) {
      activeUtteranceId = null;
      notifyListeners();
    }
    options?.onError?.(e);
  };

  window.speechSynthesis.speak(utterance);
}

/**
 * Stops any active speech synthesis.
 */
export function stopSpeech(): void {
  if (!isSpeechSupported()) return;
  try {
    window.speechSynthesis.cancel();
  } catch (err) {
    console.warn('Error cancelling speech synthesis:', err);
  }
  activeUtteranceId = null;
  notifyListeners();
}

/**
 * React Hook for components to bind to speech state.
 */
export function useSpeech() {
  const [currentId, setCurrentId] = useState<string | null>(activeUtteranceId);
  const supported = isSpeechSupported();

  useEffect(() => {
    const handleVoiceChange = () => {
      // Warm up voice list
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.getVoices();
      }
    };

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.addEventListener?.('voiceschanged', handleVoiceChange);
      handleVoiceChange();
    }

    const listener = (id: string | null) => {
      setCurrentId(id);
    };
    activeListeners.add(listener);

    return () => {
      activeListeners.delete(listener);
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.removeEventListener?.('voiceschanged', handleVoiceChange);
      }
    };
  }, []);

  const speak = useCallback((text: string, options?: SpeechOptions) => {
    speakText(text, options);
  }, []);

  const stop = useCallback(() => {
    stopSpeech();
  }, []);

  const isSpeaking = useCallback((id?: string) => {
    if (!id) return currentId !== null;
    return currentId === id;
  }, [currentId]);

  return {
    supported,
    currentId,
    isSpeaking,
    speak,
    stop
  };
}
