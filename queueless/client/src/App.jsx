import React from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import TakeToken from './pages/TakeToken';
import Admin from './pages/Admin';
import { Ticket, ShieldCheck, Home as HomeIcon } from 'lucide-react';

function Navbar() {
  const location = useLocation();

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <Ticket className="h-5 w-5 text-white" />
          </div>
          <div>
            <span className="text-xl font-extrabold tracking-tight text-white">QueueLess</span>
            <span className="hidden sm:inline-block ml-2 text-xs font-semibold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
              Virtual Queue
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="flex items-center gap-2">
          <Link
            to="/"
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-colors ${
              location.pathname === '/'
                ? 'bg-slate-900 text-white border border-slate-800'
                : 'text-slate-400 hover:text-white hover:bg-slate-900/50'
            }`}
          >
            <HomeIcon className="h-4 w-4" /> Home
          </Link>

          <Link
            to="/admin"
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-colors ${
              location.pathname === '/admin'
                ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-900/50'
            }`}
          >
            <ShieldCheck className="h-4 w-4 text-indigo-400" /> Admin
          </Link>
        </nav>
      </div>
    </header>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
        <Navbar />
        <main className="flex-1 pb-16">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/zone/:slug" element={<TakeToken />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </main>

        <footer className="border-t border-slate-900 py-6 text-center text-xs text-slate-500">
          <p>© {new Date().getFullYear()} QueueLess — Real-time Virtual Queue Token System</p>
        </footer>
      </div>
    </BrowserRouter>
  );
}
