let computerScore = 1;
let playerScore = 1;
const pScore = document.getElementById('playerScore');
const cScore = document.getElementById('computerScore');
const buttons = document.querySelectorAll('.selection button');
const showIcon = document.querySelector('.show i');
const computerShowIcon = document.querySelector('.computer i');

const randomClasses = ["fas fa-hand-rock", "fas fa-hand-paper", "fas fa-hand-scissors"];
const text = document.getElementById('demo');
const text2 = document.getElementById('demo2');
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

const socket = io.connect('https://rock-paper-scissor-socketio.herokuapp.com');
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
  const result = confirm(`${data.user_name} wants to play with u.`);
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
  }
});

socket.on('invite_accepted', (data) => {

  document.getElementById('main').style = '';
  document.getElementById('waiting').style = "display:none;";
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
  socket.emit('accept_reject_invite', { answer: result, user_data: data });
}
window.addEventListener('beforeunload', (event) => {
  socket.emit('disconnet', {});
});

// Game Functionality.
const game = () => {
  buttons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      // Random rock paper scissor for the computer and clicked ones for the player
      let clickedBtn = e.target.className;
      showIcon.className = clickedBtn;
      // let randomNum = Math.floor(Math.random() * randomClasses.length);
      // computerShowIcon.className = randomClasses[randomNum];
      selectedOption = options[clickedBtn];
      socket.emit('selected', { selected_option: selectedOption });

    });
  });
};
game();