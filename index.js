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

    //listen for data
    socket.on("data", (data) => {
        //console.log(data)
        
        //send to all clients, including myself
        io.sockets.emit("draw-data", data);

        // //send to all clients, except me
        // socket.broadcast.emit('draw-data', data);

        // //send the data to just this client
        // socket.emit('data', data);

    });
});

