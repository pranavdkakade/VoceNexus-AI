import React, { useState } from 'react';
import VoiceAgent from './components/VoiceAgent';
import Dashboard from './components/Dashboard';
import { Bot, Radio, BarChart3 } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('call');

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '24px 28px', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Navbar */}
      <header style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingBottom: '20px',
        marginBottom: '20px',
        borderBottom: '1px solid var(--border-color)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 20px rgba(99, 102, 241, 0.4)'
          }}>
            <Bot size={24} color="#fff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontSize: '20px', fontWeight: 800, letterSpacing: '-0.5px' }}>VoceNexus AI</h1>
              <span style={{
                background: 'linear-gradient(90deg, #6366f1, #06b6d4)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontSize: '12px',
                fontWeight: 700,
                textTransform: 'uppercase',
                border: '1px solid rgba(99, 102, 241, 0.3)',
                padding: '2px 6px',
                borderRadius: '6px'
              }}>
                Fortivex Sales Agent
              </span>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              Autonomous Voice Agent for Lead Qualification & Demo Scheduling
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div style={{ display: 'flex', gap: '8px', background: 'rgba(15, 23, 42, 0.6)', padding: '4px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <button
            onClick={() => setActiveTab('call')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 18px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'call' ? 'rgba(99, 102, 241, 0.25)' : 'transparent',
              color: activeTab === 'call' ? '#fff' : 'var(--text-secondary)',
              cursor: 'pointer',
              fontSize: '13.5px',
              fontWeight: 600,
              transition: 'all 0.2s ease'
            }}
          >
            <Radio size={16} />
            Voice Call
          </button>

          <button
            onClick={() => setActiveTab('dashboard')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 18px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'dashboard' ? 'rgba(99, 102, 241, 0.25)' : 'transparent',
              color: activeTab === 'dashboard' ? '#fff' : 'var(--text-secondary)',
              cursor: 'pointer',
              fontSize: '13.5px',
              fontWeight: 600,
              transition: 'all 0.2s ease'
            }}
          >
            <BarChart3 size={16} />
            CRM & Analytics
          </button>
        </div>
      </header>

      {/* Main View Area */}
      <main style={{ flex: 1 }}>
        {activeTab === 'call' ? <VoiceAgent /> : <Dashboard />}
      </main>
    </div>
  );
}
