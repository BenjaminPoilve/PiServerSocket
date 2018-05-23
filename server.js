const WebSocket	= require('ws');
const RateLimit	= require('express-rate-limit');
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
    ];
    const direction = choices
	  .map(c => c.dir)
	  .find(dir => dir == req.params.direction);

    choices.forEach(choice => choice.dir == direction ? choice.fn() : null);
    console.log("received -- " + req.ip);

    chatWSS.broadcast(JSON.stringify({username, direction}));

    return res.json({numvoter:vote,lastChoice:lastvote});
});

// app.get("/up", function(req, res) {
//     res.json({numvoter:vote,lastChoice:lastvote});
//     upcount+=1;
//     console.log("received")
// });
// app.get("/down", function(req, res) {
//     res.json({numvoter:vote,lastChoice:lastvote});
//     downcount+=1;
//     console.log("received")
// });
// app.get("/right", function(req, res) {
//     res.json({numvoter:vote,lastChoice:lastvote});
//     leftcount+=1;
//     console.log("received")
// });
// app.get("/left", function(req, res) {
//     res.json({numvoter:vote,lastChoice:lastvote});
//     rightcount+=1;
//     console.log("received")
// });

const broadcastDirectionToClients = direction => {

};

function getPool() {
    const sum = upcount + downcount + leftcount + rightcount;

    if(0 == sum) {
        vote = 0;
        lastvote = "null";
    } else {
        var a = [upcount, downcount, leftcount, rightcount];
        var i = a.reduce((iMax, x, i, arr) => x > arr[iMax] ? i : iMax, 0);

        vote = sum;
        if(i == 0){
            lastvote="up";
            wss.broadcast("G0 Z10Y0\n");
        } else if(i == 1){
            lastvote="down";
            wss.broadcast("G0 Z-10Y0\n");
        } else if(i == 2){
            lastvote="right";
            wss.broadcast("G0 Z0Y10\n");
        } else if(i == 3){
            lastvote="left";
            wss.broadcast("G0 Z0Y-10\n");
        }
    }

    upcount	= 0;
    downcount	= 0;
    leftcount	= 0;
    rightcount	= 0;
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
