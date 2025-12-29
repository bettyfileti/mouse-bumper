//express
let express = require("express");
let app = express();
app.use("/", express.static("public"));

//server
let http = require("http");
let server = http.createServer(app);
let port = process.env.PORT || 3000;
server.listen(port, () => {
    console.log("Server is listening at: " + port);
});

//socket connection
let io = require("socket.io");
io = new io.Server(server);

let clientCount = 0;

//socket connection
io.sockets.on("connection", (socket) => {
    console.log("We have a new client: " + socket.id);
    
    // Send socket ID and color assignment to new client
    socket.emit("getMySocketId", {
        clientID: socket.id,
        clientCount: clientCount
    });
    
    clientCount++;

    socket.on("disconnect", () => {
        console.log("Client disconnected: " + socket.id);
        clientCount--;
        
        // Tell all other clients this player left
        socket.broadcast.emit("clientLeft", socket.id);
    });

    // Listen for mouse position data
    socket.on("weHaveNewMouseData", (data) => {
        // Send to all OTHER clients (not back to sender)
        socket.broadcast.emit("draw-data", data);
    });
    
    // Listen for points updates
    socket.on("weHaveUpdatedPoints", (data) => {
        // Send to all clients including sender
        io.sockets.emit("draw-points", data);
    });
});
