#!/usr/bin/env node
var express = require('express');
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var opener = require('opener');
var colors = require('colors');
var indiceTest = 0;

var configFile = require(process.cwd()+'/test.conf.json');


app.use(express.static(process.cwd()));
//allow paths publics
configFile.publicPaths.forEach(function(value){
  app.use(express.static(process.cwd()+'/'+value));
});

const exit = () => {
  setTimeout(() => process.exit(), 0);
};


function executeTest(test){

  console.log(colors.cyan("OPENING URL: "+test.url.green+"...".green));
  opener(test.url);

  console.log(colors.cyan("EXECUTING TEST: "+test.name.green));
  io.on('connection', function(client){
    var resultPattern = [];
    test.scenarios.forEach(function(scenario, index){
      console.log(colors.cyan("SENDING ACTION TO CLIENT: "+scenario.action.green));
      client.emit(scenario.action);
      //listener fromclient only one time
      //if(index===0){
        //check patterns test
        client.on("fromclient", function(clase, message){
          console.log(colors.cyan("RESPONSE RECEIVED: "+clase+' '+message.green));
          resultPattern.push(message);
          //all patterns they should be passed
          if(message===scenario.finisher){
            //get resultPattern compared with waiting pattern
            filterResultPattern(scenario.patterns, resultPattern, (filterResult)=>{
              //compare the filter pattern with waitign pattern
              if(filterResult.every(function(results, i) {return results === scenario.patterns[i].status; })){
                console.log(colors.green("THE TEST \'"+ test.name +"\' PASSED SUCCESSFULLY !!"));
                resultPattern = [];
                client.emit('close');
                client.disconnect(true);
                //exit();
                executeNextTest();
              }else{
                console.log("Result match pattern: \'"+filterResult+"\'");
                console.log("Waiting pattern: \'"+scenario.patterns.map((pattern)=>{return pattern.status})+"\'");
                resultPattern = [];
                //throw new TypeError("THE TEST \'"+ test.name +"\' FAILED !!");
                console.log(colors.red("THE TEST \'"+ test.name +"\' FAILED !!"));
                //setTimeout(() => process.exit(), 0);
                client.emit('close');
                exit();
                client.disconnect(true);
                executeNextTest();
              }
            });
          }
        });
      //}
    });


  });

}





executeTest(configFile.tests[indiceTest]);


function executeNextTest(){
  indiceTest+=1;
  if(indiceTest<configFile.tests.length){
    executeTest(configFile.tests[indiceTest]);
  }else{
    console.log("Todos los test han finalizado");
    exit();
  }
}


//compare result pattern and filter with the waiting pattern
function filterResultPattern(pattern, resultPattern, cb){
  cb(resultPattern.filter((result, index)=>{ return typeof (pattern.find((element)=>{ return element.status === result;})) !== 'undefined';}));
}


http.listen(configFile.portServer, function(){
  console.log('Test listening in port: '+configFile.portServer);
});


    