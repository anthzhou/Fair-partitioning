class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}

let canvas;
let points = [];
let isConvex = true;

function setup() {
  canvas = createCanvas(document.getElementById("canvasContainer").offsetWidth, windowHeight)
  canvas.parent("canvasContainer");

  fill("black");
  points = [];
  isConvex = true;
}

function draw() {
  // Put drawings here
  background(200);
  // Draw the polygon
  if (points.length !== 0) {
    for (let i = 0; i < points.length - 1; i++) {
      ellipse(points[i].x, points[i].y, 4, 4);
      line(points[i].x, points[i].y, points[i + 1].x, points[i + 1].y);
    }
    ellipse(points[points.length - 1].x, points[points.length - 1].y, 4, 4);
    line(
      points[points.length - 1].x,
      points[points.length - 1].y,
      points[0].x,
      points[0].y
    );
  }
  textSize(28.5);
  text(
    "Draw a convex polygon in counterclockwise order\n(Starting from the leftmost vertex to the rightmost)",
    30,
    50
  );
  if (points.length < 3) {
    fill("red");
    text("You need at least 3 points.", 300, 50);
    fill("black");
  } else {
    if (isNotConvex(points.length - 2)) {
      fill("red");
      text("Polygon drawn is not convex.", 300, 50);
      fill("black");
      isConvex = false;
    }
  }
}

function mousePressed() {
  if (mouseY > 135 && mouseX > 0 && mouseY < 560) {
    points.push(new Point(mouseX, mouseY));
  }
}

function computeDeterminant(point1, point2, point3) {
  //Orientation determinant
  return (
    point1.x * (point2.y - point3.y) -
    point1.y * (point2.x - point3.x) +
    (point2.x * point3.y - point3.x * point2.y)
  );
}

function isNotConvex(index) {
  // If left turn, vertex is convex
  return (
    computeDeterminant(points[index - 1], points[index], points[index + 1]) > 0
  );
}

function triangulate(k) {
  if (points.length > 3 && isConvex) {
    for (let index = 0; index < k - 1; index++) {
      fairParition();
    }
  }
}
