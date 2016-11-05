#!/usr/bin/env node
var events = require('events');
var eventEmitter = new events.EventEmitter();

var pins = [18, 23, 24, 25];
var buttons = [22, 27, 17];
var led = [];
var button = [];
var count = 0;
var i;
var x = 0;

var Gpio = require('onoff').Gpio;
for (i = 0; i < pins.length; i++) {
    led[i] = new Gpio(pins[i], 'out');
}

for (i = 0; i < buttons.length; i++) {
    button[i] = new Gpio(buttons[i], 'in', 'falling', {debounceTimeout:400});

}

button[0].watch(function (err, value) {
    if (err) { throw err; }
    eventEmitter.emit('pressed', 0);
});

button[1].watch(function (err, value) {
    if (err) { throw err; }
    eventEmitter.emit('pressed', 1);
});

button[2].watch(function (err, value) {
    if (err) { throw err; }
    eventEmitter.emit('pressed', 2);
});

eventEmitter.on('pressed', function(n) {
    // console.log('Button ' + n + ' pressed');
    reset_leds();
    if (n == 0) {
    	count++;
    	if (count > 4) { count = 1 };
        led[count-1].writeSync(1);
    }
    else if (n == 2) {
    	count--;
    	if (count < 1) { count = 4 };
        led[count-1].writeSync(1);
    }
    else {
	x = (x == 0) ? 1 : 0;
        led[0].writeSync(x); 
        led[1].writeSync(x); 
        led[2].writeSync(x); 
        led[3].writeSync(x); 
    }
});


process.on('SIGINT', function () {
    for (i = 0; i < pins.length; i++) {
        led[i].unexport();
    }
    for (i = 0; i < buttons.length; i++) {
        button[i].unwatch();
          button[i].unexport();
    }
});

function reset_leds()
{
  for (var i = 0; i < pins.length; i++) {
      led[i].writeSync(0);
  }
}
