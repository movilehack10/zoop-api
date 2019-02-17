var request = require("request");

function newWallet(){
  return newBuyer();
}

function newBuyer(){
  let auth = "Basic " + new Buffer(process.env.PUB_KEY + ": ").toString("base64");
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
        resolve(body);
      }
    });
  });
}

module.exports = {
  newWallet: newWallet
};
