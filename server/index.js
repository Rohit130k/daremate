import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const server = http.createServer(app);
const io = new Server(server, { 
  maxHttpBufferSize: 1e7, // 10MB
  pingTimeout: 60000,     // Wait 60s before considering a disconnect
  pingInterval: 25000,    // Ping every 25s
  cors: { 
    origin: process.env.CLIENT_URL || '*', 
    methods: ['GET', 'POST'],
    credentials: true
  } 
});

app.use(cors({
  origin: process.env.CLIENT_URL || '*',
  methods: ['GET', 'POST'],
  credentials: true
}));
app.use(express.json());

// ── Keep Alive Endpoint (Render fix) ──────────────────────────────────────
app.get("/keep-alive", async (req, res) => {
  const start = Date.now();

  // simulate small processing to keep Render from sleeping
  await new Promise(resolve => setTimeout(resolve, 1000));

  res.json({
    status: "alive",
    uptime: process.uptime(),
    responseTime: `${Date.now() - start}ms`
  });
});


// ── Load questions ────────────────────────────────────────────────────────
let questionsData = { categories: {} };
try {
  questionsData = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'questions.json'), 'utf8'));
  console.log('✅ Questions loaded');
} catch (e) { console.error('❌ Questions load failed:', e.message); }

// ── Room store ────────────────────────────────────────────────────────────
// { code -> { config, players[], gameState, currentTurn, round, history[], stats } }
const rooms = new Map();

const getRoom = (code) => rooms.get(code);

const buildQuestion = (room, type) => {
  const enabled = room.config.categories.map(c => c.split(' ')[0]);
  let list = [];
  enabled.forEach(cat => {
    if (questionsData.categories[cat]) {
      const arr = type === 'truth' ? questionsData.categories[cat].truths : questionsData.categories[cat].dares;
      list = [...list, ...arr.map(q => ({ q, cat }))];
    }
  });

  const used = room.usedQuestions[type] || [];
  const pool = list.filter(item => !used.includes(item.q));

  if (pool.length === 0) {
    return { q: "All tasks done! 🏆 You've finished every question in this category!", cat: 'Funny', allDone: true };
  }

  const selected = pool[Math.floor(Math.random() * pool.length)];
  room.usedQuestions[type].push(selected.q);
  return selected;
};

io.on('connection', (socket) => {
  console.log('⚡ Connected:', socket.id);

  // 1. Create Room
  socket.on('create_room', ({ code, type, categories, settings }) => {
    rooms.set(code, {
      config: { type, categories, settings },
      players: [],
      gameState: 'lobby',
      currentTurn: 0,
      round: 0,
      history: [],
      stats: {},          // uid -> { dares, truths, skips, completed }
      usedQuestions: { truth: [], dare: [] }
    });
    console.log(`🏠 Room ${code} created`);
  });

  // 2. Join Room
  socket.on('join_room', ({ code, username, avatar }) => {
    const room = getRoom(code);
    if (!room) {
      socket.emit('room_error', { code: 'NOT_FOUND', message: 'Room not found. Check the code and try again.' });
      return;
    }
    const maxP = room.config.settings?.maxPlayers ?? 15;
    if (room.players.length >= maxP) {
      socket.emit('room_error', { code: 'ROOM_FULL', message: 'This room is full.' });
      return;
    }
    const player = { id: socket.id, name: username, avatar, score: 0, status: 'online', dares: 0, truths: 0, skips: 0 };
    room.players.push(player);
    room.stats[socket.id] = { dares: 0, truths: 0, skips: 0, completed: 0 };
    socket.join(code);
    socket.data.roomCode = code;
    socket.emit('room_state', room);
    io.to(code).emit('player_update', room.players);
    io.to(code).emit('system_message', { text: `${username} joined the room 🎉`, time: now() });
    console.log(`👤 ${username} joined ${code}`);
  });

  // 3. Start Game
  socket.on('start_game', (code) => {
    const room = getRoom(code);
    if (!room) return;
    // Only the first online player (acting host) can start
    const actingHost = room.players.find(p => p.status === 'online');
    if (actingHost?.id !== socket.id) return;
    room.gameState = 'active';
    room.currentTurn = 0;
    room.round = 1;
    io.to(code).emit('game_started', { ...room });
    // Send initial turn so clients know who goes first
    io.to(code).emit('turn_update', { currentTurn: 0, round: 1 });
    io.to(code).emit('system_message', { text: '🎮 Game started! Good luck!', time: now() });
  });

  // 4. Select Truth or Dare → distribute question
  socket.on('select_card', ({ code, type }) => {
    const room = getRoom(code);
    if (!room) return;
    const activePlayer = room.players[room.currentTurn];
    if (!activePlayer || activePlayer.id !== socket.id) return;

    const { q: question, cat: category } = buildQuestion(room, type);
    room.history.push({ type, question, category, player: activePlayer.name, round: room.round });
    if (room.stats[socket.id]) room.stats[socket.id][type === 'truth' ? 'truths' : 'dares']++;
    io.to(code).emit('question_distributed', { 
      type, 
      question, 
      category, 
      player: activePlayer,
      timerOn: !!room.config.settings?.timerOn
    });
  });

  // 5. Complete turn
  socket.on('complete_turn', (code) => {
    const room = getRoom(code);
    if (!room) return;
    const player = room.players[room.currentTurn];
    if (!player || player.id !== socket.id) return;

    if (room.stats[socket.id]) room.stats[socket.id].completed++;
    player.score = (player.score ?? 0) + 10;
    io.to(code).emit('score_update', room.players);
    advanceTurn(code, room);
  });

  // 6. Skip turn (penalty)
  socket.on('skip_turn', (code) => {
    const room = getRoom(code);
    if (!room) return;
    const player = room.players[room.currentTurn];
    if (!player) return;

    // Allow skip if it's the active player OR if they are offline and the "acting host" (first online player) clicks skip
    const actingHost = room.players.find(p => p.status === 'online');
    const isHost = actingHost?.id === socket.id;
    if (player.id !== socket.id && !(isHost && player.status === 'offline')) return;

    if (room.stats[socket.id]) room.stats[socket.id].skips++;
    player.score = Math.max(0, (player.score ?? 0) - 5);
    io.to(code).emit('score_update', room.players);
    io.to(code).emit('system_message', { text: `${player.name} skipped! -5 pts 😅`, time: now() });
    advanceTurn(code, room);
  });

  // 7. Chat message (text / image / audio / gif)
  socket.on('send_message', ({ code, message, username, avatar, type = 'text', mediaUrl = null, replyTo = null }) => {
    const msg = { id: Date.now(), message, username, avatar, type, mediaUrl, time: now(), reactions: {}, replyTo };
    io.to(code).emit('receive_message', msg);
  });

  // 8. Emoji reaction on a message
  socket.on('react_message', ({ code, msgId, emoji, username }) => {
    io.to(code).emit('message_reaction', { msgId, emoji, username });
  });

  // 9. Leave Room
  socket.on('leave_room', (code) => {
    const room = getRoom(code);
    if (!room) return;
    const player = room.players.find(p => p.id === socket.id);
    if (player) {
      room.players = room.players.filter(p => p.id !== socket.id);
      // Clamp currentTurn so it doesn't go out-of-bounds
      if (room.players.length > 0) {
        room.currentTurn = room.currentTurn % room.players.length;
        io.to(code).emit('player_update', room.players);
        io.to(code).emit('turn_update', { currentTurn: room.currentTurn, round: room.round });
        io.to(code).emit('system_message', { text: `${player.name} left the room 👋`, time: now() });
      } else {
        rooms.delete(code);
      }
    }
    socket.leave(code);
    socket.data.roomCode = null;
  });

  // 10. End Game
  socket.on('end_game', (code) => {
    const room = getRoom(code);
    if (!room) return;
    const actingHost = room.players.find(p => p.status === 'online');
    if (actingHost?.id !== socket.id) return;

    const sorted = [...room.players].sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
    const mostDares = room.players.reduce((a, b) => (room.stats[b.id]?.dares||0) > (room.stats[a.id]?.dares||0) ? b : a, room.players[0]);
    const mostSkips = room.players.reduce((a, b) => (room.stats[b.id]?.skips||0) > (room.stats[a.id]?.skips||0) ? b : a, room.players[0]);
    io.to(code).emit('game_ended', { leaderboard: sorted, mostDares, mostSkips, history: room.history });
    rooms.delete(code);
  });

  // 11. WebRTC signaling (video/audio call)
  socket.on('call_offer',  ({ code, to, offer, from, name })  => io.to(to).emit('call_offer',  { from, name, offer }));
  socket.on('call_answer', ({ code, to, answer, from })       => io.to(to).emit('call_answer', { from, answer }));
  socket.on('ice_candidate', ({ to, candidate })              => io.to(to).emit('ice_candidate', { candidate, from: socket.id }));
  socket.on('call_end',    ({ code, to, from })               => io.to(code).emit('call_ended',  { from }));

  // 12. Typing indicator
  socket.on('typing_start', ({ code, username }) => socket.to(code).emit('user_typing', { username }));
  socket.on('typing_stop',  ({ code })           => socket.to(code).emit('user_stop_typing'));

  // 13. Reconnection
  socket.on('reconnect_room', ({ code, username, avatar }) => {
    const room = getRoom(code);
    if (!room) { socket.emit('room_error', { code: 'NOT_FOUND', message: 'Room expired.' }); return; }
    
    let p = room.players.find(p => p.name === username);
    if (p) {
      p.id = socket.id;
      p.status = 'online';
      if (avatar) p.avatar = avatar;
    } else {
      // Re-add them if they were somehow missing but have the code
      p = { id: socket.id, name: username, avatar: avatar || '🦊', score: 0, status: 'online', dares: 0, truths: 0, skips: 0 };
      room.players.push(p);
      if (!room.stats[socket.id]) room.stats[socket.id] = { dares: 0, truths: 0, skips: 0, completed: 0 };
    }
    
    socket.join(code);
    socket.data.roomCode = code;
    socket.emit('room_state', room);
    io.to(code).emit('player_update', room.players);
    io.to(code).emit('system_message', { text: `${username} reconnected! ⚡`, time: now() });
  });

  // 14. Disconnect
  // 12. Admin actions
  socket.on('admin_login', (pass) => {
    if (pass === 'admin123') socket.emit('admin_auth_success', questionsData.categories);
    else socket.emit('admin_error', 'Invalid admin password');
  });

  socket.on('admin_update', ({ categories }) => {
    questionsData.categories = categories;
    fs.writeFileSync(path.join(__dirname, 'data', 'questions.json'), JSON.stringify(questionsData, null, 2));
    io.emit('system_message', { text: '✨ Task pool has been updated by admin', time: now() });
  });

  socket.on('disconnect', () => {
    const code = socket.data.roomCode;
    if (code) {
      const room = getRoom(code);
      if (room) {
        const p = room.players.find(p => p.id === socket.id);
        if (p) {
          p.status = 'offline';
          io.to(code).emit('player_update', room.players);
          io.to(code).emit('system_message', { text: `${p.name} disconnected 😢`, time: now() });
          
          // If active player disconnects during selection, notify host
          if (room.gameState === 'active' && room.players[room.currentTurn]?.id === socket.id) {
            io.to(code).emit('system_message', { text: `It was ${p.name}'s turn. Host can skip them if they don't return.`, time: now() });
          }
        }
      }
    }
    socket.data.roomCode = null;
    console.log('💨 Disconnected:', socket.id);
  });

  /* ── Mini-Game Relay ─────────────────────────────── */
  // Server is stateless for mini-games — just routes events
  socket.on('mg_relay', ({ code, to, data }) => {
    if (to) {
      // Direct to one player
      io.to(to).emit('mg_event', { ...data, _from: socket.id });
    } else {
      // Broadcast to room (excluding sender)
      socket.to(code).emit('mg_event', { ...data, _from: socket.id });
    }
  });
});


function advanceTurn(code, room) {
  if (room.players.length === 0) return;
  
  let nextTurn = (room.currentTurn + 1) % room.players.length;
  let iterations = 0;
  
  // Skip offline players unless everyone is offline
  while (room.players[nextTurn].status === 'offline' && iterations < room.players.length) {
    nextTurn = (nextTurn + 1) % room.players.length;
    iterations++;
  }
  
  room.currentTurn = nextTurn;
  if (room.currentTurn === 0) room.round++;
  io.to(code).emit('turn_update', { currentTurn: room.currentTurn, round: room.round });
}

function now() { return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); }

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 DareMate server on http://localhost:${PORT}`));
