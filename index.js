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


io.sockets.on("connection", socket => {
  console.log("We have a new client: " + socket.id);
  clientCount ++;
  
  let newClientData = {
    clientID : socket.id,
    clientCount : clientCount
  }
  
  socket.emit("getMySocketId", newClientData);

  //Receive updated array
  socket.on("weHaveNewMouseData", data => {
  
    socket.broadcast.emit('draw-data', data); //send to all, except me
    //io.sockets.emit("draw-data", data); //send to all, including me
  });
  
  //will need a socket for if the data disappears/user exits? 

  socket.on("disconnect", () => {
    socket.broadcast.emit("clientLeft", socket.id);
    console.log("Client disconnected: " + socket.id);
  });

});
