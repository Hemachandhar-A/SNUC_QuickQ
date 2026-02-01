const API_BASE = '/api';

export async function api(path, options = {}) {
  const p = path.startsWith('/') ? path : `/${path}`;
  const url = path.startsWith('http') ? path : `${API_BASE}${p}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  if (!res.ok) throw new Error(await res.text().catch(() => res.statusText));
  const text = await res.text();
  if (!text) return null;
  return JSON.parse(text);
}

export const auth = {
  login: (body) => api('auth/login', { method: 'POST', body: JSON.stringify(body) }),
};

export const system = {
  status: () => api('system/status'),
  queue: () => api('system/queue'),
  stats: () => api('system/stats'),
};

export const ai = {
  predictWait: (body) => api('ai/predict_wait', { method: 'POST', body: JSON.stringify(body) }),
  forecastDemand: (body) => api('ai/forecast_demand', { method: 'POST', body: JSON.stringify(body) }),
  detectQueue: (body) => api('ai/detect_queue', { method: 'POST', body: JSON.stringify(body) }),
};

export const analytics = {
  dailySummary: (params) => api(`analytics/daily-summary?${new URLSearchParams(params || {})}`),
  audit: (params) => api(`analytics/audit?${new URLSearchParams(params || {})}`),
  auditStats: () => api('analytics/audit/stats'),
  heatmap: (params) => api(`analytics/heatmap?${new URLSearchParams(params || {})}`),
  sustainability: (params) => api(`analytics/sustainability?${new URLSearchParams(params || {})}`),
  temporalFlow: (params) => api(`analytics/temporal-flow?${new URLSearchParams(params || {})}`),
  overviewKpis: () => api('analytics/overview-kpis'),
};

export const staff = {
  shockTrigger: (body) => api('staff/shock/trigger', { method: 'POST', body: JSON.stringify(body) }),
  shockResolve: () => api('staff/shock/resolve', { method: 'POST' }),
  shockStatus: () => api('staff/shock/status'),
  state: () => api('staff/state'),
  setEntry: (enabled) => api('staff/entry', { method: 'POST', body: JSON.stringify({ enabled }) }),
  sendAlert: (body) => api('staff/alert', { method: 'POST', body: JSON.stringify(body) }),
  alertsCount: () => api('staff/alerts/count'),
  aiFeed: (params) => api(`staff/ai-feed?${new URLSearchParams(params || {})}`),
  resolveAiFeedItem: (id) => api(`staff/ai-feed/${id}/resolve`, { method: 'POST' }),
  resolveAllAiFeed: () => api('staff/ai-feed/resolve-all', { method: 'POST' }),
};
