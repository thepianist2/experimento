#!/usr/bin/env node
var express = require('express');
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var opener = require('opener');


//var config = require('./config_test.json');

//console.log(config.urls[0]);

console.log(process.argv[1]);
console.log(__dirname);



console.log("Levantando test!!!");


app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

app.use(express.static('public'));

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
    