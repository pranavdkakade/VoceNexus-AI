import React, { useState, useEffect, useRef } from 'react';
import { User, Bot, Sparkles, Send } from 'lucide-react';

export default function Conversation({ messages, isListening, isSpeaking, isThinking, onSendMessage }) {
  const [inputText, setInputText] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputText.trim() && onSendMessage) {
      onSendMessage(inputText.trim());
      setInputText('');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Top Header */}
      <div style={{
        padding: '16px 20px',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Sparkles size={18} color="var(--accent-cyan)" />
          <span style={{ fontSize: '14px', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
            Live Call Transcript
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {isListening && (
            <span style={{ fontSize: '12px', background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '3px 8px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ef4444' }}></span> Listening
            </span>
          )}
          {isSpeaking && (
            <span style={{ fontSize: '12px', background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '3px 8px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }}></span> Speaking
            </span>
          )}
          {isThinking && (
            <span style={{ fontSize: '12px', background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8', border: '1px solid rgba(99, 102, 241, 0.3)', padding: '3px 8px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#6366f1' }}></span> Thinking...
            </span>
          )}
        </div>
      </div>

      {/* Transcript Scroll Area */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>
        {messages.length === 0 ? (
          <div style={{ margin: 'auto', textAlign: 'center', color: 'var(--text-muted)' }}>
            <p style={{ fontSize: '15px' }}>Click "Start Voice Call" to talk with Nexus.</p>
            <p style={{ fontSize: '13px', marginTop: '6px' }}>Speak naturally or type your requirements below.</p>
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  gap: '12px',
                  alignSelf: isUser ? 'flex-end' : 'flex-start',
                  maxWidth: '82%',
                  flexDirection: isUser ? 'row-reverse' : 'row'
                }}
              >
                <div style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: isUser ? 'linear-gradient(135deg, #6366f1, #4f46e5)' : 'linear-gradient(135deg, #0ea5e9, #06b6d4)',
                  boxShadow: isUser ? '0 4px 12px rgba(99,102,241,0.3)' : '0 4px 12px rgba(6,182,212,0.3)',
                  flexShrink: 0
                }}>
                  {isUser ? <User size={18} color="#fff" /> : <Bot size={18} color="#fff" />}
                </div>

                <div style={{
                  background: isUser ? 'rgba(99, 102, 241, 0.12)' : 'rgba(255, 255, 255, 0.05)',
                  border: isUser ? '1px solid rgba(99, 102, 241, 0.25)' : '1px solid var(--border-color)',
                  borderRadius: isUser ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
                  padding: '12px 16px',
                  color: isUser ? '#e0e7ff' : '#f8fafc',
                  fontSize: '14.5px',
                  lineHeight: '1.5'
                }}>
                  <div style={{ fontSize: '11px', color: isUser ? '#818cf8' : '#38bdf8', marginBottom: '4px', fontWeight: 600 }}>
                    {isUser ? 'PROSPECT' : 'NEXUS (AI SALES AGENT)'}
                  </div>
                  <div>{msg.content}</div>
                </div>
              </div>
            );
          })
        )}

        {isThinking && (
          <div style={{ display: 'flex', gap: '12px', alignSelf: 'flex-start', maxWidth: '80%' }}>
            <div style={{
              width: '34px',
              height: '34px',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'linear-gradient(135deg, #0ea5e9, #06b6d4)',
              flexShrink: 0
            }}>
              <Bot size={18} color="#fff" />
            </div>
            <div style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--border-color)',
              borderRadius: '4px 16px 16px 16px',
              padding: '12px 18px',
              color: 'var(--text-secondary)',
              fontSize: '13px'
            }}>
              Nexus is analyzing requirements...
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Interactive Text Input Fallback Bar */}
      <form 
        onSubmit={handleSubmit}
        style={{
          padding: '14px 18px',
          borderTop: '1px solid var(--border-color)',
          display: 'flex',
          gap: '10px',
          background: 'rgba(0, 0, 0, 0.2)'
        }}
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Speak into microphone or type a question..."
          style={{
            flex: 1,
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid var(--border-color)',
            borderRadius: '24px',
            padding: '10px 18px',
            color: '#f8fafc',
            fontSize: '13.5px',
            outline: 'none'
          }}
        />
        <button
          type="submit"
          disabled={!inputText.trim()}
          style={{
            background: inputText.trim() ? 'linear-gradient(135deg, #6366f1, #06b6d4)' : 'rgba(255, 255, 255, 0.05)',
            border: 'none',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: inputText.trim() ? '#fff' : 'var(--text-muted)',
            cursor: inputText.trim() ? 'pointer' : 'default',
            transition: 'all 0.2s ease'
          }}
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}
