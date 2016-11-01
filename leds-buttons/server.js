#!/usr/bin/env node

var express = require('express')
,   app = express()
,   server = require('http').createServer(app)
,   io = require('socket.io').listen(server)
,   conf = require('./config.json')
,   spawn = require('child_process').spawn
,   fs = require('fs')
,   events = require('events')
,   Gpio = require('onoff').Gpio;


///////////////// Webserver setup ////////////////////////
server.listen(conf.port);
app.use(express.static(__dirname + '/public'));
app.get('/', function (req, res) {
        res.sendFile(__dirname + '/public/index.html');
});

console.log('Server listening on port ' + conf.port);
  
///////////////// Websocket //////////////////////////////
function sendData(data)
{
    // console.log('Button ' + data.id + ' ' + data.value);
    io.sockets.emit('appdata', data);
}

io.sockets.on('connection', function (socket) {
    console.log('socket connect from ID: ' + socket.id);
    initialButtonValues();
    initialLedValues();
    
    eventEmitter.on('buttonPressed', sendData); 
    
    socket.on('appdata', function(data) {
        // console.log('LED ' + data.id + ' ' + data.value);
        eventEmitter.emit('ledOnOff', data);
        io.sockets.emit('appdata', data);
    });
        socket.on('disconnect', function() {
                eventEmitter.removeListener('buttonPressed', sendData);
                console.log( 'socket disconnect from ID: ' + socket.id );
        });
        
});

////////////////// Setup buttons + event listener //////////////////
var eventEmitter = new events.EventEmitter();

var button22 = new Gpio(22, 'in', 'both');
var button27 = new Gpio(27, 'in', 'both');
var button17 = new Gpio(17, 'in', 'both');

button22.watch(function (err, value) {
        if (err) { throw err; }
        eventEmitter.emit('buttonPressed', {'id':'button22', 'value':value});
});

button27.watch(function (err, value) {
        if (err) { throw err; }
        eventEmitter.emit('buttonPressed', {'id':'button27', 'value':value});
});

button17.watch(function (err, value) {
        if (err) { throw err; }
        eventEmitter.emit('buttonPressed', {'id':'button17', 'value':value});
});

function initialButtonValues()
{
    button22.read(function (err, value) {
        if (err) { throw err; }
        eventEmitter.emit('buttonPressed', {'id':'button22', 'value':value});
    });

    button27.read(function (err, value) {
        if (err) { throw err; }
        eventEmitter.emit('buttonPressed', {'id':'button27', 'value':value});
    });

    button17.read(function (err, value) {
        if (err) { throw err; }
        eventEmitter.emit('buttonPressed', {'id':'button17', 'value':value});
    });
}    
    

////////////////// Setup LEDs + event listener ////////////////////
var gpioLeds = ['18', '23', '24', '25'];
var led = [];
for (i = 0; i < gpioLeds.length; i++) {
        led[i] = new Gpio(gpioLeds[i], 'out');
}

eventEmitter.on('ledOnOff', function(data) {
    for(i = 0; i < gpioLeds.length; i++) {
        if (data.id == 'led' + gpioLeds[i]) {
            led[i].writeSync(data.value);
            break;
        }
    }
});

function initialLedValues()
{
    var value;
    for (i = 0; i < gpioLeds.length; i++) {
        value = led[i].readSync();
        io.sockets.emit('appdata', {'id': 'led' + gpioLeds[i], 'value':value});
    }
}



