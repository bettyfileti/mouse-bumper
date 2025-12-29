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

//socket connection
io.sockets.on("connection", (socket) => {
    console.log("We have a new client: " + socket.id);

    socket.on("disconnect", ()=> {
        console.log("Client disconnected: " + socket.id);
    });

    //listen for cursor position data
    socket.on("data", (data) => {
        //send to all clients, including myself
        io.sockets.emit("draw-data", data);
    });
    
    //listen for points data
    socket.on("points", (data) => {
        //send to all clients
        io.sockets.emit("points-data", data);
    });
});
