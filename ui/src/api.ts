import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export interface Alert {
    id: string;
    service: string;
    severity: string;
    summary: string;
    raw_log_snippet?: string;
    timestamp: string;
}

export interface RecalledMemory {
    id: string;
    text: string;
    score: number;
    outcome?: string;
    age_days?: number;
}

export interface Hypothesis {
    root_cause: string;
    confidence: number;
    evidence: string[];
}

export interface FixSuggestion {
    steps: string[];
    rank: number;
    confidence: number;
    past_success_rate?: number;
    source_incident_ids: string[];
}

export interface AgentResponse {
    alert_id: string;
    recalled: RecalledMemory[];
    hypotheses: Hypothesis[];
    fixes: FixSuggestion[];
    memory_enabled: boolean;
}

export interface Feedback {
    alert_id: string;
    fix_rank_used: number;
    outcome: 'worked' | 'partial' | 'failed';
    actual_root_cause?: string;
    minutes_to_resolve?: number;
    notes?: string;
}

export const submitAlert = async (alert: Alert, memoryEnabled: boolean): Promise<AgentResponse> => {
    const res = await axios.post(`${API_BASE_URL}/alert`, alert, { params: { memory_enabled: memoryEnabled } });
    return res.data;
};

export const submitFeedback = async (feedback: Feedback): Promise<{ status: string, memory_updated: boolean }> => {
    const res = await axios.post(`${API_BASE_URL}/feedback`, feedback);
    return res.data;
};

export const getMetrics = async () => {
    const res = await axios.get(`${API_BASE_URL}/metrics`);
    return res.data;
};
