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
  ws.send('G91');
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
    wss.broadcast("G0 X10Y0")
});
app.get("/down", function(req, res) {
    res.send("ok");
    console.log("received")
    wss.broadcast("G0 X-10Y0")
});
app.get("/right", function(req, res) {
    res.send("ok");
    console.log("received")
    wss.broadcast("G0 X0Y10")
});
app.get("/left", function(req, res) {
    res.send("ok");
    console.log("received")
    wss.broadcast("G0 X0Y10")
});