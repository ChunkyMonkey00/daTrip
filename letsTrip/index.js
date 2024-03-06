document.querySelector("#tripStart").addEventListener("mouseover", mouseStart);
document.querySelector("#tripStart").addEventListener("mouseout", mouseEnd);

mouseOn = false;
mouseTimer = 0;
journeyStarted = false;

trip = 0;
trips = 3;

function mouseStart(e) {
  if(!mouseOn) mouseTimer = 0;
  mouseOn = true;
}

function mouseEnd() {
  mouseOn = false;
  if(journeyStarted) {
    mouseTimer = 0;
    journeyStarted = false;
    document.querySelector("#tripStart").addEventListener("mouseover", mouseStart);
  }
}

function checkHover() {
  if(journeyStarted) return;
  if (mouseOn) mouseTimer += 100;
  if (mouseOn && mouseTimer >= 500) {
    startJourney();
  }
}

function update() {
  checkHover();
}
setInterval(update, 100);

function startJourney() {
  trip++;
  if(trip >= trips) trip = 0;
  if (trip == 1) { drawing = true; reset(); }
  else { drawing = false; }
  journeyStarted = true;
  document.querySelector("#tripStart").removeEventListener("mouseover", mouseStart);
  document.querySelector("#container"+trip).style.left = "0%";
  if(trip == 0) {
    clearTrips();
  }
}

function assignZ() {
  document.querySelectorAll(".trip").forEach(function (element, index) {
    var zIndexValue = 100 + index + 1;
    element.style.zIndex = zIndexValue;
  });

}
assignZ();

function clearTrips() {
  document.querySelectorAll(".trip").forEach(function (element) {
    if (element.id != "container0") {
    element.style.left = "300%";
    }
  });
}

function assignColors() {
  document.querySelectorAll(".trip").forEach(function (element, i) {
    element.style.backgroundColor = `rgb(${31 + (20 * i)}, ${31 + (20 * i)}, ${31 + (20 * i)})`;
    if(i==1) element.style.backgroundColor = "rgb(11, 11, 11)";
  });
}
assignColors();

/* cloth simulation */
// settings

var drawing = false;

var physics_accuracy = 3,
  mouse_influence = 20,
  mouse_cut = 5,
  gravity = 1200,
  cloth_height = 70,
  cloth_width = 110,
  start_y = 20,
  spacing = 7,
  tear_distance = 60;


window.requestAnimFrame =
  window.requestAnimationFrame ||
  window.webkitRequestAnimationFrame ||
  window.mozRequestAnimationFrame ||
  window.oRequestAnimationFrame ||
  window.msRequestAnimationFrame ||
  function (callback) {
    window.setTimeout(callback, 1000 / 60);
  };

var canvas,
  ctx,
  cloth,
  boundsx,
  boundsy,
  mouse = {
    down: false,
    button: 1,
    x: 0,
    y: 0,
    px: 0,
    py: 0
  };

var Point = function (x, y) {
  this.x = x;
  this.y = y;
  this.px = x;
  this.py = y;
  this.vx = 0;
  this.vy = 0;
  this.pin_x = null;
  this.pin_y = null;

  this.constraints = [];
};

Point.prototype.update = function (delta) {
  if (mouse.down) {
    var diff_x = this.x - mouse.x,
      diff_y = this.y - mouse.y,
      dist = Math.sqrt(diff_x * diff_x + diff_y * diff_y);

    if (mouse.button == 1) {
      if (dist < mouse_influence) {
        this.px = this.x - (mouse.x - mouse.px) * 1.8;
        this.py = this.y - (mouse.y - mouse.py) * 1.8;
      }

    } else if (dist < mouse_cut) this.constraints = [];
  }

  this.add_force(0, gravity);

  delta *= delta;
  nx = this.x + ((this.x - this.px) * .99) + ((this.vx / 2) * delta);
  ny = this.y + ((this.y - this.py) * .99) + ((this.vy / 2) * delta);

  this.px = this.x;
  this.py = this.y;

  this.x = nx;
  this.y = ny;

  this.vy = this.vx = 0
};

Point.prototype.draw = function () {
  if (!this.constraints.length) return;

  var i = this.constraints.length;
  while (i--) this.constraints[i].draw();
};

Point.prototype.resolve_constraints = function () {
  if (this.pin_x != null && this.pin_y != null) {
    this.x = this.pin_x;
    this.y = this.pin_y;
    return;
  }

  var i = this.constraints.length;
  while (i--) this.constraints[i].resolve();

  this.x > boundsx ? this.x = 2 * boundsx - this.x : 1 > this.x && (this.x = 2 - this.x);
  this.y < 1 ? this.y = 2 - this.y : this.y > boundsy && (this.y = 2 * boundsy - this.y);
};

Point.prototype.attach = function (point) {
  this.constraints.push(
    new Constraint(this, point)
  );
};

Point.prototype.remove_constraint = function (constraint) {
  this.constraints.splice(this.constraints.indexOf(constraint), 1);
};

Point.prototype.add_force = function (x, y) {
  this.vx += x;
  this.vy += y;

  var round = 400;
  this.vx = ~~(this.vx * round) / round;
  this.vy = ~~(this.vy * round) / round;
};

Point.prototype.pin = function (pinx, piny) {
  this.pin_x = pinx;
  this.pin_y = piny;
};

var Constraint = function (p1, p2) {
  this.p1 = p1;
  this.p2 = p2;
  this.length = spacing;
};

Constraint.prototype.resolve = function () {
  var diff_x = this.p1.x - this.p2.x,
    diff_y = this.p1.y - this.p2.y,
    dist = Math.sqrt(diff_x * diff_x + diff_y * diff_y),
    diff = (this.length - dist) / dist;

  if (dist > tear_distance) this.p1.remove_constraint(this);

  var px = diff_x * diff * 0.5;
  var py = diff_y * diff * 0.5;

  this.p1.x += px;
  this.p1.y += py;
  this.p2.x -= px;
  this.p2.y -= py;
};

Constraint.prototype.draw = function () {
  ctx.moveTo(this.p1.x, this.p1.y);
  ctx.lineTo(this.p2.x, this.p2.y);
};

var Cloth = function () {
  this.points = [];

  var start_x = canvas.width / 2 - cloth_width * spacing / 2;

  for (var y = 0; y <= cloth_height; y++) {
    for (var x = 0; x <= cloth_width; x++) {
      var p = new Point(start_x + x * spacing, start_y + y * spacing);

      x != 0 && p.attach(this.points[this.points.length - 1]);
      y == 0 && p.pin(p.x, p.y);
      y != 0 && p.attach(this.points[x + (y - 1) * (cloth_width + 1)])

      this.points.push(p);
    }
  }
};

Cloth.prototype.update = function () {
  var i = physics_accuracy;

  while (i--) {
    var p = this.points.length;
    while (p--) this.points[p].resolve_constraints();
  }

  i = this.points.length;
  while (i--) this.points[i].update(.016);
};

Cloth.prototype.draw = function () {
  ctx.fillStyle = "rgb(51, 51, 51)";
  ctx.fillRect(0, 0, 9999, 9999);
  ctx.beginPath();

  var i = cloth.points.length;
  while (i--) cloth.points[i].draw();

  ctx.stroke();
};

function updatec() {
  if (drawing) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    cloth.update();
    cloth.draw();
  }

  requestAnimFrame(updatec);
}

function start() {
  ctx.scale(2, 2);
  ctx.translate(-300, -50);

  canvas.onmousedown = function (e) {
    mouse.button = e.which;
    mouse.px = mouse.x;
    mouse.py = mouse.y;
    var rect = canvas.getBoundingClientRect();
    mouse.x = (e.clientX / 2 + 300) - rect.left,
      mouse.y = (e.clientY / 2 + 50) - rect.top,
      mouse.down = true;
    e.preventDefault();
  };

  canvas.onmouseup = function (e) {
    mouse.down = false;
    e.preventDefault();
  };

  canvas.onmousemove = function (e) {
    mouse.px = mouse.x;
    mouse.py = mouse.y;
    var rect = canvas.getBoundingClientRect();
    mouse.x = (e.clientX / 2 + 300) - rect.left,
      mouse.y = (e.clientY / 2 + 50) - rect.top,
      e.preventDefault();
  };

  canvas.oncontextmenu = function (e) {
    e.preventDefault();
  };

  boundsx = canvas.width - 1;
  boundsy = canvas.height - 1;

  ctx.strokeStyle = 'rgb(201, 201, 201)';

  cloth = new Cloth();

  updatec();
}

window.onload = function () {
  canvas = document.getElementById('c');
  ctx = canvas.getContext('2d');

  // Get the parent container's width and height
  var parentWidth = document.body.offsetWidth
  var parentHeight = document.body.offsetHeight;
  parentHeight *= 10;

  // Set canvas width and height to match the parent container
  canvas.width = parentWidth;
  canvas.height = parentHeight;

  start();
};


function reset() {
  // Reset canvas-related variables
  canvas.width = canvas.width; // Reset canvas size
  ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas content
  boundsx = canvas.width - 1;
  boundsy = canvas.height - 1;
  ctx.scale(2, 2);
  ctx.translate(-300, -50);
  ctx.strokeStyle = 'rgb(201, 201, 201)';

  // Reset cloth simulation
  cloth = new Cloth();
}

/* circle repeat */
// Number of rows and columns for the checkerboard
const numRows = 20;
const numCols = 20;

// Loop to create circles in a checkerboard pattern
for (let row = 0; row < numRows; row++) {
  for (let col = 0; col < numCols; col++) {
    // Create a circle element if row and column are both even or both odd
    if ((row % 2 === 0 && col % 2 === 0) || (row % 2 !== 0 && col % 2 !== 0)) {
      // Create a circle element
      const circle = document.createElement('div');
      circle.className = 'circle';

      // Position the circle based on row and column
      circle.style.top = (row * 150) - 300 + 'px';
      circle.style.left = (col * 150) - 200 + 'px';

      // Append the circle to the body
      document.getElementById("container2").appendChild(circle);
    }
  }
}
