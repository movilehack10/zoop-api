const express = require('express');
const app = express();
const bodyParser = require('body-parser');
// const mapCtrl = require("./controllers/map-controller");

app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({extended:false}));

app.get('/', function(req,res){
  res.send("Rota root");
})

app.listen(3000,function(){
  console.log("Ouvindo a porta 3000!");
})
