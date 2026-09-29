import React, { useState, useEffect } from 'react';
import { submitAlert, submitFeedback, getMetrics, type Alert, type AgentResponse } from './api';

function App() {
  const [memoryEnabled, setMemoryEnabled] = useState(true);
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<AgentResponse | null>(null);
  const [feedbackStatus, setFeedbackStatus] = useState<number | null>(null);
  const [selectedScenario, setSelectedScenario] = useState<'checkout' | 'auth' | 'payment'>('checkout');
  const [metrics, setMetrics] = useState<any[]>([]);

  const scenarioAlerts: Record<string, Alert> = {
    checkout: {
      id: `INC-${Math.floor(1000 + Math.random() * 9000)}`,
      service: 'checkout-api',
      severity: 'SEV1',
      summary: 'p99 latency > 4.2s, Redis evicted_keys spiking, 500 error burst',
      raw_log_snippet: 'ERR OOM command not allowed when used memory > maxmemory\nRedisException: Connection pool exhausted [node-checkout-redis-01]',
      timestamp: new Date().toISOString()
    },
    auth: {
      id: `INC-${Math.floor(1000 + Math.random() * 9000)}`,
      service: 'auth-service',
      severity: 'SEV2',
      summary: 'JWT token verification timeout, PostgreSQL pool connection limit reached',
      raw_log_snippet: 'fatal: remaining connection slots reserved for non-replication superuser connections\nAuthTimeout: Failed to verify signature within 5000ms',
      timestamp: new Date().toISOString()
    },
    payment: {
      id: `INC-${Math.floor(1000 + Math.random() * 9000)}`,
      service: 'payment-gateway',
      severity: 'SEV1',
      summary: 'Stripe webhook processing bottleneck, DLQ consumer lag > 15,000 events',
      raw_log_snippet: 'StripeAPIError: 429 Too Many Requests (Rate limit exceeded)\nKafkaConsumer: Partition offset lag expanding rapidly',
      timestamp: new Date().toISOString()
    }
  };

  const currentAlert = scenarioAlerts[selectedScenario];

  const fetchIncidentMetrics = async () => {
    try {
      const data = await getMetrics();
      setMetrics(data);
    } catch (e) {
      console.error('Failed to fetch metrics', e);
    }
  };

  useEffect(() => {
    fetchIncidentMetrics();
  }, []);

  const handleSimulateAlert = async () => {
    setLoading(true);
    setResponse(null);
    setFeedbackStatus(null);
    try {
      const res = await submitAlert(currentAlert, memoryEnabled);
      setResponse(res);
      await fetchIncidentMetrics();
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleFeedback = async (rank: number, outcome: 'worked' | 'partial' | 'failed') => {
    if (!response) return;
    try {
      await submitFeedback({
        alert_id: response.alert_id,
        fix_rank_used: rank,
        outcome,
        minutes_to_resolve: outcome === 'worked' ? 10 : undefined
      });
      setFeedbackStatus(rank);
      await fetchIncidentMetrics();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-[#040A0B] text-slate-100 font-sans flex overflow-hidden selection:bg-teal-500 selection:text-black">
      
      {/* DARK TEAL BACKGROUND GLOWS (Image 2 aesthetic) */}
      <div className="fixed -top-40 -left-40 w-[600px] h-[600px] bg-teal-900/20 rounded-full blur-[160px] pointer-events-none" />
      <div className="fixed top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-emerald-950/25 rounded-full blur-[180px] pointer-events-none" />
      <div className="fixed -bottom-40 -right-40 w-[600px] h-[600px] bg-cyan-950/20 rounded-full blur-[160px] pointer-events-none" />

      {/* 1. LEFT VERTICAL NAVIGATION SIDEBAR (Layout from Image 1, Palette from Image 2) */}
      <aside className="w-20 bg-[#071416]/90 backdrop-blur-xl border-r border-[#153438] flex flex-col items-center py-6 justify-between z-20 shrink-0">
        <div className="flex flex-col items-center gap-8 w-full">
          {/* Logo */}
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-teal-400 to-emerald-600 p-0.5 shadow-glow cursor-pointer">
            <div className="h-full w-full bg-[#051113] rounded-[14px] flex items-center justify-center font-mono font-bold text-teal-400 text-xl">
              H
            </div>
          </div>

          {/* Sidebar Nav Buttons (Image 1 layout) */}
          <nav className="flex flex-col gap-4 w-full px-3">
            {[
              { icon: '⚡', label: 'Incidents' },
              { icon: '🧠', label: 'Memory' },
              { icon: '📊', label: 'Analytics' },
              { icon: '⚙️', label: 'Settings' }
            ].map((item, idx) => (
              <button
                key={idx}
                title={item.label}
                className={`h-12 w-full rounded-2xl flex items-center justify-center text-lg transition-all ${idx === 0 ? 'bg-[#0E282B] text-teal-300 border border-teal-500/40 shadow-glow' : 'text-slate-500 hover:text-slate-300 hover:bg-[#08181A]'}`}
              >
                {item.icon}
              </button>
            ))}
          </nav>
        </div>

        {/* User avatar (Image 1 layout) */}
        <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-teal-500 to-emerald-500 p-0.5 shadow-md">
          <div className="h-full w-full bg-[#071416] rounded-full flex items-center justify-center font-bold text-xs text-teal-300">
            SRE
          </div>
        </div>
      </aside>

      {/* MAIN WORKSPACE AREA */}
      <div className="flex-1 flex flex-col h-screen overflow-y-auto z-10">
        
        {/* 2. TOP HEADER (Image 1 layout with extra action buttons) */}
        <header className="p-8 pb-4 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight text-white font-sans">
                RunbookMind <span className="text-teal-400 font-normal">&</span> Hindsight
              </h1>
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            </div>
            <p className="text-xs text-slate-400 mt-1">Autonomous SRE Incident Resolution • Hindsight Memory Engine</p>
          </div>

          <div className="flex items-center gap-4">
            {/* Top Action Buttons (Image 1 style) */}
            <div className="flex items-center gap-2">
              <button title="Settings" className="h-10 w-10 rounded-xl bg-[#08181A] border border-[#16383D] flex items-center justify-center text-slate-400 hover:text-white transition-all">
                ⚙️
              </button>
              <button title="Help Center" className="h-10 w-10 rounded-xl bg-[#08181A] border border-[#16383D] flex items-center justify-center text-slate-400 hover:text-white transition-all">
                ❓
              </button>
            </div>

            {/* HINDSIGHT MEMORY TOGGLE */}
            <div className="flex items-center gap-3 bg-[#08181A]/80 backdrop-blur-xl px-4 py-2 rounded-2xl border border-[#16383D] shadow-glass">
              <div className={`h-2.5 w-2.5 rounded-full ${memoryEnabled ? 'bg-teal-400 shadow-[0_0_12px_#2dd4bf]' : 'bg-slate-600'}`} />
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-slate-200">Hindsight Memory Engine</span>
                <span className="text-[10px] text-teal-400/80 font-mono">{memoryEnabled ? 'Bank: devnote (Active)' : 'Memory Disabled'}</span>
              </div>

              <button
                onClick={() => setMemoryEnabled(!memoryEnabled)}
                className={`relative inline-flex h-6 w-12 items-center rounded-full transition-colors ml-2 ${memoryEnabled ? 'bg-teal-500' : 'bg-slate-800'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${memoryEnabled ? 'translate-x-7' : 'translate-x-1'}`} />
              </button>
            </div>
          </div>
        </header>

        {/* INCIDENT SCENARIO SELECTOR BAR */}
        <section className="bg-[#08181A]/80 backdrop-blur-xl rounded-2xl border border-[#16383D] p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-glass">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Select Scenario:</span>
            <div className="flex items-center gap-2">
              {(['checkout', 'auth', 'payment'] as const).map((key) => (
                <button
                  key={key}
                  onClick={() => setSelectedScenario(key)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${selectedScenario === key ? 'bg-[#0F2A2E] text-teal-300 border border-teal-500/50 shadow-glow' : 'bg-[#051214] text-slate-400 hover:text-white border border-[#112C30]'}`}
                >
                  {key === 'checkout' ? '🛒 Checkout API' : key === 'auth' ? '🔐 Auth Service' : '💳 Payment Gateway'}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleSimulateAlert}
            disabled={loading}
            className="bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-bold px-6 py-2.5 rounded-xl shadow-glow transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-xs shrink-0"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-slate-950" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Querying Hindsight & Groq LLM...</span>
              </>
            ) : (
              <>
                <span>⚡ Run Live Incident Simulation</span>
              </>
            )}
          </button>
        </section>

        {/* MAIN WORKING GRID */}
        <main className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          {/* LEFT: LIVE DIAGNOSIS & REMEDIATION (7 COLS) */}
          <div className="lg:col-span-7 bg-[#08181A]/80 backdrop-blur-xl rounded-3xl border border-[#16383D] p-6 shadow-glass flex flex-col gap-6">
            <div className="flex items-center justify-between border-b border-[#143236] pb-4">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-500 animate-pulse" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300">Live Agent Diagnosis</h2>
              </div>
              <span className="text-[11px] font-mono text-teal-400 bg-teal-500/10 px-2.5 py-0.5 rounded-full border border-teal-500/20">
                GROQ LLM INFERENCE
              </span>
            </div>

            {response ? (
              <>
                {/* Active Incident Details */}
                <div className="bg-[#051214] p-4 rounded-2xl border border-[#112C30] flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                        {currentAlert.severity}
                      </span>
                      <span className="font-mono text-xs text-teal-300 font-bold">{currentAlert.service}</span>
                    </div>
                    <span className="text-xs font-mono text-slate-500">{currentAlert.id}</span>
                  </div>
                  <h3 className="text-base font-semibold text-white mt-1">{currentAlert.summary}</h3>
                  {currentAlert.raw_log_snippet && (
                    <pre className="mt-2 p-3 bg-[#03090A] rounded-xl text-[11px] font-mono text-slate-300 border border-[#0F2629] overflow-x-auto">
                      {currentAlert.raw_log_snippet}
                    </pre>
                  )}
                </div>

                {/* Root Cause Hypotheses */}
                <div className="flex flex-col gap-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Likely Root Cause Hypotheses</h3>
                  <div className="flex flex-col gap-3">
                    {response.hypotheses.map((hyp, i) => (
                      <div key={i} className="bg-[#051214]/80 p-4 rounded-2xl border border-[#112C30] flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-slate-200">{hyp.root_cause}</span>
                          <span className="text-xs font-mono font-bold text-teal-300 bg-teal-500/10 px-2 py-0.5 rounded-md border border-teal-500/20">
                            {Math.round(hyp.confidence * 100)}% Confidence
                          </span>
                        </div>
                        <div className="w-full bg-[#0A1E21] rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-teal-400 to-emerald-500 h-full rounded-full transition-all duration-700"
                            style={{ width: `${Math.round(hyp.confidence * 100)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Remediation Actions */}
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Ranked Remediation Actions</h3>
                    {memoryEnabled && (
                      <span className="text-[10px] font-semibold text-teal-300 bg-teal-500/10 px-2 py-0.5 rounded-full border border-teal-500/30">
                        ⚡ Reranked by Hindsight Memory
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col gap-3">
                    {response.fixes.map((fix) => (
                      <div key={fix.rank} className="bg-[#051214]/80 p-4 rounded-2xl border border-[#112C30] flex items-start gap-4">
                        <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-teal-400 to-emerald-600 flex items-center justify-center font-bold text-xs text-slate-950 shadow-glow shrink-0">
                          #{fix.rank}
                        </div>
                        <div className="flex-1 flex flex-col gap-2">
                          <ul className="space-y-1">
                            {fix.steps.map((step, idx) => (
                              <li key={idx} className="text-xs text-slate-200 flex items-start gap-2">
                                <span className="text-teal-400 font-bold">•</span>
                                <span>{step}</span>
                              </li>
                            ))}
                          </ul>

                          <div className="flex items-center justify-between pt-2 border-t border-[#112C30] mt-1">
                            {fix.past_success_rate !== undefined && memoryEnabled ? (
                              <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                                ✓ Hindsight Rank Boost: {Math.min(100, Math.round(fix.past_success_rate * 100))}% Success Rate
                              </span>
                            ) : (
                              <span className="text-[11px] text-slate-500">Base Model Output</span>
                            )}

                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleFeedback(fix.rank, 'worked')}
                                className={`text-xs px-3 py-1 font-semibold rounded-xl transition-all ${feedbackStatus === fix.rank ? 'bg-emerald-500 text-slate-950 shadow-glow' : 'bg-[#0C2225] hover:bg-[#123034] text-slate-200 border border-[#163B3F]'}`}
                              >
                                {feedbackStatus === fix.rank ? '✓ Worked' : 'Mark Worked'}
                              </button>
                              <button
                                onClick={() => handleFeedback(fix.rank, 'failed')}
                                className="text-xs px-3 py-1 font-semibold rounded-xl bg-[#081618] hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-all"
                              >
                                Failed
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="h-72 flex flex-col items-center justify-center text-center p-6 text-slate-500 border border-dashed border-[#16383D] rounded-2xl">
                <span className="text-3xl mb-3">⚡</span>
                <p className="text-sm font-semibold text-slate-300">Ready to Process Incident</p>
                <p className="text-xs text-slate-500 max-w-sm mt-1">Click "⚡ Run Live Incident Simulation" above to trigger real Groq LLM diagnosis and Hindsight memory reranking.</p>
              </div>
            )}
          </div>

          {/* RIGHT: HINDSIGHT CLOUD MEMORY BANK (5 COLS) */}
          <div className="lg:col-span-5 bg-[#08181A]/80 backdrop-blur-xl rounded-3xl border border-[#16383D] p-6 shadow-glass flex flex-col gap-6">
            <div className="flex items-center justify-between border-b border-[#143236] pb-4">
              <div className="flex items-center gap-2">
                <span className="text-lg">🧠</span>
                <h2 className="text-xs font-bold uppercase tracking-wider text-teal-300">Hindsight Cloud Memory Bank</h2>
              </div>
              <span className="text-[11px] font-mono text-teal-300 bg-teal-500/10 px-2.5 py-0.5 rounded-full border border-teal-500/30">
                devnote
              </span>
            </div>

            {response && memoryEnabled ? (
              response.recalled.length > 0 ? (
                <div className="flex flex-col gap-4">
                  <div className="bg-[#051618] p-3.5 rounded-2xl border border-teal-500/30 text-xs text-teal-300 flex items-center gap-2 shadow-glow">
                    <span className="text-base">✨</span>
                    <span><strong>Hindsight Memory Active:</strong> Retrieved {response.recalled.length} matching incident resolutions.</span>
                  </div>

                  <div className="flex flex-col gap-4 relative">
                    <div className="absolute left-3.5 top-3 bottom-3 w-0.5 bg-gradient-to-b from-teal-400 via-emerald-500 to-[#102B2E]" />

                    {response.recalled.map((memory) => (
                      <div key={memory.id} className="pl-9 relative flex flex-col gap-2 group">
                        <div className="absolute left-2 top-2 h-3.5 w-3.5 rounded-full bg-[#040A0B] border-2 border-teal-400 group-hover:scale-125 group-hover:bg-teal-400 transition-all shadow-glow" />

                        <div className="bg-[#051214]/90 p-4 rounded-2xl border border-[#112C30] hover:border-teal-500/40 transition-all flex flex-col gap-2 shadow-glass">
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-xs font-bold text-teal-300">{memory.id}</span>
                            <span className="text-[10px] text-slate-400 bg-[#08181A] px-2 py-0.5 rounded-md border border-[#14353A]">
                              {memory.age_days || 10} days ago
                            </span>
                          </div>

                          <p className="text-xs text-slate-300 leading-relaxed">{memory.text}</p>

                          <div className="flex items-center justify-between pt-2 border-t border-[#112C30] mt-1">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${memory.outcome === 'worked' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'}`}>
                              Outcome: {memory.outcome}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400">
                              Vector Match: {Math.round((memory.score || 0.9) * 100)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-6 bg-[#051214] rounded-2xl border border-[#112C30] text-center flex flex-col items-center gap-2">
                  <span className="text-2xl">🔍</span>
                  <p className="text-xs font-semibold text-slate-300">No Similar Memories Found</p>
                  <p className="text-[11px] text-slate-500">Hindsight vector bank found no prior matching incidents for this query.</p>
                </div>
              )
            ) : response && !memoryEnabled ? (
              <div className="p-5 bg-amber-950/20 rounded-2xl border border-amber-500/30 text-amber-300 text-xs flex flex-col gap-2">
                <span className="font-bold flex items-center gap-2">
                  <span>⚠️ Hindsight Memory Engine Disabled</span>
                </span>
                <p className="text-slate-400 text-[11px]">
                  Memory retrieval is currently toggled OFF. The AI model is relying solely on base model weights.
                </p>
              </div>
            ) : (
              <div className="h-72 flex flex-col items-center justify-center text-center p-6 text-slate-500 border border-dashed border-[#16383D] rounded-2xl">
                <span className="text-3xl mb-2">☁️</span>
                <p className="text-xs font-semibold text-slate-300">Hindsight Memory Bank Ready</p>
                <p className="text-[11px] text-slate-500 max-w-xs mt-1">Vector matched past incident resolutions will render here live.</p>
              </div>
            )}
          </div>

        </main>

        {/* LIVE METRICS HISTORY LOG TABLE (Connected to DB backend endpoint /metrics) */}
        {metrics.length > 0 && (
          <section className="bg-[#08181A]/80 backdrop-blur-xl rounded-3xl border border-[#16383D] p-6 shadow-glass flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-[#143236] pb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">Incident Database Logs & Resolution History</h3>
              <span className="text-[10px] font-mono text-slate-400">ENDPOINT: /metrics</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#112C30] text-[11px] text-slate-400 uppercase tracking-wider font-mono">
                    <th className="py-2 px-3">Alert ID</th>
                    <th className="py-2 px-3">Timestamp</th>
                    <th className="py-2 px-3">Memory State</th>
                    <th className="py-2 px-3">Top 1 Fix Correct</th>
                    <th className="py-2 px-3">Minutes to Resolve</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#112C30] text-xs font-mono">
                  {metrics.slice(-5).map((m, idx) => (
                    <tr key={idx} className="hover:bg-[#051214]">
                      <td className="py-2 px-3 font-bold text-teal-300">{m.alert_id}</td>
                      <td className="py-2 px-3 text-slate-400">{m.timestamp}</td>
                      <td className="py-2 px-3">
                        <span className={`px-2 py-0.5 rounded ${m.memory_enabled ? 'bg-teal-500/10 text-teal-400' : 'bg-slate-800 text-slate-400'}`}>
                          {m.memory_enabled ? 'ENABLED' : 'DISABLED'}
                        </span>
                      </td>
                      <td className="py-2 px-3">
                        {m.top1_correct === 1 ? (
                          <span className="text-emerald-400 font-bold">YES</span>
                        ) : m.top1_correct === 0 ? (
                          <span className="text-rose-400 font-bold">NO</span>
                        ) : (
                          <span className="text-slate-500">PENDING FEEDBACK</span>
                        )}
                      </td>
                      <td className="py-2 px-3 text-slate-300">{m.minutes_to_resolve ? `${m.minutes_to_resolve} mins` : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

      </div>
    </div>
  );
}

export default App;



