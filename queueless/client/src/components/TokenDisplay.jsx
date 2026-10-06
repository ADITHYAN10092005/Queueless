import React from 'react';
import { Users, Clock, Sparkles, AlertCircle, CheckCircle2, Printer, Ticket, ShieldCheck, Download } from 'lucide-react';
import { calculatePeopleAhead, calculateEstimatedWait, downloadTokenPass } from '../lib/api';

export default function TokenDisplay({ myToken, zone, onCancelToken }) {
  const peopleAhead = calculatePeopleAhead(myToken, zone.currentToken);
  const estimatedWait = calculateEstimatedWait(peopleAhead, zone.avgTimePerPerson);

  const isYourTurn = peopleAhead === 0;
  const isNext = peopleAhead === 1;

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    downloadTokenPass(myToken, zone.name, zone.slug);
  };

  const formattedDate = new Date().toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      {/* --- Print-Only Thermal Receipt Slip (For window.print()) --- */}
      <div className="print-slip text-center text-black font-sans">
        <div className="border-b-2 border-black pb-3 mb-3">
          <h2 className="text-2xl font-extrabold uppercase tracking-wide">QueueLess Token Pass</h2>
          <p className="text-xs font-bold uppercase tracking-widest text-gray-700 mt-1">{zone.name} Counter</p>
        </div>

        <div className="my-4">
          <p className="text-sm font-bold uppercase tracking-wider text-gray-600">This Is Your Token</p>
          <p className="text-6xl font-black my-2 tracking-tight">#{myToken}</p>
        </div>

        <div className="border-t border-b border-dashed border-black py-3 my-3 text-xs space-y-1 text-left">
          <div className="flex justify-between">
            <span className="font-semibold text-gray-700">Issued At:</span>
            <span className="font-mono">{formattedDate}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold text-gray-700">Currently Serving:</span>
            <span className="font-bold">{zone.currentToken > 0 ? `#${zone.currentToken}` : 'None'}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold text-gray-700">People Ahead:</span>
            <span className="font-bold">{peopleAhead}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold text-gray-700">Est. Wait Time:</span>
            <span className="font-bold">{estimatedWait > 0 ? `~${estimatedWait} min` : 'Immediate'}</span>
          </div>
        </div>

        <div className="mt-4 pt-2 text-center">
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-800">
            Please show this token slip to staff at the counter.
          </p>
        </div>
      </div>

      {/* --- Interactive Screen Digital Pass Card --- */}
      <div
        className={`no-print relative overflow-hidden rounded-3xl border p-6 sm:p-8 text-center transition-all duration-500 backdrop-blur-xl ${
          isYourTurn
            ? 'border-emerald-500/50 bg-emerald-950/40 glow-card-green ring-2 ring-emerald-500/30'
            : isNext
            ? 'border-blue-500/50 bg-blue-950/40 glow-card ring-2 ring-blue-500/30'
            : 'border-amber-500/40 bg-slate-900/90 glow-card-amber'
        }`}
      >
        {/* Background glow circle */}
        <div
          className={`absolute -top-12 -right-12 h-40 w-40 rounded-full blur-3xl opacity-20 ${
            isYourTurn ? 'bg-emerald-400' : isNext ? 'bg-blue-400' : 'bg-amber-400'
          }`}
        ></div>

        {/* Status Header Badge */}
        <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider mb-4 border">
          {isYourTurn ? (
            <span className="flex items-center gap-1.5 text-emerald-400 border-emerald-500/30 bg-emerald-500/10 px-3 py-1 rounded-full border">
              <Sparkles className="h-4 w-4 animate-bounce" /> It's Your Turn! 🎉
            </span>
          ) : isNext ? (
            <span className="flex items-center gap-1.5 text-blue-400 border-blue-500/30 bg-blue-500/10 px-3 py-1 rounded-full border">
              <AlertCircle className="h-4 w-4 animate-pulse" /> You're Next!
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-amber-400 border-amber-500/30 bg-amber-500/10 px-3 py-1 rounded-full border">
              <Clock className="h-4 w-4" /> Waiting in Queue
            </span>
          )}
        </div>

        {/* DIGITAL PASS HEADER BANNER */}
        <div className="rounded-2xl bg-indigo-500/10 border border-indigo-500/20 p-3 mb-6">
          <p className="text-xs font-bold uppercase tracking-widest text-indigo-300 flex items-center justify-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-indigo-400" /> Digital Counter Pass
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">Show this token screen to staff at {zone.name}</p>
        </div>

        {/* --- EXPLICIT BOLD "THIS IS YOUR TOKEN" CARD --- */}
        <div className="my-4 p-6 rounded-3xl bg-slate-950/90 border-2 border-emerald-500/60 shadow-2xl text-center space-y-2">
          <p className="text-sm sm:text-base font-extrabold uppercase tracking-widest text-emerald-400 flex items-center justify-center gap-1.5">
            <Ticket className="h-5 w-5 text-emerald-400" /> This Is Your Token
          </p>
          <div className="flex items-center justify-center py-2">
            <span
              className={`text-8xl sm:text-9xl font-black tracking-tight ${
                isYourTurn
                  ? 'text-emerald-400 drop-shadow-[0_0_35px_rgba(52,211,153,0.7)]'
                  : isNext
                  ? 'text-blue-400 drop-shadow-[0_0_35px_rgba(96,165,250,0.7)]'
                  : 'text-amber-400 drop-shadow-[0_0_25px_rgba(245,158,11,0.5)]'
              }`}
            >
              #{myToken}
            </span>
          </div>
          <p className="text-xs font-semibold text-slate-300">
            Show this number at the <span className="text-white font-bold">{zone.name}</span> counter
          </p>
        </div>

        {/* Barcode Visual Representation */}
        <div className="my-4 px-4">
          <div className="h-10 bg-white rounded-lg p-1.5 flex items-center justify-between opacity-90">
            <div className="flex items-center space-x-1 w-full justify-center">
              {Array.from({ length: 28 }).map((_, i) => (
                <div
                  key={i}
                  className={`h-7 bg-black rounded-xs ${
                    i % 3 === 0 ? 'w-1.5' : i % 5 === 0 ? 'w-1' : 'w-0.5'
                  }`}
                ></div>
              ))}
            </div>
          </div>
          <p className="text-[10px] font-mono text-slate-400 mt-1 uppercase tracking-widest">
            TOKEN-{zone.slug.toUpperCase()}-{myToken}
          </p>
        </div>

        {/* Primary Action Button: Download */}
        <div className="my-6">
          <button
            onClick={handleDownload}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-600 to-emerald-600 text-white font-extrabold text-base uppercase tracking-wider shadow-lg shadow-emerald-500/20 hover:from-emerald-400 hover:to-teal-500 transition-all transform active:scale-95 flex items-center justify-center gap-2 border border-emerald-400/40"
          >
            <Download className="h-5 w-5 text-white" /> Download Token Pass
          </button>
        </div>

        {/* Live Status Callout Banner */}
        <div className="mt-4">
          {isYourTurn ? (
            <div className="rounded-2xl bg-emerald-500/20 p-4 border border-emerald-500/30 text-emerald-200">
              <p className="text-base font-bold flex items-center justify-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                Please proceed to the {zone.name} counter now!
              </p>
            </div>
          ) : isNext ? (
            <div className="rounded-2xl bg-blue-500/20 p-4 border border-blue-500/30 text-blue-200">
              <p className="text-base font-semibold">Get ready! You are the next person in line.</p>
            </div>
          ) : (
            <div className="rounded-2xl bg-slate-950/60 p-4 border border-slate-800 text-slate-300">
              <p className="text-sm font-medium">Keep this token open or printed to present at the counter.</p>
            </div>
          )}
        </div>

        {/* Stats Grid */}
        <div className="mt-6 grid grid-cols-3 gap-3 pt-6 border-t border-slate-800/80">
          <div className="rounded-xl bg-slate-950/50 p-3 border border-slate-800/50">
            <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">Serving Now</p>
            <p className="mt-1 text-lg font-bold text-slate-200">
              {zone.currentToken > 0 ? `#${zone.currentToken}` : 'None'}
            </p>
          </div>

          <div className="rounded-xl bg-slate-950/50 p-3 border border-slate-800/50">
            <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">People Ahead</p>
            <p className={`mt-1 text-lg font-bold ${isYourTurn ? 'text-emerald-400' : 'text-amber-400'}`}>
              {peopleAhead}
            </p>
          </div>

          <div className="rounded-xl bg-slate-950/50 p-3 border border-slate-800/50">
            <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">Est. Wait</p>
            <p className="mt-1 text-lg font-bold text-slate-200">
              {estimatedWait > 0 ? `~${estimatedWait} min` : '0 min'}
            </p>
          </div>
        </div>

        {/* Release / Take New Token option */}
        {onCancelToken && (
          <div className="mt-6 pt-4 border-t border-slate-800/60">
            <button
              onClick={onCancelToken}
              className="text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors underline decoration-slate-600 underline-offset-4"
            >
              Release / Take New Token
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
