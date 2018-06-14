#!/usr/bin/env node

const SP	= require('serialport');

const MachinePATH	= '/dev/cu.usbserial-A5055PCP';
const ControlePATH	= '/dev/cu.usbserial-A5055PCP';

let init = false;


const portMachine = new SP(
    MachinePATH,
    { baudRate: 250000 },
    err => err ? console.log('Error: ', err.message) : null
);
const portControle = new SP(
    ControlePATH,
    { baudRate: 250000 },
    err => err ? console.log('Error: ', err.message) : null
);


portMachine.on('data', data => {
    console.log('Data:', data.toString('utf8'));

    if (data.toString('utf8').trim() == "ok" && init == false) {
	portMachine.write("G91/n", err => {
	    if (err) {
		console.log('Error on write: ', err.message);
	    } else {
		console.log('init done');
		init = true;
	    }
	});
    }
});

portControle.on('data', data => {
    console.log('Data:', data.toString('utf8'));
    portMachine.write(data, err =>  console.log(err ? `Error on write: ${err.message}` : 'message written'));


});

