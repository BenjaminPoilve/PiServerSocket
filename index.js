#!/usr/bin/env node
const ReconnectingWebSocket = require("reconnecting-websocket");
const WS = require("ws");

const options = {
    WebSocket: WS, // custom WebSocket constructor
    debug: true,
    reconnectInterval: 3000
};

init=false;

var SerialPort = require('serialport');
var port = new SerialPort('/dev/ttyUSB0', {
  baudRate: 250000
}, function (err) {
    if (err) {
	return console.log('Error: ', err.message);
    }
});


port.on('data', function (data) {
    console.log('Data:', data.toString('utf8'));
    if(data.toString('utf8').trim()=="ok" && init==false){
	port.write("G91/n", function(err) {
	    if (err) {
		return console.log('Error on write: ', err.message);
	    }
	    console.log('init done');
	    init=true;
	})};
});

const rws = new ReconnectingWebSocket('ws://ec2-35-180-32-199.eu-west-3.compute.amazonaws.com:8080', [], options);

rws.addEventListener('message', function (m) {
    console.log(m.data)
    port.write(m.data, function(err) {
	if (err) {
	    return console.log('Error on write: ', err.message);
	}
	console.log('message written');
    });
});
