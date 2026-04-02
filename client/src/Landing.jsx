import React, { useEffect, useRef, useState } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';

/* ── tiny helpers ───────────────────────────────────────────────── */
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 32 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.55, delay, ease: 'easeOut' },
});

const scaleIn = (delay = 0) => ({
  initial: { opacity: 0, scale: 0.88 },
  whileInView: { opacity: 1, scale: 1 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.5, delay, ease: 'easeOut' },
});

/* ── data ───────────────────────────────────────────────────────── */
const FEATURES = [
  {
    icon: '🎮',
    title: 'Real-Time Multiplayer',
    desc: 'Instant sync via WebSockets. Everything — turns, scores, chat — updates live for every player in the room.',
    color: '#8B5CF6',
    bg: 'rgba(139,92,246,0.08)',
    border: 'rgba(139,92,246,0.2)',
  },
  {
    icon: '💬',
    title: 'WhatsApp-Style Chat',
    desc: 'Send messages, react with emojis, reply to any message with swipe-to-reply, share photos, videos & voice notes.',
    color: '#34D399',
    bg: 'rgba(52,211,153,0.08)',
    border: 'rgba(52,211,153,0.2)',
  },
  {
    icon: '⏱️',
    title: 'Countdown Timer',
    desc: "A 45-second ring timer keeps dares and truths exciting. Auto-skips with a score penalty when time's up.",
    color: '#F59E0B',
    bg: 'rgba(245,158,11,0.08)',
    border: 'rgba(245,158,11,0.2)',
  },
  {
    icon: '🏆',
    title: 'Live Leaderboard',
    desc: 'Earn 10 pts per completed task, lose 5 for skips. Final podium reveals the winner and top darer.',
    color: '#F59E0B',
    bg: 'rgba(251,191,36,0.08)',
    border: 'rgba(251,191,36,0.2)',
  },
  {
    icon: '🔁',
    title: 'No Repeated Questions',
    desc: 'Tracks every question used in a session. You\'ll never get the same dare twice — until every question is exhausted.',
    color: '#F472B6',
    bg: 'rgba(244,114,182,0.08)',
    border: 'rgba(244,114,182,0.2)',
  },
  {
    icon: '🎛️',
    title: 'Full Room Control',
    desc: 'Host sets max players, toggles skip, enables timer, picks question categories — all before the game begins.',
    color: '#60A5FA',
    bg: 'rgba(96,165,250,0.08)',
    border: 'rgba(96,165,250,0.2)',
  },
  {
    icon: '📡',
    title: 'Auto-Reconnect',
    desc: 'Close the tab by accident? Re-open and you\'re instantly back in your room — no need to rejoin manually.',
    color: '#A78BFA',
    bg: 'rgba(167,139,250,0.08)',
    border: 'rgba(167,139,250,0.2)',
  },
  {
    icon: '🛡️',
    title: 'Private Rooms',
    desc: 'Every game generates a unique 6-digit code. Only people you invite can join — fully private sessions.',
    color: '#34D399',
    bg: 'rgba(52,211,153,0.08)',
    border: 'rgba(52,211,153,0.2)',
  },
];

const STEPS = [
  { step: '01', title: 'Create a Room', desc: 'Pick your game mode, categories & settings, then get a unique 6-digit code.' },
  { step: '02', title: 'Invite Friends', desc: 'Share the code via WhatsApp or just copy-paste it. Up to 15 players can join.' },
  { step: '03', title: 'Pick Truth or Dare', desc: 'Each player takes turns choosing. Truths reveal secrets; Dares push limits.' },
  { step: '04', title: 'Complete & Earn', desc: 'Finish a task for +10 pts. Skip costs you −5. Chat, react & have fun throughout.' },
];

const CATEGORIES = [
  { name: 'Funny', icon: '😂', color: '#FBBF24', desc: 'Light-hearted, laugh-out-loud dares & ridiculous truths.' },
  { name: 'Romantic', icon: '❤️', color: '#F472B6', desc: 'Sweet truths and cute dares for couples or friends.' },
  { name: 'Spicy', icon: '🔥', color: '#EF4444', desc: 'Bold, daring challenges for the brave. 18+ style.' },
  { name: 'Emotional', icon: '🧠', color: '#60A5FA', desc: 'Deep, reflective questions that spark real conversations.' },
];

const FAQS = [
  { q: 'How many players can join?', a: 'A room supports up to 15 players. The host can set a lower limit in room settings.' },
  { q: 'Do I need an account?', a: 'No. Just pick a nickname and an emoji avatar — that\'s all you need to play.' },
  { q: 'Can I add my own questions?', a: 'Yes! Hosts can access the Admin Panel to add, remove, or bulk-import custom truths & dares.' },
  { q: 'What happens if someone leaves mid-game?', a: 'The game continues for remaining players. The leave is announced in chat and turns adjust automatically.' },
  { q: 'Is the timer mandatory?', a: 'No. The host can toggle the timer off before starting. Without it, players take as long as they need.' },
  { q: 'What is Skip Allowed?', a: 'When enabled, any player can skip their task at the cost of −5 points. Hosts can disable this to prevent skipping.' },
];

/* ── Floating particle ──────────────────────────────────────────── */
function Particle({ x, y, size, color, duration }) {
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{ left: `${x}%`, top: `${y}%`, width: size, height: size, background: color, filter: 'blur(1px)' }}
      animate={{ y: [0, -24, 0], opacity: [0.3, 0.7, 0.3] }}
      transition={{ duration, repeat: Infinity, ease: 'easeInOut', delay: Math.random() * 3 }}
    />
  );
}

/* ── FAQ item ───────────────────────────────────────────────────── */
function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="border border-white/8 rounded-2xl overflow-hidden cursor-pointer"
      onClick={() => setOpen(o => !o)}
    >
      <div className="flex items-center justify-between px-5 py-4">
        <p className="font-black text-sm uppercase italic tracking-tight">{q}</p>
        <motion.span animate={{ rotate: open ? 45 : 0 }} className="text-white/30 text-xl flex-shrink-0 ml-3">+</motion.span>
      </div>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <p className="px-5 pb-4 text-white/50 text-sm leading-relaxed">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ══════════════════ LANDING PAGE ══════════════════════════════════ */
export default function Landing({ onPlay }) {
  const particles = useRef(
    Array.from({ length: 18 }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 6 + 3,
      color: Math.random() > 0.5 ? 'rgba(139,92,246,0.6)' : 'rgba(245,158,11,0.6)',
      duration: Math.random() * 4 + 3,
    }))
  ).current;

  return (
    <div className="min-h-screen bg-[#010101] text-white overflow-x-hidden">

      {/* ── Ambient blobs ─────────────────────────────────────────── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-32 -right-32 w-[500px] h-[500px] bg-electric-purple/8 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 -left-48 w-[400px] h-[400px] bg-radiant-gold/6 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 right-1/4 w-[300px] h-[300px] bg-electric-purple/5 rounded-full blur-[80px]" />
      </div>

      {/* ── Sticky Nav ────────────────────────────────────────────── */}
      <nav className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 py-4 backdrop-blur-xl bg-black/40 border-b border-white/5">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🎮</span>
          <span className="font-black text-xl italic uppercase tracking-tighter gradient-text">DareMate</span>
        </div>
        <div className="hidden sm:flex items-center gap-6 text-[11px] font-black uppercase tracking-widest text-white/30">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#how" className="hover:text-white transition-colors">How to Play</a>
          <a href="#categories" className="hover:text-white transition-colors">Categories</a>
          <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
        </div>
        <button
          onClick={onPlay}
          className="premium-button-primary h-9 px-5 text-[11px] font-black uppercase italic"
        >
          Play Now ⚡
        </button>
      </nav>

      {/* ── HERO ──────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 pt-24 pb-16 overflow-hidden">
        {particles.map((p, i) => <Particle key={i} {...p} />)}

        <motion.div {...fadeUp(0.1)} className="inline-flex items-center gap-2 px-4 py-2 bg-electric-purple/10 border border-electric-purple/20 rounded-full mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-electric-purple animate-pulse" />
          <span className="text-[11px] font-black uppercase tracking-widest text-electric-purple">Real-Time Truth or Dare</span>
        </motion.div>

        <motion.h1 {...fadeUp(0.2)} className="text-6xl sm:text-8xl font-black italic uppercase tracking-tighter gradient-text leading-none mb-4">
          Dare<br />Mate
        </motion.h1>

        <motion.p {...fadeUp(0.3)} className="text-white/40 text-base sm:text-lg max-w-md font-medium leading-relaxed mb-10">
          The most fun your friend group has ever had. Real-time multiplayer Truth or Dare with chat, timers, scores & zero setup.
        </motion.p>

        <motion.div {...fadeUp(0.4)} className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-xs sm:max-w-none sm:w-auto">
          <button
            onClick={onPlay}
            className="w-full sm:w-auto premium-button-primary h-14 px-10 text-base font-black uppercase italic shadow-xl shadow-electric-purple/25"
          >
            Start Playing — It's Free 🎮
          </button>
          <a href="#how" className="w-full sm:w-auto h-14 px-10 flex items-center justify-center premium-button-secondary text-sm font-black uppercase italic">
            How it Works ↓
          </a>
        </motion.div>

        {/* Stats bar */}
        <motion.div {...fadeUp(0.5)} className="mt-16 flex items-center gap-8 sm:gap-16">
          {[['15', 'Max Players'], ['4', 'Categories'], ['45s', 'Timer'], ['0', 'Sign-ups Needed']].map(([val, label]) => (
            <div key={label} className="text-center">
              <p className="text-2xl sm:text-3xl font-black gradient-text">{val}</p>
              <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-white/20 mt-0.5">{label}</p>
            </div>
          ))}
        </motion.div>

        {/* Scroll hint */}
        <motion.div
          animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 opacity-20"
        >
          <div className="w-px h-8 bg-white" />
          <span className="text-[8px] font-black uppercase tracking-widest">Scroll</span>
        </motion.div>
      </section>

      {/* ── FEATURES ──────────────────────────────────────────────── */}
      <section id="features" className="relative z-10 max-w-6xl mx-auto px-6 py-24">
        <motion.div {...fadeUp(0)} className="text-center mb-14">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-electric-purple/60 mb-3">Everything Built In</p>
          <h2 className="text-4xl sm:text-5xl font-black italic uppercase tracking-tighter">
            Packed with <span className="gradient-text">Features</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              {...scaleIn(i * 0.05)}
              whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
              className="p-5 rounded-2xl border transition-all cursor-default group"
              style={{ background: f.bg, borderColor: f.border }}
            >
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="font-black uppercase italic text-sm tracking-tight mb-2" style={{ color: f.color }}>{f.title}</h3>
              <p className="text-white/40 text-xs leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── HOW TO PLAY ───────────────────────────────────────────── */}
      <section id="how" className="relative z-10 py-24 bg-white/[0.015] border-y border-white/5">
        <div className="max-w-5xl mx-auto px-6">
          <motion.div {...fadeUp(0)} className="text-center mb-16">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-radiant-gold/60 mb-3">Simple & Fun</p>
            <h2 className="text-4xl sm:text-5xl font-black italic uppercase tracking-tighter">
              How to <span className="gradient-text">Play</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            {/* connector line */}
            <div className="hidden lg:block absolute top-10 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-electric-purple/20 via-radiant-gold/20 to-electric-purple/20" />

            {STEPS.map((s, i) => (
              <motion.div key={s.step} {...fadeUp(i * 0.1)} className="flex flex-col items-center text-center gap-4">
                <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-electric-purple/20 to-radiant-gold/10 border border-white/10 flex items-center justify-center shadow-lg z-10">
                  <span className="text-4xl font-black italic text-white/10 absolute">{s.step}</span>
                  <span className="text-lg font-black italic gradient-text relative">{s.step}</span>
                </div>
                <div>
                  <h3 className="font-black uppercase italic tracking-tight mb-1">{s.title}</h3>
                  <p className="text-white/40 text-xs leading-relaxed">{s.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CATEGORIES ────────────────────────────────────────────── */}
      <section id="categories" className="relative z-10 max-w-5xl mx-auto px-6 py-24">
        <motion.div {...fadeUp(0)} className="text-center mb-14">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-electric-purple/60 mb-3">Mix & Match</p>
          <h2 className="text-4xl sm:text-5xl font-black italic uppercase tracking-tighter">
            4 <span className="gradient-text">Categories</span>
          </h2>
          <p className="text-white/30 text-sm mt-3 font-medium">Hosts can combine multiple categories for the ultimate mix.</p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {CATEGORIES.map((c, i) => (
            <motion.div
              key={c.name}
              {...scaleIn(i * 0.1)}
              whileHover={{ scale: 1.02 }}
              className="flex items-center gap-5 p-6 rounded-3xl border backdrop-blur-sm"
              style={{ background: `${c.color}08`, borderColor: `${c.color}25` }}
            >
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0 shadow-lg"
                style={{ background: `${c.color}15`, border: `1px solid ${c.color}30` }}
              >
                {c.icon}
              </div>
              <div>
                <h3 className="font-black uppercase italic text-lg tracking-tight" style={{ color: c.color }}>{c.name}</h3>
                <p className="text-white/40 text-xs mt-1 leading-relaxed">{c.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── CHAT HIGHLIGHT ────────────────────────────────────────── */}
      <section className="relative z-10 py-24 bg-white/[0.015] border-y border-white/5">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div {...fadeUp(0)}>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-green-400/60 mb-3">Not Just a Game</p>
            <h2 className="text-4xl sm:text-5xl font-black italic uppercase tracking-tighter mb-4">
              A Full <span className="gradient-text">Chat Room</span>
            </h2>
            <p className="text-white/40 leading-relaxed mb-6">
              The chat isn't an afterthought. It's a first-class WhatsApp-style experience built right into the game.
            </p>
            <ul className="space-y-3">
              {[
                ['💬', 'Send text messages in real-time'],
                ['📸', 'Share images & videos mid-game'],
                ['🎤', 'Record & send voice notes'],
                ['↩️', 'Swipe to reply to any message'],
                ['😂', 'React with 8 emoji reactions'],
                ['⌨️', 'Live typing indicators'],
              ].map(([icon, text]) => (
                <li key={text} className="flex items-center gap-3 text-sm text-white/60">
                  <span className="text-base">{icon}</span>
                  <span>{text}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Mock chat UI */}
          <motion.div {...scaleIn(0.15)} className="glass-card p-5 space-y-3 max-w-xs mx-auto lg:ml-auto">
            <div className="flex items-center gap-2 border-b border-white/5 pb-3 mb-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-white/30">Live Chat</span>
            </div>
            {[
              { name: 'Alex 🦁', msg: 'I dare you to do a push-up!', mine: false, time: '8:41' },
              { name: 'You 🦊', msg: 'Challenge accepted 💪', mine: true, time: '8:41' },
              { type: 'system', msg: '🎮 Alex completed the dare! +10 pts' },
              { name: 'Sara 🦄', msg: 'Ayyyy 🔥🔥🔥', mine: false, time: '8:42' },
              { name: 'You 🦊', msg: '😂', mine: true, time: '8:42', react: true },
            ].map((m, i) => {
              if (m.type === 'system') return (
                <div key={i} className="flex justify-center">
                  <span className="px-3 py-1 bg-white/5 rounded-full text-[9px] text-white/30 font-bold">{m.msg}</span>
                </div>
              );
              return (
                <div key={i} className={`flex flex-col ${m.mine ? 'items-end' : 'items-start'}`}>
                  <span className="text-[8px] text-white/20 font-bold px-1 mb-0.5">{m.name} · {m.time}</span>
                  <div className={`px-3 py-2 rounded-2xl text-xs max-w-[80%] ${m.mine ? 'bg-electric-purple text-white rounded-tr-sm' : 'bg-white/8 text-white/80 rounded-tl-sm border border-white/8'}`}>
                    {m.msg}
                  </div>
                  {m.react && (
                    <div className="flex gap-1 mt-1">
                      {['🔥', '👏'].map(e => (
                        <span key={e} className="px-1.5 py-0.5 bg-black/30 border border-white/5 rounded-full text-[9px]">{e} 1</span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
            <div className="flex items-center gap-2 bg-white/[0.04] border border-white/8 rounded-2xl px-3 py-2 mt-2">
              <input disabled className="flex-1 bg-transparent text-xs placeholder:text-white/20 outline-none" placeholder="Say something…" />
              <div className="w-6 h-6 bg-electric-purple rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-[10px]">→</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────────── */}
      <section id="faq" className="relative z-10 max-w-2xl mx-auto px-6 py-24">
        <motion.div {...fadeUp(0)} className="text-center mb-12">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-electric-purple/60 mb-3">Got Questions?</p>
          <h2 className="text-4xl sm:text-5xl font-black italic uppercase tracking-tighter">
            <span className="gradient-text">FAQ</span>
          </h2>
        </motion.div>
        <motion.div {...fadeUp(0.05)} className="space-y-3">
          {FAQS.map((item, i) => <FaqItem key={i} {...item} />)}
        </motion.div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────── */}
      <section className="relative z-10 py-24 px-6 text-center">
        <div className="max-w-2xl mx-auto">
          <motion.div {...scaleIn(0)} className="p-10 sm:p-16 rounded-3xl border border-electric-purple/20 bg-electric-purple/5 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-electric-purple/10 to-radiant-gold/5 pointer-events-none" />
            <div className="relative">
              <p className="text-5xl mb-4">🎮</p>
              <h2 className="text-4xl sm:text-5xl font-black italic uppercase tracking-tighter mb-4">
                Ready to <span className="gradient-text">Play?</span>
              </h2>
              <p className="text-white/40 text-sm mb-8 leading-relaxed">
                No download. No account. No wait.<br />Just you, your friends, and unlimited fun.
              </p>
              <button
                onClick={onPlay}
                className="premium-button-primary h-14 px-12 text-base font-black uppercase italic shadow-2xl shadow-electric-purple/30"
              >
                Start a Free Game Now ⚡
              </button>
              <p className="text-white/15 text-[10px] font-black uppercase tracking-widest mt-5">
                Works on any device • No login required • 100% free
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────── */}
      <footer className="relative z-10 border-t border-white/5 px-6 py-8 text-center">
        <div className="flex flex-col sm:flex-row items-center justify-between max-w-5xl mx-auto gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">🎮</span>
            <span className="font-black italic uppercase tracking-tighter gradient-text">DareMate</span>
          </div>
          <p className="text-white/15 text-[10px] font-black uppercase tracking-widest">
            Made by <a style={{ color: '#8B5CF6' }} href="https://instagram.com/coder_thinking">@coder_thinking</a>
          </p>
          <button onClick={onPlay} className="text-[10px] font-black uppercase text-electric-purple/50 hover:text-electric-purple transition-colors">
            Play Now →
          </button>
        </div>
      </footer>
    </div>
  );
}
