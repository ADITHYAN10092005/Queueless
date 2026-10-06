import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  fetchZone,
  takeToken,
  calculatePeopleWaiting,
  getLocalStorageToken,
  setLocalStorageToken,
  removeLocalStorageToken,
  downloadTokenPass,
} from '../lib/api';
import { usePolling } from '../lib/usePolling';
import TokenDisplay from '../components/TokenDisplay';
import {
  ArrowLeft,
  Clock,
  Users,
  Ticket,
  Printer,
  WifiOff,
  AlertTriangle,
  Sparkles,
  CheckCircle2,
  X,
  ChevronRight,
  Download,
} from 'lucide-react';

export default function TakeToken() {
  const { slug } = useParams();
  const [savedToken, setSavedToken] = useState(() => getLocalStorageToken(slug));
  const [takingTokenLoading, setTakingTokenLoading] = useState(false);
  const [actionError, setActionError] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Poll zone details every 3 seconds
  const fetchCurrentZone = () => fetchZone(slug);
  const { data: zone, loading, error, isReconnecting, refetch } = usePolling(
    fetchCurrentZone,
    3000,
    [slug]
  );

  // Update local savedToken state if slug changes
  useEffect(() => {
    setSavedToken(getLocalStorageToken(slug));
  }, [slug]);

  // Handle Stale Token Edge Case:
  // If saved token > lastTokenGiven, the queue was reset! Clear it.
  useEffect(() => {
    if (zone && savedToken !== null && savedToken > 0) {
      if (savedToken > zone.lastTokenGiven) {
        removeLocalStorageToken(slug);
        setSavedToken(null);
      }
    }
  }, [zone, savedToken, slug]);

  const handleGetToken = async () => {
    try {
      setTakingTokenLoading(true);
      setActionError(null);
      const res = await takeToken(slug);
      setLocalStorageToken(slug, res.token);
      setSavedToken(res.token);
      setShowSuccessModal(true);
      refetch();

      // Automatically trigger ticket download when token is generated
      setTimeout(() => {
        downloadTokenPass(res.token, zone?.name, slug);
      }, 300);
    } catch (err) {
      setActionError(err.message || 'Failed to get token');
    } finally {
      setTakingTokenLoading(false);
    }
  };


  const handleClearToken = () => {
    removeLocalStorageToken(slug);
    setSavedToken(null);
    setShowSuccessModal(false);
    refetch();
  };

  // 404 / Missing Zone State
  if (error && error.status === 404) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-6">
        <div className="inline-flex p-4 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
          <AlertTriangle className="h-10 w-10" />
        </div>
        <h2 className="text-2xl font-bold text-white">Zone Not Found</h2>
        <p className="text-slate-400 text-sm">
          The queue zone "<span className="text-slate-200 font-mono">{slug}</span>" does not exist or has been removed.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-xl bg-slate-800 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-700 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Return to Home
        </Link>
      </div>
    );
  }

  // Initial Loading state
  if (loading && !zone) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <div className="h-12 w-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-slate-400 font-medium">Loading queue details...</p>
      </div>
    );
  }

  if (!zone) return null;

  const peopleWaiting = calculatePeopleWaiting(zone);
  const nextTokenNumber = (zone.lastTokenGiven || 0) + 1;
  const isTurnPassed = savedToken !== null && savedToken > 0 && savedToken < zone.currentToken;

  return (
    <div className="max-w-xl mx-auto px-4 py-6 space-y-6">
      {/* Back button & Header */}
      <div className="no-print flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center text-sm font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Zones
        </Link>
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 bg-slate-900 px-3 py-1 rounded-full border border-slate-800">
          Zone #{zone.slug}
        </span>
      </div>

      {/* Reconnecting Banner */}
      {isReconnecting && (
        <div className="no-print flex items-center justify-between rounded-xl bg-amber-500/10 p-3 border border-amber-500/30 text-amber-300 text-xs">
          <div className="flex items-center gap-2">
            <WifiOff className="h-4 w-4 text-amber-400" />
            <span>Reconnecting to server...</span>
          </div>
          <button onClick={() => refetch()} className="underline font-semibold">
            Retry
          </button>
        </div>
      )}

      {/* Zone Title Header */}
      <div className="no-print text-center space-y-2">
        <h1 className="text-3xl font-extrabold text-white">{zone.name} Queue</h1>
        <p className="text-sm text-slate-400 flex items-center justify-center gap-3">
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3.5 w-3.5 text-indigo-400" /> ~{zone.avgTimePerPerson}m / person
          </span>
          <span>•</span>
          <span className="inline-flex items-center gap-1">
            <Users className="h-3.5 w-3.5 text-amber-400" /> {peopleWaiting} waiting
          </span>
        </p>
      </div>

      {actionError && (
        <div className="no-print p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm text-center">
          {actionError}
        </div>
      )}

      {/* --- TOKEN GENERATED SUCCESS MODAL POPUP --- */}
      {showSuccessModal && savedToken && (
        <div className="no-print fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-sm rounded-3xl border border-emerald-500/40 bg-slate-900 p-6 text-center shadow-2xl space-y-5 glow-card-green">
            <button
              onClick={() => setShowSuccessModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-full bg-slate-800"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="inline-flex p-3 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <CheckCircle2 className="h-8 w-8" />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-extrabold text-white">Token Generated!</h3>
              <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold">{zone.name} Counter</p>
            </div>

            {/* BOLD THIS IS YOUR TOKEN CARD */}
            <div className="py-5 px-4 rounded-3xl bg-slate-950 border-2 border-emerald-500/60 text-center space-y-1">
              <p className="text-xs font-extrabold uppercase tracking-widest text-emerald-400">This Is Your Token</p>
              <p className="text-7xl font-black text-emerald-400 drop-shadow-[0_0_30px_rgba(52,211,153,0.7)]">#{savedToken}</p>
              <p className="text-xs font-semibold text-slate-300 pt-1">
                Show this number at the <span className="text-white font-bold">{zone.name}</span> counter when called.
              </p>
            </div>

            <div className="space-y-2.5">
              <button
                onClick={() => downloadTokenPass(savedToken, zone.name, slug)}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-sm shadow-lg shadow-emerald-500/20 hover:from-emerald-400 hover:to-teal-500 transition-all flex items-center justify-center gap-2"
              >
                <Download className="h-4 w-4" /> Download Token Pass
              </button>

              <button
                onClick={() => setShowSuccessModal(false)}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 font-semibold text-xs transition-all"
              >
                View Digital Pass
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STATE 1: User's turn has passed */}
      {isTurnPassed ? (
        <div className="no-print rounded-3xl border border-red-500/40 bg-red-950/30 p-8 text-center space-y-6 backdrop-blur-xl">
          <div className="inline-flex p-4 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
            <AlertTriangle className="h-8 w-8" />
          </div>

          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-white">Your turn has passed</h3>
            <p className="text-slate-300 text-sm max-w-xs mx-auto">
              Your token <span className="font-bold text-red-400">#{savedToken}</span> was called while token{' '}
              <span className="font-bold text-slate-100">#{zone.currentToken}</span> is currently being served.
            </p>
          </div>

          <button
            onClick={handleClearToken}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold text-base shadow-lg shadow-indigo-600/30 hover:from-indigo-500 hover:to-violet-500 transition-all transform active:scale-95"
          >
            Take New Token
          </button>
        </div>
      ) : savedToken !== null && savedToken > 0 && savedToken >= zone.currentToken ? (
        /* STATE 2: User has an active token in queue */
        <TokenDisplay myToken={savedToken} zone={zone} onCancelToken={handleClearToken} />
      ) : (
        /* STATE 3: User has no token -> Displays Next Available Token and "Get & Download Token #X" button */
        <div className="no-print rounded-3xl border border-slate-800 bg-slate-900/80 p-8 text-center space-y-8 backdrop-blur-xl glow-card">
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-2xl bg-slate-950/70 p-4 border border-slate-800">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Serving Now</p>
              <p className="mt-1 text-3xl font-extrabold text-indigo-400">
                {zone.currentToken > 0 ? `#${zone.currentToken}` : 'None'}
              </p>
            </div>

            <div className="rounded-2xl bg-slate-950/70 p-4 border border-slate-800">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">In Line</p>
              <p className="mt-1 text-3xl font-extrabold text-amber-400">{peopleWaiting}</p>
            </div>
          </div>

          {/* Next Available Token Box */}
          <div className="py-4 px-6 rounded-2xl bg-slate-950/90 border border-indigo-500/30 text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-indigo-400">Next Available Token</p>
            <p className="text-5xl font-black text-white mt-1">#{nextTokenNumber}</p>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => handleGetToken()}
              disabled={takingTokenLoading}
              className="w-full py-5 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-600 to-indigo-600 text-white font-black text-lg tracking-wide shadow-xl shadow-emerald-500/25 hover:from-emerald-400 hover:to-indigo-500 disabled:opacity-50 transition-all transform active:scale-95 flex items-center justify-center gap-3 border border-emerald-400/30"
            >
              {takingTokenLoading ? (
                <>
                  <div className="h-5 w-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                  Generating Token #{nextTokenNumber}...
                </>
              ) : (
                <>
                  <Ticket className="h-6 w-6" /> Get & Download Token #{nextTokenNumber} <Download className="h-5 w-5 ml-1" />
                </>
              )}
            </button>

            <p className="text-xs text-slate-400">
              Clicking "Get & Download Token #{nextTokenNumber}" assigns your token number and downloads your ticket pass automatically.
            </p>
          </div>
        </div>
      )}

    </div>
  );
}
