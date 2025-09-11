import React, { useState, useRef, useEffect, useCallback } from 'react';
import Spline from '@splinetool/react-spline';
import './AIAssistant3D.css';

const DEFAULT_SCENE = "https://prod.spline.design/RA9irXEPJfjkGNMV/scene.splinecode";

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
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speakEnergy, setSpeakEnergy] = useState(0);
  const [listening, setListening] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isCompact, setIsCompact] = useState(false);
  const advancedPrefKey = 'ai3d_advanced_open';
  const splineRef = useRef();
  const messagesEndRef = useRef();
  const utteranceRef = useRef(null);
  const lastSpokenHashRef = useRef('');
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

  // Load available voices for TTS and restore settings
  useEffect(() => {
    if (!('speechSynthesis' in window)) return;
    const synth = window.speechSynthesis;
    const load = () => setVoices(synth.getVoices());
    load();
    synth.onvoiceschanged = load;
    // Restore persisted preferences
    try {
      const pref = JSON.parse(localStorage.getItem('ai3d_voice') || '{}');
      if (typeof pref.voiceEnabled === 'boolean') setVoiceEnabled(pref.voiceEnabled);
      if (typeof pref.rate === 'number') setRate(pref.rate);
      if (typeof pref.pitch === 'number') setPitch(pref.pitch);
      if (typeof pref.volume === 'number') setVolume(pref.volume);
      if (typeof pref.selectedVoice === 'string') setSelectedVoice(pref.selectedVoice);
    } catch (_) {}
    return () => {
      synth.onvoiceschanged = null;
    };
  }, []);

  // Persist preferences
  useEffect(() => {
    try {
      localStorage.setItem('ai3d_voice', JSON.stringify({ voiceEnabled, rate, pitch, volume, selectedVoice }));
    } catch (_) {}
  }, [voiceEnabled, rate, pitch, volume, selectedVoice]);

  // Persist advanced toggle
  useEffect(() => {
    try { localStorage.setItem(advancedPrefKey, JSON.stringify(!!showAdvanced)); } catch (_) {}
  }, [showAdvanced]);

  // Responsive: compact toolbar and restore advanced toggle
  useEffect(() => {
    const compute = () => {
      const compact = window.innerWidth < 1100;
      setIsCompact(compact);
    };
    // Restore saved advanced toggle once at mount
    try {
      const saved = JSON.parse(localStorage.getItem(advancedPrefKey) || 'null');
      if (typeof saved === 'boolean') setShowAdvanced(saved);
      else setShowAdvanced(window.innerWidth >= 1100);
    } catch (_) {
      setShowAdvanced(window.innerWidth >= 1100);
    }
    compute();
    window.addEventListener('resize', compute);
    return () => window.removeEventListener('resize', compute);
  }, []);

  // Speak helper
  const speak = useCallback((text) => {
    if (!('speechSynthesis' in window) || !voiceEnabled || !text) return;
    try {
      const synth = window.speechSynthesis;
      // cancel any current speech
      if (synth.speaking) synth.cancel();
      const u = new SpeechSynthesisUtterance(text);
      const v = voices.find(v => v.name === selectedVoice) || voices.find(v => (v.lang || '').toLowerCase().startsWith('en')) || voices[0];
      if (v) u.voice = v;
      u.rate = rate;
      u.pitch = pitch;
      u.volume = volume;
      u.onstart = () => {
        setIsSpeaking(true);
        try { splineRef.current?.emitEvent('mouseDown', 'Speaking'); } catch (_) {}
        // Start energy pulses
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
        try { splineRef.current?.emitEvent('mouseUp', 'Speaking'); } catch (_) {}
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
    };
  }, []);

  // Speech-to-text (push-to-talk)
  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    const rec = new SR();
    rec.lang = (voices.find(v => v.name === selectedVoice)?.lang) || 'en-US';
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

  const toggleListening = () => {
    const rec = recognitionRef.current;
    if (!rec) {
      setListening(v => !v);
      return;
    }
    try {
      if (!listening) {
        setListening(true);
        rec.start();
      } else {
        rec.stop();
        setListening(false);
      }
    } catch (_) {
      // starting while already started throws; ensure state resets
      setListening(false);
    }
  };

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

      {/* Dynamic top toolbar */}
      <div className={`ai-toolbar ${isCompact ? 'compact' : ''} ${showAdvanced ? 'expanded' : ''}`}>
        <div className="toolbar-left">
          <button
            type="button"
            className={`voice-toggle ${voiceEnabled ? 'on' : 'off'}`}
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
            <span className="ctl-label">Voice</span>
          </button>
          <button
            type="button"
            className={`mic-toggle ${listening ? 'listening' : ''}`}
            title={listening ? 'Listening… click to stop' : 'Push-to-talk'}
            aria-pressed={listening}
            onClick={toggleListening}
          ><span className="icon">🎤</span><span className="ctl-label">Mic</span></button>
        </div>
        <div className="toolbar-center">
          {voiceEnabled && (
            <div className="voice-select-wrap" title="Choose a voice">
              <span className="ctl-label">Voice</span>
              <select
                className="voice-select"
                value={selectedVoice}
                onChange={e => setSelectedVoice(e.target.value)}
                aria-label="Voice selection"
              >
                <option value="">Auto</option>
                {voices.map(v => (
                  <option key={`${v.name}-${v.lang}`} value={v.name}>{v.name} ({v.lang})</option>
                ))}
              </select>
            </div>
          )}
        </div>
        <div className="toolbar-right">
          {voiceEnabled && (
            <>
              {showAdvanced && (
                <div className="voice-sliders">
                  <label title="Rate"><span className="ctl-caption">Rate</span><input type="range" min="0.6" max="1.4" step="0.05" value={rate} onChange={e => setRate(Number(e.target.value))} /></label>
                  <label title="Pitch"><span className="ctl-caption">Pitch</span><input type="range" min="0.5" max="2" step="0.05" value={pitch} onChange={e => setPitch(Number(e.target.value))} /></label>
                  <label title="Volume"><span className="ctl-caption">Volume</span><input type="range" min="0" max="1" step="0.05" value={volume} onChange={e => setVolume(Number(e.target.value))} /></label>
                </div>
              )}
              <button
                type="button"
                className={`advanced-toggle ${showAdvanced ? 'open' : ''}`}
                title={showAdvanced ? 'Hide advanced controls' : 'Show advanced controls'}
                onClick={() => setShowAdvanced(s => !s)}
                aria-expanded={showAdvanced}
              >⚙ <span className="ctl-label">{showAdvanced ? 'Hide' : (isCompact ? 'More' : 'Advanced')}</span></button>
            </>
          )}
        </div>
      </div>

      <div className="ai-content">
        {/* Always show the 3D scene while embedded */}
        <div className="spline-container">
          <Spline
            scene={scene}
            onLoad={(spline) => {
              splineRef.current = spline;
              // Try to disable camera controls if available
              try {
                spline?.setZoom && spline.setZoom(0); // no-op safeguard
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

        {/* Input stays fixed at the bottom of the overlay */}
        <form onSubmit={handleSendMessage} className="input-form">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type your message here..."
            disabled={false}
          />
          <button type="submit" disabled={false}>
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default AIAssistant3D;

