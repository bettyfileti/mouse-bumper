//client-side socket connection
let socket = io();

socket.on("connect", () => {
    console.log("Connected");
});

//listen for data from server
socket.on("draw-data", (data) => {
    drawObj(data);
});

socket.on("points-data", (data) => {
    updatePoints(data);
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
let imBeingBumpedBy;

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

    //load new players in at origin
    let colorID = int(random(mouseImages.length));
    let newMouse = new MouseCursor(width / 2, height / 2, mouseImages[colorID], colorID, socket.id, 0);
    mouseCursors.push(newMouse);
    assignPlayerSlot(newMouse);
}

function draw(){
    background(220);
    rect(rectCanvas.x, rectCanvas.y, rectCanvas.w, rectCanvas.h);

    for (let mouse of mouseCursors) {
        mouse.checkControl();
        mouse.checkCollision();
        mouse.update();
        mouse.show();
    }
}

function mouseMoved() {
    let dataObj = {
        "x": mouseCursors[0].x,
        "y": mouseCursors[0].y,
        "colorID": mouseCursors[0].colorID,
        "socketId": socket.id
    }
    socket.emit("data", dataObj);
}

function sendPointsData() {
    let pointsObj = {
        "points": mouseCursors[0].points,
        "socketId": socket.id
    }
    socket.emit("points", pointsObj);
}

function drawObj(data) {
    // Don't draw my own cursor from the server
    if (data.socketId === socket.id) return;
    
    let colorID = data.colorID;
    
    // Check if this player already exists
    let existingMouse = mouseCursors.find(m => m.ID === data.socketId);
    
    if (existingMouse) {
        // Update existing cursor position
        existingMouse.x = data.x;
        existingMouse.y = data.y;
    } else {
        // Create new cursor for new player
        let newMouse = new MouseCursor(data.x, data.y, mouseImages[colorID], colorID, data.socketId, 0);
        mouseCursors.push(newMouse);
        assignPlayerSlot(newMouse);
    }
}

function updatePoints(data) {
    let mouse = mouseCursors.find(m => m.ID === data.socketId);
    if (mouse) {
        mouse.points = data.points;
        
        // Update scoreboard UI
        let index = mouse.index;
        if (index !== undefined) {
            document.getElementById(`points-${index}-text`).textContent = mouse.points;
        }
    }
}

function assignPlayerSlot(mouse) {
    // Find first empty slot (no assigned player yet)
    for (let i = 0; i < 8; i++) {
        let slotUsed = mouseCursors.some(m => m.index === i && m.ID !== mouse.ID);
        if (!slotUsed) {
            mouse.index = i;
            // Update the scoreboard image
            let imgElement = document.getElementById(`mouse-${i}-img`);
            if (imgElement && mouse.color && mouse.color.canvas) {
                imgElement.src = mouse.color.canvas.toDataURL();
            }
            return;
        }
    }
}
