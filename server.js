const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const zoop = require("./zoop-controller");

app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({extended:false}));

app.get('/', function(req,res){
  res.send("Rota root");
})

app.listen(3004,function(){
  console.log("Ouvindo a porta 3004!");
})
