import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Zap, ChevronLeft } from 'lucide-react';

/* ── Static Data ──────────────────────────────────────── */
const GAMES = [
  { id: 'rps',      icon: '🪨', name: 'Rock Paper Scissors', desc: 'Best of 3 — first to 2 wins' },
  { id: 'ttt',      icon: '⭕', name: 'Tic-Tac-Toe',         desc: 'Classic 3×3 board' },
  { id: 'numguess', icon: '🔢', name: 'Number Guess',         desc: 'Think 1–100, guess with hints' },
  { id: 'wyr',      icon: '🤔', name: 'Would You Rather',     desc: '5 rounds, compare choices' },
  { id: 'reflex',   icon: '⚡', name: 'Reflex Snatch',      desc: '10 rounds, click as fast as you can!' },
];

const WYR_POOL = [
  ['Always be too hot', 'Always be too cold'],
  ['Lose all your money', 'Lose all your memories'],
  ['Be invisible', 'Be able to fly'],
  ['Live without music', 'Live without movies'],
  ['Speak every language', 'Play every instrument'],
  ['Have no friends but be rich', 'Have great friends but be poor'],
  ['Travel to the past', 'Travel to the future'],
  ['Always tell the truth', 'Lie whenever you want'],
  ['Be famous but unhappy', 'Be unknown but happy'],
  ['Only eat sweet foods', 'Only eat savoury foods'],
];

const REFLEX_EMOJIS = ['🔥', '⚡', '💣', '🌟', '🍀', '💎', '🎯', '🚀', '🌈', '🍦', '🍕', '🦊', '👾', '👑'];

function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5); }
function pickN(arr, n) { return shuffle(arr).slice(0, n); }

/* ── Result Banner ─────────────────────────────────────── */
// FIX: emoji detection was checking 'won' but result strings say 'wins' / 'draw' / 'matched'
function ResultBanner({ text, sub, onPlayAgain, onQuit }) {
  const emoji = text.toLowerCase().includes('draw') || text.includes('🤝')
    ? '🤝'
    : text.toLowerCase().includes('win')
      ? '🏆'
      : '😈';
  return (
    <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
      className="flex flex-col items-center gap-4 p-6 text-center">
      <p className="text-5xl">{emoji}</p>
      <h3 className="text-2xl font-black italic uppercase tracking-tighter">{text}</h3>
      {sub && <p className="text-white/40 text-sm">{sub}</p>}
      <div className="flex gap-3 mt-2">
        <button onClick={onPlayAgain} className="flex-1 h-10 px-5 bg-electric-purple rounded-xl text-[11px] font-black uppercase italic">
          Play Again ↺
        </button>
        <button onClick={onQuit} className="h-10 px-5 bg-white/5 border border-white/10 rounded-xl text-[11px] font-black uppercase text-white/40">
          Quit
        </button>
      </div>
    </motion.div>
  );
}

/* ══ GAME 1: Rock Paper Scissors ═══════════════════════ */
function RPSGame({ isHost, myName, oppName, send, onEvent, resultMsg, onQuit }) {
  const RPS = ['🪨', '📄', '✂️'];
  const NAMES = { '🪨': 'rock', '📄': 'paper', '✂️': 'scissors' };
  const BEAT = { rock: 'scissors', paper: 'rock', scissors: 'paper' };

  const [myPick, setMyPick]         = useState(null);
  const [oppPick, setOppPick]       = useState(null);
  const [round, setRound]           = useState(1);
  const [score, setScore]           = useState({ me: 0, opp: 0 });
  const [revealed, setRevealed]     = useState(false);
  const [roundResult, setRoundResult] = useState('');
  const [done, setDone]             = useState(false);
  const [finalResult, setFinalResult] = useState('');

  // Use refs so callbacks always have the latest values without re-registering listeners
  const myPickRef    = useRef(null);
  const pendingOpp   = useRef(null);
  const scoreRef     = useRef({ me: 0, opp: 0 });
  const roundRef     = useRef(1);
  const doneRef      = useRef(false);
  const timerRef     = useRef(null);

  const resetAll = useCallback(() => {
    clearTimeout(timerRef.current);
    myPickRef.current = null;
    pendingOpp.current = null;
    scoreRef.current = { me: 0, opp: 0 };
    roundRef.current = 1;
    doneRef.current = false;
    setMyPick(null); setOppPick(null); setRevealed(false); setRoundResult('');
    setRound(1); setScore({ me: 0, opp: 0 }); setDone(false); setFinalResult('');
  }, []);

  // FIX: reveal uses refs — no stale closure on score/done
  const reveal = useCallback((mp, op) => {
    if (doneRef.current) return; // guard: don't advance after match ends
    setOppPick(op);
    setRevealed(true);
    let res = '';
    let ds = { me: 0, opp: 0 };
    if (mp === op) { res = 'Draw! 🤝'; }
    else if (BEAT[mp] === op) { res = 'You win this round! 🎉'; ds.me = 1; }
    else { res = 'Opponent wins! 😈'; ds.opp = 1; }
    setRoundResult(res);

    const ns = { me: scoreRef.current.me + ds.me, opp: scoreRef.current.opp + ds.opp };
    scoreRef.current = ns;
    setScore(ns);

    if (ns.me >= 4 || ns.opp >= 4) {
      doneRef.current = true;
      const fr = ns.me >= 4 ? `${myName} wins the match! 🏆` : `${oppName} wins the match!`;
      setFinalResult(fr);
      resultMsg(ns.me >= 4 ? `🏆 RPS: ${myName} wins!` : `😈 RPS: ${oppName} wins!`);
      setDone(true);
      return; // don't schedule auto-advance if match is over
    }

    // Auto-advance to next round
    timerRef.current = setTimeout(() => {
      myPickRef.current = null;
      pendingOpp.current = null;
      roundRef.current += 1;
      setMyPick(null); setOppPick(null); setRevealed(false); setRoundResult('');
      setRound(r => r + 1);
    }, 2200);
  }, [myName, oppName, resultMsg]);

  // FIX: register handler once — use refs inside so no stale values
  useEffect(() => {
    return onEvent(ev => {
      if (ev.g !== 'rps') return;
      if (ev.t === 'pick') {
        if (myPickRef.current !== null) reveal(myPickRef.current, ev.choice);
        else pendingOpp.current = ev.choice;
      }
      if (ev.t === 'restart') resetAll();
    });
  }, [onEvent, reveal, resetAll]); // stable callbacks via useCallback

  const pick = (c) => {
    if (myPickRef.current || revealed || doneRef.current) return;
    const choice = NAMES[c];
    myPickRef.current = choice;
    setMyPick(choice);
    send({ g: 'rps', t: 'pick', choice });
    if (pendingOpp.current) reveal(choice, pendingOpp.current);
  };

  const restart = () => { resetAll(); send({ g: 'rps', t: 'restart' }); };

  if (done) return <ResultBanner text={finalResult} sub={`Score: ${score.me} — ${score.opp}`} onPlayAgain={restart} onQuit={onQuit} />;

  return (
    <div className="flex flex-col items-center gap-5 p-4">
      <div className="flex items-center gap-4 text-sm font-black">
        <span className="text-electric-purple">{myName}: {score.me}</span>
        <span className="text-white/20">Round {round} • First to 4</span>
        <span className="text-radiant-gold">{oppName}: {score.opp}</span>
      </div>

      <AnimatePresence mode="wait">
        {!revealed ? (
          <motion.div key="pick" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-4">
            <p className="text-white/40 text-sm font-bold">{myPick ? '⏳ Waiting for opponent…' : 'Choose your weapon!'}</p>
            <div className="flex gap-3">
              {RPS.map(c => (
                <motion.button key={c} whileTap={{ scale: 0.9 }} onClick={() => pick(c)}
                  className={`w-16 h-16 text-3xl rounded-2xl border-2 transition-all ${myPick === NAMES[c] ? 'border-electric-purple bg-electric-purple/20 scale-110' : myPick ? 'border-white/5 opacity-20' : 'border-white/15 bg-white/5 hover:scale-105 hover:border-white/40'}`}>
                  {c}
                </motion.button>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div key="reveal" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-6">
              <div className="text-center">
                <p className="text-[9px] font-black uppercase text-white/20 mb-1">You</p>
                <span className="text-5xl">{RPS.find(c => NAMES[c] === myPick)}</span>
              </div>
              <span className="text-white/20 font-black">VS</span>
              <div className="text-center">
                <p className="text-[9px] font-black uppercase text-white/20 mb-1">{oppName}</p>
                <span className="text-5xl">{RPS.find(c => NAMES[c] === oppPick)}</span>
              </div>
            </div>
            <p className="font-black text-base text-center">{roundResult}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ══ GAME 2: Tic-Tac-Toe ═══════════════════════════════ */
function TicTacToe({ isHost, myName, oppName, send, onEvent, resultMsg, onQuit }) {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [turn, setTurn]   = useState(0); // 0=X(host), 1=O(guest)
  const [done, setDone]   = useState(false);
  const [winner, setWinner] = useState(null);

  // FIX: use refs so onEvent handler never has stale board/turn
  const boardRef = useRef(Array(9).fill(null));
  const turnRef  = useRef(0);
  const doneRef  = useRef(false);

  const myMark = isHost ? 'X' : 'O';

  const WINS = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
  const checkWin = (b) => {
    for (const [a, bb, c] of WINS) if (b[a] && b[a] === b[bb] && b[a] === b[c]) return b[a];
    if (b.every(Boolean)) return 'draw';
    return null;
  };

  // FIX: applyMove reads from ref, writes to state+ref
  const applyMove = useCallback((idx, byMark) => {
    if (doneRef.current) return;
    const nb = [...boardRef.current];
    nb[idx] = byMark;
    boardRef.current = nb;
    setBoard([...nb]);
    const w = checkWin(nb);
    if (w) {
      doneRef.current = true;
      setDone(true);
      if (w === 'draw') { setWinner('draw'); resultMsg('🤝 Tic-Tac-Toe: Draw!'); }
      else {
        const winName = w === myMark ? myName : oppName;
        setWinner(w); resultMsg(`🏆 Tic-Tac-Toe: ${winName} wins!`);
      }
    } else {
      const nt = 1 - turnRef.current;
      turnRef.current = nt;
      setTurn(nt);
    }
  }, [myMark, myName, oppName, resultMsg]);

  // FIX: register once — applyMove is stable via useCallback
  useEffect(() => {
    return onEvent(ev => {
      if (ev.g !== 'ttt') return;
      if (ev.t === 'move') {
        // Opponent's mark is the opposite of mine
        const oppMark = myMark === 'X' ? 'O' : 'X';
        applyMove(ev.idx, oppMark);
      }
      if (ev.t === 'restart') reset();
    });
  }, [onEvent, applyMove, myMark]);

  const move = (i) => {
    const isMyTurn = (turnRef.current === 0 && isHost) || (turnRef.current === 1 && !isHost);
    if (!isMyTurn || boardRef.current[i] || doneRef.current) return;
    applyMove(i, myMark);
    send({ g: 'ttt', t: 'move', idx: i });
  };

  const reset = () => {
    boardRef.current = Array(9).fill(null);
    turnRef.current = 0;
    doneRef.current = false;
    setBoard(Array(9).fill(null)); setTurn(0); setDone(false); setWinner(null);
  };
  const restart = () => { reset(); send({ g: 'ttt', t: 'restart' }); };

  const isMyTurn = (turn === 0 && isHost) || (turn === 1 && !isHost);
  const winnerName = winner === 'draw' ? null : winner === myMark ? myName : oppName;

  if (done) return <ResultBanner
    text={winner === 'draw' ? "It's a Draw! 🤝" : `${winnerName} Wins! 🏆`}
    onPlayAgain={restart} onQuit={onQuit} />;

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <div className="flex items-center gap-3 text-sm font-black">
        <span className={`px-3 py-1 rounded-full ${isHost ? 'bg-electric-purple/20 text-electric-purple' : 'bg-white/5 text-white/40'}`}>
          {myName} ({myMark})
        </span>
        <span className="text-white/20">vs</span>
        <span className={`px-3 py-1 rounded-full ${!isHost ? 'bg-radiant-gold/20 text-radiant-gold' : 'bg-white/5 text-white/40'}`}>
          {oppName} ({myMark === 'X' ? 'O' : 'X'})
        </span>
      </div>
      <p className="text-[10px] font-black uppercase text-white/30">
        {isMyTurn ? '— Your Turn —' : `— ${oppName}'s Turn —`}
      </p>
      <div className="grid grid-cols-3 gap-2">
        {board.map((cell, i) => (
          <motion.button key={i} whileTap={{ scale: 0.9 }} onClick={() => move(i)}
            className={`w-16 h-16 rounded-2xl border-2 text-2xl font-black flex items-center justify-center transition-all
              ${!cell && isMyTurn ? 'border-white/15 bg-white/5 hover:border-electric-purple/50 hover:bg-electric-purple/10' : 'border-white/8 bg-white/[0.02]'}
              ${cell === 'X' ? 'text-electric-purple border-electric-purple/30 bg-electric-purple/10' : ''}
              ${cell === 'O' ? 'text-radiant-gold border-radiant-gold/30 bg-radiant-gold/10' : ''}`}>
            {cell}
          </motion.button>
        ))}
      </div>
    </div>
  );
}

/* ══ GAME 3: Number Guess (Fair 2-Round Edition) ════════
   Round 1: Host sets secret, Guest guesses.
   Round 2: Guest sets secret, Host guesses.
   Winner: Who took fewer tries ("low tail").
══════════════════════════════════════════════════════ */
function NumberGuess({ isHost, myName, oppName, send, onEvent, resultMsg, onQuit }) {
  const [round, setRound]         = useState(1);
  const [phase, setPhase]         = useState('setup'); // 'setup' or 'playing'
  const [secretSet, setSecretSet] = useState(false);
  const [guess, setGuess]         = useState('');
  const [guesses, setGuesses]     = useState([]);
  const [myTries, setMyTries]     = useState(0);
  const [oppTries, setOppTries]   = useState(0);
  const [done, setDone]           = useState(false);
  const [resultText, setResultText] = useState('');

  const secretRef       = useRef('');
  const [secretDisplay, setSecretDisplay] = useState('');
  const triesRef        = useRef(0);
  const doneRef         = useRef(false);

  // Helper to determine if I'm thinking or guessing this round
  const amIThinker = (round === 1 && isHost) || (round === 2 && !isHost);
  const amIGuesser = (round === 1 && !isHost) || (round === 2 && isHost);

  const resetAll = useCallback(() => {
    setRound(1); setPhase('setup'); setSecretSet(false); setSecretDisplay('');
    setGuess(''); setGuesses([]); setMyTries(0); setOppTries(0);
    setDone(false); setResultText('');
    secretRef.current = ''; triesRef.current = 0; doneRef.current = false;
  }, []);

  const finishGame = useCallback((mFinal, oFinal) => {
    let result = '';
    if (mFinal < oFinal) result = `You win! 🏆 (${mFinal} vs ${oFinal} tries)`;
    else if (oFinal < mFinal) result = `${oppName} wins! 😈 (${oFinal} vs ${mFinal} tries)`;
    else result = `It's a draw! 🤝 (${mFinal} tries each)`;
    
    setResultText(result);
    setDone(true);
    resultMsg(`🔢 Number Guess: ${result}`);
  }, [oppName, resultMsg]);

  useEffect(() => {
    return onEvent(ev => {
      if (ev.g !== 'ng') return;

      if (ev.t === 'secret_ready') {
        setSecretSet(true);
        setPhase('playing');
        triesRef.current = 0;
      }

      if (ev.t === 'guess') {
        const n = parseInt(ev.val);
        const s = parseInt(secretRef.current);
        const hint = n < s ? '📈 Too low!' : n > s ? '📉 Too high!' : '✅ Correct!';
        setGuesses(prev => [...prev, { val: ev.val, hint }]); // thinker also tracks
        send({ g: 'ng', t: 'hint', val: ev.val, hint });
        
        if (n === s) {
          const finishedTries = triesRef.current + 1; // Wait, we need to track triesRef for thinker too
          if (round === 1) {
            send({ g: 'ng', t: 'round_1_end', tries: finishedTries });
            setOppTries(finishedTries);
            setRound(2); setPhase('setup'); setSecretSet(false); setGuesses([]);
          } else {
            send({ g: 'ng', t: 'game_over_sync', hostFinal: isHost ? myTries : finishedTries, guestFinal: isHost ? finishedTries : myTries });
            finishGame(myTries, finishedTries);
          }
        } else {
          triesRef.current += 1;
        }
      }

      if (ev.t === 'hint') {
        triesRef.current += 1;
        setGuesses(prev => [...prev, { val: ev.val, hint: ev.hint }]);
        if (ev.hint.includes('Correct')) {
          setMyTries(triesRef.current);
        }
      }

      if (ev.t === 'round_1_end') {
        setMyTries(ev.tries);
        setRound(2); setPhase('setup'); setSecretSet(false); setGuesses([]);
      }

      if (ev.t === 'game_over_sync') {
        const myFinal = isHost ? ev.hostFinal : ev.guestFinal;
        const oppFinal = isHost ? ev.guestFinal : ev.hostFinal;
        finishGame(myFinal, oppFinal);
      }

      if (ev.t === 'restart') resetAll();
    });
  }, [onEvent, isHost, round, send, myTries, oppTries, finishGame, resetAll]);

  const submitSecret = () => {
    const n = parseInt(secretDisplay);
    if (!n || n < 1 || n > 100) return;
    secretRef.current = String(n);
    setSecretSet(true);
    setPhase('playing');
    triesRef.current = 0; // Reset for thinker
    send({ g: 'ng', t: 'secret_ready' });
  };

  const submitGuess = () => {
    const n = parseInt(guess);
    if (!n || n < 1 || n > 100 || done) return;
    send({ g: 'ng', t: 'guess', val: String(n) });
    setGuess('');
  };

  const restart = () => { resetAll(); send({ g: 'ng', t: 'restart' }); };

  if (done) return <ResultBanner text={resultText} onPlayAgain={restart} onQuit={onQuit} />;

  return (
    <div className="flex flex-col items-center gap-4 p-4 w-full h-full">
      <div className="flex flex-col items-center text-center">
        <h3 className="font-black uppercase italic text-lg text-electric-purple">Round {round} / 2</h3>
        <p className="text-[10px] font-black uppercase text-white/30 tracking-widest">
          {amIThinker ? 'Your turn to set secret' : `Guess ${oppName}'s secret`}
        </p>
      </div>

      {amIThinker ? (
        !secretSet ? (
          <div className="flex flex-col items-center gap-4 p-6 bg-white/5 border border-white/10 rounded-3xl w-full">
            <p className="text-3xl">🧠</p>
            <p className="font-black uppercase italic text-sm">Pick a number (1–100)</p>
            <div className="flex gap-2 w-full max-w-xs">
              <input type="number" min="1" max="100" value={secretDisplay}
                onChange={e => setSecretDisplay(e.target.value)}
                placeholder="Secret…"
                className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-center font-black outline-none focus:border-electric-purple" />
              <button onClick={submitSecret} className="px-5 bg-electric-purple rounded-xl text-xs font-black uppercase">Set</button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 w-full">
             <p className="text-xs font-black uppercase text-white/20 animate-pulse">Opponent is guessing…</p>
             <div className="px-4 py-2 bg-radiant-gold/10 border border-radiant-gold/20 rounded-xl mb-2">
                <span className="text-[10px] uppercase font-black text-radiant-gold/60 mr-2">Secret:</span>
                <span className="font-black text-radiant-gold text-lg">{secretRef.current}</span>
             </div>
             <div className="w-full space-y-2 max-h-40 overflow-y-auto px-2">
                {guesses.map((g, i) => (
                  <div key={i} className="flex justify-between items-center px-4 py-2 bg-white/5 rounded-xl text-xs">
                    <span className="font-black">{g.val}</span>
                    <span className="text-[10px] uppercase font-black text-white/30">{g.hint}</span>
                  </div>
                ))}
             </div>
          </div>
        )
      ) : (
        !secretSet ? (
          <div className="flex flex-col items-center gap-4 py-10 animate-pulse">
            <p className="text-4xl text-white/10">🎲</p>
            <p className="font-black uppercase italic text-xs text-white/40">Waiting for {oppName} to pick…</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 w-full">
            <div className="flex gap-2 w-full max-w-xs">
              <input type="number" min="1" max="100" value={guess} onChange={e => setGuess(e.target.value)}
                onKeyDown={e=> e.key === 'Enter' && submitGuess()}
                placeholder="Guess…"
                className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-center font-black outline-none focus:border-electric-purple" />
              <button onClick={submitGuess} className="px-5 bg-electric-purple rounded-xl text-xs font-black uppercase italic">Go!</button>
            </div>
            <div className="w-full space-y-2 max-h-48 overflow-y-auto px-2">
              {guesses.map((g, i) => (
                <div key={i} className="flex justify-between items-center px-4 py-2 bg-white/5 rounded-xl text-xs border border-white/5">
                  <span className="font-black">#{i+1}: {g.val}</span>
                  <span className={g.hint.includes('Correct') ? 'text-green-400 font-black uppercase' : 'text-white/30'}>{g.hint}</span>
                </div>
              ))}
            </div>
          </div>
        )
      )}
      <div className="mt-auto flex gap-4 w-full pt-4 border-t border-white/5 text-[10px] font-black uppercase">
        <div className="flex-1 flex flex-col items-center text-electric-purple">
          <span>You</span>
          <span className="text-white text-base">{(round === 1 && isHost) ? '-' : (round === 2 && isHost) ? triesRef.current : myTries}</span>
        </div>
        <div className="flex-1 flex flex-col items-center text-radiant-gold border-l border-white/10">
          <span>{oppName}</span>
          <span className="text-white text-base">{(round === 1 && !isHost) ? '-' : (round === 2 && !isHost) ? triesRef.current : oppTries}</span>
        </div>
      </div>
    </div>
  );
}

/* ══ GAME 4: Would You Rather ═══════════════════════════ */
function WouldYouRather({ isHost, myName, oppName, send, onEvent, resultMsg, onQuit }) {
  const questions = useRef(isHost ? pickN(WYR_POOL, 5) : null);
  const [round, setRound]     = useState(0);
  const [myVote, setMyVote]   = useState(null);
  const [oppVote, setOppVote] = useState(null);
  const [done, setDone]       = useState(false);

  // FIX: track matches in ref so setTimeout callback always reads correct count
  const matchesRef = useRef(0);
  const [matchesDisplay, setMatchesDisplay] = useState(0);
  const roundRef = useRef(0);

  const resetAll = useCallback(() => {
    matchesRef.current = 0;
    roundRef.current = 0;
    questions.current = isHost ? pickN(WYR_POOL, 5) : null;
    setRound(0); setMyVote(null); setOppVote(null);
    setDone(false); setMatchesDisplay(0);
    if (isHost && questions.current) send({ g: 'wyr', t: 'questions', questions: questions.current });
  }, [isHost, send]);

  useEffect(() => {
    return onEvent(ev => {
      if (ev.g !== 'wyr') return;
      if (ev.t === 'questions') { questions.current = ev.questions; }
      if (ev.t === 'vote') { setOppVote(ev.choice); }
      if (ev.t === 'restart') resetAll();
    });
  }, [onEvent, resetAll]);

  // Host sends questions at start
  useEffect(() => {
    if (isHost && questions.current) send({ g: 'wyr', t: 'questions', questions: questions.current });
  }, []); // eslint-disable-line

  const restart = () => { send({ g: 'wyr', t: 'restart' }); resetAll(); };

  const vote = (choice) => {
    if (myVote !== null) return;
    setMyVote(choice);
    send({ g: 'wyr', t: 'vote', choice });
  };

  // FIX: auto-advance uses refs for matches/round — no stale closure
  useEffect(() => {
    if (myVote !== null && oppVote !== null) {
      const matched = myVote === oppVote;
      if (matched) {
        matchesRef.current += 1;
        setMatchesDisplay(matchesRef.current);
      }
      const timer = setTimeout(() => {
        const nextRound = roundRef.current + 1;
        if (nextRound >= 5) {
          setDone(true);
          resultMsg(`🤔 WYR: ${myName} & ${oppName} matched ${matchesRef.current}/5 answers!`);
        } else {
          roundRef.current = nextRound;
          setRound(nextRound);
          setMyVote(null);
          setOppVote(null);
        }
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [myVote, oppVote, myName, oppName, resultMsg]);

  const qList = questions.current;

  // FIX: done check before null check — both can be true simultaneously
  if (done) return <ResultBanner
    text={`You matched ${matchesDisplay}/5 answers!`}
    sub={matchesDisplay >= 4 ? '🔥 You two think alike!' : matchesDisplay >= 2 ? '😄 Pretty similar!' : '🙈 Very different minds!'}
    onPlayAgain={restart} onQuit={onQuit} />;

  if (!qList) return (
    <div className="flex flex-col items-center gap-3 p-6 text-center">
      <p className="text-4xl animate-pulse">⏳</p>
      <p className="font-black uppercase italic">Loading questions…</p>
    </div>
  );

  const q = qList[round];
  const bothVoted = myVote !== null && oppVote !== null;

  return (
    <div className="flex flex-col items-center gap-4 p-4 w-full text-center">
      <p className="text-[10px] font-black uppercase tracking-widest text-electric-purple/60">Round {round + 1} / 5</p>
      <p className="font-black text-base italic uppercase tracking-tight">Would You Rather…</p>
      <div className="w-full space-y-2">
        {q.map((opt, i) => {
          const letter = i === 0 ? 'A' : 'B';
          let cls = 'border-white/10 bg-white/5 hover:border-electric-purple/50';
          if (bothVoted) {
            if (myVote === letter && oppVote === letter) cls = 'border-green-400/60 bg-green-400/10 text-green-300';
            else if (myVote === letter) cls = 'border-electric-purple/60 bg-electric-purple/10';
            else if (oppVote === letter) cls = 'border-radiant-gold/60 bg-radiant-gold/10';
          } else if (myVote === letter) cls = 'border-electric-purple bg-electric-purple/20 scale-[1.02]';
          return (
            <button key={i} onClick={() => vote(letter)} disabled={myVote !== null}
              className={`w-full p-3 rounded-2xl border-2 text-sm font-bold text-left transition-all ${cls}`}>
              <span className="font-black text-white/40 mr-2 uppercase text-[10px]">{letter}.</span>
              {opt}
              {bothVoted && (
                <span className="float-right text-[10px] font-black">
                  {myVote === letter && '← You'}
                  {oppVote === letter && ` ← ${oppName}`}
                </span>
              )}
            </button>
          );
        })}
      </div>
      {!bothVoted && (
        <p className="text-white/20 text-xs animate-pulse">
          {myVote ? `Waiting for ${oppName}…` : 'Pick one!'}
        </p>
      )}
      {bothVoted && (
        <p className={`font-black text-sm ${myVote === oppVote ? 'text-green-400' : 'text-white/40'}`}>
          {myVote === oppVote ? '🎉 You matched!' : '🙈 Different choices!'}
        </p>
      )}
    </div>
  );
}

/* ══ GAME 5: Reflex Snatch ═══════════════════════════════ */
function ReflexSnatch({ isHost, myName, oppName, send, onEvent, resultMsg, onQuit }) {
  const [round, setRound]       = useState(0); // 0-10
  const [score, setScore]       = useState({ me: 0, opp: 0 });
  const [targetPos, setTargetPos] = useState(null); // 0-8
  const [targetEmoji, setTargetEmoji] = useState('⚡');
  const [ready, setReady]       = useState(false);
  const [countdown, setCountdown] = useState(null);
  const [done, setDone]         = useState(false);
  const [winnerMessage, setWinnerMessage] = useState('');

  const scoreRef    = useRef({ me: 0, opp: 0 });
  const roundRef    = useRef(0);
  const targetIdRef = useRef(0); // auto-inc ID to handle late arrivals
  const timerRef    = useRef(null);

  const startNextRound = useCallback(() => {
    if (roundRef.current >= 10) {
      setDone(true);
      const s = scoreRef.current;
      const wm = s.me > s.opp ? `${myName} Wins! 🏆` : s.opp > s.me ? `${oppName} Wins! 😈` : "It's a Draw! 🤝";
      setWinnerMessage(wm);
      resultMsg(`⚡ Reflex: ${wm} (${s.me}-${s.opp})`);
      return;
    }

    setCountdown(3);
    setReady(false);
    setTargetPos(null);

    // Host picks random position and emoji after countdown
    if (isHost) {
      const delay = 1000 + Math.random() * 2000;
      const pos = Math.floor(Math.random() * 9);
      const emoji = REFLEX_EMOJIS[Math.floor(Math.random() * REFLEX_EMOJIS.length)];
      targetIdRef.current += 1;
      
      setTimeout(() => {
        send({ g: 'reflex', t: 'spawn', pos, emoji, id: targetIdRef.current, round: roundRef.current });
        // Host locally spawns
        setTargetPos(pos);
        setTargetEmoji(emoji);
        setReady(true);
      }, 3000 + delay);
    }
  }, [isHost, myName, oppName, resultMsg, send]);

  useEffect(() => {
    if (countdown !== null && countdown > 0) {
      const t = setTimeout(() => setCountdown(c => c - 1), 1000);
      return () => clearTimeout(t);
    } else if (countdown === 0) {
      setCountdown(null);
    }
  }, [countdown]);

  const resetAll = useCallback(() => {
    scoreRef.current = { me: 0, opp: 0 };
    roundRef.current = 0;
    targetIdRef.current = 0;
    setScore({ me: 0, opp: 0 });
    setRound(0);
    setDone(false);
    setReady(false);
    setTargetPos(null);
    setCountdown(null);
    startNextRound();
  }, [startNextRound]);

  useEffect(() => {
    return onEvent(ev => {
      if (ev.g !== 'reflex') return;

      if (ev.t === 'spawn') {
        setTargetPos(ev.pos);
        setTargetEmoji(ev.emoji);
        setTargetId(ev.id); // we need a way to track this id locally
        setReady(true);
      }

      if (ev.t === 'claimed' && ev.round === roundRef.current) {
        // Someone else claimed it first
        const ns = { ...scoreRef.current, opp: scoreRef.current.opp + 1 };
        scoreRef.current = ns;
        setScore(ns);
        roundRef.current += 1;
        setRound(roundRef.current);
        startNextRound();
      }

      if (ev.t === 'restart') resetAll();
    });
  }, [onEvent, startNextRound, resetAll]);

  // We need to keep targetIdRef updated
  const [targetId, setTargetId] = useState(0);

  const snatch = () => {
    if (!ready || targetPos === null || done) return;
    setReady(false);
    setTargetPos(null);
    
    // Optimistic win? In 2-player reflex, first to send usually wins
    const ns = { ...scoreRef.current, me: scoreRef.current.me + 1 };
    scoreRef.current = ns;
    setScore(ns);
    
    send({ g: 'reflex', t: 'claimed', round: roundRef.current, id: targetId });
    roundRef.current += 1;
    setRound(roundRef.current);
    startNextRound();
  };

  useEffect(() => {
    startNextRound();
  }, []); // eslint-disable-line

  if (done) return <ResultBanner text={winnerMessage} sub={`Final Score: ${score.me} - ${score.opp}`} onPlayAgain={() => { send({ g: 'reflex', t: 'restart' }); resetAll(); }} onQuit={onQuit} />;

  return (
    <div className="flex flex-col items-center gap-4 p-4 w-full h-full">
      <div className="flex items-center justify-between w-full text-[10px] font-black uppercase tracking-widest text-white/40">
        <div className="text-electric-purple">{myName}: {score.me}</div>
        <div className="text-white">Round {round + 1}/10</div>
        <div className="text-radiant-gold">{oppName}: {score.opp}</div>
      </div>

      <div className="flex-1 w-full flex items-center justify-center relative">
        <div className="grid grid-cols-3 gap-3 w-full max-w-[280px]">
          {Array(9).fill(0).map((_, i) => (
            <div key={i} className="aspect-square bg-white/5 border border-white/5 rounded-2xl flex items-center justify-center relative">
              {targetPos === i && ready && (
                <motion.button initial={{ scale: 0 }} animate={{ scale: 1 }} whileTap={{ scale: 0.8 }}
                  onClick={snatch}
                  className="absolute inset-2 bg-electric-purple/20 border-2 border-electric-purple rounded-xl text-3xl flex items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.4)]">
                  {targetEmoji}
                </motion.button>
              )}
            </div>
          ))}
        </div>

        <AnimatePresence>
          {countdown !== null && (
            <motion.div initial={{ scale: 2, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-3xl z-10">
              <span className="text-6xl font-black italic text-electric-purple drop-shadow-lg">
                {countdown === 0 ? 'GO!' : countdown}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <p className="text-[10px] font-black uppercase italic text-white/20 animate-pulse">
        {ready ? 'SNATCH IT!' : 'Get ready…'}
      </p>
    </div>
  );
}

/* ══ MAIN MINI-GAMES COMPONENT ══════════════════════════ */
const GAME_MAP = { rps: RPSGame, ttt: TicTacToe, numguess: NumberGuess, wyr: WouldYouRather, reflex: ReflexSnatch };

export default function MiniGames({ socket, roomCode, username, myId, players, onClose, onSystemMsg, initialState }) {
  const [view, setView]         = useState(initialState?.view || 'picker');
  const [selGame, setSelGame]   = useState(initialState?.gameId || null);
  const [opponent, setOppState] = useState(initialState?.opponent || null);
  const [isHost, setIsHost]     = useState(initialState?.isHost ?? false); // FIX: default false — not host until confirmed
  const [activeGame, setActiveGame] = useState(initialState?.gameId || null);
  const [toast, setToast]       = useState('');
  const evtHandlers = useRef([]);
  const selGameRef  = useRef(initialState?.gameId || null);
  // FIX: opponent in ref for stable sendToOpp
  const opponentRef = useRef(initialState?.opponent || null);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const relayTo = useCallback((toId, data) => {
    socket.emit('mg_relay', { code: roomCode, to: toId, data });
  }, [socket, roomCode]);

  const onEvent = useCallback((handler) => {
    evtHandlers.current.push(handler);
    return () => { evtHandlers.current = evtHandlers.current.filter(h => h !== handler); };
  }, []);

  // FIX: sendToOpp reads from opponentRef — never stale even when opponent updates
  const sendToOpp = useCallback((data) => {
    if (opponentRef.current) relayTo(opponentRef.current.id, { ...data, _from: myId });
  }, [relayTo, myId]);

  useEffect(() => {
    const handler = (data) => {
      if (!data) return;
      if (data.type === 'mg_invite') return; // handled in App.jsx
      if (data.type === 'mg_accepted') {
        const opp = { id: data.fromId, name: data.fromName };
        opponentRef.current = opp;
        setOppState(opp);
        setIsHost(true);
        setActiveGame(selGameRef.current);
        setView('playing');
        return;
      }
      if (data.type === 'mg_declined') {
        showToast(`${data.fromName} declined your challenge.`);
        setView('picker');
        return;
      }
      // Opponent quit mid-game — reset back to lobby
      if (data.type === 'mg_quit') {
        showToast(`${data.fromName} left the game.`);
        setTimeout(onClose, 1200); // Small delay to see the message
        return;
      }
      evtHandlers.current.forEach(h => h(data));
    };
    socket.on('mg_event', handler);
    return () => socket.off('mg_event', handler);
  }, [socket]);

  const handleSelectGame = (id) => {
    setSelGame(id);
    selGameRef.current = id;
    setView('opponent');
  };

  const challenge = (opp) => {
    opponentRef.current = opp;
    setOppState(opp);
    relayTo(opp.id, { type: 'mg_invite', fromId: myId, fromName: username, gameId: selGameRef.current });
    setView('waiting');
  };

  const resetToLobby = (notifyOpp = false, shouldClose = false) => {
    if (notifyOpp && opponentRef.current) {
      relayTo(opponentRef.current.id, { type: 'mg_quit', fromName: username });
    }
    if (shouldClose) {
      onClose();
    } else {
      setView('picker');
      setActiveGame(null);
      evtHandlers.current = [];
    }
  };

  const GameComp = activeGame ? GAME_MAP[activeGame] : null;
  const otherPlayers = players.filter(p => p.id !== myId);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
      className="absolute inset-0 bg-[#080808]/98 backdrop-blur-xl z-40 flex flex-col overflow-hidden rounded-t-3xl">

      {/* Header */}
      <div className="flex-shrink-0 flex items-center justify-between px-4 py-3 border-b border-white/5">
        <div className="flex items-center gap-2">
          {view !== 'picker' && view !== 'playing' && (
            <button onClick={() => resetToLobby(false, false)} className="p-1.5 bg-white/5 rounded-xl mr-1">
              <ChevronLeft className="w-4 h-4 text-white/40" />
            </button>
          )}
          <span className="text-lg">🎮</span>
          <h3 className="font-black uppercase italic tracking-tight text-sm">Mini Games</h3>
          {view === 'playing' && opponent && (
            <span className="text-[9px] font-black text-white/20 uppercase">vs {opponent.name}</span>
          )}
        </div>
        <button onClick={() => view === 'playing' ? resetToLobby(true, true) : onClose()} 
          className="w-8 h-8 bg-white/5 rounded-xl flex items-center justify-center text-white/30 hover:text-white transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="mx-4 mt-2 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-bold text-center">
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Body */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">

          {/* Game Picker */}
          {view === 'picker' && (
            <motion.div key="picker" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="p-4 space-y-3">
              <p className="text-[10px] font-black uppercase tracking-widest text-white/20 text-center mb-4">Choose a game to challenge someone</p>
              {GAMES.map(g => (
                <button key={g.id} onClick={() => handleSelectGame(g.id)}
                  className="w-full flex items-center gap-4 p-4 bg-white/[0.03] border border-white/8 rounded-2xl hover:border-electric-purple/40 hover:bg-electric-purple/5 transition-all group text-left active:scale-[0.99]">
                  <span className="text-3xl">{g.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-black uppercase italic tracking-tight text-sm">{g.name}</p>
                    <p className="text-white/30 text-[11px]">{g.desc}</p>
                  </div>
                  <span className="text-white/10 group-hover:text-electric-purple transition-colors text-lg">›</span>
                </button>
              ))}
            </motion.div>
          )}

          {/* Opponent Selector */}
          {view === 'opponent' && (
            <motion.div key="opp" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="p-4 space-y-3">
              <p className="text-[10px] font-black uppercase tracking-widest text-white/20 text-center mb-2">
                {GAMES.find(g => g.id === selGame)?.icon} Challenge who?
              </p>
              {otherPlayers.length === 0 ? (
                <div className="text-center py-8 text-white/20">
                  <p className="text-3xl mb-2">😅</p>
                  <p className="text-sm font-bold">No other players in the room yet</p>
                </div>
              ) : (
                otherPlayers.map(p => (
                  <button key={p.id} onClick={() => challenge({ id: p.id, name: p.name })}
                    className="w-full flex items-center gap-4 p-4 bg-white/[0.03] border border-white/8 rounded-2xl hover:border-electric-purple/40 hover:bg-electric-purple/5 transition-all text-left active:scale-[0.99]">
                    <span className="text-3xl">{p.avatar}</span>
                    <div>
                      <p className="font-black uppercase italic text-sm">{p.name}</p>
                      <p className="text-white/20 text-[10px] uppercase">{p.score ?? 0} pts</p>
                    </div>
                  </button>
                ))
              )}
            </motion.div>
          )}

          {/* Waiting */}
          {view === 'waiting' && (
            <motion.div key="wait" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center h-48 gap-4 p-6 text-center">
              <div className="w-12 h-12 rounded-full border-2 border-electric-purple border-t-transparent animate-spin" />
              <p className="font-black uppercase italic">Waiting for {opponent?.name}…</p>
              <p className="text-white/30 text-xs">Sent a challenge for {GAMES.find(g => g.id === selGame)?.name}</p>
              <button onClick={resetToLobby} className="text-[10px] font-black uppercase text-white/20 hover:text-white/50">Cancel</button>
            </motion.div>
          )}

          {/* Playing */}
          {view === 'playing' && GameComp && opponent && (
            <motion.div key="game" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <GameComp
                isHost={isHost}
                myName={username}
                oppName={opponent.name}
                send={sendToOpp}
                onEvent={onEvent}
                resultMsg={(msg) => { onSystemMsg(msg); }}
                onQuit={() => resetToLobby(true, true)}
                onRestart={() => {}}
              />
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </motion.div>
  );
}
