import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import Spline from '@splinetool/react-spline';
import './AIAssistant3D.css';
import { useSpeech } from '../hooks/useSpeech';
import CinematicSelect from './CinematicSelect.jsx';
import { isAzureConfigured, listAzureVoices, synthesizeAzureTTS } from '../services/tts/azureTTS';

const DEFAULT_SCENE = "https://prod.spline.design/gQap7B6fEt3ajKsf/scene.splinecode";

// Spline trigger config: the Spline scene must contain an object/trigger named exactly this.
// We will emit keyDown/keyUp on it to start/stop the talking animation.
const TALK_TRIGGER_OBJECT = 'AI Assistant Trigger';
const TALK_TRIGGER_DOWN = 'keyDown';
const TALK_TRIGGER_UP = 'keyUp';

// Helper: robustly emit Spline events in both typed and custom-named forms
function emitSplineEvent(spline, eventOrType, objectName) {
  if (!spline) return false;
  let ok = false;
  try {
    // Preferred: typed event to a named object
    if (objectName) {
      spline.emitEvent(eventOrType, objectName);
      ok = true;
    }
  } catch (_) {}
  try {
    // Fallback: custom single-argument event name (if scene defined it)
    if (!ok) {
      spline.emitEvent(eventOrType);
      ok = true;
    }
  } catch (_) {}
  return ok;
}

function triggerTalkStart(spline) {
  // Try typed keyDown on the trigger object, then custom-named event
  emitSplineEvent(spline, TALK_TRIGGER_DOWN, TALK_TRIGGER_OBJECT);
  emitSplineEvent(spline, TALK_TRIGGER_OBJECT);
}

function triggerTalkStop(spline) {
  emitSplineEvent(spline, TALK_TRIGGER_UP, TALK_TRIGGER_OBJECT);
}

const AIAssistant3D = ({ messages: externalMessages, isLoading: externalLoading, onSendMessage, showToggle = true, showMessages = false, scene = DEFAULT_SCENE }) => {
  const [is3DMode, setIs3DMode] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [selectedVoice, setSelectedVoice] = useState('');
  const [rate, setRate] = useState(1.0);
  const [pitch, setPitch] = useState(1.0);
  const [volume, setVolume] = useState(1.0);
  const [voices, setVoices] = useState([]);
  const [azureVoices, setAzureVoices] = useState([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speakEnergy, setSpeakEnergy] = useState(0);
  const [listening, setListening] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const advancedPrefKey = 'ai3d_advanced_open';
  const splineRef = useRef();

  // Speech hook integration (microphone + voices)
  const { voices: speechVoices, isListening: speechIsListening, startListening, stopListening, hasRecognition } = useSpeech(
    useCallback((transcript) => {
      setInputText('');
      onSendMessage && onSendMessage(transcript);
    }, [onSendMessage])
  );

  // Mirror hook voices and listening state into local UI state
  useEffect(() => {
    if (Array.isArray(speechVoices) && speechVoices.length > 0) setVoices(speechVoices);
  }, [speechVoices]);
  useEffect(() => { setListening(!!speechIsListening); }, [speechIsListening]);
  const splineLoadedRef = useRef(false);
  const messagesEndRef = useRef();
  const utteranceRef = useRef(null);
  const lastSpokenHashRef = useRef('');
  const prevMsgCountRef = useRef(0);
  const energyTimerRef = useRef(null);
  const recognitionRef = useRef(null);

  // If external messages are passed, sync them (fallback to internal messages otherwise)
  useEffect(() => {
    if (Array.isArray(externalMessages)) {
      setMessages(externalMessages);
    }
  }, [externalMessages]);

  useEffect(() => {
    if (typeof externalLoading === 'boolean') {
      setIsLoading(externalLoading);
    }
  }, [externalLoading]);

  // Restore persisted preferences (voice toggles, sliders, and last selected voice)
  // Note: voice list is loaded via useSpeech; avoid attaching onvoiceschanged here to prevent conflicts.
  useEffect(() => {
    try {
      const pref = JSON.parse(localStorage.getItem('ai3d_voice') || '{}');
      if (typeof pref.voiceEnabled === 'boolean') setVoiceEnabled(pref.voiceEnabled);
      if (typeof pref.rate === 'number') setRate(pref.rate);
      if (typeof pref.pitch === 'number') setPitch(pref.pitch);
      if (typeof pref.volume === 'number') setVolume(pref.volume);
      if (typeof pref.selectedVoice === 'string') setSelectedVoice(pref.selectedVoice);
    } catch (_) {}
  }, []);

  // Persist preferences
  useEffect(() => {
    try {
      localStorage.setItem('ai3d_voice', JSON.stringify({ voiceEnabled, rate, pitch, volume, selectedVoice }));
    } catch (_) {}
  }, [voiceEnabled, rate, pitch, volume, selectedVoice]);

  // Sorted list of all available voices (grouped by language then name)
  const sortedVoices = useMemo(() => {
    const list = Array.isArray(voices) ? [...voices] : [];
    list.sort((a, b) => (a.lang || '').localeCompare(b.lang || '') || (a.name || '').localeCompare(b.name || ''));
    return list;
  }, [voices]);

  const azureVoiceOptions = useMemo(() => {
    return (azureVoices || []).map(v => ({
      // Azure ShortName uniquely identifies a voice for synthesis
      value: `azure:${v.ShortName}`,
      label: `${v.LocalName || v.DisplayName || v.ShortName} (${v.Locale || v.LocaleName || ''}) · Azure`,
      group: `Azure ${v.Locale || ''}`.trim(),
      meta: { provider: 'azure', shortName: v.ShortName },
    }));
  }, [azureVoices]);

  const webSpeechVoiceOptions = useMemo(() => (
    sortedVoices.map(v => ({
      value: `web:${v.name}`,
      label: `${v.name} (${v.lang})${v.default ? ' • default' : ''}`,
      group: v.lang,
      meta: { provider: 'web', name: v.name },
    }))
  ), [sortedVoices]);

  const voiceOptions = useMemo(() => (
    [...webSpeechVoiceOptions, ...azureVoiceOptions]
  ), [webSpeechVoiceOptions, azureVoiceOptions]);


  // Initialize or validate selected voice when voices load/update
  useEffect(() => {
    const list = voices || [];
    if (!list.length) return;
    // Migrate legacy selections (pre-prefixed)
    if (selectedVoice && !selectedVoice.includes(':')) {
      const exists = !!list.find(v => v.name === selectedVoice);
      if (exists) {
        setSelectedVoice(`web:${selectedVoice}`);
        return;
      }
    }
    // If no selection yet, choose an English voice if available, else first.
    if (!selectedVoice) {
      const preferred = list.find(v => (v.lang || '').toLowerCase().startsWith('en')) || list[0];
      setSelectedVoice(preferred ? `web:${preferred.name}` : '');
      return;
    }
    // If the previously selected web voice disappeared (browser update), fallback gracefully.
    if (selectedVoice.startsWith('web:')) {
      const name = selectedVoice.replace(/^web:/, '');
      const stillExists = !!list.find(v => v.name === name);
      if (!stillExists) {
        const preferred = list.find(v => (v.lang || '').toLowerCase().startsWith('en')) || list[0];
        setSelectedVoice(preferred ? `web:${preferred.name}` : '');
      }
    }
  }, [voices, selectedVoice]);

  // Persist advanced toggle
  useEffect(() => {
    try { localStorage.setItem(advancedPrefKey, JSON.stringify(!!showAdvanced)); } catch (_) {}
  }, [showAdvanced]);

  // Restore advanced toggle at mount (use saved value when available)
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(advancedPrefKey) || 'null');
      if (typeof saved === 'boolean') setShowAdvanced(saved);
      else setShowAdvanced(window.innerWidth >= 1100);
    } catch (_) {
      setShowAdvanced(window.innerWidth >= 1100);
    }
  }, []);

  // Proactively load voices when opening settings (helps Chrome/Edge where voices load late)
  useEffect(() => {
    if (!showSettings) return;
    try {
      if ('speechSynthesis' in window) {
        const synth = window.speechSynthesis;
        const listNow = synth.getVoices();
        if (Array.isArray(listNow) && listNow.length > 0) {
          setVoices(listNow);
        } else {
          let tries = 0;
          const iv = setInterval(() => {
            const list = synth.getVoices();
            if (Array.isArray(list) && list.length > 0) {
              setVoices(list);
              clearInterval(iv);
            } else if (++tries > 80) {
              clearInterval(iv);
            }
          }, 125);
          return () => clearInterval(iv);
        }
      }
    } catch (_) {}
  }, [showSettings]);

  // Load Azure voices when settings opened (optional, requires env keys)
  useEffect(() => {
    let aborted = false;
    async function run() {
      try {
        if (!showSettings || !isAzureConfigured()) return;
        const list = await listAzureVoices();
        if (!aborted) setAzureVoices(Array.isArray(list) ? list : []);
      } catch (_) {
        if (!aborted) setAzureVoices([]);
      }
    }
    run();
    return () => { aborted = true; };
  }, [showSettings]);

  // Speak helper
  const speak = useCallback(async (text) => {
    if (!voiceEnabled || !text) return;
    try {
      const isAzure = selectedVoice?.startsWith('azure:');
      if (isAzure) {
        // Azure synth
        const shortName = selectedVoice.replace(/^azure:/, '');
        const playback = await synthesizeAzureTTS(text, shortName, { rate, pitch, volume });
        const audio = new Audio(playback.url);
        audio.volume = playback.volume;
        audio.onplay = () => {
          setIsSpeaking(true);
          try { triggerTalkStart(splineRef.current); } catch (_) {}
          if (energyTimerRef.current) clearInterval(energyTimerRef.current);
          energyTimerRef.current = setInterval(() => {
            const e = 0.25 + Math.random() * 0.55;
            setSpeakEnergy(e);
          }, 140);
        };
        const cleanup = () => {
          setIsSpeaking(false);
          setSpeakEnergy(0);
          if (energyTimerRef.current) clearInterval(energyTimerRef.current);
          try { triggerTalkStop(splineRef.current); } catch (_) {}
          playback.dispose && playback.dispose();
        };
        audio.onended = cleanup;
        audio.onerror = cleanup;
        await audio.play();
        return;
      }

      // Web Speech synth
      if (!('speechSynthesis' in window)) return;
      const synth = window.speechSynthesis;
      if (synth.speaking) synth.cancel();
      const u = new SpeechSynthesisUtterance(text);
      const v = voices.find(v => `web:${v.name}` === selectedVoice) || voices.find(v => (v.lang || '').toLowerCase().startsWith('en')) || voices[0];
      if (v) u.voice = v;
      u.rate = rate;
      u.pitch = pitch;
      u.volume = volume;
      u.onstart = () => {
        setIsSpeaking(true);
        try { triggerTalkStart(splineRef.current); } catch (_) {}
        try { splineRef.current?.emitEvent('keyDown', 'SpeakingPulse'); } catch (_) {}
        if (energyTimerRef.current) clearInterval(energyTimerRef.current);
        energyTimerRef.current = setInterval(() => {
          const e = 0.25 + Math.random() * 0.55;
          setSpeakEnergy(e);
          try { splineRef.current?.emitEvent('keyDown', 'SpeakingPulse'); } catch (_) {}
        }, 140);
      };
      u.onend = () => {
        setIsSpeaking(false);
        setSpeakEnergy(0);
        if (energyTimerRef.current) clearInterval(energyTimerRef.current);
        try { triggerTalkStop(splineRef.current); } catch (_) {}
      };
      utteranceRef.current = u;
      synth.speak(u);
    } catch (_) {}
  }, [voiceEnabled, voices, selectedVoice, rate, pitch, volume]);

  // When the latest bot message changes, speak it
  useEffect(() => {
    if (!voiceEnabled || !messages?.length) return;
    // find last bot message
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i]?.sender === 'bot') {
        const hash = `${i}|${messages[i].text || ''}`;
        if (hash !== lastSpokenHashRef.current) {
          lastSpokenHashRef.current = hash;
          speak(messages[i].text || '');
        }
        break;
      }
    }
  }, [messages, voiceEnabled, voices, rate, pitch, volume, speak]);

  // Stop speaking on unmount
  useEffect(() => {
    return () => {
      try { window.speechSynthesis?.cancel(); } catch (_) {}
      if (energyTimerRef.current) clearInterval(energyTimerRef.current);
      try { recognitionRef.current && recognitionRef.current.stop(); } catch (_) {}
      // Ensure we stop any talking animation if component unmounts
      try { splineRef.current?.emitEvent(TALK_TRIGGER_UP, TALK_TRIGGER_OBJECT); } catch (_) {}
    };
  }, []);

  // Speech-to-text (push-to-talk)
  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    const rec = new SR();
    // If web voice selected, use its language, else default to en-US for Azure
    const webVoice = voices.find(v => `web:${v.name}` === selectedVoice);
    rec.lang = (webVoice?.lang) || 'en-US';
    rec.interimResults = true;
    rec.continuous = false;
    rec.onstart = () => setListening(true);
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    rec.onresult = (e) => {
      let final = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        if (r.isFinal) final += r[0].transcript;
      }
      if (final.trim()) {
        setInputText('');
        onSendMessage && onSendMessage(final.trim());
      }
    };
    recognitionRef.current = rec;
  }, [voices, selectedVoice, onSendMessage]);

  // Detect when a new user message is sent (to force the talk trigger)
  useEffect(() => {
    const count = messages?.length || 0;
    if (count > prevMsgCountRef.current) {
      const last = messages[count - 1];
      if (last && last.sender === 'user') {
        try { triggerTalkStart(splineRef.current); } catch (_) {}
      }
    }
    prevMsgCountRef.current = count;
  }, [messages]);

  const toggleListening = () => {
    try {
      if (!hasRecognition) {
        setListening(v => !v);
        return;
      }
      if (!speechIsListening) {
        startListening();
      } else {
        stopListening();
      }
    } catch (_) {
      setListening(false);
    }
  };

  // Trigger Spline talking animation when the assistant starts/stops responding
  useEffect(() => {
    if (!splineLoadedRef.current) return; // wait until Spline is ready
    try {
      if (isLoading || isSpeaking) {
        triggerTalkStart(splineRef.current);
      } else {
        triggerTalkStop(splineRef.current);
      }
    } catch (_) {}
  }, [isLoading, isSpeaking]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    if (onSendMessage) {
      onSendMessage(inputText);
      setInputText('');
    }
  };

  const toggleMode = () => {
    if (isTransitioning) return;

    setIsTransitioning(true);

    // Animation duration - change this to match your CSS transition
    setTimeout(() => {
      setIs3DMode((prev) => !prev);
      setIsTransitioning(false);
    }, 800); // Should match the CSS transition time
  };

  return (
    <div
      className={`ai-assistant-container ${is3DMode ? 'mode-3d' : 'mode-2d'} ${
        isTransitioning ? 'transitioning' : ''
      } ${isSpeaking ? 'speaking' : ''}`}
      style={{ '--speak-energy': speakEnergy }}
    >
      {showToggle && (
        <div className="ai-toggle-container">
          <button className="mode-toggle-btn" onClick={toggleMode} disabled={isTransitioning}>
            {is3DMode ? 'Switch to 2D' : 'Switch to 3D'}
          </button>
        </div>
      )}

      {/* Brand header */}
      <div className="ai-brand">
        <span className="ai-brand-glow" aria-hidden="true"></span>
        <span className="ai-brand-text">AvesAI</span>
      </div>

      <div className="ai-content">
        {/* Decorative overlays for a cinematic look */}
        <div className="ai-aurora" aria-hidden="true"></div>
        <div className="ai-hud-grid" aria-hidden="true"></div>
        <div className="ai-sparkles" aria-hidden="true">
          {Array.from({ length: 18 }).map((_, i) => (
            <span key={`sp-${i}`} className="sparkle" style={{ left: `${(i * 53) % 100}%`, top: `${(i * 29) % 100}%`, animationDelay: `${i * 0.18}s` }} />
          ))}
        </div>
        {/* Always show the 3D scene while embedded */}
        <div className="spline-container">
          <Spline
            scene={scene}
            onLoad={(spline) => {
              splineRef.current = spline;
              splineLoadedRef.current = true;
              // If AI is already responding at load time, ensure talking starts
              try {
                if (isLoading) triggerTalkStart(splineRef.current);
              } catch (_) {}
            }}
          />

          {/* 3D Mode Message Display (optional) */}
          {showMessages && (
            <div className="messages-3d">
              {messages
                .slice(-5)
                .map((message, index) => (
                  <div key={(message.timestamp || index) + '-3d'} className={`message-3d-bubble ${message.sender === 'user' ? 'from-user' : 'from-bot'} message-3d-${index}`}>
                    {message.text}
                  </div>
                ))}
              {isLoading && (
                <div className="message-3d-bubble from-bot message-3d-loading">
                  <div className="typing-animation">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Optional 2D mode (kept for standalone use of this component) */}
        {!is3DMode && (
          <div className="chat-2d-container">
            <div className="chat-messages">
              {messages.map((message, index) => (
                <div key={index} className={`message ${message.sender}`}>
                  <div className="message-content">{message.text}</div>
                </div>
              ))}
              {isLoading && (
                <div className="message bot">
                  <div className="message-content typing">
                    <span className="typing-dot"></span>
                    <span className="typing-dot"></span>
                    <span className="typing-dot"></span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>
        )}

        {/* Bottom control dock */}
        <form onSubmit={handleSendMessage} className="input-form dock">
          <button
            type="button"
            className={`dock-btn voice-toggle ${voiceEnabled ? 'on' : 'off'}`}
            title={voiceEnabled ? 'Voice output: On' : 'Voice output: Off'}
            aria-label={voiceEnabled ? 'Voice output on' : 'Voice output off'}
            onClick={() => {
              setVoiceEnabled(v => {
                const nv = !v;
                try { if (!nv) window.speechSynthesis?.cancel(); } catch (_) {}
                return nv;
              });
            }}
          >
            <span className="icon">{voiceEnabled ? '🔊' : '🔈'}</span>
            <span className={`eq-bars ${isSpeaking ? 'on' : ''}`} aria-hidden="true"><span></span><span></span><span></span></span>
          </button>

          <button
            type="button"
            className={`dock-btn mic-toggle ${listening ? 'listening' : ''}`}
            title={listening ? 'Listening… click to stop' : 'Push-to-talk'}
            aria-pressed={listening}
            onClick={toggleListening}
            disabled={!hasRecognition}
          >🎤</button>

          <div className="dock-input">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask anything..."
              disabled={false}
            />
          </div>

          <button type="submit" className="dock-btn send" disabled={false} title="Send">▶</button>

          <button
            type="button"
            className={`dock-btn settings ${showSettings ? 'open' : ''}`}
            title="Settings"
            aria-expanded={showSettings}
            onClick={() => setShowSettings(s => !s)}
          >⚙</button>
        </form>

        {showSettings && (
          <div className="settings-popover" role="dialog" aria-label="Voice settings">
            <div className="settings-row">
              <label className="settings-label">Voice</label>
              <div className="voice-select-wrap cinematic" title="Choose a voice" style={{flex:1}}>
                <CinematicSelect
                  options={voiceOptions}
                  value={selectedVoice}
                  onChange={(val) => setSelectedVoice(val)}
                  ariaLabel="Voice selection"
                />
              </div>
            </div>
            <div className="settings-row sliders">
              <label title="Rate"><span className="ctl-caption">Rate</span><input type="range" min="0.6" max="1.4" step="0.05" value={rate} onChange={e => setRate(Number(e.target.value))} /></label>
              <label title="Pitch"><span className="ctl-caption">Pitch</span><input type="range" min="0.5" max="2" step="0.05" value={pitch} onChange={e => setPitch(Number(e.target.value))} /></label>
              <label title="Volume"><span className="ctl-caption">Volume</span><input type="range" min="0" max="1" step="0.05" value={volume} onChange={e => setVolume(Number(e.target.value))} /></label>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIAssistant3D;

