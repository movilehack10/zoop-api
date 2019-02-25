const express = require('express');
const compression = require('compression');
const bodyParser = require('body-parser');
const zoopCtrl = require('./zoop-controller');
const tokenControler = require('./server-token-controller');

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

// parameters: buyer_id and card_token
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

// parameters: buyer_id and amount
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

// parameters: buyer_id and amount
//
async function p2pSellerMasterBuyer(androidId, tokenValue, amount) {
  return await tokenControler.spendToken(
    tokenControler.getDatabase(),
    androidId,
    tokenValue,
    amount,
    (tokenInfo) => zoopCtrl.transactionP2P(
      tokenInfo.from || process.env.SELLER_ID,
      tokenInfo.to ||  process.env.BUYER_ID,
      tokenInfo.amount || 10
    )
  )
}
setTimeout(
  () => {
    tokenControler.getDatabase().then(async (db) => {
      try {
        let w1 = await tokenControler.createWallet(db);
        await tokenControler.updateWallet(db, w1.androidId, process.env.SELLER_ID, 0, '{"name":"SELLER_ID"}');

        let w2 = await tokenControler.createWallet(db);
        await tokenControler.updateWallet(db, w2.androidId, process.env.BUYER_ID, 0, '{"name":"BUYER_ID"}');

        const token = await tokenControler.createToken(db, w1.id, {
          expire_time: Date.now() + (Date.parse('05 Jan 1970 00:00:00 GMT') - Date.parse('01 Jan 1970 00:00:00 GMT')),
          limit_money_ammout: 1500,
          limit_used_times: 10,
        })
        const result = await p2pSellerMasterBuyer(w2['android_id'], token['token_value'], 1000)
        console.log({'self-test': result})
      } catch (e) {
        console.log({'self-test-error': e})
      }
    })
  },
  200
)
app.post('/p2p-token', function(req, res){
  buyer_id = req.body.buyer_id
  tokenValue = req.body.tokenValue
  androidId = req.body.androidId
  amount = req.body.amount
  if (!buyer_id || !tokenValue || !androidId || !amount) {
    return res.send({message:'params error', status_code: 400});
  }
  try {
    p2pSellerMasterBuyer({tokenValue, androidId, amount})
    .then(
      result => result != null ? res.send('Trasnsação Aprovada') : res.send('Trasnsação Negada')
    ).catch(
      error => res.send({message: error, status_code: 400})
    )
  } catch (error) {
    return res.send({message: error, status_code: 400});
  }
});

app.post('/p2p-seller_master-buyer', function(req, res){
  if(!req.body.buyer_id || !req.body.amount){
    res.send({message:'params error', status_code: 400});
  }else{
    zoopCtrl.transactionP2P(process.env.SELLER_MASTER, req.body.buyer_id, req.body.amount)
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

 // gets buyer info
app.post('/buyer-info', function(req, res){
  if(!req.body.buyer_id){
    res.send({message:'params error', status_code: 400});
  }else{
    zoopCtrl.buyerInfo(req.body.buyer_id)
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

// app.post('/p2p-buyer-seller_slave', function(req, res){
//   if(!req.body.buyer_id || !req.body.amount){
//     res.send({message:'params error', status_code: 400});
//   }else{
//     zoopCtrl.transactionP2P(req.body.buyer_id, process.env.SELLER_SLAVE, req.body.amount)
//       .then((response) =>{
//         if(response.error){
//           res.send(response.error);
//         }else{
//           res.send(response)
//         }
//       })
//       .catch((error) =>{
//         res.send({message:'params error', status_code: 500});
//       })
//   }
// });

try {
  app.listen(3004, function() {
    console.log('Ouvindo a porta 3004!');
  })
} catch (e) {
  console.log('porta 3004 em uso!');
  exit()
}

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
