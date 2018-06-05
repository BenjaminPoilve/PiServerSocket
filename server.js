const WebSocket		= require('ws');
const RateLimit		= require('express-rate-limit');
const express		= require("express");
const bodyParser	= require("body-parser");

var app	= express();
var limiter	= new RateLimit({
    windowMs	: 0.5 * 1000, // 0.5 second
    max	: 1, // limit each IP to 100 requests per windowMs
    delayMs	: 0 // disable delaying - full speed until the max limit is reached
});

app.use((req, res, next) => {
    req.ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    return next();
});
app.use(express.static('public/'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(limiter);
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});


const server = app.listen(3000, function () {
    console.log("Listening on port %s...", server.address().port);
});


const wss  = new WebSocket.Server({ port: 8080 });

wss.on('connection', ws => {
    ws.send('G91 G28 \n');
});

wss.broadcast = (data) => {
    wss.clients.forEach(client => {
	if (client.readyState === WebSocket.OPEN) {
	    client.send(data);
	}
    });
};

var upcount	= 0;
var downcount	= 0;
var leftcount	= 0;
var rightcount	= 0;
var d1count	= 0;
var d2count	= 0;
var d3count	= 0;
var d4count	= 0;
var vote	= 0;
var lastvote	= "null";

app.get('/', (req, res) => res.sendFile('index.html'));

app.get('/direction/:direction', (req, res) => {
    const username = req.query.username || req.ip;
    const choices = [
	{dir: "up",	fn() { upcount++;	}},
	{dir: "down",	fn() { downcount++;	}},
	{dir: "right",	fn() { rightcount++;	}},
	{dir: "left",	fn() { leftcount++;	}},
	{dir: "d1",	fn() { d1count++;	}},
	{dir: "d2",	fn() { d2count++;	}},
	{dir: "d3",	fn() { d3count++;	}},
	{dir: "d4",	fn() { d4count++;	}},
    ];
    const direction = choices
	  .map(c => c.dir)
	  .find(dir => dir == req.params.direction);

    choices.forEach(choice => choice.dir == direction ? choice.fn() : null);
    console.log("received -- " + req.ip);

    chatWSS.broadcast(JSON.stringify({username, direction}));

    return res.json({numvoter:vote,lastChoice:lastvote});
});


function getPool() {
    const sum = upcount + downcount + leftcount + rightcount;

    if(0 == sum) {
        vote = 0;
        lastvote = "null";
    } else {
	var votes = ["up", "down", "left", "right", "d1", "d2", "d3", "d4"];
	var commands = ["G0 Z10Y0\n", "G0 Z-10Y0\n", "G0 Z0Y-10\n", "G0 Z0Y10\n", "G0 Z10Y-10\n", "G0 Z10Y10\n", "G0 Z-10Y10\n", "G0 Z-10Y-10\n"];
        var votesSum = [upcount, downcount, leftcount, rightcount, d1count, d2count, d3count, d4count];
	var i = votesSum.indexOf(Math.max(...votesSum));

        vote = sum;
	lastvote = votes[i];
	wss.broadcast(commands[i]);
    }

    chatWSS.broadcast(JSON.stringify({choosen: lastvote}));

    upcount	= 0;
    downcount	= 0;
    leftcount	= 0;
    rightcount	= 0;
    d1count	= 0;
    d2count	= 0;
    d3count	= 0;
    d4count	= 0;
}

setInterval(getPool,500);

/* ---------------------------------------------------------------------------------------------------- */


var chatWSS = new WebSocket.Server({ port: 8888 });

chatWSS.broadcast = (data) => {
    chatWSS.clients.forEach(client => {
	if (client.readyState === WebSocket.OPEN) {
	    client.send(data);
	}
    });
};

chatWSS.on('request', request =>  {
    const connection = request.accept(null, request.origin);

    console.log(request.origin);

    connection.on('message', message =>  {
	if (message.type === 'utf8') {
	    console.log({message});
	}
    });

    connection.on('close', connection =>  {
	console.log("close connection");
    });
});
