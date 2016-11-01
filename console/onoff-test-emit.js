#!/usr/bin/env node
var events = require('events');
var eventEmitter = new events.EventEmitter();

var pins = [18, 23, 24, 25];
var buttons = [22, 27, 17];
var led = [];
var button = [];
var count = 0;
var i;

var Gpio = require('onoff').Gpio;
for (i = 0; i < pins.length; i++) {
    led[i] = new Gpio(pins[i], 'out');
}

for (i = 0; i < buttons.length; i++) {
    button[i] = new Gpio(buttons[i], 'in', 'falling', {debounceTimeout:200});

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
    console.log('Button ' + n + ' pressed');
    reset_leds();
    if (n == 0) {
        led[count].writeSync(1);
    }
    else if (n == 1) {
        led[3-count].writeSync(1);
    }
    else {
        led[0].writeSync(1-count%2); 
        led[1].writeSync(1-count%2); 
        led[2].writeSync(1-count%2); 
        led[3].writeSync(1-count%2); 
    }
    count++;
    if (count > 3) { count = 0 };
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
