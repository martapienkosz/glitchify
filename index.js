let express = require('express');
let http = require('http');
const { emit } = require('process');
let io = require("socket.io");

let app = express();
let server = http.createServer(app); // wrap the express app with http
io = new io.Server(server); // use socket.io on the http app

app.use('/', express.static('public'));

// check for socket connection
io.sockets.on("connection", (socket) => {
    console.log("We have a new client", socket.id)
    // drop a message on the server when socket disconnects
    socket.on("disconnect", () => {
        console.log("socket has been disconnected", socket.id)
    })

    socket.on("colorArray", (data) => {
        console.log("got colorArray: "+data); // receive and send color values
        io.sockets.emit("colorArrayFromServer", data)
    })

    socket.on("camPos", (data) => {
        console.log("got camPos: "+data); // receive and send camera position values
        io.sockets.emit("camPosFromServer", data)
    })
})

// server listening on port
server.listen(8813, () => {
  console.log("server is up and running")
})