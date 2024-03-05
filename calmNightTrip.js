const container = document.querySelector('.container');

function spawnStars(amt) {
  for (let i = 0; i < amt; i++) {
    const star = document.createElement('div');
    star.classList.add('star');
    star.style.top = `${Math.random() * 100}%`;
    star.style.left = `${Math.random() * 100}%`;
    star.style.width = `${Math.random() * 4 + 2}`;
    star.style.height = star.style.width;

    // Generate a random animation delay for each star
    const delay = Math.random() * 2;
    // Generate a random index for the drift animation
    const driftIndex = Math.floor(Math.random() * 4) + 1; // This will give us an index from 1 to 4
    // Construct the drift animation name based on the index
    const driftAnimationName = `drift${driftIndex}`;

    star.style.animation = `sparkle 3s infinite, ${driftAnimationName} 4s infinite`;
    star.style.animationDelay = `${delay}s`;

    // 25% chance to become a purple or orange star
    if (Math.random() < 0.25) {
      const color = Math.random() < 0.5 ? 'purple' : 'orange';
      star.classList.add(color);
    }

    container.appendChild(star);
  }
}

spawnStars(250);

var onScreen = false;

document.body.addEventListener("mouseover", (e) => { onScreen = true; mouseX = e.clientX; mouseY = e.clientY; });
document.body.addEventListener("mouseout", (e) => { onScreen = false; });

let mouseX = 0;
let mouseY = 0;

document.body.addEventListener('mousemove', (event) => {
  mouseX = event.clientX;
  mouseY = event.clientY;
});

var keys = [];
var alreadyUsed = false;

document.body.addEventListener('keydown', function (e) {
  if (keys.indexOf(e.key) === -1) {
    keys.push(e.key);
  }

  if(alreadyUsed) return;
  if(e.key == "ArrowRight") {
    selected+=1;
    if(selected >= mice.length) selected = 0;
    switchMice();
    alreadyUsed = true;
  }
  if (e.key == "ArrowLeft") {
    selected-=1;
    if (selected < 0) selected = mice.length - 1;
    console.log(selected);
    switchMice();
    alreadyUsed = true;
  }
});

document.body.addEventListener('keyup', function (e) {
  const index = keys.indexOf(e.key);
  if (index !== -1) {
    keys.splice(index, 1);
  }
  if (!keys.includes('ArrowRight') && !keys.includes('ArrowLeft')) {
    alreadyUsed = false;
  }
});


function update() {
  if(keys.indexOf(" ") != -1) {
    spawnStars(1);
  }
}

setInterval(() => {update()}, 10);

/* cursor */
var mice = ["", "Meteor"];
var selected = 0;

function switchMice() {
  console.log(selected, mice[selected])
  document.querySelector("#cursor").className = 'cursor' + mice[selected];
}

document.addEventListener('DOMContentLoaded', function () {
  const cursor = document.createElement('div');
  cursor.classList.add('cursor'+mice[selected]);
  cursor.id = "cursor"
  document.body.appendChild(cursor);

  const trail = [];
  const trailLength = 20;

  function updateCursorPosition(e) {
    if(trail.length > 0) {
    if (distance(e.clientX - 5, e.clientY - 5, trail[trail.length - 1].style.left, trail[trail.length - 1].style.top) <= 6) return;
    }

    cursor.style.left = e.clientX-5 + 'px';
    cursor.style.top = e.clientY-5 + 'px';

    const trailElement = document.createElement('div');

    let offset = 5;
    //meteor
    if(selected == 1) offset = 6;

    trailElement.className = 'trail'+mice[selected];
    trailElement.style.left = e.clientX-offset + 'px';
    trailElement.style.top = e.clientY-offset + 'px';
    document.body.appendChild(trailElement);

    if (trail.length > trailLength) {
      document.body.removeChild(trail[0]);
      trail.shift();
    }

    trail.push(trailElement);
  }
  setInterval(() => {
    try {
    document.body.removeChild(trail[0]);
    trail.shift();
    } catch(e) {}
  }, 200)

  function distance(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  }

  document.addEventListener('mousemove', updateCursorPosition);
});
