import React from 'react';
import { 
  Bot, PhoneCall, BarChart3, Zap, ShieldCheck, Database, 
  ArrowRight, CheckCircle2, Sparkles, Layers, Cpu, Clock, 
  Target, Calendar, Users, Award, ChevronRight
} from 'lucide-react';

export default function Home({ onNavigate }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '48px', paddingBottom: '60px' }}>
      {/* Hero Section */}
      <section style={{
        textAlign: 'center',
        padding: '50px 20px 30px 20px',
        maxWidth: '960px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '20px'
      }}>
        {/* Release Pill Badge */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(99, 102, 241, 0.12)',
          border: '1px solid rgba(99, 102, 241, 0.3)',
          padding: '6px 16px',
          borderRadius: '30px',
          fontSize: '12.5px',
          fontWeight: 600,
          color: '#a5b4fc',
          boxShadow: '0 4px 15px rgba(99, 102, 241, 0.15)'
        }}>
          <Sparkles size={14} color="#818cf8" />
          <span>Fortivex Autonomous AI Sales Infrastructure • Version 1.0</span>
        </div>

        {/* Hero Title */}
        <h1 style={{
          fontSize: '48px',
          fontWeight: 800,
          lineHeight: '1.18',
          letterSpacing: '-1.2px',
          color: '#f8fafc',
          margin: '0'
        }}>
          The Autonomous Voice Sales Agent <br />
          <span style={{
            background: 'linear-gradient(135deg, #6366f1 20%, #06b6d4 80%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            display: 'inline-block'
          }}>
            That Qualifies Leads & Closes Demos
          </span>
        </h1>

        {/* Hero Subtitle */}
        <p style={{
          fontSize: '17px',
          lineHeight: '1.6',
          color: 'var(--text-secondary)',
          maxWidth: '740px',
          margin: '0 auto'
        }}>
          VoceNexus AI sounds and behaves like an elite consultative sales representative.
          Powered by sub-second Groq LPU reasoning and FAISS vector RAG, it discovers prospect pain points,
          scores buying readiness with an auditable rubric, locks in calendar demos, and syncs directly into your CRM.
        </p>

        {/* Hero CTA Buttons */}
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '10px' }}>
          <button
            onClick={() => onNavigate('call')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
              color: '#fff',
              border: 'none',
              padding: '14px 32px',
              borderRadius: '30px',
              fontSize: '15px',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 8px 25px rgba(99, 102, 241, 0.45)',
              transition: 'all 0.25s ease'
            }}
          >
            <PhoneCall size={18} />
            Start Voice Demo Call
            <ArrowRight size={16} />
          </button>

          <button
            onClick={() => onNavigate('dashboard')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--border-color)',
              color: '#f8fafc',
              padding: '14px 28px',
              borderRadius: '30px',
              fontSize: '15px',
              fontWeight: 600,
              cursor: 'pointer',
              backdropFilter: 'blur(8px)',
              transition: 'all 0.25s ease'
            }}
          >
            <BarChart3 size={18} color="var(--accent-cyan)" />
            View Live CRM Dashboard
          </button>
        </div>

        {/* Metrics Banner */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '20px',
          width: '100%',
          marginTop: '30px',
          padding: '24px 20px',
          background: 'rgba(15, 23, 42, 0.55)',
          backdropFilter: 'blur(16px)',
          border: '1px solid var(--border-color)',
          borderRadius: '16px'
        }}>
          <div>
            <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--accent-cyan)' }}>&lt; 800ms</div>
            <div style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '4px' }}>Groq Voice Latency</div>
          </div>
          <div>
            <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--accent-purple)' }}>0%</div>
            <div style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '4px' }}>Hallucination (FAISS RAG)</div>
          </div>
          <div>
            <div style={{ fontSize: '28px', fontWeight: 800, color: '#10b981' }}>0–100</div>
            <div style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '4px' }}>Explainable Lead Scoring</div>
          </div>
          <div>
            <div style={{ fontSize: '28px', fontWeight: 800, color: '#f59e0b' }}>&lt; $0.05</div>
            <div style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '4px' }}>Cost per Qualified Lead</div>
          </div>
        </div>
      </section>

      {/* How It Works: The 4-Stage Autonomous Pipeline */}
      <section style={{ padding: '0 10px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--accent-cyan)' }}>
            Architecture In Action
          </span>
          <h2 style={{ fontSize: '30px', fontWeight: 800, color: '#fff', marginTop: '6px' }}>
            How VoceNexus Closes the Sales Loop
          </h2>
          <p style={{ fontSize: '15px', color: 'var(--text-secondary)', marginTop: '6px', maxWidth: '600px', margin: '6px auto 0 auto' }}>
            A fully closed-loop agentic workflow executing real business logic during natural conversation.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '18px' }}>
          {/* Step 1 */}
          <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px', position: 'relative' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '16px',
              fontWeight: 800,
              color: '#fff'
            }}>
              1
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#fff' }}>Speech-to-Text</h3>
            <p style={{ fontSize: '13px', lineHeight: '1.5', color: 'var(--text-secondary)' }}>
              Browser-native Web Speech API captures real-time continuous voice, transcribing intent instantly with zero audio upload overhead.
            </p>
          </div>

          {/* Step 2 */}
          <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px', position: 'relative' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #0ea5e9, #06b6d4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '16px',
              fontWeight: 800,
              color: '#fff'
            }}>
              2
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#fff' }}>FAISS RAG Retrieval</h3>
            <p style={{ fontSize: '13px', lineHeight: '1.5', color: 'var(--text-secondary)' }}>
              Dense embeddings via Sentence Transformers retrieve verified product specs, pricing tiers, and SLA facts before answering.
            </p>
          </div>

          {/* Step 3 */}
          <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px', position: 'relative' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #10b981, #059669)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '16px',
              fontWeight: 800,
              color: '#fff'
            }}>
              3
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#fff' }}>Tool Execution</h3>
            <p style={{ fontSize: '13px', lineHeight: '1.5', color: 'var(--text-secondary)' }}>
              LLM autonomously triggers tools: scores lead criteria (0-100), synchronizes CRM records, and checks calendar slot availability.
            </p>
          </div>

          {/* Step 4 */}
          <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px', position: 'relative' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #f59e0b, #d97706)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '16px',
              fontWeight: 800,
              color: '#fff'
            }}>
              4
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#fff' }}>Call Summarization</h3>
            <p style={{ fontSize: '13px', lineHeight: '1.5', color: 'var(--text-secondary)' }}>
              Post-call intelligence extracts executive recaps, sentiment ratings, and recommended next action items for human account executives.
            </p>
          </div>
        </div>
      </section>

      {/* Feature Comparison Matrix: Chatbots vs. VoceNexus Agent */}
      <section className="glass-panel" style={{ padding: '36px', overflow: 'hidden' }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#fff' }}>
            Why Autonomous Voice Agents Outperform Basic Chatbots
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            The architectural difference between generating words vs. executing business actions.
          </p>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '14px 16px' }}>CAPABILITY</th>
                <th style={{ padding: '14px 16px' }}>TRADITIONAL CHATBOT</th>
                <th style={{ padding: '14px 16px', color: 'var(--accent-cyan)' }}>VOCENEXUS AUTONOMOUS AGENT</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                <td style={{ padding: '14px 16px', fontWeight: 600, color: '#f8fafc' }}>Interaction Channel</td>
                <td style={{ padding: '14px 16px', color: 'var(--text-muted)' }}>Text-only typing box</td>
                <td style={{ padding: '14px 16px', color: '#10b981', fontWeight: 600 }}>Real-time voice stream + Speech Synthesis</td>
              </tr>
              <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                <td style={{ padding: '14px 16px', fontWeight: 600, color: '#f8fafc' }}>Knowledge Grounding</td>
                <td style={{ padding: '14px 16px', color: 'var(--text-muted)' }}>Prone to hallucination / training cutoff</td>
                <td style={{ padding: '14px 16px', color: '#10b981', fontWeight: 600 }}>Strict FAISS vector RAG retrieval from company docs</td>
              </tr>
              <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                <td style={{ padding: '14px 16px', fontWeight: 600, color: '#f8fafc' }}>Lead Qualification</td>
                <td style={{ padding: '14px 16px', color: 'var(--text-muted)' }}>Subjective or absent</td>
                <td style={{ padding: '14px 16px', color: '#10b981', fontWeight: 600 }}>Rule-based 0–100 scoring (Budget, Timeline, Pain points)</td>
              </tr>
              <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                <td style={{ padding: '14px 16px', fontWeight: 600, color: '#f8fafc' }}>Demo Scheduling</td>
                <td style={{ padding: '14px 16px', color: 'var(--text-muted)' }}>Static link to Calendly</td>
                <td style={{ padding: '14px 16px', color: '#10b981', fontWeight: 600 }}>Autonomous calendar tool locks slot during the call</td>
              </tr>
              <tr>
                <td style={{ padding: '14px 16px', fontWeight: 600, color: '#f8fafc' }}>CRM Integration</td>
                <td style={{ padding: '14px 16px', color: 'var(--text-muted)' }}>Manual copy-pasting</td>
                <td style={{ padding: '14px 16px', color: '#10b981', fontWeight: 600 }}>Automated SQLite / PostgreSQL synchronization</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Interactive Quick Links / Call-to-Action Bar */}
      <section style={{
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(6, 182, 212, 0.15))',
        border: '1px solid rgba(99, 102, 241, 0.35)',
        borderRadius: '20px',
        padding: '36px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '20px'
      }}>
        <div>
          <h3 style={{ fontSize: '22px', fontWeight: 800, color: '#fff' }}>
            Ready to test Nexus in action?
          </h3>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Experience voice-driven sales qualification with sub-second response latency.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => onNavigate('call')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: '#fff',
              color: '#090d16',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '24px',
              fontSize: '14px',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(255, 255, 255, 0.2)'
            }}
          >
            Launch Voice Call <ChevronRight size={16} />
          </button>
        </div>
      </section>

      {/* Professional Developer Footer */}
      <footer style={{
        borderTop: '1px solid var(--border-color)',
        paddingTop: '32px',
        marginTop: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '24px'
      }}>
        {/* Left Side: Brand + Interactive Navigation */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '9px', fontSize: '13.5px', fontWeight: 600, color: '#f8fafc' }}>
            <div style={{
              width: '26px',
              height: '26px',
              borderRadius: '7px',
              background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Bot size={15} color="#fff" />
            </div>
            <span>VoceNexus AI • Engineered for Fortivex Solutions</span>
          </div>

          {/* Bottom Navigation Links (Vertical) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '13px', marginTop: '4px' }}>
            <button
              onClick={() => onNavigate('home')}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--accent-cyan)',
                cursor: 'pointer',
                padding: '0',
                fontWeight: 600,
                textAlign: 'left',
                width: 'fit-content'
              }}
            >
              Home
            </button>
            <span style={{ color: 'var(--text-muted)', fontSize: '11px', lineHeight: '1' }}>•</span>
            <button
              onClick={() => onNavigate('call')}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                padding: '0',
                fontWeight: 500,
                textAlign: 'left',
                width: 'fit-content',
                transition: 'color 0.2s ease'
              }}
              onMouseEnter={(e) => e.target.style.color = '#fff'}
              onMouseLeave={(e) => e.target.style.color = 'var(--text-secondary)'}
            >
              Voice Call
            </button>
            <span style={{ color: 'var(--text-muted)', fontSize: '11px', lineHeight: '1' }}>•</span>
            <button
              onClick={() => onNavigate('dashboard')}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                padding: '0',
                fontWeight: 500,
                textAlign: 'left',
                width: 'fit-content',
                transition: 'color 0.2s ease'
              }}
              onMouseEnter={(e) => e.target.style.color = '#fff'}
              onMouseLeave={(e) => e.target.style.color = 'var(--text-secondary)'}
            >
              CRM & Analytics
            </button>
          </div>
        </div>

        {/* Right Side: Developer Attribution & Tech Stack */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Developed by</span>
            <span style={{
              fontSize: '13.5px',
              fontWeight: 700,
              color: '#f8fafc',
              background: 'rgba(255, 255, 255, 0.06)',
              padding: '3px 10px',
              borderRadius: '20px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              letterSpacing: '0.2px'
            }}>
              Pranav Kakade
            </span>
          </div>
          <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
            FastAPI • Groq LPU • LangChain • FAISS • React + Vite
          </div>
        </div>
      </footer>
    </div>
  );
}
