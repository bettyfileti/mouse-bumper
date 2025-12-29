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
let otherPlayers = {}; // Store other players' cursors by socket ID

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
    background(220);
    rect(rectCanvas.x, rectCanvas.y, rectCanvas.w, rectCanvas.h);

    // Draw my cursor
    for (let mouse of mouseCursors) {
        mouse.checkControl();
        mouse.update();
        mouse.show();
    }
    
    // Draw other players' cursors
    for (let id in otherPlayers) {
        otherPlayers[id].show();
    }
}

function mouseMoved() {
    let dataObj = {
        "x" : mouseCursors[0].x,
        "y" : mouseCursors[0].y,
        "colorID" : mouseCursors[0].colorID,
        "socketId": socket.id
    }
    socket.emit("data", dataObj);
}

function mouseClicked(){
    console.log(mouseCursors);
}


function drawObj(data) {
    // Don't draw my own cursor from the server
    if (data.socketId === socket.id) return;
    
    let colorID = data.colorID;
    
    // Update or create cursor for this player
    if (otherPlayers[data.socketId]) {
        otherPlayers[data.socketId].x = data.x;
        otherPlayers[data.socketId].y = data.y;
    } else {
        otherPlayers[data.socketId] = new MouseCursor(data.x, data.y, mouseImages[colorID], colorID);
    }
}
