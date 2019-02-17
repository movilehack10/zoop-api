const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const zoopCtrl = require("./zoop-controller");
require('dotenv').config();

app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({extended:false}));

app.get('/', function(req,res){
  zoopCtrl.newWallet()
    .then((response) => {
      res.send(response);
    })
    .catch((err) => {
      res.err(err);
    })
})

app.listen(3004,function(){
  console.log("Ouvindo a porta 3004!");
})
