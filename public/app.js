//client-side socket connection
let socket = io();

socket.on("connect", () => {
    console.log("Connected");
});

//listen for data from server
socket.on("draw-data", (data) => {
    drawObj(data);
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

let mouseCursors = [];
let mouseImages = [];

function preload() {
    mouseAqua = loadImage("assets/cursorAqua.png");
    mouseBlue = loadImage("assets/cursorBlue.png");
    mouseGreen = loadImage("assets/cursorGreen.png");
    mouseOrange = loadImage("assets/cursorOrange.png");
    mousePink = loadImage("assets/cursorPink.png");
    mousePurple = loadImage("assets/cursorPurple.png");
    mouseRed = loadImage("assets/cursorRed.png");
    mouseYellow = loadImage("assets/cursorYellow.png");

    mouseImages.push(mouseAqua, mouseBlue, mouseGreen, mouseOrange, mousePink, mousePurple, mouseRed, mouseYellow);
}

function setup() {

    let myCanvas = createCanvas(600, 600);
    background(220);

    myCanvas.parent("canvas-container");

    let margin = 0;
    rectCanvas = {
        x: margin / 2,
        y: margin / 2,
        w: width - margin,
        h: height - margin
    }

    //load new players in at origin and have them slowly meet the user's cursor
    let colorID = int(random(mouseImages.length));
    let newMouse = new MouseCursor(width / 2, height / 2, mouseImages[colorID], colorID);
    mouseCursors.push(newMouse);
}

function draw(){
    rect(rectCanvas.x, rectCanvas.y, rectCanvas.w, rectCanvas.h);

    for (let mouse of mouseCursors) {
        mouse.checkControl();
        mouse.update();
        mouse.show();
    }
}

function mouseMoved() {
    let dataObj = {
        "xPos" : mouseCursors[0].x,
        "yPos" : mouseCursors[0].y,
        "colorID" : mouseCursors[0].colorID,
    }
    socket.emit("data", dataObj);
}

function mouseClicked(){
    console.log(mouseCursors);
}


function drawObj(data) {
    let colorID = data.colorID;
    let newMouse = new MouseCursor(data.x, data.y, mouseImages[colorID], colorID);
    //By not pushing the new one to an array, can we just have it go through?
}