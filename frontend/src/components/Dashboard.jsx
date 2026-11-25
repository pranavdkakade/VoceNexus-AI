import React, { useState, useEffect } from 'react';
import { 
  Users, Calendar, TrendingUp, PhoneCall, CheckCircle2, 
  Clock, AlertCircle, RefreshCw, Sparkles, Building, Mail, Award 
} from 'lucide-react';
import { fetchAnalyticsOverview, fetchLeads, fetchAppointments, fetchCallSummaries } from '../services/api';

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState({
    total_calls: 0,
    total_leads: 0,
    qualified_leads: 0,
    total_appointments: 0,
    avg_lead_score: 0,
    sentiment_distribution: { positive: 0, neutral: 0, negative: 0 }
  });
  const [leads, setLeads] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [summaries, setSummaries] = useState([]);

  const loadData = async () => {
    setLoading(true);
    const [ov, lds, appts, sums] = await Promise.all([
      fetchAnalyticsOverview(),
      fetchLeads(),
      fetchAppointments(),
      fetchCallSummaries()
    ]);
    setOverview(ov);
    setLeads(lds);
    setAppointments(appts);
    setSummaries(sums);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const getStatusBadge = (status) => {
    if (status === 'qualified') {
      return (
        <span style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '3px 9px', borderRadius: '12px', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase' }}>
          Qualified
        </span>
      );
    }
    if (status === 'warm') {
      return (
        <span style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '3px 9px', borderRadius: '12px', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase' }}>
          Warm
        </span>
      );
    }
    return (
      <span style={{ background: 'rgba(148, 163, 184, 0.15)', color: '#94a3b8', border: '1px solid rgba(148, 163, 184, 0.3)', padding: '3px 9px', borderRadius: '12px', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase' }}>
        Nurture
      </span>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '40px' }}>
      {/* Top Controls Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#f8fafc' }}>
            CRM & Revenue Analytics Dashboard
          </h2>
          <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Real-time pipeline data generated autonomously by the VoceNexus voice sales agent.
          </p>
        </div>
        <button
          onClick={loadData}
          disabled={loading}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(255, 255, 255, 0.06)',
            border: '1px solid var(--border-color)',
            color: '#f8fafc',
            padding: '9px 16px',
            borderRadius: '10px',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          Refresh Data
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '18px' }}>
        {/* Total Calls */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
            <span style={{ fontSize: '13px', fontWeight: 600 }}>Total Voice Calls</span>
            <div style={{ background: 'rgba(99, 102, 241, 0.15)', padding: '8px', borderRadius: '10px' }}>
              <PhoneCall size={18} color="var(--accent-purple)" />
            </div>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#fff', marginTop: '12px' }}>
            {overview.total_calls}
          </div>
          <div style={{ fontSize: '12px', color: '#10b981', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span>Sub-second AI voice stream</span>
          </div>
        </div>

        {/* Qualified Leads */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
            <span style={{ fontSize: '13px', fontWeight: 600 }}>Qualified Leads</span>
            <div style={{ background: 'rgba(16, 185, 129, 0.15)', padding: '8px', borderRadius: '10px' }}>
              <Users size={18} color="#10b981" />
            </div>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#fff', marginTop: '12px' }}>
            {overview.qualified_leads} <span style={{ fontSize: '14px', color: 'var(--text-muted)', fontWeight: 500 }}>/ {overview.total_leads}</span>
          </div>
          <div style={{ fontSize: '12px', color: '#34d399', marginTop: '4px' }}>
            {overview.total_leads > 0 ? `${Math.round((overview.qualified_leads / overview.total_leads) * 100)}% qualification rate` : '0%'}
          </div>
        </div>

        {/* Demo Appointments */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
            <span style={{ fontSize: '13px', fontWeight: 600 }}>Demos Scheduled</span>
            <div style={{ background: 'rgba(6, 182, 212, 0.15)', padding: '8px', borderRadius: '10px' }}>
              <Calendar size={18} color="var(--accent-cyan)" />
            </div>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#fff', marginTop: '12px' }}>
            {overview.total_appointments}
          </div>
          <div style={{ fontSize: '12px', color: '#38bdf8', marginTop: '4px' }}>
            Automated calendar slot locking
          </div>
        </div>

        {/* Average Lead Score */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
            <span style={{ fontSize: '13px', fontWeight: 600 }}>Avg. Lead Quality</span>
            <div style={{ background: 'rgba(245, 158, 11, 0.15)', padding: '8px', borderRadius: '10px' }}>
              <TrendingUp size={18} color="#f59e0b" />
            </div>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#fff', marginTop: '12px' }}>
            {overview.avg_lead_score} <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>/ 100</span>
          </div>
          <div style={{ fontSize: '12px', color: '#fbbf24', marginTop: '4px' }}>
            Rule-based explainable rubric
          </div>
        </div>
      </div>

      {/* Main Grid: Leads Table + Scheduled Appointments */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.9fr 1.1fr', gap: '24px' }}>
        {/* Leads Table */}
        <div className="glass-panel" style={{ padding: '24px', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Users size={18} color="var(--accent-purple)" />
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#fff' }}>
                CRM Lead Qualification Pipeline
              </h3>
            </div>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{leads.length} leads recorded</span>
          </div>

          {leads.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
              <Users size={36} style={{ margin: '0 auto 12px auto', opacity: 0.4 }} />
              <p>No leads qualified yet.</p>
              <p style={{ fontSize: '12.5px', marginTop: '4px' }}>Start a voice call to qualify prospects and view them here in real-time.</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13.5px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '10px 12px' }}>BUSINESS / NICHE</th>
                    <th style={{ padding: '10px 12px' }}>REQUIREMENTS</th>
                    <th style={{ padding: '10px 12px' }}>SCORE</th>
                    <th style={{ padding: '10px 12px' }}>STATUS</th>
                    <th style={{ padding: '10px 12px' }}>NEXT ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((lead) => (
                    <tr key={lead.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                      <td style={{ padding: '12px', fontWeight: 600, color: '#f8fafc' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Building size={14} color="#818cf8" />
                          {lead.business_type}
                        </div>
                      </td>
                      <td style={{ padding: '12px' }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                          {lead.requirements && lead.requirements.length > 0 ? (
                            lead.requirements.map((req, i) => (
                              <span key={i} style={{ background: 'rgba(255, 255, 255, 0.06)', padding: '2px 6px', borderRadius: '6px', fontSize: '11px', color: '#cbd5e1' }}>
                                {req}
                              </span>
                            ))
                          ) : (
                            <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>General AI Inquiries</span>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ width: '60px', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{
                              width: `${lead.lead_score}%`,
                              height: '100%',
                              background: lead.lead_score >= 70 ? '#10b981' : lead.lead_score >= 40 ? '#f59e0b' : '#64748b'
                            }} />
                          </div>
                          <span style={{ fontWeight: 700, fontSize: '13px' }}>{lead.lead_score}</span>
                        </div>
                      </td>
                      <td style={{ padding: '12px' }}>{getStatusBadge(lead.lead_status)}</td>
                      <td style={{ padding: '12px', color: 'var(--text-secondary)', fontSize: '12.5px' }}>
                        {lead.next_action === 'book_demo' ? 'Schedule Demo 📅' : 'Qualify Details'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Scheduled Appointments Panel */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
            <Calendar size={18} color="var(--accent-cyan)" />
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#fff' }}>
              Confirmed Product Demos
            </h3>
          </div>

          {appointments.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
              <Calendar size={36} style={{ margin: '0 auto 12px auto', opacity: 0.4 }} />
              <p>No demos booked yet.</p>
              <p style={{ fontSize: '12.5px', marginTop: '4px' }}>When the voice agent schedules a slot, it locks into this calendar automatically.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {appointments.map((appt) => (
                <div
                  key={appt.id}
                  style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '12px',
                    padding: '14px 16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '13.5px', fontWeight: 700, color: '#38bdf8' }}>
                      {appt.slot}
                    </span>
                    <span style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', fontSize: '11px', padding: '2px 8px', borderRadius: '10px', fontWeight: 600 }}>
                      Confirmed
                    </span>
                  </div>
                  <div style={{ fontSize: '12.5px', color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Mail size={13} color="var(--text-muted)" />
                    {appt.customer_name || 'Prospect'} ({appt.id})
                  </div>
                  {appt.notes && (
                    <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {appt.notes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Post-Call Intelligence & Summaries */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
          <Sparkles size={18} color="#f59e0b" />
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#fff' }}>
            Automated Call Summaries & Executive Intelligence
          </h3>
        </div>

        {summaries.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px 20px', color: 'var(--text-muted)' }}>
            <p>No call summaries recorded yet. Summaries are automatically generated after voice calls end.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
            {summaries.map((item) => (
              <div
                key={item.id}
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '12px',
                  padding: '16px 18px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--accent-purple)' }}>
                    Call ID: {item.conversation_id}
                  </span>
                  <span style={{ fontSize: '11px', textTransform: 'capitalize', color: item.sentiment_overall === 'positive' ? '#10b981' : '#94a3b8' }}>
                    Sentiment: {item.sentiment_overall}
                  </span>
                </div>
                <p style={{ fontSize: '13.5px', lineHeight: '1.5', color: '#f8fafc', marginBottom: '10px' }}>
                  {item.summary}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--accent-cyan)' }}>
                  <strong>Next Action:</strong> {item.next_steps}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
