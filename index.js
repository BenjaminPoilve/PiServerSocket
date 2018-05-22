#!/usr/bin/env node
const ReconnectingWebSocket = require("reconnecting-websocket");
const WS = require("ws");

const options = {
    WebSocket: WS, // custom WebSocket constructor
};

const rws = new ReconnectingWebSocket('ws://ec2-35-180-32-199.eu-west-3.compute.amazonaws.com:8080', [], options);

var SerialPort = require('serialport');
var port = new SerialPort('/dev/cu.usbserial-A5055PCP', {
  baudRate: 250000
}, function (err) {
  if (err) {
    return console.log('Error: ', err.message);
  }
});

rws.addEventListener('message', function (m) {
  console.log(m.data)
  port.write('main screen turn on', function(err) {
  if (err) {
    return console.log('Error on write: ', err.message);
  }
  console.log('message written');
});
});
