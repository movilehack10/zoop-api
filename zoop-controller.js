var request = require("request");

function newWallet(){
  return new newBuyer();
}

// create buyer
function newBuyer(){
  const auth = "Basic " + new Buffer(process.env.PUB_KEY + ": ").toString("base64");

  let options = {
    headers : {
      "Authorization": auth,
      "Content-type": "application/json"
    },
    method: 'POST',
    url: `https://api.zoop.ws/v1/marketplaces/${process.env.MARKETPLACE_ID}/buyers`,
    json: {}
  };

  return new Promise((resolve, reject) => {
    request(options, function (error, response, body){
      if (error){
        reject(error);
      }
      else {
        resolve(body.id);
      }
    });
  })
}

// associate credit card and customer
function associateCardCustomer(buyer_id, card_token){
  const auth = "Basic " + new Buffer(process.env.PUB_KEY + ": ").toString("base64");

  let options = {
    headers : {
      "Authorization": auth,
      "Content-type": "application/json"
    },
    method: 'POST',
    url: `https://api.zoop.ws/v1/marketplaces/${process.env.MARKETPLACE_ID}/cards`,
    json: {
      "token": card_token,
      "customer": buyer_id
    }
  };

  return new Promise((resolve, reject) => {
    request(options, function (error, response, body){
      if (error){
        reject(error);
      }
      else {
        resolve(body);
      }
    });
  });
}

// card not present transaction
function createCreditTransaction(buyer_id, amount){
  const auth = "Basic " + new Buffer(process.env.PUB_KEY + ": ").toString("base64");
  let options = {
    headers : {
      "Authorization": auth,
      "Content-type": "application/json"
    },
    method: 'POST',
    url: `https://api.zoop.ws/v1/marketplaces/${process.env.MARKETPLACE_ID}/transactions`,
    json: {
    	"amount": amount,
      "currency": "BRL",
      "description": "venda",
      "on_behalf_of": process.env.SELLER_MASTER,
      "payment_type": "credit",
      "source": {
        "usage": "single_use",
    		"amount": amount,
    		"currency": "BRL",
    		"description": "TestTest",
    		"type": "card",
    		"card": {
    		  "id": process.env.INFINITE_CARD
        }
      }
    }
  }

  return new Promise((resolve, reject) => {
    request(options, function (error, response, body){
      if (error){
        reject(error);
      }
      else {
        resolve(body);
      }
    });
  });
}

module.exports = {
  newWallet: newWallet,
  createCreditTransaction: createCreditTransaction,
  associateCardCustomer: associateCardCustomer
};
