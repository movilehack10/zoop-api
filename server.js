const express = require('express');
const compression = require('compression');
const bodyParser = require('body-parser');
const zoopCtrl = require("./zoop-controller");

const app = express();

app.use(compression())
require('dotenv').config();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));

app.get('/', function(req,res){
  zoopCtrl.newWallet()
    .then((response) => {
      res.send(response);
    })
    .catch((err) => {
      res.send({message:'server error', status_code: 500});
    })
})

// app.post('/credit-transaction', function(req, res){
//   if(!req.body.buyer_id || !req.body.amount){
//     res.send({message:'params error', status_code: 400});
//   }else{
//     zoopCtrl.createCreditTransaction(req.body.buyer_id,req.body.amount)
//       .then((response) => {
//         if(response.error){
//           res.send(response.error);
//         }else{
//           res.send(response);
//         }
//       })
//       .catch((err) =>{
//         res.send({message:'server error', status_code: 500});
//       })
//   }
// });

app.post('/recharge-card', function(req, res){
  if(!req.body.buyer_id || !req.body.amount || !req.body.card_token){
    res.send({message:'params error', status_code: 400});
  }else{
    // zoopCtrl.rechargeCard(req.body.buyer_id, req.body.card_token, req.body.amount)
    //   .then((response) => {
    //     if(response.error){
    //       res.send(response.error);
    //     }else{
    //       res.send(response)
    //     }
    //   })
    //   .catch((error) =>{
    //     res.send({message:'server error', status_code: 500});
    //   })
  }
})

app.post('/associate-card-customer', function(req, res){
  if(!req.body.buyer_id || !req.body.card_token){
    res.send({message:'params error', status_code: 400});
  }else{
    zoopCtrl.associateCardCustomer(req.body.buyer_id, req.body.card_token)
      .then((association) => {
        if(association.error){
          res.send(association.error);
        }else{
          res.send(association.id);
        }
      })
      .catch((err) =>{
        res.send({message:'server error', status_code: 500});
      })
  }
});

app.post('/one-click-pay', function(req, res){
  if(!req.body.buyer_id || !req.body.amount){
    res.send({message:'params error', status_code: 400});
  }else{
    zoopCtrl.oneClickPay(req.body.buyer_id, req.body.amount)
      .then((response) =>{
        if(response.error){
          res.send(response.error);
        }else{
          res.send(response)
        }
      })
      .catch((error) =>{
        res.send({message:'params error', status_code: 500});
      })
  }
});

app.listen(3004,function(){
  console.log("Ouvindo a porta 3004!");
})
