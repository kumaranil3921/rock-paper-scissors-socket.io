const videoGrid = document.getElementById('video-grid');
const peerIdElem = document.getElementById('peer_id');
let myPeerId;
const myPeer = new Peer(undefined, {
  path: '/peerjs',
  host: window.location.hostname,
  port: 443
})

const myVideo = document.createElement('video');
myVideo.muted = true;
myVideo.pause = true
let myVideoStream;
navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true
}).then(stream => {
  myVideoStream = stream;
})


const socket = io();
myPeer.on('open', id => {
  peerIdElem.value = id;
  setTimeout(() => {
    socket.emit('set_peer_id', { peer_id: id });
  }, 2000);
})
const buttons = document.querySelectorAll('.selection button');
const showIcon = document.querySelector('.show i');

const randomClasses = ["fas fa-hand-rock", "fas fa-hand-paper", "fas fa-hand-scissors"];

let selectedOption;
const options = {
  'fas fa-hand-rock': 'r',
  'fas fa-hand-paper': 'p',
  'fas fa-hand-scissors': 's',
}
const options_reverse = {
  'r': 'fas fa-hand-rock',
  'p': 'fas fa-hand-paper',
  's': 'fas fa-hand-scissors'
}

let selected_user;
document.getElementById('main').style = "display:none;";
function askUserName() {
  let person = promptUserName();
  sendUserNameToServer(person);
}

socket.on('user_name_conflict', (data) => {
  alert(`${data.user_name} aleady exist.`);
  person = promptUserName();
  sendUserNameToServer(person);
});

socket.on('joined_successfully', (data) => {
  document.getElementById('username').innerText = data.user_name;
  alert(`Welcome ${data.user_name}`);
});

socket.on('new_user', (data) => {
  document.getElementById("myList").innerHTML += `<div id="${data.user_id}" class="list-group-item list-group-item-action" onclick="playWith('${data.user_id}')">${data.user_name}</div>`;
});

socket.on('wants_to_play', (data) => {
  if (document.hidden) {
    window.focus();
  }
  alert(`${data.user_name} wants to play with u. please confirm`);
  const result = true // confirm(`${data.user_name} wants to play with u.`);
  acceptRejectInvite(result, data);
});
socket.on('accept_reject_invite', (data) => {
  let result = 'accepted';
  if (!data.result) {
    result = 'rejected';
  }
  alert(`${data.user_name} has ${result} your invite`);
  if (data.result) {
    document.getElementById('main').style = '';
    document.getElementById('waiting').style = "display:none;";
    document.getElementById('opponent_name').innerText = data.user_name + ": ";
    myPeer.call(data.peer_id, myVideoStream);
    myPeer.on('call', (call) => {
      call.answer(myVideoStream);
      call.on('stream', userVideoStream => {
        addVideoStream(myVideo, userVideoStream)
      });
    })
  }
});

socket.on('invite_accepted', (data) => {
  document.getElementById('main').style = '';
  document.getElementById('waiting').style = "display:none;";
  myPeer.call(data.peer_id, myVideoStream);
  myPeer.on('call', (call) => {
    call.answer(myVideoStream);
    call.on('stream', userVideoStream => {
      addVideoStream(myVideo, userVideoStream)
    });
  })
});

socket.on('p1_selected', (data) => {
  alert(`${data.user_name} selected his choice`);
});

socket.on('loss', (data) => {
  document.getElementById('opponent_score').innerText = data.loser_score;
  document.getElementById('your_score').innerText = data.winner_score;
  alert('You loss :disappointed:. Try Again');

});
socket.on('win', (data) => {
  document.getElementById('your_score').innerText = data.winner_score;
  document.getElementById('opponent_score').innerText = data.loser_score;
  alert('You Win :fireworks:. Please continue');
});
socket.on('tied', (data) => {
  alert('Match Tied!! Try Again');
});
socket.on('selected_options', (data) => {
  document.getElementById('player2_selected_option').className = options_reverse[data.player2];
  document.getElementById('player1_selected_option').className = options_reverse[data.player1];
  setTimeout(() => {
    document.getElementById('player1_selected_option').className = randomClasses[0];
    document.getElementById('player2_selected_option').className = "fas fa-spinner";
  }, 1000);
});

socket.on('re-render-user-list', (data) => {
  const elem = document.getElementById(data.user_id);
  if (elem) {
    elem.remove();
  }
});

socket.on('user_left', (data) => {
  document.getElementById('main').style = "display:none;";
  alert(`${data.user_name} has left the game`);
})

function promptUserName() {
  let answer;
  while (!answer) {
    answer = prompt("Please enter your name", "Harry Potter");
  }
  return answer;
}
function sendUserNameToServer(person) {
  socket.emit('joined', { user_name: person });
}
function playWith(user_id) {
  selected_user = user_id;
  socket.emit('play_with', { user_id: user_id });
}
function acceptRejectInvite(result, data) {
  document.getElementById('opponent_name').innerText = data.user_name + " :";
  socket.emit('accept_reject_invite', { answer: result, user_data: data, peer_id: myPeerId });
}
window.addEventListener('beforeunload', (event) => {
  socket.emit('disconnet', {});
});
function addVideoStream(video, stream) {
  video.srcObject = stream;
  video.addEventListener('loadedmetadata', () => {
    video.play();
  })
  videoGrid.append(video);
}

// Game Functionality.
const game = () => {
  buttons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      let clickedBtn = e.target.className;
      showIcon.className = clickedBtn;
      selectedOption = options[clickedBtn];
      socket.emit('selected', { selected_option: selectedOption });

    });
  });
};
game();