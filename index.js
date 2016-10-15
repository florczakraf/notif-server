var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var bodyParser = require('body-parser');


var connections = {}

app.use(bodyParser.json());
app.use(express.static('public'));

app.get('/', function(req, res) {
    res.sendfile('index.html');
});

app.post('/push', function(req, res) {
    let input = req.body;
    let token = input.token;

    if (connections[token]) {
        if (!connections[token].connected) {
            delete connections[token];
            console.log("Deleted connection for token: " + token);

            res.send(500);
        }
        else {
            connections[token].emit('message', input.message);
            console.log("Sent message: " + input.message + " for token: " + token);
            res.send(200);
        }
    }
    else {
        console.log("No registered connection for token: " + token);
        res.send(404);
    }
});

io.on('connection', function(socket) {
    console.log('a user connected');
    
    socket.on('token', function(token) {
        connections[token] = socket;
    });
});

http.listen(3000, function() {
    console.log('listening on *:3000');
});