#!/usr/bin/env node
var express = require('express');
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var opener = require('opener');
var colors = require('colors');


var configFile = require(process.cwd()+'/test.conf.json');



configFile.publicPaths.push(process.cwd());
//allow paths publics
configFile.publicPaths.forEach(function(value){
  app.use(express.static(process.cwd()+'/'+value));
});

//executing test array
configFile.tests.forEach(function(test){
  
  console.log(colors.cyan("OPENING URL: "+test.url.green+"...".green));
  opener(test.url);

  console.log(colors.cyan("EXECUTING TEST: "+test.name.green));
    io.on('connection', function(client){
      var resultPattern = [];
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
            if(message===scenario.finisher){
              //get resultPattern compared with waiting pattern
              filterResultPattern(scenario.patterns, resultPattern, (filterResult)=>{
                //compare the filter pattern with waitign pattern
                if(filterResult.every(function(results, i) {return results === scenario.patterns[i].status; })){
                  console.log(colors.green("THE TEST \'"+ test.name +"\' PASSED SUCCESSFULLY !!"));
                  resultPattern = [];
                }else{
                  resultPattern = [];
                  //throw new TypeError("THE TEST \'"+ test.name +"\' FAILED !!");
                  console.log(colors.red("THE TEST \'"+ test.name +"\' FAILED !!"));
                }
              });
            }else{

            }
          });
        }
      });
    });

});


//compare result pattern and filter with the waiting pattern
function filterResultPattern(pattern, resultPattern, cb){
  cb(resultPattern.filter((result, index)=>{ return typeof (pattern.find((element)=>{ return element.status === result;})) !== 'undefined';}));
}


http.listen(configFile.portServer, function(){
  console.log('Test listening in port: '+configFile.portServer);
});


    