//client-side socket connection
let socket = io();

socket.on("connect", () => {
  console.log("Connected");
});

//listen for data from server
socket.on("draw-data", data => {
  createMouseObjects(data);
});

socket.on("getMySocketId", data => {
  myMouseID = data;
});

socket.on("clientLeft", data => {
  removeMouseObject(data);
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
let myMouseArray = [];
let mouseCursors = [];
let mouseImages = [];

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
    mouseAqua,
    mouseBlue,
    mouseGreen,
    mouseOrange,
    mousePink,
    mousePurple,
    mouseRed,
    mouseYellow
  );
}

function setup() {
  let myCanvas = createCanvas(400, 400);
  background(220);

  myCanvas.parent("canvas-container");

  let margin = 0;
  rectCanvas = {
    x: margin / 2,
    y: margin / 2,
    w: width - margin,
    h: height - margin
  };

  //load new players in at origin and have them slowly meet the user's cursor
  let colorID = int(random(mouseImages.length));

  myMouse = new MouseCursor(
    width/2,
    height/2,
    mouseImages[colorID],
    colorID,
    myMouseID,
    false
  );

  myMouseArray.push(myMouse);
  sendThisMouseData();
  console.log(myMouseID);
}

function draw() {
  sendThisMouseData();
  //console.log("imBeingBumped", imBeingBumped);
  rect(rectCanvas.x, rectCanvas.y, rectCanvas.w, rectCanvas.h);
  
  for (let mouse of myMouseArray) {
    mouse.checkControl();
    mouse.update();
    mouse.show();
  }

  if (weHaveTheMice) {
    for (let mice of mouseCursors) {
      mice.checkCollision();
      mice.updateBounce();
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
      data.bounce
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

function sendThisMouseData() {
  if (myMouseArray.length === 1) {
    for (let mouse of myMouseArray) {
      let dataObj = {
        xPos: mouse.x,
        yPos: mouse.y,
        colorID: mouse.colorID,
        myID: mouse.ID,
        bounce: mouse.bounce
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
