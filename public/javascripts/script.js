const socket = io.connect({transports: ['websocket'], upgrade: true});
let playWithUser = null;
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

let pScore = document.getElementById('playerScore');
let cScore = document.getElementById('computerScore');
let buttons = document.querySelectorAll('.selection button');
let showIcon = document.querySelector('.show-score i');
let computerShowIcon = document.querySelector('.computer i');
const randomClasses = ["fas fa-hand-rock", "fas fa-hand-paper", "fas fa-hand-scissors"];
let text = document.getElementById('demo');
let text2 = document.getElementById('demo2');
let selectedOption;
let selected_user;

function askUserName() {
  setDefaultValues()
  toggleUsernameModal();
  game();
}

$('#username').on('input', function (e) {
  const value = e.target.value;
  if (!value) {
    $('#invalid-username-msg').html('username is required');
    $('#submit-btn').addClass('disabled');
    $('#username').addClass("is-invalid");
    return;
  }
  $('#username').removeClass("is-invalid");
  validateUserName(value);
});
function setDefaultValues() {
  $('#exampleModalCenter').modal({
    keyboard: false,
    backdrop: 'static'
  });
  $('#invite-modal').modal({
    keyboard: false,
    backdrop: 'static'
  });
  $('.toast').toast({
    autohide: true,
    animation: true
  });
}
function submitUserName() {
  const username = $('#username').val();
  sendUserNameToServer(username);
  toggleUsernameModal();
}
function toggleUsernameModal() {
  $('#exampleModalCenter').modal('toggle');
}
function validateUserName(username) {
  socket.emit('username', { user_name: username });
}

function sendUserNameToServer(person) {
  socket.emit('joined', { user_name: person });
}
function playWith(user_id) {
  selected_user = user_id;
  socket.emit('play_with', { user_id: user_id });
}
function acceptInvite() {
  acceptRejectInvite(true, playWithUser);
  $('#invite-modal').modal('toggle');
}
function rejectInvite() {
  acceptRejectInvite(false, playWithUser);
  $('#invite-modal').modal('toggle');
}
function acceptRejectInvite(result, data) {
  document.getElementById('opponent_name').innerText = data.user_name + " :";
  socket.emit('accept_reject_invite', { answer: result, user_data: playWithUser });
}
socket.on('user_name_conflict', (data) => {
  $('#invalid-username-msg').html('username already exist');
  $('#submit-btn').addClass('disabled');
  $('#username').addClass("is-invalid");
});

socket.on('valid_user_name', (data) => {
  $('#username').addClass("is-valid");
  $('#submit-btn').removeClass('disabled');
});

socket.on('new-user', (data) => {
  $('#toast-msg').html(`New user joined as <strong>${data.user_name}</strong>`);
  $('.toast').toast('show');
  // document.getElementById("myList").innerHTML += `<button class="btn"><div id="${data.user_id}" class="list-group-item list-group-item-action" onclick="playWith('${data.user_id}')">${data.user_name}</div></button>`;
  document.getElementById("myList").innerHTML += `<button class="btn list-group-item list-group-item-action" id="${data.user_id}" onclick="playWith('${data.user_id}')">${data.user_name}</button>`;
});

socket.on('joined-successfully', (data) => {
  $('#user-list').removeClass('hide-user-list');
  $('.username').html(`username: <strong>${data.user_name}</strong>`);
  $('#toast-msg').html(`Welcome <strong>${data.user_name}</strong>`);
  $('.toast').toast('show');
});

socket.on('selected_options', (data) => {
  document.getElementById('player2_selected_option').className = options_reverse[data.player2];
  document.getElementById('player1_selected_option').className = options_reverse[data.player1];
  setTimeout(() => {
    document.getElementById('player1_selected_option').className = randomClasses[0];
    document.getElementById('player2_selected_option').className = "fas fa-spinner";
  }, 1000);
});

socket.on('accept_reject_invite', (data) => {
  let result = 'accepted';
  if (!data.result) {
    result = 'rejected';
  }
  $('#toast-msg').html(`${data.user_name} has ${result} your invite`);
  $('.toast').toast('show');
  if (data.result) {
    document.getElementById('main').style = '';
    document.getElementById('opponent_name').innerText = data.user_name + ": ";
    $('#main').removeClass('hide-game');
    pScore = document.getElementById('playerScore');
    cScore = document.getElementById('computerScore');
    buttons = document.querySelectorAll('.selection button');
    showIcon = document.querySelector('.show-score i');
    text = document.getElementById('demo');
    text2 = document.getElementById('demo2');
  }
});

socket.on('wants_to_play', (data) => {
  if (document.hidden) {
    window.focus();
  }
  playWithUser = data;
  $('#wants-to-play-msg').html(`<strong>${data.user_name}</strong> wants to play with u. please confirm?`);
  $('#invite-modal').modal('toggle');
});

socket.on('invite_accepted', (data) => {
  document.getElementById('main').style = '';
  $('#main').removeClass('hide-game');
  pScore = document.getElementById('playerScore');
  cScore = document.getElementById('computerScore');
  buttons = document.querySelectorAll('.selection button');
  showIcon = document.querySelector('.show-score i');
  text = document.getElementById('demo');
  text2 = document.getElementById('demo2');
});
socket.on('p1_selected', (data) => {
  $('#toast-msg').html(`${data.user_name} selected his choice`);
  $('.toast').toast('show');
});
socket.on('loss', (data) => {
  document.getElementById('opponent_score').innerText = data.loser_score;
  document.getElementById('your_score').innerText = data.winner_score;
  $('#toast-msg').html('You loss 😞. Try Again');
  $('.toast').toast('show');

});
socket.on('win', (data) => {
  document.getElementById('your_score').innerText = data.winner_score;
  document.getElementById('opponent_score').innerText = data.loser_score;
  $('#toast-msg').html('You Win 🎆🎆. Please continue');
  $('.toast').toast('show');
});
socket.on('tied', (data) => {
  $('#toast-msg').html('Match Tied!! Try Again');
  $('.toast').toast('show');
});
socket.on('selected_options', (data) => {
  document.getElementById('player2_selected_option').className = options_reverse[data.player2];
  document.getElementById('player1_selected_option').className = options_reverse[data.player1];
  setTimeout(() => {
    document.getElementById('player1_selected_option').className = randomClasses[0];
    document.getElementById('player2_selected_option').className = "fas fa-spinner";
  }, 1000);
});

socket.on('user-left', (data) => {
  $('#main').addClass('hide-game');
  alert(`${data.user_name} has left the game`);
});

socket.on('re-render-user-list', (data) => {
  const elem = document.getElementById(data.user_id);
  if (elem) {
    elem.remove();
    $('#toast-msg').html(`User <strong>${data.user_name}</strong> went offline`);
    $('.toast').toast('show');
  }
});
function game() {
  buttons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const clickedBtn = e.target.className;
      showIcon.className = clickedBtn;
      selectedOption = options[clickedBtn];
      socket.emit('selected', { selected_option: selectedOption });
    });
  });
};