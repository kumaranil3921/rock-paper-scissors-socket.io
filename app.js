const PORT = process.env.PORT || 3001;
const USERS = {};
const express = require('express');
const bodyParser = require("body-parser");
// const ejs = require('ejs');
const app = express();
const path = require('path');
const http = require('http').Server(app);
const io = require('socket.io')(http);
const { ExpressPeerServer } = require('peer');
const peerServer = ExpressPeerServer(http, {
  debug: true,
})

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use('/peerjs',peerServer);
app.use(express.static(path.join(__dirname, 'public')));
app.use('/media', express.static(path.join(__dirname, 'media')));
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.render('index', { users: USERS });
});

io.on('connection', (socket) => {
  socket.on('joined', (data) => {
    const { user_name } = data;
    if (userAlreadyExist(user_name)) {
      return askNewUserName(socket, data);
    }
    USERS[socket.id] = {
      // socket: socket,
      user_name: user_name,
      socket_id: socket.id,
      score: 0,
      playing_with: null,
      selected_option: null,
      peer_id: null
    };
    newUserJoined(socket, data);
    userJoinedSuccessfully(socket, data);
  });
  socket.on('set_peer_id', (data) => {
    USERS[socket.id].peer_id = data.peer_id;
  })
  socket.on('play_with', (data) => {
    const opts = {
      user_name: USERS[socket.id].user_name,
      user_id: socket.id
    }
    socket.broadcast.to(data.user_id).emit('wants_to_play', opts);
  });
  socket.on('accept_reject_invite', (data) => {
    const opts = {
      user_name: USERS[socket.id].user_name,
      user_id: socket.id,
      result: data.answer,
      send_to: data.user_data.user_id
    }
    acceptRejectInvite(socket, opts);
  });
  socket.on('selected', (data) => {
    USERS[socket.id].selected_option = data.selected_option;
    const opt1 = USERS[socket.id].selected_option;
    const opt2 = USERS[USERS[socket.id].playing_with].selected_option;
    const opts = {
      user_name: USERS[socket.id].user_name
    }
    if (opt1 && opt2) {
      const player1 = {
        user_id: socket.id,
        choice: opt1,
        opponent_id: USERS[socket.id].playing_with
      }
      const player2 = {
        user_id: USERS[socket.id].playing_with,
        choice: opt2,
        opponent_id: socket.id
      }
      const winner = findWinner(player1, player2);
      if (!winner.tied) {
        USERS[winner.user_id].score = USERS[winner.user_id].score + 1;
        const res = { winner_score: USERS[winner.user_id].score, loser_score: USERS[winner.opponent_id].score };
        io.sockets.to(winner.user_id).emit('win', res);
        io.sockets.to(winner.opponent_id).emit('loss', res);
      } else {
        // const res = { winner_score: USERS[winner.player2_user_id].score, loser_score: USERS[winner.opponent_id].score };
        io.sockets.to(winner.player2_user_id).emit('tied', {});
        io.sockets.to(winner.player1_user_id).emit('tied', {});
      }
      io.sockets.to(player1.user_id).emit('selected_options', { player1: opt1, player2: opt2 });
      io.sockets.to(player2.user_id).emit('selected_options', { player1: opt1, player2: opt2 });
      USERS[player1.user_id].selected_option = null;
      USERS[player2.user_id].selected_option = null;
    } else {
      io.sockets.to(USERS[socket.id].playing_with).emit('p1_selected', opts);
    }
  });
  socket.on('disconnet', (data) => {
    socket.broadcast.emit('re-render-user-list', { user_id: socket.id });
    if (USERS[socket.id]) {
      io.sockets.to(USERS[socket.id].playing_with).emit('user_left', { user_name: USERS[socket.id].user_name });
      USERS[socket.id].playing_with = null;
      USERS[socket.id].score = null;
      USERS[socket.id].selected_option = null;
      delete USERS[socket.id];
    }
  });
  socket.on('join-room', (data) => {
    
  });
});
function userAlreadyExist(user_name) {
  let isExist = false;
  for (key in USERS) {
    if (USERS[key].user_name === user_name) {
      isExist = true;
      break;
    }
  }
  return isExist;
}
function askNewUserName(socket, data) {
  socket.emit('user_name_conflict', data);
}
function userJoinedSuccessfully(socket, data) {
  socket.emit('joined_successfully', data);
}
function newUserJoined(socket, data) {
  data.user_id = socket.id;
  socket.broadcast.emit('new_user', data);
}
function acceptRejectInvite(socket, data) {
  data.peer_id = USERS[data.user_id].peer_id;
  socket.broadcast.to(data.send_to).emit('accept_reject_invite', data);
  if (data.result) {
    USERS[data.send_to].playing_with = data.user_id;
    USERS[data.user_id].playing_with = data.send_to;
    data.peer_id = USERS[data.send_to].peer_id;
    io.sockets.to(data.user_id).emit('invite_accepted', data);
  }
}
function findWinner(player1, player2) {
  const str = player1.choice + player2.choice;
  let winner;
  switch (str) {
    case 'rs':
    case 'pr':
    case 'sp':
      winner = player1;
      break;
    case 'sr':
    case 'rp':
    case 'ps':
      winner = player2;
      break;
    case 'rr':
    case 'pp':
    case 'ss':
      winner = { tied: 1, player1_user_id: player1.user_id, player2_user_id: player2.user_id };
      break;
  }
  return winner;
}
http.listen(PORT, () => {
  console.log('listening on *:' + PORT);
});