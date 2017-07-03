#!/usr/bin/env node

var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var opener = require('opener');



console.log("Levantando test!!!");


app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(client){
    client.emit("hola");
    console.log("Enviando hola desde servidor "+new Date().getSeconds()+':'+new Date().getMilliseconds());
    client.on("hola servidor", function(){
        console.log("Recibido hola desde cliente "+new Date().getSeconds()+':'+new Date().getMilliseconds());
        client.emit("adios cliente");
        console.log("Enviando adios desde servidor "+new Date().getSeconds()+':'+new Date().getMilliseconds());
    })
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});

opener("http://localhost:3000");
    