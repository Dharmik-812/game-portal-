import { useState, useEffect, useRef, useCallback } from 'react';

export const useSpeech = (onResult) => {
  const [voices, setVoices] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  // Load voices robustly and subscribe to updates (Chromium can delay onvoiceschanged)
  useEffect(() => {
    if (!('speechSynthesis' in window)) return;

    const synth = window.speechSynthesis;
    const loadVoices = () => setVoices(synth.getVoices());

    // Initial attempt
    loadVoices();

    // Poll until voices are available or timeout
    let tries = 0;
    const iv = setInterval(() => {
      const list = synth.getVoices();
      if (Array.isArray(list) && list.length > 0) {
        setVoices(list);
        clearInterval(iv);
      } else if (++tries > 40) { // ~5s max at 125ms
        clearInterval(iv);
      }
    }, 125);

    // Event-based update (prefer event listener to avoid clobbering in StrictMode)
    const handler = () => loadVoices();
    try {
      synth.addEventListener && synth.addEventListener('voiceschanged', handler);
    } catch (_) {
      synth.onvoiceschanged = handler; // fallback
    }

    return () => {
      clearInterval(iv);
      try {
        synth.removeEventListener && synth.removeEventListener('voiceschanged', handler);
      } catch (_) {}
      if ('onvoiceschanged' in synth) synth.onvoiceschanged = null;
    };
  }, []);

  // Initialize speech recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = (event) => {
      console.warn('Speech recognition error', event.error);
      setIsListening(false);
    };

    recognition.onresult = (event) => {
      let transcript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) transcript += event.results[i][0].transcript;
      }
      if (transcript.trim() && onResult) onResult(transcript.trim());
    };

    recognitionRef.current = recognition;
    return () => { try { recognition.stop(); } catch (_) {} };
  }, [onResult]);

  const startListening = useCallback(() => {
    try { recognitionRef.current?.start(); } catch (_) {}
  }, []);

  const stopListening = useCallback(() => {
    try { recognitionRef.current?.stop(); } catch (_) {}
  }, []);

  return {
    voices,
    isListening,
    startListening,
    stopListening,
    hasRecognition: !!recognitionRef.current,
  };
};

