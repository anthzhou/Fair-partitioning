class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}

class Triangle {
  constructor(pointA, pointB, pointC) {
    this.pointA = pointA;
    this.pointB = pointB;
    this.pointC = pointC;
  }
  isInsideTriangle(point) {
    let insideTriangle = false;
    let determinant1 = computeDeterminant(this.pointA, this.pointB, point);
    let determinant2 = computeDeterminant(this.pointB, this.pointC, point);
    let determinant3 = computeDeterminant(this.pointC, this.pointA, point);
    if (
      (determinant1 > 0 && determinant2 > 0 && determinant3 > 0) ||
      (determinant1 < 0 && determinant2 < 0 && determinant3 < 0)
    ) {
      insideTriangle = true;
    }
    return insideTriangle;
  }
}

class Line {
  constructor(a, b) {
    this.index = lines.length;
    this.a = a;
    this.b = b;
    this.slope = calculate_slope(this.a, this.b);
    this.extendLine();

    this.points = [];
  }
  extendLine() {
    let x = this.b.x + (canvas.height - this.b.y) / this.slope;
    let y = canvas.height;
    this.b = new Point(x, y);
  }
  move(d) {
    this.b.x += d;
  }
  get_intersection(other) {
    // Calculating using determinant, translated to from math to javascript from source : https://mathworld.wolfram.com/Line-LineIntersection.html
    const x1 = this.a.x;
    const x2 = this.b.x;
    const y1 = this.a.y;
    const y2 = this.b.y;

    const x3 = other.a.x;
    const x4 = other.b.x;
    const y3 = other.a.y;
    const y4 = other.b.y;

    const xPoint =
      ((x1 * y2 - y1 * x2) * (x3 - x4) - (x1 - x2) * (x3 * y4 - y3 * x4)) /
      ((x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4));

    const yPoint =
      ((x1 * y2 - y1 * x2) * (y3 - y4) - (y1 - y2) * (x3 * y4 - y3 * x4)) /
      ((x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4));

    //Since the division by 0 is allowed in Javascript, if two lines are parallel, the point will have Infinite as x and y
    return new Point(xPoint, yPoint);
  }
}

let canvas;
let intersection;
let currentPolygon;
let isConvex = true;
let done = false;
let points = [];
let triangleEdge = []; //all triangle in the polygon

function setup() {
  canvas = createCanvas(document.getElementById("canvasContainer").offsetWidth, windowHeight)
  canvas.parent("canvasContainer");

  fill("black");
  points = [];
  triangleEdge = [];
  isConvex = true;
  done = false;
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
    text("You need at least 3 points.", 750, 50);
    fill("black");
  } else {
    if (isNotConvex(points.length - 2)) {
      fill("red");
      text("Polygon drawn is not convex.", 750, 50);
      fill("black");
      isConvex = false;
    }
  }
  if (done) {
    line(points[0].x, points[0].y, intersection.x, intersection.y);
  }
}

function mousePressed() {
  if (mouseY > 110 && mouseX > 0 && mouseY < 920) {
    points.push(new Point(mouseX, mouseY));
  }
}

function partition2() {
  if (points.length > 3 && isConvex) {
    currentPolygon = [...points]; // copy the array
    earReduction(currentPolygon);

    //find area bissector
    let index = Math.ceil((triangleEdge.length - 1) / 2);
    let point1 = triangleEdge[index][1];
    let point2 = triangleEdge[index][2];
    let x = lerp(point1.x, point2.x, 0.5);
    let y = lerp(point1.y, point2.y, 0.5);

    let area_bisector = new Line(points[0], new Point(x, y));
    let l = new Line(point1, point2);
    intersection = area_bisector.get_intersection(l);

    //create left side
    let L = [];
    for (let i = 0; i < points.indexOf(point1) + 1; i++) {
      L.push(points[i]);
    }
    L.push(intersection);

    //create right side
    let R = [];
    R.push(intersection);
    for (let i = points.indexOf(point2); i < points.length; i++) {
      R.push(points[i]);
    }
    R.push(points[0]);

    //update area bissector until fair partition
    let d;
    if (perimeter(L) > perimeter(R)) {
      d = -0.1;
      while (perimeter(L) > perimeter(R)) {
        area_bisector.move(d);
        intersection = area_bisector.get_intersection(l);
        L.splice(-1, 1, intersection);
        R.splice(0, 1, intersection);
      }
    } else {
      d = 0.1;
      while (perimeter(L) < perimeter(R)) {
        area_bisector.move(d);
        intersection = area_bisector.get_intersection(l);
        L.splice(-1, 1, intersection);
        R.splice(0, 1, intersection);
      }
    }
    done = true;
  }
}

function calculate_slope(pointA, pointB) {
  let slope = (pointB.y - pointA.y) / (pointB.x - pointA.x);
  if (slope === 0) {
    slope = EPSILON_ZERO;
  } else if (slope === Infinity) {
    slope = EPSILON_INFINITY * canvas.height;
  } else if (slope === -Infinity) {
    slope = -EPSILON_INFINITY * canvas.height;
  }
  return slope;
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

//triangulate the polygon
function earReduction() {
  if (currentPolygon.length === 3) {
    triangleEdge.push([
      currentPolygon[0],
      currentPolygon[1],
      currentPolygon[2]
    ]);
    return; // stops recursion
  }
  var currentEar;
  for (let i = 2; i < currentPolygon.length; i++) {
    // Find a convex vertex
    if (!isNotConvex(i - 1)) {
      currentEar = new Triangle(
        currentPolygon[i - 2],
        currentPolygon[i - 1],
        currentPolygon[i]
      );
    }
    // Check if ear is empty so we can remve it
    let isEarEmpty = true;
    for (let j = 0; j < currentPolygon.length; j++) {
      if (currentEar.isInsideTriangle(currentPolygon[j])) {
        isEarEmpty = false;
        break;
      }
    }
    // Remove ear for recursion
    if (isEarEmpty === true) {
      triangleEdge.push([
        currentPolygon[i - 2],
        currentPolygon[i - 1],
        currentPolygon[i]
      ]);
      currentPolygon.splice(i - 1, 1);
      break;
    }
  }
  return earReduction();
}

//Compute the area of an irregular polygon
function area(p) {
  let sum1 = 0;
  let sum2 = 0;
  for (let i = 0; i < p.length - 1; i++) {
    sum1 += p[i].x * p[i + 1].y;
  }
  sum1 += p[p.length - 1].x * p[0].y;
  for (let i = 0; i < p.length - 1; i++) {
    sum2 += p[i].y * p[i + 1].x;
  }
  sum2 += p[p.length - 1].y * p[0].x;
  let area = (sum1 - sum2) / 2;
  return Math.abs(area);
}

//Compute the perimeter of an irregular polygon
function perimeter(p) {
  let perimeter = 0;
  for (let i = 0; i < p.length - 1; i++) {
    perimeter += dist(p[i].x, p[i].y, p[i + 1].x, p[i + 1].y);
  }
  perimeter += dist(p[p.length - 1].x, p[p.length - 1].y, p[0].x, p[0].y);
  return Math.floor(perimeter);
}
