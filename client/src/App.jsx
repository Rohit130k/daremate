import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare, Send, Copy, ArrowLeft, LogOut, Gamepad2,
  ChevronRight, Image as ImageIcon, Mic, X, Share2, Menu,
  CheckCircle2, Check, Crown, SkipForward, Smile, Play, Trophy,
  RotateCcw, StopCircle, Trash2, Video as VideoIcon, AlertTriangle, Loader2, CornerDownRight
} from 'lucide-react';
import { io } from 'socket.io-client';
import Landing from './Landing.jsx';
import MiniGames from './MiniGames.jsx';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
const EMOJIS = ['❤️', '😂', '😮', '😢', '🔥', '👏', '💯', '🎯'];

const CATEGORY_META = {
  Funny: { icon: '😂', color: '#FBBF24', bg: 'rgba(251,191,36,0.1)', border: 'rgba(251,191,36,0.3)' },
  Romantic: { icon: '❤️', color: '#F472B6', bg: 'rgba(244,114,182,0.1)', border: 'rgba(244,114,182,0.3)' },
  Spicy: { icon: '🔥', color: '#EF4444', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.3)' },
  Emotional: { icon: '🧠', color: '#60A5FA', bg: 'rgba(96,165,250,0.1)', border: 'rgba(96,165,250,0.3)' },
};

/* ── Timer Ring ── */
const TimerRing = ({ timer, max = 45 }) => {
  const r = 32, circ = 2 * Math.PI * r;
  const color = timer < 10 ? '#EF4444' : timer < 20 ? '#F59E0B' : '#8B5CF6';
  return (
    <div className="relative w-20 h-20 flex items-center justify-center flex-shrink-0">
      <svg className="absolute inset-0 -rotate-90" width="80" height="80" viewBox="0 0 80 80">
        <circle cx="40" cy="40" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="4" />
        <circle cx="40" cy="40" r={r} fill="none" stroke={color} strokeWidth="4"
          strokeDasharray={`${circ * Math.max(0, timer) / max} ${circ}`} strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 1s linear, stroke 0.3s' }} />
      </svg>
      <span className={`text-xl font-black font-mono transition-colors ${timer === 0 ? 'animate-pulse' : ''}`} style={{ color }}>
        {timer > 0 ? timer : '⏰'}
      </span>
    </div>
  );
};

/* ── Category Chip ── */
const CategoryChip = ({ cat }) => {
  const m = CATEGORY_META[cat];
  if (!m) return null;
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border"
      style={{ color: m.color, background: m.bg, borderColor: m.border }}>
      {m.icon} {cat}
    </span>
  );
};

/* ── Confirm Modal ── */
const ConfirmModal = ({ message, onConfirm, onCancel }) => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-6">
    <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
      className="glass-card w-full max-w-xs p-7 space-y-5 text-center">
      <AlertTriangle className="w-12 h-12 text-amber-400 mx-auto" />
      <p className="text-base font-bold text-white/70">{message}</p>
      <div className="flex gap-3">
        <button onClick={onCancel} className="flex-1 h-11 border border-white/10 bg-white/5 rounded-2xl text-[10px] font-black uppercase text-white/40 hover:text-white transition-all">Cancel</button>
        <button onClick={onConfirm} className="flex-1 h-11 bg-red-500 rounded-2xl text-[10px] font-black uppercase text-white hover:bg-red-400 transition-all shadow-lg shadow-red-500/20">
          {message.includes('End') ? 'End Game 🛑' : 'Leave Room 👋'}
        </button>
      </div>
    </motion.div>
  </motion.div>
);

/* ══════════════════════════ APP ══════════════════════════ */
export default function App() {
  const [socket, setSocket] = useState(null);
  const [screen, setScreen] = useState('landing');
  const [createStep, setCreateStep] = useState(1);
  const [joinStep, setJoinStep] = useState(1);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(null);
  const [showEndConfirm, setShowEndConfirm] = useState(false);

  // config
  const [gameType, setGameType] = useState('Friends 👥');
  const [categories, setCategories] = useState(['Funny 😂']);
  const [skipAllowed, setSkipAllowed] = useState(true);
  const [timerOn, setTimerOn] = useState(true);
  const [maxPlayers, setMaxPlayers] = useState(8);

  // player
  const [username, setUsername] = useState('');
  const [avatar, setAvatar] = useState('🦊');
  const [roomCode, setRoomCode] = useState('');

  // game
  const [players, setPlayers] = useState([]);
  const [currentTurn, setCurrentTurn] = useState(0);
  const [round, setRound] = useState(1);
  const [gameState, setGameState] = useState('selection');
  const [selType, setSelType] = useState(null);
  const [question, setQuestion] = useState(null);
  const [qCategory, setQCategory] = useState(null);
  const [qPlayer, setQPlayer] = useState(null);
  const [timer, setTimer] = useState(45);
  const [timerActive, setTimerActive] = useState(false);
  const [timeUp, setTimeUp] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);

  // chat
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [typingUser, setTypingUser] = useState(null);
  const [emojiPickerFor, setEmojiPickerFor] = useState(null);
  const [reactions, setReactions] = useState({});
  const [adminCats, setAdminCats] = useState(null);
  const [adminCategory, setAdminCategory] = useState('Funny');
  const [adminTab, setAdminTab] = useState('truths');
  const [newQText, setNewQText] = useState('');
  const [bulkMode, setBulkMode] = useState(false);
  const [adminError, setAdminError] = useState('');
  const [isAutoRejoining, setIsAutoRejoining] = useState(false);
  const isAutoRejoiningRef = useRef(false);
  const [showMiniGames, setShowMiniGames] = useState(false);
  // mg_invite pending (shown even when panel is closed)
  const [mgInvite, setMgInvite] = useState(null); // {fromId, fromName, gameId, gameName}
  const [mgInitConf, setMgInitConf] = useState(null); // initial config passed to MiniGames

  // media / audio recording
  const [recording, setRecording] = useState(false);
  const [mediaLoading, setMediaLoading] = useState(false);
  const [audioURL, setAudioURL] = useState(null);
  const [audioBlob, setAudioBlob] = useState(null);
  const [recSeconds, setRecSeconds] = useState(0);

  // results
  const [gameResult, setGameResult] = useState(null);

  const chatRef = useRef(null);
  const fileRefImg = useRef(null);
  const fileRefVid = useRef(null);
  const mrRef = useRef(null);
  const chunksRef = useRef([]);
  const typingTimer = useRef(null);
  const recTimerRef = useRef(null);
  const socketRef = useRef(null);

  /* ── Socket Setup ─────────────────────────────────────── */
  useEffect(() => {
    const s = io(SOCKET_URL, { 
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000
    });
    setSocket(s);
    socketRef.current = s;

    s.on('room_state', r => {
      setPlayers(r.players);
      setCurrentTurn(r.currentTurn);
      if (r.config?.settings) {
        setTimerOn(!!r.config.settings.timerOn);
        setSkipAllowed(!!r.config.settings.skipAllowed);
        setMaxPlayers(r.config.settings.maxPlayers || 8);
      }
      if (r.gameState === 'active') setScreen('game');
    });
    s.on('player_update', p => setPlayers(p));
    s.on('score_update', p => setPlayers(p));
    s.on('game_started', () => { setScreen('game'); setSidebarOpen(false); });

    s.on('question_distributed', d => {
      setSelType(d.type); setQuestion(d.question);
      setQCategory(d.category); setQPlayer(d.player);
      setGameState('question');
      setTimer(45);
      setTimerActive(d.timerOn ?? timerOn);
      setTimeUp(false);
    });

    s.on('turn_update', d => {
      setCurrentTurn(d.currentTurn); setRound(d.round);
      setGameState('selection'); setTimerActive(false);
      setQuestion(null); setTimeUp(false);
    });

    s.on('receive_message', m => setMessages(p => [...p, m]));
    s.on('system_message', m => setMessages(p => [...p, { id: Date.now(), type: 'system', message: m.text, time: m.time }]));

    s.on('message_reaction', ({ msgId, emoji, username: u }) => {
      setReactions(prev => {
        const curr = { ...(prev[msgId] || {}) };
        curr[emoji] = [...(curr[emoji] || []), u];
        return { ...prev, [msgId]: curr };
      });
    });

    s.on('user_typing', d => setTypingUser(d.username));
    s.on('user_stop_typing', () => setTypingUser(null));
    s.on('room_error', e => {
      if (isAutoRejoiningRef.current) {
        localStorage.removeItem('daremate_session');
        isAutoRejoiningRef.current = false;
        setIsAutoRejoining(false);
        return;
      }
      setError(e); setScreen('error');
    });
    s.on('game_ended', d => { setGameResult(d); setScreen('results'); });
    s.on('admin_auth_success', d => { setAdminCats(d); setScreen('admin'); });
    s.on('admin_error', msg => { setAdminError(msg); setTimeout(() => setAdminError(''), 3000); });

    // ── Mini-game invite (always-on, regardless of panel open state) ──
    s.on('mg_event', data => {
      if (!data || data.type !== 'mg_invite') return;
      const GAME_NAMES = { rps: 'Rock Paper Scissors 🪨', ttt: 'Tic-Tac-Toe ⭕', numguess: 'Number Guess 🔢', wyr: 'Would You Rather 🤔', quiz: 'Quiz Battle ⚡' };
      setMgInvite({ fromId: data._from || data.fromId, fromName: data.fromName, gameId: data.gameId, gameName: GAME_NAMES[data.gameId] || data.gameId });
    });

    return () => s.close();
  }, []);

  // Chat auto-scroll
  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [messages]);

  // Timer tick
  useEffect(() => {
    if (!timerActive) return;
    if (timer <= 0) {
      setTimerActive(false);
      setTimeUp(true);
      // auto-skip only when it IS the player's turn
      if (players[currentTurn]?.id === socketRef.current?.id) {
        socketRef.current?.emit('skip_turn', roomCode);
      }
      return;
    }
    const id = setInterval(() => setTimer(t => t - 1), 1000);
    return () => clearInterval(id);
  }, [timerActive, timer, roomCode, currentTurn, players]);

  // Close emoji picker on outside tap
  useEffect(() => {
    const close = () => setEmojiPickerFor(null);
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, []);

  // ── Protection Against Reload ────────────────────────────
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (['game', 'lobby', 'create', 'join'].includes(screen) && roomCode) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [screen, roomCode]);

  // ── Auto-rejoin on Mount ───────────────────────────────
  useEffect(() => {
    if (!socket) return;
    const stored = localStorage.getItem('daremate_session');
    if (stored) {
      try {
        const { code, user, icon } = JSON.parse(stored);
        setRoomCode(code);
        setUsername(user);
        setAvatar(icon);
        isAutoRejoiningRef.current = true;
        setIsAutoRejoining(true);
        socket.emit('reconnect_room', { code, username: user });
      } catch (e) { localStorage.removeItem('daremate_session'); }
    }
  }, [socket]);

  /* ── Helpers ──────────────────────────────────────────── */
  const copy = (t = roomCode) => {
    navigator.clipboard.writeText(t);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const whatsappShare = () =>
    window.open(`https://wa.me/?text=Join+my+DareMate+room!+Code:+${roomCode}+%F0%9F%8E%AE`, '_blank');

  const createRoom = () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setRoomCode(code);
    socket.emit('create_room', { code, type: gameType, categories, settings: { skipAllowed, timerOn, maxPlayers } });
    setCreateStep(3);
  };

  const joinRoom = () => {
    if (!roomCode || roomCode.length !== 6 || !username) return;
    setError(null);
    localStorage.setItem('daremate_session', JSON.stringify({ code: roomCode, user: username, icon: avatar }));
    socket.emit('join_room', { code: roomCode, username, avatar });
    setScreen('lobby');
  };

  const selectCard = type => socket.emit('select_card', { code: roomCode, type });
  const completeTurn = () => socket.emit('complete_turn', roomCode);
  const skipTurnAct = () => socket.emit('skip_turn', roomCode);
  const endGame = () => {
    setShowEndConfirm(false);
    socket.emit('end_game', roomCode);
    localStorage.removeItem('daremate_session');
  };

  const leaveRoom = () => {
    setShowEndConfirm(false);
    socket.emit('leave_room', roomCode);
    localStorage.removeItem('daremate_session');
    setScreen('home');
    setRoomCode('');
    setMessages([]);
    setIsAutoRejoining(false);
    isAutoRejoiningRef.current = false;
  };

  const isHost = players[0]?.name === username;

  const sendMsg = (type = 'text', mediaUrl = null, msg = chatInput) => {
    const text = type === 'text' ? msg.trim() : msg;
    if (!text && type === 'text') return;
    socket.emit('send_message', { code: roomCode, message: text, username, avatar, type, mediaUrl, replyTo: replyingTo });
    if (type === 'text') setChatInput('');
    setReplyingTo(null);
    socket.emit('typing_stop', { code: roomCode });
  };

  const reactMsg = (msgId, emoji, e) => {
    e.stopPropagation();
    socket.emit('react_message', { code: roomCode, msgId, emoji, username });
    setEmojiPickerFor(null);
  };

  const handleTyping = val => {
    setChatInput(val);
    socket.emit('typing_start', { code: roomCode, username });
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => socket.emit('typing_stop', { code: roomCode }), 1500);
  };

  const handleFile = file => {
    if (!file) return;
    setMediaLoading(true);
    const isVid = file.type.startsWith('video');

    // Check total size to prevent buffer overflow (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      alert("File is too large (max 10MB)");
      setMediaLoading(false);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      if (isVid) {
        sendMsg('video', e.target.result, '🎥 Video');
        setMediaLoading(false);
        return;
      }

      // Compress Images
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Resize to max 1080p width/height to keep it under 1MB typically
        const MAX_RES = 1080;
        if (width > height && width > MAX_RES) {
          height *= MAX_RES / width;
          width = MAX_RES;
        } else if (height > MAX_RES) {
          width *= MAX_RES / height;
          height = MAX_RES;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // jpeg with 0.6 quality is a good balance
        const compressed = canvas.toDataURL('image/jpeg', 0.6);
        sendMsg('image', compressed, '🖼 Image');
        setMediaLoading(false);
      };
      img.onerror = () => setMediaLoading(false);
      img.src = e.target.result;
    };
    reader.onerror = () => setMediaLoading(false);
    reader.readAsDataURL(file);
  };

  /* ── Audio recording ─────────────────────────────────────── */
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      chunksRef.current = [];
      const mr = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mr.ondataavailable = e => { if (e.data.size) chunksRef.current.push(e.data); };
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        setAudioURL(URL.createObjectURL(blob));
        stream.getTracks().forEach(t => t.stop());
        clearInterval(recTimerRef.current);
      };
      mr.start();
      mrRef.current = mr;
      setRecording(true);
      setRecSeconds(0);
      recTimerRef.current = setInterval(() => setRecSeconds(s => s + 1), 1000);
    } catch { alert('Microphone permission denied.'); }
  };

  const stopRecording = () => {
    mrRef.current?.stop();
    setRecording(false);
  };

  const sendAudio = () => {
    if (!audioBlob) return;
    const reader = new FileReader();
    reader.onload = () => {
      socket.emit('send_message', { code: roomCode, message: '🎤 Voice Message', username, avatar, type: 'audio', mediaUrl: reader.result });
    };
    reader.readAsDataURL(audioBlob);
    setAudioBlob(null); setAudioURL(null); setRecSeconds(0);
  };

  const discardAudio = () => { setAudioBlob(null); setAudioURL(null); setRecSeconds(0); };

  const fmtSec = s => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  const isMyTurn = players[currentTurn]?.id === socket?.id;
  const fade = { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -8 } };

  /* ── Landing Page ─────────────────────────────────────────── */
  if (screen === 'landing') return (
    <Landing onPlay={() => setScreen('home')} />
  );

  /* ── Error Screen ──────────────────────────────────────── */
  if (screen === 'error') return (
    <div className="min-h-screen bg-[#010101] flex items-center justify-center p-6">
      <div className="glass-card p-8 max-w-sm w-full text-center space-y-5">
        <div className="text-6xl">{error?.code === 'ROOM_FULL' ? '🚫' : '❌'}</div>
        <h2 className="text-2xl font-black uppercase italic">{error?.code === 'ROOM_FULL' ? 'Room Full' : 'Room Not Found'}</h2>
        <p className="text-white/40 text-sm">{error?.message}</p>
        <button onClick={() => {
          setError(null);
          setScreen('home');
          setRoomCode('');
          localStorage.removeItem('daremate_session');
        }} className="premium-button-primary w-full h-12 font-black uppercase">Go Home</button>
      </div>
    </div>
  );

  /* ══════════════════════════════════════════════════════════ */
  return (
    <div className="h-screen w-screen overflow-hidden bg-[#010101] text-white font-inter relative">
      {/* Ambient */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-electric-purple/5 blur-[140px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-2/5 h-2/5 bg-radiant-gold/5 blur-[120px] rounded-full" />
      </div>

      {/* End-game confirm */}
      <AnimatePresence>
        {showEndConfirm && (
          <ConfirmModal
            message={isHost ? "End the game for everyone? Final scores will be shown." : "Are you sure you want to leave the room?"}
            onConfirm={isHost ? endGame : leaveRoom}
            onCancel={() => setShowEndConfirm(false)}
          />
        )}
      </AnimatePresence>

      {/* Hidden file inputs */}
      <input ref={fileRefImg} type="file" accept="image/*,video/*" className="hidden"
        onChange={e => handleFile(e.target.files[0])} />
      <input ref={fileRefVid} type="file" accept="video/*" className="hidden"
        onChange={e => handleFile(e.target.files[0])} />

      <AnimatePresence mode="wait">
        <motion.div key={screen} {...fade} className="h-full w-full flex flex-col z-10 relative overflow-hidden">

          {/* ── HOME ─────────────────────────────────────────────────── */}
          {screen === 'home' && (
            <div className="flex flex-col items-center justify-center h-full p-6 space-y-8 max-w-sm mx-auto w-full">
              <div className="text-center space-y-3">
                <div className="w-20 h-20 bg-white/5 border border-white/10 rounded-3xl mx-auto flex items-center justify-center">
                  <Gamepad2 className="w-10 h-10 text-electric-purple" />
                </div>
                <h1 className="text-6xl font-black italic tracking-tighter gradient-text uppercase">DareMate</h1>
                <p className="text-white/30 text-xs uppercase tracking-widest font-bold">Truth or Dare • Real-time</p>
              </div>
              <div className="w-full space-y-3">
                <button onClick={() => { setScreen('create'); setCreateStep(1); }} className="premium-button-primary w-full h-14 font-black uppercase italic text-base">Create Room</button>
                <button onClick={() => { setRoomCode(''); setScreen('join'); setJoinStep(1); }} className="premium-button-secondary w-full h-14 font-black uppercase text-base">Join Room</button>
              </div>
              <div className="grid grid-cols-3 gap-3 w-full text-center">
                {[['🔐', 'Private'], ['⚡', 'Real-time'], ['📱', 'Mobile First']].map(([i, l]) => (
                  <div key={l} className="p-3 bg-white/[0.02] border border-white/5 rounded-2xl">
                    <div className="text-xl mb-1">{i}</div>
                    <div className="text-[9px] font-black uppercase text-white/20">{l}</div>
                  </div>
                ))}
              </div>
              <footer className="mt-8 flex flex-col items-center gap-4 text-[10px] font-black uppercase tracking-widest text-white/10">
                <p>Made By <a style={{ color: '#8B5CF6' }} href="https://instagram.com/coder_thinking">@coder_thinking</a></p>
                <button onClick={() => {
                  const pass = prompt('Admin Password:');
                  if (pass) socket.emit('admin_login', pass);
                }} className="hover:text-electric-purple/50 transition-colors cursor-pointer">Question Panel</button>
                {adminError && (
                  <div className="px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-[10px] animate-in fade-in">
                    ❌ {adminError}
                  </div>
                )}
              </footer>
            </div>
          )}

          {/* ── CREATE ───────────────────────────────────────────────── */}
          {screen === 'create' && (
            <div className="flex flex-col h-full">
              <div className="flex items-center gap-3 p-4 border-b border-white/5">
                <button onClick={() => createStep === 1 ? setScreen('home') : setCreateStep(s => s - 1)} className="p-2 bg-white/5 rounded-xl"><ArrowLeft className="w-4 h-4" /></button>
                <div className="flex gap-1.5 flex-1 justify-center">
                  {[1, 2, 3].map(n => <div key={n} className={`h-1 rounded-full transition-all ${createStep >= n ? 'w-8 bg-electric-purple' : 'w-4 bg-white/10'}`} />)}
                </div>
                <div className="w-8" />
              </div>
              <div className="flex-1 overflow-y-auto p-5 space-y-5">

                {createStep === 1 && (
                  <div className="space-y-4">
                    <h2 className="text-3xl font-black italic uppercase tracking-tighter">Game Mode</h2>
                    {['Partner 👩‍❤️‍👨', 'Friends 👥', 'Group 👨‍👩‍👧‍👦'].map(m => (
                      <button key={m} onClick={() => { setGameType(m); setCreateStep(2); }}
                        className={`w-full flex items-center justify-between px-5 py-4 border rounded-2xl font-bold text-base uppercase transition-all ${gameType === m ? 'border-electric-purple/60 bg-electric-purple/10' : 'border-white/8 bg-white/[0.02] opacity-60'}`}>
                        {m}<ChevronRight className="w-4 h-4 opacity-30" />
                      </button>
                    ))}
                  </div>
                )}

                {createStep === 2 && (
                  <div className="space-y-5">
                    <h2 className="text-3xl font-black italic uppercase tracking-tighter">Settings</h2>
                    <div className="grid grid-cols-2 gap-3">
                      {Object.entries(CATEGORY_META).map(([key, m]) => {
                        const active = categories.some(c => c.startsWith(key));
                        return (
                          <button key={key} onClick={() => active ? setCategories(categories.filter(c => !c.startsWith(key))) : setCategories([...categories, `${key} ${m.icon}`])}
                            className="p-4 rounded-2xl border text-center transition-all"
                            style={active ? { background: m.bg, borderColor: m.border, color: m.color } : { background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.3)' }}>
                            <div className="text-2xl mb-1">{m.icon}</div>
                            <div className="text-xs font-black uppercase">{key}</div>
                          </button>
                        );
                      })}
                    </div>
                    <div className="space-y-4 p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                      {[['Timer On', timerOn, setTimerOn], ['Skip Allowed', skipAllowed, setSkipAllowed]].map(([label, val, setter]) => (
                        <div key={label} className="flex items-center justify-between">
                          <span className="text-xs font-black uppercase tracking-widest text-white/40">{label}</span>
                          <button onClick={() => setter(v => !v)} className={`w-10 h-5 rounded-full relative transition-all ${val ? 'bg-electric-purple' : 'bg-white/10'}`}>
                            <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${val ? 'left-[22px]' : 'left-0.5'}`} />
                          </button>
                        </div>
                      ))}
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-xs font-black uppercase text-white/40">Max Players</span>
                          <span className="text-xs font-black text-electric-purple">{maxPlayers}</span>
                        </div>
                        <input type="range" min="2" max="15" value={maxPlayers} onChange={e => setMaxPlayers(+e.target.value)} className="w-full accent-electric-purple" />
                      </div>
                    </div>
                    <button onClick={createRoom} className="premium-button-primary w-full h-12 font-black uppercase italic">Create Room</button>
                  </div>
                )}

                {createStep === 3 && (
                  <div className="text-center space-y-8 pt-4">
                    <CheckCircle2 className="w-14 h-14 text-green-400 mx-auto" />
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-widest text-white/20 mb-3">Room Code</p>
                      <p className="text-7xl font-mono font-black text-radiant-gold tracking-widest">{roomCode}</p>
                      <div className="flex gap-3 justify-center mt-4">
                        <button onClick={() => copy()} className={`flex items-center gap-2 px-4 py-2 rounded-full border text-[10px] font-black uppercase tracking-widest transition-all ${copied ? 'bg-green-500 border-green-400 text-black' : 'bg-white/5 border-white/10 text-white/50'}`}>
                          {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}{copied ? 'Copied!' : 'Copy'}
                        </button>
                        <button onClick={whatsappShare} className="flex items-center gap-2 px-4 py-2 rounded-full border border-green-500/30 bg-green-500/10 text-green-400 text-[10px] font-black uppercase">
                          <Share2 className="w-3 h-3" />WhatsApp
                        </button>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <input type="text" placeholder="Your nickname" className="premium-input text-center font-bold italic uppercase" value={username} onChange={e => setUsername(e.target.value)} />
                      <div className="grid grid-cols-5 gap-2">
                        {['🦁', '🐙', '🦊', '🦄', '🦒'].map(e => (
                          <button key={e} onClick={() => setAvatar(e)} className={`h-11 rounded-xl text-xl flex items-center justify-center transition-all ${avatar === e ? 'bg-electric-purple scale-110' : 'bg-white/5 border border-white/5'}`}>{e}</button>
                        ))}
                      </div>
                      <button onClick={joinRoom} disabled={!username} className="premium-button-primary w-full h-12 font-black uppercase italic disabled:opacity-30">Enter Room</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── JOIN ─────────────────────────────────────────────────── */}
          {screen === 'join' && (
            <div className="flex flex-col h-full">
              <div className="flex items-center p-4 border-b border-white/5">
                <button onClick={() => joinStep === 1 ? setScreen('home') : setJoinStep(1)} className="p-2 bg-white/5 rounded-xl"><ArrowLeft className="w-4 h-4" /></button>
              </div>
              <div className="flex-1 p-5 space-y-6 flex flex-col justify-center">
                {joinStep === 1 && (
                  <>
                    <h2 className="text-3xl font-black italic uppercase tracking-tighter">Enter Code</h2>
                    <input type="text" placeholder="000000" id="dm_room_entry" maxLength={6} value={roomCode}
                      autoComplete="one-time-code"
                      autoCorrect="off"
                      spellCheck="false"
                      autoCapitalize="none"
                      onChange={e => { setRoomCode(e.target.value); if (e.target.value.length === 6) setJoinStep(2); }}
                      className="premium-input text-center text-5xl font-mono font-black py-6 text-radiant-gold tracking-[0.3em]" />
                  </>
                )}
                {joinStep === 2 && (
                  <>
                    <h2 className="text-3xl font-black italic uppercase tracking-tighter">Your Identity</h2>
                    <div className="grid grid-cols-5 gap-2">
                      {['🦁', '🐙', '🦊', '🦄', '🦒', '🐸', '🦋', '🐺', '🦅', '🐬'].map(e => (
                        <button key={e} onClick={() => setAvatar(e)} className={`h-12 rounded-xl text-2xl flex items-center justify-center transition-all ${avatar === e ? 'bg-electric-purple scale-110 shadow-lg shadow-electric-purple/40' : 'bg-white/5 border border-white/5'}`}>{e}</button>
                      ))}
                    </div>
                    <input type="text" placeholder="Nickname" autoComplete="off" className="premium-input text-center font-black italic uppercase" value={username} onChange={e => setUsername(e.target.value)} />
                    <button onClick={joinRoom} disabled={!username} className="premium-button-primary w-full h-12 font-black uppercase italic disabled:opacity-30">Join Room</button>
                  </>
                )}
              </div>
            </div>
          )}



          {/* ── LOBBY ────────────────────────────────────────────────── */}
          {screen === 'lobby' && (
            <div className="flex flex-col h-full p-5 space-y-5 max-w-sm mx-auto w-full">
              <div className="flex items-center justify-between pt-4">
                <h2 className="text-2xl font-black italic uppercase tracking-tighter">Lobby</h2>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-full">
                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-[9px] font-black text-green-400 uppercase">Live</span>
                </div>
              </div>
              <div className="p-6 bg-white/[0.02] border-2 border-dashed border-white/8 rounded-3xl text-center space-y-3">
                <p className="text-[9px] font-black uppercase tracking-widest text-white/20">Room Code</p>
                <p className="text-5xl font-mono font-black text-radiant-gold tracking-widest">{roomCode}</p>
                <div className="flex gap-3 justify-center">
                  <button onClick={() => copy()} className="flex items-center gap-1 text-[9px] font-black uppercase text-white/30 hover:text-white"><Copy className="w-3 h-3" />{copied ? 'Copied!' : 'Copy'}</button>
                  <span className="text-white/10">|</span>
                  <button onClick={whatsappShare} className="flex items-center gap-1 text-[9px] font-black uppercase text-green-500/50 hover:text-green-400"><Share2 className="w-3 h-3" />WhatsApp</button>
                </div>
              </div>
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-white/20 mb-3">Players ({players.length}/{maxPlayers})</p>
                <div className="grid grid-cols-4 gap-3">
                  {players.map(p => (
                    <div key={p.id} className="flex flex-col items-center gap-1">
                      <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-3xl relative">
                        {p.avatar}
                        {p.id === socket?.id && <Crown className="absolute -top-2 -right-2 w-4 h-4 text-radiant-gold" />}
                      </div>
                      <span className="text-[9px] font-black uppercase text-white/40 truncate w-full text-center">{p.name}</span>
                    </div>
                  ))}
                  {Array.from({ length: Math.max(0, 4 - players.length) }).map((_, i) => (
                    <div key={i} className="w-14 h-14 rounded-2xl bg-white/[0.02] border border-dashed border-white/5 flex items-center justify-center text-white/10 text-lg">+</div>
                  ))}
                </div>
              </div>
              {isHost ? (
                <button onClick={() => socket.emit('start_game', roomCode)} className="premium-button-primary w-full h-14 text-lg font-black italic uppercase mt-auto">Start Game 🎮</button>
              ) : (
                <div className="w-full h-14 flex items-center justify-center rounded-2xl bg-white/[0.02] border border-white/5 mt-auto">
                  <p className="text-[10px] font-black uppercase text-white/20 animate-pulse">Waiting for host to start…</p>
                </div>
              )}
            </div>
          )}

          {/* ── GAME ROOM ────────────────────────────────────────────── */}
          {screen === 'game' && (
            <div className="flex flex-col h-full overflow-hidden relative">

              {/* Top Bar */}
              <div className="flex-shrink-0 h-14 flex items-center justify-between px-4 border-b border-white/5 bg-black/60 backdrop-blur-2xl">
                <div className="flex items-center gap-3">
                  <button onClick={() => setSidebarOpen(true)} className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-white/50 hover:text-white transition-colors">
                    <Menu className="w-5 h-5" />
                  </button>
                  <div>
                    <p className="text-[8px] font-black uppercase tracking-widest text-white/20">{gameType} • Round {round}</p>
                    <p className="text-xs font-mono font-black text-white/60">{roomCode}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {players.slice(0, 4).map((p, i) => (
                    <div key={p.id} className={`w-8 h-8 rounded-lg flex items-center justify-center text-base transition-all ${currentTurn === i ? 'ring-2 ring-electric-purple scale-110' : 'opacity-25'}`}>{p.avatar}</div>
                  ))}
                </div>
                <button onClick={() => setShowEndConfirm(true)} className="p-2 text-white/20 hover:text-red-400 transition-colors">
                  <LogOut className="w-4 h-4" />
                </button>
              </div>

              {/* ── Mini-Games Overlay ────────────────────────────────── */}
              <AnimatePresence>
                {showMiniGames && (
                  <MiniGames
                    socket={socket}
                    roomCode={roomCode}
                    username={username}
                    myId={socket?.id}
                    players={players}
                    initialState={mgInitConf}
                    onClose={() => { setShowMiniGames(false); setMgInitConf(null); }}
                    onSystemMsg={text => {
                      setMessages(prev => [...prev, { id: Date.now(), type: 'system', message: text }]);
                    }}
                  />
                )}
              </AnimatePresence>

              {/* ── Incoming Game Invite Notification ─────────────────── */}
              <AnimatePresence>
                {mgInvite && (
                  <motion.div
                    initial={{ opacity: 0, y: 16, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 16, scale: 0.95 }}
                    className="absolute bottom-16 left-3 right-3 z-50 p-4 bg-[#0e0e0e] border border-electric-purple/30 rounded-2xl shadow-2xl shadow-electric-purple/10 flex items-center gap-3"
                  >
                    <div className="w-10 h-10 bg-electric-purple/15 border border-electric-purple/25 rounded-xl flex items-center justify-center text-xl flex-shrink-0">
                      🎮
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-black uppercase tracking-widest text-electric-purple/70">Game Challenge!</p>
                      <p className="text-xs font-bold text-white truncate">
                        <span className="text-radiant-gold">{mgInvite.fromName}</span> wants to play {mgInvite.gameName}
                      </p>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <button
                        onClick={() => {
                          // Accept: relay back, open MiniGames pre-configured as guest
                          socket.emit('mg_relay', { code: roomCode, to: mgInvite.fromId, data: { type: 'mg_accepted', fromId: socket.id, fromName: username } });
                          setMgInitConf({ view: 'playing', gameId: mgInvite.gameId, opponent: { id: mgInvite.fromId, name: mgInvite.fromName }, isHost: false });
                          setShowMiniGames(true);
                          setMgInvite(null);
                        }}
                        className="h-8 px-3 bg-electric-purple rounded-xl text-[10px] font-black uppercase text-white hover:bg-electric-purple/90 transition-colors"
                      >
                        Accept ✓
                      </button>
                      <button
                        onClick={() => {
                          socket.emit('mg_relay', { code: roomCode, to: mgInvite.fromId, data: { type: 'mg_declined', fromName: username } });
                          setMgInvite(null);
                        }}
                        className="h-8 px-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase text-white/40 hover:text-white/70 transition-colors"
                      >
                        Decline
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ═══ 30% Game Zone ════════════════════════════════════ */}
              <div className="flex-shrink-0 h-[30%] relative overflow-hidden border-b border-white/5">
                <div className={`absolute inset-0 pointer-events-none transition-all duration-700 ${gameState === 'question' && selType === 'truth' ? 'bg-gradient-to-b from-blue-950/50 to-transparent'
                  : gameState === 'question' ? 'bg-gradient-to-b from-red-950/50 to-transparent' : ''
                  }`} />

                <AnimatePresence mode="wait">
                  {/* SELECTION */}
                  {gameState === 'selection' && (
                    <motion.div key="sel" {...fade} className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-5">
                      <div className="text-center">
                        <p className="text-[8px] font-black uppercase tracking-widest text-electric-purple/60 mb-1">{isMyTurn ? '— Your Turn —' : '— Waiting —'}</p>
                        <h2 className="text-4xl font-black italic uppercase tracking-tighter">{players[currentTurn]?.name || '...'}</h2>
                      </div>
                      <div className={`flex gap-3 w-full max-w-xs ${!isMyTurn ? 'opacity-25 pointer-events-none' : ''}`}>
                        <button onClick={() => selectCard('truth')} className="flex-1 h-14 bg-blue-500/10 border border-blue-500/25 rounded-2xl flex flex-col items-center justify-center hover:bg-blue-500/20 hover:scale-105 active:scale-95 transition-all">
                          <span className="text-lg">❓</span><span className="text-[9px] font-black uppercase text-blue-400">Truth</span>
                        </button>
                        <button onClick={() => selectCard('dare')} className="flex-1 h-14 bg-red-500/10 border border-red-500/25 rounded-2xl flex flex-col items-center justify-center hover:bg-red-500/20 hover:scale-105 active:scale-95 transition-all">
                          <span className="text-lg">🎯</span><span className="text-[9px] font-black uppercase text-red-400">Dare</span>
                        </button>
                      </div>
                      {!isMyTurn && <p className="text-[8px] uppercase font-black text-white/15 animate-pulse">Waiting for {players[currentTurn]?.name}…</p>}
                    </motion.div>
                  )}

                  {/* QUESTION */}
                  {gameState === 'question' && (
                    <motion.div key="q" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                      className="absolute inset-0 flex items-center gap-4 px-4">
                      {timerOn && <TimerRing timer={timer} />}
                      <div className="flex-1 flex flex-col gap-2 min-w-0">
                        {/* Badges */}
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <div className="flex items-center gap-1 px-2 py-0.5 bg-white/5 border border-white/10 rounded-full">
                            <span className="text-xs">{qPlayer?.avatar}</span>
                            <span className="text-[9px] font-black uppercase text-white/60">{qPlayer?.name}</span>
                          </div>
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase border ${selType === 'truth' ? 'text-blue-400 bg-blue-500/10 border-blue-500/25' : 'text-red-400 bg-red-500/10 border-red-500/25'}`}>
                            {selType === 'truth' ? '❓ Truth' : '🎯 Dare'}
                          </span>
                          <CategoryChip cat={qCategory} />
                        </div>
                        {/* Time's up banner */}
                        {timeUp && (
                          <p className="text-[10px] font-black uppercase tracking-widest text-red-400 animate-pulse">⏰ Time's up! Auto-skipped</p>
                        )}
                        {/* Question text */}
                        <p className="text-sm font-black italic uppercase tracking-tight leading-snug line-clamp-2">"{question}"</p>
                        {/* Action buttons */}
                        {!timeUp && (
                          <div className={`flex gap-2 ${!isMyTurn ? 'opacity-25 pointer-events-none' : ''}`}>
                            <button onClick={completeTurn} className="flex-1 h-8 bg-green-500 text-black text-[10px] font-black uppercase italic rounded-xl active:scale-95 transition-all">Done ✅</button>
                            {skipAllowed && <button onClick={skipTurnAct} className="w-8 h-8 flex items-center justify-center bg-white/5 border border-white/10 rounded-xl hover:text-red-400 text-white/30 transition-all active:scale-95"><SkipForward className="w-3.5 h-3.5" /></button>}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* ═══ 70% Chat Zone ════════════════════════════════════ */}
              <div className="flex flex-col flex-1 min-h-0 bg-[#050505]">
                {/* Chat header */}
                <div className="flex-shrink-0 flex items-center justify-between px-4 py-2 border-b border-white/5">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-3.5 h-3.5 text-electric-purple" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-white/30">Live Chat</span>
                  </div>
                  <span className="text-[8px] text-white/10">{messages.filter(m => m.type !== 'system').length} msgs</span>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2 no-scrollbar" ref={chatRef}>
                  {messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full opacity-10 gap-2">
                      <MessageSquare className="w-8 h-8" />
                      <p className="text-[10px] font-black uppercase">Say something!</p>
                    </div>
                  )}
                  {messages.map((m, i) => {
                    if (m.type === 'system') return (
                      <div key={m.id || i} className="flex justify-center">
                        <span className="px-3 py-1 bg-white/5 rounded-full text-[9px] text-white/20 font-bold">{m.message}</span>
                      </div>
                    );

                    const isMine = m.username === username;
                    const quoted = m.replyTo ? messages.find(msg => msg.id === m.replyTo.id) : null;
                    const msgReacts = reactions[m.id] || {};

                    return (
                      <div key={m.id || i} className={`flex flex-col ${isMine ? 'items-end' : 'items-start'} group max-w-full`}>
                        {/* Sender info */}
                        <div className="flex items-center gap-1.5 mb-1 px-1 opacity-40">
                          <span className="text-[9px] font-black uppercase text-white/50">{m.username}</span>
                          <span className="text-[8px] font-medium text-white/30">{m.time}</span>
                        </div>

                        <div className="relative group flex items-center gap-2 max-w-full">
                          {/* Swipe Indicator (Visible only on drag) */}
                          {!isMine && <div className="text-white/10 opacity-0 group-active:opacity-100 transition-opacity"><CornerDownRight className="w-3 h-3" /></div>}

                          <motion.div
                            drag="x"
                            dragConstraints={{ left: 0, right: 100 }}
                            onDragEnd={(_, info) => { if (info.offset.x > 60) setReplyingTo(m); }}
                            className={`p-3 rounded-2xl shadow-sm text-sm break-words relative overflow-hidden backdrop-blur-md max-w-full ${isMine ? 'bg-electric-purple text-white rounded-tr-sm' : 'bg-white/5 border border-white/8 text-white/90 rounded-tl-sm'
                              }`}>

                            {/* Quoted Message */}
                            {quoted && (
                              <div className="mb-2 p-2 bg-black/20 border-l-2 border-white/40 rounded-md text-[10px] opacity-70 line-clamp-1 italic select-none">
                                <span className="font-bold mr-1 text-electric-purple">{quoted.username}:</span> {quoted.message}
                              </div>
                            )}

                            {/* Content */}
                            {m.type === 'image' && <img src={m.mediaUrl} alt="shared" className="max-w-[200px] h-auto rounded-lg mb-1 border border-white/10" />}
                            {m.type === 'video' && <video src={m.mediaUrl} controls className="max-w-[200px] rounded-lg mb-1 border border-white/10" />}
                            {m.type === 'audio' && <audio src={m.mediaUrl} controls className="w-[180px] h-8 mt-1 scale-90 origin-left" />}
                            {(m.type === 'text' || !m.type) && <p className="leading-snug">{m.message}</p>}

                            {/* Reactions display */}
                            {Object.keys(msgReacts).length > 0 && (
                              <div className={`flex gap-1 mt-2 flex-wrap ${isMine ? 'justify-end' : ''}`}>
                                {Object.entries(msgReacts).map(([emoji, users]) => (
                                  <div key={emoji} className="px-1.5 py-0.5 bg-black/30 border border-white/5 rounded-full text-[9px] flex items-center gap-1">
                                    <span>{emoji}</span><span className="text-white/50">{users.length}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </motion.div>

                          {/* Quick Actions (Reply/React) */}
                          <div className={`opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5 ${isMine ? 'order-first' : ''}`}>
                            <button onClick={() => setReplyingTo(m)} className="p-1 px-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-white/20 hover:text-electric-purple transition-all">
                              <CornerDownRight className="w-3 h-3" />
                            </button>
                            <button
                              onClick={e => { e.stopPropagation(); setEmojiPickerFor(emojiPickerFor === m.id ? null : m.id); }}
                              className="p-1 px-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-white/20 hover:text-yellow-400 transition-all">
                              <Smile className="w-3 h-3" />
                            </button>
                          </div>

                          {/* Emoji picker overlay */}
                          {emojiPickerFor === m.id && (
                            <div className={`absolute bottom-full mb-2 ${isMine ? 'right-0' : 'left-0'} flex gap-1 bg-[#121212] border border-white/10 rounded-2xl px-2 py-1.5 z-30 shadow-2xl animate-in fade-in zoom-in slide-in-from-bottom-2`}
                              onClick={e => e.stopPropagation()}>
                              {EMOJIS.map(emoji => (
                                <button key={emoji} onClick={e => reactMsg(m.id, emoji, e)} className="text-lg hover:scale-125 transition-transform active:scale-95 px-1">{emoji}</button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {/* Typing indicator */}
                  {typingUser && (
                    <div className="flex items-center gap-2 opacity-40">
                      <div className="px-3 py-1.5 bg-white/5 rounded-2xl">
                        <span className="text-[10px] font-bold text-white/40">{typingUser} is typing…</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Audio preview bar */}
                {audioURL && (
                  <div className="flex-shrink-0 mx-3 mb-2 p-3 bg-electric-purple/10 border border-electric-purple/30 rounded-2xl flex items-center gap-3">
                    <audio src={audioURL} controls className="flex-1 h-8" style={{ minWidth: 0 }} />
                    <div className="flex gap-2 flex-shrink-0">
                      <button onClick={sendAudio} className="w-8 h-8 bg-green-500 rounded-xl flex items-center justify-center hover:bg-green-400 transition-all active:scale-90">
                        <Send className="w-3.5 h-3.5 text-black" />
                      </button>
                      <button onClick={discardAudio} className="w-8 h-8 bg-red-500/20 border border-red-500/30 rounded-xl flex items-center justify-center hover:bg-red-500/40 transition-all active:scale-90">
                        <Trash2 className="w-3.5 h-3.5 text-red-400" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Input bar */}
                <div className="flex-shrink-0 px-3 pb-3 pt-2 bg-black/40 border-t border-white/5">
                  {replyingTo && (
                    <div className="flex items-center justify-between bg-white/5 p-2 rounded-t-xl border-l-2 border-electric-purple mb-1 mx-1 slide-in-top">
                      <div className="min-w-0">
                        <p className="text-[10px] font-black text-electric-purple uppercase">{replyingTo.username}</p>
                        <p className="text-[11px] text-white/50 truncate opacity-80">{replyingTo.message}</p>
                      </div>
                      <button onClick={() => setReplyingTo(null)} className="p-1 hover:text-red-400"><X className="w-3 h-3" /></button>
                    </div>
                  )}
                  {recording && (
                    <div className="flex items-center gap-2 mb-2 px-1">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                      <span className="text-[10px] font-black text-red-400 uppercase">Recording {fmtSec(recSeconds)}</span>
                    </div>
                  )}
                  {mediaLoading && (
                    <div className="flex items-center gap-2 mb-2 px-1">
                      <Loader2 className="w-3 h-3 text-electric-purple animate-spin" />
                      <span className="text-[10px] font-black text-electric-purple uppercase">Processing Media...</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 bg-white/[0.04] border border-white/8 rounded-2xl px-3 py-2">
                    {/* Image / Video */}
                    <button onClick={() => fileRefImg.current?.click()} className="text-white/20 hover:text-electric-purple transition-colors flex-shrink-0">
                      <ImageIcon className="w-4 h-4" />
                    </button>
                    <button onClick={() => fileRefVid.current?.click()} className="text-white/20 hover:text-electric-purple transition-colors flex-shrink-0">
                      <VideoIcon className="w-4 h-4" />
                    </button>
                    {/* Mini-Games button */}
                    <button onClick={() => setShowMiniGames(v => !v)}
                      className={`flex-shrink-0 transition-colors ${showMiniGames ? 'text-electric-purple' : 'text-white/20 hover:text-electric-purple'}`}
                      title="Mini Games">
                      <Gamepad2 className="w-4 h-4" />
                    </button>

                    {/* Text input */}
                    <input value={chatInput} onChange={e => handleTyping(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && sendMsg()}
                      placeholder={recording ? 'Recording…' : 'Say something…'}
                      disabled={recording || !!audioURL}
                      className="flex-1 bg-transparent border-0 outline-none text-sm text-white placeholder:text-white/20 font-medium min-w-0" />

                    {/* Record / Stop */}
                    {!audioURL && (
                      <button onClick={recording ? stopRecording : startRecording}
                        className={`flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-all active:scale-90 ${recording ? 'bg-red-500 hover:bg-red-400' : 'bg-white/5 hover:bg-white/10 text-white/30 hover:text-white'}`}>
                        {recording ? <StopCircle className="w-4 h-4 text-white" /> : <Mic className="w-4 h-4" />}
                      </button>
                    )}

                    {/* Send text */}
                    {!recording && !audioURL && (
                      <button onClick={() => sendMsg()} className="flex-shrink-0 w-8 h-8 bg-electric-purple rounded-xl flex items-center justify-center hover:scale-105 active:scale-90 transition-all shadow-md shadow-electric-purple/30">
                        <Send className="w-3.5 h-3.5 text-white" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── RESULTS ──────────────────────────────────────────────── */}
          {screen === 'results' && gameResult && (
            <div className="flex flex-col h-full overflow-y-auto p-5 space-y-5">
              <div className="text-center pt-6 space-y-2">
                <div className="text-5xl">🏆</div>
                <h2 className="text-4xl font-black italic uppercase tracking-tighter gradient-text">Game Over!</h2>
              </div>
              {gameResult.leaderboard?.[0] && (
                <div className="p-6 bg-radiant-gold/10 border-2 border-radiant-gold/30 rounded-3xl text-center">
                  <p className="text-[9px] font-black uppercase tracking-widest text-radiant-gold/60 mb-2">Winner 👑</p>
                  <div className="text-5xl mb-2">{gameResult.leaderboard[0].avatar}</div>
                  <p className="text-2xl font-black italic uppercase tracking-tighter">{gameResult.leaderboard[0].name}</p>
                  <p className="text-radiant-gold font-black text-xl mt-1">{gameResult.leaderboard[0].score} pts</p>
                </div>
              )}
              <div className="space-y-2">
                <p className="text-[9px] font-black uppercase tracking-widest text-white/20">Leaderboard</p>
                {gameResult.leaderboard?.map((p, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-white/[0.03] border border-white/5 rounded-2xl">
                    <span className="text-sm font-black text-white/30 w-5">#{i + 1}</span>
                    <span className="text-xl">{p.avatar}</span>
                    <span className="flex-1 text-sm font-black uppercase italic tracking-tight">{p.name}</span>
                    <span className="text-sm font-black text-electric-purple">{p.score} pts</span>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-3">
                {gameResult.mostDares?.avatar && (
                  <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-center">
                    <p className="text-[8px] font-black uppercase text-red-400/60 mb-1">Most Dares</p>
                    <div className="text-2xl">{gameResult.mostDares.avatar}</div>
                    <p className="text-xs font-black uppercase italic mt-1">{gameResult.mostDares.name}</p>
                  </div>
                )}
                {gameResult.mostSkips?.avatar && (
                  <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-center">
                    <p className="text-[8px] font-black uppercase text-amber-400/60 mb-1">Most Skips 😅</p>
                    <div className="text-2xl">{gameResult.mostSkips.avatar}</div>
                    <p className="text-xs font-black uppercase italic mt-1">{gameResult.mostSkips.name}</p>
                  </div>
                )}
              </div>
              <button onClick={() => {
                localStorage.removeItem('daremate_session');
                setScreen('home');
                setRoomCode('');
                setGameResult(null);
                setMessages([]);
                setPlayers([]);
                setRound(1);
                setIsAutoRejoining(false);
              }}
                className="premium-button-primary w-full h-14 font-black uppercase italic text-base mt-2">
                <RotateCcw className="w-4 h-4 inline mr-2" />Back to Home
              </button>
            </div>
          )}

          {/* ── ADMIN PANEL ───────────────────────────────────────────── */}
          {screen === 'admin' && adminCats && (
            <div className="flex flex-col h-full bg-[#050505]">
              {/* Header */}
              <div className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-b border-white/5">
                <div className="flex items-center gap-2" onClick={() => setScreen('home')}>
                  <ArrowLeft className="w-4 h-4 text-white/30 cursor-pointer" />
                  <h2 className="text-xl font-black italic uppercase italic">Admin Panel</h2>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-[10px] font-black opacity-20 uppercase tracking-widest hidden sm:block">
                    {Object.values(adminCats).reduce((acc, c) => acc + c.truths.length + c.dares.length, 0)} Total Tasks
                  </div>
                  <button onClick={() => socket.emit('admin_update', { categories: adminCats })} className="px-4 h-9 bg-green-500 rounded-xl text-[10px] font-black uppercase text-black italic transition-transform active:scale-95">Save Pool ✨</button>
                </div>
              </div>

              {/* Selector */}
              <div className="flex gap-2 overflow-x-auto px-6 py-4 no-scrollbar border-b border-white/5">
                {Object.entries(adminCats).map(([cat, data]) => (
                  <button key={cat} onClick={() => setAdminCategory(cat)}
                    className={`flex-shrink-0 px-4 h-9 rounded-xl text-[10px] font-black uppercase italic transition-all flex items-center gap-2 ${adminCategory === cat ? 'bg-electric-purple text-white' : 'bg-white/5 text-white/30'}`}>
                    {cat}
                    <span className="opacity-40 text-[8px] font-bold bg-black/20 px-1.5 py-0.5 rounded-md">{data.truths.length + data.dares.length}</span>
                  </button>
                ))}
              </div>

              {/* Tabs */}
              <div className="flex mt-4 px-6 justify-between border-b border-white/5">
                <div className="flex gap-4">
                  {['truths', 'dares'].map(t => (
                    <button key={t} onClick={() => setAdminTab(t)}
                      className={`pb-2 text-[10px] font-black uppercase tracking-widest transition-all ${adminTab === t ? 'text-electric-purple border-b-2 border-electric-purple' : 'text-white/20'}`}>
                      {t} ({adminCats[adminCategory][t].length})
                    </button>
                  ))}
                </div>
                <button onClick={() => setBulkMode(!bulkMode)} className={`text-[9px] font-black uppercase mb-2 px-3 py-1 rounded-full border transition-all ${bulkMode ? 'bg-white/10 border-white/20 text-white' : 'border-white/5 text-white/20'}`}>
                  {bulkMode ? '✨ Single Mode' : '📦 Bulk Add'}
                </button>
              </div>

              {/* List */}
              <div className="flex-1 overflow-y-auto p-6 space-y-3">
                {bulkMode ? (
                  <div className="space-y-4 animate-in fade-in slide-in-from-top-4">
                    <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl">
                      <p className="text-[10px] text-yellow-500/80 font-bold uppercase">Bulk Mode Active</p>
                      <p className="text-[11px] text-yellow-500/50">Enter tasks (one per line). Empty lines will be ignored.</p>
                    </div>
                    <textarea value={newQText} onChange={e => setNewQText(e.target.value)} placeholder={`Paste many ${adminTab} here…`}
                      className="w-full h-40 bg-white/5 border border-white/10 rounded-2xl p-4 text-sm outline-none focus:border-electric-purple transition-all" />
                    <button onClick={() => {
                      const list = newQText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
                      if (list.length === 0) return;
                      const updated = { ...adminCats };
                      updated[adminCategory][adminTab] = [...updated[adminCategory][adminTab], ...list];
                      setAdminCats(updated); setNewQText(''); setBulkMode(false);
                    }} className="w-full h-12 bg-electric-purple rounded-2xl text-xs font-black uppercase italic shadow-lg shadow-electric-purple/20">Add {newQText.split('\n').filter(l => l.trim()).length} Tasks To {adminCategory}</button>
                  </div>
                ) : (
                  <div className="flex gap-2 mb-6">
                    <input value={newQText} onChange={e => setNewQText(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.currentTarget.nextSibling.click(); } }} placeholder={`Add new ${adminTab.slice(0, -1)}…`}
                      className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 text-sm outline-none focus:border-electric-purple transition-all" />
                    <button onClick={() => {
                      if (!newQText.trim()) return;
                      const updated = { ...adminCats };
                      updated[adminCategory][adminTab].push(newQText.trim());
                      setAdminCats(updated); setNewQText('');
                    }} className="w-10 h-10 bg-electric-purple rounded-xl flex items-center justify-center shrink-0"><Check className="w-4 h-4" /></button>
                  </div>
                )}

                {!bulkMode && adminCats[adminCategory][adminTab].map((q, i) => (
                  <div key={i} className="flex gap-3 p-4 bg-white/[0.03] border border-white/5 rounded-2xl group">
                    <p className="flex-1 text-sm font-medium text-white/70 leading-relaxed">"{q}"</p>
                    <button onClick={() => {
                      const updated = { ...adminCats };
                      updated[adminCategory][adminTab] = updated[adminCategory][adminTab].filter((_, idx) => idx !== i);
                      setAdminCats(updated);
                    }} className="opacity-0 group-hover:opacity-100 p-2 text-white/20 hover:text-red-400 transition-all"><X className="w-4 h-4" /></button>
                  </div>
                ))}
              </div>
            </div>
          )}


        </motion.div>
      </AnimatePresence>

      {/* ── SIDEBAR ──────────────────────────────────────────────────── */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40" />
            <motion.aside initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 260 }}
              className="fixed top-0 right-0 h-full w-[285px] bg-[#0a0a0a] border-l border-white/8 z-50 flex flex-col shadow-2xl">
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
                <div>
                  <h3 className="text-lg font-black italic uppercase tracking-tighter">Players</h3>
                  <p className="text-[9px] text-white/20 uppercase tracking-widest">{players.length} in room</p>
                </div>
                <button onClick={() => setSidebarOpen(false)} className="w-8 h-8 bg-white/5 rounded-xl flex items-center justify-center text-white/40">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar">
                {players.map((p, i) => (
                  <motion.div key={p.id} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                    <div className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all ${currentTurn === i ? 'bg-electric-purple/15 border-electric-purple/50 scale-[1.02]' : 'bg-white/[0.02] border-white/5 opacity-50'}`}>
                      <div className="relative">
                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-xl">{p.avatar}</div>
                        <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-[#0a0a0a] ${p.status === 'online' ? 'bg-green-400' : 'bg-zinc-600'}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-black uppercase italic truncate leading-none">{p.name}{p.id === socket?.id ? ' ★' : ''}</p>
                        <p className={`text-[9px] mt-0.5 font-bold ${currentTurn === i ? 'text-electric-purple' : 'text-white/20'}`}>{p.score ?? 0} pts</p>
                      </div>
                      {currentTurn === i && <div className="w-2 h-2 rounded-full bg-electric-purple animate-ping" />}
                    </div>
                  </motion.div>
                ))}
              </div>
              <div className="p-4 border-t border-white/5 space-y-2">
                <div className="p-4 bg-white/[0.02] border border-white/8 rounded-2xl text-center cursor-pointer" onClick={() => copy()}>
                  <p className="text-[8px] font-black uppercase tracking-widest text-white/20 mb-1">Room Code</p>
                  <p className="text-3xl font-mono font-black text-radiant-gold">{roomCode}</p>
                  {copied && <p className="text-[8px] text-green-400 mt-1 font-black">Copied!</p>}
                </div>
                <button onClick={() => { setSidebarOpen(false); setShowEndConfirm(true); }} className="w-full h-9 flex items-center justify-center gap-2 rounded-xl border border-red-500/20 text-red-400/50 hover:text-red-400 hover:bg-red-500/10 text-[10px] font-black uppercase transition-all">
                  <LogOut className="w-3 h-3" />End Game
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
