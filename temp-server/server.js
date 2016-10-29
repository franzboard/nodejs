#!/usr/bin/env node

var express = require('express')
,   app = express()
,   server = require('http').createServer(app)
,   io = require('socket.io').listen(server)
,   conf = require('./config.json')
,   spawn = require('child_process').spawn
,   fs = require('fs');
 
var ds18b20 = require('ds18b20');

var interval = 1000; //enter the time between sensor queries here (in milliseconds)

// Webserver
// auf den Port x schalten
server.listen(conf.port);

// statische Dateien ausliefern
app.use(express.static(__dirname + '/public'));

// wenn der Pfad / aufgerufen wird
app.get('/', function (req, res) {
	// so wird die Datei index.html ausgegeben
	res.sendFile(__dirname + '/public/index.html');
});
 
 
//when a client connects
io.sockets.on('connection', function (socket) {
    console.log('connect from: ' + socket.id);
    var sensorId = [];
    //fetch array containing each ds18b20 sensor's ID
    ds18b20.sensors(function (err, id) {
        sensorId = id;
        socket.emit('sensors', id); //send sensor ID's to clients
    });
 
    //initiate interval timer
    setInterval(function () {
        //loop through each sensor id
        sensorId.forEach(function (id) {
 
            ds18b20.temperature(id, function (err, value) {
                
                //send temperature reading out to connected clients
                socket.emit('temps', {'id': id, 'value': value});
 
            });
        });
 
    }, interval);
});


// Portnummer in die Konsole schreiben
console.log('Server listening on port ' + conf.port + '/');


