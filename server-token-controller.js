const sqlite3 = require('sqlite3').verbose()
const crypto = require('crypto')

const db = new sqlite3.Database('./data/sqlite.db')

function closeDB() {
  db.close()
}

db.serialize(function () {
  db.run(`CREATE TABLE IF NOT EXISTS tokens (
    id INTEGER PRIMARY KEY,
    tokenValue UNIQUE,
    expire_time,
    limit_money_ammout INTEGER,
    limit_used_times INTEGER)`
  )
  db.run(`CREATE TABLE IF NOT EXISTS wallets (
    id INTEGER PRIMARY KEY,
    tokens,
    zoop_buyer_id,
    saldo_cache
    )`
  )
  db.run(`CREATE TABLE IF NOT EXISTS wallets_tokens (
    id_token,
    id_wallet,
    FOREIGN KEY (id_token) REFERENCES token (id),
    FOREIGN KEY (id_token) REFERENCES token (id)
    )`
  )
})

function createToken(db) {
  return new Promise(
    (resolve, reject) => crypto.randomBytes(128, (err, buffer) => {
      if (err) reject(err)
      tokenId = buffer.toString('hex')
      expire_time = Date.now()
      limit_money_ammout = 1000
      limit_used_times = 5
      console.log()
      console.log({
        tokenId,
        expire_time,
        limit_money_ammout,
        limit_used_times,
      })
      db.run(
        `INSERT INTO tokens (tokenValue, expire_time, limit_money_ammout, limit_used_times)
        VALUES ('${tokenId}', ${expire_time}, ${limit_money_ammout}, ${limit_used_times})`,
        (result, err) => {
          if (err) reject(err)
          resolve(result)
        }
      )
    })
  )
}

function selfTest() {
  createToken(db).catch(e => console.log({'result': e})).then(e => console.log({'result': e}))
}

// module.exports = {
//   newWallet: newWallet
// };
