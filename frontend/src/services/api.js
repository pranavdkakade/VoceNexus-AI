/**
 * REST API client for VoceNexus backend.
 */

const API_BASE = 'http://localhost:8000/api';

export async function fetchAnalyticsOverview() {
  try {
    const res = await fetch(`${API_BASE}/analytics/overview`);
    if (!res.ok) throw new Error('Failed to fetch analytics');
    return await res.json();
  } catch (e) {
    console.error('fetchAnalyticsOverview error:', e);
    return {
      total_calls: 0,
      total_leads: 0,
      qualified_leads: 0,
      total_appointments: 0,
      avg_lead_score: 0,
      sentiment_distribution: { positive: 0, neutral: 0, negative: 0 }
    };
  }
}

export async function fetchLeads() {
  try {
    const res = await fetch(`${API_BASE}/leads`);
    if (!res.ok) throw new Error('Failed to fetch leads');
    return await res.json();
  } catch (e) {
    console.error('fetchLeads error:', e);
    return [];
  }
}

export async function fetchAppointments() {
  try {
    const res = await fetch(`${API_BASE}/appointments`);
    if (!res.ok) throw new Error('Failed to fetch appointments');
    return await res.json();
  } catch (e) {
    console.error('fetchAppointments error:', e);
    return [];
  }
}

export async function fetchCallSummaries() {
  try {
    const res = await fetch(`${API_BASE}/analytics/summaries`);
    if (!res.ok) throw new Error('Failed to fetch summaries');
    return await res.json();
  } catch (e) {
    console.error('fetchCallSummaries error:', e);
    return [];
  }
}
