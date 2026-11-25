import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, PhoneCall, PhoneOff, Volume2, VolumeX, ShieldCheck, Zap } from 'lucide-react';
import { voiceWs } from '../services/websocket';
import Conversation from './Conversation';

export default function VoiceAgent() {
  const [isConnected, setIsConnected] = useState(false);
  const [isCallActive, setIsCallActive] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [messages, setMessages] = useState([]);
  const [transcriptInterim, setTranscriptInterim] = useState('');
  const [statusText, setStatusText] = useState('Ready to connect');

  const recognitionRef = useRef(null);
  const synthesisRef = useRef(window.speechSynthesis);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setStatusText('Listening to your voice...');
      };

      recognition.onresult = (event) => {
        let interim = '';
        let final = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }

        setTranscriptInterim(interim);

        if (final.trim()) {
          const userText = final.trim();
          setMessages((prev) => [...prev, { role: 'user', content: userText }]);
          setIsThinking(true);
          setStatusText('Nexus is formulating sales response...');

          // Send to backend via WebSocket
          voiceWs.send({ text: userText });
          setTranscriptInterim('');
        }
      };

      recognition.onerror = (event) => {
        console.warn('Speech recognition event:', event.error);
        if (event.error === 'not-allowed') {
          setStatusText('Microphone permission denied');
        }
      };

      recognition.onend = () => {
        setIsListening(false);
        // If call is still active and not speaking, restart listening
        if (isCallActive && !isSpeaking) {
          try {
            recognition.start();
          } catch (e) {
            // Already started or busy
          }
        }
      };

      recognitionRef.current = recognition;
    } else {
      setStatusText('Speech recognition not supported in this browser (Use Chrome/Edge)');
    }

    // Connect WebSocket
    voiceWs.connect();
    const unsubOpen = voiceWs.on('open', () => {
      setIsConnected(true);
      setStatusText('Connected to VoceNexus AI Server');
    });
    const unsubClose = () => setIsConnected(false);
    const unsubMsg = voiceWs.on('message', (data) => {
      setIsThinking(false);
      if (data.response) {
        setMessages((prev) => [...prev, { role: 'assistant', content: data.response }]);
        speakText(data.response);
      }
    });

    return () => {
      unsubOpen();
      unsubClose();
      unsubMsg();
      if (recognitionRef.current) recognitionRef.current.stop();
      if (synthesisRef.current) synthesisRef.current.cancel();
    };
  }, []);

  // Text to Speech
  const speakText = (text) => {
    if (!synthesisRef.current || isMuted) return;

    synthesisRef.current.cancel(); // Stop ongoing speech

    // Pause STT while AI speaks to avoid feedback echo
    if (recognitionRef.current && isListening) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 1.05;
    utterance.pitch = 1.0;

    // Pick best available English voice
    const voices = synthesisRef.current.getVoices();
    const naturalVoice = voices.find(
      (v) => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('David'))
    );
    if (naturalVoice) utterance.voice = naturalVoice;

    utterance.onstart = () => {
      setIsSpeaking(true);
      setStatusText('Nexus speaking...');
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setStatusText('Listening to your voice...');
      // Resume listening
      if (isCallActive && recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch (e) {}
      }
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      if (isCallActive && recognitionRef.current) {
        try { recognitionRef.current.start(); } catch (e) {}
      }
    };

    synthesisRef.current.speak(utterance);
  };

  // Start Call
  const startCall = () => {
    setIsCallActive(true);
    setStatusText('Call in progress...');

    if (!voiceWs.isConnected()) {
      voiceWs.connect();
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch (e) {
        console.warn('Recognition start error:', e);
      }
    }
  };

  // End Call
  const endCall = () => {
    setIsCallActive(false);
    setIsListening(false);
    setIsSpeaking(false);
    setIsThinking(false);
    setStatusText('Call ended');

    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) {}
    }
    if (synthesisRef.current) {
      synthesisRef.current.cancel();
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: '24px', height: 'calc(100vh - 120px)' }}>
      {/* Voice Call Active Interaction Column */}
      <div className="glass-panel" style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '36px 28px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Status Header Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', alignSelf: 'flex-start' }}>
          <span style={{
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            background: isConnected ? 'var(--success)' : '#ef4444',
            boxShadow: isConnected ? '0 0 10px var(--success)' : 'none'
          }}></span>
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500 }}>
            {isConnected ? 'WebSocket Online' : 'Connecting to Server...'}
          </span>
          <span style={{
            marginLeft: 'auto',
            fontSize: '11px',
            background: 'rgba(99, 102, 241, 0.15)',
            color: '#a5b4fc',
            padding: '3px 8px',
            borderRadius: '6px',
            border: '1px solid rgba(99, 102, 241, 0.3)'
          }}>
            Groq LPU (Sub-second)
          </span>
        </div>

        {/* Central Voice Visualizer Orb */}
        <div style={{ position: 'relative', margin: '40px 0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {/* Animated Glow Rings when active */}
          {isCallActive && (
            <>
              <div className="ring-active" style={{
                position: 'absolute',
                width: '210px',
                height: '210px',
                borderRadius: '50%',
                border: '2px solid rgba(99, 102, 241, 0.4)',
                pointerEvents: 'none'
              }}></div>
              <div className="ring-active" style={{
                position: 'absolute',
                width: '260px',
                height: '260px',
                borderRadius: '50%',
                border: '1px solid rgba(6, 182, 212, 0.3)',
                animationDelay: '0.6s',
                pointerEvents: 'none'
              }}></div>
            </>
          )}

          <div
            className={isSpeaking || isListening ? "pulsing-orb" : ""}
            style={{
              width: '160px',
              height: '160px',
              borderRadius: '50%',
              background: isCallActive 
                ? isSpeaking 
                  ? 'radial-gradient(circle, #06b6d4 0%, #0284c7 70%, #0369a1 100%)'
                  : isListening
                    ? 'radial-gradient(circle, #6366f1 0%, #4f46e5 70%, #3730a3 100%)'
                    : 'radial-gradient(circle, #8b5cf6 0%, #6366f1 100%)'
                : 'radial-gradient(circle, #334155 0%, #1e293b 100%)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: isCallActive ? '0 0 50px rgba(99, 102, 241, 0.5)' : 'none',
              transition: 'all 0.5s ease'
            }}
          >
            {isCallActive ? (
              isSpeaking ? <Volume2 size={44} color="#fff" /> : <Mic size={44} color="#fff" />
            ) : (
              <MicOff size={44} color="#94a3b8" />
            )}
            <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.9)', marginTop: '8px', fontWeight: 600, letterSpacing: '0.5px' }}>
              {isCallActive ? (isSpeaking ? 'AI SPEAKING' : isListening ? 'LISTENING' : 'READY') : 'IDLE'}
            </span>
          </div>
        </div>

        {/* Live speech feedback string */}
        <div style={{ textAlign: 'center', minHeight: '60px', width: '100%', padding: '0 20px' }}>
          <p style={{ fontSize: '15px', color: isCallActive ? 'var(--text-primary)' : 'var(--text-muted)', fontWeight: 500 }}>
            {transcriptInterim ? `"${transcriptInterim}"` : statusText}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: '8px', color: 'var(--text-secondary)', fontSize: '12px' }}>
            <Zap size={14} color="#f59e0b" />
            <span>Autonomous Sales Rep • Fortivex Solutions</span>
          </div>
        </div>

        {/* Call Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', width: '100%', justifyContent: 'center' }}>
          {!isCallActive ? (
            <button
              onClick={startCall}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                background: 'linear-gradient(135deg, #10b981, #059669)',
                color: '#fff',
                border: 'none',
                padding: '14px 32px',
                borderRadius: '30px',
                fontSize: '15px',
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: '0 8px 24px rgba(16, 185, 129, 0.4)',
                transition: 'all 0.2s ease'
              }}
            >
              <PhoneCall size={20} />
              Start Voice Call
            </button>
          ) : (
            <>
              <button
                onClick={() => setIsMuted(!isMuted)}
                style={{
                  background: isMuted ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255, 255, 255, 0.08)',
                  border: isMuted ? '1px solid #ef4444' : '1px solid var(--border-color)',
                  color: isMuted ? '#ef4444' : '#fff',
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
                title={isMuted ? "Unmute audio" : "Mute audio"}
              >
                {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
              </button>

              <button
                onClick={endCall}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                  color: '#fff',
                  border: 'none',
                  padding: '14px 28px',
                  borderRadius: '30px',
                  fontSize: '15px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: '0 8px 24px rgba(239, 68, 68, 0.4)',
                  transition: 'all 0.2s ease'
                }}
              >
                <PhoneOff size={20} />
                End Call
              </button>
            </>
          )}
        </div>
      </div>

      {/* Live Transcript Panel Column */}
      <div className="glass-panel" style={{ height: '100%', overflow: 'hidden' }}>
        <Conversation
          messages={messages}
          isListening={isListening}
          isSpeaking={isSpeaking}
          isThinking={isThinking}
        />
      </div>
    </div>
  );
}
