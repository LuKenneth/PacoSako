

var express = require('express');
var app = express();
app.use(express.static('.'));
var http = require('http').Server(app);
var port = 3000;


http.listen(port, function () {
    console.log('listening on *: ' + port);
});



// setup my socket server
var io = require('socket.io')(http);

io.on('connection', function(socket){
    console.log('New connection');

    socket.on('message', function(msg) {
        console.log('Got message from client: ' + msg);
    });
});