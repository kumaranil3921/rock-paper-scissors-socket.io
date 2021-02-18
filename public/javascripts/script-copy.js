const socket = io();
let selected_user = null;
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
  document.getElementById("myList").innerHTML += `<div class="list-group-item list-group-item-action" onclick="playWith('${data.user_id}')">${data.user_name}</div>`;
});

socket.on('wants_to_play', (data) => {
  console.log('data  ', data)
  confirm(`${data.name} wants to play with u.`);
});
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

// Game Functionality.
const game = () => {
  console.log("game", buttons)
  buttons.forEach(btn => {
    console.log("buttons", buttons)
    btn.addEventListener('click', (e) => {
      // Random rock paper scissor for the computer and clicked ones for the player
      let clickedBtn = e.target.className;
      showIcon.className = clickedBtn;
      let randomNum = Math.floor(Math.random() * randomClasses.length);
      computerShowIcon.className = randomClasses[randomNum];
      // Game Score.
      // If it's a Tie .
      if (showIcon.className === computerShowIcon.className) {
        pScore.innerHTML = pScore.innerHTML;
        cScore.innerHTML = cScore.innerHTML;
        text.innerHTML = "It's a Tie ! ";
        text.style.color = 'orange';
        text2.innerHTML = text.innerHTML;
        text2.style.color = 'orange';
      } // if it's not a Tie.
      else if (showIcon.className === randomClasses[0] && computerShowIcon.className === randomClasses[2]) {
        pScore.innerHTML = playerScore;
        playerScore++;
        text.innerHTML = "It's a Win ! ";
        text.style.color = 'rgb(1, 146, 1)';
        text2.innerHTML = text.innerHTML;
        text2.style.color = 'rgb(1, 146, 1)';
      } else if (showIcon.className === randomClasses[0] && computerShowIcon.className === randomClasses[1]) {
        cScore.innerHTML = computerScore;
        computerScore++;
        text.innerHTML = "You Loosed ! ";
        text.style.color = 'red';
        text2.innerHTML = text.innerHTML;
        text2.style.color = 'red';
      } else if (showIcon.className === randomClasses[1] && computerShowIcon.className === randomClasses[2]) {
        cScore.innerHTML = computerScore;
        computerScore++;
        text.innerHTML = "You Loosed ! ";
        text.style.color = 'red';
        text2.innerHTML = text.innerHTML;
        text2.style.color = 'red';
      } else if (showIcon.className === randomClasses[1] && computerShowIcon.className === randomClasses[0]) {
        pScore.innerHTML = playerScore;
        playerScore++;
        text.innerHTML = "It's a Win ! ";
        text.style.color = 'rgb(1, 146, 1)';
        text2.innerHTML = text.innerHTML;
        text2.style.color = 'rgb(1, 146, 1)';
      } else if (showIcon.className === randomClasses[2] && computerShowIcon.className === randomClasses[0]) {
        cScore.innerHTML = computerScore;
        computerScore++;
        text.innerHTML = "You Loosed ! ";
        text.style.color = 'red';
        text2.innerHTML = text.innerHTML;
        text2.style.color = 'red';
      } else if (showIcon.className === randomClasses[2] && computerShowIcon.className === randomClasses[1]) {
        pScore.innerHTML = playerScore;
        playerScore++;
        text.innerHTML = "It's a Win ! ";
        text.style.color = 'rgb(1, 146, 1)';
        text2.innerHTML = text.innerHTML;
        text2.style.color = 'rgb(1, 146, 1)';
      }
    });
  });
}
game();