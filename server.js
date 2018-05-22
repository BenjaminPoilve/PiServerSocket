const WebSocket = require('ws');
var RateLimit = require('express-rate-limit');

var limiter = new RateLimit({
  windowMs: 1*1000, // 1 second
  max: 1, // limit each IP to 100 requests per windowMs
  delayMs: 0 // disable delaying - full speed until the max limit is reached
});
 
//  apply to all requests
var express = require("express");
var bodyParser = require("body-parser");
var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(limiter);
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});


var server = app.listen(3000, function () {
    console.log("Listening on port %s...", server.address().port);
});


const wss = new WebSocket.Server({ port: 8080 });


wss.on('connection', function connection(ws) {
  ws.send('G91 G28 \n');
});
wss.broadcast = function broadcast(data) {
  wss.clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
};

var upcount=0;
var downcount=0;
var leftcount=0;
var rightcount=0;
var vote=0;
var lastvote="null";

app.get("/up", function(req, res) {
    res.json({numvoter:vote,lastChoice:lastvote});
    upcount+=1;
    console.log("received")
});
app.get("/down", function(req, res) {
    res.json({numvoter:vote,lastChoice:lastvote});
    downcount+=1;
    console.log("received")
});
app.get("/right", function(req, res) {
    res.json({numvoter:vote,lastChoice:lastvote});
    leftcount+=1;
    console.log("received")
});
app.get("/left", function(req, res) {
    res.json({numvoter:vote,lastChoice:lastvote});
    rightcount+=1;
    console.log("received")
});

function getPool() {
    if(upcount+downcount+leftcount+rightcount==0){
        vote=0;
        lastvote="null"
    }else{
        var a = [upcount,downcount,leftcount,rightcount];
        var i = a.reduce((iMax, x, i, arr) => x > arr[iMax] ? i : iMax, 0);

        vote=upcount+downcount+leftcount+rightcount
        if(i==0){
            lastvote="up"
            wss.broadcast("G0 Z10Y0\n")
        }
        if(i==1){
            lastvote="down"
            wss.broadcast("G0 Z-10Y0\n")
        }
        if(i==2){
            lastvote="right"
            wss.broadcast("G0 Z0Y10\n")
        }
        if(i==3){
            lastvote="left"
            wss.broadcast("G0 Z0Y-10\n")
        }
    }
 upcount=0;
 downcount=0;
leftcount=0;
 rightcount=0;
}

setInterval(getPool,1000);

