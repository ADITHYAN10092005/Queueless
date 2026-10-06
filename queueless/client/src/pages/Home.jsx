import React from 'react';
import { usePolling } from '../lib/usePolling';
import { fetchZones } from '../lib/api';
import ZoneCard from '../components/ZoneCard';
import { Sparkles, WifiOff, RefreshCw, Layers } from 'lucide-react';

export default function Home() {
  const { data: zones, loading, isReconnecting, refetch } = usePolling(fetchZones, 3000);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Reconnecting Banner */}
      {isReconnecting && (
        <div className="sticky top-20 z-50 flex items-center justify-between rounded-xl bg-amber-500/10 p-4 border border-amber-500/30 text-amber-300 backdrop-blur-md shadow-lg animate-pulse-subtle">
          <div className="flex items-center gap-3">
            <WifiOff className="h-5 w-5 text-amber-400 animate-bounce" />
            <div>
              <p className="text-sm font-semibold">Connection interrupted</p>
              <p className="text-xs text-amber-400/80">Reconnecting to server for live queue updates...</p>
            </div>
          </div>
          <button
            onClick={() => refetch()}
            className="flex items-center gap-1 rounded-lg bg-amber-500/20 px-3 py-1.5 text-xs font-semibold text-amber-200 hover:bg-amber-500/30 transition-colors border border-amber-500/30"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Retry
          </button>
        </div>
      )}

      {/* Hero Header */}
      <div className="text-center space-y-4 max-w-2xl mx-auto pt-4">
        <div className="inline-flex items-center gap-2 rounded-full bg-indigo-500/10 px-4 py-1.5 text-xs font-semibold text-indigo-400 border border-indigo-500/20">
          <Sparkles className="h-3.5 w-3.5" /> Skip the physical lines
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white">
          Virtual Queuing for Campus & Offices
        </h1>
        <p className="text-base sm:text-lg text-slate-400 font-medium">
          Select a zone below, grab your digital token, and walk away until your turn arrives.
        </p>
      </div>

      {/* Main Grid */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-200 flex items-center gap-2">
            <Layers className="h-5 w-5 text-indigo-400" /> Active Service Zones
          </h2>
          <span className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span> Live Updates (3s)
          </span>
        </div>

        {loading && !zones ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-64 rounded-2xl border border-slate-800 bg-slate-900/50 p-6 animate-pulse flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="h-6 w-1/2 bg-slate-800 rounded"></div>
                  <div className="h-16 bg-slate-800/60 rounded-xl"></div>
                </div>
                <div className="h-6 bg-slate-800 rounded"></div>
              </div>
            ))}
          </div>
        ) : zones && zones.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {zones.map((zone) => (
              <ZoneCard key={zone.slug} zone={zone} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 rounded-2xl border border-slate-800 bg-slate-900/40 p-8">
            <p className="text-slate-400 text-lg">No service zones available right now.</p>
          </div>
        )}
      </div>
    </div>
  );
}
