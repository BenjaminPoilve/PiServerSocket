const WebSocket = require('ws');

var express = require("express");
var bodyParser = require("body-parser");
var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


var server = app.listen(3000, function () {
    console.log("Listening on port %s...", server.address().port);
});


const wss = new WebSocket.Server({ port: 8080 });


wss.on('connection', function connection(ws) {
  ws.send('hello mate');
});
wss.broadcast = function broadcast(data) {
  wss.clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
};



app.get("/up", function(req, res) {
    res.send("ok");
    console.log("received")
    wss.broadcast("up")
});
app.get("/down", function(req, res) {
    res.send("ok");
    console.log("received")
    wss.broadcast("down")
});
app.get("/right", function(req, res) {
    res.send("ok");
    console.log("received")
    wss.broadcast("right")
});
app.get("/left", function(req, res) {
    res.send("ok");
    console.log("received")
    wss.broadcast("left")
});