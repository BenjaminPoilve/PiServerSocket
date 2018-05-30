#!/usr/bin/env node

const RecoWS	= require("reconnecting-websocket");
const WS	= require("ws");
const SP	= require('serialport');

const WS_URL	= 'ws://ec2-35-180-32-199.eu-west-3.compute.amazonaws.com:8080';
const USB_PATH	= '/dev/cu.usbserial-A5055PCP';

let init = false;

const rwsOptions = {
    WebSocket: WS, // custom WebSocket constructor
    debug: true,
    reconnectInterval: 3000
};

const port = new SP(
    USB_PATH,
    { baudRate: 250000 },
    err => err ? console.log('Error: ', err.message) : null
);


port.on('data', data => {
    console.log('Data:', data.toString('utf8'));

    if (data.toString('utf8').trim() == "ok" && init == false) {
	port.write("G91/n", err => {
	    if (err) {
		console.log('Error on write: ', err.message);
	    } else {
		console.log('init done');
		init = true;
	    }
	});
    }
});

const rws = new RecoWS(WS_URL, [], rwsOptions);

rws.addEventListener('message', msg => {
    console.log(msg.data);
    port.write(msg.data, err =>  console.log(err ? `Error on write: ${err.message}` : 'message written'));
});

rws.addEventListener('close', msg => {
    console.log('CLOSE --- IT SHOULD NOT CLOSE !!!');
    console.log(msg);
});
