const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const zoopCtrl = require("./zoop-controller");
require('dotenv').config();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));

app.get('/', function(req,res){
  zoopCtrl.newWallet()
    .then((response) => {
      res.send(response);
    })
    .catch((err) => {
      res.err(new Error({message:'server error', status: 500}));
    })
})

app.post('/credit-transaction', function(req, res){
  if(!req.body.buyer_id || !req.body.amount){
    res.err(new Error({message:'params error', status: 400}));
  }else{
    zoopCtrl.createCreditTransaction(req.body.buyer_id,req.body.amount)
      .then((response) => {
        if(response.error){
          res.send(response.error);
        }else{
          res.send(response);
        }
      })
      .catch((err) =>{
        res.err(new Error({message:'server error', status: 500}));
      })
  }
});

// app.post('/associate-card-customer', function(req, res){
//   if(!req.body.buyer_id || !req.body.card_token){
//     res.err(new Error({message:'params error', status: 400}));
//   }else{
//     res.send("MAOE");
//     // zoopCtrl.associateCardCustomer()
//   }
// });

app.listen(3004,function(){
  console.log("Ouvindo a porta 3004!");
})
