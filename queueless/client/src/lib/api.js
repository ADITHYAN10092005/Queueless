const BASE_URL = import.meta.env.VITE_API_URL || '';

// --- API Calls ---

/**
 * Fetch all zones
 */
export async function fetchZones() {
  const res = await fetch(`${BASE_URL}/api/zones`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Failed to fetch zones' }));
    throw new Error(err.error || 'Failed to fetch zones');
  }
  return res.json();
}

/**
 * Fetch a single zone by slug
 */
export async function fetchZone(slug) {
  const res = await fetch(`${BASE_URL}/api/zones/${slug}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Zone not found' }));
    const errorObj = new Error(err.error || 'Zone not found');
    errorObj.status = res.status;
    throw errorObj;
  }
  return res.json();
}

/**
 * Take a token for a specific zone
 */
export async function takeToken(slug) {
  const res = await fetch(`${BASE_URL}/api/zones/${slug}/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Failed to take token' }));
    throw new Error(err.error || 'Failed to take token');
  }
  return res.json();
}

/**
 * Serve next token in queue (Admin only)
 */
export async function serveNextToken(slug, pin) {
  const res = await fetch(`${BASE_URL}/api/zones/${slug}/next`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-admin-pin': pin,
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Invalid PIN or server error' }));
    const errorObj = new Error(err.error || 'Server error');
    errorObj.status = res.status;
    throw errorObj;
  }
  return res.json();
}

/**
 * Reset a zone's tokens (Admin only)
 */
export async function resetZone(slug, pin) {
  const res = await fetch(`${BASE_URL}/api/zones/${slug}/reset`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-admin-pin': pin,
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Invalid PIN or server error' }));
    const errorObj = new Error(err.error || 'Server error');
    errorObj.status = res.status;
    throw errorObj;
  }
  return res.json();
}

// --- Derived Value Helpers ---

export function calculatePeopleWaiting(zone) {
  if (!zone) return 0;
  return Math.max(0, (zone.lastTokenGiven || 0) - (zone.currentToken || 0));
}

export function calculatePeopleAhead(myToken, currentToken) {
  if (!myToken || myToken <= 0) return 0;
  return Math.max(0, myToken - (currentToken || 0));
}

export function calculateEstimatedWait(peopleAhead, avgTimePerPerson = 2) {
  return peopleAhead * avgTimePerPerson;
}

// --- LocalStorage Helpers ---

export function getLocalStorageToken(slug) {
  const raw = localStorage.getItem(`queueless:token:${slug}`);
  if (!raw) return null;
  const num = parseInt(raw, 10);
  // Guarantee num > 0, otherwise return null
  return isNaN(num) || num <= 0 ? null : num;
}

export function setLocalStorageToken(slug, token) {
  if (token && token > 0) {
    localStorage.setItem(`queueless:token:${slug}`, String(token));
  } else {
    localStorage.removeItem(`queueless:token:${slug}`);
  }
}

export function removeLocalStorageToken(slug) {
  localStorage.removeItem(`queueless:token:${slug}`);
}

/**
 * Generates and downloads a visual PNG Token Pass ticket
 */
export function downloadTokenPass(myToken, zoneName, slug) {
  const canvas = document.createElement('canvas');
  canvas.width = 600;
  canvas.height = 760;
  const ctx = canvas.getContext('2d');

  // Background gradient (Dark modern theme)
  const grad = ctx.createLinearGradient(0, 0, 0, 760);
  grad.addColorStop(0, '#0f172a');
  grad.addColorStop(1, '#1e1b4b');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 600, 760);

  // Outer glowing border
  ctx.strokeStyle = '#6366f1';
  ctx.lineWidth = 4;
  ctx.strokeRect(20, 20, 560, 720);

  // Header Title
  ctx.fillStyle = '#818cf8';
  ctx.font = 'bold 24px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('QUEUELESS VIRTUAL TOKEN PASS', 300, 75);

  // Counter Zone
  ctx.fillStyle = '#94a3b8';
  ctx.font = 'bold 18px sans-serif';
  ctx.fillText(`${(zoneName || 'Service').toUpperCase()} COUNTER`, 300, 115);

  // Divider Line
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(60, 140);
  ctx.lineTo(540, 140);
  ctx.stroke();

  // EXPLICIT "THIS IS YOUR TOKEN" TEXT
  ctx.fillStyle = '#10b981';
  ctx.font = 'bold 22px sans-serif';
  ctx.fillText('THIS IS YOUR TOKEN', 300, 195);

  // Big Token Number Card
  ctx.fillStyle = '#020617';
  ctx.fillRect(80, 220, 440, 150);
  ctx.strokeStyle = '#10b981';
  ctx.lineWidth = 3;
  ctx.strokeRect(80, 220, 440, 150);

  ctx.fillStyle = '#34d399';
  ctx.font = '900 95px sans-serif';
  ctx.fillText(`#${myToken}`, 300, 330);

  // Instructions
  ctx.fillStyle = '#e2e8f0';
  ctx.font = '600 16px sans-serif';
  ctx.fillText(`Present this token pass at the ${zoneName || 'Service'} counter.`, 300, 410);

  // Details Box
  ctx.fillStyle = '#090d16';
  ctx.fillRect(60, 440, 480, 145);
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(60, 440, 480, 145);

  ctx.fillStyle = '#94a3b8';
  ctx.font = '14px monospace';
  ctx.textAlign = 'left';
  const issuedTime = new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });
  ctx.fillText(`Issued Date & Time : ${issuedTime}`, 90, 480);
  ctx.fillText(`Counter Zone       : ${zoneName || slug}`, 90, 515);
  ctx.fillText(`Token Status       : VALID / ACTIVE PASS`, 90, 550);

  // Simulated Barcode
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(80, 615, 440, 50);
  ctx.fillStyle = '#000000';
  for (let x = 90; x < 510; x += 6) {
    if ((x / 6) % 3 !== 0) {
      ctx.fillRect(x, 620, (x % 4 === 0 ? 3 : 2), 40);
    }
  }

  // Footer Reference Code
  ctx.fillStyle = '#64748b';
  ctx.font = '12px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(`TOKEN-${(slug || 'PASS').toUpperCase()}-${myToken}-${Date.now().toString().slice(-6)}`, 300, 695);

  // Initiate automatic file download
  const link = document.createElement('a');
  link.download = `Token-${slug || 'pass'}-${myToken}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
}

