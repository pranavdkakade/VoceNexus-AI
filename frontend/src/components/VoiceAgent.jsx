import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, PhoneCall, PhoneOff, Volume2, VolumeX, ShieldCheck, Zap, Calendar, TrendingUp, Smile, Meh, Frown } from 'lucide-react';
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

  // Real-time Business Intelligence state
  const [leadScore, setLeadScore] = useState(0);
  const [leadStatus, setLeadStatus] = useState('new');
  const [sentiment, setSentiment] = useState('neutral');
  const [bookedAppointment, setBookedAppointment] = useState(null);

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
          setStatusText('Nexus is consulting knowledge base & scoring lead...');

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
          } catch (e) {}
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
      // Update business intelligence indicators
      if (typeof data.lead_score === 'number') {
        setLeadScore(data.lead_score);
      }
      if (data.lead_status) {
        setLeadStatus(data.lead_status);
      }
      if (data.sentiment) {
        setSentiment(data.sentiment);
      }
      if (data.appointment) {
        setBookedAppointment(data.appointment);
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

  // Color helper for lead status
  const getStatusColor = () => {
    if (leadStatus === 'qualified') return '#10b981';
    if (leadStatus === 'warm') return '#f59e0b';
    return '#64748b';
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: '24px', height: 'calc(100vh - 120px)' }}>
      {/* Voice Call Active Interaction Column */}
      <div className="glass-panel" style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '30px 24px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Status Header Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              background: isConnected ? 'var(--success)' : '#ef4444',
              boxShadow: isConnected ? '0 0 10px var(--success)' : 'none'
            }}></span>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500 }}>
              {isConnected ? 'Voice Stream Online' : 'Connecting...'}
            </span>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <span style={{
              fontSize: '11px',
              background: 'rgba(99, 102, 241, 0.15)',
              color: '#a5b4fc',
              padding: '3px 8px',
              borderRadius: '6px',
              border: '1px solid rgba(99, 102, 241, 0.3)'
            }}>
              Groq LPU (Sub-second)
            </span>
            <span style={{
              fontSize: '11px',
              background: 'rgba(6, 182, 212, 0.15)',
              color: '#67e8f9',
              padding: '3px 8px',
              borderRadius: '6px',
              border: '1px solid rgba(6, 182, 212, 0.3)'
            }}>
              FAISS RAG Active
            </span>
          </div>
        </div>

        {/* Real-time Business Intelligence Bar */}
        <div style={{
          width: '100%',
          background: 'rgba(0, 0, 0, 0.25)',
          borderRadius: '12px',
          padding: '12px 16px',
          margin: '16px 0 0 0',
          border: '1px solid var(--border-color)',
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '8px',
          textAlign: 'center'
        }}>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
              <TrendingUp size={12} /> Lead Score
            </div>
            <div style={{ fontSize: '15px', fontWeight: 700, color: getStatusColor(), marginTop: '2px' }}>
              {leadScore}/100 <span style={{ fontSize: '11px', textTransform: 'uppercase' }}>({leadStatus})</span>
            </div>
          </div>

          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
              {sentiment === 'positive' ? <Smile size={12} color="#10b981" /> : sentiment === 'negative' ? <Frown size={12} color="#ef4444" /> : <Meh size={12} color="#94a3b8" />} Sentiment
            </div>
            <div style={{ fontSize: '14px', fontWeight: 600, color: sentiment === 'positive' ? '#10b981' : sentiment === 'negative' ? '#ef4444' : '#94a3b8', textTransform: 'capitalize', marginTop: '2px' }}>
              {sentiment}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
              <Calendar size={12} /> Demo Status
            </div>
            <div style={{ fontSize: '14px', fontWeight: 600, color: bookedAppointment ? '#10b981' : '#94a3b8', marginTop: '2px' }}>
              {bookedAppointment ? 'Scheduled ✓' : 'Unscheduled'}
            </div>
          </div>
        </div>

        {/* Appointment Notification Card */}
        {bookedAppointment && (
          <div style={{
            width: '100%',
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(6, 182, 212, 0.15))',
            border: '1px solid rgba(16, 185, 129, 0.4)',
            borderRadius: '10px',
            padding: '10px 14px',
            marginTop: '10px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <Calendar size={20} color="#10b981" />
            <div style={{ fontSize: '12.5px', color: '#e2e8f0' }}>
              <strong style={{ color: '#34d399' }}>Demo Locked: </strong> {bookedAppointment.slot}
              <span style={{ fontSize: '11px', color: '#94a3b8', marginLeft: '6px' }}>({bookedAppointment.id})</span>
            </div>
          </div>
        )}

        {/* Central Voice Visualizer Orb */}
        <div style={{ position: 'relative', margin: '20px 0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {isCallActive && (
            <>
              <div className="ring-active" style={{
                position: 'absolute',
                width: '190px',
                height: '190px',
                borderRadius: '50%',
                border: '2px solid rgba(99, 102, 241, 0.4)',
                pointerEvents: 'none'
              }}></div>
              <div className="ring-active" style={{
                position: 'absolute',
                width: '235px',
                height: '235px',
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
              width: '140px',
              height: '140px',
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
              boxShadow: isCallActive ? '0 0 45px rgba(99, 102, 241, 0.5)' : 'none',
              transition: 'all 0.5s ease'
            }}
          >
            {isCallActive ? (
              isSpeaking ? <Volume2 size={38} color="#fff" /> : <Mic size={38} color="#fff" />
            ) : (
              <MicOff size={38} color="#94a3b8" />
            )}
            <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.9)', marginTop: '6px', fontWeight: 600, letterSpacing: '0.5px' }}>
              {isCallActive ? (isSpeaking ? 'AI SPEAKING' : isListening ? 'LISTENING' : 'READY') : 'IDLE'}
            </span>
          </div>
        </div>

        {/* Live speech feedback string */}
        <div style={{ textAlign: 'center', minHeight: '50px', width: '100%', padding: '0 15px' }}>
          <p style={{ fontSize: '14px', color: isCallActive ? 'var(--text-primary)' : 'var(--text-muted)', fontWeight: 500 }}>
            {transcriptInterim ? `"${transcriptInterim}"` : statusText}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: '6px', color: 'var(--text-secondary)', fontSize: '11.5px' }}>
            <Zap size={13} color="#f59e0b" />
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
                padding: '13px 30px',
                borderRadius: '30px',
                fontSize: '14.5px',
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: '0 8px 24px rgba(16, 185, 129, 0.4)',
                transition: 'all 0.2s ease'
              }}
            >
              <PhoneCall size={19} />
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
                  width: '46px',
                  height: '46px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
                title={isMuted ? "Unmute audio" : "Mute audio"}
              >
                {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
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
                  padding: '13px 26px',
                  borderRadius: '30px',
                  fontSize: '14.5px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: '0 8px 24px rgba(239, 68, 68, 0.4)',
                  transition: 'all 0.2s ease'
                }}
              >
                <PhoneOff size={19} />
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
