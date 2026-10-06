import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, Users, ArrowRight, CheckCircle2 } from 'lucide-react';
import { calculatePeopleWaiting } from '../lib/api';

export default function ZoneCard({ zone }) {
  const peopleWaiting = calculatePeopleWaiting(zone);

  return (
    <Link
      to={`/zone/${zone.slug}`}
      className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80 p-6 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-indigo-500/50 hover:bg-slate-900 hover:shadow-xl hover:shadow-indigo-500/10"
    >
      <div className="absolute top-0 right-0 h-24 w-24 rounded-full bg-indigo-500/5 blur-2xl transition-all group-hover:bg-indigo-500/15"></div>

      <div>
        {/* Header */}
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-xl font-bold text-white tracking-tight group-hover:text-indigo-400 transition-colors">
            {zone.name}
          </h3>
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-800/80 px-2.5 py-1 text-xs font-medium text-slate-400 border border-slate-700/50">
            <Clock className="h-3.5 w-3.5 text-indigo-400" />
            {zone.avgTimePerPerson}m / person
          </span>
        </div>

        {/* Current Token Served */}
        <div className="mt-6 flex items-baseline justify-between rounded-xl bg-slate-950/60 p-4 border border-slate-800/80">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Currently Serving</p>
            <p className="text-3xl font-extrabold text-white tracking-tight mt-0.5">
              {zone.currentToken > 0 ? (
                <span className="text-indigo-400">#{zone.currentToken}</span>
              ) : (
                <span className="text-slate-500 text-2xl font-semibold">None</span>
              )}
            </p>
          </div>

          <div className="text-right">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Last Token</p>
            <p className="text-lg font-semibold text-slate-300 mt-0.5">
              #{zone.lastTokenGiven}
            </p>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-6 flex items-center justify-between pt-4 border-t border-slate-800/60">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            {peopleWaiting > 0 ? (
              <>
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
              </>
            ) : (
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            )}
          </span>
          <span className="text-sm font-medium text-slate-300">
            {peopleWaiting > 0 ? (
              <span className="text-amber-400 font-semibold">{peopleWaiting} waiting</span>
            ) : (
              <span className="text-emerald-400 font-medium">Queue Empty</span>
            )}
          </span>
        </div>

        <span className="inline-flex items-center text-sm font-semibold text-indigo-400 group-hover:translate-x-1 transition-transform">
          Join Queue <ArrowRight className="ml-1 h-4 w-4" />
        </span>
      </div>
    </Link>
  );
}
