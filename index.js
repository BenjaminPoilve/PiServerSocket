#!/usr/bin/env node
const ReconnectingWebSocket = require("reconnecting-websocket");
const WS = require("ws");

const options = {
    WebSocket: WS, // custom WebSocket constructor
};

const rws = new ReconnectingWebSocket('ws://localhost:8080', [], options);

rws.addEventListener('message', function (m) {
  console.log(m)
});