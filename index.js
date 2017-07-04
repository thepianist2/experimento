#!/usr/bin/env node
var express = require('express');
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var opener = require('opener');
var colors = require('colors');
var asyncLoop = require('node-async-loop');
var resultPattern = [];

var configFile = require(process.cwd()+'/test.conf.json');



//allow paths publics
configFile.publicPaths.forEach(function(value){
  app.use(express.static(value));
});

//executing test array
configFile.tests.forEach(function(test){
  console.log(colors.cyan("OPENING URL: "+test.url.green+"...".green));
  opener(test.url);

  console.log(colors.cyan("EXECUTING TEST: "+test.name.green));
    io.on('connection', function(client){
      test.scenarios.forEach(function(scenario, index){
        console.log(colors.cyan("SENDING ACTION TO CLIENT: "+scenario.action.green));
        client.emit(scenario.action);
        //listener fromclient only one time
        if(index===0){
          //check patterns test
          client.on("fromclient", function(clase, message){
            console.log(colors.cyan("RESPONSE RECEIVED: "+message.green));
            resultPattern.push(message);
            //all patterns they should be passed
            if(resultPattern.length===scenario.patterns.length){
              //compare test result with pattern expect
              if(resultPattern.every(function(results, i) {return results === scenario.patterns[i].status; })){
                console.log("Ha pasado correctamente");
              }else{
                console.log("Ha Fallado");
              }
            }
          });
        }
      });
    });

});


http.listen(configFile.portServer, function(){
  console.log('Test listening in port: '+configFile.portServer);
});


    