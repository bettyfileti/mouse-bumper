//client-side socket connection
let socket = io();

socket.on("connect", () => {
  console.log("Connected");
});

//listen for data from server
socket.on("draw-data", data => {
  createMouseObjects(data);
});

socket.on("draw-points", data => {
  drawPoints(data);
});

socket.on("getMySocketId", data => {
  myMouseID = data.clientID;
  colorID = data.clientCount % 8;
});

socket.on("clientLeft", data => {
  removeMouseObject(data);
  resetPoints();
});

//--------------------------------------------------------------
//p5 sketch: https://editor.p5js.org/bethfileti/sketches/WZy547uuC

let rectCanvas;

let mouseAqua;
let mouseBlue;
let mouseGreen;
let mouseOrange;
let mousePink;
let mousePurple;
let mouseRed;
let mouseYellow;

let myMouse;
let myMouseID;
let colorID;
let myMouseArray = [];
let mouseCursors = [];
let mouseImages = [];
let mouseImagePaths = ["assets/cursorRed.png",
                       "assets/cursorAqua.png",
                       "assets/cursorOrange.png",
                       "assets/cursorBlue.png",
                       "assets/cursorGreen.png",
                       "assets/cursorPink.png",
                       "assets/cursorYellow.png",
                       "assets/cursorPurple.png"]

let img = document.createElement("img");
let imgContainer0;
let imgContainer1;
let imgContainer2;
let imgContainer3;
let imgContainer4;
let imgContainer5;
let imgContainer6;
let imgContainer7;
let weHaveTheMice = false;
let imBeingBumpedBy;
let imBeingBumped;
let mouseBumpX;
let mouseBumpY;

function preload() {
  mouseAqua = loadImage("assets/cursorAqua.png");
  mouseBlue = loadImage("assets/cursorBlue.png");
  mouseGreen = loadImage("assets/cursorGreen.png");
  mouseOrange = loadImage("assets/cursorOrange.png");
  mousePink = loadImage("assets/cursorPink.png");
  mousePurple = loadImage("assets/cursorPurple.png");
  mouseRed = loadImage("assets/cursorRed.png");
  mouseYellow = loadImage("assets/cursorYellow.png");

  mouseImages.push(
    mouseRed,
    mouseAqua,
    mouseOrange,
    mouseBlue,
    mouseGreen,
    mousePink,
    mouseYellow,
    mousePurple
  );
  
  imgContainer0 = document.getElementById(`mouse-0-img`);
  imgContainer1 = document.getElementById(`mouse-1-img`);
  imgContainer2 = document.getElementById(`mouse-2-img`);
  imgContainer3 = document.getElementById(`mouse-3-img`);
  imgContainer4 = document.getElementById(`mouse-4-img`);
  imgContainer5 = document.getElementById(`mouse-5-img`);
  imgContainer6 = document.getElementById(`mouse-6-img`);
  imgContainer7 = document.getElementById(`mouse-7-img`);
}

function setup() {
  
  let myCanvas = createCanvas(400, 400);
  background(220);
  
  myCanvas.parent("canvas-container");
  myCanvas.id = "my-canvas";

  let margin = 0;
  rectCanvas = {
    x: margin / 2,
    y: margin / 2,
    w: width - margin,
    h: height - margin
  };

  //load new players in at origin and have them slowly meet the user's cursor
  //let colorID = int(random(mouseImages.length));

  myMouse = new MouseCursor(
    width/2,
    height/2,
    mouseImages[colorID],
    colorID,
    myMouseID,
    0
  );

  myMouseArray.push(myMouse);
  sendThisMouseData();
  console.log(myMouseID);
  
    let dataObj = {
    "colorID": colorID,
    "points" : 0
  }
  
  drawPoints(dataObj);
}

function draw() {
  sendThisMouseData();
  rect(rectCanvas.x, rectCanvas.y, rectCanvas.w, rectCanvas.h);
  
  push();
  noFill();
  ellipse(mouseX, mouseY, 10, 10);
  pop();
  
  for (let mouse of myMouseArray) {
    mouse.checkControl();
    mouse.checkCollision();
    mouse.update();
    mouse.show();
  }

  if (weHaveTheMice) {
    for (let mice of mouseCursors) {
      //mice.checkCollision();
      mice.show();
    }
  }
}

//--------------------------------------------------------------


function createMouseObjects(data) {

  let mouseAlreadyExists;

  if (mouseCursors.length === 0) {
    
    let newMouse = createNewMouseObject(data);
    mouseCursors.push(newMouse);
    
  } else {
    for (let i = 0; i < mouseCursors.length; i++) {
      if (mouseCursors[i].ID != data.myID) {
        mouseAlreadyExists = false;
      } else {
    
        let newMouse = createNewMouseObject(data)
        mouseCursors[i] = newMouse;
        mouseAlreadyExists = true;
        break;
      }
    }
  }

  if (mouseAlreadyExists === false) {
    console.log("adding a new mouse");

    let newMouse = createNewMouseObject(data);
    mouseCursors.push(newMouse);
  }

  weHaveTheMice = true;
}

//--------------------------------------------------------------

function createNewMouseObject(data){
      let thisMouse = new MouseCursor(
      data.xPos,
      data.yPos,
      mouseImages[data.colorID],
      data.colorID,
      data.myID,
      data.points
    );
  return thisMouse;
}

//--------------------------------------------------------------

function removeMouseObject(myID) {
  let mouseToRemove;

  for (let i = 0; i < mouseCursors.length; i++) {
    if (mouseCursors[i].ID === myID) {
      mouseToRemove = i;      
      mouseCursors.splice(mouseToRemove, 1);
    }
  }
  
  if (mouseCursors.length === 1){
    mouseCursors = [];
  }
}

//--------------------------------------------------------------

function drawPoints(data){
  let imgContainer = document.getElementById(`mouse-${data.colorID}-img`);      
  let imgPath = "./" + str(mouseImagePaths[data.colorID]);
  imgContainer.src = imgPath;

  let pointsTextContainer = document.getElementById(`points-${data.colorID}-text`);
  pointsTextContainer.innerHTML = data.points;
}

//--------------------------------------------------------------

function resetPoints(){
  for (let i = 0; i < mouseImagePaths.length; i++){
    let imgContainer = document.getElementById(`mouse-${i}-img`);
    let imgPath = "./assets/cursorEmpty.png";
    imgContainer.src = imgPath;
    
    let pointsTextContainer = document.getElementById(`points-${i}-text`);
    pointsTextContainer.innerHTML = 0;
  }
  
  sendPointsData();
}

//--------------------------------------------------------------

function sendPointsData(){
  let dataObj = {
    "colorID": colorID,
    "points": myMouseArray[0].points
  }
  
  socket.emit("weHaveUpdatedPoints", dataObj);
}

//--------------------------------------------------------------

function sendThisMouseData() {
  if (myMouseArray.length === 1) {
    for (let mouse of myMouseArray) {
      let dataObj = {
        xPos: mouse.x,
        yPos: mouse.y,
        colorID: mouse.colorID,
        myID: mouse.ID,
        points: mouse.points
      };
      //console.log("sending to server:", dataObj);
      socket.emit("weHaveNewMouseData", dataObj);
    }
  }
}

//--------------------------------------------------------------

function mouseClicked() {
  console.log("myMouseArray:", myMouseArray);
  console.log("mouseCursors:", mouseCursors);
}


//--------------------------------------------------------------
//Prevent mobile version from scrolling 
// https://stackoverflow.com/questions/49854201/html5-issue-canvas-scrolling-when-interacting-dragging-on-ios-11-3/51652248#51652248
// Prevent scrolling when touching the canvas
document.body.addEventListener("touchstart", function (e) {
    if (e.target == canvas) {
        e.preventDefault();
    }
}, { passive: false });
document.body.addEventListener("touchend", function (e) {
    if (e.target == canvas) {
        e.preventDefault();
    }
}, { passive: false });
document.body.addEventListener("touchmove", function (e) {
    if (e.target == canvas) {
        e.preventDefault();
    }
}, { passive: false });