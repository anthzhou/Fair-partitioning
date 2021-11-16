/* eslint-disable no-undef, no-unused-vars */

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

function computeDeterminant(point1, point2, point3) {
  //Orientation determinant
  return (
    point1.x * (point2.y - point3.y) -
    point1.y * (point2.x - point3.x) +
    (point2.x * point3.y - point3.x * point2.y)
  );
}

function isConvex(index) {
  // If left turn, vertex is convex
  return (
    computeDeterminant(
      currentPolygon[index - 1],
      currentPolygon[index],
      currentPolygon[index + 1]
    ) < 0
  );
}

var points = [];
var triangleEdge = [];
var currentPolygon;

function setup() {
  createCanvas(1000, 1000);

  // Put setup code here
  fill("black");
  textSize(40);
  button1 = createButton("Triangulate");
  button1.position(30, 110);
  button1.mousePressed(triangulate);
  button2 = createButton("Clear");
  button2.position(125, 110);
  button2.mousePressed(resetpoints);
}

function resetpoints() {
  points = [];
  triangleEdge = [];
}

function triangulate() {
  if (points.length > 3) {
    currentPolygon = [...points]; // copy the array
    earReduction(currentPolygon);
  }
}

function earReduction() {
  if (currentPolygon.length === 3) {
    return; // stops recursion
  }
  var currentEar;
  for (let i = 2; i < currentPolygon.length; i++) {
    // Find a convex vertex
    if (isConvex(i - 1)) {
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
      triangleEdge.push([currentPolygon[i - 2], currentPolygon[i]]);
      currentPolygon.splice(i - 1, 1);
      break;
    }
  }
  return earReduction();
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
    "Draw a monotone polygon in counterclockwise order\n(Starting from the leftmost vertex to the rightmost)",
    30,
    50
  );
  // Draw the triangulation
  for (let i = 0; i < triangleEdge.length; i++) {
    line(
      triangleEdge[i][0].x,
      triangleEdge[i][0].y,
      triangleEdge[i][1].x,
      triangleEdge[i][1].y
    );
  }
}

function mousePressed() {
  if (mouseY > 135) {
    points.push(new Point(mouseX, mouseY));
  }
}
