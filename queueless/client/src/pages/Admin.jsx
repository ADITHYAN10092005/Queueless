import React, { useState } from 'react';
import { usePolling } from '../lib/usePolling';
import { fetchZones, serveNextToken, resetZone, takeToken, calculatePeopleWaiting } from '../lib/api';
import { ShieldCheck, Lock, ChevronRight, RotateCcw, AlertCircle, Check, Users, Clock, Printer, Ticket } from 'lucide-react';

export default function Admin() {
  const [pinInput, setPinInput] = useState('');
  const [activePin, setActivePin] = useState('');
  const [authError, setAuthError] = useState('');
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');
  const [actionLoading, setActionLoading] = useState(null);
  const [printedSlip, setPrintedSlip] = useState(null);

  // Poll zones data if authenticated
  const { data: zones, loading, refetch } = usePolling(
    async () => {
      if (!activePin) return null;
      return fetchZones();
    },
    3000,
    [activePin]
  );

  const handlePinSubmit = (e) => {
    e.preventDefault();
    if (!pinInput.trim()) return;
    setAuthError('');
    setActionError('');
    setActivePin(pinInput.trim());
  };

  const handleNext = async (slug, currentToken, lastTokenGiven) => {
    if (currentToken >= lastTokenGiven) return;
    try {
      setActionLoading(`next:${slug}`);
      setActionError('');
      setActionSuccess('');
      await serveNextToken(slug, activePin);
      setActionSuccess(`Served next token for ${slug}!`);
      setTimeout(() => setActionSuccess(''), 3000);
      refetch();
    } catch (err) {
      if (err.status === 401) {
        setAuthError('Invalid Admin PIN. Please enter correct PIN to continue.');
        setActivePin('');
      } else {
        setActionError(err.message || 'Failed to serve next token');
      }
    } finally {
      setActionLoading(null);
    }
  };

  const handleReset = async (slug, zoneName) => {
    const confirmed = window.confirm(
      `Are you sure you want to reset the queue for "${zoneName}"? This will set tokens back to 0.`
    );
    if (!confirmed) return;

    try {
      setActionLoading(`reset:${slug}`);
      setActionError('');
      setActionSuccess('');
      await resetZone(slug, activePin);
      setActionSuccess(`Reset queue for ${zoneName}!`);
      setTimeout(() => setActionSuccess(''), 3000);
      refetch();
    } catch (err) {
      if (err.status === 401) {
        setAuthError('Invalid Admin PIN. Please enter correct PIN to continue.');
        setActivePin('');
      } else {
        setActionError(err.message || 'Failed to reset queue');
      }
    } finally {
      setActionLoading(null);
    }
  };

  // Staff action: Issue a token for walk-in user and open print dialog
  const handleIssueAndPrint = async (slug, zoneName) => {
    try {
      setActionLoading(`print:${slug}`);
      setActionError('');
      setActionSuccess('');
      const res = await takeToken(slug);
      const slipData = {
        token: res.token,
        zoneName,
        currentToken: res.zone.currentToken,
        dateStr: new Date().toLocaleString(),
      };
      setPrintedSlip(slipData);
      setActionSuccess(`Issued Token #${res.token} for ${zoneName}! Printing...`);
      setTimeout(() => {
        window.print();
      }, 300);
      refetch();
    } catch (err) {
      setActionError(err.message || 'Failed to issue token');
    } finally {
      setActionLoading(null);
    }
  };

  // STEP 1: PIN Prompt Screen
  if (!activePin || authError) {
    return (
      <div className="max-w-md mx-auto px-4 py-16">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-8 shadow-2xl backdrop-blur-xl space-y-6">
          <div className="text-center space-y-3">
            <div className="inline-flex p-4 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Lock className="h-8 w-8" />
            </div>
            <h1 className="text-2xl font-bold text-white">Staff Admin Access</h1>
            <p className="text-sm text-slate-400">
              Enter the staff administrator PIN to manage queues and call tokens.
            </p>
          </div>

          {authError && (
            <div className="flex items-center gap-2 rounded-xl bg-red-500/10 p-3.5 border border-red-500/30 text-red-400 text-sm">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handlePinSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Admin PIN
              </label>
              <input
                type="password"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                placeholder="Enter PIN (Default: 1234)"
                className="w-full rounded-xl bg-slate-950 px-4 py-3.5 text-white placeholder-slate-600 border border-slate-800 focus:border-indigo-500 focus:outline-none font-mono text-center tracking-widest text-lg"
                autoFocus
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2"
            >
              <ShieldCheck className="h-4 w-4" /> Unlock Staff Dashboard
            </button>
          </form>

          <p className="text-xs text-center text-slate-400">
            Default PIN is <code className="bg-slate-950 px-1.5 py-0.5 rounded text-indigo-300">1234</code>
          </p>
        </div>
      </div>
    );
  }

  // STEP 2: Authenticated Staff Dashboard
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* Hidden printable slip for admin walk-in tokens */}
      {printedSlip && (
        <div className="hidden print:block print-slip text-center text-black">
          <div className="border-b-2 border-black pb-3 mb-3">
            <h2 className="text-xl font-extrabold uppercase tracking-wide">QueueLess Slip</h2>
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-600 mt-1">{printedSlip.zoneName} Counter</p>
          </div>

          <div className="my-4">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Walk-In Token Number</p>
            <p className="text-6xl font-black my-2">#{printedSlip.token}</p>
          </div>

          <div className="border-t border-b border-dashed border-black py-3 my-3 text-xs space-y-1">
            <div className="flex justify-between">
              <span className="font-semibold">Issued At:</span>
              <span>{printedSlip.dateStr}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold">Serving Now:</span>
              <span>#{printedSlip.currentToken}</span>
            </div>
          </div>

          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-700 mt-4">
            Please wait for your token number to be called.
          </p>
        </div>
      )}

      {/* Top Banner */}
      <div className="no-print flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-2xl bg-slate-900/90 border border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
            <ShieldCheck className="h-4 w-4" /> Staff Session Active
          </div>
          <h1 className="text-2xl font-bold text-white">Queue Control Dashboard</h1>
        </div>

        <button
          onClick={() => {
            setActivePin('');
            setPinInput('');
          }}
          className="text-xs font-semibold text-slate-400 hover:text-white px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 transition-colors"
        >
          Lock Dashboard
        </button>
      </div>

      {actionError && (
        <div className="no-print p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
          {actionError}
        </div>
      )}

      {actionSuccess && (
        <div className="no-print flex items-center gap-2 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-semibold">
          <Check className="h-4 w-4" /> {actionSuccess}
        </div>
      )}

      {/* Zone Control List */}
      <div className="no-print space-y-4">
        <h2 className="text-lg font-bold text-slate-200">Manage Zones</h2>

        {loading && !zones ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-28 rounded-2xl bg-slate-900/50 animate-pulse border border-slate-800"></div>
            ))}
          </div>
        ) : zones && zones.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {zones.map((zone) => {
              const peopleWaiting = calculatePeopleWaiting(zone);
              const isNobodyWaiting = peopleWaiting === 0;

              return (
                <div
                  key={zone.slug}
                  className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all backdrop-blur-xl"
                >
                  {/* Zone Details */}
                  <div className="space-y-1">
                    <h3 className="text-xl font-bold text-white">{zone.name}</h3>
                    <p className="text-xs text-slate-400 flex items-center gap-2">
                      <span>Slug: <code className="text-indigo-400 font-mono">{zone.slug}</code></span>
                      <span>•</span>
                      <span>Avg time: {zone.avgTimePerPerson} min</span>
                    </p>
                  </div>

                  {/* Token Status Counter Metrics */}
                  <div className="grid grid-cols-3 gap-3 bg-slate-950/80 p-3 rounded-xl border border-slate-800/80">
                    <div className="text-center">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Current Token</p>
                      <p className="text-lg font-extrabold text-indigo-400 mt-0.5">
                        {zone.currentToken > 0 ? `#${zone.currentToken}` : '0'}
                      </p>
                    </div>

                    <div className="text-center border-x border-slate-800">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Last Token</p>
                      <p className="text-lg font-bold text-slate-300 mt-0.5">#{zone.lastTokenGiven}</p>
                    </div>

                    <div className="text-center">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Waiting</p>
                      <p className={`text-lg font-extrabold mt-0.5 ${isNobodyWaiting ? 'text-slate-500' : 'text-amber-400'}`}>
                        {peopleWaiting}
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap items-center gap-2.5">
                    {/* Next Button */}
                    <button
                      onClick={() => handleNext(zone.slug, zone.currentToken, zone.lastTokenGiven)}
                      disabled={isNobodyWaiting || actionLoading === `next:${zone.slug}`}
                      className="py-3 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 disabled:cursor-not-allowed text-white font-bold text-sm shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-2"
                    >
                      {actionLoading === `next:${zone.slug}` ? (
                        <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <>
                          Next Token <ChevronRight className="h-4 w-4" />
                        </>
                      )}
                    </button>

                    {/* Staff Issue & Print Button */}
                    <button
                      onClick={() => handleIssueAndPrint(zone.slug, zone.name)}
                      disabled={actionLoading === `print:${zone.slug}`}
                      className="py-3 px-4 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 font-semibold text-xs transition-all flex items-center gap-1.5"
                      title="Issue a token and print slip for walk-in user"
                    >
                      {actionLoading === `print:${zone.slug}` ? (
                        <div className="h-4 w-4 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <>
                          <Printer className="h-4 w-4 text-emerald-400" /> Issue & Print
                        </>
                      )}
                    </button>

                    {/* Reset Button */}
                    <button
                      onClick={() => handleReset(zone.slug, zone.name)}
                      disabled={actionLoading === `reset:${zone.slug}`}
                      className="py-3 px-3.5 rounded-xl bg-slate-800/80 hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/30 text-slate-400 font-semibold text-xs border border-slate-700/50 transition-all flex items-center gap-1.5"
                      title="Reset current and last token to 0"
                    >
                      <RotateCcw className="h-4 w-4" /> Reset
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 rounded-2xl bg-slate-900 border border-slate-800 text-slate-400">
            No zones found.
          </div>
        )}
      </div>
    </div>
  );
}
